import {getStore} from "@netlify/blobs";
import crypto from "node:crypto";
const MANDALS=["Abs_naroda", "Dev Aashish Divine", "Excellent School", "Hanspura", "Karnavati Park", "Kishor_mandal", "Kumarshala", "Mangalmurti", "Murlidhar", "Murlidhar_society", "Naroda Mandir", "Naroda Smart City", "Nilkanth Residency", "Noblenagar", "Saijpur - 1", "Saijpur2", "Satva Balaji Residency", "Shree Hari Gift City", "Shyamal Park", "Suraj Park", "Swaminarayan Park"];
const norm=s=>(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
const SECRET=process.env.TOKEN_SECRET||"change-this-secret";
const ADMIN_PASS=(process.env.ADMIN_PASSWORD||"admin@123").toLowerCase();
const sign=p=>crypto.createHmac("sha256",SECRET).update(p).digest("base64url");
const mk=o=>{const p=Buffer.from(JSON.stringify({...o,exp:Date.now()+30*864e5})).toString("base64url");return p+"."+sign(p)};
function auth(req){const h=req.headers.get("authorization")||"";const [p,sg]=h.replace("Bearer ","").split(".");
  if(!p||!sg||sign(p)!==sg)return null;try{const o=JSON.parse(Buffer.from(p,"base64url"));return o.exp>Date.now()?o:null}catch{return null}}
const J=(o,st=200)=>new Response(JSON.stringify(o),{status:st,headers:{"Content-Type":"application/json"}});
export default async (req)=>{
  const path=new URL(req.url).pathname.replace(/^\/api/,"");const store=getStore("iv26");
  if(path==="/login"&&req.method==="POST"){const {u,p}=await req.json();const n=norm(u),pass=(p||"").trim().toLowerCase().replace(/\s/g,"");
    if(n==="admin"&&pass===ADMIN_PASS)return J({token:mk({role:"admin"}),role:"admin"});
    const m=MANDALS.find(x=>norm(x)===n);if(m&&pass===norm(m)+"@123")return J({token:mk({role:"mandal",mandal:m}),role:"mandal",mandal:m});
    return J({error:"bad"},401)}
  const a=auth(req);if(!a)return J({error:"auth"},401);
  if(path==="/data"){const cfg=(await store.get("cfg",{type:"json"}))||{};const ms=a.role==="admin"?MANDALS:[a.mandal];const sent={},phones={};
    for(const m of ms){const d=await store.get("m-"+norm(m),{type:"json"});if(d){Object.assign(sent,d.sent||{});Object.assign(phones,d.phones||{})}}
    return J({cfg,sent,phones,logins:a.role==="admin"?MANDALS.map(m=>({m,u:norm(m),p:norm(m)+"@123"})):[]})}
  if(path==="/m"&&req.method==="POST"){const b=await req.json();if(!MANDALS.includes(b.mandal)||(a.role!=="admin"&&a.mandal!==b.mandal))return J({error:"forbidden"},403);
    await store.setJSON("m-"+norm(b.mandal),{sent:b.sent||{},phones:b.phones||{}});return J({ok:1})}
  if(path==="/cfg"&&req.method==="POST"){if(a.role!=="admin")return J({error:"forbidden"},403);const b=await req.json();
    await store.setJSON("cfg",{body:String(b.body||"").slice(0,8000),personal:b.personal!==false,...(b.tpl?{tpl:b.tpl}:{})});return J({ok:1})}
  return J({error:"not found"},404)};
export const config={path:"/api/*"};
