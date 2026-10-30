import {useEffect,useState} from 'react';
import {useAuth} from '../../context/AuthContext';
type OrderItem={id:string;nameSnapshot:string;quantity:number;unitPrice:string;variantLabel?:string|null};
type Order={id:string;status:string;paymentStatus:string;total:string;createdAt:string;items:OrderItem[]};
export function CustomerOrdersPanel(){
 const {user,request}=useAuth(),[orders,setOrders]=useState<Order[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{if(!user)return;void request<Order[]>('/api/me/orders').then(setOrders).catch(e=>setError(String(e))).finally(()=>setLoading(false));},[user?.id]);
 if(!user)return null;
 return <section className="rounded-2xl bg-white p-6">
  <h2 className="text-2xl font-bold">My orders</h2>
  {loading&&<p className="mt-3 text-sm text-ink-soft">Loading orders…</p>}
  {error&&<p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
  {!loading&&!error&&!orders.length&&<p className="mt-3 text-ink-soft">No database orders yet.</p>}
  <ul className="mt-4 space-y-4">
   {orders.map(o=><li className="rounded-xl border border-ink/15 p-4" key={o.id}>
    <div className="flex flex-wrap justify-between gap-2"><div><p className="font-bold">{o.id}</p><p className="mt-1 text-xs text-ink-soft">{new Date(o.createdAt).toLocaleString('en-IN')}</p></div><strong>₹{o.total}</strong></div>
    <p className="mt-2 text-sm">Order: {o.status} · Payment: {o.paymentStatus}</p>
    {o.paymentStatus!=='PAID'&&<p className="mt-1 text-xs text-ink-soft">Payment has not been confirmed.</p>}
    <details className="mt-3"><summary className="cursor-pointer text-sm font-bold">View purchased items</summary>
     <ul className="mt-2 divide-y divide-ink/10">
      {o.items.map(i=><li key={i.id} className="flex justify-between gap-3 py-2 text-sm">
       <span>{i.nameSnapshot}{i.variantLabel?' · '+i.variantLabel:''} × {i.quantity}</span>
       <strong>₹{(Number(i.unitPrice)*i.quantity).toFixed(2)}</strong>
      </li>)}
     </ul>
    </details>
   </li>)}
  </ul>
 </section>;
}
