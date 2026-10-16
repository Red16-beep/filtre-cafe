import { Easing } from "remotion";
import { EtatPress } from "../dessins/FrenchPress";
import { DOUX, SORTIE, cles, mix, prog } from "../theme";
import { Versement, geste } from "../v60/etats";
import { EtatPoste, PRESS } from "./PostePress";

// Cafetière à piston, protocole du site (french-press-guide) :
// préchauffer 30 s puis vider ; 15 g mouture grossière, secouer ; 250 ml à
// 93 °C en cercles, mélanger 10 s ; couvercle sans presser, 4 min ; presser
// en 30 s ; servir aussitôt.

const LIN = (t: number) => t;
const R = PRESS.bouilloireRepos;
const DEHORS = PRESS.bouilloireDehors;
const MAILLE_HAUT = -284;
const MAILLE_BAS = -36;

type Press = Omit<EtatPress, "frame">;
const VIDE: Press = { eau: 0, teinte: 0, lit: 0, croute: 0, suspension: 0, maille: null, couvercle: 0, inclinaison: 0 };

const base = (f: number, press: Partial<Press> = {}, bouilloire = R): EtatPoste => ({
  frame: f,
  bouilloire,
  filet: null,
  impactX: 0,
  poids: 0,
  temps: null,
  press: { ...VIDE, ...press },
});

// --- Préchauffer : un peu d'eau chaude, 30 s, vider (150) -------------------
export const PRECHAUFFER_DUREE = 150;
const PRECH: Versement = { a0: 16, a1: 26, f0: 26, f1: 46, r1: 58, rMax: 30, tours: 2, angle0: -21, angle1: -23, cible: "", eauCible: 0 };

export const etatPrechauffer = (f: number): EtatPoste => {
  const entree = prog(f, 0, 14, SORTIE);
  const g = geste(f, PRECH);
  const penche = prog(f, 100, 116, DOUX) * (1 - prog(f, 132, 148, DOUX));
  const restant = 30 - cles(f, [[50, 0], [98, 30]], LIN);
  return {
    ...base(f, {
      eau: f < 104 ? cles(f, [[28, 0], [46, 0.22]]) : cles(f, [[104, 0.22], [130, 0]]),
      inclinaison: -26 * penche,
    }),
    bouilloire:
      f < 14
        ? { x: mix(DEHORS.x, R.x, entree), y: mix(DEHORS.y, R.y, entree), angle: mix(DEHORS.angle, R.angle, entree) }
        : g.bouilloire,
    filet: g.filet,
    impactX: g.impactX,
    traine: g.traine,
    poids: f < 104 ? cles(f, [[28, 0], [46, 55]], LIN) : cles(f, [[104, 55], [130, 0]]),
    vidage: f >= 108 && f <= 134 ? prog(f, 108, 134, LIN) : 0,
    attente: { restant, p: 1 - restant / 30, visible: prog(f, 48, 58, SORTIE) * (1 - prog(f, 98, 106)) },
  };
};

// --- Café : 15 g, mouture grossière, secouer, tarer (110) -------------------
export const CAFE_DUREE = 110;
export const etatCafe = (f: number): EtatPoste => ({
  ...base(f, { lit: cles(f, [[14, 0], [70, 1]]) }),
  mouture: prog(f, 8, 66, LIN),
  poids: f < 100 ? cles(f, [[14, 0], [68, 15]], LIN) : 0,
  dx: f > 74 && f < 94 ? Math.sin((f - 74) * 1.3) * 10 * (1 - (f - 74) / 20) : 0,
  tare: cles(f, [
    [96, 0],
    [100, 1],
    [108, 0],
  ]),
});

// --- Verser 250 ml en cercles, mélanger 10 s (160) ---------------------------
export const VERSER_DUREE = 160;
const VERSE: Versement = { a0: 4, a1: 14, f0: 14, f1: 80, r1: 92, rMax: 52, tours: 3, angle0: -21, angle1: -28, cible: "250 ml", eauCible: 1 };

export const etatVerser = (f: number): EtatPoste => {
  const g = geste(f, VERSE);
  const melange = prog(f, 92, 102) * (1 - prog(f, 140, 150));
  const casse = prog(f, 100, 136, LIN);
  return {
    ...base(f, {
      eau: cles(f, [[16, 0], [80, 1]]),
      teinte: cles(f, [[30, 0], [140, 0.45]], LIN),
      lit: cles(f, [[16, 1], [60, 0.2]]),
      croute: f < 100 ? cles(f, [[18, 0], [62, 1]]) : mix(1, 0.15, casse),
      suspension: cles(f, [[20, 0], [70, 0.3], [100, 0.4], [136, 1]]),
      cuillere: { visible: melange, phase: cles(f, [[100, 0], [140, 5]], LIN) },
    }),
    bouilloire: g.bouilloire,
    filet: g.filet,
    impactX: g.impactX,
    traine: g.traine,
    poids: cles(f, [[16, 0], [78, 250]], LIN),
    repere: { lignes: [VERSE.cible], y: -268, visible: prog(f, 4, 22, SORTIE) * (1 - prog(f, 84, 96)) },
    attente: {
      restant: 10 - cles(f, [[100, 0], [140, 10]], LIN),
      p: cles(f, [[100, 0], [140, 1]], LIN),
      visible: melange,
      libelle: "MÉLANGER",
    },
  };
};

// --- Infuser 4 min, couvercle posé (150) -------------------------------------
export const INFUSER_DUREE = 150;
const dehors = (f: number) => {
  const q = prog(f, 0, 30, Easing.bezier(0.5, 0, 0.75, 0));
  return { x: mix(R.x, DEHORS.x, q), y: mix(R.y, DEHORS.y, q), angle: mix(R.angle, DEHORS.angle, q) };
};

export const etatInfuser = (f: number): EtatPoste => {
  const restant = 240 - cles(f, [[30, 0], [140, 240]], LIN);
  return {
    ...base(f, {
      eau: 1,
      teinte: cles(f, [[20, 0.45], [140, 1]], LIN),
      lit: cles(f, [[20, 0.2], [140, 0.8]]),
      croute: cles(f, [[20, 0.15], [140, 0.1]]),
      suspension: cles(f, [[20, 1], [140, 0.35]]),
      maille: MAILLE_HAUT,
      couvercle: prog(f, 4, 22, SORTIE),
    }, dehors(f)),
    poids: 250,
    attente: { restant, p: 1 - restant / 240, visible: prog(f, 24, 36, SORTIE) * (1 - prog(f, 142, 150)), libelle: "INFUSION", minutes: true },
  };
};

// --- Presser en 30 s (150) ------------------------------------------------------
export const PRESSER_DUREE = 150;
export const etatPresser = (f: number): EtatPoste => {
  const appui = prog(f, 20, 130, Easing.bezier(0.3, 0, 0.6, 1));
  const restant = 30 - 30 * appui;
  return {
    ...base(f, {
      eau: 1,
      teinte: 1,
      lit: mix(0.8, 1.25, appui),
      croute: 0.1 * (1 - appui),
      suspension: 0.35 * (1 - appui),
      maille: mix(MAILLE_HAUT, MAILLE_BAS, appui),
      couvercle: 1,
    }, DEHORS),
    poids: 250,
    attente: { restant, p: appui, visible: prog(f, 10, 22, SORTIE) * (1 - prog(f, 140, 150)), libelle: "PRESSER" },
  };
};

// --- Servir aussitôt (110) ------------------------------------------------------
export const SERVIR_DUREE = 110;
export const etatServir = (f: number): EtatPoste => {
  const penche = prog(f, 22, 44, DOUX) * (1 - prog(f, 90, 106, DOUX));
  return {
    ...base(f, {
      eau: cles(f, [[44, 1], [90, 0.42]], LIN),
      teinte: 1,
      lit: 1.25,
      maille: MAILLE_BAS,
      couvercle: 1,
      inclinaison: -28 * penche,
    }, DEHORS),
    poids: null,
    tasse: { trace: prog(f, 0, 22, DOUX), niveau: cles(f, [[46, 0], [90, 1]], LIN) },
    service: f >= 42 && f <= 92 ? prog(f, 42, 92, LIN) : 0,
  };
};
