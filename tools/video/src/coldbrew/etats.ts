import { EtatBocal } from "../dessins/Bocal";
import { DOUX, SORTIE, cles, mix, prog } from "../theme";
import { EtatFroid, FROID } from "./PosteFroid";

// Cold brew, recette de base du site (cold-brew-maison) : 100 g de café en
// mouture très grossière pour 1 litre d'eau ; mélanger, couvrir, frigo 12 à
// 16 h (jamais plus de 20 h) ; filtrer au papier ; 10 jours au frigo.

const LIN = (t: number) => t;
type B = Omit<EtatBocal, "frame">;
const BOCAL: B = { marc: 0, eau: 0, teinte: 0, suspension: 0, couvercle: 0, inclinaison: 0 };

const base = (f: number, bocal: Partial<B> | null): EtatFroid => ({
  frame: f,
  poids: 0,
  temps: null,
  balance: 1,
  bocal: bocal ? { ...BOCAL, ...bocal } : null,
});

// --- 100 g de café, mouture très grossière (130) ------------------------------
export const CAFE_DUREE = 130;
export const etatCafe = (f: number): EtatFroid => ({
  ...base(f, { marc: cles(f, [[14, 0], [82, 1]]) }),
  mouture: prog(f, 10, 80, LIN),
  poids: f < 114 ? cles(f, [[14, 0], [80, 100]], LIN) : 0,
  tare: cles(f, [
    [108, 0],
    [112, 1],
    [120, 0],
  ]),
});

// --- 1 litre d'eau froide (150) ---------------------------------------------------
export const EAU_DUREE = 150;
export const etatEau = (f: number): EtatFroid => {
  const penche = prog(f, 14, 34, DOUX) * (1 - prog(f, 110, 126, DOUX));
  return {
    ...base(f, {
      marc: cles(f, [[30, 1], [110, 0.75]]),
      eau: cles(f, [[30, 0], [110, 1]], LIN),
      suspension: cles(f, [[30, 0], [110, 0.5]]),
      teinte: cles(f, [[30, 0], [140, 0.15]]),
    }),
    poids: cles(f, [[30, 0], [108, 1000]], LIN),
    pichet: { visible: prog(f, 0, 14) * (1 - prog(f, 128, 142)), angle: -62 * penche, versement: f >= 24 && f <= 116 ? prog(f, 24, 116, LIN) : 0 },
    repere: { lignes: ["1 L"], y: -236, visible: prog(f, 92, 108, SORTIE) * (1 - prog(f, 138, 150)) },
  };
};

// --- Mélanger (100) ----------------------------------------------------------------
export const MELANGER_DUREE = 100;
export const etatMelanger = (f: number): EtatFroid => ({
  ...base(f, {
    marc: cles(f, [[0, 0.75], [86, 0.3]]),
    eau: 1,
    suspension: cles(f, [[0, 0.5], [60, 1]]),
    teinte: cles(f, [[0, 0.15], [100, 0.3]], LIN),
    cuillere: { visible: prog(f, 4, 14) * (1 - prog(f, 86, 96)), phase: cles(f, [[10, 0], [86, 4]], LIN) },
  }),
  poids: 1000,
});

// --- Au frigo, 12 à 16 h (180) --------------------------------------------------
export const FRIGO_DUREE = 180;
export const etatFrigo = (f: number): EtatFroid => {
  const heures = cles(f, [[62, 0], [170, 14]], LIN);
  return {
    ...base(f, {
      marc: cles(f, [[60, 0.3], [170, 0.85]]),
      eau: 1,
      suspension: cles(f, [[0, 1], [170, 0.2]]),
      teinte: cles(f, [[66, 0.3], [170, 1]], LIN),
      couvercle: prog(f, 4, 24, SORTIE),
    }),
    poids: 1000,
    balance: 1 - prog(f, 20, 40),
    frigo: { trace: prog(f, 28, 80, DOUX), porte: 1 },
    attente: {
      restant: 0,
      p: heures / 16,
      visible: prog(f, 60, 72, SORTIE) * (1 - prog(f, 172, 180)),
      libelle: "AU FRIGO",
      texte: `${Math.max(1, Math.round(heures))} h`,
    },
  };
};

// --- Filtrer au papier (150) ------------------------------------------------------
export const FILTRER_DUREE = 150;
const VERSE = { x: 897, y: 794, s: 0.8 };
export const etatFiltrer = (f: number): EtatFroid => {
  const va = prog(f, 14, 44, DOUX);
  return {
    ...base(f, {
      marc: cles(f, [[44, 0.85], [126, 0]]),
      eau: cles(f, [[44, 1], [130, 0.06]], LIN),
      teinte: 1,
      suspension: 0.2,
      couvercle: 1 - prog(f, 6, 16),
      inclinaison: -105 * va,
    }),
    poids: null,
    balance: 0,
    bocalPos: { x: mix(FROID.x, VERSE.x, va), y: mix(FROID.y, VERSE.y, va), s: mix(FROID.s, VERSE.s, va) },
    frigo: f < 14 ? { trace: 1 - prog(f, 0, 14), porte: 1 } : null,
    filtre: {
      visible: prog(f, 4, 22, SORTIE),
      eau: cles(f, [[46, 0], [80, 0.62], [130, 0.6], [150, 0.4]]),
      lit: cles(f, [[46, 0], [126, 1]]),
      carafe: cles(f, [[64, 0], [150, 0.72]], LIN),
      gouttes: f < 62 ? 0 : 0.8,
      filet: f >= 42 && f <= 132 ? 1 : 0,
    },
  };
};

// --- Jusqu'à 10 jours au frigo (100) ----------------------------------------------
export const GARDER_DUREE = 100;
export const etatGarder = (f: number): EtatFroid => ({
  ...base(f, null),
  poids: null,
  balance: 0,
  filtre: {
    visible: 1,
    eau: cles(f, [[0, 0.4], [40, 0]]),
    lit: 1 - prog(f, 0, 24),
    carafe: cles(f, [[0, 0.72], [40, 0.8]]),
    gouttes: cles(f, [[0, 0.8], [40, 0]]),
    filet: 0,
    dripper: 1 - prog(f, 36, 56),
  },
  attente: { restant: 0, p: prog(f, 24, 90, DOUX), visible: prog(f, 20, 34, SORTIE), libelle: "AU FRIGO", texte: "10 j" },
});
