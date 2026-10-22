import { C } from "../theme";
import { Trace, arcArriere, arcAvant, ellipse } from "./Trace";

// Moulin manuel à meules (type Timemore, Comandante), au trait : corps cylindrique cannelé,
// réservoir dessous, manivelle et pommeau au-dessus. (x, y) : milieu du bas ; s : échelle.
export const Moulin: React.FC<{ x: number; y: number; s?: number; trace?: number; tour?: number }> = ({
  x,
  y,
  s = 1,
  trace = 1,
  tour = 0,
}) => {
  const p = (a: number, b: number) => Math.min(1, Math.max(0, (trace - a) / (b - a)));
  const R = 58;
  const RY = 10;
  // La manivelle tourne autour de l'axe : seul le bras et le pommeau bougent, vus en perspective.
  const ang = tour * 2 * Math.PI;
  const bx = Math.cos(ang) * 150;
  const by = Math.sin(ang) * 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={R * 1.25} ry={RY * 1.4} fill="#000" opacity={0.25 * p(0.8, 1)} />
      {/* réservoir */}
      <Trace d={`M ${-R} -118 L ${-R} -8 ${arcAvant(0, -8, R, RY).replace("M", "L")} L ${R} -118`} p={p(0, 0.4)} fill="rgba(239,199,156,0.06)" />
      <Trace d={arcAvant(0, -118, R, RY)} p={p(0.1, 0.4)} w={4} />
      {/* corps cannelé */}
      <Trace d={`M ${-R} -120 L ${-R} -300 M ${R} -120 L ${R} -300`} p={p(0.15, 0.5)} />
      <Trace d={ellipse(0, -300, R, RY)} p={p(0.3, 0.6)} fill="rgba(239,199,156,0.08)" />
      {[-38, -19, 0, 19, 38].map((dx, i) => (
        <Trace key={dx} d={`M ${dx} ${-128 + (Math.abs(dx) / R) * 3} L ${dx} ${-292 + (Math.abs(dx) / R) * 3}`} p={p(0.35 + i * 0.03, 0.62 + i * 0.03)} w={2.6} o={0.55} />
      ))}
      {/* couvercle et axe */}
      <Trace d={`M -26 -304 L -26 -318 ${arcArriere(0, -318, 26, 5).replace("M", "L")} L 26 -304`} p={p(0.55, 0.75)} w={4} fill="rgba(239,199,156,0.1)" />
      <Trace d={`M 0 -320 L 0 -340`} p={p(0.65, 0.8)} w={6} />
      {/* bras de manivelle et pommeau */}
      <Trace d={`M 0 -340 Q ${bx * 0.5} ${-352 + by * 0.5} ${bx} ${-344 + by}`} p={p(0.72, 0.9)} w={6} c={C.crema} />
      <Trace d={`M ${bx} ${-344 + by} L ${bx} ${-392 + by}`} p={p(0.82, 0.97)} w={16} c={C.crema} o={0.9} />
      <circle cx={0} cy={-340} r={7 * p(0.7, 0.8)} fill={C.crema} />
    </g>
  );
};
