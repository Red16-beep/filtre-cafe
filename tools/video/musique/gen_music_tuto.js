// Fond musical d'un tuto vidéo : un genre et une palette par méthode, composition seedless.
// node gen_music_tuto.js <nom> <durée en s> <genre> <voix des accords> <voix de la mélodie> <énergie batterie> [nappe]
// meta et drums.meta sont loggés pour figer une prise appréciée.
// Variables facultatives : BPM_MAX (tempo tiré au hasard mais plafonné, pour rester calme), BATTERIE (groove d'un autre genre).
const path = require('path');
const fs = require('fs');
const m = require('/Users/redahassani/.claude/skills/build-music/tools');

const SORTIE = path.resolve(__dirname, '..', 'public', 'audio');
const [, , nom, dureeTxt, genre, voixAccords, voixMelodie, energieTxt, nappe] = process.argv;
const DUREE = Number(dureeTxt);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const { chords, meta } = m.composeChords({ genre, voice: voixAccords });
let bpm = m.suggestTempo(genre);
for (let i = 0; process.env.BPM_MAX && bpm > Number(process.env.BPM_MAX) && i < 200; i++) bpm = m.suggestTempo(genre);
const BARS = Math.ceil(DUREE / (240 / bpm));
console.log(nom, 'harmonie', JSON.stringify(meta), 'bpm', bpm, 'mesures', BARS);

const actif = (f) => m.arrangement.maskFromCycles(Array.from({ length: BARS }, (_, i) => f(i)));
const debutMelodie = Math.floor(BARS * 0.35);
const finMelodie = Math.floor(BARS * 0.75);
const masques = {
    basse: actif((i) => i >= 2),
    batterie: actif((i) => i >= 2 && i < BARS - 2),
    melodie: actif((i) => i >= debutMelodie && i < finMelodie),
};

const pince = ['nylonGuitar', 'pluckString', 'kalimba', 'marimba'].includes(voixAccords);
const stagger = +((pince ? 0.16 : 0.05) + Math.random() * 0.1).toFixed(2);
const accords = m.chordEvents(chords, { voice: voixAccords, bars: BARS, velocity: 66, stagger });
const basse = m.mask(m.composeBass({ chords, genre, bars: BARS }), masques.basse, BARS, 4);
const batterie = m.composeDrums({ genre: process.env.BATTERIE || genre, bars: BARS, energy: Number(energieTxt), embellish: 0.35 });
console.log(nom, 'batterie', JSON.stringify(batterie.meta));
for (const d of batterie) d.events = m.mask(d.events, masques.batterie, BARS, 4);

const contour = pick(['arch', 'rising', 'descend-ascend', 'falling']);
const k = meta.key.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
const octave = voixMelodie === 'musicBox' ? 2 : 1;
const scaleRoot = k[1] + (parseInt(k[2]) + octave);
const melodie = m.mask(
    m.composeMelody({ chords, bars: BARS, notesPerBar: pick([4, 4, 8]), octaveShift: octave, contour, scale: meta.scale, scaleRoot, restProbability: 0.34 }),
    masques.melodie, BARS, 4,
);
console.log(nom, 'mélodie', voixMelodie, contour, 'mesures', debutMelodie, '→', finMelodie - 1, '· stagger', stagger);

const reverbAccords = voixAccords === 'pad' ? 'largeHall' : 'mediumRoom';
const tracks = [
    m.track('accords', voixAccords, accords, {
        fx: voixAccords === 'pad'
            ? { hpf: 200, lpf: 3000, reverb: reverbAccords, gain: 0.24, chorus: { voices: 3, mix: 0.35 } }
            : { hpf: 180, lpf: voixAccords === 'organ' ? 2600 : 3600, reverb: reverbAccords, gain: 0.42 },
        humanize: genre.includes('jazz') || genre === 'lofi' ? { groove: 'swing', swingAmount: 0.15 } : undefined,
    }),
    m.track('basse', 'subBass', basse, { fx: { hpf: 40, lpf: genre === 'jazz' ? 420 : 230, gain: 0.6 } }),
    m.track('melodie', voixMelodie, melodie, { fx: { hpf: 500, lpf: 5400, reverb: 'largeHall', gain: 0.26, pan: 0.15 } }),
    ...batterie,
];
if (nappe) {
    const ev = m.chordEvents(chords, { voice: nappe, bars: BARS, velocity: 48 });
    tracks.push(m.track('nappe', nappe, ev, { fx: { hpf: 220, lpf: 4200, reverb: 'largeHall', gain: 0.22 } }));
}

const out = m.render(tracks, { bpm, duration: DUREE + 3, master: { normalize: 'peak', glue: true, width: 1.15 } });
fs.mkdirSync(SORTIE, { recursive: true });
m.WavBuilder.write(out, path.join(SORTIE, `${nom}-musique.wav`));
