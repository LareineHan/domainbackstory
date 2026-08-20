function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function getDomain(request){const d=(new URL(request.url).searchParams.get("domain")||"").trim().toLowerCase();return d&&d.includes(".")&&!/[\/@ :]/.test(d)?d:null}
async function fjson(url,ms=12000,headers={}){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{headers:{"accept":"application/json,text/plain,*/*","user-agent":"DomainBackstory/7.0",...headers},signal:c.signal});if(!r.ok){const e=new Error("Provider HTTP "+r.status);e.status=r.status;throw e}return await r.json()}finally{clearTimeout(t)}}
async function cached(keyUrl,ttl,fn,ctx){const cache=caches.default,key=new Request(keyUrl);const hit=await cache.match(key);if(hit){const x=await hit.json();x.cached=true;return x}const x=await fn();ctx.waitUntil(cache.put(key,new Response(JSON.stringify(x),{headers:{"content-type":"application/json","cache-control":`public, s-maxage=${ttl}`}})));return x}

async function rdapBootstrap(domain){
 const tld=domain.split(".").pop();const boot=await fjson("https://data.iana.org/rdap/dns.json",9000);let base=null;
 for(const svc of boot.services||[]){const tlds=svc[0]||[],urls=svc[1]||[];if(tlds.map(x=>String(x).toLowerCase()).includes(tld)){base=urls[0];break}}
 if(!base)throw new Error("No RDAP bootstrap endpoint for TLD");if(!base.endsWith("/"))base+="/";return await fjson(base+"domain/"+encodeURIComponent(domain),10000);
}
async function rdap(domain){
 let x;try{x=await rdapBootstrap(domain)}catch(e){x=await fjson("https://rdap.org/domain/"+encodeURIComponent(domain),10000)}
 const ev={};for(const e of(x.events||[])){if(e.eventAction&&e.eventDate&&!ev[e.eventAction])ev[e.eventAction]=e.eventDate}
 let registrar=null,iana=null,entityCreated=null,entityChanged=null;
 for(const en of(x.entities||[])){if(!(en.roles||[]).includes("registrar"))continue;for(const i of(en.vcardArray?.[1]||[]))if(i[0]==="fn"&&!registrar)registrar=i[3];for(const id of(en.publicIds||[]))if((id.type||"").toLowerCase().includes("iana"))iana=id.identifier;const ee={};for(const e of(en.events||[])){if(e.eventAction&&e.eventDate&&!ee[e.eventAction])ee[e.eventAction]=e.eventDate}entityCreated=ee.registration||entityCreated;entityChanged=ee["last changed"]||ee.changed||entityChanged;break}
 return{domain:(x.ldhName||domain).toLowerCase(),created:ev.registration||null,changed:ev["last changed"]||ev.changed||null,transfer:ev.transfer||null,expires:ev.expiration||null,registrar_expires:ev["registrar expiration"]||null,rdap_db_updated:ev["last update of RDAP database"]||null,registrar,registrar_iana_id:iana,registrar_entity_created:entityCreated,registrar_entity_changed:entityChanged,nameservers:(x.nameservers||[]).map(n=>(n.ldhName||n.unicodeName||"").toLowerCase()).filter(Boolean),status:x.status||[]};
}
function stripDot(s){return String(s||"").replace(/\.$/,"")}
async function doh(domain,type){const x=await fjson(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,8000,{"accept":"application/dns-json"});return(x.Answer||[]).map(a=>{let d=String(a.data||"");if(type==="MX"){const m=d.match(/^(\d+)\s+(.+)$/);return m?`${m[1]} ${stripDot(m[2])}`:stripDot(d)}if(type==="SOA")return d.split(" ").slice(0,2).map(stripDot).join(" ");return stripDot(d.replace(/^"|"$/g,""))}).filter(Boolean)}
async function dns(domain){const types=["A","AAAA","MX","NS","CNAME","SOA"],out={},res=await Promise.allSettled(types.map(t=>doh(domain,t)));types.forEach((t,i)=>out[t]=res[i].status==="fulfilled"?res[i].value:[]);return out}
function snapObj(x){const c=x?.archived_snapshots?.closest;if(!c)return{available:false,timestamp:null,url:null,status:null};let ts=c.timestamp||null;const iso=ts&&ts.length>=8?`${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)}T00:00:00Z`:ts;return{available:!!c.available,timestamp:iso,url:c.url||null,status:c.status||null}}
async function wayback(domain){
 const base="https://archive.org/wayback/available?url="+encodeURIComponent(domain);
 const [oldR,newR]=await Promise.allSettled([fjson(base+"&timestamp=19900101",9000),fjson(base,9000)]);
 const oldest=oldR.status==="fulfilled"?snapObj(oldR.value):{available:false,timestamp:null,url:null,status:null,error:oldR.reason?.message||"unavailable"};
 const latest=newR.status==="fulfilled"?snapObj(newR.value):{available:false,timestamp:null,url:null,status:null,error:newR.reason?.message||"unavailable"};
 if(!oldest.available&&!latest.available&&oldest.error&&latest.error)throw new Error("Wayback unavailable");
 return{oldest,latest};
}
async function ct(domain){const rows=await fjson("https://crt.sh/?q="+encodeURIComponent(domain)+"&output=json&exclude=expired",9000);const ids=new Set(),names=new Map();let newest=null;for(const r of(Array.isArray(rows)?rows:[])){if(r.id!=null)ids.add(String(r.id));const dt=r.entry_timestamp||r.not_before||null;if(dt&&(!newest||dt>newest))newest=dt;for(let n of String(r.name_value||r.common_name||"").split("\n")){n=n.trim().toLowerCase().replace(/^\*\./,"");if(n)names.set(n,dt)}}return{unique_certificates:ids.size||(Array.isArray(rows)?rows.length:0),unique_names:names.size,newest,recent_names:[...names.entries()].sort((a,b)=>String(b[1]||"").localeCompare(String(a[1]||""))).slice(0,20).map(([name,date])=>({name,date}))}}

export default{async fetch(request,env,ctx){
 const u=new URL(request.url);
 if(u.pathname.startsWith("/api/")){const d=getDomain(request);if(!d)return json({error:"Invalid domain"},400);try{
  if(u.pathname==="/api/rdap")return json(await cached(`https://cache.domainbackstory/v7/rdap/${d}`,86400,()=>rdap(d),ctx));
  if(u.pathname==="/api/dns")return json(await cached(`https://cache.domainbackstory/v7/dns/${d}`,3600,()=>dns(d),ctx));
  if(u.pathname==="/api/wayback")return json(await cached(`https://cache.domainbackstory/v7/wayback/${d}`,43200,()=>wayback(d),ctx));
  if(u.pathname==="/api/ct")return json(await cached(`https://cache.domainbackstory/v7/ct/${d}`,21600,()=>ct(d),ctx));
  return json({error:"API route not found"},404);
 }catch(e){return json({error:e.name==="AbortError"?"Provider timed out":e.message},502)}}
 return env.ASSETS.fetch(request);
}}