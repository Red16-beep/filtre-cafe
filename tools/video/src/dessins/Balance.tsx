import { C, SANS, minutes, prog } from "../theme";
import { Trace } from "./Trace";

// Balance de précision avec minuteur. Repère local : milieu de l'arête avant du plateau.
const PLATEAU = "M -340 0 L -322 -24 L 322 -24 L 340 0 Z";
const FACE =
  "M -340 0 L 340 0 L 340 118 Q 340 140 318 140 L -318 140 Q -340 140 -340 118 Z";

export const Balance: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  trace?: number;
  poids?: number | null;
  decimales?: boolean;
  temps?: number | null;
  tare?: number; // appui sur la touche, 0 → 1 → 0
  allumee?: number;
}> = ({
  x = 540,
  y = 1330,
  s = 1,
  trace = 1,
  poids = 0,
  decimales = false,
  temps = null,
  tare = 0,
  allumee = 1,
}) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const p = poids ?? 0;
  const texte = decimales
    ? p.toFixed(1).replace(".", ",")
    : String(Math.round(p));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={PLATEAU} fill="#2f2017" opacity={remplir} />
      <Trace d={PLATEAU} p={t(0, 0.4)} w={4} />
      <path d={FACE} fill="#24170f" opacity={remplir} />
      <Trace d={FACE} p={t(0.1, 0.55)} w={4.5} />
      <Trace
        d="M -290 140 L -290 150 M 290 140 L 290 150"
        p={t(0.5, 0.6)}
        w={6}
      />
      <rect
        x={-250}
        y={24}
        width={500}
        height={92}
        rx={14}
        fill={C.nuit}
        opacity={remplir}
      />
      <Trace
        d="M -236 24 L 236 24 Q 250 24 250 38 L 250 102 Q 250 116 236 116 L -236 116 Q -250 116 -250 102 L -250 38 Q -250 24 -236 24 Z"
        p={t(0.4, 0.7)}
        w={2}
        o={0.45}
      />
      {/* Touche minuteur */}
      <Trace
        d="M -313 70 A 18 18 0 1 0 -277 70 A 18 18 0 1 0 -313 70"
        p={t(0.55, 0.75)}
        w={3}
      />
      <Trace
        d="M -295 70 L -295 60 M -295 70 L -288 74"
        p={t(0.7, 0.8)}
        w={2.5}
      />
      {/* Touche tare */}
      <g transform={`translate(295 70) scale(${1 - tare * 0.12})`}>
        <circle r={18} fill={C.cerise} opacity={tare} />
        <Trace
          d="M -18 0 A 18 18 0 1 0 18 0 A 18 18 0 1 0 -18 0"
          p={t(0.55, 0.75)}
          w={3}
        />
        {trace > 0.75 ? (
          <text
            y={8}
            textAnchor="middle"
            style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22 }}
            fill={tare > 0.4 ? C.creme : C.crema}
            opacity={remplir}
          >
            T
          </text>
        ) : null}
      </g>
      {trace > 0.75 && allumee > 0 ? (
        <g
          opacity={remplir * allumee}
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {poids !== null ? (
            <text x={-222} y={95} fontSize={68} fill="#f4c690">
              {texte}
              <tspan fontSize={40} dx={10} fill="#d9a066">
                g
              </tspan>
            </text>
          ) : null}
          {temps !== null ? (
            <text x={222} y={95} fontSize={68} fill="#f4c690" textAnchor="end">
              {minutes(temps)}
            </text>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};
