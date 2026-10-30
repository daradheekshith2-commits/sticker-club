import {useEffect,useState,type FormEvent} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useCart} from '../../context/CartContext';
import {Link} from '../../router/router';
import type {ProductCartLine} from '../../utils/cart';

type Address={id:string;recipient:string;line1:string;city:string;state:string;postalCode:string;isDefault:boolean};
type ServerCart={items:Array<{productId:string;quantity:number;product:{name:string;price:string;active:boolean;inventory:{quantity:number}|null}}>} ;
type Order={id:string;total:string;paymentStatus:string;status:string};

/** Database checkout for unconfigured catalogue items only.
 * Variant prices, uploads and custom bundles are intentionally excluded until
 * the database has matching server-side pricing models.
 */
export function LiveOrderCheckout(){
 const {user,request}=useAuth();
 const {lines,clearCart}=useCart();
 const [addresses,setAddresses]=useState<Address[]>([]);
 const [selected,setSelected]=useState('');
 const [newAddress,setNewAddress]=useState({recipient:'',line1:'',city:'Hyderabad',state:'Telangana',postalCode:''});
 const [saving,setSaving]=useState(false);
 const [working,setWorking]=useState(false);
 const [error,setError]=useState('');
 const [order,setOrder]=useState<Order|null>(null);
 const [preview,setPreview]=useState<ServerCart|null>(null);
 const standard=lines.filter((l):l is ProductCartLine=>l.type==='product'&&!l.variant);
 const unsupported=lines.filter(l=>l.type!=='product'||Boolean(l.variant));
 useEffect(()=>{
  if(!user)return;
  void request<Address[]>('/api/me/addresses').then(a=>{setAddresses(a);setSelected(a.find(x=>x.isDefault)?.id??a[0]?.id??'');}).catch(e=>setError(String(e)));
 },[user?.id]);
 async function addAddress(event:FormEvent){
  event.preventDefault();setSaving(true);setError('');
  try{
   const saved=await request<Address>('/api/me/addresses',{method:'POST',body:JSON.stringify({...newAddress,isDefault:!addresses.length})});
   setAddresses(a=>[...a,saved]);setSelected(saved.id);
   setNewAddress({recipient:'',line1:'',city:'Hyderabad',state:'Telangana',postalCode:''});
  }catch(e){setError(e instanceof Error?e.message:'Could not save address');}finally{setSaving(false);}
 }
 async function prepare(){
  if(!user||!standard.length||unsupported.length)return;
  setWorking(true);setError('');setPreview(null);
  try{
   // Rebuild the authenticated server cart from the current local cart.
   // This prevents stale quantities being ordered on repeated reviews.
   await request('/api/cart',{method:'DELETE'});
   for(const line of standard){
    await request('/api/cart/items',{method:'POST',body:JSON.stringify({productId:line.product.id,quantity:line.quantity})});
   }
   const data=await request<ServerCart>('/api/cart');
   if(data.items.length!==standard.length)throw Error('The server cart did not match your order. No order has been placed.');
   setPreview(data);
  }catch(e){setError(e instanceof Error?e.message:'Could not review your order');}finally{setWorking(false);}
 }
 async function place(){
  if(!selected||!preview||working)return;
  setWorking(true);setError('');
  try{
   const placed=await request<Order>('/api/orders',{method:'POST',body:JSON.stringify({addressId:selected})});
   setOrder(placed);clearCart();setPreview(null);
  }catch(e){setError(e instanceof Error?e.message:'Could not create order');setPreview(null);}finally{setWorking(false);}
 }
 if(!user)return <section className="rounded-2xl border border-ink/20 bg-white p-6">
  <h2 className="text-2xl font-extrabold">Database-backed order</h2>
  <p className="mt-2 text-sm text-ink-soft">Sign in to review catalogue items against the database and create an unpaid order.</p>
  <Link className="btn-primary mt-4" to="/login">Sign in</Link>
 </section>;
 if(order)return <section className="rounded-2xl border border-ink/20 bg-white p-6" role="status">
  <h2 className="text-2xl font-extrabold">Order saved</h2>
  <p className="mt-2">Reference: <strong>{order.id}</strong></p>
  <p className="mt-2">Server total: <strong>₹{order.total}</strong></p>
  <p className="mt-2">Status: {order.status} · Payment: {order.paymentStatus}</p>
  <p className="mt-3 text-sm font-bold">No payment has been collected. This is a database order record, not a paid purchase.</p>
  <Link to="/account" className="btn-primary mt-4">View account orders</Link>
 </section>;
 return <section className="rounded-2xl border border-ink/20 bg-white p-6">
  <h2 className="text-2xl font-extrabold">Order using your account</h2>
  <p className="mt-2 text-sm text-ink-soft">Only standard products without variant or customization options are supported. Prices are recalculated by the backend. No online payment is collected.</p>
  {unsupported.length>0&&<p className="mt-3 rounded-lg border border-ink/20 p-3 text-sm" role="status">{unsupported.length} customized or size-specific line(s) cannot be submitted as an order yet. Remove these from the cart to enable database checkout; the preview below remains available.</p>}
  {standard.length===0&&<p className="mt-3 text-sm">There are no eligible standard products in this cart.</p>}
  <label className="mt-5 block text-sm font-bold">Shipping address
   <select className="field-input mt-2" value={selected} onChange={e=>{setSelected(e.target.value);setPreview(null);}}>
    <option value="">Select a saved address</option>
    {addresses.map(a=><option key={a.id} value={a.id}>{a.recipient} — {a.line1}, {a.city} {a.postalCode}</option>)}
   </select>
  </label>
  <details className="mt-4 rounded-xl border border-ink/20 p-4">
   <summary className="cursor-pointer font-bold">Add a delivery address</summary>
   <form className="mt-3 grid gap-3" onSubmit={addAddress}>
    <input className="field-input" aria-label="Recipient" placeholder="Recipient name" required maxLength={100} value={newAddress.recipient} onChange={e=>setNewAddress(a=>({...a,recipient:e.target.value}))}/>
    <input className="field-input" aria-label="Address line" placeholder="Building, street and area" required maxLength={250} value={newAddress.line1} onChange={e=>setNewAddress(a=>({...a,line1:e.target.value}))}/>
    <div className="grid grid-cols-2 gap-2">
     <input className="field-input" aria-label="City" placeholder="City" required value={newAddress.city} onChange={e=>setNewAddress(a=>({...a,city:e.target.value}))}/>
     <input className="field-input" aria-label="State" placeholder="State" required value={newAddress.state} onChange={e=>setNewAddress(a=>({...a,state:e.target.value}))}/>
    </div>
    <input className="field-input" aria-label="Postal code" placeholder="PIN code" required minLength={3} maxLength={15} value={newAddress.postalCode} onChange={e=>setNewAddress(a=>({...a,postalCode:e.target.value}))}/>
    <button className="btn-ghost" type="submit" disabled={saving}>{saving?'Saving…':'Save address'}</button>
   </form>
  </details>
  {error&&<p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>}
  {!preview?<button type="button" className="btn-primary mt-5 w-full" onClick={()=>void prepare()} disabled={working||!selected||unsupported.length>0||standard.length===0}>{working?'Checking database…':'Review server prices and availability'}</button>:
   <div className="mt-5 rounded-xl border-2 border-ink/20 p-4">
    <h3 className="text-xl font-bold">Server-side price review</h3>
    {preview.items.map(item=><div key={item.productId} className="mt-2 flex justify-between gap-3 text-sm"><span>{item.product.name} × {item.quantity}</span><strong>₹{(Number(item.product.price)*item.quantity).toFixed(2)}</strong></div>)}
    <div className="mt-3 flex justify-between border-t pt-3 font-extrabold"><span>Server subtotal</span><span>₹{preview.items.reduce((total,item)=>total+Number(item.product.price)*item.quantity,0).toFixed(2)}</span></div>
    <p className="mt-2 text-xs text-ink-soft">This order will be stored with payment pending. Charges and taxes are not collected here.</p>
    <button type="button" className="btn-primary mt-4 w-full" onClick={()=>void place()} disabled={working||!selected}>{working?'Creating order…':'Create unpaid order'}</button>
    <button type="button" className="btn-ghost mt-2 w-full" onClick={()=>setPreview(null)}>Change cart or address</button>
   </div>}
 </section>;
}
