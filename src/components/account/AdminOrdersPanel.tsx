import {useEffect,useState} from 'react';
import {useAuth} from '../../context/AuthContext';

type Status='PENDING'|'CONFIRMED'|'PROCESSING'|'SHIPPED'|'COMPLETED'|'CANCELLED';
type Order={id:string;status:Status;paymentStatus:string;total:string;createdAt:string;items:Array<{id:string;nameSnapshot:string;quantity:number;unitPrice:string}>;user:{name:string;email:string}};
const next:Record<Status,Status[]>={
 PENDING:['CONFIRMED','CANCELLED'],CONFIRMED:['PROCESSING','CANCELLED'],
 PROCESSING:['SHIPPED','CANCELLED'],SHIPPED:['COMPLETED'],COMPLETED:[],CANCELLED:[]
};
export function AdminOrdersPanel(){
 const {user,request}=useAuth();
 const [orders,setOrders]=useState<Order[]>([]),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [busy,setBusy]=useState<string|null>(null);
 const [filter,setFilter]=useState('');
 async function load(){setOrders(await request<Order[]>('/api/admin/orders'));}
 useEffect(()=>{if(user?.role!=='ADMIN')return;void load().catch(e=>setError(String(e)));},[user?.id]);
 async function update(id:string,status:Status){
  if(!window.confirm('Change order '+id+' to '+status+'?'))return;
  setBusy(id);setError('');setMessage('');
  try{await request('/api/admin/orders/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({status})});await load();setMessage('Order status updated.');}
  catch(e){setError(e instanceof Error?e.message:'Unable to update status');}finally{setBusy(null);}
 }
 if(user?.role!=='ADMIN')return null;
 const visible=orders.filter(o=>(o.id+' '+o.user.name+' '+o.user.email).toLowerCase().includes(filter.toLowerCase()));
 return <section className="mt-6 rounded-2xl bg-white p-6">
  <h2 className="text-2xl font-bold">Order management</h2>
  <p className="mt-1 text-sm text-ink-soft">Order totals and statuses come from PostgreSQL. Payment confirmation requires a future verified payment integration.</p>
  <label className="mt-4 block text-sm font-bold">Search orders
   <input className="field-input mt-2" type="search" placeholder="Order ID or customer" value={filter} onChange={e=>setFilter(e.target.value)}/>
  </label>
  {error&&<p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
  {message&&<p role="status" className="mt-3 text-sm">{message}</p>}
  {!visible.length&&<p className="mt-4 text-ink-soft">No matching database orders.</p>}
  <ul className="mt-4 max-h-[40rem] space-y-4 overflow-auto">
   {visible.map(order=><li key={order.id} className="rounded-xl border border-ink/15 p-4">
    <div className="flex flex-wrap justify-between gap-2"><div><strong>{order.id}</strong><p className="mt-1 text-sm">{order.user.name} · {order.user.email}</p></div><span className="font-bold">₹{order.total}</span></div>
    <p className="mt-2 text-sm">{new Date(order.createdAt).toLocaleString('en-IN')} · {order.status} · Payment: {order.paymentStatus}</p>
    <details className="mt-2 text-sm"><summary className="cursor-pointer font-bold">Purchased items ({order.items.length})</summary>
     <ul className="mt-2 list-disc pl-5">{order.items.map(i=><li key={i.id}>{i.nameSnapshot} × {i.quantity} · ₹{i.unitPrice} each</li>)}</ul>
    </details>
    {next[order.status].length>0&&<div className="mt-3 flex flex-wrap gap-2">{next[order.status].map(status=><button type="button" key={status} className="btn-ghost" disabled={busy===order.id} onClick={()=>void update(order.id,status)}>{busy===order.id?'Updating…':'Mark '+status.toLowerCase()}</button>)}</div>}
   </li>)}
  </ul>
 </section>;
}
