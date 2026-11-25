// Aiguillage LDR (option « Double hébergement », 25/11/2026)
// Les QR et liens des clients pointent ICI, jamais directement vers GitHub.
// 1) on demande la page à GitHub Pages (hébergeur principal) ;
// 2) si GitHub ne répond pas (panne, lenteur > 4 s, erreur 5xx), on sert la dernière version gardée,
//    puis la copie de secours embarquée chez Cloudflare (dossier dist/, mise à jour à chaque déploiement).
// Aucune donnée client ici : seulement les pages publiques. Aucun secret.
const ORIGINE_DEFAUT = "https://agenceldr.github.io";
let ORIGINE = ORIGINE_DEFAUT;
const GARDE = 30 * 24 * 3600; // la dernière bonne version est gardée 30 jours

function marque(r, source) {
  const h = new Headers(r.headers);
  h.set("x-ldr-source", source);
  h.delete("set-cookie");
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
}

export default {
  async fetch(req, env, ctx) {
    ORIGINE = (env && env.ORIGINE_TEST) || ORIGINE_DEFAUT; // ORIGINE_TEST : seulement pour les essais en local
    const u = new URL(req.url);
    if (u.pathname === "/" || u.pathname === "") return Response.redirect(u.origin + "/demos-ldr/", 302);
    if (u.pathname === "/sante") return sante();
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Méthode non permise", { status: 405 });

    // clé de garde : le chemin sans les paramètres (table, clé du QR) → une seule copie par page
    const cle = new Request(u.origin + u.pathname, { method: "GET" });
    try {
      const r = await fetch(ORIGINE + u.pathname + u.search, {
        method: req.method,
        headers: { "accept": req.headers.get("accept") || "*/*" },
        redirect: "manual",
        signal: AbortSignal.timeout(4000),
        cf: { cacheTtl: 60 },
      });
      if (r.status < 500 && r.status !== 429) {
        if (r.status === 200 && req.method === "GET") {
          const g = new Headers(r.headers);
          g.set("cache-control", "public, max-age=" + GARDE);
          g.delete("set-cookie");
          ctx.waitUntil(caches.default.put(cle, new Response(r.clone().body, { status: 200, headers: g })));
        }
        if (r.status >= 300 && r.status < 400) {
          // GitHub redirige (ex. /beerman → /beerman/) : on garde l'utilisateur chez nous
          const loc = r.headers.get("location") || "";
          const h = new Headers(r.headers);
          if (loc.startsWith(ORIGINE)) h.set("location", u.origin + loc.slice(ORIGINE.length));
          return new Response(null, { status: r.status, headers: h });
        }
        return marque(r, "github");
      }
    } catch (e) { /* GitHub injoignable : on passe au secours */ }

    const garde = await caches.default.match(cle);
    if (garde) return marque(garde, "secours-recent");
    const copie = await env.ASSETS.fetch(req);
    return marque(copie, "secours-copie");
  },
};

async function sante() {
  let github = "ko";
  try {
    const r = await fetch(ORIGINE + "/demos-ldr/robots.txt", { signal: AbortSignal.timeout(4000), cf: { cacheTtl: 0 } });
    github = r.ok ? "ok" : "ko (" + r.status + ")";
  } catch (e) {}
  return new Response(JSON.stringify({ aiguillage: "ok", github, secours: "ok", heure: new Date().toISOString() }), {
    status: github === "ok" ? 200 : 503,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
