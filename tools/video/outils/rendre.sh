#!/usr/bin/env bash
# Rend une méthode pour le site : vidéos web (paysage + verticale) et affiches.
# outils/rendre.sh <compo paysage> <compo verticale> <affiche> <affiche verticale> <nom de fichier>
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SITE="/Users/redahassani/Webo-test-croatie/videos"
OPTS=(--browser-executable="$CHROME" --chrome-mode=chrome-for-testing --concurrency=6 --crf=27 --x264-preset=slow)
mkdir -p out "$SITE"
npx remotion render "$1" "out/$5.mp4" "${OPTS[@]}" > "out/rendu-$5.log" 2>&1
npx remotion render "$2" "out/$5-vertical.mp4" "${OPTS[@]}" >> "out/rendu-$5.log" 2>&1
npx remotion still "$3" "out/$5-affiche.png" --browser-executable="$CHROME" --chrome-mode=chrome-for-testing >> "out/rendu-$5.log" 2>&1
npx remotion still "$4" "out/$5-affiche-verticale.png" --browser-executable="$CHROME" --chrome-mode=chrome-for-testing >> "out/rendu-$5.log" 2>&1
cp "out/$5.mp4" "out/$5-vertical.mp4" "$SITE/"
node -e '
const sharp=require("/Users/redahassani/Webo-test-croatie/astro/node_modules/sharp");
const [a,b,site,nom]=process.argv.slice(1);
(async()=>{
  await sharp(a).jpeg({quality:82,mozjpeg:true}).toFile(`${site}/${nom}.jpg`);
  await sharp(a).resize(1280,720).webp({quality:80}).toFile(`${site}/${nom}-1280.webp`);
  await sharp(b).resize(720,1280).webp({quality:80}).toFile(`${site}/${nom}-vertical-720.webp`);
})();' "out/$5-affiche.png" "out/$5-affiche-verticale.png" "$SITE" "$5"
ls -la "$SITE" | grep "$5"
echo FIN
