#!/usr/bin/env python3
"""Branche la commande à table sur une carte QR existante, SANS la modifier :
copie le dossier de la carte vers un nouveau dossier et ajoute 2 lignes avant </body>.
Usage : python3 brancher.py <dossier_carte> <dossier_sortie> <adresse_api> [mentions.json]
        mentions.json = identité légale de l'établissement (editeur, siret, tva, responsable), ex. mentions-beerman.json
Ex.   : python3 brancher.py demos-ldr/beerman-apercu demos-ldr/beerman-commande https://beerman-commandes.xxx.workers.dev/api"""
import sys, shutil, pathlib, json
src, dst, api = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), sys.argv[3]
ici = pathlib.Path(__file__).parent
if dst.exists(): shutil.rmtree(dst)
shutil.copytree(src, dst)
shutil.copy(ici / "commande-table.js", dst / "commande-table.js")
cfg = {"api": api}
if len(sys.argv) > 4: cfg["mentions"] = json.loads(pathlib.Path(sys.argv[4]).read_text(encoding="utf-8"))
else: print("Attention : sans fichier de mentions, la fiche « Mentions légales » n'aura pas l'identité de l'établissement.")
tag = '<script>window.LDR_COMMANDE=' + json.dumps(cfg, ensure_ascii=False).replace('</', '<\\/') + ';</script><script src="commande-table.js"></script>'
p = dst / "index.html"; s = p.read_text(encoding="utf-8")
assert "</body>" in s or "</html>" in s
s = s.replace("</body>", tag + "</body>", 1) if "</body>" in s else s.replace("</html>", tag + "</html>", 1)
p.write_text(s, encoding="utf-8")
# le service worker de la copie ne doit pas garder l'ancienne carte en cache
sw = dst / "sw.js"
if sw.exists(): sw.write_text(sw.read_text(encoding="utf-8").replace("beerman", "beerman-cmd", 1), encoding="utf-8")
print("Carte branchée :", dst)
