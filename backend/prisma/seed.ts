import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const db=new PrismaClient();
async function run(){
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
 const password=process.env.ADMIN_PASSWORD;
 if(!email||!password){console.log('No bootstrap admin configured.');return;}
 if(password.length<12)throw Error('Admin password must contain 12 or more characters.');
 if(await db.user.findUnique({where:{email}}))throw Error('Account already exists; bootstrap will not override roles.');
 await db.user.create({data:{email,name:'Store Administrator',passwordHash:await bcrypt.hash(password,12),role:'ADMIN'}});
 console.log('Bootstrap admin created. Clear bootstrap credentials from your local environment.');
}
run().finally(()=>db.$disconnect());
