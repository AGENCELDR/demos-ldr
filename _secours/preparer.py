"""Prépare la copie de secours (dist/demos-ldr/) avant `wrangler deploy`.
Copie les pages publiques des clients, sans les essais, sans le code serveur, sans les gros fichiers vidéo."""
import shutil, pathlib
RACINE = pathlib.Path(__file__).resolve().parent.parent
DIST = pathlib.Path(__file__).resolve().parent / "dist"
SAUF_DOSSIERS = {".git", "_secours", "beerman-commande", "beerman-apercu"}
SAUF_DEBUT = ("_", "beerman-essai-")
SAUF_EXT = {".mp4", ".mov", ".py", ".md"}
MAX = 24 * 1024 * 1024
if DIST.exists(): shutil.rmtree(DIST)
cible = DIST / "demos-ldr"; cible.mkdir(parents=True)
n = 0
for p in RACINE.iterdir():
    if p.name in SAUF_DOSSIERS or (p.is_dir() and p.name.startswith(SAUF_DEBUT)) or p.name.startswith("."):
        continue
    for f in ([p] if p.is_file() else p.rglob("*")):
        if not f.is_file() or f.suffix.lower() in SAUF_EXT or f.stat().st_size > MAX: continue
        d = cible / f.relative_to(RACINE); d.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(f, d); n += 1
(DIST / "404.html").write_text("<!doctype html><meta charset=utf-8><title>Page introuvable</title><p style='font-family:sans-serif;padding:2em'>Page introuvable. <a href='/demos-ldr/'>Retour</a></p>", encoding="utf-8")
print(n, "fichiers copiés dans", cible)
