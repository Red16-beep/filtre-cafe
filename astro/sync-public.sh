#!/usr/bin/env bash
# Copy the still-static parts of the legacy site (assets + root/hub pages that
# keep their own chrome) into astro/public so `astro build` emits a complete
# site. These are derived files — gitignored — regenerate with this script.
set -euo pipefail
cd "$(dirname "$0")/.."          # repo root
PUB="astro/public"
mkdir -p "$PUB/journal" "$PUB/guides"

for a in tailwind.css favicon.svg og-image.png og-image.svg nl-subscribe.js \
         robots.txt sitemap.xml llms.txt BingSiteAuth.xml \
         google9cf118a7aef4e71c.html _headers _redirects; do
  [ -e "$a" ] && cp -p "$a" "$PUB/"
done
cp -pR js "$PUB/"
[ -d images.filtre ] && cp -pR images.filtre "$PUB/"

for p in index.html a-propos.html commencer-ici.html mentions-legales.html \
         politique-confidentialite.html newsletter.html 404.html og-image.html; do
  [ -e "$p" ] && cp -p "$p" "$PUB/"
done
cp -p journal/index.html "$PUB/journal/"
cp -p guides/index.html  "$PUB/guides/"
echo "public/ synced."
