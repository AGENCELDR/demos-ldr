/* Studio Ambrine · « serveur » du site.
   Ici : stocké sur l'appareil (localStorage) pour que le site et l'appli du salon partagent les mêmes rendez-vous.
   En vrai : les mêmes fonctions parlent au serveur de l'agence (Cloudflare), rien d'autre ne change. */
(function (w) {
  var D = w.AMBRINE, CLE = "ambrine-v2", MES = "ambrine-mes", JK = [null, null, "mar", "mer", "jeu", "ven", "sam"];
  var ETATS = { envoye: "Envoyée", vu: "Vue par le salon", confirme: "Confirmée", propose: "Autre heure proposée", refuse: "Refusée", annule: "Annulée" };
  var memo = null;
  function lire() { try { memo = JSON.parse(localStorage.getItem(CLE) || "null") } catch (e) {} if (!memo || !memo.rdv) memo = { rdv: [], bloc: [], dem: [], seme: [] }; return memo }
  function ecrire(s) { memo = s; try { localStorage.setItem(CLE, JSON.stringify(s)) } catch (e) {} vu = JSON.stringify(s); bus.forEach(function (f) { try { f(s) } catch (e) {} }) }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) }
  function dt(s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]) }
  function cle(s) { return JK[dt(s).getDay()] }
  function hm(t) { var h = Math.floor(t / 60), m = t % 60; return h + " h" + (m ? " " + ("0" + m).slice(-2) : "") }
  function dur(m) { return m < 60 ? m + " min" : hm(m) }
  function plages(c, k) { var s = (D.coiffeuses[c].l[k] || ""); return s ? s.split(",").map(function (p) { var a = p.split("-").map(function (x) { var y = x.split(":"); return +y[0] * 60 + +y[1] }); return a }) : [] }
  function maintenant() { var n = new Date(); return { iso: iso(n), t: n.getHours() * 60 + n.getMinutes() } }
  /* jours ouverts à venir (mardi → samedi) */
  function jours(n) { var r = [], d = new Date(); d.setHours(0, 0, 0, 0); while (r.length < n) { if (JK[d.getDay()]) r.push({ iso: iso(d), k: JK[d.getDay()], d: new Date(d) }); d.setDate(d.getDate() + 1) } return r }
  function duree(s) {
    var p = D.prestations[s.p] || { min: 45 }, m = p.min, g = D.options.gamme.choix.filter(function (x) { return x.id === s.gamme })[0];
    if (g) m += g.min || 0;
    (s.x || []).forEach(function (x) { if (D.extras[x]) m += D.extras[x].min });
    if (s.rythme && D.rythmes[s.rythme]) m += D.rythmes[s.rythme].min;
    (s.plusieurs || []).forEach(function (k) { m += D.plusieurs[k].min });
    return Math.max(30, Math.ceil(m / 15) * 15);
  }
  function actif(r) { return r.type === "rdv" && r.etat !== "refuse" && r.etat !== "annule" }
  function occupe(s, c, j, t, d, sauf) {
    if (s.bloc.some(function (b) { return b.c === c && b.date === j && t < b.t + 30 && b.t < t + d })) return true;
    return s.rdv.some(function (r) { if (!actif(r) || r.id === sauf) return false; var o = r.etat === "propose" && r.prop ? r.prop : r; return o.c === c && o.date === j && t < o.t + r.D && o.t < t + d });
  }
  /* rendez-vous d'exemple déjà pris, pour que le planning ressemble à une vraie semaine */
  var NOMS = ["Sophie", "Julie", "Nadia", "Claire", "Emma", "Lucas", "Sarah", "Hugo", "Manon", "Léa", "Chloé", "Yanis"];
  function semer(s) {
    jours(12).forEach(function (j, ij) {
      if (s.seme.indexOf(j.iso) >= 0) return; s.seme.push(j.iso);
      Object.keys(D.coiffeuses).forEach(function (c, ic) {
        plages(c, j.k).forEach(function (pl) {
          for (var t = pl[0]; t <= pl[1]; t += 30) {
            var k = t / 30, h = (k * 7 + ic * 13 + ij * 5 + j.d.getDate() * 3) % 10, p = D.coiffeuses[c].fait[(k + ij) % D.coiffeuses[c].fait.length], dd = p === "coupe" ? 30 : 60;
            if (h < 3 && !occupe(s, c, j.iso, t, dd)) {
              s.rdv.push({ id: "EX-" + j.iso.slice(5).replace("-", "") + t + c[0], type: "rdv", fictif: true, etat: "confirme", p: p, c: c, date: j.iso, t: t, D: dd, prenom: NOMS[(t + ic + ij) % NOMS.length], place: [1, 2, 3, 4][(t / 30 + ic) % 4], cree: 0, hist: [] }) }
          }
        });
      });
    });
    s.seme = s.seme.filter(function (x) { return x >= jours(1)[0].iso });
    s.rdv = s.rdv.filter(function (r) { return !r.fictif || r.date >= iso(new Date()) });
  }
  function etat() { var s = lire(); var n = s.seme.length; semer(s); if (s.seme.length !== n) ecrire(s); return s }
  /* créneaux libres : [{t, c}] ; c vide = « peu importe » */
  function libres(c, j, d, sauf, p) {
    var s = etat(), now = maintenant(), k = cle(j), out = {}, liste = c ? [c] : Object.keys(D.coiffeuses).filter(function (x) { return !p || D.coiffeuses[x].fait.indexOf(p) >= 0 });
    liste.forEach(function (ci) {
      plages(ci, k).forEach(function (pl) {
        for (var t = pl[0]; t <= pl[1]; t += 30) {
          if (j === now.iso && t <= now.t + 30) continue;
          if (!out[t] && !occupe(s, ci, j, t, d, sauf)) out[t] = ci;
        }
      });
    });
    return Object.keys(out).map(Number).sort(function (a, b) { return a - b }).map(function (t) { return { t: t, c: out[t] } });
  }
  function creux(j, t) { return D.creuses.jours.indexOf(cle(j)) >= 0 && t < D.creuses.avant }
  function placesPrises(j, t, d, sauf) {
    var s = etat(); return s.rdv.filter(function (r) { var o = r.etat === "propose" && r.prop ? r.prop : r; return actif(r) && r.id !== sauf && o.date === j && t < o.t + r.D && o.t < t + d && r.place }).map(function (r) { return r.place });
  }
  function nouveau(p) { return p + "-" + String(1000 + Math.floor(Math.random() * 9000)) }
  function mes() { try { return JSON.parse(localStorage.getItem(MES) || "[]") } catch (e) { return [] } }
  function garder(id) { var m = mes(); if (m.indexOf(id) < 0) m.unshift(id); try { localStorage.setItem(MES, JSON.stringify(m)) } catch (e) {} }
  function envoyer(r) {
    var s = etat(); r.id = nouveau(D.prefixe); r.type = r.type || "rdv"; r.etat = "envoye"; r.cree = Date.now(); r.hist = [{ e: "envoye", at: r.cree }];
    s.rdv.push(r); ecrire(s); garder(r.id); return r.id;
  }
  function demande(type, data) { var s = etat(), r = { id: nouveau(type === "cadeau" ? "CC" : type === "mariee" ? "MA" : type === "attente" ? "LA" : "MS"), type: type, etat: "envoye", cree: Date.now(), hist: [{ e: "envoye", at: Date.now() }] }; for (var k in data) r[k] = data[k]; s.rdv.push(r); ecrire(s); garder(r.id); return r.id }
  function un(id) { return etat().rdv.filter(function (r) { return r.id === id })[0] }
  function maj(id, patch) { var s = etat(), r = s.rdv.filter(function (x) { return x.id === id })[0]; if (!r) return; for (var k in patch) r[k] = patch[k]; if (patch.etat) r.hist.push({ e: patch.etat, at: Date.now() }); r.maj = Date.now(); ecrire(s); return r }
  function bloquer(c, j, t) { var s = etat(), i = -1; s.bloc.forEach(function (b, k) { if (b.c === c && b.date === j && b.t === t) i = k }); if (i >= 0) s.bloc.splice(i, 1); else s.bloc.push({ c: c, date: j, t: t }); ecrire(s); return i < 0 }
  function net(t) { return String(t || "").replace(/\D/g, "").replace(/^33/, "0") }
  function parTel(tel) { var n = net(tel); return etat().rdv.filter(function (r) { return !r.fictif && net(r.tel) === n }) }
  /* écoute : un autre onglet (storage) ou le même onglet (vérification régulière) */
  var bus = [], vu = "";
  function ecouter(f) { bus.push(f); if (bus.length > 1) return;
    w.addEventListener("storage", function (e) { if (e.key === CLE) { memo = null; var s = lire(); vu = JSON.stringify(s); bus.forEach(function (g) { g(s) }) } });
    setInterval(function () { var t = ""; try { t = localStorage.getItem(CLE) || "" } catch (e) {} if (t && t !== vu) { vu = t; memo = null; var s = lire(); bus.forEach(function (g) { g(s) }) } }, 1500);
  }
  w.API = { jours: jours, duree: duree, libres: libres, creux: creux, placesPrises: placesPrises, envoyer: envoyer, demande: demande, un: un, maj: maj, bloquer: bloquer, parTel: parTel, mes: mes, garder: garder,
    tous: function () { return etat().rdv }, blocs: function () { return etat().bloc }, ecouter: ecouter, hm: hm, dur: dur, iso: iso, dt: dt, cle: cle, ETATS: ETATS, plages: plages, occupe: function (c, j, t, d) { return occupe(etat(), c, j, t, d) } };
})(window);
