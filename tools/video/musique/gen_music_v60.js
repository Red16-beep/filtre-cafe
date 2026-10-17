// Fond musical lo-fi café pour la version Pinterest du tuto V60 (vertical, 44,8 s).
// Seedless : chaque exécution compose un morceau différent ; meta et drums.meta sont loggés pour figer une prise.
const path = require('path');
const fs = require('fs');
const m = require('/Users/redahassani/.claude/skills/build-music/tools');

const SORTIE = path.resolve(__dirname, '..', 'public', 'audio');
const DUREE_VIDEO = 44.8;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const genre = 'lofi-jazz';
const { chords, meta } = m.composeChords({ genre, voice: 'electricPiano' });
const bpm = m.suggestTempo(genre);
const BARS = Math.ceil(DUREE_VIDEO / (240 / bpm));
console.log('harmonie', JSON.stringify(meta), 'bpm', bpm, 'mesures', BARS);

const actif = (f) => m.arrangement.maskFromCycles(Array.from({ length: BARS }, (_, i) => f(i)));
const debutMelodie = Math.floor(BARS * 0.35);
const finMelodie = Math.floor(BARS * 0.75);
const masques = {
    basse: actif((i) => i >= 2),
    batterie: actif((i) => i >= 2 && i < BARS - 2),
    melodie: actif((i) => i >= debutMelodie && i < finMelodie),
};

// Accords : piano électrique, léger arpège à l'attaque, swing.
const stagger = +(0.06 + Math.random() * 0.12).toFixed(2);
const comp = m.chordEvents(chords, { voice: 'electricPiano', bars: BARS, velocity: 66, stagger });

// Basse douce, batterie feutrée.
const basse = m.mask(m.composeBass({ chords, genre, bars: BARS }), masques.basse, BARS, 4);
const batterie = m.composeDrums({ genre, bars: BARS, energy: 0.38, embellish: 0.35 });
console.log('batterie', JSON.stringify(batterie.meta));
for (const d of batterie) d.events = m.mask(d.events, masques.batterie, BARS, 4);

// Petite mélodie, seulement dans la partie centrale.
const voixMelodie = pick(['vibraphone', 'kalimba']);
const contour = pick(['arch', 'rising', 'descend-ascend', 'falling']);
const k = meta.key.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
const scaleRoot = k[1] + (parseInt(k[2]) + 1);
const melodie = m.mask(
    m.composeMelody({ chords, bars: BARS, notesPerBar: 4, octaveShift: 1, contour, scale: meta.scale, scaleRoot, restProbability: 0.32 }),
    masques.melodie, BARS, 4,
);
console.log('mélodie', voixMelodie, contour, 'mesures', debutMelodie, '→', finMelodie - 1, '· stagger', stagger);

const tracks = [
    m.track('ep', 'electricPiano', comp, {
        fx: { hpf: 180, lpf: 3400, reverb: 'mediumRoom', gain: 0.44 },
        humanize: { groove: 'swing', swingAmount: 0.16 },
    }),
    m.track('basse', 'subBass', basse, { fx: { hpf: 40, lpf: 220, gain: 0.6 } }),
    m.track('melodie', voixMelodie, melodie, { fx: { hpf: 500, lpf: 5200, reverb: 'largeHall', gain: 0.26, pan: 0.15 } }),
    ...batterie,
];

const out = m.render(tracks, { bpm, duration: DUREE_VIDEO + 3, master: { normalize: 'peak', glue: true, width: 1.15 } });
fs.mkdirSync(SORTIE, { recursive: true });
m.WavBuilder.write(out, path.join(SORTIE, 'v60-lofi.wav'));
