import { Easing } from "remotion";
import { DOUX, SORTIE, cles, mix, prog } from "../theme";
import { LieuGeste, Versement, geste } from "../v60/etats";
import { CHX, EtatChemex } from "./PosteChemex";

// Chemex, recette de l'article chemex-guide-complet : filtre côté triple contre
// le bec, rincé, eau jetée par le bec ; 45 g de café ; bloom de 90 g, 30 s ;
// versements jusqu'à 450, 600 puis 750 g ; 4 à 5 min au total ; retirer le filtre.

const LIN = (t: number) => t;
const R = CHX.bouilloireRepos;
const DEHORS = CHX.bouilloireDehors;
const LIEU: LieuGeste = { pointe: CHX.pointe, repos: R, sx: 0.8, sy: 0.26 };
const g = (f: number, v: Versement) => geste(f, v, LIEU);

const base = (f: number): EtatChemex => ({
  frame: f,
  bouilloire: R,
  filet: null,
  impactX: 0,
  poids: 0,
  temps: null,
  papier: 1,
  papierMouille: 1,
  lit: 1,
  dome: 0,
  bulles: 0,
  eau: 0,
  niveau: 0,
  teinte: 1,
  gouttes: 0,
});

// --- Filtre : poser, rincer, vider par le bec, café, tare (230) ------------
export const FILTRE_DUREE = 230;
export const RINCER_A = 56; // la légende passe au rinçage
export const CAFE_A = 182; // puis au café
const RINCE: Versement = { a0: 58, a1: 68, f0: 68, f1: 98, r1: 110, rMax: 44, tours: 2, angle0: -21, angle1: -24, cible: "", eauCible: 0 };

export const etatFiltre = (f: number): EtatChemex => {
  const entree = prog(f, 0, 22, SORTIE);
  const v = g(f, RINCE);
  const leve = 40 * prog(f, 126, 138, DOUX) * (1 - prog(f, 168, 180, DOUX));
  const penche = prog(f, 130, 146, DOUX) * (1 - prog(f, 162, 176, DOUX));
  return {
    ...base(f),
    bouilloire:
      f < 22
        ? { x: mix(DEHORS.x, R.x, entree), y: mix(DEHORS.y, R.y, entree), angle: mix(DEHORS.angle, R.angle, entree) }
        : v.bouilloire,
    filet: v.filet,
    impactX: v.impactX,
    traine: v.traine,
    poids: f < 184 ? 0 : cles(f, [[188, 0], [212, 45]], LIN),
    tare: cles(f, [
      [216, 0],
      [220, 1],
      [228, 0],
    ]),
    papier: prog(f, 0, 12),
    papierDy: -240 * (1 - prog(f, 0, 30, SORTIE)),
    papierMouille: cles(f, [
      [70, 0],
      [94, 1],
    ]),
    lit: cles(f, [
      [188, 0],
      [212, 1],
    ]),
    eau: cles(f, [
      [70, 0],
      [82, 0.12],
      [98, 0.08],
      [122, 0],
    ]),
    niveau: f < 146 ? cles(f, [[80, 0], [128, 0.26]], LIN) : cles(f, [[146, 0.26], [164, 0]]),
    teinte: 0,
    gouttes: cles(f, [
      [78, 0],
      [88, 0.65],
      [106, 0.6],
      [126, 0],
    ]),
    mouture: f >= 184 ? prog(f, 184, 212, LIN) : undefined,
    inclinaison: -50 * penche,
    leve,
    vidage: f >= 144 && f <= 168 ? prog(f, 144, 168, LIN) : 0,
    triple: prog(f, 18, 32, SORTIE) * (1 - prog(f, 52, 62)),
  };
};

// --- Bloom : 90 g, 30 s (150) ------------------------------------------------
export const BLOOM_DUREE = 150;
const BLOOM: Versement = { a0: 4, a1: 14, f0: 14, f1: 44, r1: 56, rMax: 44, tours: 2, angle0: -20, angle1: -22, cible: "90 g", eauCible: 0.12 };

export const etatBloom = (f: number): EtatChemex => {
  const v = g(f, BLOOM);
  const ecoule = cles(f, [[14, 0], [146, 30]], LIN);
  return {
    ...base(f),
    bouilloire: v.bouilloire,
    filet: v.filet,
    impactX: v.impactX,
    traine: v.traine,
    poids: cles(f, [[16, 0], [42, 90]], LIN),
    lit: cles(f, [
      [30, 1],
      [90, 1.12],
      [150, 1.1],
    ]),
    dome: cles(f, [
      [30, 0],
      [70, 24],
      [128, 30],
      [150, 28],
    ]),
    bulles: cles(f, [
      [34, 0],
      [52, 1],
      [124, 0.8],
      [150, 0.5],
    ]),
    eau: cles(f, [
      [16, 0],
      [42, 0.12],
      [80, 0.04],
      [150, 0.02],
    ]),
    niveau: cles(f, [[70, 0], [150, 0.04]], LIN),
    gouttes: cles(f, [
      [64, 0],
      [100, 0.3],
      [150, 0.35],
    ]),
    spirale: v.spirale,
    cible: v.cible,
    note: {
      lignes: ["il gonfle", "et dégaze"],
      y: 236 - 1.12 * 86 - 28,
      visible: prog(f, 62, 80, SORTIE) * (1 - prog(f, 124, 136)),
    },
    attente: { restant: 30 - ecoule, p: ecoule / 30, visible: prog(f, 66, 78, SORTIE) * (1 - prog(f, 140, 150)) },
  };
};

// --- Versements : 450, 600, 750 g (300) -------------------------------------
export const VERSEMENTS_DUREE = 300;
export const ETAPES = [0, 106, 192];
const PALIERS: Versement[] = [
  { a0: 4, a1: 14, f0: 14, f1: 84, r1: 96, rMax: 62, tours: 3, angle0: -22, angle1: -28, cible: "450 g", eauCible: 0.78 },
  { a0: 110, a1: 119, f0: 119, f1: 168, r1: 180, rMax: 54, tours: 2, angle0: -27, angle1: -30, cible: "600 g", eauCible: 0.85 },
  { a0: 196, a1: 205, f0: 205, f1: 262, r1: 274, rMax: 50, tours: 2, finCentre: 0.32, angle0: -29, angle1: -33, cible: "750 g", eauCible: 0.9 },
];

export const etatVersements = (f: number): EtatChemex => {
  const i = f < ETAPES[1] ? 0 : f < ETAPES[2] ? 1 : 2;
  const v = g(f, PALIERS[i]);
  return {
    ...base(f),
    bouilloire: v.bouilloire,
    filet: v.filet,
    impactX: v.impactX,
    traine: v.traine,
    poids: cles(
      f,
      [
        [16, 90],
        [82, 450],
        [121, 450],
        [166, 600],
        [207, 600],
        [260, 750],
      ],
      LIN,
    ),
    lit: cles(f, [
      [0, 1.1],
      [84, 1],
    ]),
    dome: cles(f, [
      [0, 28],
      [70, 6],
      [300, 3],
    ]),
    bulles: cles(f, [
      [0, 0.5],
      [30, 0],
    ]),
    eau: cles(f, [
      [0, 0.02],
      [16, 0.02],
      [84, 0.78],
      [119, 0.62],
      [168, 0.85],
      [205, 0.7],
      [262, 0.9],
      [300, 0.84],
    ]),
    niveau: cles(f, [[0, 0.04], [300, 0.46]], LIN),
    gouttes: cles(f, [
      [0, 0.35],
      [40, 0.6],
      [80, 0.85],
      [300, 0.85],
    ]),
    spirale: v.spirale,
    cible: v.cible,
    camera: {
      s: cles(f, [
        [0, 1],
        [300, 1.04],
      ]),
      x: 0,
      y: 0,
    },
  };
};

// --- Écoulement : 4 à 5 min au total (120) ----------------------------------
export const ECOULEMENT_DUREE = 120;
export const etatEcoulement = (f: number): EtatChemex => {
  const sortie = prog(f, 0, 32, Easing.bezier(0.5, 0, 0.75, 0));
  return {
    ...base(f + VERSEMENTS_DUREE),
    bouilloire: { x: mix(R.x, DEHORS.x, sortie), y: mix(R.y, DEHORS.y, sortie), angle: mix(R.angle, DEHORS.angle, sortie) },
    poids: 750,
    dome: cles(f, [
      [0, 3],
      [100, 0],
    ]),
    eau: cles(f, [
      [0, 0.84],
      [100, 0],
    ]),
    niveau: cles(f, [[0, 0.46], [108, 1]]),
    gouttes: cles(f, [
      [0, 0.85],
      [60, 0.8],
      [106, 0.1],
      [116, 0],
    ]),
    camera: {
      s: cles(f, [
        [0, 1.04],
        [80, 1],
      ]),
      x: 0,
      y: 0,
    },
  };
};

// --- Retirer le filtre, servir (120) ----------------------------------------
export const SERVIR_DUREE = 120;
export const SERVIR_A = 44;
export const etatServir = (f: number): EtatChemex => {
  const leve = 40 * prog(f, 40, 52, DOUX) * (1 - prog(f, 102, 114, DOUX));
  const penche = prog(f, 44, 62, DOUX) * (1 - prog(f, 98, 112, DOUX));
  return {
    ...base(f),
    bouilloire: DEHORS,
    poids: f < 40 ? 750 : null,
    papier: 1 - prog(f, 18, 34),
    papierDy: -460 * prog(f, 4, 34, Easing.bezier(0.45, 0, 0.7, 1)),
    niveau: f < 60 ? 1 : cles(f, [[60, 1], [100, 0.62]], LIN),
    inclinaison: -50 * penche,
    leve,
    tasse: { trace: prog(f, 26, 46, DOUX), niveau: cles(f, [[64, 0], [100, 1]], LIN) },
    service: f >= 60 && f <= 102 ? prog(f, 60, 102, LIN) : 0,
  };
};
