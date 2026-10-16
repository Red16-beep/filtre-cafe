import { useId } from "react";
import { nettoyerId } from "./Trace";

// Trois volutes qui montent d'un point, en ondulant.
export const Vapeur: React.FC<{
  x: number;
  y: number;
  frame: number;
  hauteur?: number;
  intensite?: number;
  ecart?: number;
}> = ({ x, y, frame, hauteur = 150, intensite = 1, ecart = 12 }) => {
  const id = nettoyerId(useId());
  if (intensite <= 0.01) return null;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-v`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#efc79c" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#efc79c" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((j) => {
        const pts: string[] = [];
        const decale = (frame * 0.9 + j * 17) % 24;
        for (let h = 0; h <= hauteur; h += 8) {
          const xx =
            x +
            (j - 1) * ecart +
            Math.sin(h * 0.045 + frame * 0.11 + j * 2.1) * (4 + h * 0.08);
          const yy = y - 10 - h - decale;
          pts.push(
            `${pts.length ? "L" : "M"} ${xx.toFixed(1)} ${yy.toFixed(1)}`,
          );
        }
        return (
          <path
            key={j}
            d={pts.join(" ")}
            fill="none"
            stroke={`url(#${id}-v)`}
            strokeWidth={4.5}
            strokeLinecap="round"
            opacity={intensite * 0.85}
          />
        );
      })}
    </g>
  );
};
