// Fond musical jazz-hop dans l'esprit de Nujabes, joué par de vrais instruments échantillonnés.
// Composition originale tirée au hasard (aucun thème ni grille d'un morceau existant), règles de style
// reprises de la fiche « jazzy-downtempo » du skill music-composer (jamcgrath, MIT).
// Instruments : Upright Piano KW (FreePats, CC0) et GeneralUser GS 2.0.3 (usage commercial libre), joués par
// spessasynth_core (Apache-2.0). Chaque partie est rendue à part, puis traitée façon disque : pleurage sur le
// piano, batterie un peu dégradée (12 bits, 26 kHz en parallèle), saturation, craquements de vinyle.
//
// node outils/musique-sf2.mjs <nom> <durée en s> [graine]
// Variables facultatives : MELODIE=flute|shakuhachi|guitare|sax, BATTERIE=room|jazz|standard (sinon tirées au hasard).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SoundBankLoader, SpessaSynthProcessor, SpessaSynthSequencer, MIDIBuilder, SpessaLog, audioToWav } from "spessasynth_core";

SpessaLog.setLogLevel(false, false, false);
const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SR = 48000;
const PPQ = 480;
const DECALAGE = 100; // banque du piano Kawai : CC0 = 100
const [, , nom, dureeTxt, graineTxt] = process.argv;
if (!nom || !dureeTxt) {
  console.error("usage : node outils/musique-sf2.mjs <nom> <durée en s> [graine]");
  process.exit(1);
}
const DUREE = Number(dureeTxt);
const GRAINE = graineTxt ? Number(graineTxt) : Math.floor(Math.random() * 2 ** 31);

// ── Hasard reproductible ─────────────────────────────────────────────────────
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(GRAINE);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const entre = (a, b) => a + rnd() * (b - a);
const ent = (a, b) => Math.round(entre(a, b));

// ── Harmonie : grilles génériques du jazz-hop, accords sans fondamentale ──────
// Intervalles des formes A et B (Bill Evans) par qualité, depuis la fondamentale.
const FORMES = {
  m9: [[3, 7, 10, 14], [10, 14, 15, 19]],
  maj9: [[4, 7, 11, 14], [11, 14, 16, 19]],
  "13": [[4, 9, 10, 14], [10, 14, 16, 21]],
  "7b13": [[4, 8, 10, 14], [10, 14, 16, 20]],
  "69": [[4, 7, 9, 14], [9, 14, 16, 19]],
};
// Degrés : décalage en demi-tons depuis la tonique, qualité.
const GRILLES = [
  { mode: "majeur", g: [[2, "m9"], [7, "13"], [0, "maj9"], [9, "7b13"]] }, // ii9 V13 Imaj9 VI7b13
  { mode: "majeur", g: [[2, "m9"], [7, "13"], [0, "maj9"], [5, "maj9"]] }, // ii9 V13 Imaj9 IVmaj9
  { mode: "majeur", g: [[9, "m9"], [2, "m9"], [7, "13"], [0, "maj9"]] }, // vi9 ii9 V13 Imaj9
  { mode: "majeur", g: [[4, "m9"], [0, "maj9"], [2, "m9"], [7, "13"]] }, // iii9 Imaj9 ii9 V13
  { mode: "mineur", g: [[0, "m9"], [5, "m9"], [10, "13"], [3, "maj9"]] }, // i9 iv9 bVII13 bIIImaj9
  { mode: "mineur", g: [[0, "m9"], [8, "maj9"], [5, "m9"], [7, "7b13"]] }, // i9 bVImaj9 iv9 V7b13
  { mode: "dorien", g: [[0, "m9"], [0, "m9"], [5, "13"], [5, "13"]] }, // i9 – IV13, deux mesures chacun
  { mode: "mineur", g: [[5, "m9"], [10, "13"], [0, "m9"], [0, "69"]] }, // iv9 bVII13 i9 (i6/9)
];

// Choisit la voix la plus proche de la précédente : note basse entre 50 et 60, note haute ≤ 74.
function voicer(racine, qualite, avant) {
  const cand = [];
  for (const forme of FORMES[qualite]) {
    for (let oct = -2; oct <= 2; oct++) {
      const v = forme.map((i) => racine + i + 12 * oct);
      if (v[0] >= 50 && v[0] <= 60 && v[v.length - 1] <= 74) cand.push(v);
    }
  }
  if (!avant) return cand[Math.floor(cand.length / 2)] ?? FORMES[qualite][0].map((i) => racine + i);
  let best = cand[0], d = Infinity;
  for (const v of cand) {
    const s = v.reduce((t, n, k) => t + Math.abs(n - avant[k]), 0);
    if (s < d) { d = s; best = v; }
  }
  return best;
}

// ── Plan du morceau ──────────────────────────────────────────────────────────
const bpm = ent(82, 92);
const beatSec = 60 / bpm;
const MESURES = Math.ceil(DUREE / (4 * beatSec)) + 1;
const grille = pick(GRILLES);
const tonique = pick([53, 55, 56, 58, 60, 51, 50]); // fa, sol, la bémol, si bémol, do, mi bémol, ré
const KITS = { room: { prog: 8, nom: "Room" }, jazz: { prog: 32, nom: "Jazz" }, standard: { prog: 0, nom: "Standard" } };
const kit = KITS[process.env.BATTERIE] ?? pick(Object.values(KITS));
// sax : ténor, joué une octave plus bas que la flûte (registre chaud du ténor, ré 3 à ré 5).
const LEADS = { flute: { prog: 73, nom: "flûte" }, shakuhachi: { prog: 77, nom: "shakuhachi" }, guitare: { prog: 26, nom: "guitare jazz" }, sax: { prog: 66, nom: "saxophone ténor", octave: -12 } };
const lead = LEADS[process.env.MELODIE] ?? pick([LEADS.flute, LEADS.flute, LEADS.shakuhachi, LEADS.guitare]);
const swing = entre(0.56, 0.6);
const intro = 2;
const finBatterie = MESURES - 1;
const debutLead = Math.max(intro + 2, Math.round(MESURES * 0.35));
const finLead = Math.round(MESURES * 0.88);
const debutCordes = Math.round(MESURES * 0.5);
const accords = []; // un accord par mesure, boucle de 4 mesures
let avant = null;
for (let b = 0; b < 4; b++) {
  const [deg, q] = grille.g[b];
  const racine = tonique + deg;
  const v = voicer(racine, q, avant);
  accords.push({ racine, q, v });
  avant = v;
}
console.log(`${nom} · graine ${GRAINE} · ${bpm} bpm · ${MESURES} mesures · tonique ${tonique} (${grille.mode}) · grille ${grille.g.map(([d, q]) => d + q).join(" ")} · batterie ${kit.nom} · mélodie ${lead.nom} · swing ${(swing * 100).toFixed(0)} %`);

// ── Écriture des parties (en temps, battements depuis le début) ──────────────
const ms = (x) => (x / 1000) / beatSec; // millisecondes → battements
const sw = (t) => { // swing sur les doubles croches impaires
  const q = Math.round(t * 4);
  if (Math.abs(t * 4 - q) < 1e-6 && q % 2 === 1) return Math.floor(t * 2) / 2 + 0.5 * swing;
  return t;
};
const parties = { piano: [], basse: [], lead: [], cordes: [], batterie: [] };
const note = (p, t, n, dur, vel) => parties[p].push({ t, n, dur, vel: Math.max(1, Math.min(127, Math.round(vel))) });

// Piano : motif de comp sur 4 mesures, rejoué à l'identique comme un échantillon ; variation sur la 2e moitié.
const motifs = [
  [[0, 1.4], [1.5, 1.0], [2.75, 1.1]], // comp paresseux
  [[0, 1.4], [1.5, 0.5]], // Charleston
  [[0, 0.7], [0.75, 0.7], [1.5, 0.7], [2.25, 1.6]], // croche pointée
  [[0, 2.6], [2.75, 1.0]],
];
const motifA = pick(motifs);
const motifB = pick(motifs);
const velPiano = Array.from({ length: 16 }, () => ent(52, 68));
for (let m = 0; m < MESURES; m++) {
  const a = accords[m % 4];
  const motif = m >= Math.round(MESURES * 0.55) && m < MESURES - 1 ? motifB : motifA;
  const derniere = m === MESURES - 1;
  const hits = derniere ? [[0, 4]] : motif;
  hits.forEach(([t, d], h) => {
    const anticipe = !derniere && h === hits.length - 1 && t >= 2.75 && rnd() < 0.3 ? -0.25 : 0;
    a.v.forEach((n, k) => {
      const roule = ms(8 + k * 6); // accord égrené de bas en haut
      note("piano", m * 4 + t + anticipe + roule + ms(8), n, d, velPiano[(m % 4) * 4 + h] - k * 2 + (k === a.v.length - 1 ? 4 : 0));
    });
  });
}

// Basse : contrebasse, fondamentale, quinte, note de passage chromatique vers l'accord suivant.
for (let m = intro; m < MESURES; m++) {
  const a = accords[m % 4], s = accords[(m + 1) % 4];
  let r = a.racine - 24; while (r < 33) r += 12; while (r > 45) r -= 12;
  let rs = s.racine - 24; while (rs < 33) rs += 12; while (rs > 45) rs -= 12;
  const tierce = a.q === "m9" ? 3 : 4;
  const derniere = m === MESURES - 1;
  note("basse", m * 4 + ms(6), r, derniere ? 3.5 : 1.4, ent(92, 104));
  if (derniere) continue;
  const motif = pick([[[1.5, r + 7, 0.45], [2, r + 12, 0.9], [3, r + tierce + 12, 0.45]], [[2, r + 7, 1.3]], [[1.75, r + 7, 0.4], [2.5, r + 10, 0.9]]]);
  for (const [t, n, d] of motif) note("basse", m * 4 + sw(t) + ms(ent(4, 12)), n, d, ent(74, 90));
  const approche = rs + (rnd() < 0.5 ? -1 : 1);
  note("basse", m * 4 + sw(3.75) + ms(10), approche, 0.25, ent(70, 82));
}

// Batterie : boom-bap balancé (grille de 16 pas), caisse claire en retard, notes fantômes.
for (let m = intro; m < finBatterie; m++) {
  const varB = m % 2 === 1;
  const kicks = varB ? [0, 2, 9, 10] : [0, 7, 10];
  if (varB && m % 4 === 3) kicks.push(15);
  for (const s of kicks) note("batterie", m * 4 + sw(s / 4) + ms(ent(-3, 3)), 36, 0.2, s === 0 ? ent(108, 118) : ent(78, 94));
  for (const s of [4, 12]) note("batterie", m * 4 + s / 4 + ms(ent(10, 18)), 38, 0.2, ent(100, 114));
  for (const s of [6, 9, 15]) if (rnd() < 0.7) note("batterie", m * 4 + sw(s / 4) + ms(ent(12, 24)), 38, 0.1, ent(24, 40));
  for (let s = 0; s < 16; s += 2) {
    if (m % 4 === 3 && s === 14) { note("batterie", m * 4 + sw(14 / 4) + ms(ent(-4, 6)), 46, 0.4, ent(62, 74)); continue; }
    note("batterie", m * 4 + s / 4 + ms(ent(-5, 6)), 42, 0.1, s % 4 === 0 ? ent(76, 90) : ent(54, 70));
  }
  for (const s of [11, 13]) if (rnd() < 0.6) note("batterie", m * 4 + sw(s / 4) + ms(ent(-4, 6)), 42, 0.08, ent(38, 52));
}

// Mélodie : motif original de 3 à 5 notes, question puis réponse, notes de l'accord sur les temps forts.
const gamme = grille.mode === "majeur" ? [0, 2, 4, 7, 9] : grille.mode === "dorien" ? [0, 2, 3, 5, 7, 9, 10] : [0, 3, 5, 7, 10];
const hauteurs = [];
for (let n = 60; n <= 86; n++) if (gamme.includes(((n - tonique) % 12 + 12) % 12)) hauteurs.push(n);
const proche = (cible, liste) => liste.reduce((b, n) => (Math.abs(n - cible) < Math.abs(b - cible) ? n : b), liste[0]);
const longueur = ent(3, 5);
const rythme = pick([[0.5, 1, 1.5, 2.5, 3], [0.75, 1.25, 2, 2.75, 3.5], [0.5, 1.5, 1.75, 2.5, 3.5]]).slice(0, longueur);
const pas = Array.from({ length: longueur }, () => pick([-2, -1, 1, 2, 0]));
for (let m = debutLead; m < finLead; m += 2) {
  const a = accords[m % 4];
  const sommet = Math.max(...a.v);
  let idx = hauteurs.indexOf(proche(sommet + ent(3, 7), hauteurs.filter((n) => n > sommet)));
  if (idx < 0) idx = Math.floor(hauteurs.length / 2);
  const reponse = ((m - debutLead) / 2) % 2 === 1;
  rythme.forEach((t, k) => {
    idx = Math.max(0, Math.min(hauteurs.length - 1, idx + (reponse ? -pas[k] : pas[k])));
    let n = hauteurs[idx];
    const fort = Math.abs(t - Math.round(t)) < 1e-6 && Math.round(t) % 2 === 0;
    if (fort) n = proche(n, a.v.flatMap((x) => [x + 12, x + 24]).filter((x) => x >= 62 && x <= 86));
    const dernier = k === rythme.length - 1;
    note("lead", m * 4 + sw(t) + ms(ent(10, 30)), n + (lead.octave ?? 0), dernier ? entre(1.2, 2) : entre(0.35, 0.7), ent(72, 92) + (dernier ? -6 : 0));
  });
}

// Cordes lentes : tierce et septième tenues, en seconde moitié.
for (let m = debutCordes; m < MESURES; m++) {
  const a = accords[m % 4];
  for (const n of [a.v[0], a.v[2]]) note("cordes", m * 4 + ms(20), n, 3.9, ent(40, 52));
}

// ── MIDI par partie ──────────────────────────────────────────────────────────
const INSTRUMENTS = {
  piano: { canal: 0, bank: DECALAGE, prog: 0, vol: 104, rev: 46, pan: 60 },
  basse: { canal: 1, bank: 0, prog: 32, vol: 112, rev: 8, pan: 64 },
  lead: { canal: 2, bank: 0, prog: lead.prog, vol: 92, rev: 72, pan: 74 },
  cordes: { canal: 3, bank: 0, prog: 49, vol: 76, rev: 84, pan: 54 },
  batterie: { canal: 9, bank: 0, prog: kit.prog, vol: 112, rev: 22, pan: 64 },
};
function construireMidi(partie) {
  const ins = INSTRUMENTS[partie];
  const midi = new MIDIBuilder({ name: partie, timeDivision: PPQ, initialTempo: bpm, format: 1 });
  midi.addTrack(partie);
  const c = ins.canal;
  midi.controllerChange(0, 1, c, 0, ins.bank);
  midi.controllerChange(0, 1, c, 32, 0);
  midi.programChange(1, 1, c, ins.prog);
  midi.controllerChange(2, 1, c, 7, ins.vol);
  midi.controllerChange(2, 1, c, 10, ins.pan);
  midi.controllerChange(2, 1, c, 91, ins.rev);
  midi.controllerChange(2, 1, c, 93, 0);
  for (const e of parties[partie]) {
    const t0 = Math.max(4, Math.round(e.t * PPQ));
    const t1 = Math.max(t0 + 10, Math.round((e.t + e.dur) * PPQ));
    midi.noteOn(t0, 1, c, e.n, e.vel);
    midi.noteOff(t1, 1, c, e.n);
  }
  midi.controllerChange(Math.round((MESURES * 4 + 2) * PPQ), 1, c, 64, 0); // prolonge la fin pour les queues
  midi.flush();
  return midi;
}

// ── Rendu ────────────────────────────────────────────────────────────────────
const enAB = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const banqueGU = SoundBankLoader.fromArrayBuffer(enAB(await fs.readFile(path.join(RACINE, "sons/GeneralUser-GS.sf2"))));
const banquePiano = SoundBankLoader.fromArrayBuffer(enAB(await fs.readFile(path.join(RACINE, "sons/UprightPianoKW-20220221.sf2"))));
const LONG = Math.ceil(SR * (DUREE + 3));
async function rendre(partie) {
  const synth = new SpessaSynthProcessor(SR, { eventsEnabled: false, effectsEnabled: true });
  synth.soundBankManager.addSoundBank(banqueGU, "gu");
  synth.soundBankManager.addSoundBank(banquePiano, "kawai", DECALAGE);
  await synth.processorInitialized;
  synth.setSystemParameter("autoAllocateVoices", true);
  const seq = new SpessaSynthSequencer(synth);
  seq.skipToFirstNoteOn = false;
  seq.loadNewSongList([construireMidi(partie)]);
  seq.play();
  const g = new Float32Array(LONG), d = new Float32Array(LONG);
  for (let i = 0; i < LONG; i += 128) {
    seq.processTick();
    synth.process(g, d, i, Math.min(128, LONG - i));
  }
  return [g, d];
}

// ── Traitement « disque » ────────────────────────────────────────────────────
function biquad(x, type, f, Q = 0.707) {
  const w = (2 * Math.PI * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * Q);
  let b0, b1, b2;
  if (type === "lp") { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; } else { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
  const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}
const filtrer = (st, type, f, Q) => st.forEach((c) => biquad(c, type, f, Q));
const saturer = (st, k) => st.forEach((c) => { const n = Math.tanh(k); for (let i = 0; i < c.length; i++) c[i] = Math.tanh(k * c[i]) / n; });
const gain = (st, g) => st.forEach((c) => { for (let i = 0; i < c.length; i++) c[i] *= g; });
function pleurage(st, wowHz, wowPct, flutHz, flutPct) { // délai modulé : la hauteur oscille comme une bande
  const aw = (wowPct / 100) / (2 * Math.PI * wowHz) * SR, af = (flutPct / 100) / (2 * Math.PI * flutHz) * SR;
  const base = aw + af + 4, ph = rnd() * 6.28;
  st.forEach((c) => {
    const src = Float32Array.from(c);
    for (let i = 0; i < c.length; i++) {
      const t = i / SR, dl = base + aw * Math.sin(2 * Math.PI * wowHz * t + ph) + af * Math.sin(2 * Math.PI * flutHz * t);
      const p = i - dl, k = Math.floor(p), fr = p - k;
      c[i] = k < 0 ? 0 : src[k] * (1 - fr) + (src[k + 1] ?? 0) * fr;
    }
  });
}
function degrader(st, bits, freq, melange) { // échantillonneur 12 bits en parallèle
  const pasEch = SR / freq, q = 2 ** (bits - 1);
  st.forEach((c) => {
    let tenu = 0, acc = pasEch;
    for (let i = 0; i < c.length; i++) {
      acc += 1; if (acc >= pasEch) { acc -= pasEch; tenu = Math.round(c[i] * q) / q; }
      c[i] = c[i] * (1 - melange) + tenu * melange;
    }
  });
}
const rms = (st) => Math.sqrt(st.reduce((s, c) => s + c.reduce((t, v) => t + v * v, 0), 0) / (st.length * st[0].length));

const stems = {};
for (const p of Object.keys(parties)) stems[p] = await rendre(p);

// Piano : comme un échantillon de disque — filtré, un peu saturé, pleurage lent.
filtrer(stems.piano, "hp", 90); filtrer(stems.piano, "lp", 4800, 0.6); saturer(stems.piano, 1.3); pleurage(stems.piano, 0.55, 0.22, 7.5, 0.05);
// Batterie : bus filtré, 12 bits / 26 kHz en parallèle, saturation de bande.
filtrer(stems.batterie, "hp", 38); filtrer(stems.batterie, "lp", 10500, 0.6); degrader(stems.batterie, 12, 26000, 0.45); saturer(stems.batterie, 1.6);
// Basse : ronde, audible sur un petit haut-parleur.
filtrer(stems.basse, "lp", 1600, 0.6); saturer(stems.basse, 1.4);
// Mélodie et cordes : adoucies.
filtrer(stems.lead, "lp", 6000, 0.6); filtrer(stems.cordes, "hp", 220); filtrer(stems.cordes, "lp", 4500, 0.6);

// Équilibre (niveaux RMS relatifs, en dB sous le piano).
const niveaux = { piano: 0, basse: -1.5, batterie: 0.5, lead: -3, cordes: -9 };
const ref = rms(stems.piano) || 1e-6;
const mix = [new Float32Array(LONG), new Float32Array(LONG)];
for (const [p, st] of Object.entries(stems)) {
  const r = rms(st);
  if (r < 1e-7) continue;
  const g = (ref / r) * 10 ** (niveaux[p] / 20);
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < LONG; i++) mix[ch][i] += st[ch][i] * g;
}

// Bus : compression douce (2:1), ombre de bande, souffle et craquements de vinyle.
(() => {
  let env = 0; const at = Math.exp(-1 / (0.012 * SR)), re = Math.exp(-1 / (0.18 * SR));
  const seuil = rms(mix) * 1.6;
  for (let i = 0; i < LONG; i++) {
    const v = Math.max(Math.abs(mix[0][i]), Math.abs(mix[1][i]));
    env = v > env ? at * env + (1 - at) * v : re * env + (1 - re) * v;
    const g = env > seuil ? Math.pow(seuil / env, 0.5) : 1;
    mix[0][i] *= g; mix[1][i] *= g;
  }
})();
filtrer(mix, "lp", 12000, 0.6);
const niveauMusique = rms(mix);
const bruit = [new Float32Array(LONG), new Float32Array(LONG)];
for (let ch = 0; ch < 2; ch++) {
  let lp = 0;
  for (let i = 0; i < LONG; i++) { lp += 0.25 * ((rnd() * 2 - 1) - lp); bruit[ch][i] = lp * 0.04; }
}
for (let c = 0, nb = Math.floor((LONG / SR) * 7); c < nb; c++) {
  const pos = Math.floor(rnd() * (LONG - 300)), amp = entre(0.3, 1) * (rnd() < 0.08 ? 2 : 1), len = ent(30, 140), pan = rnd();
  for (let j = 0; j < len; j++) {
    const v = amp * Math.exp(-j / (len / 5)) * (rnd() * 2 - 1);
    bruit[0][pos + j] += v * (1 - pan * 0.6); bruit[1][pos + j] += v * (0.4 + pan * 0.6);
  }
}
filtrer(bruit, "hp", 300); filtrer(bruit, "lp", 8000);
const gBruit = (niveauMusique * 10 ** (-26 / 20)) / (rms(bruit) || 1);
for (let ch = 0; ch < 2; ch++) for (let i = 0; i < LONG; i++) mix[ch][i] += bruit[ch][i] * gBruit;

// Niveau final : RMS visé vers -15 dBFS, crêtes arrondies sous -1 dB.
gain(mix, 10 ** (-15 / 20) / (rms(mix) || 1));
const plafond = 10 ** (-1 / 20);
mix.forEach((c) => { for (let i = 0; i < c.length; i++) { const v = c[i] / plafond; c[i] = plafond * (Math.abs(v) < 0.8 ? v : Math.sign(v) * (0.8 + 0.2 * Math.tanh((Math.abs(v) - 0.8) / 0.2))); } });

const sortie = path.join(RACINE, "public/audio", `${nom}-sf2.wav`);
await fs.mkdir(path.dirname(sortie), { recursive: true });
await fs.writeFile(sortie, new Uint8Array(audioToWav(mix, SR, { normalizeAudio: false })));
console.log("écrit", sortie);
