import { Easing } from "remotion";
import { FOND, HAUT_EAU_MAX, hautLit, niveauAero } from "../dessins/AeroPress";
import { DOUX, SORTIE, cles, mix, prog } from "../theme";
import { Versement, geste } from "../v60/etats";
import { AERO, EtatAero, yAbs } from "./PosteAero";

// AeroPress, recette standard du site (15 g / 200 ml, 88 °C) :
// rincer le filtre, visser le chapeau, poser sur la tasse ; 15 g de café ;
// 50 ml d'eau, agiter 5 fois, 30 s ; jusqu'à 200 ml, 60 s ; piston en 20 à
// 30 s, arrêt au premier sifflement.

const LIN = (t: number) => t;
const R = AERO.bouilloireRepos;
const DEHORS = AERO.bouilloireDehors;

const base = (f: number): EtatAero => ({
  frame: f,
  bouilloire: R,
  filet: null,
  impactX: 0,
  poids: 0,
  temps: 0,
  cafe: 0,
  eau: 0,
  carafe: 0,
  gouttes: 0,
  chapeau: { dy: 0, rotation: 0, filtre: 1, mouille: 1 },
});

// --- Préparer : rincer le filtre, visser le chapeau, poser (150) ----------
export const PREPARER_DUREE = 150;
const RINCE: Versement = { a0: 16, a1: 26, f0: 26, f1: 50, r1: 62, rMax: 22, tours: 2, angle0: -21, angle1: -23, cible: "", eauCible: 0 };
const HAUT_CHAPEAU = -170; // le chapeau attend plus haut que sa place finale

export const etatPreparer = (f: number): EtatAero => {
  const entree = prog(f, 0, 14, SORTIE);
  const g = geste(f, RINCE);
  const descente = prog(f, 106, 136, DOUX);
  const chapDy = mix(HAUT_CHAPEAU, 0, descente);
  const chambreDy = chapDy;
  const yChapeau = yAbs(FOND - 6) + chapDy;
  return {
    ...base(f),
    bouilloire:
      f < 14
        ? { x: mix(DEHORS.x, R.x, entree), y: mix(DEHORS.y, R.y, entree), angle: mix(DEHORS.angle, R.angle, entree) }
        : g.bouilloire,
    filet: g.filet,
    impactX: g.impactX * 0.6,
    impactY: yChapeau,
    traine: g.traine,
    goutteY0: f < 100 ? yChapeau + 24 : undefined,
    gouttes: cles(f, [
      [30, 0],
      [38, 0.45],
      [56, 0.3],
      [70, 0],
    ]),
    chambreDy,
    chambreTrace: prog(f, 50, 88, DOUX),
    chapeau: {
      dy: chapDy,
      rotation: prog(f, 86, 104, DOUX) * Math.PI * 2,
      filtre: prog(f, 2, 18),
      mouille: prog(f, 28, 46),
    },
  };
};

// --- Café : 15 g, tare (120) -----------------------------------------------
export const CAFE_DUREE = 120;
export const etatCafe = (f: number): EtatAero => ({
  ...base(f),
  mouture: prog(f, 10, 70, LIN),
  cafe: cles(f, [
    [16, 0],
    [74, 1],
  ]),
  poids:
    f < 100
      ? cles(
          f,
          [
            [16, 0],
            [72, 15],
          ],
          LIN,
        )
      : 0,
  tare: cles(f, [
    [94, 0],
    [98, 1],
    [106, 0],
  ]),
});

// --- Bloom : 50 ml, agiter 5 fois, 30 s (180) ------------------------------
export const BLOOM_DUREE = 180;
const BLOOM: Versement = { a0: 4, a1: 14, f0: 14, f1: 40, r1: 52, rMax: 26, tours: 2, angle0: -20, angle1: -22, cible: "50 ml", eauCible: 0.25 };

export const etatBloom = (f: number): EtatAero => {
  const g = geste(f, BLOOM);
  const temps = cles(f, [[14, 0], [180, 30]], LIN);
  const phase = cles(f, [[66, 0], [106, 5]], LIN);
  const agite = prog(f, 56, 66) * (1 - prog(f, 106, 116));
  return {
    ...base(f),
    cafe: 1,
    bouilloire: g.bouilloire,
    filet: g.filet,
    impactX: g.impactX * 0.7,
    traine: g.traine,
    poids: cles(f, [[16, 0], [38, 50]], LIN),
    eau: cles(f, [[16, 0], [40, 0.25]]),
    temps,
    agitateur: { visible: agite, phase },
    remous: agite,
    compteur: { valeur: `${Math.min(5, Math.floor(phase) + 1)}/5`, libelle: "AGITATION", visible: agite },
    attente: { restant: 30 - temps, p: temps / 30, visible: prog(f, 114, 124, SORTIE) * (1 - prog(f, 172, 180)) },
    repere: { lignes: [BLOOM.cible], y: niveauAero(1, BLOOM.eauCible), visible: prog(f, 4, 22, SORTIE) * (1 - prog(f, 52, 64)) },
    camera: { s: cles(f, [[56, 1], [86, 1.08], [116, 1.08], [146, 1]]), x: 0, y: 0 },
  };
};

// --- Infusion : jusqu'à 200 ml, 60 s (150) ---------------------------------
export const INFUSION_DUREE = 150;
const INFUSION: Versement = { a0: 4, a1: 14, f0: 14, f1: 72, r1: 84, rMax: 34, tours: 3, angle0: -22, angle1: -28, cible: "200 ml", eauCible: 1 };

export const etatInfusion = (f: number): EtatAero => {
  const g = geste(f, INFUSION);
  const temps = cles(f, [[14, 30], [72, 45], [150, 105]], LIN);
  const restant = Math.max(0, Math.min(60, 105 - temps));
  return {
    ...base(f),
    cafe: 1,
    bouilloire: g.bouilloire,
    filet: g.filet,
    impactX: g.impactX * 0.7,
    traine: g.traine,
    poids: cles(f, [[16, 50], [70, 200]], LIN),
    eau: cles(f, [[16, 0.25], [72, 1]]),
    temps,
    attente: { restant, p: 1 - restant / 60, visible: prog(f, 78, 90, SORTIE) * (1 - prog(f, 142, 150)) },
    repere: { lignes: [INFUSION.cible], y: HAUT_EAU_MAX, visible: prog(f, 4, 22, SORTIE) * (1 - prog(f, 120, 140)) },
  };
};

// --- Piston : 20 à 30 s, arrêt au premier sifflement (165) -----------------
export const PISTON_DUREE = 165;
const BAS_PISTON = hautLit(1) - 6;

export const etatPiston = (f: number): EtatAero => {
  const sortie = prog(f, 0, 30, Easing.bezier(0.5, 0, 0.75, 0));
  const appui = prog(f, 40, 140, Easing.bezier(0.3, 0, 0.6, 1));
  const joint = mix(0, BAS_PISTON, appui);
  return {
    ...base(f),
    cafe: 1,
    bouilloire: { x: mix(R.x, DEHORS.x, sortie), y: mix(R.y, DEHORS.y, sortie), angle: mix(R.angle, DEHORS.angle, sortie) },
    poids: 200,
    eau: 1 - appui,
    temps: cles(f, [[40, 105], [140, 130]], LIN),
    piston: { joint, visible: 1 },
    pistonTrace: prog(f, 2, 34, DOUX),
    gouttes: f < 44 ? 0 : f < 140 ? 0.85 : cles(f, [[140, 0.3], [156, 0]]),
    carafe: cles(f, [[44, 0], [140, 0.62]], LIN),
    sifflement: f >= 128 ? prog(f, 128, 165, LIN) : 0,
    repere: {
      lignes: ["au sifflement,", "on s’arrête"],
      y: 150,
      visible: prog(f, 126, 140, SORTIE),
    },
  };
};
