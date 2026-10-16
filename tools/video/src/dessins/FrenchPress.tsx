import { useId } from "react";
import { random } from "remotion";
import { C, prog } from "../theme";
import { Trace, arcArriere, arcAvant, ellipse, nettoyerId } from "./Trace";

// Cafetière à piston : bécher en verre, armature, couvercle, tige et filtre.
// Repère local : centre du fond du bécher. Un angle négatif penche vers le bec.
export const HAUT = 300; // hauteur du bécher
const RX = 110;
const RI = 104; // intérieur
const RYF = 0.15;
export const NIVEAU_MAX = 268; // 250 ml
export const yEau = (eau: number) => -eau * NIVEAU_MAX;
const TIGE = 280;

const ANSE =
  "M 112 -252 C 168 -252 196 -236 196 -200 L 196 -96 C 196 -64 172 -50 112 -50 L 112 -70 C 160 -70 174 -80 174 -102 L 174 -194 C 174 -222 160 -232 112 -232 Z";

export type EtatPress = {
  eau: number; // 0 → 1
  teinte: number; // 0 eau claire → 1 café
  lit: number; // marc au fond, 0 → 1
  croute: number; // marc qui flotte en surface
  suspension: number; // grains en suspension
  maille: number | null; // hauteur du filtre (négative, repère local) ; null : pas de piston
  couvercle: number; // 0 → 1 visibilité du couvercle (avec la tige)
  inclinaison: number; // degrés
  cuillere?: { visible: number; phase: number } | null;
  frame: number;
};

export const FrenchPress: React.FC<{
  x: number;
  y: number;
  s?: number;
  trace?: number;
  e: EtatPress;
  couche?: "tout" | "arriere" | "avant";
}> = ({ x, y, s = 1, trace = 1, e, couche = "tout" }) => {
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const arriere = couche !== "avant";
  const avant = couche !== "arriere";
  const yw = yEau(e.eau);
  const maille = e.maille;
  // le liquide reste horizontal quand on penche : contre-rotation autour du centre
  const contre = `rotate(${-e.inclinaison} 0 ${-HAUT / 2})`;
  const couleurHaut = e.teinte > 0.5 ? "#a8662f" : "#d9b48a";
  const opaHaut = 0.35 + e.teinte * 0.6;
  const cu = e.cuillere;
  const phaseCu = cu ? Math.sin(cu.phase * 2 * Math.PI) : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${e.inclinaison} ${-RX} 0)`}>
      <defs>
        <clipPath id={`${id}-int`}>
          <rect x={-RI} y={-HAUT + 4} width={RI * 2} height={HAUT - 6} rx={10} />
        </clipPath>
        <linearGradient id={`${id}-cafe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={couleurHaut} stopOpacity={opaHaut} />
          <stop offset="100%" stopColor="#3b1d0f" stopOpacity={0.4 + e.teinte * 0.55} />
        </linearGradient>
        <pattern id={`${id}-m`} width={16} height={14} patternUnits="userSpaceOnUse">
          <circle cx={3} cy={4} r={2.2} fill="#b07a48" opacity={0.7} />
          <circle cx={11} cy={2} r={1.8} fill="#2a140a" opacity={0.7} />
          <circle cx={8} cy={10} r={2.1} fill="#c08a55" opacity={0.55} />
        </pattern>
        <pattern id={`${id}-grille`} width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M 0 0 L 0 9 M 0 0 L 9 0" stroke={C.crema} strokeWidth={1.2} opacity={0.7} />
        </pattern>
      </defs>

      {arriere ? (
        <>
          <Trace d={arcArriere(0, -HAUT, RX, RX * RYF)} p={t(0, 0.3)} w={5} />
          <g clipPath={`url(#${id}-int)`}>
            <g transform={contre}>
              {e.eau > 0.003 ? (
                <>
                  <rect x={-260} y={yw} width={520} height={-yw + 80} fill={`url(#${id}-cafe)`} />
                  {e.suspension > 0.01
                    ? Array.from({ length: 46 }).map((_, i) => {
                        const gx = (random(`fs-${i}`) - 0.5) * 2 * (RI - 8);
                        const gy = yw + 12 + random(`fy-${i}`) * (-yw - 20) + Math.sin(e.frame * 0.05 + i) * 4;
                        return (
                          <circle key={i} cx={gx} cy={gy} r={1.8 + random(`fr-${i}`) * 2.4} fill="#4a2814" opacity={0.75 * e.suspension} />
                        );
                      })
                    : null}
                </>
              ) : null}
            </g>
            {e.lit > 0.001 ? (
              <>
                <rect x={-RI} y={-e.lit * 26} width={RI * 2} height={e.lit * 26 + 4} fill="#5a321a" />
                <rect x={-RI} y={-e.lit * 26} width={RI * 2} height={e.lit * 26 + 4} fill={`url(#${id}-m)`} />
              </>
            ) : null}
            {e.croute > 0.01 && e.eau > 0.05 ? (
              <g opacity={Math.min(1, e.croute * 1.4)}>
                <rect x={-RI} y={yw} width={RI * 2} height={26 * e.croute} fill="#5a321a" />
                <rect x={-RI} y={yw} width={RI * 2} height={26 * e.croute} fill={`url(#${id}-m)`} />
              </g>
            ) : null}
            {maille !== null && maille > yw ? (
              // sous le filtre, le marc tassé assombrit le liquide
              <rect x={-RI} y={maille} width={RI * 2} height={-maille} fill="#2e160a" opacity={0.55 * prog(-maille, 30, 200)} />
            ) : null}
          </g>
          {e.eau > 0.003 && e.inclinaison === 0 ? (
            <g>
              <ellipse
                cx={0}
                cy={yw}
                rx={RI}
                ry={RI * RYF}
                fill={e.croute > 0.3 ? "#7a4a2a" : e.teinte > 0.5 ? "#b97a42" : "#e2c59e"}
                opacity={e.croute > 0.3 ? 1 : 0.75}
              />
              {e.croute > 0.3 ? <ellipse cx={0} cy={yw} rx={RI} ry={RI * RYF} fill={`url(#${id}-m)`} /> : null}
              <path d={arcAvant(0, yw, RI, RI * RYF)} fill="none" stroke="#f6f1ea" strokeWidth={2.5} opacity={0.4} />
            </g>
          ) : null}
          {/* cuillère */}
          {cu && cu.visible > 0.01 ? (
            <g transform={`translate(${phaseCu * 46} ${yw + 70}) rotate(${phaseCu * 12})`} opacity={cu.visible}>
              <path d="M -5 -330 L -5 -40 L 5 -40 L 5 -330 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
              <ellipse cx={0} cy={-22} rx={20} ry={30} fill={C.corps} stroke={C.crema} strokeWidth={4} />
            </g>
          ) : null}
          {/* filtre et tige, à l'intérieur */}
          {maille !== null && e.couvercle > 0.01 ? (
            <g opacity={e.couvercle}>
              <line x1={0} y1={maille} x2={0} y2={-HAUT - 20} stroke={C.crema} strokeWidth={6} />
              <ellipse cx={0} cy={maille} rx={RI - 2} ry={(RI - 2) * RYF} fill={C.nuit} opacity={0.55} />
              <ellipse cx={0} cy={maille} rx={RI - 2} ry={(RI - 2) * RYF} fill={`url(#${id}-grille)`} />
              <path
                d={Array.from({ length: 49 })
                  .map((_, i) => {
                    const a = (i / 48) * Math.PI * 2;
                    const r = RI - 2 + Math.sin(i * 2.6) * 3;
                    return `${i ? "L" : "M"} ${(Math.cos(a) * r).toFixed(1)} ${(maille + Math.sin(a) * r * RYF).toFixed(1)}`;
                  })
                  .join(" ")}
                fill="none"
                stroke={C.crema}
                strokeWidth={3.5}
              />
              <circle cx={0} cy={maille} r={7} fill={C.crema} />
            </g>
          ) : null}
        </>
      ) : null}

      {avant ? (
        <>
          {/* verre */}
          <path d={`M ${-RX} ${-HAUT} L ${-RX} -8 Q ${-RX} 0 ${-RX + 8} 0 L ${RX - 8} 0 Q ${RX} 0 ${RX} -8 L ${RX} ${-HAUT} Z`} fill={C.crema} opacity={0.05 * remplir} />
          <Trace d={`M ${-RX} ${-HAUT} L ${-RX} -8 Q ${-RX} 0 ${-RX + 8} 0`} p={t(0.05, 0.4)} w={5} />
          <Trace d={`M ${RX} ${-HAUT} L ${RX} -8 Q ${RX} 0 ${RX - 8} 0`} p={t(0.05, 0.4)} w={5} />
          <Trace d={`M ${-RX + 18} -60 L ${-RX + 18} -240`} p={t(0.5, 0.8)} w={8} c="#ffffff" o={0.1} />
          <Trace d={arcAvant(0, -HAUT, RX, RX * RYF)} p={t(0, 0.3)} w={5} />
          {/* bec verseur */}
          <Trace d={`M ${-RX + 6} ${-HAUT - 4} L ${-RX - 18} ${-HAUT - 14} L ${-RX - 4} ${-HAUT + 10}`} p={t(0.2, 0.4)} w={4} />
          {/* armature : socle, montants, anneau, anse */}
          <path d={`M ${-RX - 6} -34 A ${RX + 6} 17 0 0 0 ${RX + 6} -34 L ${RX + 6} 0 A ${RX + 6} 17 0 0 1 ${-RX - 6} 0 Z`} fill={C.corps} opacity={remplir} />
          <Trace d={`${arcAvant(0, -34, RX + 6, 17)} M ${-RX - 6} -34 L ${-RX - 6} 0 M ${RX + 6} -34 L ${RX + 6} 0`} p={t(0.3, 0.55)} w={4} />
          <Trace d={arcAvant(0, 0, RX + 6, 17)} p={t(0.35, 0.6)} w={4} />
          <Trace d={`M -70 ${-HAUT + 52} L -70 -40 M 70 ${-HAUT + 52} L 70 -40`} p={t(0.45, 0.7)} w={7} o={0.9} />
          <path
            d={`M ${-RX - 6} ${-HAUT + 34} A ${RX + 6} 17 0 0 0 ${RX + 6} ${-HAUT + 34} L ${RX + 6} ${-HAUT + 52} A ${RX + 6} 17 0 0 1 ${-RX - 6} ${-HAUT + 52} Z`}
            fill={C.corps}
            opacity={remplir}
          />
          <Trace
            d={`${arcAvant(0, -HAUT + 34, RX + 6, 17)} M ${-RX - 6} ${-HAUT + 34} L ${-RX - 6} ${-HAUT + 52} M ${RX + 6} ${-HAUT + 34} L ${RX + 6} ${-HAUT + 52}`}
            p={t(0.4, 0.6)}
            w={4}
          />
          <Trace d={arcAvant(0, -HAUT + 52, RX + 6, 17)} p={t(0.45, 0.65)} w={4} />
          <path d={ANSE} fill={C.corps} opacity={remplir} />
          <Trace d={ANSE} p={t(0.5, 0.85)} w={4.5} />
          {/* couvercle, tige au-dessus, bouton */}
          {e.couvercle > 0.01 ? (
            <g opacity={e.couvercle}>
              <path
                d={`M ${-RX - 6} ${-HAUT - 2} A ${RX + 6} 17 0 0 0 ${RX + 6} ${-HAUT - 2} L ${RX + 6} ${-HAUT - 14} Q 0 ${-HAUT - 52} ${-RX - 6} ${-HAUT - 14} Z`}
                fill={C.corps}
              />
              <path
                d={`M ${-RX - 6} ${-HAUT - 2} A ${RX + 6} 17 0 0 0 ${RX + 6} ${-HAUT - 2} L ${RX + 6} ${-HAUT - 14} Q 0 ${-HAUT - 52} ${-RX - 6} ${-HAUT - 14} Z`}
                fill="none"
                stroke={C.crema}
                strokeWidth={4}
                strokeLinejoin="round"
              />
              {maille !== null ? (
                <>
                  <line x1={0} y1={-HAUT - 34} x2={0} y2={maille - TIGE} stroke={C.crema} strokeWidth={7} strokeLinecap="round" />
                  <circle cx={0} cy={maille - TIGE - 18} r={22} fill={C.corps} stroke={C.crema} strokeWidth={4} />
                  <circle cx={-7} cy={maille - TIGE - 25} r={6} fill="#ffffff" opacity={0.25} />
                </>
              ) : null}
            </g>
          ) : null}
          <Trace d={ellipse(0, -HAUT, RX, RX * RYF)} p={t(0.1, 0.3)} w={2} o={0.35} />
        </>
      ) : null}
    </g>
  );
};
