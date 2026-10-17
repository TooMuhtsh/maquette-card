#!/bin/bash
# Assemble la démo en ligne (GitHub Pages, https://toomuhtsh.github.io/maquette-card/) dans un dossier :
#   <sortie>/index.html  redirige vers demo/ (en gardant ?lang=, ?theme=…)
#   <sortie>/demo/       la démo du dépôt, marquée <html data-site> (bandeau, réglages, copie YAML : demo/site.js)
#   <sortie>/dist/       maquette-card.js + maquette-editeur.js (minifiés de release/ s'ils sont là, sinon ceux de dist/)
# Chemins relatifs : marche sous n'importe quel sous-chemin (/maquette-card/). Appelé par .github/workflows/pages.yml après
# « node build.mjs --min » ; en local : tools/site-demo.sh [/chemin/site [dossier des fichiers de la carte]] (défaut : site/ à la racine).
set -euo pipefail
DEPOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=$(realpath -m "${1:-$DEPOT/site}")
# 2e argument (facultatif) : dossier des deux fichiers de la carte (les tests passent dist/, release/ pouvant être ancien en local)
SRC=${2:-$DEPOT/release}
[ -n "${2:-}" ] || { [ -f "$SRC/maquette-card.js" ] && [ -f "$SRC/maquette-editeur.js" ]; } || SRC=$DEPOT/dist
for f in maquette-card.js maquette-editeur.js; do [ -f "$SRC/$f" ] || { echo "site-demo : $SRC/$f absent (node build.mjs)" >&2; exit 1; }; done
case "$OUT" in /|"$DEPOT"|"$DEPOT"/demo|"$DEPOT"/dist|"$HOME") echo "site-demo : sortie refusée ($OUT)" >&2; exit 1 ;; esac
rm -rf "$OUT"; mkdir -p "$OUT/demo" "$OUT/dist"
cp "$DEPOT"/demo/index.html "$DEPOT"/demo/*.js "$OUT/demo/"
rm -f "$OUT"/demo/*.local.*
cp "$SRC/maquette-card.js" "$SRC/maquette-editeur.js" "$OUT/dist/"
grep -q '^<html lang="fr">$' "$OUT/demo/index.html" || { echo "site-demo : <html lang=\"fr\"> introuvable dans demo/index.html" >&2; exit 1; }
sed -i 's|^<html lang="fr">$|<html lang="fr" data-site>|' "$OUT/demo/index.html"
cat > "$OUT/index.html" <<'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maquette — demo</title>
<meta http-equiv="refresh" content="0; url=demo/">
<script>location.replace("demo/" + location.search + location.hash);</script>
</head>
<body style="background:#111;color:#e1e1e1;font-family:system-ui,sans-serif"><p><a href="demo/" style="color:#03a9f4">Maquette — demo</a></p></body>
</html>
HTML
touch "$OUT/.nojekyll"
echo "site-demo : $OUT ($(basename "$SRC")/ : $(du -sh "$OUT" | cut -f1))"
