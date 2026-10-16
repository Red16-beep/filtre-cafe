import { Easing, interpolate } from "remotion";

// Palette de filtré. (site v2)
export const C = {
  espresso: "#1f1610",
  espressoChaud: "#3a2819",
  nuit: "#140d09",
  corps: "#2a1c13",
  crema: "#efc79c",
  cerise: "#b8401f",
  ceriseVive: "#d9582f",
  cuivre: "#8a5532",
  feuille: "#4b6b4f",
  feuilleClaire: "#7fa383",
  creme: "#f6f1ea",
  cafeClair: "#d9a066",
  cafeFonce: "#3b1d0f",
  papier: "#f3ebdf",
};

export const SERIF = "Newsreader, Georgia, serif";
export const SANS = '"Instrument Sans", system-ui, sans-serif';

// Courbes : une entrée douce qui freine, un aller-retour sans à-coup.
export const SORTIE = Easing.bezier(0.16, 1, 0.3, 1);
export const DOUX = Easing.bezier(0.65, 0, 0.35, 1);
export const RESSORT = Easing.spring({ damping: 200 });
export const REBOND = Easing.spring({ damping: 14, mass: 0.6 });

// Progression bornée entre deux images.
export const prog = (
  f: number,
  a: number,
  b: number,
  easing: (t: number) => number = DOUX,
) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Valeur par paliers : [[image, valeur], ...], interpolée avec DOUX entre deux clés.
export const cles = (
  f: number,
  points: ReadonlyArray<readonly [number, number]>,
  easing: (t: number) => number = DOUX,
) => {
  if (f <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [f1, v1] = points[i];
    const [f0, v0] = points[i - 1];
    if (f <= f1) return mix(v0, v1, easing((f - f0) / Math.max(1e-6, f1 - f0)));
  }
  return points[points.length - 1][1];
};

export const minutes = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

// Espace fine insécable, pour « 15 g », « 93 °C ».
export const FINE = " ";
