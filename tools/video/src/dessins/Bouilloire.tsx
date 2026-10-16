import { C, prog } from "../theme";
import { Trace } from "./Trace";

// Bouilloire à col de cygne. Repère local : centre du corps.
// Le bec part à gauche ; un angle négatif l'incline pour verser.
const CORPS =
  "M -93 -70 L -112 60 Q -116 80 -96 80 L 96 80 Q 116 80 112 60 L 93 -70 Z";
const ANSE =
  "M 92 -56 C 150 -62 182 -34 176 14 C 172 50 142 70 108 64 L 110 42 C 128 46 148 36 150 12 C 152 -18 136 -36 96 -32 Z";
const BEC =
  "M -104 52 C -158 56 -192 14 -206 -46 C -219 -100 -242 -140 -284 -144 C -306 -146 -322 -134 -330 -114";
export const POINTE = { x: -330, y: -114 };

// Position du corps qui place la pointe du bec en (px, py) pour un angle donné.
export const corpsPourPointe = (
  px: number,
  py: number,
  angle: number,
  s = 1,
) => {
  const a = (angle * Math.PI) / 180;
  const lx = POINTE.x * s;
  const ly = POINTE.y * s;
  return {
    x: px - (lx * Math.cos(a) - ly * Math.sin(a)),
    y: py - (lx * Math.sin(a) + ly * Math.cos(a)),
  };
};

export const pointeBec = (x: number, y: number, angle: number, s = 1) => {
  const a = (angle * Math.PI) / 180;
  const px = POINTE.x * s;
  const py = POINTE.y * s;
  return {
    x: x + px * Math.cos(a) - py * Math.sin(a),
    y: y + px * Math.sin(a) + py * Math.cos(a),
  };
};

export const Bouilloire: React.FC<{
  x: number;
  y: number;
  angle?: number;
  s?: number;
  trace?: number;
  cadran?: number; // 0 froid → 1 au repère (93 °C)
}> = ({ x, y, angle = 0, s = 1, trace = 1, cadran = 1 }) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.65, 1);
  const aiguille = ((-130 + cadran * 222) * Math.PI) / 180;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
      {/* Bec : tube cerné */}
      <Trace d={BEC} p={t(0.25, 0.7)} w={21} />
      <Trace d={BEC} p={t(0.25, 0.7)} w={11} c={C.corps} />
      {trace > 0.7 ? (
        <circle
          cx={POINTE.x}
          cy={POINTE.y}
          r={5.5}
          fill={C.nuit}
          opacity={remplir}
        />
      ) : null}

      {/* Anse */}
      <path d={ANSE} fill={C.corps} opacity={remplir} />
      <Trace d={ANSE} p={t(0.2, 0.6)} w={4.5} />

      {/* Corps */}
      <path d={CORPS} fill={C.corps} opacity={remplir} />
      <Trace d={CORPS} p={t(0, 0.45)} w={5} />
      <Trace d="M -109 58 L 109 58" p={t(0.4, 0.6)} w={3} o={0.45} />
      <Trace
        d="M -86 -40 L -98 40"
        p={t(0.5, 0.75)}
        w={7}
        c="#ffffff"
        o={0.08}
      />

      {/* Couvercle et thermomètre */}
      <Trace d="M -93 -70 A 93 13 0 0 0 93 -70" p={t(0.3, 0.5)} w={4} />
      <Trace d="M -80 -73 Q 0 -110 80 -73" p={t(0.35, 0.55)} w={4} />
      <Trace d="M 0 -92 L 0 -110" p={t(0.5, 0.6)} w={4} />
      <circle cx={0} cy={-136} r={26} fill={C.nuit} opacity={remplir} />
      <Trace
        d="M -26 -136 A 26 26 0 1 0 26 -136 A 26 26 0 1 0 -26 -136"
        p={t(0.55, 0.75)}
        w={4}
      />
      {trace > 0.8 ? (
        <g opacity={remplir}>
          {[-130, -75, -20, 35, 92].map((d) => {
            const r = (d * Math.PI) / 180;
            return (
              <line
                key={d}
                x1={Math.sin(r) * 17}
                y1={-136 - Math.cos(r) * 17}
                x2={Math.sin(r) * 21}
                y2={-136 - Math.cos(r) * 21}
                stroke={d === 92 ? C.cerise : C.crema}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}
          <line
            x1={0}
            y1={-136}
            x2={Math.sin(aiguille) * 17}
            y2={-136 - Math.cos(aiguille) * 17}
            stroke={C.ceriseVive}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <circle cx={0} cy={-136} r={3.5} fill={C.crema} />
        </g>
      ) : null}
    </g>
  );
};
