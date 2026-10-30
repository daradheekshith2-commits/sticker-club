import 'dotenv/config';
import express, {type Request,type Response,type NextFunction} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {rateLimit} from 'express-rate-limit';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {createHash,randomBytes} from 'node:crypto';
import {z} from 'zod';
import swaggerUi from 'swagger-ui-express';
import {openapi} from './openapi.js';
const config=z.object({DATABASE_URL:z.string().min(1),JWT_SECRET:z.string().min(32),FRONTEND_ORIGIN:z.string().url().default('http://localhost:5173'),PORT:z.coerce.number().default(5000),NODE_ENV:z.string().default('development')}).parse(process.env);
const db=new PrismaClient();
const app=express();app.disable('x-powered-by');app.use(helmet());app.use(express.json({limit:'1mb'}));app.use(cookieParser());app.use(cors({origin:config.FRONTEND_ORIGIN,credentials:true}));
const authLimit=rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:'draft-8',legacyHeaders:false});
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const secret=()=>randomBytes(48).toString('base64url');
const cookieOptions={httpOnly:true,secure:config.NODE_ENV==='production',sameSite:'strict' as const,path:'/api/auth'};
type Session={id:string;role:'CUSTOMER'|'ADMIN'};
type Authed=Request & {session?:Session};
const access=(s:Session)=>jwt.sign({sub:s.id,role:s.role},config.JWT_SECRET,{algorithm:'HS256',expiresIn:'15m'});
const safeUser=(u:{id:string;name:string;email:string;role:string;phone?:string|null})=>({id:u.id,name:u.name,email:u.email,role:u.role,phone:u.phone});
const issue=async(res:Response,u:Session)=>{
 const raw=secret();
 await db.refreshToken.create({data:{userId:u.id,tokenHash:hash(raw),expiresAt:new Date(Date.now()+30*86400000)}});
 res.cookie('sc_refresh',raw,{...cookieOptions,maxAge:30*86400000});
 return access(u);
};
const requireAuth=async(req:Authed,res:Response,next:NextFunction)=>{
 const b=req.headers.authorization;
 if(!b?.startsWith('Bearer ')){res.status(401).json({error:'Login required'});return;}
 try{
  const p=jwt.verify(b.slice(7),config.JWT_SECRET,{algorithms:['HS256']});
  if(typeof p==='string'||!p.sub)throw Error('invalid');
  const u=await db.user.findUnique({where:{id:String(p.sub)},select:{id:true,role:true}});
  if(!u){res.status(401).json({error:'Account unavailable'});return;}
  req.session={id:u.id,role:u.role};next();
 }catch{res.status(401).json({error:'Invalid or expired session'});}
};
const admin=(req:Authed,res:Response,next:NextFunction)=>{if(req.session?.role!=='ADMIN'){res.status(403).json({error:'Forbidden'});return;}next();};
const sameOrigin=(req:Request,res:Response,next:NextFunction)=>{
 const origin=req.headers.origin;if(origin!==config.FRONTEND_ORIGIN){res.status(403).json({error:'Invalid origin'});return;}next();
};
const wrap=(fn:(req:Authed,res:Response)=>Promise<void>)=>(req:Authed,res:Response,next:NextFunction)=>Promise.resolve(fn(req,res)).catch(next);
const credentials=z.object({email:z.email().max(254).transform(s=>s.trim().toLowerCase()),password:z.string().min(12).max(128)});
app.get('/api/health',(_req,res)=>res.json({ok:true}));
app.use('/api/docs',swaggerUi.serve,swaggerUi.setup(openapi));
app.post('/api/auth/register',authLimit,wrap(async(req,res)=>{
 const data=credentials.extend({name:z.string().trim().min(1).max(100)}).parse(req.body);
 if(await db.user.findUnique({where:{email:data.email}})){res.status(409).json({error:'Email already registered'});return;}
 const user=await db.user.create({data:{email:data.email,name:data.name,passwordHash:await bcrypt.hash(data.password,12),role:'CUSTOMER'}});
 res.status(201).json({user:safeUser(user),accessToken:await issue(res,{id:user.id,role:user.role})});
}));
app.post('/api/auth/login',authLimit,wrap(async(req,res)=>{
 const data=credentials.parse(req.body);
 const u=await db.user.findUnique({where:{email:data.email}});
 if(!u||!await bcrypt.compare(data.password,u.passwordHash)){res.status(401).json({error:'Invalid email or password'});return;}
 res.json({user:safeUser(u),accessToken:await issue(res,{id:u.id,role:u.role})});
}));
app.post('/api/auth/refresh',authLimit,sameOrigin,wrap(async(req,res)=>{
 const raw=req.cookies?.sc_refresh as string|undefined;
 const token=raw?await db.refreshToken.findUnique({where:{tokenHash:hash(raw)}}):null;
 if(!token||token.revokedAt||token.expiresAt<=new Date()){res.status(401).json({error:'Session expired'});return;}
 const u=await db.user.findUnique({where:{id:token.userId}});
 if(!u){res.status(401).json({error:'Session expired'});return;}
 const changed=await db.refreshToken.updateMany({where:{id:token.id,revokedAt:null},data:{revokedAt:new Date()}});
 if(changed.count!==1){await db.refreshToken.updateMany({where:{userId:u.id,revokedAt:null},data:{revokedAt:new Date()}});res.status(401).json({error:'Session was already used'});return;}
 res.json({user:safeUser(u),accessToken:await issue(res,{id:u.id,role:u.role})});
}));
app.post('/api/auth/logout',sameOrigin,wrap(async(req,res)=>{
 const raw=req.cookies?.sc_refresh as string|undefined;
 if(raw)await db.refreshToken.updateMany({where:{tokenHash:hash(raw)},data:{revokedAt:new Date()}});
 res.clearCookie('sc_refresh',cookieOptions);res.json({ok:true});
}));
app.post('/api/auth/forgot-password',authLimit,sameOrigin,wrap(async(req,res)=>{
 const {email}=z.object({email:z.email().transform(s=>s.toLowerCase())}).parse(req.body);
 const u=await db.user.findUnique({where:{email}});
 if(u&&config.NODE_ENV==='development'){
  const raw=secret();await db.passwordResetToken.create({data:{userId:u.id,tokenHash:hash(raw),expiresAt:new Date(Date.now()+15*60000)}});
  console.log('LOCAL DEVELOPMENT password-reset token for',email,raw);
 }
 res.json({message:'If the account exists, reset instructions will be sent. Local development tokens appear only in backend terminal.'});
}));
app.post('/api/auth/reset-password',authLimit,sameOrigin,wrap(async(req,res)=>{
 const {token,password}=z.object({token:z.string().min(20),password:z.string().min(12).max(128)}).parse(req.body);
 const rec=await db.passwordResetToken.findUnique({where:{tokenHash:hash(token)}});
 if(!rec||rec.usedAt||rec.expiresAt<=new Date()){res.status(400).json({error:'Invalid or expired reset token'});return;}
 const passwordHash=await bcrypt.hash(password,12);
 const completed=await db.$transaction(async(tx)=>{
  const changed=await tx.passwordResetToken.updateMany({where:{id:rec.id,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}});
  if(changed.count!==1)return false;
  await tx.user.update({where:{id:rec.userId},data:{passwordHash}});
  await tx.refreshToken.updateMany({where:{userId:rec.userId,revokedAt:null},data:{revokedAt:new Date()}});
  return true;
 });
 if(!completed){res.status(400).json({error:'Reset token already used or expired'});return;}
 res.json({ok:true});
}));
app.get('/api/me',requireAuth,wrap(async(req,res)=>{const u=await db.user.findUnique({where:{id:req.session!.id}});if(!u){res.status(404).json({error:'Not found'});return;}res.json(safeUser(u));}));
app.patch('/api/me',requireAuth,wrap(async(req,res)=>{
 const data=z.object({name:z.string().trim().min(1).max(100).optional(),phone:z.string().max(30).nullable().optional()}).parse(req.body);
 res.json(safeUser(await db.user.update({where:{id:req.session!.id},data})));
}));
app.get('/api/me/addresses',requireAuth,wrap(async(req,res)=>{res.json(await db.address.findMany({where:{userId:req.session!.id}}));}));
const addressInput=z.object({recipient:z.string().min(1).max(100),line1:z.string().min(1).max(250),line2:z.string().max(250).optional(),city:z.string().min(1),state:z.string().min(1),postalCode:z.string().min(3).max(15),isDefault:z.boolean().default(false)});
app.post('/api/me/addresses',requireAuth,wrap(async(req,res)=>{
 const data=addressInput.parse(req.body);
 const a=await db.$transaction(async(tx)=>{if(data.isDefault)await tx.address.updateMany({where:{userId:req.session!.id},data:{isDefault:false}});return tx.address.create({data:{...data,userId:req.session!.id}});});
 res.status(201).json(a);
}));
app.patch('/api/me/addresses/:id',requireAuth,wrap(async(req,res)=>{
 const data=addressInput.partial().parse(req.body);
 if(Object.keys(data).length===0){res.status(400).json({error:'Provide at least one address field'});return;}
 const existing=await db.address.findFirst({where:{id:String(req.params.id),userId:req.session!.id}});
 if(!existing){res.status(404).json({error:'Not found'});return;}
 const updated=await db.$transaction(async(tx)=>{
  if(data.isDefault)await tx.address.updateMany({where:{userId:req.session!.id},data:{isDefault:false}});
  return tx.address.update({where:{id:existing.id},data});
 });
 res.json(updated);
}));
app.post('/api/me/addresses/:id/default',requireAuth,wrap(async(req,res)=>{
 const result=await db.$transaction(async(tx)=>{
  const owned=await tx.address.findFirst({where:{id:String(req.params.id),userId:req.session!.id},select:{id:true}});
  if(!owned)return false;
  await tx.address.updateMany({where:{userId:req.session!.id},data:{isDefault:false}});
  await tx.address.update({where:{id:owned.id},data:{isDefault:true}});
  return true;
 });
 if(!result){res.status(404).json({error:'Not found'});return;}
 res.json({ok:true});
}));
app.delete('/api/me/addresses/:id',requireAuth,wrap(async(req,res)=>{
 const result=await db.address.deleteMany({where:{id:String(req.params.id),userId:req.session!.id}});
 if(!result.count){res.status(404).json({error:'Not found'});return;}res.json({ok:true});
}));
const cartItemInput=z.object({productId:z.string().min(1),quantity:z.number().int().min(1).max(99)});
const getCart=async(userId:string)=>db.cart.upsert({where:{userId},create:{userId},update:{},include:{items:{include:{product:{include:{images:true,inventory:true,categories:true}}}}}});
app.get('/api/cart',requireAuth,wrap(async(req,res)=>{res.json(await getCart(req.session!.id));}));
app.post('/api/cart/items',requireAuth,wrap(async(req,res)=>{
 const {productId,quantity}=cartItemInput.parse(req.body);
 const product=await db.product.findFirst({where:{id:productId,active:true},include:{inventory:true}});
 if(!product){res.status(404).json({error:'Product unavailable'});return;}
 if(!product.inventory){res.status(409).json({error:'Stock has not been configured for this product'});return;}
 if(product.inventory.quantity<quantity){res.status(409).json({error:'Not enough stock',available:product.inventory.quantity});return;}
 const cart=await db.cart.upsert({where:{userId:req.session!.id},create:{userId:req.session!.id},update:{}});
 const item=await db.cartItem.upsert({where:{cartId_productId:{cartId:cart.id,productId}},create:{cartId:cart.id,productId,quantity},update:{quantity:{increment:quantity}}});
 res.status(201).json(item);
}));
app.patch('/api/cart/items/:id',requireAuth,wrap(async(req,res)=>{
 const {quantity}=z.object({quantity:z.number().int().min(1).max(99)}).parse(req.body);
 const cart=await db.cart.findUnique({where:{userId:req.session!.id}});
 if(!cart){res.status(404).json({error:'Cart not found'});return;}
 const item=await db.cartItem.findFirst({where:{id:String(req.params.id),cartId:cart.id},include:{product:{include:{inventory:true}}}});
 if(!item){res.status(404).json({error:'Cart item not found'});return;}
 if(!item.product.inventory){res.status(409).json({error:'Stock is not configured for this product'});return;}
 if(item.product.inventory.quantity<quantity){res.status(409).json({error:'Not enough stock',available:item.product.inventory.quantity});return;}
 res.json(await db.cartItem.update({where:{id:item.id},data:{quantity}}));
}));
app.delete('/api/cart/items/:id',requireAuth,wrap(async(req,res)=>{
 const cart=await db.cart.findUnique({where:{userId:req.session!.id}});
 if(!cart){res.status(404).json({error:'Cart not found'});return;}
 const result=await db.cartItem.deleteMany({where:{id:String(req.params.id),cartId:cart.id}});
 if(!result.count){res.status(404).json({error:'Cart item not found'});return;}
 res.json({ok:true});
}));
app.delete('/api/cart',requireAuth,wrap(async(req,res)=>{
 const cart=await db.cart.findUnique({where:{userId:req.session!.id}});
 if(cart)await db.cartItem.deleteMany({where:{cartId:cart.id}});
 res.json({ok:true});
}));
// Preview-only catalogue variants must not be charged at the base product price.
// A real order can contain only products whose storefront price is unambiguous.
app.get('/api/checkout/availability',requireAuth,wrap(async(req,res)=>{
 const cart=await getCart(req.session!.id);
 res.json({items:cart.items.map(item=>({
  id:item.id,productId:item.productId,quantity:item.quantity,
  name:item.product.name,price:item.product.price.toString(),
  active:item.product.active,available:item.product.inventory?.quantity??null
 }))});
}));
app.post('/api/orders',requireAuth,wrap(async(req,res)=>{
 const {addressId}=z.object({addressId:z.string().min(1)}).parse(req.body);
 const userId=req.session!.id;
 const order=await db.$transaction(async(tx)=>{
  const address=await tx.address.findFirst({where:{id:addressId,userId}});
  if(!address)throw Object.assign(new Error('Shipping address not found'),{status:404});
  const cart=await tx.cart.findUnique({where:{userId},include:{items:{include:{product:{include:{inventory:true}}}}}});
  if(!cart||cart.items.length===0)throw Object.assign(new Error('Your cart is empty'),{status:400});
  let total=0;
  const lines=cart.items.map(item=>{
   if(!item.product.active)throw Object.assign(new Error(item.product.name+' is unavailable'),{status:409});
   if(!item.product.inventory)throw Object.assign(new Error('Inventory not configured for '+item.product.name),{status:409});
   const price=Number(item.product.price);
   total+=price*item.quantity;
   return {productId:item.productId,nameSnapshot:item.product.name,unitPrice:price.toFixed(2),quantity:item.quantity,inventory:item.product.inventory};
  });
  for(const line of lines){
   if(line.inventory){
    const changed=await tx.inventory.updateMany({where:{productId:line.productId,quantity:{gte:line.quantity}},data:{quantity:{decrement:line.quantity}}});
    if(changed.count!==1)throw Object.assign(new Error('Insufficient stock for '+line.nameSnapshot),{status:409});
   }
  }
  const created=await tx.order.create({data:{userId,total:total.toFixed(2),shippingAddress:{recipient:address.recipient,line1:address.line1,line2:address.line2,city:address.city,state:address.state,postalCode:address.postalCode},items:{create:lines.map(({productId,nameSnapshot,unitPrice,quantity})=>({productId,nameSnapshot,unitPrice,quantity}))}},include:{items:true}});
  await tx.cartItem.deleteMany({where:{cartId:cart.id}});
  return created;
 },{isolationLevel:'Serializable'});
 res.status(201).json(order);
}));
app.get('/api/me/orders',requireAuth,wrap(async(req,res)=>{res.json(await db.order.findMany({where:{userId:req.session!.id},include:{items:true,customOrders:true},orderBy:{createdAt:'desc'}}));}));
app.get('/api/products',wrap(async(_req,res)=>{res.json(await db.product.findMany({where:{active:true},include:{images:true,inventory:true,categories:true}}));}));
app.get('/api/admin/stats',requireAuth,admin,wrap(async(_req,res)=>{
 const [customers,products,orders,pending,rev]=await Promise.all([db.user.count({where:{role:'CUSTOMER'}}),db.product.count(),db.order.count(),db.order.count({where:{status:'PENDING'}}),db.order.aggregate({_sum:{total:true},where:{status:{not:'CANCELLED'}}})]);
 res.json({customers,products,orders,pendingOrders:pending,totalRevenue:rev._sum.total?.toString()??'0'});
}));
app.get('/api/admin/customers',requireAuth,admin,wrap(async(_req,res)=>{res.json(await db.user.findMany({where:{role:'CUSTOMER'},select:{id:true,name:true,email:true,phone:true,createdAt:true,_count:{select:{orders:true}}}}));}));
app.get('/api/admin/products',requireAuth,admin,wrap(async(_req,res)=>{res.json(await db.product.findMany({include:{inventory:true}}));}));
const productInput=z.object({id:z.string().min(1),slug:z.string().regex(/^[a-z0-9-]+$/),name:z.string().min(1),description:z.string(),price:z.coerce.number().nonnegative(),active:z.boolean().default(true)});
app.post('/api/admin/products',requireAuth,admin,wrap(async(req,res)=>{
 const p=productInput.parse(req.body);res.status(201).json(await db.product.create({data:{...p,price:p.price.toFixed(2)}}));
}));
app.patch('/api/admin/products/:id',requireAuth,admin,wrap(async(req,res)=>{
 const data=productInput.omit({id:true}).partial().parse(req.body);
 res.json(await db.product.update({where:{id:String(req.params.id)},data:{...data,price:data.price===undefined?undefined:data.price.toFixed(2)}}));
}));
app.delete('/api/admin/products/:id',requireAuth,admin,wrap(async(req,res)=>{res.json(await db.product.update({where:{id:String(req.params.id)},data:{active:false}}));}));
app.put('/api/admin/inventory/:productId',requireAuth,admin,wrap(async(req,res)=>{
 const {quantity}=z.object({quantity:z.number().int().min(0).max(1000000)}).parse(req.body);
 const productId=String(req.params.productId);
 const exists=await db.product.findUnique({where:{id:productId},select:{id:true}});
 if(!exists){res.status(404).json({error:'Product not found'});return;}
 const saved=await db.inventory.upsert({where:{productId},create:{productId,quantity},update:{quantity}});
 res.json(saved);
}));
app.get('/api/admin/orders',requireAuth,admin,wrap(async(_req,res)=>{res.json(await db.order.findMany({include:{items:true,user:{select:{id:true,name:true,email:true}}},orderBy:{createdAt:'desc'}}));}));
app.patch('/api/admin/orders/:id',requireAuth,admin,wrap(async(req,res)=>{
 const {status}=z.object({status:z.enum(['PENDING','CONFIRMED','PROCESSING','SHIPPED','COMPLETED','CANCELLED'])}).parse(req.body);
 res.json(await db.order.update({where:{id:String(req.params.id)},data:{status}}));
}));
app.use((err:unknown,_req:Request,res:Response,_next:NextFunction)=>{
 if(err instanceof z.ZodError){res.status(400).json({error:'Invalid input',issues:err.issues});return;}
 const status=typeof err==='object'&&err!==null&&'status' in err&&typeof (err as {status?:unknown}).status==='number'?(err as {status:number}).status:500;
 if(status>=500)console.error(err);res.status(status).json({error:status>=500?'Server error':err instanceof Error?err.message:'Request failed'});
});
app.listen(config.PORT,()=>console.log('Sticker Club local API on port',config.PORT));
