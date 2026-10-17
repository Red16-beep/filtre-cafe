// Variantes mobiles des illustrations d'articles, sans le bandeau de légende (illisible à 6 px sur téléphone) :
// boucle MP4 en 768 × 432 (-m.mp4) et image fixe en WebP 1200 et 720 (-m-1200.webp, -m-720.webp).
// node outils/illustrations-mobile.mjs <dossier de sortie> [slugs séparés par des virgules]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("/Users/redahassani/Webo-test-croatie/astro/node_modules/sharp");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [, , sortie, liste] = process.argv;
const choix = liste ? new Set(liste.split(",")) : null;
const fiches = JSON.parse(fs.readFileSync("src/illustrations/illustrations.json", "utf8"));
fs.mkdirSync(sortie, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), rspack: true, enableCaching: true });
const navigateur = await openBrowser("chrome", { browserExecutable: CHROME, chromeMode: "chrome-for-testing" });
const opts = { serveUrl, puppeteerInstance: navigateur, chromeMode: "chrome-for-testing" };
let n = 0;
for (const a of fiches) {
  if (choix && !choix.has(a.slug)) continue;
  const mp4 = path.join(sortie, `${a.slug}-m.mp4`);
  if (!choix && fs.existsSync(mp4) && fs.existsSync(path.join(sortie, `${a.slug}-m-720.webp`))) continue;
  const t0 = Date.now();
  const inputProps = { scene: a.scene, props: a.props, libelle: "" };
  const composition = await selectComposition({ ...opts, id: `A-${a.slug}`, inputProps });
  const tmp = path.join(sortie, `${a.slug}-m.tmp.mp4`);
  await renderMedia({ ...opts, composition, inputProps, codec: "h264", outputLocation: tmp, scale: 0.64, crf: 27, x264Preset: "slow", pixelFormat: "yuv420p", imageFormat: "jpeg", jpegQuality: 90, muted: true, concurrency: 4 });
  fs.renameSync(tmp, mp4);
  const png = path.join(sortie, `${a.slug}-m.png`);
  await renderStill({ ...opts, composition, inputProps, output: png, frame: a.image ?? 45 });
  await sharp(png).webp({ quality: 80 }).toFile(path.join(sortie, `${a.slug}-m-1200.webp`));
  await sharp(png).resize(720).webp({ quality: 78 }).toFile(path.join(sortie, `${a.slug}-m-720.webp`));
  fs.rmSync(png);
  n++;
  const ko = (f) => Math.round(fs.statSync(path.join(sortie, f)).size / 1024);
  console.log(`${n} ${a.slug} · ${((Date.now() - t0) / 1000).toFixed(0)} s · mp4 ${ko(`${a.slug}-m.mp4`)} Ko · webp ${ko(`${a.slug}-m-1200.webp`)}/${ko(`${a.slug}-m-720.webp`)} Ko`);
}
await navigateur.close({ silent: true });
console.log("terminé", n);
