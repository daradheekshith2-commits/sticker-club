import {useEffect,useState} from 'react';
import {useAuth} from '../../context/AuthContext';

type ProductRecord={id:string;slug:string;name:string;price:string;inventory:{quantity:number}|null;active:boolean};
/** Stock counts are real database records. Never seed imaginary quantities. */
export function AdminInventoryPanel(){
 const {user,request}=useAuth();
 const [products,setProducts]=useState<ProductRecord[]>([]);
 const [draft,setDraft]=useState<Record<string,string>>({});
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const reload=async()=>{
  const p=await request<ProductRecord[]>('/api/admin/products');
  setProducts(p);setDraft(Object.fromEntries(p.map(x=>[x.id,x.inventory?String(x.inventory.quantity):''])));
 };
 useEffect(()=>{if(user?.role!=='ADMIN')return;void reload().catch(e=>setError(String(e))).finally(()=>setLoading(false));},[user?.id]);
 async function save(productId:string){
  setError('');setMessage('');
  const raw=draft[productId];const quantity=Number(raw);
  if(!/^\d+$/.test(raw??'')||!Number.isSafeInteger(quantity)){setError('Enter a whole number for stock.');return;}
  setBusy(productId);
  try{
   await request('/api/admin/inventory/'+encodeURIComponent(productId),{method:'PUT',body:JSON.stringify({quantity})});
   await reload();setMessage('Inventory updated in PostgreSQL.');
  }catch(e){setError(e instanceof Error?e.message:'Could not update inventory');}
  finally{setBusy(null);}
 }
 if(user?.role!=='ADMIN')return null;
 return <section className="mt-6 rounded-2xl bg-white p-6">
  <h2 className="text-2xl font-bold">Inventory management</h2>
  <p className="mt-2 text-sm text-ink-soft">Stock counts are not pre-filled. Confirm real available quantities before allowing any order.</p>
  {loading&&<p className="mt-3">Loading inventory…</p>}
  {error&&<p className="mt-3 text-danger" role="alert">{error}</p>}
  {message&&<p className="mt-3" role="status">{message}</p>}
  <ul className="mt-4 max-h-[36rem] space-y-3 overflow-auto">
   {products.map(p=><li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/15 p-3">
    <div className="min-w-0"><strong className="block">{p.name}</strong><span className="text-xs text-ink-soft">{p.slug} · ₹{p.price} · {p.active?'Active':'Archived'}</span></div>
    <div className="flex items-center gap-2">
     <label className="text-xs font-bold">Stock
      <input aria-label={'Stock for '+p.name} inputMode="numeric" className="field-input mt-1 w-24" value={draft[p.id]??''} placeholder="Unset" onChange={e=>setDraft(d=>({...d,[p.id]:e.target.value}))}/>
     </label>
     <button type="button" className="btn-ghost self-end" disabled={busy===p.id} onClick={()=>void save(p.id)}>{busy===p.id?'Saving…':'Save'}</button>
    </div>
   </li>)}
  </ul>
 </section>;
}
