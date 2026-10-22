import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { usePaysage } from "../format";
import { C, DOUX, SANS, SERIF, SORTIE, prog } from "../theme";
import { CARTE, Chapitre } from "./temps";

// Apparition d'un bloc : fondu et montée à l'entrée, fondu à la sortie (images du parent).
export const vu = (f: number, entree: number, sortie?: number, montee = 26) => {
  const e = prog(f, entree, entree + 14, SORTIE);
  const s = sortie === undefined ? 0 : prog(f, sortie, sortie + 12, DOUX);
  return { opacity: e * (1 - s), translate: `0 ${(1 - e) * montee - s * 12}px` };
};

// Un chapitre apparaît quand sa carte s'en va, et s'efface sur ses 14 dernières images, avant la carte du suivant.
export const FinChapitre: React.FC<{ duree: number; carte?: boolean; children: React.ReactNode }> = ({ duree, carte = true, children }) => {
  const f = useCurrentFrame();
  const entree = carte ? prog(f, CARTE - 6, CARTE + 8, SORTIE) : 1;
  return <AbsoluteFill style={{ opacity: entree * (1 - prog(f, duree - 14, duree, DOUX)) }}>{children}</AbsoluteFill>;
};

// Carte de chapitre : numéro, titre, rappel de l'épisode. 1,6 s, la voix se tait.
export const CarteChapitre: React.FC<{ num: string; titre: string; serie: string }> = ({ num, titre, serie }) => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const o = prog(f, 0, 10, SORTIE) * (1 - prog(f, CARTE - 12, CARTE, DOUX));
  const trait = prog(f, 4, 26, SORTIE);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: paysage ? 26 : 34, letterSpacing: "0.24em", color: "rgba(239,199,156,0.62)", textTransform: "uppercase" }}>
        {serie}
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: paysage ? 150 : 190, lineHeight: 1, color: C.crema, marginTop: 26, translate: `0 ${(1 - prog(f, 0, 16, SORTIE)) * 30}px` }}>
        {num}
      </div>
      <div style={{ width: (paysage ? 260 : 320) * trait, height: 2, backgroundColor: "rgba(239,199,156,0.5)", margin: "34px 0 30px" }} />
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: paysage ? 92 : 104, lineHeight: 1.05, color: C.creme, textAlign: "center", maxWidth: paysage ? 1500 : 940, translate: `0 ${(1 - prog(f, 4, 20, SORTIE)) * 24}px` }}>
        {titre}
      </div>
    </AbsoluteFill>
  );
};

// Repère discret du chapitre en cours, en haut à gauche, et l'adresse du site en bas à droite.
export const Reperes: React.FC<{ chapitres: Chapitre[]; finAdresse: number }> = ({ chapitres, finAdresse }) => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const c = chapitres.find((x) => f >= x.debut && f < x.fin);
  const dans = c && c.num ? f - c.debut : -1;
  const o = c && c.num ? prog(dans, CARTE + 6, CARTE + 20, SORTIE) * (1 - prog(dans, c.fin - c.debut - 16, c.fin - c.debut - 4)) : 0;
  const adresse = interpolate(f, [30, 50, finAdresse - 20, finAdresse], [0, 0.42, 0.42, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {c && c.num ? (
        <div style={{ position: "absolute", left: paysage ? 120 : 80, top: paysage ? 58 : 150, opacity: o * 0.7, fontFamily: SANS, fontWeight: 600, fontSize: paysage ? 22 : 28, letterSpacing: "0.2em", color: C.crema, textTransform: "uppercase" }}>
          {c.num} · {c.titre}
        </div>
      ) : null}
      <div style={{ position: "absolute", right: paysage ? 64 : 60, bottom: paysage ? 44 : 120, opacity: adresse, fontFamily: SANS, fontWeight: 600, fontSize: paysage ? 24 : 30, letterSpacing: "0.04em", color: C.crema }}>
        filtre.cafe
      </div>
    </AbsoluteFill>
  );
};
