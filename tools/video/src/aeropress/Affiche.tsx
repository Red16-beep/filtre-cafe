import { AfficheMethode } from "../scenes/AfficheMethode";
import { PosteAero } from "./PosteAero";
import { etatInfusion } from "./etats";

const PUCES = ["15 g de café", "200 ml d’eau", "88 °C"];
const poste = <PosteAero e={{ ...etatInfusion(44), attente: null, repere: null }} />;

export const AeroAffiche: React.FC = () => (
  <AfficheMethode format="paysage" nom="AeroPress" tailleNom={{ paysage: 200, vertical: 200 }} puces={PUCES} poste={poste} />
);
export const AeroAfficheVerticale: React.FC = () => (
  <AfficheMethode format="vertical" nom="AeroPress" tailleNom={{ paysage: 200, vertical: 200 }} puces={PUCES} poste={poste} />
);
