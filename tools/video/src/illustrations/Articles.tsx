import FICHES from "./illustrations.json";
import { IlluCappuccino, IlluGlace, IlluGrains, IlluMoulin, IlluOrigine, IlluV60 } from "./scenes";
import {
  IlluAeroPress,
  IlluBalance,
  IlluBouilloire,
  IlluCapsules,
  IlluCerises,
  IlluColdBrew,
  IlluEau,
  IlluEspresso,
  IlluMachineGrain,
  IlluMoka,
  IlluMoulinManuel,
  IlluMousse,
  IlluPiston,
  IlluSachet,
  IlluTamper,
  IlluTasse,
  IlluTorrefaction,
} from "./scenes2";
import { IlluAltitude, IlluCafetiere, IlluChiffres, IlluColis, IlluDeuxGrains, IlluExtraction, IlluMachineEspresso, IlluMolecule, IlluTrioTasses } from "./scenes3";

// Une illustration par article : la scène, ses réglages et la légende viennent
// de illustrations.json (lu aussi par le script d'intégration dans le site).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCENES: Record<string, React.FC<any>> = {
  AeroPress: IlluAeroPress,
  Altitude: IlluAltitude,
  Balance: IlluBalance,
  Bouilloire: IlluBouilloire,
  Cafetiere: IlluCafetiere,
  Cappuccino: IlluCappuccino,
  Capsules: IlluCapsules,
  Cerises: IlluCerises,
  Chiffres: IlluChiffres,
  ColdBrew: IlluColdBrew,
  Colis: IlluColis,
  DeuxGrains: IlluDeuxGrains,
  Eau: IlluEau,
  Espresso: IlluEspresso,
  Extraction: IlluExtraction,
  Glace: IlluGlace,
  Grains: IlluGrains,
  MachineEspresso: IlluMachineEspresso,
  MachineGrain: IlluMachineGrain,
  Moka: IlluMoka,
  Molecule: IlluMolecule,
  Moulin: IlluMoulin,
  MoulinManuel: IlluMoulinManuel,
  Mousse: IlluMousse,
  Origine: IlluOrigine,
  Piston: IlluPiston,
  Sachet: IlluSachet,
  Tamper: IlluTamper,
  Tasse: IlluTasse,
  Torrefaction: IlluTorrefaction,
  Trio: IlluTrioTasses,
  V60: IlluV60,
};

export type Fiche = { slug: string; libelle: string; scene: string; props: Record<string, unknown>; alt: string; image?: number };
export const FICHES_ILLU = FICHES as Fiche[];

export const IlluArticle: React.FC<{ scene: string; props: Record<string, unknown>; libelle: string }> = ({ scene, props, libelle }) => {
  const Scene = SCENES[scene];
  return <Scene libelle={libelle} {...props} />;
};
