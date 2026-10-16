import { AbsoluteFill, Easing, random, useCurrentFrame } from "remotion";
import { usePaysage } from "../format";
import { C, DOUX, SANS, SERIF, SORTIE, cles, prog } from "../theme";
import { Legende } from "../ui/Legende";

// Le temps d'écoulement règle la mouture : trop vite, plus fin ; trop lent, plus gros.
const XG = (i: number) => 140 + i * 200; // 5 graduations, de 140 à 940

const Carte: React.FC<{
  x: number;
  top: number;
  titre: string;
  verbe: string;
  accent: string;
  apparition: number;
  actif: number;
  fin: boolean;
}> = ({ x, top, titre, verbe, accent, apparition, actif, fin }) => {
  const n = fin ? 14 : 5;
  const r = fin ? 4.5 : 12;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top,
        width: 445,
        height: 330,
        boxSizing: "border-box",
        padding: "34px 34px",
        borderRadius: 30,
        border: `3px solid ${actif > 0.5 ? "#d9582f" : "rgba(239,199,156,0.3)"}`,
        backgroundColor: `rgba(184,64,31,${0.18 * actif})`,
        opacity: apparition * (0.45 + 0.55 * Math.max(actif, 0.4)),
        scale: 0.94 + apparition * 0.06 + actif * 0.03,
        translate: `0px ${(1 - apparition) * 40}px`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <svg width={377} height={44} viewBox="0 0 377 44">
        {Array.from({ length: n }).map((_, i) => (
          <circle
            key={i}
            cx={r + 4 + i * ((377 - 2 * r - 8) / Math.max(1, n - 1))}
            cy={22 + (random(`dg-${fin}-${i}`) - 0.5) * 10}
            r={r * (0.8 + random(`dr-${fin}-${i}`) * 0.4)}
            fill={["#7a4a2a", "#9a6238", "#b07a48"][i % 3]}
          />
        ))}
      </svg>
      <div
        style={{
          fontFamily: "Newsreader, serif",
          fontWeight: 500,
          fontSize: 60,
          color: "#f6f1ea",
          lineHeight: 1.05,
        }}
      >
        {titre}
      </div>
      <div
        style={{
          fontFamily: '"Instrument Sans", sans-serif',
          fontSize: 46,
          color: "#efc79c",
          lineHeight: 1.2,
        }}
      >
        {verbe}{" "}
        <span
          style={{
            fontFamily: "Newsreader, serif",
            fontStyle: "italic",
            fontSize: 56,
            color: "#f6f1ea",
          }}
        >
          {accent}
        </span>
      </div>
    </div>
  );
};

type CarteTexte = { titre: string; verbe: string; accent: string };

export const DiagnosticMethode: React.FC<{
  titre: string;
  sous: string;
  graduations: string[];
  fenetre: string;
  gauche: CarteTexte;
  droite: CarteTexte;
}> = ({ titre, sous, graduations, fenetre, gauche, droite }) => {
  const frame = useCurrentFrame();
  const paysage = usePaysage();
  const axe = prog(frame, 8, 34, DOUX);
  const xm = cles(frame, [
    [30, 540],
    [52, 200],
    [84, 200],
    [106, 880],
  ]);
  const aiguille = prog(frame, 14, 30, SORTIE);
  const zoneG = prog(frame, 44, 56) * (1 - prog(frame, 86, 98));
  const zoneD = prog(frame, 98, 110);
  return (
    <AbsoluteFill name="Diagnostic">
      <Legende titre={titre} sous={sous} />
      <svg
        width={paysage ? 1920 : 1080}
        height={paysage ? 1080 : 1920}
        viewBox={paysage ? "0 0 1920 1080" : "0 0 1080 1920"}
        style={{ position: "absolute", inset: 0 }}
      >
        <g transform={paysage ? "translate(860 -590)" : undefined}>
          <rect
            x={XG(0)}
            y={890}
            width={XG(1) - XG(0)}
            height={90}
            rx={18}
            fill={C.cerise}
            opacity={0.28 * zoneG}
          />
          <rect
            x={XG(3)}
            y={890}
            width={XG(4) - XG(3)}
            height={90}
            rx={18}
            fill={C.cerise}
            opacity={0.28 * zoneD}
          />
          <g opacity={prog(frame, 16, 34)}>
            <rect
              x={XG(1)}
              y={890}
              width={XG(3) - XG(1)}
              height={90}
              rx={18}
              fill={C.feuille}
              opacity={0.55}
              stroke={C.feuilleClaire}
              strokeWidth={3}
            />
            <text
              x={540}
              y={862}
              textAnchor="middle"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 52,
              }}
              fill={C.feuilleClaire}
            >
              {fenetre}
            </text>
          </g>
          <line
            x1={XG(0)}
            y1={935}
            x2={XG(0) + (XG(4) - XG(0)) * axe}
            y2={935}
            stroke={C.crema}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {graduations.map((lab, i) => (
            <g key={i} opacity={prog(frame, 12 + i * 3, 24 + i * 3)}>
              <line
                x1={XG(i)}
                y1={918}
                x2={XG(i)}
                y2={952}
                stroke={C.crema}
                strokeWidth={3}
              />
              <text
                x={XG(i)}
                y={1020}
                textAnchor="middle"
                style={{
                  fontFamily: SANS,
                  fontSize: 38,
                  fontVariantNumeric: "tabular-nums",
                }}
                fill={C.crema}
                opacity={0.85}
              >
                {lab}
              </text>
            </g>
          ))}
          <g transform={`translate(${xm} 0)`} opacity={aiguille}>
            <line
              x1={0}
              y1={880}
              x2={0}
              y2={990}
              stroke={C.creme}
              strokeWidth={5}
              strokeLinecap="round"
            />
            <circle
              cx={0}
              cy={872}
              r={18 * (0.6 + aiguille * 0.4)}
              fill={C.ceriseVive}
              stroke={C.creme}
              strokeWidth={4}
            />
          </g>
        </g>
      </svg>
      <Carte
        x={paysage ? 930 : 80}
        top={paysage ? 520 : 1110}
        titre={gauche.titre}
        verbe={gauche.verbe}
        accent={gauche.accent}
        apparition={prog(frame, 40, 58, Easing.bezier(0.16, 1, 0.3, 1))}
        actif={prog(frame, 48, 60) * (1 - prog(frame, 88, 100))}
        fin
      />
      <Carte
        x={paysage ? 1395 : 555}
        top={paysage ? 520 : 1110}
        titre={droite.titre}
        verbe={droite.verbe}
        accent={droite.accent}
        apparition={prog(frame, 88, 106, Easing.bezier(0.16, 1, 0.3, 1))}
        actif={prog(frame, 98, 110)}
        fin={false}
      />
    </AbsoluteFill>
  );
};
