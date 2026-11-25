// Garde la carte et l'appli patron sur le téléphone (ouvrent même sans réseau).
// La carte publiée (data.json, relais, API GitHub) n'est JAMAIS gardée : toujours la dernière.
const CACHE='beerman-ldr-2';
const BASE=['./','./index.html','./patron.html','./equipe.html','./manifest.webmanifest','./manifest-patron.webmanifest','./manifest-equipe.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./patron-icon-192.png','./patron-icon-512.png','./patron-apple-touch-icon.png','./equipe-icon-192.png','./equipe-icon-512.png','./equipe-apple-touch-icon.png','./img/v7-f-rel.webp','./img/v7-pastille.webp','./img/f-mur.webp','./img/f-cadre.webp','./img/f-ardoise.webp','./img/f-cartouche-nu.webp','./img/f-vis.webp','./img/f-plaque-rouge.webp','./img/f-onglet-noir.webp','./img/f-onglet-rouge.webp','./img/f-carte.webp','./img/f-bois.webp','./img/f-baguette.webp','./img/cible.webp','./img/dard.webp','./img/dard-m.webp','./img/dard-ombre.webp'];
// photos v6 : 43c7b8439e64
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(BASE.map(u=>c.add(u).catch(()=>null)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE&&/^beerman-ldr-/.test(n)).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin){if(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(u.host))e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;})));return;}
  if(u.pathname.endsWith('data.json'))return;   // toujours le réseau
  if(e.request.mode==='navigate'||u.pathname.endsWith('.html')){
    const cle=u.pathname.endsWith('patron.html')?'./patron.html':u.pathname.endsWith('equipe.html')?'./equipe.html':'./index.html';
    e.respondWith(fetch(e.request).then(r=>{if(!r.ok)return caches.match(cle).then(m=>m||r);const c=r.clone();caches.open(CACHE).then(x=>x.put(cle,c));return r;}).catch(()=>caches.match(cle)));return;}
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok&&/\/img\/j-/.test(u.pathname)){const c=r.clone();caches.open(CACHE).then(x=>x.keys().then(ks=>{ks.forEach(k=>{const v=new URL(k.url);if(v.pathname===u.pathname&&v.search!==u.search)x.delete(k);});return x.put(e.request,c);}));}return r;})));
});
// v7 : f213628040
