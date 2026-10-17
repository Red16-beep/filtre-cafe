// Fond jazz-hop dans l'esprit de Nujabes (style seulement, aucun thème repris) :
// accords jazz égrenés comme un échantillon de piano, mélodie composée, boom-bap balancé, basse ronde,
// nappe de cordes en seconde moitié, souffle et craquements de vinyle synthétisés.
// node gen_music_jazzhop.js <nom> <durée s> <gamme> <grille séparée par des virgules> <voix accords> <voix mélodie> <énergie>
const path = require('path');
const fs = require('fs');
const m = require('/Users/redahassani/.claude/skills/build-music/tools');

const SORTIE = path.resolve(__dirname, '..', 'public', 'audio');
const [, , nom, dureeTxt, gamme, grilleTxt, voixAccords, voixMelodie, energieTxt] = process.argv;
const DUREE = Number(dureeTxt);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const { chords, meta } = m.composeChords({
    genre: 'lofi-jazz', voice: voixAccords, scale: gamme, progression: grilleTxt.split(','),
    extension: pick(['7', '9', '9']), voicing: pick(['rootless7th', 'drop2']),
});
let bpm = m.suggestTempo('hip-hop');
for (let i = 0; (bpm < 84 || bpm > 94) && i < 200; i++) bpm = m.suggestTempo('hip-hop');
const BARS = Math.ceil(DUREE / (240 / bpm));
console.log(nom, 'harmonie', JSON.stringify(meta), 'bpm', bpm, 'mesures', BARS);

const actif = (f) => m.arrangement.maskFromCycles(Array.from({ length: BARS }, (_, i) => f(i)));
const debutMelodie = Math.max(2, Math.floor(BARS * 0.3));
const finMelodie = Math.floor(BARS * 0.9);
const debutNappe = Math.floor(BARS * 0.5);

// Accords « samplés » : un motif rythmique par morceau, notes égrenées de bas en haut.
const motifs = [
    [[0, 1.5, 76], [1.5, 1, 62], [3, 1, 58]],
    [[0, 2.5, 74], [2.5, 1.5, 60]],
    [[0, 0.75, 72], [0.75, 1.75, 66], [3, 1, 56]],
    [[0, 1.5, 74], [2, 0.75, 58], [2.75, 1.25, 64]],
];
const motif = pick(motifs);
const comp = [];
for (let bar = 0; bar < BARS; bar++) {
    const ch = chords[bar % chords.length];
    for (const [t, d, v] of motif) ch.notes.forEach((n, j) => comp.push({ time: bar * 4 + t + j * 0.035, beats: d, value: n, velocity: v }));
}

const basse = m.mask(m.composeBass({ chords, genre: 'hip-hop', style: 'root-fifth', bars: BARS, variation: 0.45 }), actif((i) => i >= 2), BARS, 4);
const batterie = m.composeDrums({ genre: 'hip-hop', bars: BARS, energy: Number(energieTxt), embellish: 0.45 });
console.log(nom, 'batterie', JSON.stringify(batterie.meta), '· motif', motifs.indexOf(motif));
for (const d of batterie) d.events = m.mask(d.events, actif((i) => i >= 2 && i < BARS - 1), BARS, 4);

const contour = pick(['arch', 'rising', 'descend-ascend', 'falling']);
const k = meta.key.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
const scaleRoot = k[1] + (parseInt(k[2]) + 1);
const melodie = m.mask(
    m.composeMelody({ chords, bars: BARS, notesPerBar: pick([4, 8]), octaveShift: 1, contour, scale: meta.scale, scaleRoot, restProbability: 0.3 }),
    actif((i) => i >= debutMelodie && i < finMelodie), BARS, 4,
);
const nappe = m.mask(m.chordEvents(chords, { voice: 'pad', bars: BARS, velocity: 46 }), actif((i) => i >= debutNappe), BARS, 4);
console.log(nom, 'mélodie', voixMelodie, contour, 'mesures', debutMelodie, '→', finMelodie - 1, '· nappe dès', debutNappe);

const tracks = [
    m.track('accords', voixAccords, comp, { fx: { hpf: 160, lpf: voixAccords === 'piano' ? 4200 : 3600, reverb: 'mediumRoom', gain: 0.46 }, humanize: { groove: 'swing', swingAmount: 0.14 } }),
    m.track('basse', 'subBass', basse, { fx: { hpf: 40, lpf: 320, gain: 0.66 } }),
    m.track('melodie', voixMelodie, melodie, { fx: { hpf: 450, lpf: 5600, reverb: 'largeHall', gain: 0.27, pan: 0.12 } }),
    m.track('cordes', 'pad', nappe, { fx: { hpf: 220, lpf: 3200, reverb: 'largeHall', gain: 0.13, chorus: { voices: 3, mix: 0.35 } } }),
    ...batterie,
];
const out = m.render(tracks, { bpm, duration: DUREE + 3, master: { normalize: 'peak', glue: true, width: 1.15 } });

// Souffle et craquements de vinyle (bruit synthétisé, aucun échantillon).
let graine = (Math.random() * 4294967296) >>> 0;
const rnd = () => ((graine = (graine * 1664525 + 1013904223) >>> 0) / 4294967296);
const n = out.left.length;
let lp = 0, hpPrec = 0, hp = 0;
for (let i = 0; i < n; i++) {
    lp += 0.08 * ((rnd() * 2 - 1) - lp);
    hp = 0.995 * (hp + lp - hpPrec); hpPrec = lp;
    out.left[i] = out.left[i] * 0.93 + hp * 0.013;
    out.right[i] = out.right[i] * 0.93 + hp * 0.012;
}
for (let c = 0, nb = Math.floor((n / 44100) * 9); c < nb; c++) {
    const pos = Math.floor(rnd() * (n - 400)), amp = (0.015 + rnd() * 0.045) * (rnd() < 0.08 ? 2 : 1), pan = rnd(), len = 40 + Math.floor(rnd() * 150);
    for (let j = 0; j < len; j++) {
        const v = amp * Math.exp(-j / (len / 5)) * (rnd() * 2 - 1);
        out.left[pos + j] += v * (1 - pan * 0.6);
        out.right[pos + j] += v * (0.4 + pan * 0.6);
    }
}
for (let i = 0; i < n; i++) { out.left[i] = Math.max(-0.98, Math.min(0.98, out.left[i])); out.right[i] = Math.max(-0.98, Math.min(0.98, out.right[i])); }

fs.mkdirSync(SORTIE, { recursive: true });
m.WavBuilder.write(out, path.join(SORTIE, `${nom}-jazzhop.wav`));
