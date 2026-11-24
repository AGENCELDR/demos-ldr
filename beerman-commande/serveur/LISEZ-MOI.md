# Beerman · commande à table (serveur)

Serveur **séparé d'Uno** (nom `beerman-commandes`, son propre stockage). Rien d'Uno n'est utilisé ni modifié.

- `src/index.js` : commandes depuis la table, appel de la serveuse, statistiques anonymes (sans cookie).
- `public/index.html` : tablette du bar (pop-up + sonnerie, la plus ancienne en haut).
- `public/stats.html` : « Ce qui marche », les statistiques du patron (`stats.html?demo=1` = exemple).

Mise en ligne (une fois) : `npm install`, `npx wrangler login`, `npx wrangler secret put PIN_BAR`, `npx wrangler secret put SECRET_QR`, `npx wrangler deploy`.
Ensuite : `python3 ../brancher.py ../../beerman-apercu ../carte <adresse>/api` refait la carte branchée.

Garde-fous : chaque QR de table porte une clé (`?table=7&k=…`, liste via `/api/bar/qr`) ; la tablette annule avec une raison (le client la voit) et bloque une table 15 min, 1 h ou la soirée ; commandes inhabituelles marquées « À vérifier » ; limites de fréquence par téléphone et par table ; bouton pour couper toutes les commandes à table.
