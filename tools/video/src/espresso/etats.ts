import { DOUX, SORTIE, cles, mix, prog } from "../theme";
import { ESP, EtatEspresso } from "./PosteEspresso";

// Espresso, recette du site (comment-faire-espresso-parfait) : 18 g de café
// en mouture fine (sable fin), répartir puis tasser droit et ferme ; 36 g en
// tasse en 25 à 30 s (1:2) ; filet doré et régulier ; servir tout de suite.

const LIN = (t: number) => t;
const SUR_BALANCE = { x: 540, y: ESP.plateau - 82 }; // porte-filtre posé sur la balance
const GROUPE = ESP.groupe;

const base = (f: number): EtatEspresso => ({
  frame: f,
  poids: 0,
  temps: null,
  pf: { ...SUR_BALANCE, angle: 0, dose: 0, tasse: 0 },
  extraction: 0,
  // plan serré sur la machine
  camera: { s: 1.4, x: 0, y: 120 },
});

// --- 18 g de café, mouture fine (130) --------------------------------------------
export const DOSE_DUREE = 130;
export const etatDose = (f: number): EtatEspresso => ({
  ...base(f),
  mouture: prog(f, 12, 86, LIN),
  pf: { ...SUR_BALANCE, angle: 0, dose: cles(f, [[16, 0], [90, 1]]), tasse: 0 },
  poids: cles(f, [[16, 0], [88, 18]], LIN),
});

// --- Répartir, puis tasser (130) ---------------------------------------------------
export const TASSER_DUREE = 130;
export const etatTasser = (f: number): EtatEspresso => {
  const surface = SUR_BALANCE.y + 20;
  const descente = prog(f, 54, 76, DOUX);
  const appui = prog(f, 76, 92, DOUX);
  const remonte = prog(f, 100, 120, DOUX);
  return {
    ...base(f),
    pf: { ...SUR_BALANCE, angle: 0, dose: 1, tasse: f < 50 ? prog(f, 10, 44, DOUX) * 0.5 : 0.5 + appui * 0.5 },
    poids: 18,
    tamper: {
      visible: prog(f, 46, 56) * (1 - prog(f, 116, 126)),
      y: mix(surface - 150, surface + appui * 10, descente) - remonte * 150,
    },
  };
};

// --- Porte-filtre en place, tasse sur la balance, tare (90) -----------------------
export const PLACER_DUREE = 90;
export const etatPlacer = (f: number): EtatEspresso => {
  const monte = prog(f, 6, 40, DOUX);
  return {
    ...base(f),
    poids: f < 40 ? mix(18, 0, monte) : 0,
    pf: {
      x: 540,
      y: mix(SUR_BALANCE.y, GROUPE.y, monte),
      angle: mix(28, 0, prog(f, 30, 52, DOUX)),
      dose: 1,
      tasse: 1,
    },
    tasse: { trace: prog(f, 44, 66, DOUX), niveau: 0 },
    tare: cles(f, [
      [72, 0],
      [76, 1],
      [84, 0],
    ]),
  };
};

// --- 36 g en 25 à 30 s (180) -------------------------------------------------------
export const EXTRAIRE_DUREE = 180;
export const etatExtraire = (f: number): EtatEspresso => ({
  ...base(f),
  pf: { ...GROUPE, angle: 0, dose: 1, tasse: 1 },
  tasse: { trace: 1, niveau: cles(f, [[30, 0], [160, 1]], LIN) },
  poids: cles(f, [[30, 0], [160, 36]], LIN),
  temps: cles(f, [[12, 0], [162, 28]], LIN),
  extraction: f < 22 ? 0 : f < 160 ? Math.min(1, (f - 22) / 14) : 1 - prog(f, 160, 172),
  repere: {
    lignes: ["filet doré,", "régulier"],
    y: 930,
    visible: prog(f, 60, 78, SORTIE) * (1 - prog(f, 160, 176)),
  },
});

// --- Servir tout de suite (90) ------------------------------------------------------
export const SERVIR_DUREE = 90;
export const etatServir = (f: number): EtatEspresso => ({
  ...base(f),
  pf: { ...GROUPE, angle: 0, dose: 1, tasse: 1 },
  tasse: { trace: 1, niveau: 1 },
  poids: 36,
  temps: 28,
});
