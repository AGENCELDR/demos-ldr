/* Studio Ambrine · en-tête, menu, pied de page et petits outils communs à toutes les pages */
(function (w, d) {
  var A = w.AMBRINE, PAGES = [["index.html", "Accueil"], ["prestations.html", "Prestations"], ["salon.html", "Le salon"], ["rdv.html", "Mon rendez-vous"], ["infos.html", "Infos"]];
  var ici = d.body.getAttribute("data-page") || "index.html";
  function h(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  function liens(cls) { return PAGES.map(function (p) { return '<a href="' + p[0] + '"' + (p[0] === ici ? ' aria-current="page"' : "") + (cls ? ' class="' + cls + '"' : "") + ">" + p[1] + "</a>" }).join("") }
  var appli = d.body.hasAttribute("data-appli");
  var haut = d.createElement("div"); if (!appli) {
  haut.innerHTML = '<p class="ex">Exemple · données fictives · site réalisé par l’Agence LDR</p>' +
    '<header class="tete"><a class="marque" href="index.html"><b>Studio Ambrine</b><small>COIFFURE · REIMS</small></a>' +
    '<nav aria-label="Pages">' + liens() + '<a class="go" href="reserver.html">Réserver</a></nav>' +
    '<button class="menu-b" type="button" aria-expanded="false">Menu</button></header>' +
    '<div class="tiroir" role="dialog" aria-label="Menu"><div><button class="fermer" type="button">Fermer ✕</button>' + liens() + '<a class="go" href="reserver.html">Prendre rendez-vous</a></div></div>';
  d.body.prepend.apply(d.body, Array.prototype.slice.call(haut.childNodes));
  var T = d.querySelector(".tiroir"), M = d.querySelector(".menu-b");
  function ouvrir(o) { T.classList.toggle("on", o); M.setAttribute("aria-expanded", o ? "true" : "false") }
  M.addEventListener("click", function () { ouvrir(true) });
  T.addEventListener("click", function (e) { if (e.target === T || e.target.classList.contains("fermer")) ouvrir(false) }); }
  if (!appli && !d.body.hasAttribute("data-sans-pied")) {
    var p = d.createElement("footer"); p.className = "pied";
    p.innerHTML = '<div class="w"><b>Studio Ambrine</b><span>' + A.adresse.rue + ", " + A.adresse.ville + ' · mardi au samedi</span><nav aria-label="Pages">' + liens() + '<a href="salon-appli.html">Appli du salon (exemple)</a></nav>' +
      '<span class="sig">Exemple · données fictives. Site réalisé par l’Agence LDR · Adeline Crombez (EI).</span></div>';
    d.body.appendChild(p);
  }
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function jour(s, court) { var x = API.dt(s), t = new Date(); t.setHours(0, 0, 0, 0); var e = Math.round((x - t) / 864e5);
    if (!court && e === 0) return "aujourd’hui"; if (!court && e === 1) return "demain";
    return JOURS[x.getDay()] + " " + x.getDate() + (court ? "" : " " + MOIS[x.getMonth()]) }
  function ouvertMaintenant() { var n = new Date(), hz = A.horaires[(n.getDay() + 6) % 7][1]; if (!hz) return false; var p = hz.split("-").map(function (x) { var y = x.split(":"); return +y[0] * 60 + +y[1] }), t = n.getHours() * 60 + n.getMinutes(); return t >= p[0] && t < p[1] }
  function photo(n) { return "photos/" + n }
  function resume(r) {
    var p = A.prestations[r.p], c = A.coiffeuses[r.c], o = r.etat === "propose" && r.prop ? r.prop : r;
    return { quoi: (p ? p.n : r.p) + ((r.x || []).length ? " + " + r.x.map(function (x) { return A.extras[x].n.toLowerCase() }).join(", ") : ""), qui: A.coiffeuses[o.c] ? A.coiffeuses[o.c].n : (c ? c.n : ""), quand: jour(o.date) + " à " + API.hm(o.t), date: o.date, t: o.t, c: o.c };
  }
  w.LDR = { h: h, jour: jour, ouvertMaintenant: ouvertMaintenant, photo: photo, resume: resume, param: function (k) { return new URLSearchParams(location.search).get(k) } };
})(window, document);
