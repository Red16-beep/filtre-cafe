import { Film, Plan, dureeFilm } from "../scenes/Film";
import { ChemexCafe } from "./Cafe";
import {
  ChemexBloom,
  ChemexDiagnostic,
  ChemexEau,
  ChemexEcoulement,
  ChemexFiltre,
  ChemexFin,
  ChemexMateriel,
  ChemexPrincipe,
  ChemexServir,
  ChemexTitre,
  ChemexVersements,
  DUREES_CHEMEX,
} from "./scenes";

export const PLANS_CHEMEX: Plan[] = [
  { nom: "Titre", duree: 105, C: ChemexTitre },
  { nom: "Principe", duree: DUREES_CHEMEX.PRINCIPE_DUREE, C: ChemexPrincipe, transition: "fondu" },
  { nom: "Matériel", duree: 110, C: ChemexMateriel, transition: "fondu" },
  { nom: "Eau", duree: 100, C: ChemexEau, transition: "glisse" },
  { nom: "Café", duree: 145, C: ChemexCafe, transition: "glisse" },
  { nom: "Filtre", duree: DUREES_CHEMEX.FILTRE_DUREE, C: ChemexFiltre, transition: "fondu" },
  { nom: "Bloom", duree: DUREES_CHEMEX.BLOOM_DUREE, C: ChemexBloom },
  { nom: "Versements", duree: DUREES_CHEMEX.VERSEMENTS_DUREE, C: ChemexVersements },
  { nom: "Écoulement", duree: DUREES_CHEMEX.ECOULEMENT_DUREE, C: ChemexEcoulement },
  { nom: "Servir", duree: DUREES_CHEMEX.SERVIR_DUREE, C: ChemexServir },
  { nom: "Diagnostic", duree: 140, C: ChemexDiagnostic, transition: "fondu" },
  { nom: "Fin", duree: 120, C: ChemexFin, transition: "fondu" },
];

export const CHEMEX_DUREE = dureeFilm(PLANS_CHEMEX);
export const ChemexVertical: React.FC = () => <Film format="vertical" plans={PLANS_CHEMEX} />;
export const ChemexPaysage: React.FC = () => <Film format="paysage" plans={PLANS_CHEMEX} />;
