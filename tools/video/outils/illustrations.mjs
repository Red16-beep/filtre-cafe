// Rend les illustrations d'articles : boucle MP4 de 6 s + image fixe (JPEG pour og:image, WebP 1200 et 720).
// node outils/illustrations.mjs <dossier de sortie> [slugs séparés par des virgules]
// Sans liste de slugs, les illustrations déjà rendues sont sautées (reprise après interruption).
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
  const mp4 = path.join(sortie, `${a.slug}.mp4`);
  if (!choix && fs.existsSync(mp4) && fs.existsSync(path.join(sortie, `${a.slug}-720.webp`))) continue;
  const t0 = Date.now();
  const composition = await selectComposition({ ...opts, id: `A-${a.slug}` });
  const tmp = path.join(sortie, `${a.slug}.tmp.mp4`);
  await renderMedia({ ...opts, composition, codec: "h264", outputLocation: tmp, crf: 26, x264Preset: "slow", pixelFormat: "yuv420p", imageFormat: "jpeg", jpegQuality: 92, muted: true, concurrency: 4 });
  fs.renameSync(tmp, mp4);
  const png = path.join(sortie, `${a.slug}.png`);
  await renderStill({ ...opts, composition, output: png, frame: a.image ?? 45 });
  await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(sortie, `${a.slug}.jpg`));
  await sharp(png).webp({ quality: 80 }).toFile(path.join(sortie, `${a.slug}-1200.webp`));
  await sharp(png).resize(720).webp({ quality: 78 }).toFile(path.join(sortie, `${a.slug}-720.webp`));
  fs.rmSync(png);
  n++;
  const ko = (f) => Math.round(fs.statSync(path.join(sortie, f)).size / 1024);
  console.log(`${n} ${a.slug} · ${((Date.now() - t0) / 1000).toFixed(0)} s · mp4 ${ko(`${a.slug}.mp4`)} Ko · jpg ${ko(`${a.slug}.jpg`)} Ko · webp ${ko(`${a.slug}-1200.webp`)}/${ko(`${a.slug}-720.webp`)} Ko`);
}
await navigateur.close({ silent: true });
console.log("terminé", n);
