// Parcours complet du carnet dans Chromium, au format iPhone : tasses, conseils, boussole du goût, sachet, chrono,
// historique, passeport (niveaux, succès, série, tampons), adresses (position, OpenStreetMap et Géoplateforme
// simulés), thème sombre, export, hors ligne.
// Usage, depuis la racine du dépôt : node carnet/outils/tester.js [dossier des captures]
// Playwright requis : PLAYWRIGHT=chemin/vers/playwright si le module n'est pas résolu, CHROMIUM=chemin du navigateur.
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os');
function charger(nom) { try { return require(nom); } catch (e) { return null; } }
const { chromium } = charger(process.env.PLAYWRIGHT || 'playwright') || charger('/opt/node-tools/node_modules/playwright');
const RACINE = path.join(__dirname, '..');
const CAP = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-captures-'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const serveur = http.createServer((req, res) => {
  const chemin = path.join(RACINE, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!chemin.startsWith(RACINE) || !fs.existsSync(chemin) || fs.statSync(chemin).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(chemin)] || 'application/octet-stream' });
  fs.createReadStream(chemin).pipe(res);
});
let URL_;
const NBSP = '\u00a0';
let ok = 0, ko = 0;
function verif(cond, quoi) { if (cond) { ok++; console.log('  ok  ' + quoi); } else { ko++; console.log('  KO  ' + quoi); } }
const norm = s => (s || '').replace(/[\u00a0\u202f\u2060]/g, ' ').replace(/\s+/g, ' ').trim();
// Date locale \u00ab AAAA-MM-JJ \u00bb d'il y a j jours, comme la renvoie un champ date.
const ilYa = j => { const d = new Date(Date.now() - j * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// \u00c9cran gard\u00e9 allum\u00e9 : on compte les demandes et les lib\u00e9rations du verrou.
const faussesVeilles = () => {
  window.__verrous = { pris: 0, rendus: 0 };
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: () => { window.__verrous.pris++; return Promise.resolve({ release() { window.__verrous.rendus++; return Promise.resolve(); }, addEventListener() {} }); } } });
};

(async () => {
  await new Promise(ok => serveur.listen(0, '127.0.0.1', ok));
  URL_ = 'http://127.0.0.1:' + serveur.address().port + '/';
  const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR', timezoneId: 'Europe/Paris', acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript(faussesVeilles);
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('console', m => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', e => erreurs.push(String(e)));
  page.on('dialog', d => { erreurs.push('boîte de dialogue inattendue : ' + d.message()); d.dismiss(); });
  const cap = async (nom, plein = true) => page.screenshot({ path: path.join(CAP, nom), fullPage: plein });
  const texte = async sel => norm(await page.textContent(sel));

  console.log('1. Premier lancement');
  await page.goto(URL_, { waitUntil: 'networkidle' });
  verif((await page.$$('#puces-methode .puce')).length === 10, '10 méthodes');
  verif(await page.getAttribute('#puces-methode .puce[data-cle="v60"]', 'aria-pressed') === 'true', 'V60 par défaut');
  verif(await page.inputValue('#champ-cafe') === 'nouveau', 'aucun café : « Nouveau café » choisi');
  verif(await page.isVisible('#cafe-nom'), 'champs du nouveau café visibles');
  verif(await page.inputValue('#t-dose') === '15' && await page.inputValue('#t-eau') === '250' && await page.inputValue('#t-temp') === '93', 'recette V60 pré-remplie (15 g, 250 g, 93 °C)');
  verif(await texte('#t-ratio') === 'Ratio 1:16,7', 'ratio affiché 1:16,7');
  const indice = await page.textContent('#indice');
  verif(norm(indice).startsWith('Recette filtré. : 15 g pour 250 g, 93 °C, 2 min 30 à 3 min 30, mouture médium, sucre fin.'), 'indice de recette : ' + norm(indice));
  verif(indice.includes('.' + NBSP + ':') && indice.includes('15' + NBSP + 'g'), 'espaces insécables (avant « : » et entre nombre et unité)');
  verif((await page.$$('#grille-gout .case')).length === 9 && await texte('#grille-gout .case--centre') === 'Équilibré', 'boussole du goût : 9 cases, l’équilibre au centre');
  verif(await texte('#jeu-entete') === 'Grain vert', 'en-tête : niveau Grain vert, sans série');
  await cap('01-noter.png');

  console.log('2. Première tasse : V60 acide et rapide, sachet de 250 g torréfié il y a 12 jours');
  await page.fill('#cafe-nom', 'Sidama, Nibret Alamu');
  await page.fill('#cafe-torref', 'La Brûlerie du Cantin');
  await page.selectOption('#cafe-origine', 'ethiopie');
  await page.click('#puces-procede .puce[data-cle="lave"]');
  await page.fill('#cafe-torrefie', ilYa(12));
  await page.click('#puces-poids .puce[data-cle="250"]');
  verif(await page.inputValue('#cafe-poids') === '250', 'raccourci 250 g : poids rempli');
  await page.fill('#t-mouture', '22 clics');
  await page.fill('#t-min', '2'); await page.fill('#t-sec', '05');
  await page.click('#grille-gout .case[data-case="3"]');
  verif(await texte('#gout-choisi') === 'Acide.', 'boussole : case « acide »');
  await page.click('#note button[data-note="3"]');
  await page.fill('#t-notes', 'citron, thé noir');
  await page.click('#form-tasse button[type="submit"]');
  verif(await page.isVisible('#conseil'), 'conseil affiché');
  verif(await page.$('canvas') !== null, 'succès fêté : grains de café lancés');
  const c1 = await texte('#conseil');
  verif(c1.startsWith('Tasse enregistrée · V60 · J+12'), 'conseil : âge du café, J+12');
  verif(c1.includes('Sous-extrait') && c1.includes('Moulez un cran plus fin.'), 'conseil : sous-extrait, moudre plus fin');
  verif(c1.includes('Le temps le confirme : 2 min 05, pour 2 min 30 à 3 min 30 dans la recette.'), 'le temps confirme le goût');
  verif(c1.includes('Pourquoi mon café est acide →'), 'lien vers l’article sur le café acide');
  verif(await page.getAttribute('#conseil a', 'href') === 'https://filtre.cafe/journal/pourquoi-cafe-acide', 'lien absolu vers filtre.cafe');
  verif((await page.$$('#conseil .bsvg__point--der')).length === 1 && (await page.$$('#conseil .bsvg__fleche')).length === 1, 'boussole dessinée : la tasse et la flèche vers le centre');
  verif(c1.includes('Il reste 235 g dans le sachet, environ 15 tasses.'), 'sachet : 235 g, environ 15 tasses');
  verif(c1.includes('+95 points · 95 au total'), 'points : 15 pour la tasse, 80 pour deux succès');
  const succes1 = await page.$$eval('#conseil .debloque__nom', l => l.map(x => x.textContent));
  verif(succes1.join() === 'Première tasse,Pic de fraîcheur', 'succès débloqués : ' + succes1.join(', '));
  verif(c1.includes('Nouveau niveau : Séchage.') && (await texte('#jeu-entete')) === 'Séchage 1 j', 'niveau Séchage, série d’un jour dans l’en-tête');
  await cap('02-conseil.png', false);
  const rep1 = await texte('#reprise');
  verif(rep1 === 'Repris de votre dernière tasse de ce café, aujourd’hui. La dernière fois, c’était acide : moulez un cran plus fin.', 'rappel du conseil : ' + rep1);
  verif(await page.inputValue('#t-mouture') === '22 clics', 'mouture reprise');
  verif(await page.isHidden('#nouveau-cafe'), 'le café créé est sélectionné');
  verif((await page.$$('#grille-gout .case[aria-pressed="true"]')).length === 0, 'goût remis à zéro');

  console.log('3. Boussole : un toucher par goût');
  await page.click('#grille-gout .case[data-case="3"]');
  await page.click('#grille-gout .case[data-case="5"]');
  const presses1 = await page.$$eval('#grille-gout .case[aria-pressed="true"]', b => b.map(x => x.dataset.case));
  verif(presses1.join() === '5' && await texte('#gout-choisi') === 'Amer.', 'amer remplace acide');
  await page.click('#grille-gout .case[data-case="8"]');
  verif(await texte('#gout-choisi') === 'Amer et trop léger.', 'coin : amer et trop léger');
  await page.click('#grille-gout .case[data-case="8"]');
  verif((await page.$$('#grille-gout .case[aria-pressed="true"]')).length === 0, 'second toucher : goût retiré');
  await page.click('#grille-gout .case[data-case="4"]');
  verif(await texte('#gout-choisi') === 'Équilibré.', 'centre : équilibré');

  console.log('4. Deuxième tasse : équilibrée');
  await page.fill('#t-mouture', '20 clics');
  await page.fill('#t-min', '2'); await page.fill('#t-sec', '50');
  await page.click('#note button[data-note="5"]');
  await page.click('#form-tasse button[type="submit"]');
  const c2 = await texte('#conseil');
  verif(c2.includes('Réglage trouvé'), 'conseil : réglage trouvé');
  verif(c2.includes('Dans le mille') && c2.includes('Nouveau niveau : Jaunissement.'), 'succès « Dans le mille », niveau Jaunissement');
  verif(!(await page.$('#conseil .bsvg__fleche')), 'au centre : pas de flèche');
  verif((await texte('#reprise')).includes('Il vous avait plu : gardez-le.'), 'rappel : il vous avait plu');

  console.log('5. Troisième tasse : espresso, nouveau café, temps seul');
  await page.click('#puces-methode .puce[data-cle="espresso"]');
  verif(await page.isHidden('#champ-min'), 'espresso : pas de champ minutes');
  verif(norm(await page.textContent('#libelle-eau')) === 'En tasse', 'espresso : on pèse en tasse');
  await page.selectOption('#champ-cafe', 'nouveau');
  verif(await page.inputValue('#t-dose') === '18' && await page.inputValue('#t-eau') === '36', 'recette espresso 18 g → 36 g');
  await page.fill('#cafe-nom', 'Cerrado, Yellow Bourbon');
  await page.selectOption('#cafe-origine', 'bresil');
  await page.fill('#t-sec', '22');
  await page.click('#form-tasse button[type="submit"]');
  const c3 = await texte('#conseil');
  verif(c3.includes('Temps hors recette') && c3.includes('En 22 s, c’est plus court que la recette (25 à 30 s) : affinez la mouture d’un cran.'), 'conseil sur le temps seul : ' + c3.slice(0, 160));
  verif(c3.includes('Espresso trop rapide ou trop lent →'), 'lien vers le diagnostic espresso');

  console.log('6. Annuler une tasse');
  await page.click('#puces-methode .puce[data-cle="moka"]');
  await page.click('#form-tasse button[type="submit"]');
  verif(await page.isVisible('#conseil'), 'tasse moka enregistrée');
  await page.click('#conseil [data-action="annuler"]');
  verif(await page.isHidden('#conseil'), 'conseil fermé après annulation');
  const nbTasses = await page.evaluate(() => JSON.parse(localStorage.getItem('filtre-carnet')).tasses.length);
  verif(nbTasses === 3, 'annulation : 3 tasses restent (' + nbTasses + ')');

  console.log('7. Cold brew : infusion en heures');
  await page.click('#puces-methode .puce[data-cle="coldbrew"]');
  verif(await page.isVisible('#champ-h') && await page.isHidden('#champ-temp') && await page.isHidden('#chrono'), 'heures visibles, température et chrono cachés');
  await page.click('#puces-methode .puce[data-cle="v60"]');

  console.log('8. Chrono : écran allumé, fin du bloom');
  await page.click('#chrono');
  await page.waitForTimeout(1200);
  verif(await page.evaluate(() => window.__verrous.pris) === 1 && await texte('#tour-note') === 'L’écran reste allumé pendant le chrono.', 'chrono lancé : écran gardé allumé');
  verif(await page.isVisible('#tour') && await texte('#tour') === 'Fin du bloom', 'V60 : bouton « Fin du bloom »');
  await page.click('#tour');
  verif(/^Bloom terminé à [12] s\.$/.test(await texte('#tour-note')), 'bloom noté : ' + await texte('#tour-note'));
  await page.waitForTimeout(1100);
  verif((await texte('#chrono')).startsWith('Stop 0:0'), 'le chrono tourne : ' + await texte('#chrono'));
  await page.click('#chrono');
  verif(await page.inputValue('#t-min') === '0' && ['02', '03'].includes(await page.inputValue('#t-sec')), 'chrono arrêté : temps reporté (' + await page.inputValue('#t-min') + ':' + await page.inputValue('#t-sec') + ')');
  verif(await page.evaluate(() => window.__verrous.rendus) === 1 && await page.isHidden('#tour') && await page.isVisible('#tour-note'), 'chrono arrêté : écran rendu, bloom gardé');
  await page.click('#puces-methode .puce[data-cle="espresso"]');
  verif(await page.isHidden('#tour-note'), 'changer de méthode efface le bloom');
  await page.click('#chrono');
  await page.waitForTimeout(300);
  verif(await texte('#tour') === 'Première goutte', 'espresso : bouton « Première goutte »');
  await page.click('#chrono');
  await page.click('#puces-methode .puce[data-cle="v60"]');

  console.log('9. Cafés et historique');
  await page.click('.onglets [data-vers="cafes"]');
  verif((await page.$$('.carte-cafe')).length === 2, '2 cafés listés');
  const premiereCarte = await texte('.carte-cafe');
  verif(premiereCarte.startsWith('Cerrado, Yellow Bourbon'), 'le café le plus récent en tête');
  verif(await texte('.carte-cafe:nth-child(2) .carte-cafe__sachet') === 'J+12 220 g restants', 'carte du café : J+12 et 220 g restants');
  verif(await page.getAttribute('.carte-cafe:nth-child(2) .age', 'class') === 'age age--fenetre', 'J+12 en V60 : dans sa fenêtre');
  await cap('03-cafes.png');
  await page.click('.carte-cafe:nth-child(2)');
  const detail = await texte('#cafe-detail');
  verif(detail.includes('Votre meilleur réglage') && detail.includes('V60 · 15 g → 250 g · 1:16,7 · 93 °C · 2 min 50 · mouture 20 clics'), 'meilleur réglage : la tasse notée 5');
  verif((await page.$$('#cafe-detail .tasse')).length === 2, '2 tasses pour ce café');
  verif(detail.includes('Café éthiopien : Yirgacheffe, Sidama, Guji →'), 'lien vers le guide de l’origine');
  verif(detail.includes('J+12 dans sa fenêtre · torréfié le ') && detail.includes('220 g restants sur 250 g · environ 14 tasses'), 'fiche : âge et reste du sachet');
  verif((await page.$$('#cafe-detail .bsvg__point')).length === 2 && !(await page.$('#cafe-detail .bsvg__fleche')), 'boussole du café : 2 tasses, la dernière au centre');
  await cap('04-cafe.png');
  await page.click('#cafe-detail [data-action="modifier-sachet"]');
  verif(await page.isVisible('#form-sachet') && await page.inputValue('#s-poids') === '250', 'modifier le sachet : formulaire pré-rempli');
  await page.fill('#s-poids', '300');
  await page.click('#form-sachet button[type="submit"]');
  verif((await texte('#cafe-detail')).includes('270 g restants sur 300 g'), 'poids corrigé : 270 g restants sur 300 g');
  await page.click('#cafe-detail .encadre [data-action="rejouer"]');
  verif(await page.isVisible('[data-vue="noter"]'), 'rejouer : retour à Noter');
  const rep2 = await texte('#reprise');
  verif(rep2 === 'Réglage d’aujourd’hui rejoué. Il vous avait plu : gardez-le.', 'rejouer : ' + rep2);
  verif(await page.inputValue('#t-mouture') === '20 clics', 'rejouer : mouture 20 clics');

  console.log('10. Passeport : niveau, succès, carte et tampons');
  await page.click('.onglets [data-vers="passeport"]');
  verif(await texte('#titre-passeport') === 'Jaunissement', 'titre : le niveau, Jaunissement');
  verif((await texte('#niveau')).startsWith('160 points') && (await texte('#niveau')).includes('Encore 140 points pour « Premier crack »'), 'jauge : 160 points, 140 avant Premier crack');
  verif(await texte('#titre-succes') === 'Succès · 3 sur 12' && (await page.$$('.succes__item--on')).length === 3, '3 succès sur 12');
  verif(await texte('#titre-carte') === '2 origines goûtées', 'titre : 2 origines goûtées');
  verif((await page.$$('.point--goutee')).length === 2, '2 points allumés');
  verif((await page.$$('.point--guide')).length === 7, '7 origines à découvrir (guides du site)');
  const lignes = (await page.$$eval('#carte-listes .tampon .tampon__info', l => l.map(x => x.innerText))).map(norm);
  verif(lignes[0] === 'Éthiopie 2 tasses le guide →' && lignes[1] === 'Brésil 1 tasse le guide →', 'tampons, dans l’ordre des découvertes : ' + lignes.slice(0, 2).join(' | '));
  verif(await page.$eval('.tampon[data-origine="ethiopie"]', li => li.classList.contains('tampon--afrique')), 'tampon à la couleur du continent');
  const defile = await page.evaluate(() => { const d = document.querySelector('#carte-defile'); return [d.scrollLeft, d.scrollWidth, d.clientWidth]; });
  verif(defile[1] > defile[2] && defile[0] > 0, 'carte défilante, recentrée sur les points (' + defile.join(', ') + ')');
  await page.dispatchEvent('.point--goutee[data-origine="ethiopie"]', 'click');
  verif(await page.$eval('.point[data-origine="ethiopie"]', p => p.classList.contains('choisi')), 'toucher un point affiche son nom');
  await cap('05-carte.png');

  console.log('11. Données : export, import');
  await page.click('.onglets [data-vers="donnees"]');
  verif(await texte('#resume-donnees') === '2 cafés · 3 tasses dans le carnet', 'résumé : 2 cafés, 3 tasses');
  verif(await page.isVisible('#encadre-installer'), 'conseil d’installation affiché (pas encore installé)');
  await cap('06-donnees.png');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.click('#exporter')]);
  let exportJson = null;
  if (dl) { const p = await dl.path(); exportJson = JSON.parse(fs.readFileSync(p, 'utf8')); fs.copyFileSync(p, path.join(CAP, 'export.json')); }
  verif(exportJson && exportJson.cafes.length === 2 && exportJson.tasses.length === 3, 'export JSON complet (' + (dl ? dl.suggestedFilename() : 'pas de téléchargement') + ')');
  const sidama = exportJson && exportJson.cafes.find(c => c.nom.startsWith('Sidama'));
  verif(sidama && sidama.sachet.poids === 300 && sidama.sachet.torrefie === ilYa(12) && exportJson.tasses.filter(t => t.jours === 12).length === 2, 'export : sachet et âge des tasses inclus');
  if (dl) {
    await page.setInputFiles('#importer', path.join(CAP, 'export.json'));
    await page.waitForSelector('#message:not([hidden])');
    verif(await texte('#message') === '0 café et 0 tasse ajoutés.', 'réimport sans doublon : ' + await texte('#message'));
  }

  console.log('12. Rechargement : les données restent');
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('.onglets [data-vers="cafes"]');
  verif((await page.$$('.carte-cafe')).length === 2, 'après rechargement : 2 cafés');

  console.log('13. Hors ligne');
  const sw = await page.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready.then(() => true));
  verif(sw === true, 'service worker actif');
  await page.waitForTimeout(500);
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'load' });
  verif((await page.$$('#puces-methode .puce')).length === 10, 'hors ligne : l’appli se recharge depuis le cache');
  await ctx.setOffline(false);

  console.log('13b. Suppression en deux touchers, copie de l’export, effacement');
  await page.click('.onglets [data-vers="cafes"]');
  await page.click('.carte-cafe:nth-child(1)');
  const avant = (await page.$$('#cafe-detail .tasse')).length;
  await page.click('#cafe-detail [data-action="supprimer-tasse"]');
  verif(norm(await page.textContent('#cafe-detail [data-action="supprimer-tasse"]')) === 'Toucher encore pour supprimer' && (await page.$$('#cafe-detail .tasse')).length === avant, 'premier toucher : demande de confirmation, rien supprimé');
  await page.click('#cafe-detail [data-action="supprimer-tasse"]');
  verif((await page.$$('#cafe-detail .tasse')).length === avant - 1, 'second toucher : tasse supprimée');
  await page.click('.onglets [data-vers="donnees"]');
  await page.click('#copier-export');
  await page.waitForSelector('#message:not([hidden])');
  const copie = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
  verif(copie.version === 1 && copie.tasses.length === 2, 'export copié dans le presse-papiers (' + copie.tasses.length + ' tasses)');
  await page.click('#effacer');
  verif(norm(await page.textContent('#effacer')) === 'Toucher encore pour tout effacer', 'effacer : demande de confirmation');
  await page.click('#effacer');
  verif(await texte('#resume-donnees') === '0 café · 0 tasse dans le carnet', 'carnet effacé');

  console.log('15. Thème sombre');
  await page.click('.onglets [data-vers="donnees"]');
  const fond = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  verif(await page.getAttribute('#puces-theme .puce[data-cle="auto"]', 'aria-pressed') === 'true', 'apparence par défaut : comme le téléphone');
  await page.emulateMedia({ colorScheme: 'dark' });
  verif(await fond() === 'rgb(21, 16, 12)', 'téléphone en sombre : carnet sombre (' + await fond() + ')');
  await page.emulateMedia({ colorScheme: 'light' });
  verif(await fond() === 'rgb(246, 241, 234)', 'téléphone en clair : carnet clair');
  await page.click('#puces-theme .puce[data-cle="sombre"]');
  verif(await page.getAttribute('html', 'data-theme') === 'dark' && await fond() === 'rgb(21, 16, 12)', 'choix « Sombre » appliqué');
  await page.reload({ waitUntil: 'networkidle' });
  verif(await page.getAttribute('html', 'data-theme') === 'dark', 'choix « Sombre » gardé après rechargement');
  await page.click('.onglets [data-vers="noter"]');
  await cap('08-sombre-noter.png', false);
  await page.click('.onglets [data-vers="donnees"]');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.click('#puces-theme .puce[data-cle="clair"]');
  verif(await fond() === 'rgb(246, 241, 234)', 'choix « Clair » l’emporte sur le téléphone en sombre');
  await page.click('#puces-theme .puce[data-cle="auto"]');
  verif(await page.getAttribute('html', 'data-theme') === null && await fond() === 'rgb(21, 16, 12)', '« Comme le téléphone » rend la main au téléphone');
  await page.emulateMedia({ colorScheme: 'light' });

  console.log('16. Adresses autour de soi');
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR', timezoneId: 'Europe/Paris', geolocation: { latitude: 48.8566, longitude: 2.3522 }, permissions: ['geolocation'] });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erreurs.push(String(e)));
  p2.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreurs.push(m.text()); });
  const requetes = [];
  let osmEnPanne = false;
  await p2.route('**/api/interpreter', async route => {
    requetes.push(decodeURIComponent((route.request().postData() || '').replace(/^data=/, '')));
    if (osmEnPanne) return route.fulfill({ status: 504, body: 'Gateway Timeout' });
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ elements: [
      { type: 'node', id: 1, lat: 48.8572, lon: 2.3541, tags: { amenity: 'cafe', cuisine: 'coffee_shop', name: 'Café Test Indépendant', 'addr:housenumber': '5', 'addr:street': 'Rue de Rivoli' } },
      { type: 'node', id: 2, lat: 48.8575, lon: 2.35, tags: { amenity: 'cafe', cuisine: 'coffee_shop', name: 'Starbucks', brand: 'Starbucks' } },
      { type: 'node', id: 3, lat: 48.858, lon: 2.353, tags: { amenity: 'cafe', cuisine: 'bubble_tea;coffee_shop', name: 'Boba Time' } },
      { type: 'node', id: 4, lat: 48.85963, lon: 2.35554, tags: { amenity: 'cafe', cuisine: 'coffee_shop', name: 'Terres de Café' } },
      { type: 'way', id: 5, center: { lat: 48.86, lon: 2.36 }, tags: { shop: 'coffee', name: 'Brûlerie Test' } }
    ] }) });
  });
  await p2.route('**/geocodage/search**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ features: [{ properties: { label: 'Lyon', context: '69, Rhône, Auvergne-Rhône-Alpes' }, geometry: { coordinates: [4.8357, 45.764] } }] }) }));
  await p2.goto(URL_ + '#adresses', { waitUntil: 'networkidle' });
  verif(await p2.isHidden('#radar') && requetes.length === 0, 'sans point de départ : ni radar ni requête');
  verif((await p2.$$('.ville')).length === 5, 'les adresses de filtré., rangées en 5 villes');
  await p2.click('#me-localiser');
  await p2.waitForFunction(() => document.querySelector('#listes-adresses').textContent.includes('Café Test Indépendant'));
  verif(norm(await p2.textContent('#lieu-actuel')) === 'Autour de votre position, dans un rayon de 2 km.', 'lieu : votre position');
  verif(requetes.length === 1 && requetes[0].includes('(around:2000,48.857,2.352)'), 'position envoyée arrondie à 100 m');
  const cles = await p2.$$eval('#listes-adresses .adresses > ul > .adresse', l => l.map(x => x.dataset.adresse));
  const filtreCles = cles.filter(c => c.startsWith('f:')), osmCles = cles.filter(c => c.startsWith('o:'));
  verif(filtreCles[0] === 'f:terres-blancs-manteaux', 'l’adresse de filtré. la plus proche en tête : ' + filtreCles[0]);
  const premiere = norm(await p2.textContent('.adresse[data-adresse="f:terres-blancs-manteaux"] .adresse__distance'));
  verif(premiere === '420 m · 5 min à pied', 'distance et temps à pied : ' + premiere);
  verif(osmCles.join() === 'o:node/1,o:way/5', 'OpenStreetMap : indépendants seulement, sans doublon des adresses filtré. (' + osmCles.join() + ')');
  verif((await p2.$$('#radar .radar__point--osm')).length === 2 && (await p2.$$('#radar .radar__point--filtre')).length > 5, 'radar : points filtré. et OpenStreetMap');
  const lien = await p2.getAttribute('.adresse[data-adresse="o:node/1"] a', 'href');
  verif(lien.startsWith('https://www.google.com/maps/dir/?api=1&destination=48.8572,2.3541'), 'lien d’itinéraire à pied');
  await p2.dispatchEvent('#radar .radar__point[data-adresse="o:node/1"]', 'click');
  verif(await p2.$eval('.adresse[data-adresse="o:node/1"]', li => li.classList.contains('choisi')), 'toucher un point du radar met l’adresse en avant');
  await p2.click('.adresse[data-adresse="o:node/1"] [data-action="garder"]');
  verif(norm(await p2.textContent('.adresses h2')) === 'Vos adresses' && (await p2.$$('#radar .radar__point--garde')).length === 1, 'adresse gardée : section « Vos adresses » et point plein');
  verif(await p2.evaluate(() => JSON.parse(localStorage.getItem('filtre-carnet')).adresses[0].nom) === 'Café Test Indépendant', 'adresse gardée dans le carnet');
  await p2.screenshot({ path: path.join(CAP, '09-adresses.png'), fullPage: true });
  await p2.fill('#champ-lieu', 'Lyon');
  await p2.press('#champ-lieu', 'Enter');
  await p2.waitForSelector('#resultats-lieu button');
  await p2.click('#resultats-lieu button');
  await p2.waitForFunction(() => document.querySelector('#lieu-actuel').textContent.includes('Lyon'));
  const lyon = await p2.$$eval('#listes-adresses .adresses > ul > .adresse', l => l.map(x => x.dataset.adresse).filter(c => c.startsWith('f:')));
  verif(lyon[0] === 'f:mokxa-bellecour' && lyon.length === 2, 'recherche de ville : Lyon et ses 2 adresses Mokxa');
  await p2.click('#puces-villes .puce[data-cle="toulouse"]');
  verif(await p2.getAttribute('#puces-villes .puce[data-cle="toulouse"]', 'aria-pressed') === 'true', 'raccourci Toulouse');
  await p2.reload({ waitUntil: 'networkidle' });
  await p2.click('.onglets [data-vers="adresses"]');
  verif(norm(await p2.textContent('#lieu-actuel')).startsWith('Autour de Toulouse'), 'ville gardée pour la visite suivante');
  osmEnPanne = true;
  const avantPanne = requetes.length;
  await p2.click('#puces-villes .puce[data-cle="bordeaux"]');
  await p2.waitForSelector('[data-action="osm-reessayer"]', { timeout: 20000 });
  await p2.waitForTimeout(1500);
  verif(requetes.length - avantPanne === 2, 'panne d’OpenStreetMap : deux serveurs essayés, pas de relance en boucle (' + (requetes.length - avantPanne) + ')');
  osmEnPanne = false;
  await p2.click('[data-action="osm-reessayer"]');
  await p2.waitForFunction(() => !document.querySelector('[data-action="osm-reessayer"]'));
  verif(requetes.length - avantPanne === 3, 'Réessayer relance la recherche');
  const ctx3 = await nav.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  // Refus de la localisation, comme dans un cadre qui la bloque ou après « Ne pas autoriser ».
  await ctx3.addInitScript(() => Object.defineProperty(navigator.geolocation, 'getCurrentPosition', { configurable: true, value: (ok, ko) => setTimeout(() => ko({ code: 1, message: 'refus' }), 50) }));
  const p3 = await ctx3.newPage();
  await p3.goto(URL_ + '#adresses', { waitUntil: 'networkidle' });
  await p3.click('#me-localiser');
  await p3.waitForSelector('#message:not([hidden])', { timeout: 15000 });
  verif(norm(await p3.textContent('#message')) === 'Position indisponible. Autorisez la localisation, ou choisissez une ville.', 'localisation refusée : message clair');
  await ctx2.close(); await ctx3.close();

  console.log('17. Série de sept jours, sachet fini, première goutte, fraîcheur, mouvement réduit');
  const ctx4 = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR', timezoneId: 'Europe/Paris', reducedMotion: 'reduce' });
  await ctx4.addInitScript(faussesVeilles);
  const p4 = await ctx4.newPage();
  p4.on('pageerror', e => erreurs.push(String(e)));
  p4.on('console', m => { if (m.type() === 'error') erreurs.push(m.text()); });
  const texte4 = async sel => norm(await p4.innerText(sel));
  await p4.goto(URL_, { waitUntil: 'networkidle' });
  // Un carnet de la v0.2, sans sachet ni âge : une tasse par jour pendant sept jours.
  await p4.evaluate(() => {
    const J = 864e5, tasses = [];
    for (let j = 6; j >= 0; j--) { const d = new Date(Date.now() - j * J); d.setHours(8, 0, 0, 0); tasses.push({ id: 't' + j, cafe: 'c1', methode: 'v60', date: d.toISOString(), dose: 15, eau: 250, mouture: '20 clics', temperature: 93, temps: 170, gouts: [], note: null, notes: '' }); }
    localStorage.setItem('filtre-carnet', JSON.stringify({ version: 1, cafes: [{ id: 'c1', nom: 'Huila, Pink Bourbon', torrefacteur: '', origine: 'colombie', procede: 'lave', cree: new Date(Date.now() - 6 * J).toISOString() }], tasses, adresses: [] }));
  });
  await p4.reload({ waitUntil: 'networkidle' });
  verif(await texte4('#jeu-entete') === 'Jaunissement 7 j', 'carnet v0.2 relu : 7 jours de suite, niveau Jaunissement');
  await p4.click('.onglets [data-vers="passeport"]');
  verif(await p4.$eval('.succes__item:nth-child(11)', li => li.classList.contains('succes__item--on')) && (await texte4('#niveau')).includes('7 jours de suite · record : 7 jours'), 'succès « Sept jours de suite », record de 7 jours');
  await p4.click('.onglets [data-vers="noter"]');
  await p4.click('#puces-methode .puce[data-cle="espresso"]');
  await p4.selectOption('#champ-cafe', 'nouveau');
  await p4.fill('#cafe-nom', 'Kochere');
  await p4.selectOption('#cafe-origine', 'ethiopie');
  await p4.fill('#cafe-poids', '20');
  await p4.fill('#t-sec', '27');
  await p4.click('#grille-gout .case[data-case="4"]');
  await p4.click('#form-tasse button[type="submit"]');
  const c4 = await texte4('#conseil');
  verif(c4.includes('Dans la fenêtre') && c4.includes('Dans le mille'), 'espresso en 27 s : « Dans la fenêtre » et « Dans le mille »');
  verif(await p4.$('canvas') === null, 'animations réduites : pas de grains qui volent');
  verif(c4.includes('Il reste 2 g dans le sachet, d’après vos doses. Sachet fini ?'), 'sachet presque vide : « Sachet fini ? »');
  await p4.click('#conseil [data-action="finir-sachet"]');
  verif((await texte4('#conseil .fin-sachet')).startsWith('Sachet fini. Le café passe dans « Cafés rangés »') && (await texte4('#conseil .fin-sachet')).includes('Jusqu’au dernier grain'), 'sachet fini : succès « Jusqu’au dernier grain »');
  await p4.click('.onglets [data-vers="cafes"]');
  verif((await p4.$$('#liste-cafes > .carte-cafe')).length === 1 && (await texte4('.ranges summary')) === 'Cafés rangés · 1', 'le café fini passe dans « Cafés rangés »');
  await p4.click('.onglets [data-vers="noter"]');
  verif(await p4.$$eval('#champ-cafe option', o => o.map(x => x.textContent).join('|')) === 'Huila, Pink Bourbon|+ Nouveau café', 'Noter : le café rangé n’est plus proposé');
  await p4.click('.onglets [data-vers="cafes"]');
  await p4.click('.ranges summary');
  await p4.click('.ranges .carte-cafe');
  verif((await texte4('#cafe-detail .sachet')).startsWith('Sachet fini Fini aujourd’hui'), 'fiche : sachet fini aujourd’hui');
  await p4.click('#cafe-detail [data-action="nouveau-sachet"]');
  await p4.fill('#s-torrefie', ilYa(10));
  await p4.fill('#s-poids', '250');
  await p4.click('#form-sachet button[type="submit"]');
  verif((await texte4('#cafe-detail .sachet')).includes('J+10 dans sa fenêtre') && (await texte4('#cafe-detail .sachet')).includes('250 g restants sur 250 g'), 'nouveau sachet : J+10, 250 g, le compte repart de zéro');
  await p4.click('.onglets [data-vers="noter"]');
  await p4.click('#puces-methode .puce[data-cle="espresso"]');
  await p4.selectOption('#champ-cafe', { label: 'Kochere' });
  await p4.click('#chrono');
  await p4.waitForTimeout(1100);
  verif(await texte4('#tour') === 'Première goutte', 'espresso : « Première goutte »');
  await p4.click('#tour');
  await p4.waitForTimeout(900);
  await p4.click('#chrono');
  await p4.click('#grille-gout .case[data-case="4"]');
  await p4.click('#form-tasse button[type="submit"]');
  const c6 = await texte4('#conseil');
  verif(c6.includes('Chrono en main') && norm(await p4.textContent('#conseil .kicker')) === 'Tasse enregistrée · Espresso · J+10', 'première goutte notée : « Chrono en main », J+10');
  const derniere = await p4.evaluate(() => { const d = JSON.parse(localStorage.getItem('filtre-carnet')); return d.tasses[d.tasses.length - 1]; });
  verif(derniere.tour >= 1 && derniere.jours === 10, 'tasse : première goutte à ' + derniere.tour + ' s, J+10');
  await p4.click('#conseil [data-action="voir-cafe"]');
  verif(/1re goutte à [12] s/.test(await texte4('#cafe-detail .tasse')), 'historique : première goutte affichée');
  await p4.click('.onglets [data-vers="noter"]');
  await p4.click('#puces-methode .puce[data-cle="v60"]');
  await p4.selectOption('#champ-cafe', 'nouveau');
  await p4.fill('#cafe-nom', 'Café tout frais');
  await p4.fill('#cafe-torrefie', ilYa(3));
  await p4.click('#grille-gout .case[data-case="3"]');
  await p4.click('#form-tasse button[type="submit"]');
  const c5 = await texte4('#conseil');
  verif(c5.includes('Torréfié il y a 3 jours : il dégaze encore') && c5.includes('Dégazage : combien de jours avant de le boire →'), 'café de 3 jours : conseil de repos et lien vers l’article');
  await p4.selectOption('#champ-cafe', 'nouveau');
  await p4.fill('#cafe-nom', 'Café oublié');
  await p4.fill('#cafe-torrefie', ilYa(50));
  await p4.click('#form-tasse button[type="submit"]');
  verif((await texte4('#conseil')).includes('Torréfié il y a 7 semaines : ses arômes s’estompent.') && (await p4.getAttribute('#conseil .conseil__age a', 'href')) === 'https://filtre.cafe/journal/comment-conserver-cafe', 'café de 7 semaines : à finir, lien vers la conservation');
  await p4.emulateMedia({ colorScheme: 'dark' });
  await p4.screenshot({ path: path.join(CAP, '10-sombre-conseil.png') });
  await p4.click('.onglets [data-vers="passeport"]');
  await p4.screenshot({ path: path.join(CAP, '11-sombre-passeport.png'), fullPage: true });
  await ctx4.close();

  console.log('18. Grain de poche : trouvé après 3 jours, il sauve la série d’un jour sauté');
  const ctx5 = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const p5 = await ctx5.newPage();
  p5.on('pageerror', e => erreurs.push(String(e)));
  p5.on('console', m => { if (m.type() === 'error') erreurs.push(m.text()); });
  const texte5 = async sel => norm(await p5.innerText(sel));
  // Un carnet dont les tasses tombent ces jours-là (0 : aujourd'hui), à 8 h.
  const carnetDeJours = async jours => {
    await p5.goto(URL_, { waitUntil: 'networkidle' });
    await p5.evaluate(js => {
      const J = 864e5, tasses = js.map(j => { const d = new Date(Date.now() - j * J); d.setHours(8, 0, 0, 0); return { id: 'p' + j, cafe: 'c1', methode: 'v60', date: d.toISOString(), dose: 15, eau: 250, mouture: '', temperature: 93, temps: 170, gouts: ['equilibre'], note: null, notes: '' }; });
      localStorage.setItem('filtre-carnet', JSON.stringify({ version: 1, cafes: [{ id: 'c1', nom: 'Guji', torrefacteur: '', origine: 'ethiopie', procede: null, cree: tasses[0].date }], tasses, adresses: [] }));
    }, jours);
    await p5.reload({ waitUntil: 'networkidle' });
  };
  const noterUneTasse = async () => {
    await p5.click('.onglets [data-vers="noter"]');
    await p5.click('#grille-gout .case[data-case="4"]');
    await p5.click('#form-tasse button[type="submit"]');
  };
  await carnetDeJours([2, 1]);
  verif(!(await p5.$('#jeu-entete .grain--poche-mini')), 'deux jours de suite : poche vide');
  await noterUneTasse();
  verif((await texte5('#conseil .poche')).startsWith('Oh, un grain de café dans votre poche !'), 'troisième jour : « Oh, un grain de café dans votre poche ! »');
  verif(!!(await p5.$('#jeu-entete .grain--poche-mini')) && (await p5.getAttribute('#jeu-entete', 'aria-label')).includes('un grain de café en poche'), 'en-tête : le grain en poche');
  await carnetDeJours([4, 3, 2]);
  verif((await p5.$eval('#jeu-entete .jeu__serie', s => s.classList.contains('jeu__serie--a-sauver'))) && (await texte5('#jeu-entete')).endsWith('3 j'), 'hier sauté, grain en poche : série de 3 jours à sauver');
  await p5.click('.onglets [data-vers="passeport"]');
  verif((await texte5('#niveau')).includes('Vous avez sauté hier : notez une tasse aujourd’hui, votre grain de poche sauvera la série.'), 'passeport : la série est à sauver aujourd’hui');
  await noterUneTasse();
  verif((await texte5('#conseil .poche')).startsWith('Ouf ! Votre grain de poche a sauvé la série. 4 jours de suite.'), 'tasse du jour : « Ouf ! », la série passe à 4 jours');
  verif(!(await p5.$('#jeu-entete .grain--poche-mini')) && (await texte5('#jeu-entete')).endsWith('4 j'), 'grain utilisé : poche vide, 4 jours de suite');
  await p5.click('.onglets [data-vers="passeport"]');
  verif((await texte5('#niveau')).includes('Prochain grain de poche : encore 6 jours de suite.'), 'le prochain grain : dans 6 jours de suite');
  await carnetDeJours([5, 4, 2, 1]);
  verif((await texte5('#jeu-entete')).endsWith('2 j'), 'sans grain en poche, un jour sauté fait repartir la série : 2 jours depuis');
  await ctx5.close();

  console.log('14. Bureau');
  const bureau = await nav.newPage({ viewport: { width: 1280, height: 900 } });
  bureau.on('pageerror', e => erreurs.push(String(e)));
  await bureau.goto(URL_ + '#origines', { waitUntil: 'networkidle' });
  verif(await bureau.isVisible('[data-vue="passeport"]'), 'ancien lien #origines : le passeport s’ouvre');
  await bureau.screenshot({ path: path.join(CAP, '07-bureau-carte.png'), fullPage: true });
  const debordement = await bureau.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  verif(!debordement, 'bureau : pas de défilement horizontal de la page');
  const debordementMobile = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  verif(!debordementMobile, 'téléphone : pas de défilement horizontal de la page');

  verif(erreurs.length === 0, 'aucune erreur JavaScript' + (erreurs.length ? ' : ' + erreurs.join(' | ') : ''));
  console.log(`\n${ok} vérifications passées, ${ko} en échec`);
  await nav.close();
  serveur.close();
  console.log('Captures : ' + CAP);
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
