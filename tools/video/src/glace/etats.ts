import { Easing } from "remotion";
import { EtatStation, POSTE } from "../dessins/Station";
import { SORTIE, cles, mix, prog } from "../theme";
import { Versement, etatRincage, geste } from "../v60/etats";

// Café glacé (flash brew), chiffres de l'article cafe-glace-maison :
// 150 g de glaçons dans la carafe, 22 g de café un cran plus fin qu'un V60 chaud,
// 50 g d'eau à 93 °C et 30 à 40 s de dégazage, puis jusqu'à 220 g en deux ou trois fois,
// on remue une fois l'écoulement fini. L'article ne donne pas d'horaires après le
// dégazage : le chronomètre s'éteint quand le deuxième versement commence.

const LIN = (t: number) => t;
const R = POSTE.bouilloireRepos;
const DEHORS = POSTE.bouilloireDehors;

// --- Rinçage, glaçons, café, tare (250 images) ---------------------------
// Le rinçage est celui du V60 ; la carafe repart vider l'eau et revient avec la glace.
export const FILTRE_G_DUREE = 250;
export const GLACE_ARRIVE = 107; // la carafe revient avec les glaçons
export const CAFE_G = 176; // le dripper redescend, le café tombe
export const etatFiltreG = (f: number): EtatStation => {
  if (f < GLACE_ARRIVE) {
    const r = etatRincage(f);
    return {
      ...r,
      poids: cles(
        f,
        [
          [34, 0],
          [62, 86],
          [96, 97],
          [106, 0],
        ],
        LIN,
      ),
    };
  }
  const e = etatRincage(106);
  return {
    ...e,
    frame: f,
    bouilloire: R,
    filet: null,
    impactX: 0,
    traine: 0,
    // La balance lit la glace, puis la glace et le café, puis on tare.
    poids:
      f < 222
        ? cles(
            f,
            [
              [124, 0],
              [138, 150],
              [190, 150],
              [214, 172],
            ],
            LIN,
          )
        : 0,
    temps: 0,
    tare: cles(f, [
      [222, 0],
      [226, 1],
      [234, 0],
    ]),
    lit: cles(f, [
      [188, 0],
      [214, 1],
    ]),
    eau: 0,
    papierMouille: 1,
    carafe: 0,
    teinteCarafe: 1,
    gouttes: 0,
    glace: 1,
    dripperDy: cles(f, [
      [CAFE_G, -95],
      [CAFE_G + 10, 0],
    ]),
    carafeDx: cles(
      f,
      [
        [GLACE_ARRIVE, -720],
        [126, 0],
      ],
      SORTIE,
    ),
    mouture: prog(f, 188, 214, LIN),
    spirale: null,
    cible: null,
    note: null,
    attente: null,
    camera: {
      s: cles(f, [
        [118, 1],
        [140, 1.025],
        [172, 1.025],
        [190, 1],
      ]),
      x: 0,
      y: cles(f, [
        [118, 0],
        [140, -30],
        [172, -30],
        [190, 0],
      ]),
    },
  };
};

// --- Dégazage : 50 g à 93 °C, 30 à 40 s (150 images) ---------------------
export const BLOOM_G_DUREE = 150;
const BLOOM_G: Versement = {
  a0: 4,
  a1: 14,
  f0: 14,
  f1: 48,
  r1: 60,
  rMax: 42,
  tours: 2,
  angle0: -20,
  angle1: -22,
  cible: "50 g",
  eauCible: 0.16,
};
// Secondes écoulées pendant le dégazage : on part à 35 s, au milieu de la fourchette.
const secondesBloom = (f: number) =>
  cles(
    f,
    [
      [14, 0],
      [148, 35],
    ],
    LIN,
  );
export const etatBloomG = (f: number): EtatStation => {
  const g = geste(f, BLOOM_G);
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
        [46, 50],
      ],
      LIN,
    ),
    temps: secondesBloom(f),
    lit: cles(f, [
      [30, 1],
      [90, 1.12],
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
      [150, 0.4],
    ]),
    eau: cles(f, [
      [16, 0],
      [46, 0.16],
      [90, 0.06],
      [150, 0.04],
    ]),
    papierMouille: 1,
    carafe: cles(
      f,
      [
        [90, 0],
        [150, 0.03],
      ],
      LIN,
    ),
    teinteCarafe: 1,
    gouttes: cles(f, [
      [70, 0],
      [100, 0.3],
      [150, 0.35],
    ]),
    glace: 1,
    fonte: cles(f, [
      [90, 0],
      [150, 0.04],
    ]),
    spirale: g.spirale,
    cible: g.cible,
    note: {
      lignes: ["il gonfle", "et dégaze"],
      y: 236 - 1.12 * 86 - 28,
      visible: prog(f, 62, 80, SORTIE) * (1 - prog(f, 132, 146)),
    },
    attente: {
      restant: Math.floor(secondesBloom(f)),
      p: secondesBloom(f) / 40,
      libelle: "DÉGAZAGE",
      visible: prog(f, 52, 66, SORTIE) * (1 - prog(f, 140, 150)),
    },
    camera: {
      s: cles(f, [
        [56, 1],
        [100, 1.025],
        [126, 1.025],
        [146, 1],
      ]),
      x: 0,
      y: 0,
    },
  };
};

// --- Le reste jusqu'à 220 g, en deux fois (260 images) -------------------
export const VERSEMENTS_G_DUREE = 260;
export const ETAPES_G = [0, 116];
export const VERSEMENTS_G: Versement[] = [
  {
    a0: 4,
    a1: 14,
    f0: 14,
    f1: 72,
    r1: 84,
    rMax: 58,
    tours: 3,
    angle0: -22,
    angle1: -27,
    cible: "",
    eauCible: 0.62,
  },
  {
    a0: 120,
    a1: 130,
    f0: 130,
    f1: 190,
    r1: 202,
    rMax: 52,
    tours: 2,
    finCentre: 0.3,
    angle0: -27,
    angle1: -32,
    cible: "220 g",
    eauCible: 0.86,
  },
];
export const etatVersementsG = (f: number): EtatStation => {
  const i = f < ETAPES_G[1] ? 0 : 1;
  const g = geste(f, VERSEMENTS_G[i]);
  return {
    frame: f + BLOOM_G_DUREE,
    bouilloire: g.bouilloire,
    filet: g.filet,
    impactX: g.impactX,
    traine: g.traine,
    poids: cles(
      f,
      [
        [16, 50],
        [70, 135],
        [132, 135],
        [188, 220],
      ],
      LIN,
    ),
    temps: null,
    lit: cles(f, [
      [0, 1.12],
      [60, 1.08],
      [160, 1],
    ]),
    dome: cles(f, [
      [0, 28],
      [70, 8],
      [260, 3],
    ]),
    bulles: cles(f, [
      [0, 0.4],
      [40, 0],
    ]),
    eau: cles(f, [
      [16, 0.04],
      [72, 0.62],
      [118, 0.45],
      [132, 0.43],
      [190, 0.86],
      [260, 0.72],
    ]),
    papierMouille: 1,
    carafe: cles(
      f,
      [
        [0, 0.03],
        [260, 0.5],
      ],
      LIN,
    ),
    teinteCarafe: 1,
    gouttes: cles(f, [
      [0, 0.35],
      [40, 0.6],
      [80, 0.85],
    ]),
    glace: 1,
    fonte: cles(
      f,
      [
        [0, 0.04],
        [260, 0.22],
      ],
      LIN,
    ),
    buee: cles(f, [
      [120, 0],
      [260, 0.45],
    ]),
    spirale: g.spirale,
    cible: i === 1 ? g.cible : null,
    note: null,
    attente: null,
    camera: {
      s: cles(f, [
        [0, 1],
        [80, 1.02],
      ]),
      x: 0,
      y: 0,
    },
  };
};

// --- Écoulement, dripper retiré, on remue, on sert (300 images) ----------
export const REMUER_DUREE = 300;
export const SERVIR = 196; // la légende passe à « Servir »
export const etatRemuer = (f: number): EtatStation => {
  const sortie = prog(f, 0, 32, Easing.bezier(0.5, 0, 0.75, 0));
  const remuerVisible = prog(f, 98, 110) * (1 - prog(f, 190, 204));
  return {
    frame: f + BLOOM_G_DUREE + VERSEMENTS_G_DUREE,
    bouilloire: {
      x: mix(R.x, DEHORS.x, sortie),
      y: mix(R.y, DEHORS.y, sortie),
      angle: mix(R.angle, DEHORS.angle, sortie),
    },
    filet: null,
    impactX: 0,
    poids: 220,
    temps: null,
    lit: 1,
    dome: cles(f, [
      [0, 3],
      [60, 0],
    ]),
    bulles: 0,
    eau: cles(f, [
      [0, 0.72],
      [62, 0],
    ]),
    papierMouille: 1,
    carafe: cles(f, [
      [0, 0.5],
      [70, 0.86],
    ]),
    teinteCarafe: 1,
    gouttes: cles(f, [
      [0, 0.85],
      [44, 0.8],
      [64, 0.1],
      [72, 0],
    ]),
    glace: 1,
    fonte: cles(
      f,
      [
        [0, 0.22],
        [300, 0.32],
      ],
      LIN,
    ),
    buee: cles(f, [
      [0, 0.45],
      [220, 1],
    ]),
    remuer: remuerVisible > 0 ? { p: prog(f, 100, 200, LIN), visible: remuerVisible } : null,
    dripperDy: cles(f, [
      [74, 0],
      [86, -95],
    ]),
    dripperDx: cles(
      f,
      [
        [84, 0],
        [104, -900],
      ],
      Easing.in(Easing.cubic),
    ),
    spirale: null,
    cible: null,
    note: null,
    attente: null,
    camera: {
      s: cles(f, [
        [0, 1.02],
        [70, 1],
        [110, 1.14],
        [300, 1.2],
      ]),
      x: 0,
      y: cles(f, [
        [70, 0],
        [110, -70],
        [300, -80],
      ]),
    },
  };
};
