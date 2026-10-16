import { createContext, useContext } from "react";

// Vertical 1080 × 1920 (Shorts, Reels, Pinterest) ou paysage 1920 × 1080
// (article, YouTube). Les scènes lisent le format et placent leurs éléments.
export type Format = "vertical" | "paysage";
export const FormatCtx = createContext<Format>("vertical");
export const useFormat = () => useContext(FormatCtx);
export const usePaysage = () => useContext(FormatCtx) === "paysage";

// Dimensions de l'image selon le format.
export const TAILLE = {
  vertical: { w: 1080, h: 1920 },
  paysage: { w: 1920, h: 1080 },
} as const;
