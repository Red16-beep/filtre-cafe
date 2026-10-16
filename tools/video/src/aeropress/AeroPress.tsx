import { Film, Plan, dureeFilm } from "../scenes/Film";
import {
  AeroBloom,
  AeroCafe,
  AeroDiagnostic,
  AeroEau,
  AeroFin,
  AeroInfusion,
  AeroMateriel,
  AeroPiston,
  AeroPreparer,
  AeroTitre,
  DUREES_AERO,
} from "./scenes";

export const PLANS_AERO: Plan[] = [
  { nom: "Titre", duree: 105, C: AeroTitre },
  { nom: "Matériel", duree: 120, C: AeroMateriel, transition: "fondu" },
  { nom: "Eau", duree: 105, C: AeroEau, transition: "glisse" },
  { nom: "Préparer", duree: DUREES_AERO.PREPARER_DUREE, C: AeroPreparer, transition: "fondu" },
  { nom: "Café", duree: DUREES_AERO.CAFE_DUREE, C: AeroCafe },
  { nom: "Bloom", duree: DUREES_AERO.BLOOM_DUREE, C: AeroBloom },
  { nom: "Infusion", duree: DUREES_AERO.INFUSION_DUREE, C: AeroInfusion },
  { nom: "Piston", duree: DUREES_AERO.PISTON_DUREE, C: AeroPiston },
  { nom: "Diagnostic", duree: 140, C: AeroDiagnostic, transition: "fondu" },
  { nom: "Fin", duree: 120, C: AeroFin, transition: "fondu" },
];

export const AERO_DUREE = dureeFilm(PLANS_AERO);
export const AeroPressVertical: React.FC = () => <Film format="vertical" plans={PLANS_AERO} />;
export const AeroPressPaysage: React.FC = () => <Film format="paysage" plans={PLANS_AERO} />;
