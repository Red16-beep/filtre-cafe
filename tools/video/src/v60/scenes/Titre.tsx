import { Dripper } from "../../dessins/Dripper";
import { TitreMethode } from "../../scenes/TitreMethode";
import { prog } from "../../theme";

// Ouverture : le V60 se dessine, une goutte tombe, la recette s'annonce.
export const Titre: React.FC = () => (
  <TitreMethode
    nom="V60"
    puces={["15\u00a0g de café", "250\u00a0g d’eau", "93\u00a0°C"]}
    objet={{ vertical: { x: 540, y: 700, s: 1.3 }, paysage: { x: 1400, y: 300, s: 1.25 } }}
    sol={{ vertical: 1222, paysage: 900 }}
    goutte={{ dx: 0, dy: 242 }}
    dessin={({ x, y, s, trace, frame }) => (
      <Dripper x={x} y={y} s={s} trace={trace} papier={prog(frame, 24, 48)} />
    )}
  />
);
