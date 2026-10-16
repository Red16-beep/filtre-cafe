import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Bouilloire, pointeBec } from "../dessins/Bouilloire";
import { Vapeur } from "../dessins/Vapeur";
import { usePaysage } from "../format";
import { C, SANS, SORTIE, prog } from "../theme";
import { Legende } from "../ui/Legende";
import { Mots } from "../ui/Mots";

// L'eau à bonne température : le chiffre monte, la jauge suit, l'aiguille aussi.
export const EauMethode: React.FC<{
  temperature: number;
  sous?: string;
  puce?: string;
}> = ({ temperature, sous, puce = "ÉTAPE 1" }) => {
  const frame = useCurrentFrame();
  const paysage = usePaysage();
  const montee = prog(frame, 14, 62, SORTIE);
  const temp = 20 + montee * (temperature - 20);
  const X0 = paysage ? 124 : 100;
  const X1 = paysage ? 860 : 980;
  const GY = paysage ? 740 : 900;
  const xT = (t: number) => X0 + ((t - 20) / 80) * (X1 - X0);
  const jauge = prog(frame, 6, 30, SORTIE);
  const K = paysage
    ? { x: 1480, y: 640, s: 1.45 }
    : { x: 640, y: 1215, s: 1.25 };
  const bec = pointeBec(K.x, K.y, 0, K.s);
  return (
    <AbsoluteFill name="Eau">
      <Legende puce={puce} titre="Chauffer l’eau" />
      <Interactive.Div
        name="Température"
        style={{
          position: "absolute",
          left: paysage ? 112 : 74,
          top: paysage ? 360 : 500,
          display: "flex",
          alignItems: "baseline",
          fontFamily: "Newsreader, serif",
          fontVariantNumeric: "tabular-nums",
          color: "#f6f1ea",
          opacity: interpolate(frame, [8, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontSize: 300,
            fontWeight: 400,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {Math.round(temp)}
        </span>
        <span
          style={{
            fontSize: 130,
            fontWeight: 400,
            color: "#efc79c",
            marginLeft: 18,
          }}
        >
          °C
        </span>
      </Interactive.Div>
      <svg
        width={paysage ? 1920 : 1080}
        height={paysage ? 1080 : 1920}
        viewBox={paysage ? "0 0 1920 1080" : "0 0 1080 1920"}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Jauge */}
        <g opacity={jauge}>
          <line
            x1={X0}
            y1={GY}
            x2={X0 + (X1 - X0) * jauge}
            y2={GY}
            stroke={C.crema}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.22}
          />
          <line
            x1={X0}
            y1={GY}
            x2={xT(temp)}
            y2={GY}
            stroke={C.ceriseVive}
            strokeWidth={10}
            strokeLinecap="round"
          />
          {[20, 40, 60, 80, 100].map((t) => (
            <g key={t}>
              <line
                x1={xT(t)}
                y1={GY + 20}
                x2={xT(t)}
                y2={GY + 40}
                stroke={C.crema}
                strokeWidth={3}
                opacity={0.6}
              />
              <text
                x={xT(t)}
                y={GY + 85}
                textAnchor="middle"
                style={{
                  fontFamily: SANS,
                  fontSize: 34,
                  fontVariantNumeric: "tabular-nums",
                }}
                fill={C.crema}
                opacity={0.7}
              >
                {t}
              </text>
            </g>
          ))}
          <circle cx={xT(temp)} cy={GY} r={17} fill={C.creme} />
          <circle cx={xT(temp)} cy={GY} r={8} fill={C.ceriseVive} />
          {montee > 0.98 ? (
            <circle
              cx={xT(temperature)}
              cy={GY}
              r={17 + prog(frame, 62, 84) * 26}
              fill="none"
              stroke={C.ceriseVive}
              strokeWidth={3}
              opacity={1 - prog(frame, 62, 84)}
            />
          ) : null}
        </g>
        <Vapeur
          x={bec.x}
          y={bec.y}
          frame={frame}
          hauteur={70}
          intensite={prog(frame, 30, 60)}
        />
        <Bouilloire
          x={K.x}
          y={K.y}
          s={K.s}
          trace={prog(frame, 0, 40)}
          cadran={montee}
        />
      </svg>
      {sous ? (
        <Mots
          texte={sous}
          debut={44}
          decalage={1.6}
          style={{
            position: "absolute",
            left: paysage ? 120 : 80,
            top: paysage ? 880 : 1370,
            width: paysage ? 760 : 900,
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: 48,
            lineHeight: 1.22,
            color: "rgba(239,199,156,0.94)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
