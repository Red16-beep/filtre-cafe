import { Sequence } from "remotion";
import { usePaysage } from "../format";
import { C, SANS, SERIF } from "../theme";
import { Legende } from "../ui/Legende";

// Briques communes des scènes d'épisode : la toile SVG au format de la vidéo, une légende du tuto
// tenue d'une image à une autre du chapitre, et les deux styles de texte.

export const Toile: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const paysage = usePaysage();
  const [w, h] = paysage ? [1920, 1080] : [1080, 1920];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
      {children}
    </svg>
  );
};

export const LegendeDe: React.FC<{ de: number; a: number } & React.ComponentProps<typeof Legende>> = ({ de, a, ...l }) => (
  <Sequence from={de} durationInFrames={Math.max(1, a - de)} layout="none">
    <Legende {...l} duree={Math.max(1, a - de)} />
  </Sequence>
);

export const texteSerif = (taille: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 500,
  fontSize: taille,
  lineHeight: 1.04,
  color: C.creme,
  ...extra,
});

export const texteSans = (taille: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 400,
  fontSize: taille,
  lineHeight: 1.25,
  color: "rgba(239,199,156,0.94)",
  ...extra,
});
