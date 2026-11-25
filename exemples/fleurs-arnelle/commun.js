/* Fleurs Arnelle · en-tête, menu, pied et petits outils communs */
(function (w, d) {
  var A = w.ARNELLE, PAGES = [["index.html", "Accueil"], ["commander.html", "Commander"], ["ateliers.html", "Ateliers"], ["abonnement.html", "Abonnement"], ["evenements.html", "Deuil et mariage"], ["dates.html", "Mes dates"], ["suivi.html", "Ma commande"], ["infos.html", "Infos"]];
  var ici = d.body.getAttribute("data-page") || "index.html", appli = d.body.hasAttribute("data-appli");
  function h(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  function liens(pc) { return PAGES.filter(function (p) { return !pc || p[0] !== "dates.html" }).map(function (p) { return '<a href="' + p[0] + '"' + (p[0] === ici ? ' aria-current="page"' : "") + ">" + p[1] + "</a>" }).join("") }
  if (!appli) {
    var haut = d.createElement("div");
    haut.innerHTML = '<p class="ex">Exemple · données fictives · site réalisé par l’Agence LDR</p>' +
      '<header class="tete"><a class="marque" href="index.html"><b>Fleurs Arnelle</b><small>FLEURISTE · VERDUN</small></a><nav aria-label="Pages">' + liens(1).replace(/<a href="index.html"[^>]*>Accueil<\/a>/, "") + '</nav><button class="menu-b" type="button" aria-expanded="false">Menu</button></header>' +
      '<div class="tiroir" role="dialog" aria-label="Menu"><div><button class="fermer" type="button">Fermer ✕</button>' + liens() + '</div></div>';
    d.body.prepend.apply(d.body, Array.prototype.slice.call(haut.childNodes));
    var T = d.querySelector(".tiroir"), M = d.querySelector(".menu-b");
    function ouvrir(o) { T.classList.toggle("on", o); M.setAttribute("aria-expanded", o ? "true" : "false") }
    M.addEventListener("click", function () { ouvrir(true) });
    T.addEventListener("click", function (e) { if (e.target === T || e.target.classList.contains("fermer")) ouvrir(false) });
    if (!d.body.hasAttribute("data-sans-pied")) {
      var p = d.createElement("footer"); p.className = "pied";
      p.innerHTML = '<div class="w"><b>Fleurs Arnelle</b><span>' + A.adresse.rue + ", " + A.adresse.ville + ' · mardi au samedi</span><nav aria-label="Pages">' + liens() + '<a href="fleuriste-appli.html">Appli du fleuriste (exemple)</a></nav><span class="sig">Exemple · données fictives, communes inventées. Site réalisé par l’Agence LDR · Adeline Crombez (EI).</span></div>';
      d.body.appendChild(p);
    }
  }
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function jour(s, court) { var x = API.dt(s), t = new Date(); t.setHours(0, 0, 0, 0); var e = Math.round((x - t) / 864e5); if (!court && e === 0) return "aujourd’hui"; if (!court && e === 1) return "demain"; return JOURS[x.getDay()] + " " + x.getDate() + (court ? "" : " " + MOIS[x.getMonth()]) }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1) }
  function nom(liste, id) { var r = liste.filter(function (x) { return x[0] === id })[0]; return r ? r[1] : id }
  function resumeBq(r) { return "Bouquet " + nom(A.styles, r.style).toLowerCase() + ", " + nom(A.tailles, r.taille).toLowerCase() + " · " + (r.occasion || "") }
  w.LDR = { h: h, jour: jour, cap: cap, nom: nom, resumeBq: resumeBq, param: function (k) { return new URLSearchParams(location.search).get(k) }, MOIS: MOIS, MC: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."] };
})(window, document);
