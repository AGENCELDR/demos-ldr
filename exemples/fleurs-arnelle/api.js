/* Fleurs Arnelle · « serveur » du site (stocké sur l'appareil pour l'exemple ; en vrai, le serveur de l'agence). */
(function (w) {
  var D = w.ARNELLE, CLE = "arnelle-v1", MES = "arnelle-mes", memo = null, vu = "", bus = [];
  var ETATS = { envoye: "Envoyée", vu: "Vue par Arnelle", prepa: "En préparation", photo: "Photo envoyée", tournee: "En tournée", livree: "Livrée", confirme: "Confirmée", repondu: "Réponse d’Arnelle", refuse: "Refusée", annule: "Annulée" };
  function lire() { try { memo = JSON.parse(localStorage.getItem(CLE) || "null") } catch (e) {} if (!memo || !memo.l) memo = { l: [] }; return memo }
  function ecrire(s) { memo = s; try { localStorage.setItem(CLE, JSON.stringify(s)) } catch (e) {} vu = JSON.stringify(s); bus.forEach(function (f) { try { f(s) } catch (e) {} }) }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) }
  function dt(s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]) }
  function auj() { var d = new Date(); d.setHours(0, 0, 0, 0); return d }
  function apres11() { return new Date().getHours() >= D.seuil }
  /* jours de livraison : aujourd'hui (avant 11 h), puis les 3 prochains jours ouverts */
  function jours() { var r = [], d = auj(), k = 0; while (r.length < 4 && k < 14) { if (D.ouvert.indexOf(d.getDay()) >= 0) r.push({ iso: iso(d), d: new Date(d), auj: k === 0, tard: k === 0 && apres11() }); d.setDate(d.getDate() + 1); k++ } return r }
  function prochains(js, n) { var r = [], d = auj(); d.setDate(d.getDate() + 1); while (r.length < n) { if (js.indexOf(d.getDay()) >= 0) r.push(iso(d)); d.setDate(d.getDate() + 1) } return r }
  function semer(s) {
    if (s.seme) return; s.seme = 1;
    var j = jours().filter(function (x) { return !x.tard })[0];
    [["Hélène", "Un bouquet champêtre, moyen", "Vaucelle", "debut"], ["Marc", "Un bouquet rose poudré, petit", "Saint-Aubry", "fin"]].forEach(function (x, i) {
      s.l.push({ id: "EX-" + (i + 1), type: "commande", fictif: 1, etat: "prepa", prenom: x[0], resume: x[1], commune: x[2], jour: j ? j.iso : iso(auj()), moment: x[3], cree: 0, hist: [] }) });
  }
  function etat() { var s = lire(); if (!s.seme) { semer(s); ecrire(s) } return s }
  function nouveau(p) { return p + "-" + String(1000 + Math.floor(Math.random() * 9000)) }
  function mes() { try { return JSON.parse(localStorage.getItem(MES) || "[]") } catch (e) { return [] } }
  function garder(id) { var m = mes(); if (m.indexOf(id) < 0) m.unshift(id); try { localStorage.setItem(MES, JSON.stringify(m)) } catch (e) {} }
  function creer(type, data) { var s = etat(), r = { id: nouveau({ commande: D.prefixe, atelier: "AT", abo: "AB", devis: "DV", message: "MS", date: "DT" }[type] || "X"), type: type, etat: "envoye", cree: Date.now(), hist: [{ e: "envoye", at: Date.now() }] };
    for (var k in data) r[k] = data[k]; s.l.push(r); ecrire(s); garder(r.id); return r.id }
  function un(id) { return etat().l.filter(function (r) { return r.id === id })[0] }
  function maj(id, p) { var s = etat(), r = s.l.filter(function (x) { return x.id === id })[0]; if (!r) return; for (var k in p) r[k] = p[k]; if (p.etat) r.hist.push({ e: p.etat, at: Date.now() }); r.maj = Date.now(); ecrire(s); return r }
  function places(a, d) { var n = D.placesAtelier - (a.pris[a.sess.indexOf(d)] || 0); etat().l.forEach(function (r) { if (r.type === "atelier" && r.at === a.id && r.date === d && r.etat !== "annule" && r.etat !== "refuse") n -= (r.n || 1) }); return Math.max(0, n) }
  function ecouter(f) { bus.push(f); if (bus.length > 1) return;
    w.addEventListener("storage", function (e) { if (e.key === CLE) { memo = null; var s = lire(); vu = JSON.stringify(s); bus.forEach(function (g) { g(s) }) } });
    setInterval(function () { var t = ""; try { t = localStorage.getItem(CLE) || "" } catch (e) {} if (t && t !== vu) { vu = t; memo = null; var s = lire(); bus.forEach(function (g) { g(s) }) } }, 1500) }
  D.ateliers.forEach(function (a) { a.sess = prochains(a.js, 3) });
  function net(t) { return String(t || "").replace(/\D/g, "") }
  w.API = { ETATS: ETATS, jours: jours, creer: creer, un: un, maj: maj, tous: function () { return etat().l }, mes: mes, garder: garder, places: places, ecouter: ecouter, iso: iso, dt: dt, apres11: apres11,
    parTel: function (t) { return etat().l.filter(function (r) { return !r.fictif && net(r.tel) === net(t) }) } };
})(window);
