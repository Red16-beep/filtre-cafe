import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Fond } from "../dessins/Fond";
import { C } from "../theme";

// Illustrations d'articles : 1200 × 675, boucle de PERIODE images qui se
// raccorde sans saut (toutes les phases sont des multiples entiers de la boucle).
export const PERIODE = 180; // 6 s : divisible par les rythmes des dessins (10, 18, 20 images)
export const ILLU = { w: 1200, h: 675 };

// Phase périodique : k tours complets sur la boucle.
export const tour = (frame: number, k = 1, decalage = 0) => ((frame / PERIODE) * k + decalage) * Math.PI * 2;
// Progression 0 → 1 qui recommence k fois par boucle.
export const cycle = (frame: number, k = 1, decalage = 0) => (((frame / PERIODE) * k + decalage) % 1 + 1) % 1;

export const CadreIllu: React.FC<{ libelle?: string; children: React.ReactNode }> = ({ libelle, children }) => (
  <AbsoluteFill>
    <Fond />
    <svg width={ILLU.w} height={ILLU.h} viewBox={`0 0 ${ILLU.w} ${ILLU.h}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="illu-halo" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={C.crema} stopOpacity={0.1} />
          <stop offset="100%" stopColor={C.crema} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={ILLU.w} height={ILLU.h} fill="url(#illu-halo)" />
      {children}
    </svg>
    {libelle ? (
      <div
        style={{
          position: "absolute",
          left: 32,
          bottom: 26,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "8px 14px 8px 12px",
          borderRadius: 8,
          background: "rgba(24,16,11,0.82)",
          fontFamily: '"Instrument Sans", sans-serif',
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(239,199,156,0.85)",
        }}
      >
        <span style={{ width: 34, height: 2, background: "#b8401f", display: "inline-block" }} />
        {libelle}
      </div>
    ) : null}
    <div
      style={{
        position: "absolute",
        right: 44,
        bottom: 26,
        fontFamily: "Newsreader, serif",
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: 34,
        color: "#f6f1ea",
        textShadow: "0 0 10px rgba(20,13,9,0.95), 0 0 3px rgba(20,13,9,0.95)",
      }}
    >
      filtré<span style={{ color: "#b8401f" }}>.</span>
    </div>
  </AbsoluteFill>
);

// Vapeur périodique (trois volutes), pour les boucles.
export const VapeurBoucle: React.FC<{ x: number; y: number; hauteur?: number; ecart?: number; intensite?: number }> = ({
  x,
  y,
  hauteur = 130,
  ecart = 16,
  intensite = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id={`vb-${x}-${y}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#efc79c" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#efc79c" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((j) => {
        const pts: string[] = [];
        const monte = cycle(frame, 5, j / 3) * 24;
        for (let h = 0; h <= hauteur; h += 8) {
          const xx = x + (j - 1) * ecart + Math.sin(h * 0.05 + tour(frame, 2, j / 3)) * (4 + h * 0.09);
          pts.push(`${pts.length ? "L" : "M"} ${xx.toFixed(1)} ${(y - 8 - h - monte).toFixed(1)}`);
        }
        return (
          <path
            key={j}
            d={pts.join(" ")}
            fill="none"
            stroke={`url(#vb-${x}-${y})`}
            strokeWidth={4.5}
            strokeLinecap="round"
            opacity={intensite * 0.85}
          />
        );
      })}
    </g>
  );
};
