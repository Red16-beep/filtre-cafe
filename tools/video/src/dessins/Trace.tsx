import { C } from "../theme";

// Un trait qui se dessine : p va de 0 (rien) à 1 (trait complet).
export const Trace: React.FC<{
  d: string;
  p?: number;
  w?: number;
  c?: string;
  o?: number;
  fill?: string;
  fillOpacity?: number;
  dash?: string;
}> = ({
  d,
  p = 1,
  w = 5,
  c = C.crema,
  o = 1,
  fill = "none",
  fillOpacity = 1,
  dash,
}) => {
  if (p <= 0.001) return null;
  return (
    <path
      d={d}
      pathLength={dash ? undefined : 1}
      strokeDasharray={dash ?? "1 1"}
      strokeDashoffset={dash ? 0 : 1 - Math.min(1, p)}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={o}
    />
  );
};

// Ellipse sous forme de chemin, pour pouvoir la dessiner au trait.
export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

// Demi-ellipse avant (le bas, côté spectateur) ou arrière (le haut).
export const arcAvant = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`;
export const arcArriere = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;

export const nettoyerId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");
