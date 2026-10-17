import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { usePaysage } from "../format";
import { C, DOUX, prog } from "../theme";
import { Mots } from "../ui/Mots";

type Pos = { x: number; y: number; s: number };

// Ouverture commune à toutes les méthodes : l'objet se dessine au trait,
// une goutte tombe (si la méthode en a une), le nom s'annonce, trois repères.
export const TitreMethode: React.FC<{
  nom: string;
  surtitre?: string; // « La recette » par défaut
  tailleNom?: number;
  puces: string[];
  objet: { vertical: Pos; paysage: Pos };
  sol: { vertical: number; paysage: number };
  goutte?: { dx: number; dy: number } | null; // départ de la goutte, repère de l'objet
  dessin: (p: Pos & { trace: number; frame: number }) => React.ReactNode;
}> = ({ nom, surtitre = "La recette", tailleNom = 300, puces, objet, sol, goutte = null, dessin }) => {
  const frame = useCurrentFrame();
  const paysage = usePaysage();
  const O = paysage ? objet.paysage : objet.vertical;
  const SOL = paysage ? sol.paysage : sol.vertical;
  const L = paysage
    ? { w: 1920, h: 1080, recette: 280, nom: 404, puces: 760 }
    : { w: 1080, h: 1920, recette: 236, nom: 356, puces: 1310 };
  const trace = prog(frame, 0, 48, DOUX);
  const gx = goutte ? O.x + goutte.dx * O.s : 0;
  const g0 = goutte ? O.y + goutte.dy * O.s : 0;
  const chute = prog(frame, 52, 72, Easing.in(Easing.quad));
  const gy = g0 + chute * (SOL - 7 - g0);
  const visible = goutte ? prog(frame, 44, 52) * (frame < 72 ? 1 : 0) : 0;
  const onde = goutte ? prog(frame, 72, 102, Easing.out(Easing.quad)) : 0;
  return (
    <AbsoluteFill name="Titre">
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 105], [1, 1.035]) }}>
        <svg width={L.w} height={L.h} viewBox={`0 0 ${L.w} ${L.h}`} style={{ position: "absolute", inset: 0 }}>
          {dessin({ ...O, trace, frame })}
          <line
            x1={O.x - 200 * prog(frame, 30, 60, DOUX)}
            y1={SOL}
            x2={O.x + 200 * prog(frame, 30, 60, DOUX)}
            y2={SOL}
            stroke={C.crema}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.35}
          />
          {visible > 0 ? (
            <path
              d="M 0 -16 C 7 -5 10 2 10 7 A 10 10 0 1 1 -10 7 C -10 2 -7 -5 0 -16 Z"
              transform={`translate(${gx} ${gy}) scale(${0.6 + visible * 0.4} ${1 + chute * 0.25})`}
              fill={C.cafeClair}
            />
          ) : null}
          {onde > 0 && onde < 1
            ? [0, 1].map((k) => {
                const q = Math.max(0, onde - k * 0.25) / (1 - k * 0.25);
                return (
                  <ellipse
                    key={k}
                    cx={gx}
                    cy={SOL}
                    rx={10 + q * 150}
                    ry={(10 + q * 150) * 0.12}
                    fill="none"
                    stroke={C.cafeClair}
                    strokeWidth={3}
                    opacity={(1 - q) * 0.9}
                  />
                );
              })
            : null}
        </svg>
        <Mots
          texte={surtitre}
          debut={6}
          style={{
            position: "absolute",
            top: L.recette,
            left: paysage ? 140 : 0,
            right: 0,
            justifyContent: paysage ? "flex-start" : "center",
            fontFamily: "Newsreader, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 92,
            color: "#efc79c",
          }}
        />
        <Interactive.Div
          name="Nom"
          style={{
            position: "absolute",
            top: L.nom + (300 - tailleNom) * 0.45,
            left: paysage ? 128 : 0,
            right: paysage ? undefined : 0,
            textAlign: paysage ? "left" : "center",
            transformOrigin: paysage ? "left center" : "center center",
            fontFamily: "Newsreader, serif",
            fontWeight: 500,
            fontSize: tailleNom,
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: "#f6f1ea",
            opacity: interpolate(frame, [10, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [10, 40], ["0px 70px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [10, 40], [0.94, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          {nom}
        </Interactive.Div>
        <div
          style={{
            position: "absolute",
            top: L.puces,
            left: paysage ? 140 : 60,
            right: paysage ? undefined : 60,
            display: "flex",
            justifyContent: paysage ? "flex-start" : "center",
            gap: 22,
          }}
        >
          {puces.map((p, i) => (
            <div
              key={p}
              style={{
                padding: "16px 28px",
                borderRadius: 999,
                border: "2.5px solid rgba(239,199,156,0.55)",
                backgroundColor: i === puces.length - 1 ? "#b8401f" : "rgba(20,13,9,0.55)",
                borderColor: i === puces.length - 1 ? "#b8401f" : "rgba(239,199,156,0.55)",
                color: "#f6f1ea",
                fontFamily: '"Instrument Sans", sans-serif',
                fontWeight: 600,
                fontSize: 44,
                whiteSpace: "nowrap",
                scale: interpolate(frame, [62 + i * 6, 80 + i * 6], [0.5, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 13, mass: 0.6 }),
                }),
                opacity: interpolate(frame, [62 + i * 6, 70 + i * 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
