// Poly Commerce : l'appli marche aussi sans réseau (parc, photos déjà vues)
const V='poly-contact-v1';
const BASE=['./','./index.html','./manifest.webmanifest','../logo/logo-poly-court-clair.svg','../logo/icone-192.png','../logo/icone-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;
  const u=new URL(r.url);
  if(u.origin==location.origin&&/\.(jpg|png|svg)$/.test(u.pathname)){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}))));return}
  if(u.origin==location.origin)e.respondWith(fetch(r).then(res=>{const cl=res.clone();caches.open(V).then(c=>c.put(r,cl));return res}).catch(()=>caches.match(r)));
});
