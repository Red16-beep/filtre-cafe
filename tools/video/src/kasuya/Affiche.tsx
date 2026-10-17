import { Station } from "../dessins/Station";
import { AfficheMethode } from "../scenes/AfficheMethode";
import { etatVersementsK } from "./etats";

// Image fixe : poster de la vidéo, image de l'article, vignette.
const PUCES = ["20 g de café", "300 g d’eau", "5 × 60 g"];
const poste = <Station e={{ ...etatVersementsK(240), spirale: null, cible: null, note: null, attente: null, camera: { s: 1, x: 0, y: 0 } }} />;

export const KasuyaAffiche: React.FC = () => <AfficheMethode format="paysage" surtitre="La méthode" nom="4:6" puces={PUCES} poste={poste} />;
export const KasuyaAfficheVerticale: React.FC = () => <AfficheMethode format="vertical" surtitre="La méthode" nom="4:6" puces={PUCES} poste={poste} />;
