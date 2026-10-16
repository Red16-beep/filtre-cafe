import { PosteAero } from "./aeropress/PosteAero";
import { etatInfusion } from "./aeropress/etats";
import { PosteFroid } from "./coldbrew/PosteFroid";
import { etatFiltrer } from "./coldbrew/etats";
import { Station } from "./dessins/Station";
import { PosteEspresso } from "./espresso/PosteEspresso";
import { etatExtraire } from "./espresso/etats";
import { PosteMoka } from "./moka/PosteMoka";
import { etatMontee } from "./moka/etats";
import { PostePress } from "./piston/PostePress";
import { etatVerser } from "./piston/etats";
import { EpingleMethode } from "./scenes/EpingleMethode";
import { etatVersement } from "./v60/etats";

// Épingles Pinterest (1000 × 1500), une par méthode.
export const EpingleV60: React.FC = () => (
  <EpingleMethode
    nom="V60"
    tailleNom={230}
    puces={["15 g de café", "250 g d’eau", "93 °C"]}
    accroche="Le bloom, la spirale, trois versements"
    poste={<Station e={{ ...etatVersement(190), spirale: null, cible: null, note: null, attente: null, camera: { s: 1, x: 0, y: 0 } }} />}
  />
);
export const EpingleAero: React.FC = () => (
  <EpingleMethode
    nom="AeroPress"
    tailleNom={170}
    puces={["15 g de café", "200 ml d’eau", "88 °C"]}
    accroche="La recette standard, du bloom au premier sifflement"
    poste={<PosteAero e={{ ...etatInfusion(44), attente: null, repere: null }} />}
  />
);
export const EpinglePress: React.FC = () => (
  <EpingleMethode
    nom="French press"
    tailleNom={140}
    puces={["15 g de café", "250 ml d’eau", "4 min"]}
    accroche="4 minutes d’infusion, 30 secondes de piston"
    poste={<PostePress e={{ ...etatVerser(46), repere: null, attente: null }} />}
  />
);
export const EpingleMoka: React.FC = () => (
  <EpingleMethode
    nom="Moka"
    tailleNom={230}
    puces={["Eau à 70 °C", "Feu doux", "4 à 6 min"]}
    accroche="La méthode feu doux, pour arrêter de brûler son café"
    poste={<PosteMoka e={{ ...etatMontee(120), repere: null, attente: null }} />}
  />
);
export const EpingleFroid: React.FC = () => (
  <EpingleMethode
    nom="Cold brew"
    tailleNom={170}
    puces={["100 g de café", "1 L d’eau", "12 à 16 h"]}
    accroche="100 g pour 1 litre, une nuit au frigo, un filtre papier"
    poste={<PosteFroid e={{ ...etatFiltrer(100) }} />}
  />
);
export const EpingleEsp: React.FC = () => (
  <EpingleMethode
    nom="Espresso"
    tailleNom={190}
    puces={["18 g de café", "36 g en tasse", "25 à 30 s"]}
    accroche="Le ratio 1:2 et le réglage de la mouture, en images"
    poste={<PosteEspresso e={{ ...etatExtraire(110), repere: null }} />}
  />
);

export const EPINGLES = [
  { id: "EpingleV60", c: EpingleV60, fichier: "v60-guide-complet-tuto" },
  { id: "EpingleAero", c: EpingleAero, fichier: "aeropress-guide-complet-tuto" },
  { id: "EpinglePress", c: EpinglePress, fichier: "french-press-guide-tuto" },
  { id: "EpingleMoka", c: EpingleMoka, fichier: "moka-pot-guide-complet-tuto" },
  { id: "EpingleFroid", c: EpingleFroid, fichier: "cold-brew-maison-tuto" },
  { id: "EpingleEsp", c: EpingleEsp, fichier: "comment-faire-espresso-parfait-tuto" },
];
