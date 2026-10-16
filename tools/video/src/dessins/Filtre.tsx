import { C, prog } from "../theme";
import { Trace } from "./Trace";

// Filtre papier conique posé à plat : un secteur, une couture sertie.
const CONTOUR = "M 0 115 L -122 -50 A 205 205 0 0 1 122 -50 Z";

export const Filtre: React.FC<{
  x: number;
  y: number;
  s?: number;
  trace?: number;
}> = ({ x, y, s = 1, trace = 1 }) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const sertis: string[] = [];
  for (let i = 1; i < 10; i++) {
    const q = i / 10;
    const px = 14 + (112 - 14) * q;
    const py = 100 + (-38 - 100) * q;
    sertis.push(`M ${px.toFixed(1)} ${py.toFixed(1)} l 9 6`);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={CONTOUR} fill={C.papier} opacity={0.14 * prog(trace, 0.5, 1)} />
      <Trace d={CONTOUR} p={t(0, 0.6)} w={5} c={C.papier} />
      <Trace
        d="M 14 100 L 112 -38"
        p={t(0.4, 0.8)}
        w={3}
        c={C.papier}
        o={0.75}
      />
      {sertis.map((d, i) => (
        <Trace
          key={i}
          d={d}
          p={t(0.6 + i * 0.03, 0.75 + i * 0.03)}
          w={2.5}
          c={C.papier}
          o={0.6}
        />
      ))}
      <Trace
        d="M 0 112 L 0 -86"
        p={t(0.5, 0.9)}
        w={2.5}
        c={C.papier}
        o={0.3}
        dash="10 10"
      />
    </g>
  );
};
