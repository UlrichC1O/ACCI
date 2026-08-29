#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# ACCI — Optimisation des images (à exécuter UNE FOIS après ajout de photos)
#
# Génère, pour chaque photo source, un jeu d'images responsives :
#   nom-640.webp / nom-1024.webp / nom-1600.webp   (format moderne, léger)
#   nom-1200.jpg                                    (repli universel)
#
# Les fichiers produits sont versionnés dans le dépôt : le build (build.py)
# reste sans aucune dépendance. Ce script n'est nécessaire que pour préparer
# de NOUVELLES photos.
#
# Prérequis : Node.js (sharp-cli est récupéré à la volée par npx).
# Usage :  bash tools/optimize-images.sh [dossier-source]
# ---------------------------------------------------------------------------
set -euo pipefail

SRC="${1:-assets/img/_originals}"
OUT="assets/img"

if [ ! -d "$SRC" ]; then
  echo "✗ Dossier source introuvable : $SRC"
  echo "  Placez-y les photos d'origine (pleine résolution) puis relancez."
  exit 1
fi

echo "➜ Optimisation des images : $SRC → $OUT"
mkdir -p "$OUT"

shopt -s nullglob nocaseglob
for f in "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.png; do
  base="$(basename "${f%.*}")"
  case "$base" in
    favicon|apple-touch-icon) continue ;;   # icônes : déjà à la bonne taille
  esac

  echo "  · $base"
  for w in 640 1024 1600; do
    npx --yes sharp-cli -i "$f" -o "$OUT/${base}-${w}.webp" -f webp -q 78 \
        resize "$w" --withoutEnlargement --fit inside >/dev/null 2>&1
  done
  # Repli JPEG (navigateurs sans WebP) — ou PNG pour les logos (transparence)
  if [[ "$f" == *.png || "$f" == *.PNG ]]; then
    npx --yes sharp-cli -i "$f" -o "$OUT/${base}-1200.png" -f png \
        resize 1200 --withoutEnlargement --fit inside >/dev/null 2>&1
  else
    npx --yes sharp-cli -i "$f" -o "$OUT/${base}-1200.jpg" -f jpeg -q 76 \
        resize 1200 --withoutEnlargement --fit inside >/dev/null 2>&1
  fi
done

echo "✓ Terminé — $(du -sh "$OUT" | cut -f1) dans $OUT"
