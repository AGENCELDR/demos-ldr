// Beerman : commande à table + appel serveuse + statistiques anonymes.
// Cloudflare Worker + un objet durable « Bar » (SQLite). Serveur séparé d'Uno.
// La carte (GitHub Pages) appelle /api/... ; la tablette du bar se connecte en direct sur /api/bar/direct.
import { DurableObject } from "cloudflare:workers";

const ST = { NOUVELLE: 0, PRISE: 1, SERVIE: 2, ANNULEE: 9 };
const EV_OK = new Set(["vue", "fiche", "lu", "ajout", "page", "commande", "appel", "visite"]);

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const err = (code, msg, s = 400) => json({ erreur: code, message: msg }, s);
const alea = (n = 24) => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, "0")).join("");
const txt = (s, n) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
function paris(t = Date.now()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", weekday: "short", hourCycle: "h23" })
    .formatToParts(new Date(t)).map(x => [x.type, x.value]));
  // la soirée continue jusqu'à 6 h du matin
  const h = +p.hour; let jour = `${p.year}-${p.month}-${p.day}`;
  if (h < 6) { const d = new Date(jour + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - 1); jour = d.toISOString().slice(0, 10); }
  return { jour, h, dow: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(p.weekday) };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS ? env.ASSETS.fetch(req) : new Response("Introuvable", { status: 404 });
    const origine = req.headers.get("Origin") || "";
    const permis = (env.SITE_ORIGINES || "*").split(",").map(s => s.trim());
    const cors = {
      "Access-Control-Allow-Origin": permis.includes("*") ? "*" : (permis.includes(origine) ? origine : permis[0]),
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type,authorization",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const stub = env.BAR.get(env.BAR.idFromName("beerman"));
    const h0 = new Headers(req.headers);
    h0.set("x-ip", req.headers.get("cf-connecting-ip") || "local");
    const r = await stub.fetch(new Request(req, { headers: h0 }));
    if (r.webSocket) return r;
    const h = new Headers(r.headers); for (const [k, v] of Object.entries(cors)) h.set(k, v);
    return new Response(r.body, { status: r.status, headers: h });
  },
};

export class Bar extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS cmd(id TEXT PRIMARY KEY, num INTEGER, jour TEXT, genre TEXT, tabl INTEGER, items TEXT, total REAL,
        note TEXT, st INTEGER, secret TEXT, cree INTEGER, maj INTEGER, qui TEXT);
      CREATE INDEX IF NOT EXISTS cmd_jour ON cmd(jour);
      CREATE TABLE IF NOT EXISTS stats(jour TEXT, h INTEGER, ev TEXT, cle TEXT, n INTEGER, PRIMARY KEY(jour, h, ev, cle));
      CREATE TABLE IF NOT EXISTS sessions(jeton TEXT PRIMARY KEY, exp INTEGER);
      CREATE TABLE IF NOT EXISTS limites(cle TEXT PRIMARY KEY, n INTEGER, fen INTEGER);
      CREATE TABLE IF NOT EXISTS reglages(k TEXT PRIMARY KEY, v TEXT);
      CREATE TABLE IF NOT EXISTS blocages(tabl INTEGER PRIMARY KEY, jusqua INTEGER, raison TEXT);
      CREATE TABLE IF NOT EXISTS bilan(jour TEXT, genre TEXT, n INTEGER, total REAL, att INTEGER, natt INTEGER, PRIMARY KEY(jour, genre));`);
    for (const c of ["raison TEXT", "alerte TEXT"]) { try { this.sql.exec("ALTER TABLE cmd ADD COLUMN " + c); } catch (_) {} }
  }
  // ménage (au plus une fois par heure, et par l'alarme même sans passage) :
  // au bout de 30 jours une commande est effacée (table, articles, mot pour le bar) ; il n'en reste qu'un total
  // anonyme par soirée pour les statistiques du patron. Les empreintes anti-abus sont effacées au bout d'une heure.
  purger(force) {
    const t = this.now();
    if (!force && this._menage && t - this._menage < 3600e3) return;
    this._menage = t;
    const lim = t - 30 * 864e5;
    this.sql.exec(`INSERT INTO bilan(jour,genre,n,total,att,natt)
      SELECT jour, genre, COUNT(*), COALESCE(SUM(total),0), COALESCE(SUM(CASE WHEN st=2 THEN maj-cree END),0), COUNT(CASE WHEN st=2 THEN 1 END)
      FROM cmd WHERE cree<? AND st<>9 GROUP BY jour, genre
      ON CONFLICT(jour,genre) DO UPDATE SET n=n+excluded.n, total=total+excluded.total, att=att+excluded.att, natt=natt+excluded.natt`, lim);
    this.sql.exec("DELETE FROM cmd WHERE cree<?", lim);
    this.sql.exec("DELETE FROM limites WHERE fen<?", t - 3600e3);
    // le ménage se relance tout seul 6 h plus tard, même si plus personne ne passe
    // (l'alarme ne se réarme elle-même que s'il reste quelque chose à effacer)
    try {
      const reste = this.sql.exec("SELECT (SELECT COUNT(*) FROM cmd)+(SELECT COUNT(*) FROM limites) n").toArray()[0].n;
      if (!force || reste) this.ctx.storage.setAlarm(t + 6 * 3600e3);
    } catch (_) {}
  }
  async alarm() { this.purger(true); }
  // l'adresse IP n'est jamais gardée : seulement une empreinte chiffrée, différente chaque jour, pour limiter les abus
  async empreinte(ip) {
    if (!this._kIp) this._kIp = await crypto.subtle.importKey("raw", new TextEncoder().encode("ip:" + (this.env.SECRET_QR || "beerman")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", this._kIp, new TextEncoder().encode(new Date(this.now()).toISOString().slice(0, 10) + "|" + ip)));
    return [...sig.slice(0, 8)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // une commande annulée ne compte plus dans les statistiques (et revient si on la remet « à prendre »)
  annulerStats(r, st) {
    if (r.genre !== "commande" || (r.st === 9) === (st === 9)) return;
    const P = paris(r.cree), sens = st === 9 ? -1 : 1;
    for (const x of JSON.parse(r.items || "[]")) this.sql.exec("UPDATE stats SET n=MAX(0,n+?) WHERE jour=? AND h=? AND ev='commande' AND cle=?", sens * x.qte, P.jour, P.h, x.nom);
  }
  // table bloquée par le bar ? (renvoie la fin du blocage, ou 0)
  bloquee(table) { const r = this.sql.exec("SELECT jusqua FROM blocages WHERE tabl=?", table).toArray()[0]; return r && r.jusqua > this.now() ? r.jusqua : 0; }
  blocages() { return this.sql.exec("SELECT tabl, jusqua, raison FROM blocages WHERE jusqua>? ORDER BY tabl", this.now()).toArray().map(r => ({ table: r.tabl, jusqua: r.jusqua, raison: r.raison })); }
  // clé du QR de chaque table : empêche de commander pour une table en tapant son numéro dans l'adresse
  async cle(table) {
    if (!this.env.SECRET_QR) return "";
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(this.env.SECRET_QR), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode("table-" + table)));
    return [...sig.slice(0, 4)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  async garde(table, corps, nbT) {
    if (!(table >= 1 && table <= nbT)) return err("table", "Numéro de table inconnu. Scannez le QR de votre table.");
    if (this.env.SECRET_QR && String(corps.k || "") !== await this.cle(table)) return err("qr", "Scannez le QR posé sur votre table pour commander.", 403);
    const b = this.bloquee(table);
    if (b) return err("bloquee", "Les commandes depuis cette table sont en pause. Faites signe au bar, on arrive.", 403);
    return null;
  }
  now() { return Date.now(); }
  reglage(k, def) { const r = this.sql.exec("SELECT v FROM reglages WHERE k=?", k).toArray()[0]; return r ? JSON.parse(r.v) : def; }
  regle(k, v) { this.sql.exec("INSERT OR REPLACE INTO reglages(k,v) VALUES(?,?)", k, JSON.stringify(v)); }
  // vrai si la limite est dépassée
  limite(cle, max, fenMs) {
    const t = this.now(), r = this.sql.exec("SELECT n,fen FROM limites WHERE cle=?", cle).toArray()[0];
    if (!r || t - r.fen > fenMs) { this.sql.exec("INSERT OR REPLACE INTO limites(cle,n,fen) VALUES(?,?,?)", cle, 1, t); return false; }
    if (r.n >= max) return true;
    this.sql.exec("UPDATE limites SET n=n+1 WHERE cle=?", cle); return false;
  }
  diffuser(msg) { const s = JSON.stringify(msg); for (const ws of this.ctx.getWebSockets()) { try { ws.send(s); } catch (_) {} } }
  session(req, url) {
    const a = req.headers.get("authorization") || "", j = a.startsWith("Bearer ") ? a.slice(7) : (url.searchParams.get("t") || "");
    if (!j) return false;
    const r = this.sql.exec("SELECT exp FROM sessions WHERE jeton=?", j).toArray()[0];
    return !!(r && r.exp > this.now());
  }
  ligne(r) { return { id: r.id, num: r.num, genre: r.genre, table: r.tabl, items: JSON.parse(r.items || "[]"), total: r.total, note: r.note, st: r.st, cree: r.cree, maj: r.maj, qui: r.qui, raison: r.raison || "", alerte: r.alerte || "" }; }
  ouvertes() {
    const jour = paris(this.now()).jour, limite = this.now() - 6 * 3600e3;
    return this.sql.exec("SELECT * FROM cmd WHERE (st IN (0,1) AND cree>?) OR (jour=? AND st=2 AND maj>?) ORDER BY cree ASC", limite, jour, this.now() - 20 * 60e3).toArray().map(r => this.ligne(r));
  }
  compter(jour, h, ev, cle, n = 1) {
    this.sql.exec("INSERT INTO stats(jour,h,ev,cle,n) VALUES(?,?,?,?,?) ON CONFLICT(jour,h,ev,cle) DO UPDATE SET n=n+excluded.n", jour, h, ev, cle, n);
  }

  async fetch(req) {
    const url = new URL(req.url), p = url.pathname, ip = await this.empreinte(req.headers.get("x-ip") || "?");
    this.purger();
    let corps = {};
    if (req.method === "POST") { try { const t = await req.text(); if (t.length > 20000) return err("gros", "Trop gros."); corps = t ? JSON.parse(t) : {}; } catch (_) { return err("json", "Demande illisible."); } }
    const nbT = Number(this.env.NB_TABLES || 30);
    const pause = this.reglage("pause", false);

    // ----- côté client -----
    if (p === "/api/etat" && req.method === "GET") return json({ ok: true, pause, nbTables: nbT });

    if (p === "/api/commande" && req.method === "POST") {
      if (pause) return err("pause", "Les commandes depuis la table sont coupées pour le moment. Passez au bar, on vous sert avec plaisir.", 403);
      const table = parseInt(corps.table, 10);
      const g = await this.garde(table, corps, nbT); if (g) return g;
      if (this.limite("c:" + ip, 6, 10 * 60e3) || this.limite("ct:" + table, 6, 10 * 60e3)) return err("trop", "Beaucoup de commandes d'un coup. Faites signe au bar.", 429);
      const items = (Array.isArray(corps.items) ? corps.items : []).slice(0, 25).map(x => ({ id: txt(x.id, 40), nom: txt(x.nom, 80), choix: txt(x.choix, 40), qte: Math.max(1, Math.min(12, parseInt(x.qte, 10) || 1)), prix: Number.isFinite(+x.prix) ? Math.max(0, Math.min(500, +x.prix)) : null })).filter(x => x.nom);
      if (!items.length) return err("vide", "Votre commande est vide.");
      const nbArt = items.reduce((s, x) => s + x.qte, 0);
      if (nbArt > 30) return err("gros", "Pour une grosse commande, passez au bar.");
      const total = Math.round(items.reduce((s, x) => s + (x.prix || 0) * x.qte, 0) * 100) / 100;
      const t = this.now(), P = paris(t);
      // commandes inhabituelles : elles arrivent marquées « à vérifier » sur la tablette
      const al = [];
      const avant = this.sql.exec("SELECT COUNT(*) n FROM cmd WHERE tabl=? AND cree>? AND st<>9", table, t - 3 * 3600e3).toArray()[0].n;
      if (!avant) al.push("1re commande de la table");
      if (nbArt >= 10 || total >= 80) al.push("grosse commande");
      const ouv = this.sql.exec("SELECT COUNT(*) n FROM cmd WHERE tabl=? AND st=0 AND genre='commande'", table).toArray()[0].n;
      if (ouv) al.push("déjà une commande en attente");
      const num = (this.sql.exec("SELECT COUNT(*) n FROM cmd WHERE jour=?", P.jour).toArray()[0].n || 0) + 1;
      const id = alea(8), secret = alea(12);
      this.sql.exec("INSERT INTO cmd(id,num,jour,genre,tabl,items,total,note,st,secret,cree,maj,qui,alerte) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        id, num, P.jour, "commande", table, JSON.stringify(items), total, txt(corps.note, 200), ST.NOUVELLE, secret, t, t, "", al.join(" · "));
      for (const x of items) this.compter(P.jour, P.h, "commande", x.nom, x.qte);
      const l = this.ligne(this.sql.exec("SELECT * FROM cmd WHERE id=?", id).toArray()[0]);
      this.diffuser({ type: "nouvelle", commande: l });
      return json({ ok: true, id, secret, num });
    }

    if (p === "/api/appel" && req.method === "POST") {
      const table = parseInt(corps.table, 10);
      const g = await this.garde(table, corps, nbT); if (g) return g;
      if (this.limite("a:" + table, 1, 90e3) || this.limite("ai:" + ip, 4, 10 * 60e3)) return err("trop", "C'est noté, la serveuse arrive.", 429);
      const t = this.now(), P = paris(t), id = alea(8), secret = alea(12);
      const motif = ["commander", "addition", "question"].includes(corps.motif) ? corps.motif : "commander";
      this.sql.exec("INSERT INTO cmd(id,num,jour,genre,tabl,items,total,note,st,secret,cree,maj,qui) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        id, 0, P.jour, "appel", table, "[]", 0, motif, ST.NOUVELLE, secret, t, t, "");
      this.compter(P.jour, P.h, "appel", motif);
      const l = this.ligne(this.sql.exec("SELECT * FROM cmd WHERE id=?", id).toArray()[0]);
      this.diffuser({ type: "nouvelle", commande: l });
      return json({ ok: true, id, secret });
    }

    if (p === "/api/suivi" && req.method === "GET") {
      const r = this.sql.exec("SELECT * FROM cmd WHERE id=? AND secret=?", url.searchParams.get("id") || "", url.searchParams.get("s") || "").toArray()[0];
      if (!r) return err("inconnu", "Commande introuvable.", 404);
      return json({ ok: true, st: r.st, num: r.num, genre: r.genre, qui: r.qui, raison: r.raison || "" });
    }

    // statistiques anonymes : pas de cookie, pas d'identifiant, juste des compteurs par heure
    if (p === "/api/stats" && req.method === "POST") {
      if (this.limite("s:" + ip, 40, 60e3)) return json({ ok: true });
      const P = paris(this.now());
      const evs = (Array.isArray(corps.ev) ? corps.ev : []).slice(0, 60);
      for (const e of evs) {
        if (!Array.isArray(e) || !EV_OK.has(e[0]) || e[0] === "commande" || e[0] === "appel") continue;
        this.compter(P.jour, P.h, e[0], txt(e[1], 60) || "-", 1);
      }
      return json({ ok: true });
    }

    // ----- côté bar (tablette + stats du patron) -----
    if (p === "/api/bar/entrer" && req.method === "POST") {
      if (this.limite("pin:" + ip, 8, 15 * 60e3)) return err("trop", "Trop d'essais. Attendez 15 minutes.", 429);
      if (!this.env.PIN_BAR || String(corps.pin || "") !== String(this.env.PIN_BAR)) return err("pin", "Code faux.", 401);
      const j = alea(24); this.sql.exec("INSERT INTO sessions(jeton,exp) VALUES(?,?)", j, this.now() + 90 * 864e5);
      this.sql.exec("DELETE FROM sessions WHERE exp<?", this.now());
      return json({ ok: true, jeton: j });
    }
    if (!p.startsWith("/api/bar/")) return err("route", "Introuvable.", 404);
    if (!this.session(req, url)) return err("session", "Code demandé.", 401);

    if (p === "/api/bar/direct") {
      if (req.headers.get("Upgrade") !== "websocket") return err("ws", "WebSocket attendu.", 426);
      const pair = new WebSocketPair();
      this.ctx.acceptWebSocket(pair[1]);
      pair[1].send(JSON.stringify({ type: "etat", commandes: this.ouvertes(), pause, blocages: this.blocages() }));
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (p === "/api/bar/liste" && req.method === "GET") return json({ ok: true, commandes: this.ouvertes(), pause, blocages: this.blocages() });
    if (p === "/api/bar/statut" && req.method === "POST") {
      const st = parseInt(corps.st, 10);
      if (![ST.NOUVELLE, ST.PRISE, ST.SERVIE, ST.ANNULEE].includes(st)) return err("st", "Statut inconnu.");
      const r = this.sql.exec("SELECT * FROM cmd WHERE id=?", corps.id || "").toArray()[0];
      if (!r) return err("inconnu", "Commande introuvable.", 404);
      this.sql.exec("UPDATE cmd SET st=?, maj=?, qui=?, raison=? WHERE id=?", st, this.now(), txt(corps.qui, 30) || r.qui, st === ST.ANNULEE ? txt(corps.raison, 80) : "", r.id);
      this.annulerStats(r, st);
      const l = this.ligne(this.sql.exec("SELECT * FROM cmd WHERE id=?", r.id).toArray()[0]);
      this.diffuser({ type: "maj", commande: l });
      return json({ ok: true, commande: l });
    }
    // bloquer une table : minutes = 0 pour débloquer ; les commandes en attente de la table sont annulées
    if (p === "/api/bar/bloquer" && req.method === "POST") {
      const table = parseInt(corps.table, 10), min = Math.max(0, Math.min(720, parseInt(corps.minutes, 10) || 0));
      if (!(table >= 1 && table <= nbT)) return err("table", "Table inconnue.");
      if (!min) this.sql.exec("DELETE FROM blocages WHERE tabl=?", table);
      else {
        this.sql.exec("INSERT OR REPLACE INTO blocages(tabl,jusqua,raison) VALUES(?,?,?)", table, this.now() + min * 60e3, txt(corps.raison, 80));
        if (corps.annuler) for (const r of this.sql.exec("SELECT id FROM cmd WHERE tabl=? AND st=0", table).toArray()) {
          const avant = this.sql.exec("SELECT * FROM cmd WHERE id=?", r.id).toArray()[0];
          this.sql.exec("UPDATE cmd SET st=9, maj=?, raison=? WHERE id=?", this.now(), "Commandes de la table mises en pause par le bar", r.id);
          this.annulerStats(avant, 9);
          this.diffuser({ type: "maj", commande: this.ligne(this.sql.exec("SELECT * FROM cmd WHERE id=?", r.id).toArray()[0]) });
        }
      }
      const b = this.blocages(); this.diffuser({ type: "blocages", blocages: b });
      return json({ ok: true, blocages: b });
    }
    // liens QR des tables (avec leur clé), pour imprimer ou graver
    if (p === "/api/bar/qr" && req.method === "GET") {
      const out = []; for (let i = 1; i <= nbT; i++) out.push({ table: i, k: await this.cle(i) });
      return json({ ok: true, tables: out });
    }
    // remise à zéro avant la vraie mise en service : efface commandes d'essai et statistiques
    if (p === "/api/bar/remise-a-zero" && req.method === "POST") {
      if (corps.confirme !== "OUI") return err("confirme", "Confirmation manquante.");
      this.sql.exec("DELETE FROM cmd"); this.sql.exec("DELETE FROM stats"); this.sql.exec("DELETE FROM limites"); this.sql.exec("DELETE FROM bilan");
      this.diffuser({ type: "etat", commandes: [], pause: this.reglage("pause", false), blocages: this.blocages() });
      return json({ ok: true });
    }
    if (p === "/api/bar/pause" && req.method === "POST") {
      this.regle("pause", !!corps.pause); this.diffuser({ type: "pause", pause: !!corps.pause });
      return json({ ok: true, pause: !!corps.pause });
    }
    if (p === "/api/bar/stats" && req.method === "GET") {
      const jours = Math.max(1, Math.min(365, parseInt(url.searchParams.get("jours"), 10) || 30));
      const d = new Date(paris(this.now()).jour + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - (jours - 1));
      const depuis = d.toISOString().slice(0, 10);
      const parCle = this.sql.exec("SELECT ev, cle, SUM(n) n FROM stats WHERE jour>=? GROUP BY ev, cle", depuis).toArray();
      const parHeure = this.sql.exec("SELECT ev, h, SUM(n) n FROM stats WHERE jour>=? GROUP BY ev, h", depuis).toArray();
      const parJour = this.sql.exec("SELECT ev, jour, SUM(n) n FROM stats WHERE jour>=? GROUP BY ev, jour", depuis).toArray();
      const tot = {};
      for (const r of this.sql.exec("SELECT genre, COUNT(*) n, COALESCE(SUM(total),0) total, COALESCE(SUM(CASE WHEN st=2 THEN maj-cree END),0) att, COUNT(CASE WHEN st=2 THEN 1 END) natt FROM cmd WHERE jour>=? AND st<>9 GROUP BY genre", depuis).toArray()
        .concat(this.sql.exec("SELECT genre, SUM(n) n, SUM(total) total, SUM(att) att, SUM(natt) natt FROM bilan WHERE jour>=? GROUP BY genre", depuis).toArray())) {
        const x = tot[r.genre] || (tot[r.genre] = { genre: r.genre, n: 0, total: 0, att: 0, natt: 0 });
        x.n += r.n; x.total += r.total; x.att += r.att; x.natt += r.natt;
      }
      const cmd = Object.values(tot).map(x => ({ genre: x.genre, n: x.n, total: Math.round(x.total * 100) / 100, attente: x.natt ? x.att / x.natt : null }));
      return json({ ok: true, depuis, jours, parCle, parHeure, parJour, cmd });
    }
    return err("route", "Introuvable.", 404);
  }
  webSocketMessage(ws, m) { if (m === "ping") ws.send("pong"); }
  webSocketClose(ws, code) { try { ws.close(code, "fin"); } catch (_) {} }
}
