import { Balance } from "../dessins/Balance";
import { Carafe, Glacon } from "../dessins/Carafe";
import { Dripper } from "../dessins/Dripper";
import { MaterielMethode } from "../scenes/MaterielMethode";
import { prog } from "../theme";

// Le matériel du café glacé, d'après l'article : un V60 (« le principe vaut pour
// n'importe quel dripper »), 150 g de glaçons, la carafe ou le verre, une balance.
const NB = " ";
export const GlaceMateriel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Un V60",
        detail: "ou un autre dripper",
        dessin: ({ x, base, trace }) => <Dripper x={x + 10} y={base - 265 * 0.74} s={0.74} trace={trace} papier={trace} />,
      },
      {
        titre: "Des glaçons",
        detail: `150${NB}g`,
        dessin: ({ x, base, trace }) => (
          <g>
            {[
              { dx: -62, dy: -40, r: -8, d: 0.2 },
              { dx: 4, dy: -42, r: 10, d: 0.35 },
              { dx: 70, dy: -38, r: -4, d: 0.5 },
              { dx: -28, dy: -112, r: 14, d: 0.65 },
              { dx: 38, dy: -110, r: -12, d: 0.8 },
            ].map((g, i) => {
              const p = prog(trace, g.d - 0.2, g.d);
              return <Glacon key={i} x={x + g.dx} y={base + g.dy - (1 - p) * 40} c={70} rot={g.r} rx={14} o={p} />;
            })}
          </g>
        ),
      },
      {
        titre: "Une carafe",
        detail: "ou un grand verre",
        dessin: ({ x, base, trace }) => <Carafe x={x - 14} y={base} s={0.8} trace={trace} />,
      },
      {
        titre: "Une balance",
        detail: "pour tout peser",
        dessin: ({ x, base, trace }) => <Balance x={x} y={base - 150 * 0.62} s={0.62} trace={trace} poids={0} temps={null} />,
      },
    ]}
  />
);
