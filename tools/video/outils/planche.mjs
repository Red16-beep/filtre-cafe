// Planche-contact : rend plusieurs images d'une composition et les assemble.
// node outils/planche.mjs <composition> <images séparées par des virgules> <sortie.png> [échelle] [colonnes]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("/Users/redahassani/Webo-test-croatie/astro/node_modules/sharp");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [, , id, liste, sortie, echelleTxt = "0.3", colsTxt = "6"] = process.argv;
const images = liste.split(",").map(Number);
const echelle = Number(echelleTxt);
const colonnes = Number(colsTxt);

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), rspack: true, enableCaching: true });
const navigateur = await openBrowser("chrome", { browserExecutable: CHROME, chromeMode: "chrome-for-testing" });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: navigateur, chromeMode: "chrome-for-testing" });

const tmp = fs.mkdtempSync(path.join(path.dirname(path.resolve(sortie)), "planche-"));
const fichiers = [];
for (const f of images) {
  const out = path.join(tmp, `${f}.png`);
  await renderStill({ composition, serveUrl, output: out, frame: f, scale: echelle, puppeteerInstance: navigateur, chromeMode: "chrome-for-testing" });
  fichiers.push({ f, out });
}
await navigateur.close({ silent: true });

const w = Math.round(composition.width * echelle);
const h = Math.round(composition.height * echelle);
const lignes = Math.ceil(fichiers.length / colonnes);
const marge = 8;
const etiquette = 26;
const calques = [];
fichiers.forEach(({ f, out }, i) => {
  const x = (i % colonnes) * (w + marge);
  const y = Math.floor(i / colonnes) * (h + marge + etiquette);
  calques.push({ input: out, left: x, top: y + etiquette });
  const svg = `<svg width="${w}" height="${etiquette}"><text x="4" y="19" font-family="Helvetica" font-size="17" fill="#ffd9a8">${f} (${(f / composition.fps).toFixed(1)} s)</text></svg>`;
  calques.push({ input: Buffer.from(svg), left: x, top: y });
});
await sharp({
  create: {
    width: colonnes * (w + marge) - marge,
    height: lignes * (h + marge + etiquette) - marge,
    channels: 3,
    background: "#000000",
  },
})
  .composite(calques)
  .png()
  .toFile(sortie);
fs.rmSync(tmp, { recursive: true, force: true });
console.log("planche", sortie, fichiers.length, "images");
