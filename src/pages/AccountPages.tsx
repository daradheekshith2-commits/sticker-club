import {AccountSettingsPanel} from '../components/account/AccountSettingsPanel';
import {AdminOrdersPanel} from '../components/account/AdminOrdersPanel';
import {AdminProductsPanel} from '../components/account/AdminProductsPanel';
import {AddressManager} from '../components/account/AddressManager';
import {AdminInventoryPanel} from '../components/account/AdminInventoryPanel';
import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {useAuth,apiUrl,type Account} from '../context/AuthContext';
import {Link,useNavigate,useSearchParams} from '../router/router';
import {usePageMeta} from '../hooks/usePageMeta';
type Mode='login'|'register'|'forgot'|'reset'|'admin';
const styles='w-full rounded-xl border border-ink/25 bg-white px-4 py-3 text-ink';
function Shell({title,children}:{title:string;children:ReactNode}){return <main className="mx-auto max-w-lg px-4 py-16 sm:px-6"><div className="rounded-3xl border border-ink/20 bg-white p-6 shadow-xl sm:p-9"><h1 className="font-display text-4xl font-extrabold">{title}</h1><div className="mt-7">{children}</div></div></main>;}
export function AuthPage({mode}:{mode:Mode}){
 const {login,register}=useAuth(),navigate=useNavigate();
 const [params]=useSearchParams();const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 usePageMeta(mode==='register'?'Create account':mode==='admin'?'Admin sign in':'Account access');
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');setMessage('');
  try{
   if(mode==='register'){if(password!==confirm)throw Error('Passwords do not match');const u=await register(name,email,password);navigate(u.role==='ADMIN'?'/admin':'/account');}
   else if(mode==='login'||mode==='admin'){const u=await login(email,password);if(mode==='admin'&&u.role!=='ADMIN')throw Error('Administrator access required');navigate(u.role==='ADMIN'?'/admin':'/account');}
   else{
    if(!apiUrl)throw Error('Authentication backend is not configured.');
    const r=await fetch(apiUrl+(mode==='forgot'?'/api/auth/forgot-password':'/api/auth/reset-password'),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(mode==='forgot'?{email}:{token:params.get('token')??'',password})});
    const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');setMessage(mode==='forgot'?d.message:'Password reset. You can now sign in.');
   }
  }catch(e){setError(e instanceof Error?e.message:'Something went wrong');}finally{setBusy(false);}
 }
 const title={login:'Welcome back.',register:'Join the club.',forgot:'Reset your password.',reset:'Choose a new password.',admin:'Sticker Club admin.'}[mode];
 return <Shell title={title}><form onSubmit={submit} className="space-y-4">
  {mode==='register'&&<label className="block text-sm font-bold">Full name<input className={'mt-2 '+styles} required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label>}
  {mode!=='reset'&&<label className="block text-sm font-bold">Email<input className={'mt-2 '+styles} required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>}
  {mode!=='forgot'&&<label className="block text-sm font-bold">{mode==='reset'?'New password':'Password'}<input className={'mt-2 '+styles} required type="password" minLength={12} autoComplete={mode==='login'||mode==='admin'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>}
  {mode==='register'&&<label className="block text-sm font-bold">Confirm password<input className={'mt-2 '+styles} required type="password" minLength={12} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}
  {error&&<p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
  {message&&<p role="status" className="rounded-lg bg-mint/10 p-3 text-sm">{message}</p>}
  <button className="btn-primary w-full" disabled={busy} type="submit">{busy?'Working…':mode==='register'?'Create account':mode==='forgot'?'Request reset':mode==='reset'?'Reset password':'Sign in'}</button>
 </form><div className="mt-6 flex flex-wrap gap-4 text-sm">
 {mode!=='login'&&<Link className="underline" to="/login">Customer login</Link>}
 {mode!=='register'&&<Link className="underline" to="/register">Register</Link>}
 {mode!=='forgot'&&<Link className="underline" to="/forgot-password">Forgot password?</Link>}
 </div></Shell>;
}
function Guard({role,children}:{role:'ADMIN'|'CUSTOMER';children:(u:Account)=>ReactNode}){const {user,ready}=useAuth();if(!ready)return <Shell title="Loading account…"><p>Checking your session.</p></Shell>;if(!user)return <Shell title="Sign in required"><Link className="btn-accent" to={role==='ADMIN'?'/admin/login':'/login'}>Sign in</Link></Shell>;if(role==='ADMIN'&&user.role!=='ADMIN')return <Shell title="Access denied"><p>Administrator permissions are required.</p></Shell>;return <>{children(user)}</>;}
export function CustomerDashboard(){
 usePageMeta('My account');const {request,logout}=useAuth(),navigate=useNavigate();
 const [orders,setOrders]=useState<Array<{id:string;status:string;total:string;createdAt:string}>>([]),[addresses,setAddresses]=useState<Array<{id:string;line1:string;city:string;postalCode:string}>>([]),[error,setError]=useState('');
 const {user}=useAuth();
 useEffect(()=>{if(!user)return;void Promise.all([request<typeof orders>('/api/me/orders'),request<typeof addresses>('/api/me/addresses')]).then(([o,a])=>{setOrders(o);setAddresses(a);}).catch(e=>setError(String(e)));},[user?.id]);
 return <Guard role="CUSTOMER">{u=><main className="mx-auto max-w-5xl px-4 py-16"><h1 className="font-display text-5xl font-extrabold">Your account.</h1><p className="mt-3 text-ink-soft">{u.name} · {u.email}</p>{error&&<p role="alert">{error}</p>}<div className="mt-10 grid gap-5 md:grid-cols-2"><section className="rounded-2xl bg-white p-6"><h2 className="text-2xl font-bold">My orders</h2>{orders.length?orders.map(o=><p className="mt-3" key={o.id}>{o.id} · {o.status} · ₹{o.total}</p>):<p className="mt-4 text-ink-soft">No orders yet.</p>}</section><AddressManager /><section className="rounded-2xl bg-white p-6"><h2 className="text-2xl font-bold">Custom orders</h2><p className="mt-4 text-ink-soft">Custom designs appear here after a real order is placed.</p></section><AccountSettingsPanel /></div></main>}</Guard>;
}
export function AdminDashboard(){
 usePageMeta('Store admin');const {request,logout}=useAuth(),navigate=useNavigate(),[stats,setStats]=useState<Record<string,string|number>|null>(null),[orders,setOrders]=useState<Array<{id:string;status:string}>>([]),[products,setProducts]=useState<Array<{id:string;name:string;price:string}>>([]),[error,setError]=useState('');
 const {user}=useAuth();
 useEffect(()=>{if(user?.role!=='ADMIN')return;void Promise.all([request<Record<string,string|number>>('/api/admin/stats'),request<typeof orders>('/api/admin/orders'),request<typeof products>('/api/admin/products')]).then(([s,o,p])=>{setStats(s);setOrders(o);setProducts(p);}).catch(e=>setError(String(e)));},[user?.id]);
 return <Guard role="ADMIN">{u=><main className="mx-auto max-w-6xl px-4 py-16"><h1 className="font-display text-5xl font-extrabold">Store dashboard.</h1><p className="mt-3 text-ink-soft">Signed in as {u.email}</p>{error&&<p role="alert">{error}</p>}<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{Object.entries(stats??{}).map(([k,v])=><div className="rounded-2xl bg-white p-5" key={k}><p className="text-xs uppercase text-ink-soft">{k}</p><p className="mt-3 font-display text-3xl font-bold">{v}</p></div>)}</div><section className="mt-8 rounded-2xl bg-white p-6"><h2 className="text-2xl font-bold">Orders ({orders.length})</h2>{orders.length?orders.map(o=><p className="mt-2" key={o.id}>{o.id} · {o.status}</p>):<p className="mt-3 text-ink-soft">No orders in the database.</p>}</section><section className="mt-5 rounded-2xl bg-white p-6"><h2 className="text-2xl font-bold">Products ({products.length})</h2>{products.length?products.map(p=><p className="mt-2" key={p.id}>{p.name} · ₹{p.price}</p>):<p className="mt-3 text-ink-soft">No backend catalogue products yet.</p>}</section><AdminOrdersPanel /><AdminProductsPanel /><AdminInventoryPanel /><button className="btn-ghost mt-7" onClick={()=>void logout().then(()=>navigate('/'))}>Log out</button></main>}</Guard>;
}
