import { useId } from "react";
import { C, prog } from "../theme";
import { Trace, ellipse, nettoyerId } from "./Trace";

// Carafe en verre. Repère local : centre du fond.
const VERRE =
  "M -118 -190 C -120 -176 -122 -164 -124 -150 L -145 -40 Q -148 0 -108 0 L 108 0 Q 148 0 145 -40 L 124 -150 C 122 -164 120 -176 118 -190";
const ANSE =
  "M 126 -160 C 192 -164 214 -128 206 -88 C 200 -54 172 -42 140 -50 L 138 -66 C 160 -62 177 -68 181 -90 C 186 -116 170 -140 124 -138 Z";

const demi = (y: number) => {
  if (y <= -150) return 122;
  if (y <= -40) return 124 + ((y + 150) / 110) * 21;
  return 145 - Math.max(0, y + 16) * 1.1;
};
export const surfaceCarafe = (niveau: number) => -8 - niveau * 150;

export const Carafe: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  trace?: number;
  niveau?: number; // 0 → 1
  teinte?: number; // 0 eau claire, 1 café
}> = ({ x = 540, y = 1318, s = 1, trace = 1, niveau = 0, teinte = 1 }) => {
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const ly = surfaceCarafe(niveau);
  const rx = demi(ly) - 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-int`}>
          <path d={`${VERRE} Z`} />
        </clipPath>
        <linearGradient id={`${id}-cafe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8662f" />
          <stop offset="45%" stopColor="#5e2f14" />
          <stop offset="100%" stopColor="#2e160a" />
        </linearGradient>
      </defs>
      <path d={ANSE} fill={C.corps} opacity={remplir} />
      <Trace d={ANSE} p={t(0.4, 0.8)} w={4.5} />
      <path d={`${VERRE} Z`} fill={C.crema} opacity={0.05 * remplir} />
      {niveau > 0.003 ? (
        <g clipPath={`url(#${id}-int)`}>
          <rect
            x={-160}
            y={ly}
            width={320}
            height={-ly + 4}
            fill={`url(#${id}-cafe)`}
            opacity={teinte * 0.96}
          />
          <rect
            x={-160}
            y={ly}
            width={320}
            height={-ly + 4}
            fill="#efc79c"
            opacity={(1 - teinte) * 0.2}
          />
          <ellipse
            cx={0}
            cy={ly}
            rx={rx}
            ry={rx * 0.12}
            fill={teinte > 0.5 ? "#b97a42" : "#f3e4cf"}
            opacity={teinte > 0.5 ? 0.95 : 0.35}
          />
          <path
            d={`M ${-rx} ${ly} A ${rx} ${rx * 0.12} 0 0 0 ${rx} ${ly}`}
            fill="none"
            stroke="#f6f1ea"
            strokeWidth={2}
            opacity={0.35}
          />
        </g>
      ) : null}
      {[-62, -98, -134].map((g, i) => (
        <Trace
          key={g}
          d={`M 104 ${g} L 122 ${g}`}
          p={t(0.6 + i * 0.05, 0.8 + i * 0.05)}
          w={2.5}
          o={0.4}
        />
      ))}
      <Trace
        d="M -108 -146 L -126 -56"
        p={t(0.55, 0.85)}
        w={7}
        c="#ffffff"
        o={0.14}
      />
      <Trace d={VERRE} p={t(0, 0.5)} w={4.5} />
      <Trace d={ellipse(0, -190, 118, 15)} p={t(0.3, 0.6)} w={4} />
    </g>
  );
};
