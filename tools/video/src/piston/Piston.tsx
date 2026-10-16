import { Film, Plan, dureeFilm } from "../scenes/Film";
import {
  DUREES_PRESS,
  PressCafe,
  PressDiagnostic,
  PressEau,
  PressFin,
  PressInfuser,
  PressMateriel,
  PressPrechauffer,
  PressPresser,
  PressServir,
  PressTitre,
  PressVerser,
} from "./scenes";

export const PLANS_PRESS: Plan[] = [
  { nom: "Titre", duree: 105, C: PressTitre },
  { nom: "Matériel", duree: 120, C: PressMateriel, transition: "fondu" },
  { nom: "Eau", duree: 105, C: PressEau, transition: "glisse" },
  { nom: "Préchauffer", duree: DUREES_PRESS.PRECHAUFFER_DUREE, C: PressPrechauffer, transition: "fondu" },
  { nom: "Café", duree: DUREES_PRESS.CAFE_DUREE, C: PressCafe },
  { nom: "Verser", duree: DUREES_PRESS.VERSER_DUREE, C: PressVerser },
  { nom: "Infuser", duree: DUREES_PRESS.INFUSER_DUREE, C: PressInfuser },
  { nom: "Presser", duree: DUREES_PRESS.PRESSER_DUREE, C: PressPresser },
  { nom: "Servir", duree: DUREES_PRESS.SERVIR_DUREE, C: PressServir },
  { nom: "Diagnostic", duree: 140, C: PressDiagnostic, transition: "fondu" },
  { nom: "Fin", duree: 120, C: PressFin, transition: "fondu" },
];

export const PRESS_DUREE = dureeFilm(PLANS_PRESS);
export const PressVertical: React.FC = () => <Film format="vertical" plans={PLANS_PRESS} />;
export const PressPaysage: React.FC = () => <Film format="paysage" plans={PLANS_PRESS} />;
