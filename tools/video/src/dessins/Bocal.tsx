import { useId } from "react";
import { random } from "remotion";
import { C, SANS, prog } from "../theme";
import { Trace, arcArriere, arcAvant, ellipse, nettoyerId } from "./Trace";

// Grand bocal en verre à couvercle vissé. Repère local : centre du fond.
// Un angle négatif le penche vers la gauche (pour verser).
const RX = 122;
const RI = 114;
const HAUT = 300;
const RY = 0.15;
export const NIVEAU_BOCAL = 236; // 1 litre d'eau avec le café

export type EtatBocal = {
  marc: number; // café sec au fond, 0 → 1
  eau: number; // 0 → 1
  teinte: number; // 0 eau claire → 1 cold brew
  suspension: number; // grains en mouvement
  couvercle: number; // 0 → 1
  inclinaison: number;
  cuillere?: { visible: number; phase: number } | null;
  frame: number;
};

export const Bocal: React.FC<{
  x: number;
  y: number;
  s?: number;
  trace?: number;
  e: EtatBocal;
  couche?: "tout" | "arriere" | "avant";
}> = ({ x, y, s = 1, trace = 1, e, couche = "tout" }) => {
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const arriere = couche !== "avant";
  const avant = couche !== "arriere";
  const yw = -e.eau * NIVEAU_BOCAL;
  const hMarc = e.marc * 62;
  const contre = `rotate(${-e.inclinaison} 0 ${-HAUT / 2})`;
  const cu = e.cuillere;
  const phaseCu = cu ? Math.sin(cu.phase * 2 * Math.PI) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${e.inclinaison} ${-RX} 0)`}>
      <defs>
        <clipPath id={`${id}-int`}>
          <path d={`M ${-RI} -6 L ${-RI} ${-HAUT + 30} Q ${-RI} ${-HAUT + 10} ${-RI + 18} ${-HAUT + 8} L ${RI - 18} ${-HAUT + 8} Q ${RI} ${-HAUT + 10} ${RI} ${-HAUT + 30} L ${RI} -6 Z`} />
        </clipPath>
        <linearGradient id={`${id}-cb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={e.teinte > 0.4 ? "#6b3a1c" : "#d9c3a5"} stopOpacity={0.35 + e.teinte * 0.6} />
          <stop offset="100%" stopColor="#2e160a" stopOpacity={0.3 + e.teinte * 0.65} />
        </linearGradient>
        <pattern id={`${id}-m`} width={18} height={16} patternUnits="userSpaceOnUse">
          <circle cx={4} cy={4} r={2.8} fill="#9a6238" opacity={0.8} />
          <circle cx={12} cy={3} r={2.2} fill="#2a140a" opacity={0.75} />
          <circle cx={9} cy={11} r={2.6} fill="#b07a48" opacity={0.6} />
        </pattern>
      </defs>
      {arriere ? (
        <>
          <Trace d={arcArriere(0, -HAUT + 8, RX - 18, (RX - 18) * RY)} p={t(0, 0.3)} w={4.5} />
          <g clipPath={`url(#${id}-int)`}>
            <g transform={contre}>
              {e.eau > 0.003 ? <rect x={-300} y={yw} width={600} height={-yw + 120} fill={`url(#${id}-cb)`} /> : null}
              {e.suspension > 0.01 && e.eau > 0.05
                ? Array.from({ length: 60 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={(random(`cs-${i}`) - 0.5) * 2 * (RI - 8)}
                      cy={yw + 10 + random(`cy-${i}`) * (-yw - 16) + Math.sin(e.frame * 0.07 + i) * 5}
                      r={2.4 + random(`cr-${i}`) * 3}
                      fill="#4a2814"
                      opacity={0.8 * e.suspension}
                    />
                  ))
                : null}
            </g>
            {hMarc > 0.5 ? (
              <>
                <rect x={-RI} y={-hMarc} width={RI * 2} height={hMarc + 6} fill="#5a321a" />
                <rect x={-RI} y={-hMarc} width={RI * 2} height={hMarc + 6} fill={`url(#${id}-m)`} />
              </>
            ) : null}
          </g>
          {e.eau > 0.003 && e.inclinaison === 0 ? (
            <g>
              <ellipse cx={0} cy={yw} rx={RI} ry={RI * RY} fill={e.teinte > 0.4 ? "#8a5532" : "#e7d6bf"} opacity={0.7} />
              <path d={arcAvant(0, yw, RI, RI * RY)} fill="none" stroke="#f6f1ea" strokeWidth={2.5} opacity={0.4} />
            </g>
          ) : hMarc > 0.5 && e.inclinaison === 0 ? (
            <ellipse cx={0} cy={-hMarc} rx={RI} ry={RI * RY} fill="#7a4a2a" />
          ) : null}
          {cu && cu.visible > 0.01 ? (
            <g transform={`translate(${phaseCu * 50} ${-30}) rotate(${phaseCu * 12})`} opacity={cu.visible}>
              <path d="M -6 -420 L -6 -46 L 6 -46 L 6 -420 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
              <ellipse cx={0} cy={-24} rx={22} ry={32} fill={C.corps} stroke={C.crema} strokeWidth={4} />
            </g>
          ) : null}
        </>
      ) : null}
      {avant ? (
        <>
          <path
            d={`M ${-RX} -8 L ${-RX} ${-HAUT + 34} Q ${-RX} ${-HAUT + 10} ${-RX + 22} ${-HAUT + 8} L ${RX - 22} ${-HAUT + 8} Q ${RX} ${-HAUT + 10} ${RX} ${-HAUT + 34} L ${RX} -8 Q ${RX} 0 ${RX - 10} 0 L ${-RX + 10} 0 Q ${-RX} 0 ${-RX} -8 Z`}
            fill={C.crema}
            opacity={0.05 * remplir}
          />
          <Trace
            d={`M ${-RX + 22} ${-HAUT + 8} Q ${-RX} ${-HAUT + 10} ${-RX} ${-HAUT + 34} L ${-RX} -8 Q ${-RX} 0 ${-RX + 10} 0 L ${RX - 10} 0 Q ${RX} 0 ${RX} -8 L ${RX} ${-HAUT + 34} Q ${RX} ${-HAUT + 10} ${RX - 22} ${-HAUT + 8}`}
            p={t(0.05, 0.5)}
            w={5}
          />
          <Trace d={`M ${-RX + 20} -40 L ${-RX + 20} ${-HAUT + 60}`} p={t(0.5, 0.8)} w={8} c="#ffffff" o={0.1} />
          <Trace d={arcAvant(0, -HAUT + 8, RX - 22, (RX - 22) * RY)} p={t(0.2, 0.45)} w={4.5} />
          {/* graduation 1 L */}
          <g opacity={t(0.6, 0.9)}>
            <line x1={RX - 34} y1={-NIVEAU_BOCAL} x2={RX - 10} y2={-NIVEAU_BOCAL} stroke={C.crema} strokeWidth={3} opacity={0.6} />
            <text x={RX - 40} y={-NIVEAU_BOCAL + 9} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24 }} fill={C.crema} opacity={0.65}>
              1 L
            </text>
          </g>
          {e.couvercle > 0.01 ? (
            <g opacity={e.couvercle} transform={`translate(0 ${(1 - e.couvercle) * -60})`}>
              <path
                d={`M ${-RX + 16} ${-HAUT + 6} A ${RX - 16} 15 0 0 0 ${RX - 16} ${-HAUT + 6} L ${RX - 16} ${-HAUT - 22} A ${RX - 16} 15 0 0 1 ${-RX + 16} ${-HAUT - 22} Z`}
                fill={C.corps}
              />
              <path
                d={`${arcAvant(0, -HAUT + 6, RX - 16, 15)} M ${-RX + 16} ${-HAUT + 6} L ${-RX + 16} ${-HAUT - 22} M ${RX - 16} ${-HAUT + 6} L ${RX - 16} ${-HAUT - 22}`}
                fill="none"
                stroke={C.crema}
                strokeWidth={4}
              />
              <path d={ellipse(0, -HAUT - 22, RX - 16, 15)} fill={C.corps} stroke={C.crema} strokeWidth={4} />
            </g>
          ) : null}
        </>
      ) : null}
    </g>
  );
};

// Réfrigérateur ouvert, au trait. Repère : bas du centre de la caisse.
export const Frigo: React.FC<{ x: number; y: number; s?: number; trace?: number; porte?: number }> = ({
  x,
  y,
  s = 1,
  trace = 1,
  porte = 1,
}) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const angle = porte * 62;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -200 0 L -200 -620 Q -200 -650 -170 -650 L 170 -650 Q 200 -650 200 -620 L 200 0 Z" fill={C.nuit} opacity={0.5 * prog(trace, 0.5, 1)} />
      <Trace d="M -200 0 L -200 -620 Q -200 -650 -170 -650 L 170 -650 Q 200 -650 200 -620 L 200 0 Z" p={t(0, 0.5)} w={5} />
      <Trace d="M -176 -230 L 176 -230 M -176 -440 L 176 -440" p={t(0.4, 0.7)} w={3.5} o={0.6} />
      {/* porte ouverte, vue en biais */}
      <g transform={`translate(200 0) skewY(${-angle * 0.18}) scale(${Math.cos((angle * Math.PI) / 180)} 1)`}>
        <path d="M 0 0 L 0 -650 L 380 -650 L 380 0 Z" fill={C.corps} opacity={0.85 * prog(trace, 0.5, 1)} />
        <Trace d="M 0 0 L 0 -650 L 380 -650 L 380 0" p={t(0.3, 0.8)} w={5} />
        <Trace d="M 340 -420 L 340 -300" p={t(0.6, 0.9)} w={9} />
      </g>
    </g>
  );
};
