import { useId } from "react";
import { random } from "remotion";
import { C, prog } from "../theme";
import { Trace, arcArriere, arcAvant, ellipse, nettoyerId } from "./Trace";

// Dripper conique à 60°, vu légèrement d'en haut, en coupe transparente.
// Repère local : origine au centre du bord supérieur.
export const H = 228; // hauteur du cône
export const BORD = 172; // demi-largeur au bord
const BAS = 38; // demi-largeur au trou
const K = (BORD - BAS) / H;
export const RY = 26 / 172; // aplatissement des ellipses (point de vue)
export const demi = (y: number) => BORD - y * K;
const demiPapier = (y: number) => demi(y) - 5;
const LIT_REPOS = 150; // haut du lit de café au repos
const FOND = 236; // pointe du filtre

export const hautDuLit = (lit: number, dome = 0) =>
  FOND - lit * (FOND - LIT_REPOS) - dome;
export const niveauEau = (lit: number, eau: number) => {
  const b = FOND - lit * (FOND - LIT_REPOS);
  return b - eau * (b - 30);
};

const BRAS =
  "M -155 28 C -205 26 -228 46 -224 72 C -220 98 -190 106 -116 100 L -124 86 C -176 92 -194 88 -197 74 C -200 58 -185 46 -146 46 Z";

// Nervures en spirale, côté visible du cône.
const nervures = () => {
  const traits: string[] = [];
  for (let i = 0; i < 7; i++) {
    const phi0 = -1.2 + i * 0.42;
    const pts: string[] = [];
    for (let y = 16; y <= 206; y += 6) {
      const phi = phi0 + (y / H) * 0.85;
      if (Math.cos(phi) < 0.15) continue;
      const x = demi(y) * Math.sin(phi);
      const yy = y + demi(y) * RY * Math.cos(phi);
      pts.push(`${pts.length ? "L" : "M"} ${x.toFixed(1)} ${yy.toFixed(1)}`);
    }
    if (pts.length > 2) traits.push(pts.join(" "));
  }
  return traits;
};
const NERVURES = nervures();

export const Dripper: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  trace?: number; // dessin au trait, 0 → 1
  papier?: number;
  papierMouille?: number;
  lit?: number; // 0 vide, 1 lit au repos
  dome?: number;
  eau?: number; // 0 → 1, hauteur d'eau au-dessus du lit
  bulles?: number;
  versementX?: number | null; // point d'impact du filet, repère local
  sansBras?: boolean;
  corps?: boolean; // false : seulement le papier et son contenu (Chemex)
  frame?: number;
  couche?: "tout" | "arriere" | "avant";
}> = ({
  x = 540,
  y = 884,
  s = 1,
  trace = 1,
  papier = 1,
  papierMouille = 0,
  lit = 0,
  dome = 0,
  eau = 0,
  bulles = 0,
  versementX = null,
  sansBras = false,
  corps = true,
  frame = 0,
  couche = "tout",
}) => {
  const arriere = couche !== "avant";
  const avant = couche !== "arriere";
  const id = nettoyerId(useId());
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.7, 1);

  const litBas = FOND - lit * (FOND - LIT_REPOS);
  const litHaut = litBas - dome;
  const eauY = niveauEau(lit, eau);
  const rxLit = demiPapier(litBas) * 0.98;
  const rxEau = demiPapier(eauY);
  const surfaceY = eau > 0.004 ? eauY : litHaut;
  const couleurPapier =
    papierMouille > 0
      ? `rgba(226,196,160,${0.9 - papierMouille * 0.15})`
      : C.papier;

  const bullesVisibles = Math.round(26 * bulles);

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-papier`}>
          <path d="M -181 -24 L -26 240 L 26 240 L 181 -24 Z" />
        </clipPath>
        <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4a2a" />
          <stop offset="100%" stopColor="#3b1d0f" />
        </linearGradient>
        <linearGradient id={`${id}-eau`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9a066" stopOpacity={0.42} />
          <stop offset="100%" stopColor="#6b3a1c" stopOpacity={0.7} />
        </linearGradient>
        <pattern
          id={`${id}-mouture`}
          width={16}
          height={14}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={3} cy={4} r={1.6} fill="#b07a48" opacity={0.55} />
          <circle cx={11} cy={2} r={1.2} fill="#2a140a" opacity={0.6} />
          <circle cx={8} cy={10} r={1.5} fill="#c08a55" opacity={0.4} />
          <circle cx={14} cy={12} r={1.1} fill="#2a140a" opacity={0.5} />
        </pattern>
      </defs>

      {/* Bord arrière et papier côté fond */}
      {arriere ? (
        <>
          {corps ? <Trace d={arcArriere(0, 0, 176, 27)} p={t(0, 0.25)} w={5} /> : null}
          {papier > 0 ? (
            <g opacity={papier * remplir}>
              <path
                d="M -181 -24 A 181 27 0 0 1 181 -24 L 176 0 A 176 27 0 0 0 -176 0 Z"
                fill={couleurPapier}
                opacity={0.5}
              />
              <path
                d="M -181 -24 L -26 240 L 26 240 L 181 -24 Z"
                fill={couleurPapier}
                opacity={0.1}
              />
            </g>
          ) : null}

          {/* Lit de café, eau, surfaces */}
          <g clipPath={`url(#${id}-papier)`}>
            {lit > 0.001 ? (
              <>
                <path
                  d={`M -200 ${litBas} Q 0 ${litBas - dome * 2} 200 ${litBas} L 200 260 L -200 260 Z`}
                  fill={`url(#${id}-lit)`}
                />
                <path
                  d={`M -200 ${litBas} Q 0 ${litBas - dome * 2} 200 ${litBas} L 200 260 L -200 260 Z`}
                  fill={`url(#${id}-mouture)`}
                />
              </>
            ) : null}
            {eau > 0.004 ? (
              <rect
                x={-200}
                y={eauY}
                width={400}
                height={262 - eauY}
                fill={`url(#${id}-eau)`}
              />
            ) : null}
          </g>
          {lit > 0.001 ? (
            <g>
              <ellipse
                cx={0}
                cy={litHaut + dome * 0.15}
                rx={rxLit}
                ry={rxLit * RY + dome * 0.5}
                fill={dome > 4 ? "#a8703f" : "#8a5532"}
              />
              <ellipse
                cx={0}
                cy={litHaut + dome * 0.15}
                rx={rxLit}
                ry={rxLit * RY + dome * 0.5}
                fill={`url(#${id}-mouture)`}
              />
              {Array.from({ length: bullesVisibles }).map((_, i) => {
                const u = random(`bu-${i}`) * 2 - 1;
                const v = random(`bv-${i}`) * 2 - 1;
                const n = Math.hypot(u, v) > 1 ? 0.7 : 1;
                const periode = 26 + Math.round(random(`bp-${i}`) * 14);
                const phase =
                  ((frame + random(`bo-${i}`) * periode) % periode) / periode;
                const r = 4 + random(`br-${i}`) * 8;
                const bx = u * n * rxLit * 0.82;
                const by =
                  litHaut +
                  dome * 0.15 +
                  v * n * (rxLit * RY + dome * 0.5) * 0.7;
                if (phase < 0.62) {
                  const rr = r * Math.sqrt(phase / 0.62);
                  return (
                    <g key={i}>
                      <circle
                        cx={bx}
                        cy={by}
                        r={rr}
                        fill="#c99a6a"
                        opacity={0.55}
                      />
                      <circle
                        cx={bx - rr * 0.3}
                        cy={by - rr * 0.3}
                        r={rr * 0.3}
                        fill="#f6f1ea"
                        opacity={0.5}
                      />
                    </g>
                  );
                }
                if (phase < 0.8) {
                  const q = (phase - 0.62) / 0.18;
                  return (
                    <circle
                      key={i}
                      cx={bx}
                      cy={by}
                      r={r * (1 + q * 0.7)}
                      fill="none"
                      stroke="#efc79c"
                      strokeWidth={1.6}
                      opacity={(1 - q) * 0.7}
                    />
                  );
                }
                return null;
              })}
            </g>
          ) : null}
          {eau > 0.004 ? (
            <g>
              <ellipse
                cx={0}
                cy={eauY}
                rx={rxEau}
                ry={rxEau * RY}
                fill="#c98f58"
                opacity={0.62}
              />
              <ellipse
                cx={0}
                cy={eauY}
                rx={rxEau * 0.62}
                ry={rxEau * RY * 0.62}
                fill="none"
                stroke="#f3dcbc"
                strokeWidth={3}
                pathLength={1}
                strokeDasharray="0.16 0.09"
                strokeDashoffset={-frame * (0.25 / 20)}
                opacity={versementX !== null ? 0.55 : 0.18}
              />
              <path
                d={arcAvant(0, eauY, rxEau, rxEau * RY)}
                fill="none"
                stroke="#f6f1ea"
                strokeWidth={2.5}
                opacity={0.45}
              />
            </g>
          ) : null}

          {/* Impact du filet : ronds dans l'eau */}
          {versementX !== null
            ? [0, 1, 2].map((k) => {
                const ph = ((frame + k * 6) % 18) / 18;
                const rx = 8 + ph * 38;
                return (
                  <ellipse
                    key={k}
                    cx={versementX}
                    cy={surfaceY}
                    rx={rx}
                    ry={rx * RY * 1.3}
                    fill="none"
                    stroke="#f6f1ea"
                    strokeWidth={2.5}
                    opacity={(1 - ph) * 0.6}
                  />
                );
              })
            : null}
        </>
      ) : null}

      {/* Papier, côté spectateur */}
      {avant ? (
        <>
          {papier > 0 ? (
            <g opacity={papier}>
              <path
                d="M -181 -24 A 181 27 0 0 0 181 -24 L 176 0 A 176 27 0 0 1 -176 0 Z"
                fill={couleurPapier}
                opacity={0.92 * remplir}
              />
              <Trace
                d={ellipse(0, -24, 181, 27)}
                p={t(0.35, 0.6)}
                w={2.5}
                c={couleurPapier}
                o={0.9}
              />
              <Trace
                d="M -181 -24 L -26 238"
                p={t(0.4, 0.62)}
                w={2.5}
                c={couleurPapier}
                o={0.55}
              />
              <Trace
                d="M 181 -24 L 26 238"
                p={t(0.4, 0.62)}
                w={2.5}
                c={couleurPapier}
                o={0.55}
              />
            </g>
          ) : null}

          {corps ? (
          <>
          {/* Verre du cône */}
          <path
            d="M -172 0 L -38 228 A 38 6 0 0 0 38 228 L 172 0 A 172 26 0 0 1 -172 0 Z"
            fill={C.crema}
            opacity={0.05 * remplir}
          />
          {NERVURES.map((d, i) => (
            <Trace key={i} d={d} p={t(0.45 + i * 0.02, 0.75)} w={2.5} o={0.2} />
          ))}
          <Trace
            d="M -150 22 L -60 176"
            p={t(0.5, 0.8)}
            w={6}
            c="#ffffff"
            o={0.1}
          />
          <Trace d="M -172 0 L -38 228" p={t(0.05, 0.35)} w={5} />
          <Trace d="M 172 0 L 38 228" p={t(0.05, 0.35)} w={5} />
          <Trace d={arcAvant(0, 228, 38, 6)} p={t(0.3, 0.42)} w={4} />
          <Trace d={arcAvant(0, 0, 176, 27)} p={t(0, 0.25)} w={6} />
          <Trace d={ellipse(0, 0, 164, 24)} p={t(0.15, 0.4)} w={2.5} o={0.5} />

          {/* Socle */}
          <path
            d="M -128 236 A 128 17 0 0 0 128 236 L 128 248 A 128 17 0 0 1 -128 248 Z"
            fill={C.corps}
            opacity={remplir}
          />
          <Trace d={ellipse(0, 236, 128, 17)} p={t(0.3, 0.5)} w={4} />
          <Trace d="M -128 236 L -128 248" p={t(0.45, 0.5)} w={4} />
          <Trace d="M 128 236 L 128 248" p={t(0.45, 0.5)} w={4} />
          <Trace d={arcAvant(0, 248, 128, 17)} p={t(0.45, 0.6)} w={4} />

          {/* Anse */}
          {sansBras ? null : (
            <>
              <path d={BRAS} fill={C.corps} opacity={remplir} />
              <Trace d={BRAS} p={t(0.5, 0.85)} w={4.5} />
            </>
          )}
          </>
          ) : null}
        </>
      ) : null}
    </g>
  );
};
