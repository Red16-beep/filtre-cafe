import { FinMethode } from "../../scenes/FinMethode";

export const Fin: React.FC = () => (
  <FinMethode
    titre="La recette V60"
    lignes={[
      { l: "Café", v: "15\u00a0g, médium-fine" },
      { l: "Eau", v: "250\u00a0g à 93\u00a0°C" },
      { l: "Bloom", v: "30\u00a0g, 30\u00a0s" },
      { l: "Versements", v: "150, 200, 250\u00a0g" },
      { l: "Temps", v: "2:30 à 3:30" },
    ]}
    url="filtre.cafe/journal/v60-guide-complet"
  />
);
