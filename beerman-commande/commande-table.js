/* Agence LDR · Commande à table + statistiques anonymes, à brancher sur une carte QR.
   Se branche sur la carte sans la modifier : il lit les articles (data-plat) et s'habille selon l'ambiance
   de la carte (style#ldr-ambiance : BRIQUE, FLECHETTES… sinon les couleurs --ldr-*).
   Réglage : <script>window.LDR_COMMANDE={api:'https://…/api'}</script> avant ce fichier.
   La table vient du QR : …/?table=7. Sans numéro de table, on ne montre que la carte (et on compte les vues). */
(function(){
  var CFG=window.LDR_COMMANDE||{},API=CFG.api||'';
  if(!API)return;
  var D=document,KP='ldr-cmd-panier',KS='ldr-cmd-suivi',KT='ldr-cmd-table';
  function q(s,r){return (r||D).querySelector(s);}
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function lire(k){try{return JSON.parse(sessionStorage.getItem(k));}catch(e){return null;}}
  function ecrire(k,v){try{sessionStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function prix(p){p=String(p==null?'':p).replace(',','.').replace('€','').trim();return /^\d+(\.\d{1,2})?$/.test(p)?parseFloat(p):null;}
  function eur(n){return n.toFixed(2).replace('.',',')+' €';}
  function eurH(n){var t=n.toFixed(2).split('.');return t[0]+'<sup>,'+t[1]+'</sup><small> €</small>';}
  function enCarte(){return !D.documentElement.classList.contains('ldr-edit')&&!!q('#app .k-tete');}
  function hote(){return window.CARTE_HOTE||null;}
  function etat(){var h=hote();return (h&&h.etat&&h.etat())||window.S||null;}

  /* ---------- table ---------- */
  var m=location.search.match(/[?&](?:table|t)=(\d{1,3})/),TABLE=m?+m[1]:lire(KT);
  if(m)ecrire(KT,TABLE);

  /* ---------- statistiques anonymes (aucun cookie, aucun identifiant) ---------- */
  var file=[];
  function ev(t,c){file.push([t,String(c||'-').slice(0,60)]);if(file.length>=30)envoyer();}
  function envoyer(){if(!file.length)return;var b=JSON.stringify({ev:file.splice(0,60)});
    try{if(navigator.sendBeacon&&navigator.sendBeacon(API+'/stats',new Blob([b],{type:'text/plain'})))return;}catch(e){}
    try{fetch(API+'/stats',{method:'POST',body:b,keepalive:true,headers:{'content-type':'text/plain'}});}catch(e){}}
  setInterval(envoyer,12000);
  D.addEventListener('visibilitychange',function(){if(D.visibilityState==='hidden')envoyer();});
  addEventListener('pagehide',envoyer);
  ev('visite','-');

  /* ---------- lire un article de la carte ---------- */
  function article(id){
    var S=etat();
    if(S&&S.categories)for(var i=0;i<S.categories.length;i++){var c=S.categories[i];for(var j=0;j<c.plats.length;j++){var p=c.plats[j];if(p.id===id){
      var h=hote(),ph='';try{ph=p.photo&&h&&h.photo?h.photo(S,p.photo):'';}catch(e){}
      return {id:id,nom:p.nom,prix:prix(p.prix),prix2:prix(p.prix2),col1:c.col1,col2:c.col2,ep:!!p.epuise,cat:c.id,desc:p.desc||'',couleur:p.couleur||'',photo:ph};}}}
    var b=q('[data-plat="'+id+'"]');if(!b)return null;var n=q('.nm',b),im=q('img',b);
    return {id:id,nom:(n?n.textContent:b.textContent).trim().slice(0,60),prix:null,ep:b.classList.contains('ep'),photo:im?im.src:''};
  }

  /* ---------- vignettes : la photo de l'article, sinon le bon verre, teinté comme la boisson ---------- */
  var TEINTE={blanche:'#F1DE9A',blonde:'#E9B949',triple:'#D9A12E',ipa:'#D9962F',ambr:'#C7712A',peche:'#E39A4C','pêche':'#E39A4C',cerise:'#9E2B2B',rouge:'#9E2B2B',framboise:'#B5304A',berry:'#8E2244',mango:'#F0A63A',tropical:'#F0A63A',brune:'#4A2A17',noire:'#1E120B',picon:'#C9692A',citrus:'#E8C85A'};
  function teinte(a){var t=(a.couleur+' '+a.nom+' '+a.desc).toLowerCase(),k;for(k in TEINTE)if(t.indexOf(k)>=0)return TEINTE[k];return '#E3AE45';}
  function verre(a){
    var c=a.cat||'',t=teinte(a),or='currentColor';
    if(/pression|bouteille|biere|bière/.test(c)||/°/.test(a.desc)&&!/alcool|liqueur/.test(c))
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M12 9h16l-2 25a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="'+t+'"/><path d="M11.5 8.5h17" stroke="#fff" stroke-opacity=".9" stroke-width="5" stroke-linecap="round"/><path d="M12 9h16l-2 25a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="none" stroke="'+or+'" stroke-width="1.4"/><path d="M15 14v16" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/></svg>';
    if(/vin/.test(c))return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M13 7h14c0 9-2 14-7 14s-7-5-7-14z" fill="'+(/blanc/.test(a.nom.toLowerCase())?'#E8D37A':'#7A1E2A')+'"/><path d="M13 7h14c0 9-2 14-7 14s-7-5-7-14zM20 21v11M14 33h12" fill="none" stroke="'+or+'" stroke-width="1.4" stroke-linecap="round"/></svg>';
    if(/champ/.test(c))return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M17 5h6l-1 16h-4z" fill="#EBD58A"/><path d="M17 5h6l-1 16h-4zM20 21v12M15 34h10" fill="none" stroke="'+or+'" stroke-width="1.4" stroke-linecap="round"/></svg>';
    if(/cafe|café/.test(c))return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M10 16h17v8a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7z" fill="#5A3420"/><path d="M10 16h17v8a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7zM27 18h2a3 3 0 0 1 0 6h-2M8 34h21M16 8c-1 2 1 3 0 5M21 8c-1 2 1 3 0 5" fill="none" stroke="'+or+'" stroke-width="1.4" stroke-linecap="round"/></svg>';
    if(/soft/.test(c))return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M17 4h6v6l3 5v19a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V15l3-5z" fill="'+(/coca/i.test(a.nom)?'#3A120C':/orang|oasis|jus/i.test(a.nom)?'#F09A2C':'#B9D7C4')+'"/><path d="M17 4h6v6l3 5v19a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V15l3-5zM14 20h12" fill="none" stroke="'+or+'" stroke-width="1.4"/></svg>';
    if(/cocktail/.test(c))return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 8h22L20 21z" fill="#E1735A"/><path d="M9 8h22L20 21zM20 21v11M14 33h12M27 4l-4 7" fill="none" stroke="'+or+'" stroke-width="1.4" stroke-linecap="round"/></svg>';
    if(/pizza|snack|planche|manger/.test(c))return '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="13" fill="#E3A64B"/><circle cx="20" cy="20" r="10" fill="#C2452D"/><circle cx="16" cy="17" r="2" fill="#F4E3B5"/><circle cx="23" cy="22" r="2" fill="#F4E3B5"/><circle cx="22" cy="15" r="1.5" fill="#5B2A1A"/><circle cx="20" cy="20" r="13" fill="none" stroke="'+or+'" stroke-width="1.4"/></svg>';
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 13h18l-2 20a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2z" fill="#C98A3A"/><path d="M11 13h18l-2 20a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2zM14 20h12" fill="none" stroke="'+or+'" stroke-width="1.4"/><rect x="16" y="22" width="6" height="6" rx="1" fill="#fff" fill-opacity=".5"/></svg>';
  }
  function vignette(a){return '<span class="ldr-cmd-vg">'+(a.photo?'<img src="'+esc(a.photo)+'" alt="">':verre(a))+'</span>';}

  /* ---------- quelle fiche est ouverte, combien de temps ---------- */
  var fiche=null;
  D.addEventListener('click',function(e){
    if(!enCarte()||!e.target.closest)return;
    var b=e.target.closest('[data-plat]');
    if(b&&!b.closest('.ldr-cmd')){var a=article(b.dataset.plat);if(a){fiche={a:a,t:Date.now()};ev('fiche',a.nom);}}
    var pg=e.target.closest('[data-page]');
    if(pg){var k=pg.dataset.page,tb=q('a.k-tab-p[data-page="'+k+'"]')||pg,n=(tb.textContent||k).replace(/\s+/g,' ').trim();if(/^Page suivante|^Retour/.test(n))n=k;ev('page',n);}
    var av=e.target.closest('[data-av]');if(av){var h=q('h3,b',av);ev('fiche','À ne pas manquer : '+(h?h.textContent:av.dataset.av));}
  },true);
  function ficheFermee(){if(fiche&&Date.now()-fiche.t>=4000)ev('lu',fiche.a.nom);fiche=null;}

  /* ---------- panier ---------- */
  var panier=lire(KP)||[];
  function sauver(){ecrire(KP,panier);barre();}
  function nb(){return panier.reduce(function(s,x){return s+x.qte;},0);}
  function total(){return panier.reduce(function(s,x){return s+(x.prix||0)*x.qte;},0);}
  function ajouter(a,choix,px,qte){var k=a.id+'|'+(choix||''),l=panier.filter(function(x){return x.k===k;})[0];
    if(l)l.qte=Math.min(12,l.qte+qte);else panier.push({k:k,id:a.id,nom:a.nom,choix:choix||'',prix:px,qte:qte,cat:a.cat||'',desc:a.desc||'',couleur:a.couleur||'',photo:a.photo||''});
    ev('ajout',a.nom);sauver();toast(qte+' × '+a.nom,'ajouté à votre commande');}

  /* ---------- habillage : suit l'ambiance de la carte ---------- */
  var amb=(q('style#ldr-ambiance')||{}).textContent||'',HAB=CFG.habillage||(/BRIQUE/i.test(amb)?'brique':/FLECHETTES|FLÉCHETTES/i.test(amb)?'flechettes':'sombre');
  D.documentElement.setAttribute('data-ldr-cmd',HAB);
  var V={
    /* Brique : papier crème de la carte + plaques émaillées bleu nuit cerclées d'or + émail rouge (comme la bannière pizzas) */
    brique:'--p-fond:#F3EAD6;--p-fond2:#E9DDC2;--p-ink:#15203F;--p-ink2:#4F5674;--p-or:#7A5A22;--p-ligne:rgba(122,90,34,.32);'
      +'--pl-a:#26366A;--pl-b:#15203F;--pl-c:#0C1430;--pl-ink:#F7EEDB;--pl-ink2:#C8CADB;--pl-or:#D7B467;--pl-or2:#F3DFA8;'
      +'--cta-a:#B6392B;--cta-b:#8E2318;--cta-c:#661209;--cta-ink:#FBF1DE;'
      +'--f-d:"Source Serif 4",Georgia,serif;--f-c:"Cinzel","Trajan Pro",Georgia,serif;--f-t:"Source Sans 3",system-ui,sans-serif;--voile:rgba(14,10,6,.55)',
    /* Fléchettes : ardoise noire, filets d'or, émail rouge de la cible */
    flechettes:'--p-fond:#171615;--p-fond2:#0E0E0D;--p-ink:#F4EAD5;--p-ink2:#C2B9A6;--p-or:#D6B064;--p-ligne:rgba(214,176,100,.28);'
      +'--pl-a:#262524;--pl-b:#161616;--pl-c:#0A0A0A;--pl-ink:#F6ECD3;--pl-ink2:#C2B9A6;--pl-or:#D6B064;--pl-or2:#F3D995;'
      +'--cta-a:#B0242B;--cta-b:#7E141A;--cta-c:#5C0D11;--cta-ink:#FBEEDC;'
      +'--f-d:"Alegreya",Georgia,serif;--f-c:"Cinzel","Trajan Pro",Georgia,serif;--f-t:"Alegreya Sans",system-ui,sans-serif;--voile:rgba(0,0,0,.62)',
    sombre:'--p-fond:var(--ldr-fond,#1E1610);--p-fond2:var(--ldr-nuit,#0D0B09);--p-ink:var(--ldr-ink,#F4EBDC);--p-ink2:var(--ldr-ink2,#BFB09A);--p-or:var(--ldr-or,#D8B36C);--p-ligne:var(--ldr-ligne,rgba(216,179,108,.26));'
      +'--pl-a:#2C2017;--pl-b:#1E1610;--pl-c:#0D0B09;--pl-ink:#F4EBDC;--pl-ink2:#BFB09A;--pl-or:var(--ldr-or,#D8B36C);--pl-or2:#F1DCA6;'
      +'--cta-a:#B0412B;--cta-b:#83291A;--cta-c:#5E1A0F;--cta-ink:#FBF1DE;'
      +'--f-d:var(--ldr-fd,Georgia,serif);--f-c:var(--ldr-fd,Georgia,serif);--f-t:var(--ldr-ft,system-ui,sans-serif);--voile:rgba(0,0,0,.6)'
  };
  var PL='background:linear-gradient(180deg,var(--pl-a),var(--pl-b) 55%,var(--pl-c));color:var(--pl-ink);border:1px solid var(--pl-or);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 0 0 3px var(--pl-c),inset 0 0 0 4px color-mix(in srgb,var(--pl-or) 55%,transparent),0 10px 26px rgba(0,0,0,.45)';
  var CTA='background:linear-gradient(180deg,var(--cta-a),var(--cta-b) 55%,var(--cta-c));color:var(--cta-ink);border:1px solid var(--pl-or);box-shadow:inset 0 1px 0 rgba(255,220,200,.3),inset 0 0 0 3px var(--cta-c),inset 0 0 0 4px color-mix(in srgb,var(--pl-or) 60%,transparent),0 8px 20px rgba(80,10,5,.35)';
  var css=D.createElement('style');css.id='ldr-cmd-css';
  css.textContent='.ldr-cmd{'+V[HAB]+';font-family:var(--f-t);-webkit-tap-highlight-color:transparent}'
  +':where(.ldr-cmd) *{box-sizing:border-box}:where(.ldr-cmd) button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0}'
  +'.ldr-cmd svg{display:block}'
  /* barre du bas */
  +'.ldr-cmd-barre{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;gap:10px;align-items:stretch;padding:12px max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));pointer-events:none;transition:opacity .2s,transform .25s;max-width:640px;margin:0 auto}'
  +'.ldr-cmd-barre>*{pointer-events:auto}'
  +'.ldr-cmd-cloche{flex:none;width:62px;border-radius:50%;aspect-ratio:1;display:grid;place-items:center;'+PL+';color:var(--pl-or2)}.ldr-cmd-cloche svg{width:28px;height:28px}'
  +'.ldr-cmd-pan{flex:1;min-height:62px;border-radius:12px;display:flex;align-items:center;gap:12px;padding:0 18px 0 10px;text-align:left;'+PL+'}'
  +'.ldr-cmd-pan .nb{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,var(--pl-or2),var(--pl-or) 55%,color-mix(in srgb,var(--pl-or) 55%,#000));color:#1A1206;font:800 19px var(--f-d)}'
  +'.ldr-cmd-pan .tx{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.1}.ldr-cmd-pan .tx b{font:700 15px var(--f-c);letter-spacing:.12em;text-transform:uppercase;color:var(--pl-ink)}.ldr-cmd-pan .tx span{font-size:13px;color:var(--pl-ink2);margin-top:3px}'
  +'.ldr-cmd-pan .px{font:700 21px var(--f-d);color:var(--pl-or2);white-space:nowrap}.ldr-cmd-pan sup{font-size:.55em}.ldr-cmd-pan .px small{font-size:.6em}'
  +'.ldr-cmd-pan.vide .nb{background:none;border:1px dashed color-mix(in srgb,var(--pl-or) 70%,transparent);color:var(--pl-or)}.ldr-cmd-pan.vide .tx b{font-size:13px}'
  +'.ldr-cmd-pan .pt{width:10px;height:10px;border-radius:50%;background:#6FD39A;box-shadow:0 0 0 4px rgba(111,211,154,.2);animation:ldrcp 1.4s infinite}@keyframes ldrcp{50%{opacity:.35}}'
  +'body.ldr-cmd-on{padding-bottom:96px!important}'
  +'body:has(.tiroir) .ldr-cmd-barre,body:has(.ldr-cmd-feuille) .ldr-cmd-barre{opacity:0;transform:translateY(20px);pointer-events:none}'
  /* bloc « commander » dans la fiche de l article (fiche sombre de la carte) */
  +'.ldr-cmd-add{margin:18px 18px 4px;padding:16px 16px 14px;border-radius:12px;'+PL+'}'
  +'.ldr-cmd-add .t{display:flex;align-items:center;gap:10px;font:700 12.5px var(--f-c);letter-spacing:.16em;text-transform:uppercase;color:var(--pl-or2);margin-bottom:12px}.ldr-cmd-add .t i{flex:1;height:1px;background:linear-gradient(90deg,color-mix(in srgb,var(--pl-or) 60%,transparent),transparent)}'
  +'.ldr-cmd-ch{display:flex;gap:10px;margin-bottom:12px}.ldr-cmd-ch button{flex:1;padding:10px 8px;border-radius:10px;border:1px solid color-mix(in srgb,var(--pl-or) 45%,transparent)!important;text-align:center;line-height:1.15}'
  +'.ldr-cmd-ch button b{display:block;font:700 14px var(--f-c);letter-spacing:.08em}.ldr-cmd-ch button span{font:600 17px var(--f-d);color:var(--pl-or2)}'
  +'.ldr-cmd-ch button[aria-pressed=true]{background:radial-gradient(120% 140% at 50% 0,var(--pl-or2),var(--pl-or) 60%,color-mix(in srgb,var(--pl-or) 60%,#000));color:#1A1206;border-color:var(--pl-or2)!important}.ldr-cmd-ch button[aria-pressed=true] span{color:#1A1206}'
  +'.ldr-cmd-l{display:flex;gap:10px;align-items:stretch}'
  +'.ldr-cmd-q{display:flex;align-items:center;border-radius:999px;border:1px solid color-mix(in srgb,var(--pl-or) 50%,transparent)}.ldr-cmd-q button{width:42px;height:48px;display:grid;place-items:center;color:var(--pl-or2);font:600 24px var(--f-d)}.ldr-cmd-q b{min-width:22px;text-align:center;font:700 20px var(--f-d)}'
  +'.ldr-cmd-go{flex:1;min-height:50px;border-radius:10px;font:700 14.5px var(--f-c)!important;letter-spacing:.1em;text-transform:uppercase;'+CTA+'}.ldr-cmd-go small{display:block;font:600 14px var(--f-d);letter-spacing:0;text-transform:none;opacity:.9}'
  /* feuille du bas : papier de la carte */
  +'.ldr-cmd-voile{position:fixed;inset:0;z-index:70;background:var(--voile);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .25s}.ldr-cmd-voile.on{opacity:1}'
  +'.ldr-cmd-feuille{position:fixed;left:0;right:0;bottom:0;z-index:71;max-height:90vh;overflow:auto;max-width:640px;margin:0 auto;color:var(--p-ink);'
  +'background:radial-gradient(130% 60% at 50% 0,color-mix(in srgb,var(--p-fond) 70%,#fff) 0,var(--p-fond) 45%,var(--p-fond2) 100%);border-radius:18px 18px 0 0;box-shadow:0 -24px 60px rgba(0,0,0,.5);transform:translateY(100%);transition:transform .32s cubic-bezier(.2,.9,.3,1);padding:0 0 max(18px,env(safe-area-inset-bottom))}.ldr-cmd-feuille.on{transform:none}'
  +'.ldr-cmd-feuille::before{content:"";position:absolute;inset:8px 8px 0;border:1px solid var(--p-ligne);border-bottom:0;border-radius:12px 12px 0 0;pointer-events:none}'
  +'.ldr-cmd-poi{width:44px;height:4px;border-radius:9px;background:var(--p-ligne);margin:10px auto 0}'
  +'.ldr-cmd-tete{margin:14px 18px 0;padding:14px 16px;border-radius:12px;display:flex;align-items:center;gap:14px;'+PL+'}'
  +'.ldr-cmd-tete .tb{flex:none;width:58px;height:58px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid var(--pl-or);box-shadow:inset 0 0 0 3px var(--pl-c),inset 0 0 0 4px color-mix(in srgb,var(--pl-or) 55%,transparent)}'
  +'.ldr-cmd-tete .tb small{font:700 8.5px var(--f-c);letter-spacing:.16em;color:var(--pl-ink2)}.ldr-cmd-tete .tb b{font:700 25px var(--f-d);color:var(--pl-or2);line-height:1}'
  +'.ldr-cmd-tete h3{margin:0;font:700 20px var(--f-c);letter-spacing:.08em;text-transform:uppercase;color:var(--pl-ink);line-height:1.1}.ldr-cmd-tete p{margin:4px 0 0;font:italic 500 15px var(--f-d);color:var(--pl-ink2)}'
  +'.ldr-cmd-corps{padding:6px 22px 0}'
  +'.ldr-cmd-it{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px dashed var(--p-ligne)}'
  +'.ldr-cmd-vg{flex:none;width:52px;height:52px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:color-mix(in srgb,var(--p-ink) 6%,transparent);border:1px solid var(--p-ligne);color:var(--p-or);box-shadow:inset 0 0 0 3px var(--p-fond)}.ldr-cmd-vg img{width:100%;height:100%;object-fit:cover}.ldr-cmd-vg svg{width:34px;height:34px}'
  +'.ldr-cmd-it .n{flex:1;min-width:0;font:600 17.5px var(--f-d);line-height:1.15}.ldr-cmd-it .n i{display:block;font:italic 500 14.5px var(--f-d);color:var(--p-ink2);margin-top:2px}'
  +'.ldr-cmd-it .p{display:block;font:700 15px var(--f-d);color:var(--p-or);margin-top:4px}.ldr-cmd-it sup{font-size:.6em}.ldr-cmd-it .p small{font-size:.7em}'
  +'.ldr-cmd-it .ldr-cmd-q{border-color:var(--p-ligne)}.ldr-cmd-it .ldr-cmd-q button{width:36px;height:40px;color:var(--p-or)}.ldr-cmd-it .ldr-cmd-q b{font-size:18px;color:var(--p-ink)}'
  +'.ldr-cmd-tot{display:flex;align-items:baseline;gap:10px;padding:16px 0 4px}.ldr-cmd-tot span{font:700 14px var(--f-c);letter-spacing:.16em;text-transform:uppercase}.ldr-cmd-tot i{flex:1;border-bottom:2px dotted var(--p-ligne);transform:translateY(-4px)}.ldr-cmd-tot b{font:700 30px var(--f-d);color:var(--p-ink)}.ldr-cmd-tot sup{font-size:.55em}.ldr-cmd-tot small{font-size:.55em}'
  +'.ldr-cmd-paie{font:italic 500 14px var(--f-d);color:var(--p-ink2);margin:0 0 6px}'
  +'.ldr-cmd-note{display:block;width:100%;margin-top:12px;padding:12px 2px;border:0;border-bottom:1px solid var(--p-ligne);background:transparent;color:var(--p-ink);font:italic 500 17px var(--f-d);outline:0;border-radius:0}.ldr-cmd-note::placeholder{color:var(--p-ink2);opacity:.85}.ldr-cmd-note:focus{border-bottom-color:var(--p-or)}'
  +'.ldr-cmd-big{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;margin-top:20px;min-height:62px;border-radius:12px;font:700 17px var(--f-c)!important;letter-spacing:.14em;text-transform:uppercase;'+CTA+'}.ldr-cmd-big svg{width:22px;height:22px}.ldr-cmd-big[disabled]{filter:saturate(.5);opacity:.8}'
  +'.ldr-cmd-sec{display:block;width:100%;margin-top:6px;min-height:48px;font:italic 600 16px var(--f-d)!important;color:var(--p-or)!important;text-decoration:underline;text-underline-offset:4px;text-decoration-color:var(--p-ligne)}'
  +'.ldr-cmd-err{color:#B3261E;font-weight:700;margin-top:8px;text-align:center;min-height:1px}'
  +'.ldr-cmd-mot{display:grid;gap:10px;padding-top:14px}.ldr-cmd-mot button{display:flex;align-items:center;gap:14px;min-height:66px;border-radius:12px;padding:0 16px;text-align:left;'+PL+'}.ldr-cmd-mot button b{display:block;font:700 15px var(--f-c);letter-spacing:.1em;text-transform:uppercase}.ldr-cmd-mot button span{font:italic 500 14px var(--f-d);color:var(--pl-ink2)}.ldr-cmd-mot svg{width:28px;height:28px;color:var(--pl-or2);flex:none}'
  +'.ldr-cmd-etapes{list-style:none;padding:8px 0 0;margin:0;position:relative}.ldr-cmd-etapes li{display:flex;gap:14px;align-items:center;padding:12px 0;font:600 17px var(--f-d);color:var(--p-ink2)}'
  +'.ldr-cmd-etapes li i{width:34px;height:34px;border-radius:50%;border:1px solid var(--p-ligne);display:grid;place-items:center;font:700 15px var(--f-d);font-style:normal;flex:none;background:var(--p-fond)}'
  +'.ldr-cmd-etapes li.ok{color:var(--p-ink)}.ldr-cmd-etapes li.ok i{background:radial-gradient(circle at 35% 30%,#F3DFA8,#D7B467 55%,#8E6C34);border-color:#8E6C34;color:#1A1206}.ldr-cmd-etapes li.ici i{box-shadow:0 0 0 5px color-mix(in srgb,#D7B467 30%,transparent)}'
  /* petit mot en haut de l écran */
  +'.ldr-cmd-toast{position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));transform:translate(-50%,-10px);opacity:0;transition:all .25s;z-index:90;display:flex;align-items:center;gap:10px;padding:10px 16px 10px 12px;border-radius:12px;max-width:92vw;'+PL+'}.ldr-cmd-toast.on{opacity:1;transform:translate(-50%,0)}'
  +'.ldr-cmd-toast .ok{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,var(--pl-or2),var(--pl-or));color:#1A1206;font-weight:800}.ldr-cmd-toast b{display:block;font:600 15px var(--f-d)}.ldr-cmd-toast span{font-size:13px;color:var(--pl-ink2)}';
  D.head.appendChild(css);
  if(!q('link[href*="Cinzel"]')){var l=D.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap';D.head.appendChild(l);}

  var IC={
    cloche:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17h16M5.5 17a6.5 6.5 0 0 1 13 0M12 10.5V9M10 9h4M3 20h18"/></svg>',
    envoi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h13M12 6l6 6-6 6"/></svg>',
    note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21zM9 8h6M9 12h6M9 16h3"/></svg>',
    verre:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10l-1 16H8zM6.5 4h11M9 9h6"/></svg>',
    question:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.7M12 17h.01"/></svg>'
  };

  var tT=null;
  function toast(t,s){var o=q('.ldr-cmd-toast');if(o)o.remove();clearTimeout(tT);var d=D.createElement('div');d.className='ldr-cmd ldr-cmd-toast';d.setAttribute('role','status');
    d.innerHTML='<span class="ok">✓</span><div><b>'+esc(t)+'</b>'+(s?'<span>'+esc(s)+'</span>':'')+'</div>';D.body.appendChild(d);
    requestAnimationFrame(function(){d.classList.add('on');});tT=setTimeout(function(){d.classList.remove('on');setTimeout(function(){d.remove();},300);},2400);}

  /* ---------- feuille (bas de l'écran) ---------- */
  var F=null;
  function feuille(html,apres){fermer(true);var v=D.createElement('div');v.className='ldr-cmd ldr-cmd-voile';var f=D.createElement('div');f.className='ldr-cmd ldr-cmd-feuille';f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.innerHTML='<div class="ldr-cmd-poi"></div>'+html;
    D.body.appendChild(v);D.body.appendChild(f);F={v:v,f:f};v.onclick=function(){fermer();};
    requestAnimationFrame(function(){requestAnimationFrame(function(){v.classList.add('on');f.classList.add('on');});});if(apres)apres(f);}
  function fermer(vite){if(!F)return;var x=F;F=null;if(vite){x.v.remove();x.f.remove();return;}x.v.classList.remove('on');x.f.classList.remove('on');setTimeout(function(){x.v.remove();x.f.remove();},320);}
  D.addEventListener('keydown',function(e){if(e.key==='Escape')fermer();});
  function tete(titre,sous){return '<div class="ldr-cmd-tete"><div class="tb"><small>TABLE</small><b>'+TABLE+'</b></div><div><h3>'+titre+'</h3>'+(sous?'<p>'+sous+'</p>':'')+'</div></div>';}

  /* ---------- barre du bas ---------- */
  var bar=null,suivi=lire(KS);
  function barre(){
    if(!TABLE||!enCarte()){if(bar){bar.remove();bar=null;D.body.classList.remove('ldr-cmd-on');}return;}
    if(!bar){bar=D.createElement('div');bar.className='ldr-cmd ldr-cmd-barre';D.body.appendChild(bar);D.body.classList.add('ldr-cmd-on');}
    var n=nb(),h='<button type="button" class="ldr-cmd-cloche" data-x="appel" aria-label="Appeler la serveuse, table '+TABLE+'">'+IC.cloche+'</button>';
    if(suivi&&!n)h+='<button type="button" class="ldr-cmd-pan" data-x="suivi"><span class="nb"><span class="pt"></span></span><span class="tx"><b>'+(suivi.genre==='appel'?'Votre appel':'Votre commande')+'</b><span>'+esc(etapeTxt(suivi.st,suivi.genre))+'</span></span></button>';
    else if(n)h+='<button type="button" class="ldr-cmd-pan" data-x="panier"><span class="nb">'+n+'</span><span class="tx"><b>Ma commande</b><span>Table '+TABLE+' · voir et envoyer</span></span>'+(total()?'<span class="px">'+eurH(total())+'</span>':'')+'</button>';
    else h+='<button type="button" class="ldr-cmd-pan vide" data-x="aide"><span class="nb">+</span><span class="tx"><b>Commander d\'ici</b><span>Touchez une bière, une pizza…</span></span></button>';
    bar.innerHTML=h;
  }
  D.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.ldr-cmd-barre [data-x]');if(!b)return;var x=b.dataset.x;
    if(x==='appel')appel();else if(x==='panier')voirPanier();else if(x==='suivi')voirSuivi();else toast('Touchez un article de la carte','puis « Ajouter à ma commande »');});

  /* ---------- « Ajouter à ma commande » dans la fiche de l'article ---------- */
  new MutationObserver(function(ms){ms.forEach(function(mu){
    [].forEach.call(mu.addedNodes,function(n){if(n.nodeType===1&&n.classList&&n.classList.contains('tiroir'))setTimeout(function(){greffe(n);},0);});
    [].forEach.call(mu.removedNodes,function(n){if(n.nodeType===1&&n.classList&&n.classList.contains('tiroir'))ficheFermee();});
  });barre();}).observe(D.body,{childList:true});
  var appEl=q('#app');if(appEl)new MutationObserver(function(){barre();}).observe(appEl,{childList:true});
  function greffe(t){
    if(!TABLE||!fiche||!enCarte()||q('.ldr-cmd-add',t))return;var a=fiche.a;if(a.ep)return;
    var ch=[];if(a.col2&&(a.prix!=null||a.prix2!=null)){if(a.prix!=null)ch.push([a.col1||'Petit',a.prix]);if(a.prix2!=null)ch.push([a.col2,a.prix2]);}
    var sel=0,qte=1,d=D.createElement('div');d.className='ldr-cmd ldr-cmd-add';
    function px(){return ch.length?ch[sel][1]:a.prix;}
    function dessin(){d.innerHTML='<div class="t">Commander · table '+TABLE+'<i></i></div>'
      +(ch.length>1?'<div class="ldr-cmd-ch">'+ch.map(function(c,i){return '<button type="button" data-c="'+i+'" aria-pressed="'+(i===sel)+'"><b>'+esc(c[0])+'</b><span>'+eur(c[1])+'</span></button>';}).join('')+'</div>':'')
      +'<div class="ldr-cmd-l"><div class="ldr-cmd-q"><button type="button" data-q="-1" aria-label="Moins">−</button><b>'+qte+'</b><button type="button" data-q="1" aria-label="Plus">+</button></div>'
      +'<button type="button" class="ldr-cmd-go">Ajouter'+(px()!=null?'<small>'+eur(px()*qte)+'</small>':'')+'</button></div>';}
    dessin();
    d.addEventListener('click',function(e){var c=e.target.closest('[data-c]'),qq=e.target.closest('[data-q]'),go=e.target.closest('.ldr-cmd-go');
      if(c){sel=+c.dataset.c;dessin();}else if(qq){qte=Math.max(1,Math.min(12,qte+ +qq.dataset.q));dessin();}
      else if(go){ajouter(a,ch.length?ch[sel][0]:'',px(),qte);var f=q('[data-ferme]:not(.voile)',t)||q('[data-ferme]',t);if(f)f.click();}});
    var ct=q('.ct',t);if(ct&&ct.parentNode===t)t.insertBefore(d,ct.nextSibling);else t.appendChild(d);
  }

  /* ---------- voir et envoyer la commande ---------- */
  function voirPanier(){
    if(!panier.length)return;
    function html(){var n=nb();return tete('Ma commande',n+' article'+(n>1?'s':'')+' · le bar la reçoit tout de suite')+'<div class="ldr-cmd-corps">'
      +panier.map(function(x,i){return '<div class="ldr-cmd-it">'+vignette(x)+'<span class="n">'+esc(x.nom)+(x.choix?'<i>'+esc(x.choix)+'</i>':'')+(x.prix!=null?'<span class="p">'+eurH(x.prix*x.qte)+'</span>':'')+'</span><div class="ldr-cmd-q"><button type="button" data-i="'+i+'" data-d="-1" aria-label="Moins">−</button><b>'+x.qte+'</b><button type="button" data-i="'+i+'" data-d="1" aria-label="Plus">+</button></div></div>';}).join('')
      +(total()?'<div class="ldr-cmd-tot"><span>Total</span><i></i><b>'+eurH(total())+'</b></div>':'')
      +'<p class="ldr-cmd-paie">On règle au bar, comme d\'habitude.</p>'
      +'<input class="ldr-cmd-note" maxlength="200" placeholder="Un mot pour le bar ? bien fraîche, sans glaçons…" value="'+esc(CFG._note||'')+'">'
      +'<button type="button" class="ldr-cmd-big" data-envoi>Envoyer au bar'+IC.envoi+'</button><button type="button" class="ldr-cmd-sec" data-plus>Ajouter autre chose</button><div class="ldr-cmd-err" role="alert"></div></div>';}
    feuille(html(),function(f){
      f.addEventListener('input',function(e){if(e.target.classList.contains('ldr-cmd-note'))CFG._note=e.target.value;});
      f.addEventListener('click',function(e){var b=e.target.closest('[data-d]');
        if(b){var x=panier[+b.dataset.i];x.qte=Math.min(12,x.qte+ +b.dataset.d);if(x.qte<=0)panier.splice(+b.dataset.i,1);sauver();if(!panier.length){fermer();return;}f.innerHTML='<div class="ldr-cmd-poi"></div>'+html();return;}
        if(e.target.closest('[data-plus]')){fermer();return;}
        var go=e.target.closest('[data-envoi]');if(!go||go.disabled)return;go.disabled=true;go.firstChild.textContent='Envoi…';
        poste('/commande',{table:TABLE,note:CFG._note||'',items:panier.map(function(x){return {id:x.id,nom:x.nom,choix:x.choix,qte:x.qte,prix:x.prix};})}).then(function(d){
          if(!d.ok){q('.ldr-cmd-err',f).textContent=d.message||'Le bar ne répond pas. Faites-lui signe.';go.disabled=false;go.firstChild.textContent='Envoyer au bar';return;}
          panier=[];CFG._note='';sauver();suivi={id:d.id,s:d.secret,st:0,genre:'commande',num:d.num};ecrire(KS,suivi);barre();voirSuivi();suivre();});
      });});
  }
  function poste(ch,o){return fetch(API+ch,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json();}).catch(function(){return {ok:false,message:'Pas de réseau. Faites signe au bar.'};});}

  function appel(){
    feuille(tete('Appeler la serveuse','Elle le voit tout de suite au bar.')+'<div class="ldr-cmd-corps"><div class="ldr-cmd-mot">'
      +[['commander','verre','Je veux commander','Elle vient prendre la commande'],['addition','note','L\'addition','Elle vous l\'apporte'],['question','question','Une question','Allergie, conseil, autre']].map(function(x){return '<button type="button" data-m="'+x[0]+'">'+IC[x[1]]+'<span><b>'+x[2]+'</b><span>'+x[3]+'</span></span></button>';}).join('')
      +'</div><button type="button" class="ldr-cmd-sec" data-non>Finalement non</button><div class="ldr-cmd-err" role="alert"></div></div>',function(f){
      f.addEventListener('click',function(e){if(e.target.closest('[data-non]')){fermer();return;}var b=e.target.closest('[data-m]');if(!b||b.disabled)return;b.disabled=true;
        poste('/appel',{table:TABLE,motif:b.dataset.m}).then(function(d){
          if(!d.ok&&d.erreur!=='trop'){q('.ldr-cmd-err',f).textContent=d.message||'Le bar ne répond pas.';b.disabled=false;return;}
          if(d.ok){suivi={id:d.id,s:d.secret,st:0,genre:'appel'};ecrire(KS,suivi);suivre();}
          fermer();toast(d.ok?'C\'est envoyé au bar':'Déjà noté',d.ok?'La serveuse arrive.':d.message);barre();});});});
  }
  function etapeTxt(st,g){if(g==='appel')return st>=1?'La serveuse arrive':'Envoyé au bar';return st>=2?'Servie, bonne dégustation !':st>=1?'Le bar la prépare':'Reçue au bar';}
  function voirSuivi(){if(!suivi)return;var g=suivi.genre,st=suivi.st;
    var E=g==='appel'?[['Appel reçu au bar',0],['La serveuse arrive',1]]:[['Commande reçue au bar',0],['Le bar la prépare',1],['Servie à votre table',2]];
    feuille(tete(g==='appel'?'Votre appel':'Commande n° '+(suivi.num||''),g==='appel'?'':'On règle au bar, comme d\'habitude.')+'<div class="ldr-cmd-corps"><ul class="ldr-cmd-etapes">'
      +E.map(function(x,i){var ok=st>=x[1];return '<li class="'+(ok?'ok':'')+(ok&&(i===E.length-1||st<E[i+1][1])?' ici':'')+'"><i>'+(ok?'✓':i+1)+'</i>'+x[0]+'</li>';}).join('')+'</ul><button type="button" class="ldr-cmd-sec" data-ok>Revenir à la carte</button></div>',function(f){q('[data-ok]',f).onclick=function(){fermer();};});}
  var tS=null;
  function suivre(){clearTimeout(tS);if(!suivi)return;
    fetch(API+'/suivi?id='+encodeURIComponent(suivi.id)+'&s='+encodeURIComponent(suivi.s)).then(function(r){return r.json();}).then(function(d){
      if(!d.ok){suivi=null;ecrire(KS,null);barre();return;}
      var av=suivi.st;suivi.st=d.st;ecrire(KS,suivi);
      if(d.st===9||(d.st===2&&av===2)||(suivi.genre==='appel'&&d.st===2)){suivi=null;ecrire(KS,null);barre();return;}
      if(av!==d.st){barre();if(F&&q('.ldr-cmd-etapes',F.f))voirSuivi();if(navigator.vibrate)navigator.vibrate(120);}
      tS=setTimeout(suivre,d.st===2?60000:5000);
    }).catch(function(){tS=setTimeout(suivre,10000);});}
  if(suivi)suivre();
  barre();
})();
