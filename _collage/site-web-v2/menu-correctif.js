(function(){
var ACC="https://www.agence-ldr.fr/e8a3647b";
function menu(){[].forEach.call(document.querySelectorAll('a[href^="mailto:"]'),function(a){a.setAttribute("href","#devis");a.removeAttribute("aria-label");var sm=a.querySelector("small");if(sm)sm.textContent="Votre demande en 2 minutes"});
 [].forEach.call(document.querySelectorAll('a[href]'),function(a){var h=a.getAttribute("href");if(h===ACC+"#devis"||h==="/e8a3647b#devis")a.setAttribute("href","#devis");if(/#cgv$/.test(h))a.setAttribute("href","https://www.agence-ldr.fr/19b5caee");if(/#mentions-legales$/.test(h))a.setAttribute("href","https://www.agence-ldr.fr/9c71372a")})}
menu();setTimeout(menu,800);setTimeout(menu,2500);
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="mailto:"],a.ldr-nav-ecrire,a.ldr-mega-ecrire,a.ldr-p-ecrire,a.ldr-callbar-appel');if(a){e.preventDefault();e.stopPropagation();var d=document.getElementById("devis");if(d)d.scrollIntoView({behavior:"smooth"})}},true);
function route(){var h=location.hash;if(h==="#cgv")location.replace("https://www.agence-ldr.fr/19b5caee");if(h==="#mentions-legales")location.replace("https://www.agence-ldr.fr/9c71372a")}
route();window.addEventListener("hashchange",route);
})();
