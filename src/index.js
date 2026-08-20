function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function getDomain(request){const d=(new URL(request.url).searchParams.get("domain")||"").trim().toLowerCase();return d&&d.includes(".")&&!/[\/@ :]/.test(d)?d:null}
async function fj(url,ms=25000){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{headers:{"accept":"application/json","user-agent":"DomainBackstory/3.0"},signal:c.signal});if(!r.ok)throw new Error("Provider HTTP "+r.status);return await r.json()}finally{clearTimeout(t)}}

async function rdap(domain){
 const x=await fj("https://rdap.org/domain/"+encodeURIComponent(domain),18000);
 const ev={};for(const e of(x.events||[]))if(e.eventAction&&e.eventDate)ev[e.eventAction]=e.eventDate;
 let registrar=null,iana=null;
 for(const en of(x.entities||[])){if(!(en.roles||[]).includes("registrar"))continue;for(const i of(en.vcardArray?.[1]||[]))if(i[0]==="fn"&&!registrar)registrar=i[3];for(const id of(en.publicIds||[]))if((id.type||"").toLowerCase().includes("iana"))iana=id.identifier;if(registrar)break}
 return {domain:(x.ldhName||domain).toLowerCase(),created:ev.registration||null,updated:ev["last changed"]||ev.changed||ev["last update of RDAP database"]||null,expires:ev.expiration||null,registrar,registrar_iana_id:iana,nameservers:(x.nameservers||[]).map(n=>(n.ldhName||n.unicodeName||"").toLowerCase()).filter(Boolean),status:x.status||[]}
}
async function ct(domain){
 const rows=await fj("https://crt.sh/?q="+encodeURIComponent("%25."+domain)+"&output=json",25000);
 const ids=new Set(),names=new Map();let oldest=null,newest=null;
 for(const r of(Array.isArray(rows)?rows:[])){if(r.id!=null)ids.add(String(r.id));const dt=r.entry_timestamp||r.not_before||null;if(dt){if(!oldest||dt<oldest)oldest=dt;if(!newest||dt>newest)newest=dt}for(let n of String(r.name_value||r.common_name||"").split("\n")){n=n.trim().toLowerCase().replace(/^\*\./,"");if(n){const p=names.get(n);if(!p||(dt&&dt>p))names.set(n,dt)}}}
 return {unique_certificates:ids.size||(Array.isArray(rows)?rows.length:0),unique_names:names.size,oldest,newest,recent_names:[...names.entries()].sort((a,b)=>String(b[1]||"").localeCompare(String(a[1]||""))).slice(0,30).map(([name,date])=>({name,date}))}
}
async function wayback(domain){
 const p=new URLSearchParams({url:domain+"/*",output:"json",fl:"timestamp,original,statuscode,mimetype",collapse:"urlkey",limit:"300"});p.append("filter","statuscode:200");p.append("filter","mimetype:text/html");
 const x=await fj("https://web.archive.org/cdx/search/cdx?"+p.toString(),30000);const rows=[];
 if(Array.isArray(x)&&x.length>1){const h=x[0];for(const v of x.slice(1)){const o=Object.fromEntries(h.map((k,i)=>[k,v[i]]));const t=o.timestamp||"";const date=t.length>=8?`${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}T00:00:00Z`:t;rows.push({date,url:o.original||"",archive_url:`https://web.archive.org/web/${t}/${o.original||""}`})}}
 rows.sort((a,b)=>String(a.date).localeCompare(String(b.date)));const idx=rows.length?[0,Math.floor(rows.length/2),rows.length-1]:[];
 return {count:rows.length,first:rows[0]?.date||null,last:rows.at(-1)?.date||null,sample:[...new Set(idx)].map(i=>rows[i])}
}

export default {
 async fetch(request,env){
   const u=new URL(request.url);
   if(u.pathname.startsWith("/api/")){
     const d=getDomain(request);if(!d)return json({error:"Invalid domain"},400);
     try{
       if(u.pathname==="/api/rdap")return json(await rdap(d));
       if(u.pathname==="/api/ct")return json(await ct(d));
       if(u.pathname==="/api/wayback")return json(await wayback(d));
       return json({error:"API route not found"},404);
     }catch(e){return json({error:e.name==="AbortError"?"Provider timed out":e.message},502)}
   }
   return env.ASSETS.fetch(request);
 }
}
