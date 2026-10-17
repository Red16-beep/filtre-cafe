import { EtatStation } from "../dessins/Station";
import { SORTIE, cles } from "../theme";
import { Versement, etatEcoulement, etatRincage, geste } from "../v60/etats";

// Méthode 4:6 de Tetsu Kasuya, chiffres de l'article methode-4-6-kasuya :
// 20 g de café, 300 g d'eau, cinq versements de 60 g à 0:00, 0:45, 1:30, 2:15 et 2:45,
// retrait du dripper à 3:30. Les deux premiers versements sont les 40 %, les trois derniers les 60 %.

const LIN = (t: number) => t;

// --- Rinçage : celui du V60, avec 20 g de café au lieu de 15 ------------
export const etatRincageK = (f: number): EtatStation => {
  const e = etatRincage(f);
  return f >= 112 && f < 156
    ? {
        ...e,
        poids: cles(
          f,
          [
            [116, 0],
            [142, 20],
          ],
          LIN,
        ),
      }
    : e;
};

// --- Cinq versements de 60 g (480 images) --------------------------------
export const VERSEMENTS_K_DUREE = 480;
// Début de chaque étape : 0:00, 0:45, 1:30, 2:15, 2:45.
export const ETAPES_K = [0, 105, 210, 315, 395];
const versement = (S: number, rMax: number, angle0: number, angle1: number, cible: string, eauCible: number, finCentre?: number): Versement => ({
  a0: S + 4,
  a1: S + 14,
  f0: S + 14,
  f1: S + 52,
  r1: S + 64,
  rMax,
  tours: 2,
  angle0,
  angle1,
  cible,
  eauCible,
  finCentre,
});
export const VERSEMENTS_K: Versement[] = [
  versement(0, 40, -20, -22, "60 g", 0.35),
  versement(105, 52, -22, -25, "120 g", 0.55),
  versement(210, 56, -24, -27, "180 g", 0.58),
  versement(315, 58, -26, -30, "240 g", 0.6),
  versement(395, 50, -29, -33, "300 g", 0.65, 0.3),
];

export const etatVersementsK = (f: number): EtatStation => {
  const i = f < 105 ? 0 : f < 210 ? 1 : f < 315 ? 2 : f < 395 ? 3 : 4;
  const g = geste(f, VERSEMENTS_K[i]);
  return {
    frame: f,
    bouilloire: g.bouilloire,
    filet: g.filet,
    impactX: g.impactX,
    traine: g.traine,
    // La balance monte pendant chaque filet, puis tient.
    poids: cles(
      f,
      [
        [16, 0],
        [50, 60],
        [121, 60],
        [155, 120],
        [226, 120],
        [260, 180],
        [331, 180],
        [365, 240],
        [411, 240],
        [445, 300],
      ],
      LIN,
    ),
    // Le chronomètre affiche l'heure exacte quand chaque filet part.
    temps: cles(
      f,
      [
        [14, 0],
        [119, 45],
        [224, 90],
        [329, 135],
        [409, 165],
        [480, 190],
      ],
      LIN,
    ),
    lit: cles(f, [
      [30, 1],
      [80, 1.1],
      [150, 1.05],
      [220, 1],
    ]),
    dome: cles(f, [
      [30, 0],
      [70, 22],
      [110, 20],
      [170, 6],
      [480, 3],
    ]),
    bulles: cles(f, [
      [34, 0],
      [52, 1],
      [100, 0.6],
      [140, 0.2],
      [170, 0],
    ]),
    // On reverse quand l'eau a presque fini de passer ; le 5e versement arrive 30 s après le 4e, l'eau est encore haute.
    eau: cles(f, [
      [16, 0],
      [52, 0.35],
      [100, 0.1],
      [119, 0.08],
      [157, 0.55],
      [205, 0.1],
      [224, 0.08],
      [262, 0.58],
      [310, 0.1],
      [329, 0.08],
      [367, 0.6],
      [400, 0.25],
      [409, 0.22],
      [447, 0.65],
      [480, 0.45],
    ]),
    papierMouille: 1,
    carafe: cles(
      f,
      [
        [80, 0],
        [105, 0.03],
        [210, 0.2],
        [315, 0.4],
        [395, 0.56],
        [480, 0.7],
      ],
      LIN,
    ),
    teinteCarafe: 1,
    gouttes: cles(f, [
      [60, 0],
      [90, 0.4],
      [130, 0.6],
      [180, 0.8],
      [480, 0.85],
    ]),
    spirale: g.spirale,
    cible: g.cible,
    note: null,
    attente: null,
    camera: {
      s: cles(f, [
        [0, 1],
        [60, 1.05],
        [480, 1.05],
      ]),
      x: 0,
      y: 0,
    },
  };
};

// --- Retrait du dripper à 3:30 (120 images) ------------------------------
export const RETRAIT_DUREE = 120;
export const etatRetrait = (f: number): EtatStation => ({
  ...etatEcoulement(f),
  frame: f + VERSEMENTS_K_DUREE,
  poids: 300,
  temps: cles(
    f,
    [
      [0, 190],
      [60, 210],
    ],
    SORTIE,
  ),
  eau: cles(f, [
    [0, 0.45],
    [90, 0.12],
  ]),
  carafe: cles(
    f,
    [
      [0, 0.7],
      [100, 0.9],
    ],
    LIN,
  ),
  gouttes: cles(f, [
    [0, 0.85],
    [64, 0.6],
    [76, 0],
  ]),
  dripperDy: cles(f, [
    [66, 0],
    [86, -95],
  ]),
});
