import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { usePaysage } from "../format";
import { DOUX, prog } from "../theme";
import { Legende } from "../ui/Legende";
import { Mots } from "../ui/Mots";

// Une case : le dessin reçoit le centre horizontal et la ligne de base
// (le bas de l'icône), puis l'avancement du tracé.
export type CaseMateriel = {
  titre: string;
  detail: string;
  dessin: (p: { x: number; base: number; trace: number }) => React.ReactNode;
};

// Grille de 3 ou 4 cases : 2 × 2 en vertical, une rangée en paysage.
const positions = (n: number, paysage: boolean) => {
  if (paysage) {
    const xs = n === 4 ? [330, 750, 1170, 1590] : [420, 960, 1500];
    return xs.map((x) => ({ x, label: 720 }));
  }
  const p = [
    { x: 290, label: 860 },
    { x: 790, label: 860 },
    { x: 290, label: 1280 },
    { x: 790, label: 1280 },
  ];
  if (n === 3) p[2] = { x: 540, label: 1280 };
  return p.slice(0, n);
};

export const MaterielMethode: React.FC<{ cases: CaseMateriel[] }> = ({ cases }) => {
  const frame = useCurrentFrame();
  const paysage = usePaysage();
  const P = positions(cases.length, paysage);
  const tr = (k: number) => prog(frame, 10 + k * 9, 46 + k * 9, DOUX);
  const flotte = (k: number) => Math.sin((frame + k * 20) * 0.06) * 5;
  return (
    <AbsoluteFill name="Matériel">
      <Legende puce="MATÉRIEL" titre="Ce qu’il faut" />
      <svg
        width={paysage ? 1920 : 1080}
        height={paysage ? 1080 : 1920}
        viewBox={paysage ? "0 0 1920 1080" : "0 0 1080 1920"}
        style={{ position: "absolute", inset: 0 }}
      >
        {cases.map((c, k) => (
          <g key={c.titre} transform={`translate(0 ${flotte(k)})`}>
            {c.dessin({ x: P[k].x, base: P[k].label - 34, trace: tr(k) })}
          </g>
        ))}
      </svg>
      {cases.map((c, k) => (
        <div
          key={c.titre}
          style={{
            position: "absolute",
            left: P[k].x - 250,
            width: 500,
            top: P[k].label,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: interpolate(frame, [24 + k * 9, 32 + k * 9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Mots
            texte={c.titre}
            debut={24 + k * 9}
            style={{
              justifyContent: "center",
              fontFamily: "Newsreader, serif",
              fontWeight: 500,
              fontSize: 60,
              lineHeight: 1.05,
              color: "#f6f1ea",
            }}
          />
          <Mots
            texte={c.detail}
            debut={28 + k * 9}
            style={{
              justifyContent: "center",
              marginTop: 8,
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: 46,
              color: "#efc79c",
            }}
          />
        </div>
      ))}
    </AbsoluteFill>
  );
};
