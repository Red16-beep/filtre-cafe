import { useId } from "react";
import { random } from "remotion";
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

// Glaçons (café glacé). Repos au fond en deux couches ; ils flottent quand le
// café monte, rétrécissent en fondant, tournent quand on remue.
const GLACONS = [
  { x: -92, y: -36, r: -10, c: 60, couche: 0 },
  { x: -30, y: -34, r: 8, c: 62, couche: 0 },
  { x: 34, y: -37, r: -6, c: 60, couche: 0 },
  { x: 95, y: -35, r: 12, c: 56, couche: 0 },
  { x: -62, y: -96, r: 14, c: 60, couche: 1 },
  { x: 2, y: -100, r: -12, c: 62, couche: 1 },
  { x: 64, y: -94, r: 6, c: 58, couche: 1 },
];
export type Remuer = { p: number; visible: number };
const poseGlacon = (i: number, niveau: number, glace: number, fonte: number, remuer?: Remuer, hauteur = 300) => {
  const g = GLACONS[i];
  const k = 1 - 0.3 * fonte;
  const c = g.c * k;
  // Chute : chaque glaçon tombe à son tour, petit rebond à l'arrivée.
  const d0 = i * 0.09;
  const q = Math.min(1, Math.max(0, (glace - d0) / 0.34));
  const rebond = q < 0.8 ? 0 : Math.sin(((q - 0.8) / 0.2) * Math.PI) * 10;
  const chute = q < 0.8 ? (1 - (q / 0.8) ** 2) * hauteur : 0;
  // Flottaison : la couche du haut sous la surface, celle du bas juste dessous.
  const ly = surfaceCarafe(niveau);
  const flotte = ly + 0.36 * c + (g.couche === 0 ? 0.9 * c : 0);
  let x = g.x;
  let y = Math.min(g.y + (g.c - c) * 0.5, niveau > 0.003 ? flotte : 1e9) - chute - rebond;
  let s = 1;
  let rot = g.r + (1 - q) * 40;
  if (remuer && remuer.visible > 0) {
    const th = remuer.p * Math.PI * 2 * 2.5;
    const r0 = Math.abs(g.x) * 0.85 + 8;
    const phi = (g.x >= 0 ? 0 : Math.PI) + g.couche * 0.7;
    const xr = r0 * Math.cos(phi + th);
    const z = Math.sin(phi + th);
    x = x + (xr - x) * remuer.visible;
    y = y + z * 10 * remuer.visible;
    s = 1 + z * 0.07 * remuer.visible;
    rot = rot + th * 25 * remuer.visible;
  }
  return { x, y, c: c * s, rot, opacite: q <= 0 ? 0 : Math.min(1, q * 4), rx: c * (0.2 + 0.18 * fonte) };
};
// Point d'arrivée des gouttes : le haut du tas de glace, ou la surface.
export const impactCarafe = (niveau: number, glace = 0) =>
  glace > 0.5 ? Math.min(surfaceCarafe(niveau), Math.min(-128, surfaceCarafe(niveau) - 8)) : surfaceCarafe(niveau);

export const Glacon: React.FC<{ x: number; y: number; c: number; rot: number; rx: number; o: number }> = ({ x, y, c, rot, rx, o }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <rect x={-c / 2} y={-c / 2} width={c} height={c} rx={rx} fill="#f6f1ea" fillOpacity={0.16} stroke={C.creme} strokeOpacity={0.75} strokeWidth={3} />
    <rect x={-c / 2 + 7} y={-c / 2 + 7} width={c - 14} height={c - 14} rx={rx * 0.7} fill="none" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={2} />
    <path d={`M ${-c / 2 + 10} ${-c / 2 + 16} Q ${-c / 2 + 12} ${-c / 2 + 10} ${-c / 2 + 20} ${-c / 2 + 9}`} fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.55} />
  </g>
);

export const Carafe: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  trace?: number;
  niveau?: number; // 0 → 1
  teinte?: number; // 0 eau claire, 1 café
  glace?: number; // 0 → 1 : les glaçons tombent dans la carafe
  fonte?: number; // 0 → 1 : ils fondent
  remuer?: Remuer | null;
  buee?: number; // 0 → 1 : la condensation perle sur le verre
  glacons?: number[]; // quels glaçons (tous par défaut)
  chute?: number; // hauteur de chute des glaçons
}> = ({ x = 540, y = 1318, s = 1, trace = 1, niveau = 0, teinte = 1, glace = 0, fonte = 0, remuer = null, buee = 0, glacons, chute = 300 }) => {
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
      {glace > 0
        ? (glacons ?? GLACONS.map((_, i) => i)).map((i, rang) => {
            const g = poseGlacon(i, niveau, glacons ? Math.max(0, glace - (rang - i) * 0.09) : glace, fonte, remuer ?? undefined, chute);
            return <Glacon key={i} x={g.x} y={g.y} c={g.c} rot={g.rot} rx={g.rx} o={g.opacite * remplir} />;
          })
        : null}
      {remuer && remuer.visible > 0
        ? (() => {
            const th = remuer.p * Math.PI * 2 * 2.5;
            const bx = 70 * Math.cos(th);
            const by = -56 + 12 * Math.sin(th);
            const hx = 40 + bx * 0.3;
            return (
              <g opacity={remuer.visible}>
                <path d={`M ${hx} -392 L ${bx} ${by}`} stroke={C.crema} strokeWidth={9} strokeLinecap="round" fill="none" />
                <path d={`M ${hx} -392 L ${bx} ${by}`} stroke={C.corps} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.5} />
                <circle cx={hx} cy={-392} r={9} fill={C.crema} />
                <ellipse cx={bx} cy={by + 8} rx={16} ry={9} fill={C.crema} transform={`rotate(${-12 + 20 * Math.sin(th)} ${bx} ${by + 8})`} />
              </g>
            );
          })()
        : null}
      {niveau > 0.003 && (glace > 0 || (remuer && remuer.visible > 0)) ? (
        <g clipPath={`url(#${id}-int)`}>
          <rect x={-160} y={ly} width={320} height={-ly + 4} fill="#3b1d0f" opacity={0.42 * teinte} />
          {remuer && remuer.visible > 0
            ? [0, 1, 2].map((k) => {
                const th = remuer.p * Math.PI * 2 * 2.5 + k * 2.1;
                const yy = ly + 26 + k * 40;
                if (yy > -14) return null;
                const w = demi(yy) - 26;
                return (
                  <ellipse
                    key={k}
                    cx={0}
                    cy={yy}
                    rx={w}
                    ry={w * 0.13}
                    fill="none"
                    stroke="#e8c49a"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={`${w * 1.3} ${w * 5}`}
                    strokeDashoffset={-th * w}
                    opacity={0.4 * remuer.visible}
                  />
                );
              })
            : null}
          <ellipse cx={0} cy={ly} rx={rx} ry={rx * 0.12} fill="none" stroke="#e8c49a" strokeWidth={2.5} opacity={0.6} />
        </g>
      ) : null}
      {buee > 0
        ? Array.from({ length: 34 }).map((_, i) => {
            const yy = -24 - random(`by-${i}`) * 150;
            const w = demi(yy) + 2;
            const xx = (random(`bx-${i}`) * 2 - 1) * (w - 10);
            const app = prog(buee, random(`bt-${i}`) * 0.6, random(`bt-${i}`) * 0.6 + 0.3);
            if (app <= 0 || (niveau > 0.003 && yy < surfaceCarafe(niveau) - 6)) return null;
            const r = 2.5 + random(`br-${i}`) * 3.5;
            return (
              <g key={i} opacity={app * 0.85}>
                <ellipse cx={xx} cy={yy} rx={r} ry={r * 1.25} fill="#f6f1ea" fillOpacity={0.18} stroke="#f6f1ea" strokeOpacity={0.55} strokeWidth={1.5} />
                <circle cx={xx - r * 0.35} cy={yy - r * 0.4} r={r * 0.3} fill="#ffffff" opacity={0.7} />
              </g>
            );
          })
        : null}
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
