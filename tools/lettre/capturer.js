// Capture image par image des icônes posées par tools/lettre/icones.py : le temps est figé avec
// l'API Web Animations, chaque animation boucle un nombre entier de fois dans le tour du GIF.
// Playwright requis : PLAYWRIGHT=chemin/vers/playwright si le module n'est pas résolu, CHROMIUM=chemin du navigateur.
const fs = require('fs'), path = require('path');
function charger(nom) { try { return require(nom); } catch (e) { return null; } }
const pw = charger(process.env.PLAYWRIGHT || 'playwright') || charger('/opt/node-tools/node_modules/playwright');
if (!pw) { console.error('Playwright introuvable : PLAYWRIGHT=chemin/vers/playwright'); process.exit(1); }

(async () => {
  const travail = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const nav = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  const page = await nav.newPage({ deviceScaleFactor: 2 });
  await page.goto('file://' + travail.page);
  for (const { nom, boucle, depart } of travail.icones) {
    const dossier = path.join(travail.dossier, nom);
    fs.mkdirSync(dossier, { recursive: true });
    const n = Math.round(boucle * travail.ips);
    for (let k = 0; k < n; k++) {
      const t = ((k / n + depart) % 1) * boucle;
      await page.evaluate(([nom, t, boucle]) => {
        for (const a of document.getElementById('i-' + nom).getAnimations({ subtree: true })) {
          const { duration: d, delay } = a.effect.getComputedTiming();
          const total = Math.max(1, Math.round(boucle / d)) * d;
          a.pause();
          a.currentTime = delay + ((((t / boucle) * total - delay) % total) + total) % total;
        }
      }, [nom, t, boucle]);
      await page.locator('#i-' + nom).screenshot({ path: path.join(dossier, String(k).padStart(3, '0') + '.png') });
    }
  }
  await nav.close();
})().catch(e => { console.error(e); process.exit(1); });
