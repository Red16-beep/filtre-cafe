import { useId } from "react";
import { random } from "remotion";
import { C, prog } from "../theme";
import { Trace, nettoyerId } from "./Trace";

// Cafetière italienne (moka) à pans, en coupe légère : on voit l'eau dans la
// chaudière, le café dans l'entonnoir et la montée dans la partie haute.
// Repère local : centre du fond.
const CHAUDIERE = "M -100 0 L -82 -150 L 82 -150 L 100 0 Z";
const HAUTE = "M -78 -164 L -104 -318 L 104 -318 L 78 -164 Z";
const ANSE = "M 96 -300 L 168 -292 Q 180 -290 177 -278 L 161 -198 Q 158 -186 146 -186 L 84 -190 Z";
export const VALVE_Y = -100;
const COLONNE_HAUT = -262;

export type EtatMoka = {
  eau: number; // 0 → 1 (1 = jusqu'à la valve)
  entonnoir: number; // 0 → 1 visibilité
  remplissage: number; // café dans l'entonnoir, 0 → 1 (ras bord)
  haut: number; // visibilité (tracé) de la partie haute
  hautDy: number; // la partie haute descend pour être vissée
  rotation: number; // vissage : les pans défilent
  couvercle: number; // 0 fermé → 1 ouvert
  cafeHaut: number; // niveau dans la partie haute, 0 → 1
  flux: number; // jaillissement par la colonne, 0 → 1
  crachote: number; // fin d'extraction : vapeur et projections, 0 → 1
  frame: number;
};

export const Moka: React.FC<{ x: number; y: number; s?: number; trace?: number; e: EtatMoka }> = ({
  x,
  y,
  s = 1,
  trace = 1,
  e,
}) => {
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const th = (a: number, b: number) => prog(trace * e.haut, a, b);
  const hDy = e.hautDy;
  const yEau = -e.eau * -VALVE_Y; // 0 → -100
  const yHaut = -164 - e.cafeHaut * 86;
  const decale = Math.sin(e.rotation) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-ch`}>
          <path d="M -94 -4 L -78 -146 L 78 -146 L 94 -4 Z" />
        </clipPath>
        <clipPath id={`${id}-ha`}>
          <path d={`M -74 ${-166 + hDy} L -98 ${-314 + hDy} L 98 ${-314 + hDy} L 74 ${-166 + hDy} Z`} />
        </clipPath>
        <pattern id={`${id}-m`} width={14} height={12} patternUnits="userSpaceOnUse">
          <circle cx={3} cy={3} r={1.5} fill="#b07a48" opacity={0.6} />
          <circle cx={10} cy={2} r={1.1} fill="#2a140a" opacity={0.6} />
          <circle cx={7} cy={9} r={1.4} fill="#c08a55" opacity={0.45} />
        </pattern>
      </defs>

      {/* chaudière : eau */}
      {e.eau > 0.003 ? (
        <g clipPath={`url(#${id}-ch)`}>
          <rect x={-110} y={yEau} width={220} height={-yEau + 4} fill="#d9e2e6" opacity={0.18} />
          <line x1={-110} y1={yEau} x2={110} y2={yEau} stroke="#f6f1ea" strokeWidth={2.5} opacity={0.55} />
        </g>
      ) : null}
      {/* entonnoir et son café */}
      {e.entonnoir > 0.01 ? (
        <g opacity={e.entonnoir}>
          <path d="M -7 -112 L -7 -14 L 7 -14 L 7 -112" fill="none" stroke={C.crema} strokeWidth={3} opacity={0.75} />
          <path d="M -72 -152 L -66 -114 L 66 -114 L 72 -152" fill={C.corps} opacity={0.6} />
          {e.remplissage > 0.01 ? (
            <g>
              <path d={`M -71 ${-114 - 38 * e.remplissage} L -66 -114 L 66 -114 L 71 ${-114 - 38 * e.remplissage} Z`} fill="#5a321a" />
              <path d={`M -71 ${-114 - 38 * e.remplissage} L -66 -114 L 66 -114 L 71 ${-114 - 38 * e.remplissage} Z`} fill={`url(#${id}-m)`} />
            </g>
          ) : null}
          <path d="M -72 -152 L -66 -114 L 66 -114 L 72 -152" fill="none" stroke={C.crema} strokeWidth={3.5} strokeLinejoin="round" />
          <line x1={-76} y1={-152} x2={76} y2={-152} stroke={C.crema} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
      {/* corps de la chaudière */}
      <path d={CHAUDIERE} fill={C.crema} opacity={0.06 * remplir} />
      <Trace d={CHAUDIERE} p={t(0, 0.45)} w={5} />
      <Trace d={`M ${-38 + decale} 0 L ${-31 + decale} -150 M ${38 + decale} 0 L ${31 + decale} -150`} p={t(0.3, 0.6)} w={3} o={0.55} />
      <Trace d="M -88 -18 L -76 -132" p={t(0.5, 0.8)} w={7} c="#ffffff" o={0.08} />
      {/* valve */}
      <circle cx={62} cy={VALVE_Y} r={10} fill={C.corps} opacity={remplir} />
      <Trace d={`M 52 ${VALVE_Y} A 10 10 0 1 0 72 ${VALVE_Y} A 10 10 0 1 0 52 ${VALVE_Y}`} p={t(0.5, 0.7)} w={3} />

      {/* partie haute */}
      {e.haut > 0.01 ? (
        <g>
          <g clipPath={`url(#${id}-ha)`}>
            {e.cafeHaut > 0.003 ? (
              <>
                <rect x={-110} y={yHaut + hDy} width={220} height={-yHaut + 4} fill="#5e2f14" opacity={0.92} />
                <line x1={-110} y1={yHaut + hDy} x2={110} y2={yHaut + hDy} stroke="#c98f58" strokeWidth={4} opacity={0.9} />
              </>
            ) : null}
          </g>
          {/* colonne centrale */}
          <path
            d={`M -9 ${-164 + hDy} L -9 ${COLONNE_HAUT + hDy} M 9 ${-164 + hDy} L 9 ${COLONNE_HAUT + hDy}`}
            stroke={C.crema}
            strokeWidth={3}
            opacity={0.7 * th(0.4, 0.7)}
          />
          {e.flux > 0.01
            ? [-1, 1].map((cote) => (
                <path
                  key={cote}
                  d={`M ${cote * 4} ${COLONNE_HAUT + hDy} Q ${cote * 26} ${COLONNE_HAUT - 22 + hDy} ${cote * 22} ${COLONNE_HAUT + 18 + hDy} L ${cote * 12} ${yHaut + hDy}`}
                  fill="none"
                  stroke="#8a4b22"
                  strokeWidth={5 + 3 * Math.sin(e.frame * (Math.PI * 2) / 180 * 23 + cote)}
                  strokeLinecap="round"
                  opacity={e.flux}
                />
              ))
            : null}
          {e.crachote > 0.01
            ? Array.from({ length: 8 }).map((_, i) => {
                const ph = ((e.frame + i * 7) % 20) / 20;
                const dx = (random(`cr-${i}`) - 0.5) * 70 * ph;
                const dy = -ph * 70;
                return (
                  <circle
                    key={i}
                    cx={dx}
                    cy={COLONNE_HAUT + dy + hDy}
                    r={i % 2 ? 4 + ph * 10 : 2.5}
                    fill={i % 2 ? "#f6f1ea" : "#8a4b22"}
                    opacity={(1 - ph) * e.crachote * (i % 2 ? 0.45 : 0.9)}
                  />
                );
              })
            : null}
          <g transform={`translate(0 ${hDy})`}>
            <path d={HAUTE} fill={C.crema} opacity={0.06 * th(0.6, 1)} />
            <Trace d={HAUTE} p={th(0, 0.45)} w={5} />
            <Trace d={`M ${-30 + decale} -164 L ${-40 + decale} -318 M ${30 + decale} -164 L ${40 + decale} -318`} p={th(0.3, 0.6)} w={3} o={0.55} />
            <Trace d="M -84 -184 L -100 -296" p={th(0.5, 0.8)} w={7} c="#ffffff" o={0.08} />
            {/* bague de vissage */}
            <path d="M -88 -164 L -88 -150 L 88 -150 L 88 -164 Z" fill={C.corps} opacity={th(0.5, 1)} />
            <Trace d="M -88 -164 L -88 -150 L 88 -150 L 88 -164 Z" p={th(0.2, 0.5)} w={4} />
            {/* bec */}
            <Trace d="M -104 -318 L -136 -315 L -108 -296" p={th(0.4, 0.6)} w={4} />
            {/* anse */}
            <path d={ANSE} fill="#120c08" opacity={th(0.5, 1)} />
            <Trace d={ANSE} p={th(0.45, 0.85)} w={4.5} />
            {/* couvercle à charnière (côté anse) */}
            <g transform={`rotate(${e.couvercle * 60} 100 -318)`}>
              <path d="M -108 -318 L 108 -318 L 96 -338 L -96 -338 Z" fill={C.corps} opacity={th(0.5, 1)} />
              <Trace d="M -108 -318 L 108 -318 L 96 -338 L -96 -338 Z" p={th(0.35, 0.7)} w={4.5} />
              <ellipse cx={0} cy={-348} rx={16} ry={9} fill="#120c08" opacity={th(0.6, 1)} />
              <Trace d="M -16 -348 A 16 9 0 1 0 16 -348 A 16 9 0 1 0 -16 -348" p={th(0.6, 0.85)} w={3.5} />
            </g>
          </g>
        </g>
      ) : null}
    </g>
  );
};

// Brûleur à gaz, flammes vivantes. Repère : centre du chapeau du brûleur.
export const Bruleur: React.FC<{ x: number; y: number; s?: number; feu: number; frame: number; trace?: number }> = ({
  x,
  y,
  s = 1,
  feu,
  frame,
  trace = 1,
}) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* grille */}
      <Trace d="M -170 10 L 170 10" p={t(0, 0.4)} w={5} />
      <Trace d="M -150 10 L -110 -4 M 150 10 L 110 -4" p={t(0.3, 0.6)} w={5} />
      <Trace d="M -60 12 A 60 12 0 0 0 60 12" p={t(0.2, 0.6)} w={4} o={0.7} />
      {feu > 0.01
        ? Array.from({ length: 9 }).map((_, k) => {
            const xx = -64 + k * 16;
            const h = (14 + 26 * feu) * (0.8 + 0.25 * Math.sin(frame * (Math.PI * 2) / 180 * 20 + k * 1.9));
            const w = 5 + 3 * feu;
            return (
              <g key={k} opacity={Math.min(1, feu * 2.5)}>
                <path d={`M ${xx - w} 8 Q ${xx} ${8 - h * 1.25} ${xx + w} 8 Z`} fill={C.ceriseVive} opacity={0.85} />
                <path d={`M ${xx - w * 0.5} 8 Q ${xx} ${8 - h * 0.7} ${xx + w * 0.5} 8 Z`} fill="#f3c58f" opacity={0.9} />
              </g>
            );
          })
        : null}
    </g>
  );
};
