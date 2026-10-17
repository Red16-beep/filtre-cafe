import { Station } from "../dessins/Station";
import { AfficheMethode } from "../scenes/AfficheMethode";
import { etatVersementsG } from "./etats";

// Image fixe : poster de la vidéo, image de l'article, vignette.
const PUCES = ["22 g de café", "220 g d’eau", "150 g de glace"];
const poste = <Station e={{ ...etatVersementsG(200), spirale: null, cible: null, note: null, attente: null, camera: { s: 1, x: 0, y: 0 } }} />;

export const GlaceAffiche: React.FC = () => <AfficheMethode format="paysage" surtitre="Le flash brew" nom="Café glacé" tailleNom={{ paysage: 190, vertical: 180 }} puces={PUCES} poste={poste} />;
export const GlaceAfficheVerticale: React.FC = () => <AfficheMethode format="vertical" surtitre="Le flash brew" nom="Café glacé" tailleNom={{ paysage: 190, vertical: 180 }} puces={PUCES} poste={poste} />;
