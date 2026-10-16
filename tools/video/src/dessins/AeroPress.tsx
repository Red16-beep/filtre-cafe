import { useId } from "react";
import { C, SANS, prog } from "../theme";
import { Trace, arcArriere, arcAvant, ellipse, nettoyerId } from "./Trace";

// AeroPress vue légèrement d'en haut, chambre transparente.
// Repère local : centre du bord supérieur de la chambre.
export const RX = 100; // demi-largeur de la chambre
const RY = 0.15;
export const COLLERETTE = 300; // la collerette repose sur la carafe
export const FOND = 336; // le filtre, au fond de la chambre
export const HAUT_EAU_MAX = 62; // niveau atteint à 200 ml
const LIT = 46; // épaisseur du lit de 15 g

export const hautLit = (cafe: number) => FOND - cafe * LIT;
export const niveauAero = (cafe: number, eau: number) => hautLit(cafe) - eau * (hautLit(cafe) - HAUT_EAU_MAX);

// Chapeau : disque perforé, crans de vissage, filtre papier blanc.
export const Chapeau: React.FC<{ x: number; y: number; s?: number; trace?: number; rotation?: number; filtre?: number }> = ({
  x,
  y,
  s = 1,
  trace = 1,
  rotation = 0,
  filtre = 1,
}) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -106 0 A 106 16 0 0 0 106 0 L 106 20 A 106 16 0 0 1 -106 20 Z" fill={C.corps} opacity={remplir} />
      {filtre > 0 ? <ellipse cx={0} cy={0} rx={98} ry={14} fill={C.papier} opacity={0.9 * filtre * remplir} /> : null}
      <Trace d={ellipse(0, 0, 106, 16)} p={t(0, 0.5)} w={4} />
      <Trace d="M -106 0 L -106 20 M 106 0 L 106 20" p={t(0.3, 0.5)} w={4} />
      <Trace d={arcAvant(0, 20, 106, 16)} p={t(0.4, 0.7)} w={4} />
      {/* crans : ils défilent quand on visse */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = ((i / 9) * 2 * Math.PI + rotation) % (2 * Math.PI);
        if (Math.cos(a) < 0.1) return null;
        const xx = Math.sin(a) * 106;
        return (
          <line
            key={i}
            x1={xx}
            y1={6 + 16 * Math.cos(a) * 0.5}
            x2={xx}
            y2={22 + 16 * Math.cos(a) * 0.5}
            stroke={C.crema}
            strokeWidth={2.5}
            opacity={0.55 * remplir}
          />
        );
      })}
    </g>
  );
};

// Piston : corps, joint sombre en bas, collerette en haut. Repère : le joint.
export const Piston: React.FC<{ x: number; y: number; s?: number; longueur?: number; trace?: number }> = ({
  x,
  y,
  s = 1,
  longueur = 250,
  trace = 1,
}) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const L = longueur;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -88 ${-L} L -88 -20 L 88 -20 L 88 ${-L} Z`} fill={C.crema} opacity={0.06 * remplir} />
      <Trace d={`M -88 ${-L + 8} L -88 -20 M 88 ${-L + 8} L 88 -20`} p={t(0.1, 0.5)} w={4} />
      <Trace d="M -84 -60 L -84 -28" p={t(0.4, 0.7)} w={6} c="#ffffff" o={0.12} />
      {/* joint */}
      <path d="M -95 -20 A 95 14 0 0 0 95 -20 L 95 0 A 95 14 0 0 1 -95 0 Z" fill="#3a2a22" opacity={remplir} />
      <Trace d={`${arcAvant(0, -20, 95, 14)} M -95 -20 L -95 0 M 95 -20 L 95 0`} p={t(0.3, 0.6)} w={3.5} />
      <Trace d={arcAvant(0, 0, 95, 14)} p={t(0.4, 0.7)} w={3.5} />
      {/* collerette du haut */}
      <path
        d={`M -116 ${-L} A 116 17 0 0 0 116 ${-L} L 116 ${-L + 12} A 116 17 0 0 1 -116 ${-L + 12} Z`}
        fill={C.corps}
        opacity={remplir}
      />
      <Trace d={ellipse(0, -L, 116, 17)} p={t(0, 0.4)} w={4.5} />
      <Trace d={`M -116 ${-L} L -116 ${-L + 12} M 116 ${-L} L 116 ${-L + 12}`} p={t(0.3, 0.45)} w={4} />
      <Trace d={arcAvant(0, -L + 12, 116, 17)} p={t(0.35, 0.6)} w={4} />
    </g>
  );
};

// La chambre, avec son contenu (lit, eau) et ses repères 1 à 4.
export const ChambreAero: React.FC<{
  x: number;
  y: number;
  s?: number;
  trace?: number;
  cafe?: number; // 0 → 1 : lit de café
  eau?: number; // 0 → 1 : jusqu'à 200 ml
  joint?: number | null; // position du joint du piston (repère local), pour comprimer l'eau
  couche?: "tout" | "arriere" | "avant";
  remous?: number; // agitation de la surface
  frame?: number;
}> = ({ x, y, s = 1, trace = 1, cafe = 0, eau = 0, joint = null, couche = "tout", remous = 0, frame = 0 }) => {
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const arriere = couche !== "avant";
  const avant = couche !== "arriere";
  const lit = hautLit(cafe);
  let surface = niveauAero(cafe, eau);
  if (joint !== null) surface = Math.max(surface, joint);
  const vague = remous > 0 ? Math.sin(frame * 0.9) * 6 * remous : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-int`}>
          <rect x={-95} y={-20} width={190} height={FOND + 20} />
        </clipPath>
        <linearGradient id={`${id}-eau`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c98f58" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#5e2f14" stopOpacity={0.85} />
        </linearGradient>
        <pattern id={`${id}-m`} width={16} height={14} patternUnits="userSpaceOnUse">
          <circle cx={3} cy={4} r={1.6} fill="#b07a48" opacity={0.6} />
          <circle cx={11} cy={2} r={1.2} fill="#2a140a" opacity={0.6} />
          <circle cx={8} cy={10} r={1.5} fill="#c08a55" opacity={0.45} />
        </pattern>
      </defs>
      {arriere ? (
        <>
          <Trace d={arcArriere(0, 0, 106, 16)} p={t(0, 0.3)} w={5} />
          <g clipPath={`url(#${id}-int)`}>
            {cafe > 0.001 ? (
              <>
                <rect x={-100} y={lit} width={200} height={FOND - lit + 4} fill="#5a321a" />
                <rect x={-100} y={lit} width={200} height={FOND - lit + 4} fill={`url(#${id}-m)`} />
                <ellipse cx={0} cy={lit} rx={94} ry={94 * RY} fill="#7a4a2a" />
                <ellipse cx={0} cy={lit} rx={94} ry={94 * RY} fill={`url(#${id}-m)`} />
              </>
            ) : null}
            {eau > 0.003 && surface < lit ? (
              <>
                <rect x={-100} y={surface} width={200} height={lit - surface + 6} fill={`url(#${id}-eau)`} />
                <ellipse cx={0} cy={surface + vague * 0.3} rx={94} ry={94 * RY + Math.abs(vague) * 0.4} fill="#c98f58" opacity={0.7} />
                {remous > 0.05 ? (
                  <ellipse
                    cx={vague * 2}
                    cy={surface}
                    rx={60}
                    ry={9}
                    fill="none"
                    stroke="#f3dcbc"
                    strokeWidth={3}
                    pathLength={1}
                    strokeDasharray="0.2 0.1"
                    strokeDashoffset={-frame * 0.03}
                    opacity={0.6 * remous}
                  />
                ) : null}
                <path d={arcAvant(0, surface, 94, 94 * RY)} fill="none" stroke="#f6f1ea" strokeWidth={2.5} opacity={0.45} />
              </>
            ) : null}
          </g>
        </>
      ) : null}
      {avant ? (
        <>
          <path d={`M -100 4 L -100 ${FOND} L 100 ${FOND} L 100 4 Z`} fill={C.crema} opacity={0.05 * remplir} />
          <Trace d={`M -100 4 L -100 ${FOND}`} p={t(0.05, 0.4)} w={5} />
          <Trace d={`M 100 4 L 100 ${FOND}`} p={t(0.05, 0.4)} w={5} />
          <Trace d="M -88 30 L -88 150" p={t(0.5, 0.8)} w={7} c="#ffffff" o={0.1} />
          <Trace d={arcAvant(0, 0, 106, 16)} p={t(0, 0.3)} w={6} />
          <Trace d={ellipse(0, 0, 96, 13)} p={t(0.15, 0.4)} w={2.5} o={0.5} />
          {/* repères 1 à 4 */}
          {[1, 2, 3, 4].map((k) => {
            const yy = 272 - k * 52;
            return (
              <g key={k} opacity={t(0.55 + k * 0.05, 0.8 + k * 0.04)}>
                <circle cx={-60} cy={yy} r={14} fill="none" stroke={C.crema} strokeWidth={2} opacity={0.7} />
                <text
                  x={-60}
                  y={yy + 7}
                  textAnchor="middle"
                  style={{ fontFamily: SANS, fontWeight: 600, fontSize: 19 }}
                  fill={C.crema}
                  opacity={0.8}
                >
                  {k}
                </text>
              </g>
            );
          })}
          {/* collerette, translucide */}
          <path
            d={`M -152 ${COLLERETTE - 8} A 152 22 0 0 0 152 ${COLLERETTE - 8} L 152 ${COLLERETTE + 4} A 152 22 0 0 1 -152 ${COLLERETTE + 4} Z`}
            fill={C.crema}
            opacity={0.1 * remplir}
          />
          <Trace d={ellipse(0, COLLERETTE - 8, 152, 22)} p={t(0.3, 0.6)} w={4} />
          <Trace d={`M -152 ${COLLERETTE - 8} L -152 ${COLLERETTE + 4} M 152 ${COLLERETTE - 8} L 152 ${COLLERETTE + 4}`} p={t(0.5, 0.6)} w={4} />
          <Trace d={arcAvant(0, COLLERETTE + 4, 152, 22)} p={t(0.5, 0.75)} w={4} />
        </>
      ) : null}
    </g>
  );
};
