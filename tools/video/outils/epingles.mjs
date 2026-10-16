// Rend les six épingles en PNG puis JPEG dans le dossier pins/ de la version test.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const sharp = require("/Users/redahassani/Webo-test-croatie/astro/node_modules/sharp");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LISTE = [
  ["EpingleV60", "v60-guide-complet-tuto"],
  ["EpingleAero", "aeropress-guide-complet-tuto"],
  ["EpinglePress", "french-press-guide-tuto"],
  ["EpingleMoka", "moka-pot-guide-complet-tuto"],
  ["EpingleFroid", "cold-brew-maison-tuto"],
  ["EpingleEsp", "comment-faire-espresso-parfait-tuto"],
];
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), rspack: true, enableCaching: true });
const nav = await openBrowser("chrome", { browserExecutable: CHROME, chromeMode: "chrome-for-testing" });
for (const [id, nom] of LISTE) {
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: nav, chromeMode: "chrome-for-testing" });
  const png = `out/${nom}.png`;
  await renderStill({ composition, serveUrl, output: png, frame: 0, puppeteerInstance: nav, chromeMode: "chrome-for-testing" });
  await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(`/Users/redahassani/Webo-test-croatie/pins/${nom}.jpg`);
  console.log("épingle", nom);
}
await nav.close({ silent: true });
