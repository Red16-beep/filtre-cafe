import { useId } from "react";
import { C, prog } from "../theme";
import { Trace, arcArriere, arcAvant, ellipse, nettoyerId } from "./Trace";

// Chemex : une seule pièce de verre en sablier, col de bois noué d'un lien de cuir.
// Repère local : centre du bord supérieur, comme le Dripper. Le cône du haut reprend
// la géométrie du Dripper (176 → 38 sur 228) : le papier, le lit et l'eau du
// Dripper (corps={false}) s'y logent sans retouche. Le bas est un second cône,
// un peu plus haut, posé sur un fond plat aux angles arrondis.
export const CHEMEX_BAS = 600;
const COL_HAUT = 196;
const COL_BAS = 304;

// Demi-largeur intérieure du bas à la hauteur y.
export const demiBulbe = (y: number) => {
  if (y <= 306) return 44;
  if (y <= 554) return 44 + ((y - 306) * 134) / 248;
  return 178 - ((y - 554) / 46) ** 2 * 22;
};
// Surface du café : niveau 0 (vide) → 1 (la recette entière, environ un tiers du bas).
export const surfaceBulbe = (niveau: number) => CHEMEX_BAS - 8 - niveau * 124;

const PROFIL_D = "M 176 0 L 38 228 C 34 244 34 290 44 306 L 178 554 C 186 572 184 594 158 600";
const PROFIL_G = "M -176 0 L -38 228 C -34 244 -34 290 -44 306 L -178 554 C -186 572 -184 594 -158 600";
const FOND = "M -158 600 L 158 600";
const INTERIEUR =
  "M -38 228 C -34 244 -34 290 -44 306 L -178 554 C -186 572 -184 594 -158 600 L 158 600 C 184 594 186 572 178 554 L 44 306 C 34 290 34 244 38 228 Z";
// Col de bois : deux pièces qui épousent la taille du sablier et s'évasent.
const COL = `M -76 ${COL_HAUT} Q -40 250 -70 ${COL_BAS} L 70 ${COL_BAS} Q 40 250 76 ${COL_HAUT} Z`;
// Bec : le bord se prolonge à gauche, la rainure descend dans le verre.
export const BEC_CHEMEX = { x: -210, y: -22 };

export const Chemex: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  trace?: number;
  niveau?: number; // liquide dans le bas, 0 → 1
  teinte?: number; // 0 eau claire (rinçage), 1 café
  couche?: "tout" | "arriere" | "avant";
  inclinaison?: number; // le parent incline la Chemex : la surface reste horizontale
}> = ({ x = 540, y = 802, s = 1, trace = 1, niveau = 0, teinte = 1, couche = "tout", inclinaison = 0 }) => {
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const arriere = couche !== "avant";
  const avant = couche !== "arriere";
  const ly = surfaceBulbe(niveau);
  const rx = demiBulbe(ly) - 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-int`}>
          <path d={INTERIEUR} />
        </clipPath>
        <linearGradient id={`${id}-cafe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a4b22" />
          <stop offset="55%" stopColor="#4a2410" />
          <stop offset="100%" stopColor="#2a1408" />
        </linearGradient>
        <linearGradient id={`${id}-bois`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5e3519" />
          <stop offset="45%" stopColor="#9a6036" />
          <stop offset="100%" stopColor="#5e3519" />
        </linearGradient>
      </defs>
      {arriere ? (
        <>
          <path d={INTERIEUR} fill={C.crema} opacity={0.05 * remplir} />
          <path d="M -176 0 L -38 228 L 38 228 L 176 0 Z" fill={C.crema} opacity={0.04 * remplir} />
          <Trace d={arcArriere(0, 0, 176, 27)} p={t(0, 0.25)} w={5} />
          {niveau > 0.003 ? (
            <g clipPath={`url(#${id}-int)`}>
              <g transform={`rotate(${-inclinaison} 0 ${ly})`}>
                <rect x={-420} y={ly} width={840} height={700} fill={`url(#${id}-cafe)`} opacity={teinte * 0.95} />
                <rect x={-420} y={ly} width={840} height={700} fill="#e8d8c0" opacity={(1 - teinte) * 0.28} />
                {Math.abs(inclinaison) > 4 ? (
                  <line x1={-420} y1={ly} x2={420} y2={ly} stroke={teinte > 0.5 ? "#a8662f" : "#f3e4cf"} strokeWidth={6} opacity={0.8} />
                ) : null}
              </g>
              {Math.abs(inclinaison) > 4 ? null : (
              <>
              <ellipse
                cx={0}
                cy={ly}
                rx={rx}
                ry={rx * 0.14}
                fill={teinte > 0.5 ? "#a8662f" : "#f3e4cf"}
                opacity={teinte > 0.5 ? 0.9 : 0.4}
              />
              <path d={arcAvant(0, ly, rx, rx * 0.14)} fill="none" stroke="#f6f1ea" strokeWidth={2.5} opacity={0.4} />
              </>
              )}
            </g>
          ) : null}
        </>
      ) : null}
      {avant ? (
        <>
          {/* Le verre, au trait */}
          <Trace d={PROFIL_G} p={t(0.05, 0.45)} w={5} />
          <Trace d={PROFIL_D} p={t(0.05, 0.45)} w={5} />
          <Trace d={FOND} p={t(0.4, 0.5)} w={5} />
          <Trace d={arcAvant(0, 0, 176, 27)} p={t(0, 0.25)} w={6} />
          <Trace d={ellipse(0, 0, 164, 24)} p={t(0.15, 0.4)} w={2.5} o={0.5} />
          {/* Bec et rainure d'air */}
          <Trace d={`M -176 0 C -190 -2 -202 -8 ${BEC_CHEMEX.x} ${BEC_CHEMEX.y}`} p={t(0.2, 0.35)} w={5} />
          <Trace d="M -166 10 L -54 196" p={t(0.35, 0.6)} w={3} o={0.5} />
          {/* Reflets */}
          <Trace d="M 150 22 L 70 156" p={t(0.5, 0.8)} w={6} c="#ffffff" o={0.1} />
          <Trace d="M 150 470 L 112 400" p={t(0.55, 0.85)} w={7} c="#ffffff" o={0.12} />
          {/* Col de bois et lien de cuir */}
          <g opacity={remplir}>
            <path d={COL} fill={`url(#${id}-bois)`} />
            {[-34, -12, 12, 34].map((gx) => (
              <path
                key={gx}
                d={`M ${gx} ${COL_HAUT + 8} Q ${gx * 0.62} 250 ${gx * 0.9} ${COL_BAS - 8}`}
                fill="none"
                stroke="#3e2210"
                strokeWidth={1.8}
                opacity={0.45}
              />
            ))}
            <path d="M -50 244 Q 0 254 50 244 L 50 256 Q 0 266 -50 256 Z" fill="#2e1a0e" />
            <path d="M 44 252 Q 70 262 76 290" fill="none" stroke="#2e1a0e" strokeWidth={4.5} strokeLinecap="round" />
            <path d="M 44 255 Q 60 272 58 300" fill="none" stroke="#2e1a0e" strokeWidth={4.5} strokeLinecap="round" />
            <circle cx={77} cy={298} r={11} fill="#a8703f" stroke="#2e1a0e" strokeWidth={2.5} />
          </g>
          <Trace d={COL} p={t(0.45, 0.8)} w={3.5} />
        </>
      ) : null}
    </g>
  );
};
