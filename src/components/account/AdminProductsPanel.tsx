import {useEffect,useState,type FormEvent} from 'react';
import {useAuth} from '../../context/AuthContext';

type Product={id:string;slug:string;name:string;description:string;price:string;active:boolean};
const empty={id:'',slug:'',name:'',description:'',price:'0.00',active:true};
type Draft=typeof empty;
export function AdminProductsPanel(){
 const {user,request}=useAuth();
 const [items,setItems]=useState<Product[]>([]);
 const [draft,setDraft]=useState<Draft>(empty);
 const [editing,setEditing]=useState<string|null>(null);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function load(){setItems(await request<Product[]>('/api/admin/products'));}
 useEffect(()=>{if(user?.role!=='ADMIN')return;void load().catch(e=>setError(String(e)));},[user?.id]);
 function edit(p?:Product){setDraft(p?{id:p.id,slug:p.slug,name:p.name,description:p.description,price:p.price,active:p.active}:empty);setEditing(p?.id??'new');setError('');}
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');setMessage('');
  try{
   const amount=Number(draft.price);
   if(!Number.isFinite(amount)||amount<0||!/^[0-9]+(\.[0-9]{1,2})?$/.test(draft.price))throw Error('Enter a valid price with up to two decimal places.');
   const payload={...draft,price:amount};
   await request(editing==='new'?'/api/admin/products':'/api/admin/products/'+encodeURIComponent(draft.id),{
    method:editing==='new'?'POST':'PATCH',body:JSON.stringify(payload)
   });
   setEditing(null);await load();setMessage('Product saved to the database. Bundled storefront catalogue remains independent.');
  }catch(e){setError(e instanceof Error?e.message:'Save failed');}finally{setBusy(false);}
 }
 async function archive(id:string){
  if(!window.confirm('Archive this database product? Existing orders will be preserved.'))return;
  setBusy(true);setError('');
  try{await request('/api/admin/products/'+encodeURIComponent(id),{method:'DELETE'});await load();setMessage('Product archived.');}
  catch(e){setError(e instanceof Error?e.message:'Archive failed');}finally{setBusy(false);}
 }
 if(user?.role!=='ADMIN')return null;
 return <section className="mt-6 rounded-2xl bg-white p-6">
  <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-2xl font-bold">Database products</h2><p className="mt-1 text-sm text-ink-soft">Changes affect PostgreSQL and server checkout. The storefront's bundled catalogue is not yet live-synchronized.</p></div>
   {!editing&&<button className="btn-ghost" type="button" onClick={()=>edit()}>Add product</button>}
  </div>
  {error&&<p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
  {message&&<p className="mt-3 text-sm" role="status">{message}</p>}
  {editing&&<form className="mt-4 grid gap-3 rounded-xl border border-ink/20 p-4" onSubmit={submit}>
   {([['id','Product ID'],['slug','URL slug'],['name','Product name'],['description','Description'],['price','Price (₹)']] as const).map(([k,label])=><label key={k} className="text-sm font-bold">{label}
    <input className="field-input mt-1" required maxLength={k==='description'?2000:150} disabled={k==='id'&&editing!=='new'} value={draft[k]} onChange={e=>setDraft(d=>({...d,[k]:e.target.value}))}/>
   </label>)}
   <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={draft.active} onChange={e=>setDraft(d=>({...d,active:e.target.checked}))}/>Available in API catalogue</label>
   <div className="flex gap-2"><button type="submit" disabled={busy} className="btn-primary">{busy?'Saving…':'Save product'}</button><button type="button" className="btn-ghost" onClick={()=>setEditing(null)}>Cancel</button></div>
  </form>}
  <ul className="mt-4 max-h-[28rem] divide-y divide-ink/10 overflow-auto">
   {items.map(p=><li className="flex flex-wrap items-center justify-between gap-3 py-3" key={p.id}>
    <div className="min-w-0"><p className="font-bold">{p.name} <span className="text-xs font-normal text-ink-soft">{p.active?'Active':'Archived'}</span></p><p className="text-sm text-ink-soft">{p.slug} · ₹{p.price}</p></div>
    <div className="flex gap-3 text-sm"><button type="button" className="underline" onClick={()=>edit(p)}>Edit</button>{p.active&&<button type="button" className="underline" disabled={busy} onClick={()=>void archive(p.id)}>Archive</button>}</div>
   </li>)}
  </ul>
 </section>;
}
