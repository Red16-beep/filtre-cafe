import { Balance } from "../../dessins/Balance";
import { Bouilloire } from "../../dessins/Bouilloire";
import { Dripper } from "../../dessins/Dripper";
import { Filtre } from "../../dessins/Filtre";
import { MaterielMethode } from "../../scenes/MaterielMethode";

export const Materiel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Un V60",
        detail: "taille 02",
        dessin: ({ x, base, trace }) => (
          <Dripper x={x + 10} y={base - 265 * 0.74} s={0.74} trace={trace} papier={trace} />
        ),
      },
      {
        titre: "Un filtre",
        detail: "papier",
        dessin: ({ x, base, trace }) => <Filtre x={x} y={base - 115 * 0.95} s={0.95} trace={trace} />,
      },
      {
        titre: "Une balance",
        detail: "au 0,1 g",
        dessin: ({ x, base, trace }) => (
          <Balance x={x} y={base - 150 * 0.62} s={0.62} trace={trace} poids={0.1} decimales temps={null} />
        ),
      },
      {
        titre: "Une bouilloire",
        detail: "col de cygne",
        dessin: ({ x, base, trace }) => (
          <Bouilloire x={x + 45} y={base - 80 * 0.68} s={0.68} trace={trace} />
        ),
      },
    ]}
  />
);
