import { useId } from "react";
import { C, prog } from "../theme";
import { Trace, arcAvant, ellipse, nettoyerId } from "./Trace";

// Machine à porte-filtre (vue de face), porte-filtre, tamper, tasse.

// Corps de la machine. Repère : centre du bas de la caisse.
export const Machine: React.FC<{ x: number; y: number; s?: number; trace?: number }> = ({ x, y, s = 1, trace = 1 }) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const CAISSE = "M -290 0 L -290 -560 Q -290 -590 -260 -590 L 260 -590 Q 290 -590 290 -560 L 290 0";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`${CAISSE} Z`} fill={C.corps} opacity={0.75 * remplir} />
      <Trace d={CAISSE} p={t(0, 0.45)} w={5} />
      {/* bandeau et manomètre */}
      <Trace d="M -250 -520 L 250 -520" p={t(0.3, 0.55)} w={3} o={0.5} />
      <circle cx={-180} cy={-555} r={22} fill={C.nuit} opacity={remplir} />
      <Trace d="M -202 -555 A 22 22 0 1 0 -158 -555 A 22 22 0 1 0 -202 -555" p={t(0.4, 0.6)} w={3.5} />
      <line x1={-180} y1={-555} x2={-166} y2={-566} stroke={C.ceriseVive} strokeWidth={3} opacity={remplir} />
      {/* tête de groupe */}
      <path d="M -80 -520 L -80 -470 L 80 -470 L 80 -520 Z" fill={C.nuit} opacity={remplir} />
      <Trace d="M -80 -520 L -80 -470 L 80 -470 L 80 -520" p={t(0.35, 0.6)} w={4.5} />
      <Trace d={arcAvant(0, -470, 80, 12)} p={t(0.45, 0.65)} w={4} />
      {/* égouttoir */}
      <path d="M -250 -96 L 250 -96 L 250 -60 L -250 -60 Z" fill={C.nuit} opacity={remplir} />
      <Trace d="M -250 -96 L 250 -96 L 250 -60 L -250 -60 Z" p={t(0.5, 0.75)} w={4} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={-220 + i * 40} y1={-90} x2={-220 + i * 40} y2={-66} stroke={C.crema} strokeWidth={2.5} opacity={0.4 * remplir} />
      ))}
    </g>
  );
};

// Porte-filtre. Repère : centre du haut du panier. tasse : 0 vrac → 1 tassé.
export const PorteFiltre: React.FC<{
  x: number;
  y: number;
  s?: number;
  trace?: number;
  dose: number; // 0 → 1
  tasse: number; // vrac (dôme) → plat → tassé
  angle?: number; // rotation de la poignée (verrouillage)
}> = ({ x, y, s = 1, trace = 1, dose, tasse, angle = 0 }) => {
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const dome = (1 - Math.min(1, tasse * 2)) * 26 * dose;
  const haut = -2 + Math.max(0, tasse - 0.5) * 2 * 10; // le tassage abaisse le lit
  const lit = 40 * dose;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-p`}>
          <path d="M -70 0 L -64 52 L 64 52 L 70 0 Z" />
        </clipPath>
        <pattern id={`${id}-m`} width={10} height={9} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={1.1} fill="#b07a48" opacity={0.6} />
          <circle cx={7} cy={6} r={1} fill="#2a140a" opacity={0.6} />
        </pattern>
      </defs>
      {/* poignée */}
      <g transform={`rotate(${angle} 72 26)`}>
        <path d="M 72 14 L 250 40 Q 268 44 266 58 Q 264 70 248 68 L 72 44 Z" fill="#120c08" opacity={remplir} />
        <Trace d="M 72 14 L 250 40 Q 268 44 266 58 Q 264 70 248 68 L 72 44" p={t(0.3, 0.7)} w={4} />
      </g>
      {/* café dans le panier */}
      {dose > 0.01 ? (
        <g clipPath={`url(#${id}-p)`}>
          <path d={`M -80 ${52 - lit + haut} Q 0 ${52 - lit + haut - dome * 2} 80 ${52 - lit + haut} L 80 60 L -80 60 Z`} fill="#5a321a" />
          <path d={`M -80 ${52 - lit + haut} Q 0 ${52 - lit + haut - dome * 2} 80 ${52 - lit + haut} L 80 60 L -80 60 Z`} fill={`url(#${id}-m)`} />
        </g>
      ) : null}
      {dose > 0.01 && dome > 1 ? (
        <path d={`M -62 ${52 - lit + haut} Q 0 ${52 - lit + haut - dome * 2.4} 62 ${52 - lit + haut}`} fill="#6b3f22" />
      ) : null}
      {/* panier et bec double */}
      <path d="M -76 0 L -68 58 L 68 58 L 76 0 Z" fill={C.crema} opacity={0.06 * remplir} />
      <Trace d="M -76 0 L -68 58 L 68 58 L 76 0" p={t(0, 0.5)} w={5} />
      <Trace d={ellipse(0, 0, 76, 11)} p={t(0.1, 0.4)} w={4} />
      <Trace d="M -22 58 L -26 82 M 22 58 L 26 82" p={t(0.5, 0.8)} w={6} />
    </g>
  );
};

// Tamper. Repère : centre de la base.
export const Tamper: React.FC<{ x: number; y: number; s?: number; trace?: number }> = ({ x, y, s = 1, trace = 1 }) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -66 0 L -66 -26 L 66 -26 L 66 0 Z" fill={C.corps} opacity={remplir} />
      <Trace d="M -66 0 L -66 -26 L 66 -26 L 66 0 Z" p={t(0, 0.4)} w={4.5} />
      <path d="M -16 -26 C -16 -60 -34 -80 -34 -110 C -34 -140 34 -140 34 -110 C 34 -80 16 -60 16 -26 Z" fill="#120c08" opacity={remplir} />
      <Trace d="M -16 -26 C -16 -60 -34 -80 -34 -110 C -34 -140 34 -140 34 -110 C 34 -80 16 -60 16 -26" p={t(0.3, 0.9)} w={4.5} />
    </g>
  );
};

// Petite tasse à espresso. Repère : centre du fond.
export const TasseEspresso: React.FC<{ x: number; y: number; s?: number; trace?: number; niveau: number }> = ({
  x,
  y,
  s = 1,
  trace = 1,
  niveau,
}) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const CORPS = "M -64 -84 C -62 -26 -40 0 0 0 C 40 0 62 -26 64 -84";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 60 -66 C 98 -66 100 -26 56 -24" fill="none" stroke={C.crema} strokeWidth={9} opacity={remplir} />
      <path d="M 60 -66 C 98 -66 100 -26 56 -24" fill="none" stroke={C.corps} strokeWidth={3} opacity={remplir} />
      <path d={`${CORPS} Z`} fill={C.corps} opacity={remplir} />
      {niveau > 0.01 ? (
        <>
          <ellipse cx={0} cy={-84 + 22 * (1 - niveau)} rx={58 - 6 * (1 - niveau)} ry={9} fill="#c08a55" opacity={Math.min(1, niveau * 4)} />
          <ellipse cx={-10} cy={-84 + 22 * (1 - niveau)} rx={24} ry={4} fill="#e2b886" opacity={0.6 * Math.min(1, niveau * 4)} />
        </>
      ) : null}
      <Trace d={CORPS} p={t(0, 0.6)} w={4.5} />
      <Trace d={ellipse(0, -84, 64, 11)} p={t(0.3, 0.8)} w={4} />
      <Trace d={arcAvant(0, 6, 92, 12)} p={t(0.5, 0.9)} w={4} />
    </g>
  );
};
