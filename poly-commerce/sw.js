// Poly Commerce, l'adresse du site (c'est l'appli des clés) : elle marche aussi sans réseau (parc, photos déjà vues).
// Ce fichier ne s'occupe que de la page du site, de son manifeste, des logos et des photos.
// Les autres pages du dossier (l'appli /cles/, l'ancien site, les essais) passent sans y toucher.
const V='poly-site-v1';
const BASE=['./','./index.html','./manifest.webmanifest','./logo/logo-poly-court-clair.svg','./logo/icone-192.png','./logo/icone-512.png'];
const ICI=new URL('./',self.location).pathname;
const PAGES=[ICI,ICI+'index.html',ICI+'manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
// On ne supprime que nos propres anciens caches : d'autres applis vivent à la même adresse et gardent le leur.
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.indexOf('poly-site-')==0&&x!=V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;
  const u=new URL(r.url);if(u.origin!=location.origin)return;
  const image=u.pathname.indexOf(ICI+'logo/')==0||u.pathname.indexOf(ICI+'photos/')==0;
  if(image&&/\.(jpg|png|svg)$/.test(u.pathname)){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}))));return}
  if(PAGES.indexOf(u.pathname)<0)return;
  // La page : d'abord le réseau. On ne garde que les bonnes réponses : si l'hébergeur répond par une erreur, on sert notre copie.
  e.respondWith(fetch(r).then(res=>{
    if(res.ok){const cl=res.clone();caches.open(V).then(c=>c.put(r,cl));return res}
    return caches.match(r).then(m=>m||res)}).catch(()=>caches.match(r)));
});
