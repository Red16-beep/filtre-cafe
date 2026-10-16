import { Easing } from "remotion";
import { EtatMoka, VALVE_Y } from "../dessins/Moka";
import { DOUX, SORTIE, cles, mix, prog } from "../theme";
import { Versement, geste } from "../v60/etats";
import { EtatPosteMoka, MOKA } from "./PosteMoka";

// Moka, recette du site (moka-pot-guide-complet), méthode feu doux :
// eau chaude (~70 °C) jusqu'à la valve ; filtre ras bord sans tasser ;
// visser, feu doux à moyen, couvercle ouvert ; glouglou régulier ; retirer
// du feu dès que ça crachote. 4 à 6 min au total.

const LIN = (t: number) => t;
const R = MOKA.bouilloireRepos;
const DEHORS = MOKA.bouilloireDehors;
type M = Omit<EtatMoka, "frame">;
const RIEN: M = {
  eau: 0,
  entonnoir: 0,
  remplissage: 0,
  haut: 0,
  hautDy: 0,
  rotation: 0,
  couvercle: 0,
  cafeHaut: 0,
  flux: 0,
  crachote: 0,
};

// La bouilloire s'en va après le remplissage.
const sortie = (f: number) => {
  const q = prog(f, 0, 30, Easing.bezier(0.5, 0, 0.75, 0));
  return { x: mix(R.x, DEHORS.x, q), y: mix(R.y, DEHORS.y, q), angle: mix(R.angle, DEHORS.angle, q) };
};

const base = (f: number, moka: Partial<M>, bouilloire = DEHORS): EtatPosteMoka => ({
  frame: f,
  bouilloire,
  filet: null,
  impactX: 0,
  moka: { ...RIEN, ...moka },
  feu: 0,
});

// --- Remplir d'eau chaude jusqu'à la valve (150) ----------------------------
export const REMPLIR_DUREE = 150;
const REMPLIR: Versement = { a0: 16, a1: 26, f0: 26, f1: 84, r1: 96, rMax: 18, tours: 2, angle0: -21, angle1: -26, cible: "", eauCible: 0 };

export const etatRemplir = (f: number): EtatPosteMoka => {
  const entree = prog(f, 0, 14, SORTIE);
  const g = geste(f, REMPLIR);
  return {
    ...base(f, { eau: cles(f, [[28, 0], [84, 1]]) }),
    bouilloire:
      f < 14
        ? { x: mix(DEHORS.x, R.x, entree), y: mix(DEHORS.y, R.y, entree), angle: mix(DEHORS.angle, R.angle, entree) }
        : g.bouilloire,
    filet: g.filet,
    impactX: g.impactX,
    traine: g.traine,
    repere: { lignes: ["la valve :", "pas plus haut"], y: VALVE_Y, visible: prog(f, 60, 76, SORTIE) * (1 - prog(f, 138, 150)) },
  };
};

// --- Le filtre à ras bord, sans tasser (150) ---------------------------------
export const CAFE_DUREE = 150;
export const etatCafe = (f: number): EtatPosteMoka => ({
  ...base(f, {
    eau: 1,
    entonnoir: prog(f, 4, 22, SORTIE),
    remplissage: cles(f, [[26, 0], [86, 1]]),
  }, sortie(f)),
  mouture: prog(f, 20, 82, LIN),
  repere: { lignes: ["à ras bord,", "sans tasser"], y: -152, visible: prog(f, 88, 104, SORTIE) * (1 - prog(f, 138, 150)) },
});

// --- Visser, feu doux, couvercle ouvert (130) ---------------------------------
export const VISSER_DUREE = 130;
export const etatVisser = (f: number): EtatPosteMoka => ({
  ...base(f, {
    eau: 1,
    entonnoir: 1,
    remplissage: 1,
    haut: prog(f, 4, 40, DOUX),
    hautDy: mix(-120, 0, prog(f, 44, 78, DOUX)),
    rotation: prog(f, 80, 104, DOUX) * Math.PI * 2,
    couvercle: prog(f, 108, 126, DOUX),
  }),
  feu: 0.4 * prog(f, 104, 122, SORTIE),
});

// --- La montée : glouglou régulier (180) --------------------------------------
export const MONTEE_DUREE = 180;
const MOKA_PLEINE: Partial<M> = { entonnoir: 1, remplissage: 1, haut: 1, couvercle: 1 };

export const etatMontee = (f: number): EtatPosteMoka => {
  const ecoule = cles(f, [[0, 60], [180, 250]], LIN);
  return {
    ...base(f, {
      ...MOKA_PLEINE,
      eau: cles(f, [[40, 1], [178, 0.28]], LIN),
      flux: prog(f, 30, 50, SORTIE),
      cafeHaut: cles(f, [[40, 0], [178, 0.74]], LIN),
    }),
    feu: 0.4,
    repere: { lignes: ["glouglou", "régulier,", "café foncé"], y: -236, visible: prog(f, 62, 80, SORTIE) * (1 - prog(f, 164, 178)), gauche: true },
    attente: { restant: ecoule, p: ecoule / 360, visible: prog(f, 4, 18, SORTIE), libelle: "TEMPS", minutes: true },
  };
};

// --- Dès que ça crachote : retirer du feu (150) ---------------------------------
export const RETIRER_DUREE = 150;
export const etatRetirer = (f: number): EtatPosteMoka => {
  const ecoule = cles(f, [[0, 250], [70, 290], [150, 300]], LIN);
  const leve = prog(f, 66, 96, DOUX);
  return {
    ...base(f, {
      ...MOKA_PLEINE,
      eau: cles(f, [[0, 0.28], [60, 0.18]]),
      flux: cles(f, [[0, 1], [40, 0.45], [90, 0]]),
      crachote: cles(f, [[8, 0], [30, 1], [86, 0.8], [110, 0]]),
      cafeHaut: cles(f, [[0, 0.74], [70, 0.84]]),
    }),
    feu: 0.4 * (1 - prog(f, 72, 92, Easing.in(Easing.quad))),
    mokaDy: -70 * leve,
    vapeurBec: cles(f, [[14, 0], [34, 1], [90, 0.6], [130, 0]]),
    attente: { restant: ecoule, p: ecoule / 360, visible: 1 - prog(f, 136, 150), libelle: "TEMPS", minutes: true },
  };
};
