/* Agence LDR · Commande à table + statistiques anonymes, à brancher sur une carte QR.
   Se branche sur n'importe quel style de carte : il lit les articles (data-plat) et les couleurs --ldr-*.
   Réglage : <script>window.LDR_COMMANDE={api:'https://…/api'}</script> avant ce fichier.
   La table vient du QR : …/beerman/?table=7. Sans numéro de table, on ne montre que la carte (et on compte les vues). */
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
  function enCarte(){return !(window.vue&&window.vue!=='carte')&&!D.documentElement.classList.contains('ldr-edit');}

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
  if(enCarte())ev('visite','-');

  /* ---------- lire un article de la carte ---------- */
  function article(id){
    var S=(window.CARTE_HOTE&&window.CARTE_HOTE.etat&&window.CARTE_HOTE.etat())||window.S;
    if(S&&S.categories)for(var i=0;i<S.categories.length;i++){var c=S.categories[i];for(var j=0;j<c.plats.length;j++){var p=c.plats[j];if(p.id===id)return {id:id,nom:p.nom,prix:prix(p.prix),prix2:prix(p.prix2),col1:c.col1,col2:c.col2,ep:!!p.epuise,cat:c.nom};}}
    var b=q('[data-plat="'+id+'"]');if(!b)return null;var n=q('.nm',b);
    return {id:id,nom:(n?n.textContent:b.textContent).trim().slice(0,60),prix:null,ep:b.classList.contains('ep')};
  }

  /* ---------- quelle fiche est ouverte, combien de temps ---------- */
  var fiche=null;
  D.addEventListener('click',function(e){
    if(!enCarte())return;
    var b=e.target.closest&&e.target.closest('[data-plat]');
    if(b&&!b.closest('.ldr-cmd')){var a=article(b.dataset.plat);if(a){fiche={a:a,t:Date.now()};ev('fiche',a.nom);}}
    var pg=e.target.closest&&e.target.closest('[data-page]');
    if(pg){var k=pg.dataset.page,tb=q('a.k-tab-p[data-page="'+k+'"]')||pg,n=(tb.textContent||k).replace(/\s+/g,' ').trim();if(/^Page suivante|^Retour/.test(n))n=k;ev('page',n);}
    var av=e.target.closest&&e.target.closest('[data-av]');if(av){var h=q('h3',av);ev('fiche','À ne pas manquer : '+(h?h.textContent:av.dataset.av));}
  },true);
  function ficheFermee(){if(fiche&&Date.now()-fiche.t>=4000)ev('lu',fiche.a.nom);fiche=null;}

  /* ---------- panier ---------- */
  var panier=lire(KP)||[];
  function sauver(){ecrire(KP,panier);barre();}
  function nb(){return panier.reduce(function(s,x){return s+x.qte;},0);}
  function total(){return panier.reduce(function(s,x){return s+(x.prix||0)*x.qte;},0);}
  function ajouter(a,choix,px,qte){var k=a.id+'|'+(choix||''),l=panier.filter(function(x){return x.k===k;})[0];
    if(l)l.qte=Math.min(12,l.qte+qte);else panier.push({k:k,id:a.id,nom:a.nom,choix:choix||'',prix:px,qte:qte});
    ev('ajout',a.nom);sauver();toast(qte+' × '+a.nom+' ajouté'+(qte>1?'s':'')+' à votre commande');}

  /* ---------- style : prend les couleurs et les écritures de la carte (--ldr-*) ---------- */
  var css=D.createElement('style');
  css.textContent='.ldr-cmd{--c-or:var(--ldr-or,#D8B36C);--c-ink:var(--ldr-ink,#F4EBDC);--c-ink2:var(--ldr-ink2,#BFB09A);--c-fond:var(--ldr-fond,#1E1610);--c-nuit:var(--ldr-nuit,#0D0B09);--c-ligne:var(--ldr-ligne,rgba(216,179,108,.26));--c-onor:var(--ldr-onor,#17110A);--c-ft:var(--ldr-ft,system-ui,sans-serif);--c-fd:var(--ldr-fd,Georgia,serif);font-family:var(--c-ft);color:var(--c-ink);-webkit-tap-highlight-color:transparent}'
  +'.ldr-cmd *{box-sizing:border-box}.ldr-cmd button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}'
  +'.ldr-cmd-barre{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;gap:8px;padding:10px max(12px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));background:linear-gradient(180deg,transparent,var(--c-nuit) 30%);pointer-events:none}'
  +'.ldr-cmd-barre>*{pointer-events:auto}'
  +'.ldr-cmd-b{min-height:52px;border-radius:14px;padding:8px 14px;display:flex;align-items:center;gap:8px;font-weight:800;font-size:15px;line-height:1.1;box-shadow:0 10px 30px rgba(0,0,0,.45)}'
  +'.ldr-cmd-appel{background:var(--c-fond);border:1.5px solid var(--c-ligne)!important;flex:0 0 auto;text-align:left}.ldr-cmd-appel small{display:block;font-weight:600;font-size:12px;color:var(--c-ink2)}'
  +'.ldr-cmd-pan{flex:1;justify-content:space-between;background:linear-gradient(180deg,color-mix(in srgb,var(--c-or) 60%,#fff),var(--c-or) 45%,color-mix(in srgb,var(--c-or) 65%,#000));color:var(--c-onor)}'
  +'.ldr-cmd-pan[disabled]{opacity:.55;filter:saturate(.4)}.ldr-cmd-pan em{font-style:normal;background:var(--c-onor);color:var(--c-or);border-radius:99px;padding:2px 9px;margin-right:6px}'
  +'.ldr-cmd-suivi{flex:1;background:var(--c-fond);border:1.5px solid var(--c-or)!important;justify-content:center}'
  +'.ldr-cmd-pt{width:10px;height:10px;border-radius:50%;background:var(--c-or);animation:ldrcp 1.2s infinite}@keyframes ldrcp{50%{opacity:.3}}'
  +'body.ldr-cmd-on{padding-bottom:84px}body:has(.tiroir) .ldr-cmd-barre,body:has(.ldr-cmd-feuille) .ldr-cmd-barre{opacity:0;pointer-events:none}.ldr-cmd-barre{transition:opacity .2s}'
  +'.ldr-cmd-add{margin:16px 22px 0;padding:14px;border:1px solid var(--c-ligne);border-radius:16px;background:color-mix(in srgb,var(--c-nuit) 55%,transparent)}'
  +'.ldr-cmd-add .t{font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--c-or);margin-bottom:10px}'
  +'.ldr-cmd-ch{display:flex;gap:8px;margin-bottom:10px}.ldr-cmd-ch button{flex:1;padding:10px;border-radius:12px;border:1.5px solid var(--c-ligne)!important;font-weight:800}.ldr-cmd-ch button[aria-pressed=true]{background:var(--c-or);color:var(--c-onor);border-color:var(--c-or)!important}'
  +'.ldr-cmd-l{display:flex;gap:10px;align-items:center}'
  +'.ldr-cmd-q{display:flex;align-items:center;border:1.5px solid var(--c-ligne);border-radius:12px}.ldr-cmd-q button{width:44px;height:48px;font-size:22px;font-weight:800;color:var(--c-or)}.ldr-cmd-q b{min-width:26px;text-align:center;font-family:var(--c-fd);font-size:20px}'
  +'.ldr-cmd-go{flex:1;min-height:50px;border-radius:12px;font-weight:800;font-size:16px;background:var(--c-or)!important;color:var(--c-onor)!important}'
  +'.ldr-cmd-voile{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.6);opacity:0;transition:opacity .25s}.ldr-cmd-voile.on{opacity:1}'
  +'.ldr-cmd-feuille{position:fixed;left:0;right:0;bottom:0;z-index:71;max-height:88vh;overflow:auto;background:var(--c-fond);border-top:1px solid var(--c-ligne);border-radius:22px 22px 0 0;padding:18px 18px max(18px,env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .3s cubic-bezier(.2,.9,.3,1);max-width:640px;margin:0 auto;box-shadow:0 -20px 60px rgba(0,0,0,.5)}.ldr-cmd-feuille.on{transform:none}'
  +'.ldr-cmd-feuille h3{font-family:var(--c-fd);font-size:26px;margin:2px 0 2px}.ldr-cmd-feuille .s{color:var(--c-ink2);margin:0 0 14px;font-size:15px}'
  +'.ldr-cmd-it{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--c-ligne)}.ldr-cmd-it .n{flex:1;font-weight:700}.ldr-cmd-it .n i{display:block;font-style:normal;font-weight:500;color:var(--c-ink2);font-size:14px}.ldr-cmd-it .p{font-family:var(--c-fd);color:var(--c-or);min-width:64px;text-align:right}'
  +'.ldr-cmd-tot{display:flex;justify-content:space-between;padding:14px 0 4px;font-weight:800;font-size:18px}.ldr-cmd-tot b{font-family:var(--c-fd);color:var(--c-or);font-size:22px}'
  +'.ldr-cmd-note{width:100%;margin-top:10px;padding:12px;border-radius:12px;border:1.5px solid var(--c-ligne);background:var(--c-nuit);color:var(--c-ink);font:inherit;font-size:16px}'
  +'.ldr-cmd-big{display:block;width:100%;margin-top:14px;min-height:56px;border-radius:14px;font-weight:800;font-size:17px;background:var(--c-or)!important;color:var(--c-onor)!important}'
  +'.ldr-cmd-sec{display:block;width:100%;margin-top:10px;min-height:48px;border-radius:14px;border:1.5px solid var(--c-ligne)!important;font-weight:700}'
  +'.ldr-cmd-info{color:var(--c-ink2);font-size:14px;text-align:center;margin-top:12px}.ldr-cmd-err{color:var(--ldr-rouge,#E8836C);font-weight:700;margin-top:10px;text-align:center}'
  +'.ldr-cmd-mot{display:grid;gap:10px}.ldr-cmd-mot button{min-height:60px;border-radius:14px;border:1.5px solid var(--c-ligne)!important;font-weight:800;font-size:17px;text-align:left;padding:0 16px}'
  +'.ldr-cmd-etapes{list-style:none;padding:0;margin:14px 0 0}.ldr-cmd-etapes li{display:flex;gap:12px;align-items:center;padding:10px 0;color:var(--c-ink2);font-weight:700}.ldr-cmd-etapes li i{width:26px;height:26px;border-radius:50%;border:2px solid var(--c-ligne);display:grid;place-items:center;font-style:normal;font-size:14px;flex:none}.ldr-cmd-etapes li.ok{color:var(--c-ink)}.ldr-cmd-etapes li.ok i{background:var(--c-or);border-color:var(--c-or);color:var(--c-onor)}'
  +'.ldr-cmd-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:80;background:var(--c-ink);color:var(--c-nuit);font-weight:700;padding:10px 16px;border-radius:12px;max-width:90vw;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.4)}';
  D.head.appendChild(css);

  function toast(t){var o=q('.ldr-cmd-toast');if(o)o.remove();var d=D.createElement('div');d.className='ldr-cmd ldr-cmd-toast';d.setAttribute('role','status');d.textContent=t;D.body.appendChild(d);setTimeout(function(){d.remove();},2600);}

  /* ---------- feuille (bas de l'écran) ---------- */
  var F=null;
  function feuille(html,apres){fermer(true);var v=D.createElement('div');v.className='ldr-cmd ldr-cmd-voile';var f=D.createElement('div');f.className='ldr-cmd ldr-cmd-feuille';f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.innerHTML=html;
    D.body.appendChild(v);D.body.appendChild(f);F={v:v,f:f};v.onclick=function(){fermer();};
    requestAnimationFrame(function(){requestAnimationFrame(function(){v.classList.add('on');f.classList.add('on');});});if(apres)apres(f);}
  function fermer(vite){if(!F)return;var x=F;F=null;if(vite){x.v.remove();x.f.remove();return;}x.v.classList.remove('on');x.f.classList.remove('on');setTimeout(function(){x.v.remove();x.f.remove();},300);}
  D.addEventListener('keydown',function(e){if(e.key==='Escape')fermer();});

  /* ---------- barre du bas ---------- */
  var bar=null,suivi=lire(KS);
  function barre(){
    if(!TABLE||!enCarte()){if(bar){bar.remove();bar=null;D.body.classList.remove('ldr-cmd-on');}return;}
    if(!bar){bar=D.createElement('div');bar.className='ldr-cmd ldr-cmd-barre';D.body.appendChild(bar);D.body.classList.add('ldr-cmd-on');}
    var n=nb(),h='<button type="button" class="ldr-cmd-b ldr-cmd-appel" data-x="appel"><span>Appeler<small>Table '+TABLE+'</small></span></button>';
    if(suivi&&!n)h+='<button type="button" class="ldr-cmd-b ldr-cmd-suivi" data-x="suivi"><span class="ldr-cmd-pt"></span>'+esc(etapeTxt(suivi.st,suivi.genre))+'</button>';
    else h+='<button type="button" class="ldr-cmd-b ldr-cmd-pan" data-x="panier"'+(n?'':' disabled')+'><span>'+(n?'<em>'+n+'</em>Ma commande':'Touchez un article pour commander')+'</span><span>'+(n&&total()?eur(total()):'')+'</span></button>';
    bar.innerHTML=h;
  }
  D.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.ldr-cmd-barre [data-x]');if(!b)return;var x=b.dataset.x;
    if(x==='appel')appel();else if(x==='panier')voirPanier();else if(x==='suivi')voirSuivi();});

  /* ---------- « Ajouter à ma commande » dans la fiche de l'article ---------- */
  new MutationObserver(function(ms){ms.forEach(function(mu){
    [].forEach.call(mu.addedNodes,function(n){if(n.nodeType===1&&n.classList&&n.classList.contains('tiroir'))setTimeout(function(){greffe(n);},0);});
    [].forEach.call(mu.removedNodes,function(n){if(n.nodeType===1&&n.classList&&n.classList.contains('tiroir'))ficheFermee();});
    if(mu.target===D.body||mu.target.id==='app')barre();
  });}).observe(D.body,{childList:true,subtree:false});
  var appEl=q('#app');if(appEl)new MutationObserver(function(){barre();}).observe(appEl,{childList:true});
  function greffe(t){
    if(!TABLE||!fiche||!enCarte()||q('.ldr-cmd-add',t))return;var a=fiche.a;if(a.ep)return;
    var ch=[];if(a.col2&&(a.prix!=null||a.prix2!=null)){if(a.prix!=null)ch.push([a.col1||'Petit',a.prix]);if(a.prix2!=null)ch.push([a.col2,a.prix2]);}
    var sel=0,qte=1,d=D.createElement('div');d.className='ldr-cmd ldr-cmd-add';
    function px(){return ch.length?ch[sel][1]:a.prix;}
    function dessin(){d.innerHTML='<div class="t">Commander depuis la table '+TABLE+'</div>'
      +(ch.length>1?'<div class="ldr-cmd-ch">'+ch.map(function(c,i){return '<button type="button" data-c="'+i+'" aria-pressed="'+(i===sel)+'">'+esc(c[0])+' · '+eur(c[1])+'</button>';}).join('')+'</div>':'')
      +'<div class="ldr-cmd-l"><div class="ldr-cmd-q"><button type="button" data-q="-1" aria-label="Moins">−</button><b>'+qte+'</b><button type="button" data-q="1" aria-label="Plus">+</button></div>'
      +'<button type="button" class="ldr-cmd-go">Ajouter'+(px()!=null?' · '+eur(px()*qte):'')+'</button></div>';}
    dessin();
    d.addEventListener('click',function(e){var c=e.target.closest('[data-c]'),qq=e.target.closest('[data-q]'),go=e.target.closest('.ldr-cmd-go');
      if(c){sel=+c.dataset.c;dessin();}else if(qq){qte=Math.max(1,Math.min(12,qte+ +qq.dataset.q));dessin();}
      else if(go){ajouter(a,ch.length?ch[sel][0]:'',px(),qte);var f=q('[data-ferme]:not(.voile)',t)||q('[data-ferme]',t);if(f)f.click();else if(window.fermeTiroir)window.fermeTiroir();}});
    var ct=q('.ct',t);if(ct&&ct.nextSibling)t.insertBefore(d,ct.nextSibling);else t.appendChild(d);
  }

  /* ---------- voir et envoyer la commande ---------- */
  function voirPanier(){
    if(!panier.length)return;
    function html(){return '<h3>Ma commande</h3><p class="s">Table '+TABLE+' · on paie au bar, comme d\'habitude.</p>'
      +panier.map(function(x,i){return '<div class="ldr-cmd-it"><span class="n">'+esc(x.nom)+(x.choix?'<i>'+esc(x.choix)+'</i>':'')+'</span><div class="ldr-cmd-q"><button type="button" data-i="'+i+'" data-d="-1" aria-label="Moins">−</button><b>'+x.qte+'</b><button type="button" data-i="'+i+'" data-d="1" aria-label="Plus">+</button></div><span class="p">'+(x.prix!=null?eur(x.prix*x.qte):'')+'</span></div>';}).join('')
      +(total()?'<div class="ldr-cmd-tot"><span>Total</span><b>'+eur(total())+'</b></div>':'')
      +'<input class="ldr-cmd-note" maxlength="200" placeholder="Un mot pour le bar ? (sans glace, bien fraîche…)" value="'+esc(CFG._note||'')+'">'
      +'<button type="button" class="ldr-cmd-big" data-envoi>Envoyer au bar</button><button type="button" class="ldr-cmd-sec" data-plus>Ajouter autre chose</button><div class="ldr-cmd-err" role="alert"></div>';}
    feuille(html(),function(f){
      f.addEventListener('input',function(e){if(e.target.classList.contains('ldr-cmd-note'))CFG._note=e.target.value;});
      f.addEventListener('click',function(e){var b=e.target.closest('[data-d]');
        if(b){var x=panier[+b.dataset.i];x.qte+= +b.dataset.d;if(x.qte<=0)panier.splice(+b.dataset.i,1);sauver();if(!panier.length){fermer();return;}f.innerHTML=html();return;}
        if(e.target.closest('[data-plus]')){fermer();return;}
        var go=e.target.closest('[data-envoi]');if(!go||go.disabled)return;go.disabled=true;go.textContent='Envoi…';
        poste('/commande',{table:TABLE,note:CFG._note||'',items:panier.map(function(x){return {id:x.id,nom:x.nom,choix:x.choix,qte:x.qte,prix:x.prix};})}).then(function(d){
          if(!d.ok){q('.ldr-cmd-err',f).textContent=d.message||'Le bar ne répond pas. Faites-lui signe.';go.disabled=false;go.textContent='Envoyer au bar';return;}
          panier=[];CFG._note='';sauver();suivi={id:d.id,s:d.secret,st:0,genre:'commande',num:d.num};ecrire(KS,suivi);barre();voirSuivi();suivre();});
      });});
  }
  function poste(ch,o){return fetch(API+ch,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json();}).catch(function(){return {ok:false,message:'Pas de réseau. Faites signe au bar.'};});}

  function appel(){
    feuille('<h3>Appeler la serveuse</h3><p class="s">Table '+TABLE+'. Elle voit votre appel tout de suite sur la tablette du bar.</p><div class="ldr-cmd-mot">'
      +[['commander','Je veux commander'],['addition','L\'addition, s\'il vous plaît'],['question','J\'ai une question']].map(function(x){return '<button type="button" data-m="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div><div class="ldr-cmd-err" role="alert"></div>',function(f){
      f.addEventListener('click',function(e){var b=e.target.closest('[data-m]');if(!b||b.disabled)return;b.disabled=true;
        poste('/appel',{table:TABLE,motif:b.dataset.m}).then(function(d){
          if(!d.ok&&d.erreur!=='trop'){q('.ldr-cmd-err',f).textContent=d.message||'Le bar ne répond pas.';b.disabled=false;return;}
          if(d.ok){suivi={id:d.id,s:d.secret,st:0,genre:'appel'};ecrire(KS,suivi);suivre();}
          fermer();toast(d.ok?'C\'est envoyé : la serveuse arrive.':d.message);barre();});});});
  }
  function etapeTxt(st,g){if(g==='appel')return st>=1?'La serveuse arrive':'Appel envoyé au bar';return st>=2?'Servi, bonne dégustation !':st>=1?'Le bar prépare votre commande':'Commande reçue au bar';}
  function voirSuivi(){if(!suivi)return;var g=suivi.genre,st=suivi.st;
    var E=g==='appel'?[['Appel envoyé au bar',0],['La serveuse arrive',1]]:[['Commande reçue au bar',0],['Le bar la prépare',1],['Servie à votre table',2]];
    feuille('<h3>'+(g==='appel'?'Votre appel':'Votre commande'+(suivi.num?' n° '+suivi.num:''))+'</h3><p class="s">Table '+TABLE+(g==='appel'?'':' · on paie au bar, comme d\'habitude.')+'</p><ul class="ldr-cmd-etapes">'
      +E.map(function(x,i){return '<li class="'+(st>=x[1]?'ok':'')+'"><i>'+(st>=x[1]?'✓':i+1)+'</i>'+x[0]+'</li>';}).join('')+'</ul><button type="button" class="ldr-cmd-sec" data-ok>Revenir à la carte</button>',function(f){q('[data-ok]',f).onclick=function(){fermer();};});}
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
