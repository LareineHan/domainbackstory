import{out,domainOf,fj}from"./_common.js";
export async function onRequestGet({request}){
 const d=domainOf(request);if(!d)return out({error:"Invalid domain"},400);
 try{
  const x=await fj("https://rdap.org/domain/"+encodeURIComponent(d));
  const ev={};
  for(const e of(x.events||[]))if(e.eventAction&&e.eventDate)ev[e.eventAction]=e.eventDate;

  let registrar=null,iana=null;
  for(const en of(x.entities||[])){
   if(!(en.roles||[]).includes("registrar"))continue;
   for(const i of(en.vcardArray?.[1]||[])){
    if(i[0]==="fn"&&!registrar)registrar=i[3];
   }
   for(const id of(en.publicIds||[])){
    if((id.type||"").toLowerCase().includes("iana"))iana=id.identifier;
   }
   if(registrar)break;
  }

  return out({
   domain:(x.ldhName||d).toLowerCase(),
   created:ev.registration||null,
   updated:ev["last changed"]||ev.changed||ev["last update of RDAP database"]||null,
   expires:ev.expiration||null,
   registrar,
   registrar_iana_id:iana,
   nameservers:(x.nameservers||[]).map(n=>(n.ldhName||n.unicodeName||"").toLowerCase()).filter(Boolean),
   status:x.status||[]
  });
 }catch(e){return out({error:"RDAP lookup failed: "+e.message},502)}
}