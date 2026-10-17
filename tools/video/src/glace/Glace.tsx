import { Film, Plan, dureeFilm } from "../scenes/Film";
import { GlaceCafe } from "./Cafe";
import { GlaceMateriel } from "./Materiel";
import { BLOOM_G_DUREE, FILTRE_G_DUREE, REMUER_DUREE, VERSEMENTS_G_DUREE } from "./etats";
import {
  GlaceBloom,
  GlaceEau,
  GlaceFiltre,
  GlaceFin,
  GlacePrincipe,
  GlaceRemuer,
  GlaceTitre,
  GlaceVersements,
  PRINCIPE_G_DUREE,
} from "./scenes";

export const PLANS_GLACE: Plan[] = [
  { nom: "Titre", duree: 105, C: GlaceTitre },
  { nom: "Principe", duree: PRINCIPE_G_DUREE, C: GlacePrincipe, transition: "fondu" },
  { nom: "Matériel", duree: 110, C: GlaceMateriel, transition: "fondu" },
  { nom: "Eau", duree: 100, C: GlaceEau, transition: "glisse" },
  { nom: "Café", duree: 145, C: GlaceCafe, transition: "glisse" },
  { nom: "Filtre et glace", duree: FILTRE_G_DUREE, C: GlaceFiltre, transition: "fondu" },
  { nom: "Dégazage", duree: BLOOM_G_DUREE, C: GlaceBloom },
  { nom: "Versements", duree: VERSEMENTS_G_DUREE, C: GlaceVersements },
  { nom: "Remuer", duree: REMUER_DUREE, C: GlaceRemuer },
  { nom: "Fin", duree: 120, C: GlaceFin, transition: "fondu" },
];

export const GLACE_DUREE = dureeFilm(PLANS_GLACE);
export const GlaceVertical: React.FC = () => <Film format="vertical" plans={PLANS_GLACE} />;
export const GlacePaysage: React.FC = () => <Film format="paysage" plans={PLANS_GLACE} />;
