import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Fond } from "../dessins/Fond";
import { AERO, EtatAero, PosteAero } from "./PosteAero";

const BASE: EtatAero = {
  frame: 0,
  bouilloire: AERO.bouilloireRepos,
  filet: null,
  impactX: 0,
  poids: 0,
  temps: 0,
  cafe: 1,
  eau: 0,
  carafe: 0,
  gouttes: 0,
  chapeau: { dy: 0, rotation: 0, filtre: 1, mouille: 1 },
};

// Trois états fixes du poste, pour régler le dessin.
export const EssaiAero: React.FC = () => {
  const f = useCurrentFrame();
  const etats: EtatAero[] = [
    { ...BASE, frame: f, eau: 0.25, poids: 50, temps: 8, remous: 1, agitateur: { visible: 1, phase: 0.3 }, compteur: { valeur: "3", libelle: "SUR 5", visible: 1 } },
    { ...BASE, frame: f, eau: 1, poids: 200, temps: 52, attente: { restant: 38, p: 0.37, visible: 1 }, repere: { lignes: ["200 ml"], y: 62, visible: 1 } },
    { ...BASE, frame: f, eau: 0.5, poids: 200, temps: 104, piston: { joint: 140, visible: 1 }, carafe: 0.35, gouttes: 0.85, sifflement: 0.4 },
  ];
  return (
    <AbsoluteFill>
      <Fond />
      <PosteAero e={etats[Math.min(2, Math.floor(f / 10))]} />
    </AbsoluteFill>
  );
};
