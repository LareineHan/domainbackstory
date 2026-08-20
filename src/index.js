function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function getDomain(request){const d=(new URL(request.url).searchParams.get("domain")||"").trim().toLowerCase();return d&&d.includes(".")&&!/[\/@ :]/.test(d)?d:null}
async function fetchJson(url,ms=12000){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{headers:{"accept":"application/json,text/plain,*/*","user-agent":"DomainBackstory/4.0"},signal:c.signal});if(!r.ok){const e=new Error("Provider HTTP "+r.status);e.status=r.status;e.retryAfter=r.headers.get("retry-after");throw e}return await r.json()}finally{clearTimeout(t)}}
async function cachedJson(cacheKey,ttl,fn,ctx){const cache=caches.default;const key=new Request(cacheKey);const hit=await cache.match(key);if(hit){const x=await hit.json();x.cached=true;return x}const x=await fn();const resp=new Response(JSON.stringify(x),{headers:{"content-type":"application/json","cache-control":`public, max-age=0, s-maxage=${ttl}`}});ctx.waitUntil(cache.put(key,resp));return x}

async function rdap(domain){
 const x=await fetchJson("https://rdap.org/domain/"+encodeURIComponent(domain),10000);const ev={};for(const e of(x.events||[]))if(e.eventAction&&e.eventDate)ev[e.eventAction]=e.eventDate;
 let registrar=null,iana=null;for(const en of(x.entities||[])){if(!(en.roles||[]).includes("registrar"))continue;for(const i of(en.vcardArray?.[1]||[]))if(i[0]==="fn"&&!registrar)registrar=i[3];for(const id of(en.publicIds||[]))if((id.type||"").toLowerCase().includes("iana"))iana=id.identifier;if(registrar)break}
 return {domain:(x.ldhName||domain).toLowerCase(),created:ev.registration||null,updated:ev["last changed"]||ev.changed||ev["last update of RDAP database"]||null,expires:ev.expiration||null,registrar,registrar_iana_id:iana,nameservers:(x.nameservers||[]).map(n=>(n.ldhName||n.unicodeName||"").toLowerCase()).filter(Boolean),status:x.status||[]}
}
async function ct(domain,mode){
 const deep=mode==="deep";const q=deep?"%."+domain:domain;
 const rows=await fetchJson("https://crt.sh/?q="+encodeURIComponent(q)+"&output=json"+(deep?"":"&exclude=expired"),deep?18000:9000);
 const ids=new Set(),names=new Map();let oldest=null,newest=null;
 for(const r of(Array.isArray(rows)?rows:[])){if(r.id!=null)ids.add(String(r.id));const dt=r.entry_timestamp||r.not_before||null;if(dt){if(!oldest||dt<oldest)oldest=dt;if(!newest||dt>newest)newest=dt}for(let n of String(r.name_value||r.common_name||"").split("\n")){n=n.trim().toLowerCase().replace(/^\*\./,"");if(n){const p=names.get(n);if(!p||(dt&&dt>p))names.set(n,dt)}}}
 return {mode:deep?"deep wildcard":"quick exact-domain",unique_certificates:ids.size||(Array.isArray(rows)?rows.length:0),unique_names:names.size,oldest,newest,recent_names:[...names.entries()].sort((a,b)=>String(b[1]||"").localeCompare(String(a[1]||""))).slice(0,30).map(([name,date])=>({name,date}))}
}
function snapObj(x){const c=x?.archived_snapshots?.closest;if(!c)return{available:false,timestamp:null,url:null,status:null};let ts=c.timestamp||null;let iso=ts&&ts.length>=8?`${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)}T00:00:00Z`:ts;return{available:!!c.available,timestamp:iso,url:c.url||null,status:c.status||null}}
async function waybackQuick(domain){
 const base="https://archive.org/wayback/available?url="+encodeURIComponent(domain);
 const [firstR,latestR]=await Promise.allSettled([fetchJson(base+"&timestamp=19900101",9000),fetchJson(base,9000)]);
 const first=firstR.status==="fulfilled"?snapObj(firstR.value):{available:false,timestamp:null,url:null,error:firstR.reason?.message||"unavailable"};
 const latest=latestR.status==="fulfilled"?snapObj(latestR.value):{available:false,timestamp:null,url:null,error:latestR.reason?.message||"unavailable"};
 if(!first.available&&!latest.available&&first.error&&latest.error)throw new Error("Wayback Availability API unavailable");
 return {first,latest,method:"availability-api"}
}

export default{
 async fetch(request,env,ctx){
  const u=new URL(request.url);
  if(u.pathname.startsWith("/api/")){
   const d=getDomain(request);if(!d)return json({error:"Invalid domain"},400);
   try{
    if(u.pathname==="/api/rdap")return json(await cachedJson(`https://cache.domainbackstory/rdap/${d}`,86400,()=>rdap(d),ctx));
    if(u.pathname==="/api/ct"){const mode=u.searchParams.get("mode")==="deep"?"deep":"quick";return json(await cachedJson(`https://cache.domainbackstory/ct/${mode}/${d}`,mode==="deep"?21600:43200,()=>ct(d,mode),ctx))}
    if(u.pathname==="/api/wayback")return json(await cachedJson(`https://cache.domainbackstory/wayback/${d}`,43200,()=>waybackQuick(d),ctx));
    return json({error:"API route not found"},404);
   }catch(e){return json({error:e.name==="AbortError"?"Provider timed out":e.message,retry_after:e.retryAfter||null},502)}
  }
  return env.ASSETS.fetch(request);
 }
}