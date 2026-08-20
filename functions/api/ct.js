import{out,domainOf,fj}from"./_common.js";
export async function onRequestGet({request}){
 const d=domainOf(request);if(!d)return out({error:"Invalid domain"},400);
 try{
  const rows=await fj("https://crt.sh/?q="+encodeURIComponent("%25."+d)+"&output=json",25000);
  const ids=new Set(),names=new Map();let oldest=null,newest=null;
  for(const r of(Array.isArray(rows)?rows:[])){
   if(r.id!=null)ids.add(String(r.id));
   const dt=r.entry_timestamp||r.not_before||null;
   if(dt){if(!oldest||dt<oldest)oldest=dt;if(!newest||dt>newest)newest=dt}
   for(let n of String(r.name_value||r.common_name||"").split("\n")){
    n=n.trim().toLowerCase().replace(/^\*\./,"");
    if(n){const p=names.get(n);if(!p||(dt&&dt>p))names.set(n,dt)}
   }
  }
  return out({
   unique_certificates:ids.size||rows.length,
   unique_names:names.size,
   oldest,newest,
   recent_names:[...names.entries()].sort((a,b)=>String(b[1]||"").localeCompare(String(a[1]||""))).slice(0,30).map(([name,date])=>({name,date}))
  });
 }catch(e){return out({error:"CT lookup failed: "+e.message},502)}
}