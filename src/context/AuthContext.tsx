import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
export type Account={id:string;name:string;email:string;role:'CUSTOMER'|'ADMIN';phone?:string|null};
const API=(import.meta.env.VITE_API_URL as string|undefined)??'http://localhost:5000';
type AuthValue={user:Account|null;ready:boolean;login:(email:string,password:string)=>Promise<Account>;register:(name:string,email:string,password:string)=>Promise<Account>;logout:()=>Promise<void>;request:<T>(path:string,options?:RequestInit)=>Promise<T>;refresh:()=>Promise<void>};
const Context=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<Account|null>(null),[token,setToken]=useState<string|null>(null),[ready,setReady]=useState(false);
 const refresh=useCallback(async()=>{
  const r=await fetch(API+'/api/auth/refresh',{method:'POST',credentials:'include'});
  if(!r.ok){setToken(null);setUser(null);throw Error('Not signed in');}
  const data=await r.json() as {user:Account;accessToken:string};setToken(data.accessToken);setUser(data.user);
 },[]);
 useEffect(()=>{void refresh().catch(()=>{}).finally(()=>setReady(true));},[refresh]);
 const authenticate=async(path:string,body:unknown):Promise<Account>=>{
  const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(body)});
  const data=await r.json();if(!r.ok)throw Error(data.error||'Authentication failed');
  setToken(data.accessToken);setUser(data.user);return data.user as Account;
 };
 const login=(email:string,password:string)=>authenticate('/api/auth/login',{email,password});
 const register=(name:string,email:string,password:string)=>authenticate('/api/auth/register',{name,email,password});
 const logout=async()=>{await fetch(API+'/api/auth/logout',{method:'POST',credentials:'include'}).catch(()=>{});setUser(null);setToken(null);};
 const request=async<T,>(path:string,options:RequestInit={}):Promise<T>=>{
  let current=token;
  if(!current){await refresh();throw Error('Session renewed. Please retry your action.');}
  const send=(t:string)=>fetch(API+path,{...options,credentials:'include',headers:{'Content-Type':'application/json',...(options.headers||{}),Authorization:'Bearer '+t}});
  let r=await send(current);
  if(r.status===401){try{const x=await fetch(API+'/api/auth/refresh',{method:'POST',credentials:'include'});if(!x.ok)throw Error('Session expired');const data=await x.json();setToken(data.accessToken);setUser(data.user);current=data.accessToken;r=await send(current);}catch{setUser(null);setToken(null);throw Error('Please sign in again');}}
  if(!r.ok){const d=await r.json().catch(()=>({}));throw Error(d.error||'Request failed');}
  return r.json() as Promise<T>;
 };
 const value=useMemo(()=>({user,ready,login,register,logout,request,refresh}),[user,ready,token,refresh]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw Error('AuthProvider missing');return value;}
export const apiUrl=API;
