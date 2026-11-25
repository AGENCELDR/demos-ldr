(function(w){
var COM=[{n:"Verdun",x:180,y:136,c:1},{n:"Vaucelle",x:74,y:62},{n:"Saint-Aubry",x:292,y:56},{n:"Marnière",x:58,y:160},{n:"Bois-Rosé",x:304,y:166},{n:"Les Hauts-Prés",x:104,y:236},{n:"Fontenoy",x:262,y:240}];
var NS="http://www.w3.org/2000/svg",com=COM[0];
(function(){var V=COM[0];COM.forEach(function(c,i){if(c.c)return;var mx=(V.x+c.x)/2,my=(V.y+c.y)/2,dx=c.x-V.x,dy=c.y-V.y,k=(i%2?1:-1)*.18;c.d="M"+V.x+" "+V.y+" Q"+(mx-dy*k).toFixed(1)+" "+(my+dx*k).toFixed(1)+" "+c.x+" "+c.y})})();
function carteSvg(){
 var r=1;function rnd(){r=(r*16807)%2147483647;return r/2147483647}
 function loin(x,y,m){return COM.every(function(c){return Math.hypot(c.x-x,c.y-y)>(c.c?46:m)})&&Math.abs(x-(140+ (y/270)*90))>16}
 function foret(cx,cy,n,R){var s="";for(var i=0;i<n;i++){var a=rnd()*6.283,d=Math.sqrt(rnd())*R,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.75;if(!loin(x,y,24))continue;var t=3.2+rnd()*2.4;
  s+='<circle cx="'+(x+.8).toFixed(1)+'" cy="'+(y+1.4).toFixed(1)+'" r="'+t.toFixed(1)+'" fill="#2F4A37" opacity=".25"/><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+t.toFixed(1)+'" fill="'+(rnd()<.5?"#5F7F5B":"#6F8F66")+'"/><circle cx="'+(x-t*.3).toFixed(1)+'" cy="'+(y-t*.35).toFixed(1)+'" r="'+(t*.38).toFixed(1)+'" fill="#93AD84"/>'}return s}
 function champ(x,y,w,h,a,f){return '<g transform="rotate('+a+' '+x+' '+y+')"><rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="3" fill="'+f+'"/><rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="3" fill="url(#cz-sillon)"/></g>'}
 function village(c){var s="",x=c.x,y=c.y;[[-9,2],[0,-3],[9,3]].forEach(function(o,i){var hx=x+o[0],hy=y+o[1];s+='<rect x="'+(hx-4)+'" y="'+(hy-2)+'" width="8" height="7" fill="#F4EBDD" stroke="#6B4F3A" stroke-width=".7"/><path d="M'+(hx-5.5)+' '+(hy-1.5)+'L'+hx+' '+(hy-7)+'L'+(hx+5.5)+' '+(hy-1.5)+'Z" fill="'+(i===1?"#A4553F":"#B8664C")+'" stroke="#6B4F3A" stroke-width=".7"/>'});
  return s+'<path d="M'+(x+1)+' '+(y-3)+'v-9l2-4 2 4v9z" fill="#E9DCC6" stroke="#6B4F3A" stroke-width=".7" class="cz-clocher"/>'}
 var s='<svg class="zone-svg cz" viewBox="0 0 360 280" role="img" aria-label="Carte illustrée de la zone de livraison : Verdun et six communes autour (communes fictives)">'+
 '<defs><pattern id="cz-sillon" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 2h4" stroke="#6B4F3A" stroke-width=".5" opacity=".25"/></pattern>'+
 '<filter id="cz-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .42 0 0 0 0 .31 0 0 0 0 .2 0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>'+
 '<radialGradient id="cz-vign" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#5A3E22" stop-opacity=".28"/></radialGradient></defs>'+
 '<rect width="360" height="280" rx="14" fill="#EAD9BC"/><rect width="360" height="280" rx="14" fill="#EAD9BC" filter="url(#cz-grain)"/>'+
 champ(118,108,34,22,-14,"#D9C48E")+champ(236,92,40,24,12,"#C9CF95")+champ(222,206,36,20,-8,"#D9C48E")+champ(70,112,30,18,20,"#C9CF95")+champ(150,226,30,20,6,"#C9CF95")+champ(318,112,26,30,-6,"#D9C48E")+
 /* Meuse : berge, eau, reflet */
 '<path d="M128 -6C146 46 150 92 170 124C192 160 206 186 214 220C220 246 230 266 236 290" fill="none" stroke="#B9D0CE" stroke-width="20" stroke-linecap="round" opacity=".55"/>'+
 '<path d="M128 -6C146 46 150 92 170 124C192 160 206 186 214 220C220 246 230 266 236 290" fill="none" stroke="#8DB3B7" stroke-width="11" stroke-linecap="round"/>'+
 '<path d="M128 -6C146 46 150 92 170 124C192 160 206 186 214 220C220 246 230 266 236 290" fill="none" stroke="#C7DEDD" stroke-width="2" stroke-dasharray="7 9" stroke-linecap="round"/>'+
 '<text x="124" y="36" class="cz-eau" transform="rotate(68 124 36)">la Meuse</text>'+
 /* forêts */
 foret(30,24,26,28)+foret(196,30,22,24)+foret(334,240,26,30)+foret(24,240,20,24)+foret(338,24,18,22)+foret(266,128,14,16)+foret(40,200,10,14)+
 /* zone livrée aujourd'hui : tracé à la main */
 '<path class="cz-zone" d="M30 70C40 22 120 14 182 20C250 26 336 18 340 74C344 120 336 150 342 192C348 250 300 270 236 270C170 270 96 274 56 258C14 240 18 192 22 150C26 116 24 96 30 70Z"/>'+
 /* routes */
 COM.filter(function(c){return !c.c}).map(function(c){return '<path d="'+c.d+'" class="cz-route-b"/><path d="'+c.d+'" class="cz-route"/>'}).join("")+
 '<path id="cz-trajet" class="cz-trajet" d=""/>'+
 /* villages */
 COM.filter(function(c){return !c.c}).map(village).join("")+
 /* Verdun : remparts, maisons, cathédrale */
 '<path d="M150 118l14-12 18 4 16-8 12 16-4 18 10 14-16 12-20-2-14 10-14-12 4-18-10-12z" fill="#E2CDA8" stroke="#6B4F3A" stroke-width="1" stroke-dasharray="3 2"/>'+
 [[-20,-8],[-10,-14],[12,-12],[22,-4],[-22,8],[20,12],[-8,16],[8,18]].map(function(o,i){var hx=180+o[0],hy=136+o[1];return '<rect x="'+(hx-4)+'" y="'+(hy-2)+'" width="8" height="7" fill="#F4EBDD" stroke="#6B4F3A" stroke-width=".7"/><path d="M'+(hx-5.5)+' '+(hy-1.5)+'L'+hx+' '+(hy-7)+'L'+(hx+5.5)+' '+(hy-1.5)+'Z" fill="'+(i%3?"#B8664C":"#A4553F")+'" stroke="#6B4F3A" stroke-width=".7"/>'}).join("")+
 '<g transform="translate(166 108)"><rect x="0" y="6" width="28" height="12" fill="#EFE3CF" stroke="#6B4F3A" stroke-width=".8"/><rect x="2" y="-6" width="7" height="12" fill="#EFE3CF" stroke="#6B4F3A" stroke-width=".8"/><rect x="19" y="-6" width="7" height="12" fill="#EFE3CF" stroke="#6B4F3A" stroke-width=".8"/><path d="M2 -6l3.5-6 3.5 6M19 -6l3.5-6 3.5 6" fill="#7E8C86" stroke="#6B4F3A" stroke-width=".8"/></g>'+
 /* rose des vents + cartouche */
 '<g transform="translate(330 252)" class="cz-rose"><circle r="13" fill="#F4EBDD" stroke="#6B4F3A" stroke-width=".8"/><path d="M0-11L3 0 0 11-3 0Z" fill="#3D5A45"/><path d="M-11 0L0-3 11 0 0 3Z" fill="#B99A6E"/><text y="-15" text-anchor="middle">N</text></g>'+
 '<g transform="translate(14 14)"><rect width="118" height="30" rx="4" fill="#F4EBDD" stroke="#6B4F3A" stroke-width=".8"/><rect x="2.5" y="2.5" width="113" height="25" rx="3" fill="none" stroke="#6B4F3A" stroke-width=".4"/><text x="59" y="13" text-anchor="middle" class="cz-cart1">Fleurs Arnelle</text><text x="59" y="23" text-anchor="middle" class="cz-cart2">tournée de l\u2019après-midi</text></g>'+
 '<rect width="360" height="280" rx="14" fill="url(#cz-vign)" pointer-events="none"/>'+
 '<g id="cz-camion" class="cz-camion" opacity="0"><rect x="-9" y="-6" width="12" height="9" rx="1.5" fill="#3D5A45"/><path d="M3-3h4l3 3v3H3z" fill="#2B4232"/><circle cx="-5" cy="4" r="2" fill="#233127"/><circle cx="6" cy="4" r="2" fill="#233127"/><path d="M-6-2.5c1.5-2 3.5-2 5 0" stroke="#EFD2CC" stroke-width="1.2" fill="none"/></g>'+
 '</svg>';return s}
var SV=null,TJ=null,CAM=null,camA=null;function monter(cont){cont.innerHTML=carteSvg();SV=cont.querySelector("svg");
COM.forEach(function(c){var g=document.createElementNS(NS,"g");g.setAttribute("class","zc");g.setAttribute("tabindex","0");g.setAttribute("role","button");g.setAttribute("aria-label",c.n);
 var hit=document.createElementNS(NS,"circle");hit.setAttribute("cx",c.x);hit.setAttribute("cy",c.y);hit.setAttribute("r",c.c?42:28);hit.setAttribute("fill","transparent");g.appendChild(hit);
 var halo=document.createElementNS(NS,"circle");halo.setAttribute("class","zc-halo");halo.setAttribute("cx",c.x);halo.setAttribute("cy",c.y);halo.setAttribute("r",c.c?34:20);g.appendChild(halo);
 var ly=c.c?c.y+42:c.y+22,w=c.n.length*(c.c?8.6:7)+18;
 var lab=document.createElementNS(NS,"rect");lab.setAttribute("class","zc-lab");lab.setAttribute("x",c.x-w/2);lab.setAttribute("y",ly-11);lab.setAttribute("width",w);lab.setAttribute("height",c.c?22:20);lab.setAttribute("rx",c.c?11:10);g.appendChild(lab);
 var t=document.createElementNS(NS,"text");t.setAttribute("class",c.c?"zc-v":"zc-t");t.setAttribute("x",c.x);t.setAttribute("y",ly+(c.c?1:0));t.textContent=c.n;g.appendChild(t);
 if(c.c){var pin=document.createElementNS(NS,"g");pin.setAttribute("class","zc-pin");pin.setAttribute("transform","translate("+(c.x+30)+" "+(c.y-34)+")");
  pin.innerHTML='<path d="M0 18C-9 8-12 3-12-3a12 12 0 0 1 24 0c0 6-3 11-12 21z" fill="#1E2B22"/><g fill="#EFD2CC"><circle cy="-8" r="3.2"/><circle cx="4.6" cy="-4.6" r="3.2"/><circle cy="-1.2" r="3.2"/><circle cx="-4.6" cy="-4.6" r="3.2"/></g><circle cy="-4.6" r="2.4" fill="#D8BF99"/>';
  g.appendChild(pin);var bt=document.createElementNS(NS,"text");bt.setAttribute("class","zc-bout");bt.setAttribute("x",c.x+30);bt.setAttribute("y",c.y-52);bt.textContent="la boutique";g.appendChild(bt)}
 g.addEventListener("click",function(){choisirCom(c)});g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();choisirCom(c)}});
 c.g=g;SV.appendChild(g)});
 TJ=SV.querySelector("#cz-trajet");CAM=SV.querySelector("#cz-camion");}

function trajet(c){if(camA)cancelAnimationFrame(camA);if(c.c){TJ.setAttribute("d","");CAM.setAttribute("opacity","0");return}
 TJ.setAttribute("d",c.d);var L=TJ.getTotalLength();TJ.style.strokeDasharray=L;TJ.style.strokeDashoffset=L;CAM.setAttribute("opacity","1");
 var t0=null,red=matchMedia("(prefers-reduced-motion: reduce)").matches,D=red?1:1400;
 function pas(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,p=TJ.getPointAtLength(L*e),p2=TJ.getPointAtLength(Math.min(L,L*e+1));
  TJ.style.strokeDashoffset=L*(1-e);CAM.setAttribute("transform","translate("+p.x.toFixed(1)+" "+p.y.toFixed(1)+")"+(p2.x<p.x?" scale(-1 1)":""));if(k<1)camA=requestAnimationFrame(pas)}
 camA=requestAnimationFrame(pas)}

function choisirCom(c){com=c;COM.forEach(function(x){x.g.setAttribute("class","zc"+(x===c?" on":""))});trajet(c);if(window.onCommune)window.onCommune(c)}

w.Carte={monter:monter,choisir:function(n){choisirCom(COM.filter(function(c){return c.n===n})[0]||COM[0])},COM:COM,get:function(){return com}};
})(window);
