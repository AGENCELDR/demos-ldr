# Aiguillage LDR (option « Double hébergement »)
Worker Cloudflare `ldr-secours` : les QR et liens des clients pointent vers lui. Il sert GitHub Pages ; si GitHub ne répond pas (4 s) ou renvoie une erreur 5xx, il sert la dernière version gardée, puis la copie embarquée (`dist/`).
- Test : `/sante` (200 = GitHub répond, 503 = bascule en cours).
- Déployer (depuis le PC de Lilian) : `python _secours/preparer.py` puis `npx wrangler deploy` dans `_secours/`. À refaire quand une page client change.
- Aucun secret. Les commandes et le tournoi du Beerman restent sur `beerman-commandes` ; si ce serveur tombe, la carte affiche « Commandez au bar » toute seule.
- Essais locaux : variable `ORIGINE_TEST` seulement.
