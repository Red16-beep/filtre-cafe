#!/usr/bin/env bash
# Copy the still-static parts of the legacy site (assets + root/hub pages that
# keep their own chrome) into astro/public so `astro build` emits a complete
# site. These are derived files — gitignored — regenerate with this script.
set -euo pipefail
cd "$(dirname "$0")/.."          # repo root
PUB="astro/public"
mkdir -p "$PUB/journal" "$PUB/guides"

copy() { [ -e "$1" ] && cp -pR "$1" "$2" || echo "  (skip missing: $1)"; }

for a in tailwind.css favicon.svg favicon.ico apple-touch-icon.png og-image.png og-image.svg nl-subscribe.js \
         robots.txt sitemap.xml llms.txt BingSiteAuth.xml \
         google9cf118a7aef4e71c.html _headers _redirects js images.filtre fonts 952ae93894774a3b947188d5ef63b203.txt; do
  copy "$a" "$PUB/"
done

for p in index.html a-propos.html commencer-ici.html mentions-legales.html \
         politique-confidentialite.html newsletter.html 404.html og-image.html; do
  copy "$p" "$PUB/"
done
copy journal/index.html "$PUB/journal/"
copy guides/index.html  "$PUB/guides/"
# newsletter archive issues linked from newsletter.html (01.html, 02.html, ...)
copy newsletter "$PUB/"
echo "public/ synced."
