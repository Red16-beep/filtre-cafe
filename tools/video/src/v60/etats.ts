import { Easing } from "remotion";
import { corpsPourPointe } from "../dessins/Bouilloire";
import { EtatStation, POSTE, spirale } from "../dessins/Station";
import { DOUX, SORTIE, cles, mix, prog } from "../theme";

// États du poste V60, image par image. Chaque scène lit son état ici ;
// la fin d'une scène et le début de la suivante sont identiques.

const LIN = (t: number) => t;
const R = POSTE.bouilloireRepos;
const DEHORS = POSTE.bouilloireDehors;
// Hauteur de la pointe du bec pendant le versement, au-dessus du papier.
const POINTE_X = 540;
const POINTE_Y = 792;

export type Versement = {
  a0: number; // début de l'approche
  a1: number; // bec en place
  f0: number; // le filet part
  f1: number; // le filet s'arrête
  r1: number; // bouilloire revenue au repos
  rMax: number;
  tours: number;
  finCentre?: number;
  angle0?: number; // inclinaison au début du versement
  angle1?: number; // et à la fin : la bouilloire se vide, on penche plus
  cible: string;
  eauCible: number;
};

// Où se fait le geste : pointe du bec pendant le versement, bouilloire au repos,
// amplitude des cercles (le poste Chemex est plus haut et plus petit).
export type LieuGeste = {
  pointe?: { x: number; y: number };
  repos?: { x: number; y: number; angle: number };
  sx?: number;
  sy?: number;
};

// Le geste du col de cygne : légère montée, inclinaison, cercles qui suivent
// la spirale, filet qui traîne derrière la main, retrait.
export const geste = (f: number, v: Versement, lieu: LieuGeste = {}) => {
  const R = lieu.repos ?? POSTE.bouilloireRepos;
  const pointe = lieu.pointe ?? { x: POINTE_X, y: POINTE_Y };
  const pa = prog(f, v.a0, v.a1, DOUX);
  const pr = prog(f, v.f1 + 2, v.r1, DOUX);
  const k = pa * (1 - pr);
  const t = Math.min(1, Math.max(0, (f - v.f0) / (v.f1 - v.f0)));
  const actif = f >= v.f0 && f <= v.f1;
  const fc = v.finCentre ?? 0;
  const sp = actif ? spirale(t, v.rMax, v.tours, fc) : { x: 0, y: 0 };
  const avant = actif
    ? spirale(Math.max(0, t - 0.025), v.rMax, v.tours, fc)
    : sp;
  const leve = -20 * Math.sin(Math.PI * pa) - 26 * Math.sin(Math.PI * pr);
  const onde = actif ? Math.sin(t * v.tours * 2 * Math.PI) * 2.4 : 0;
  // Pendant le versement, on place la pointe du bec et on en déduit le corps :
  // la main suit la spirale, le poignet penche de plus en plus.
  const angleVerse =
    mix(v.angle0 ?? -22, v.angle1 ?? -26, f > v.f1 ? 1 : t) + onde;
  const corps = corpsPourPointe(
    pointe.x + sp.x * (lieu.sx ?? 0.95),
    pointe.y + sp.y * (lieu.sy ?? 0.3),
    angleVerse,
    POSTE.echelleBouilloire,
  );
  return {
    bouilloire: {
      x: mix(R.x, corps.x, k),
      y: mix(R.y, corps.y, k) + leve,
      angle: mix(R.angle, angleVerse, k),
    },
    filet:
      f >= v.f0 - 3 && f <= v.f1 + 9
        ? {
            tete: prog(f, v.f0 - 3, v.f0 + 5, SORTIE),
            queue: prog(f, v.f1, v.f1 + 8, Easing.in(Easing.quad)),
          }
        : null,
    impactX: sp.x,
    traine: -(sp.x - avant.x) * 2.2,
    t,
    spirale: {
      p: t,
      rMax: v.rMax,
      tours: v.tours,
      finCentre: fc,
      visible: prog(f, v.a0, v.a1 + 4, SORTIE) * (1 - prog(f, v.r1, v.r1 + 14)),
    },
    cible: {
      texte: v.cible,
      eau: v.eauCible,
      visible:
        prog(f, v.a0, v.a1 + 8, SORTIE) * (1 - prog(f, v.r1 - 4, v.r1 + 12)),
    },
  };
};

// --- Rinçage, café, tare (175 images) ---------------------------------
export const RINCAGE_DUREE = 175;
const RINCE: Versement = {
  a0: 22,
  a1: 32,
  f0: 32,
  f1: 62,
  r1: 74,
  rMax: 40,
  tours: 2,
  angle0: -21,
  angle1: -24,
  cible: "",
  eauCible: 0,
};

export const etatRincage = (f: number): EtatStation => {
  const entree = prog(f, 0, 22, SORTIE);
  const g = geste(f, RINCE);
  const bouilloire =
    f < 22
      ? {
          x: mix(DEHORS.x, R.x, entree),
          y: mix(DEHORS.y, R.y, entree),
          angle: mix(DEHORS.angle, R.angle, entree),
        }
      : g.bouilloire;
  const vidage = f >= 107; // la carafe revient vide
  return {
    frame: f,
    bouilloire,
    filet: g.filet,
    impactX: g.impactX,
    traine: g.traine,
    poids:
      f < 112
        ? cles(f, [
            [34, 0],
            [60, 100],
            [96, 100],
            [106, 0],
          ])
        : f < 156
          ? cles(
              f,
              [
                [116, 0],
                [142, 15],
              ],
              LIN,
            )
          : 0,
    temps: 0,
    tare: cles(f, [
      [150, 0],
      [154, 1],
      [162, 0],
    ]),
    lit: cles(f, [
      [116, 0],
      [142, 1],
    ]),
    dome: 0,
    bulles: 0,
    eau: cles(f, [
      [34, 0],
      [46, 0.12],
      [62, 0.08],
      [84, 0],
    ]),
    papierMouille: cles(f, [
      [34, 0],
      [58, 1],
    ]),
    carafe: vidage
      ? 0
      : cles(
          f,
          [
            [46, 0],
            [90, 0.2],
          ],
          LIN,
        ),
    teinteCarafe: 0,
    gouttes: cles(f, [
      [42, 0],
      [52, 0.65],
      [70, 0.6],
      [90, 0],
    ]),
    dripperDy: cles(f, [
      [86, 0],
      [96, -95],
      [118, -95],
      [128, 0],
    ]),
    carafeDx: cles(f, [
      [94, 0],
      [106, -720],
      [108, -720],
      [120, 0],
    ]),
    mouture: prog(f, 112, 140, LIN),
    spirale: null,
    cible: null,
  };
};

// --- Bloom et versements (450 images) ----------------------------------
export const VERSEMENT_DUREE = 450;
export const VERSEMENTS: Versement[] = [
  {
    a0: 4,
    a1: 14,
    f0: 14,
    f1: 46,
    r1: 58,
    rMax: 40,
    tours: 2,
    angle0: -20,
    angle1: -22,
    cible: "30 g",
    eauCible: 0.1,
  },
  {
    a0: 139,
    a1: 149,
    f0: 149,
    f1: 222,
    r1: 234,
    rMax: 60,
    tours: 3,
    angle0: -22,
    angle1: -28,
    cible: "150 g",
    eauCible: 0.72,
  },
  {
    a0: 259,
    a1: 268,
    f0: 268,
    f1: 314,
    r1: 326,
    rMax: 52,
    tours: 2,
    angle0: -27,
    angle1: -30,
    cible: "200 g",
    eauCible: 0.82,
  },
  {
    a0: 349,
    a1: 358,
    f0: 358,
    f1: 420,
    r1: 432,
    rMax: 48,
    tours: 2,
    finCentre: 0.32,
    angle0: -29,
    angle1: -33,
    cible: "250 g",
    eauCible: 0.9,
  },
];
export const ETAPES_VERSEMENT = [0, 135, 255, 345];

export const etatVersement = (f: number): EtatStation => {
  const i = f < 135 ? 0 : f < 255 ? 1 : f < 345 ? 2 : 3;
  const g = geste(f, VERSEMENTS[i]);
  return {
    frame: f,
    bouilloire: g.bouilloire,
    filet: g.filet,
    impactX: g.impactX,
    traine: g.traine,
    poids: cles(
      f,
      [
        [16, 0],
        [44, 30],
        [151, 30],
        [220, 150],
        [270, 150],
        [312, 200],
        [360, 200],
        [418, 250],
      ],
      LIN,
    ),
    temps: cles(
      f,
      [
        [14, 0],
        [135, 30],
        [255, 60],
        [345, 90],
        [450, 120],
      ],
      LIN,
    ),
    lit: cles(f, [
      [30, 1],
      [90, 1.12],
      [150, 1.1],
      [220, 1],
    ]),
    dome: cles(f, [
      [30, 0],
      [70, 24],
      [128, 30],
      [150, 28],
      [215, 6],
      [450, 3],
    ]),
    bulles: cles(f, [
      [34, 0],
      [52, 1],
      [124, 0.8],
      [150, 0.3],
      [180, 0],
    ]),
    eau: cles(f, [
      [16, 0],
      [44, 0.1],
      [80, 0.04],
      [150, 0.02],
      [220, 0.72],
      [268, 0.6],
      [314, 0.82],
      [358, 0.7],
      [420, 0.9],
      [450, 0.83],
    ]),
    papierMouille: 1,
    carafe: cles(
      f,
      [
        [90, 0],
        [135, 0.02],
        [255, 0.16],
        [345, 0.3],
        [450, 0.44],
      ],
      LIN,
    ),
    teinteCarafe: 1,
    gouttes: cles(f, [
      [70, 0],
      [100, 0.3],
      [135, 0.35],
      [170, 0.5],
      [200, 0.8],
      [450, 0.85],
    ]),
    spirale: g.spirale,
    cible: g.cible,
    note: {
      lignes: ["il gonfle", "et dégaze"],
      y: 236 - 1.12 * 86 - 28,
      visible: prog(f, 62, 80, SORTIE) * (1 - prog(f, 124, 136)),
    },
    attente: {
      restant:
        30 -
        cles(
          f,
          [
            [14, 0],
            [135, 30],
          ],
          LIN,
        ),
      p:
        cles(
          f,
          [
            [14, 0],
            [135, 30],
          ],
          LIN,
        ) / 30,
      visible: prog(f, 52, 66, SORTIE) * (1 - prog(f, 132, 142)),
    },
    camera: {
      s: cles(f, [
        [56, 1],
        [100, 1.1],
        [126, 1.1],
        [146, 1],
        [450, 1.05],
      ]),
      x: 0,
      y: 0,
    },
  };
};

// --- Écoulement (105 images) ---------------------------------------------
export const ECOULEMENT_DUREE = 105;

export const etatEcoulement = (f: number): EtatStation => {
  const sortie = prog(f, 0, 32, Easing.bezier(0.5, 0, 0.75, 0));
  return {
    frame: f + VERSEMENT_DUREE,
    bouilloire: {
      x: mix(R.x, DEHORS.x, sortie),
      y: mix(R.y, DEHORS.y, sortie),
      angle: mix(R.angle, DEHORS.angle, sortie),
    },
    filet: null,
    impactX: 0,
    poids: 250,
    temps: cles(
      f,
      [
        [0, 120],
        [95, 180],
      ],
      SORTIE,
    ),
    lit: 1,
    dome: cles(f, [
      [0, 3],
      [90, 0],
    ]),
    bulles: 0,
    eau: cles(f, [
      [0, 0.83],
      [90, 0],
    ]),
    papierMouille: 1,
    carafe: cles(f, [
      [0, 0.44],
      [95, 0.86],
    ]),
    teinteCarafe: 1,
    gouttes: cles(f, [
      [0, 0.85],
      [55, 0.8],
      [95, 0.1],
      [105, 0],
    ]),
    spirale: null,
    cible: null,
    camera: {
      s: cles(f, [
        [0, 1.05],
        [70, 1],
      ]),
      x: 0,
      y: 0,
    },
  };
};
