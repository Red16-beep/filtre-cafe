import { Film, Plan, dureeFilm } from "../scenes/Film";
import { RINCAGE_DUREE } from "../v60/etats";
import { Materiel } from "../v60/scenes/Materiel";
import { KasuyaCafe } from "./Cafe";
import { VERSEMENTS_K_DUREE } from "./etats";
import {
  KasuyaEau,
  KasuyaFin,
  KasuyaPrincipe,
  KasuyaReglages,
  KasuyaRetrait,
  KasuyaRincage,
  KasuyaTitre,
  KasuyaVersements,
  PRINCIPE_DUREE,
  REGLAGES_DUREE,
  RETRAIT_SCENE,
} from "./scenes";

export const PLANS_KASUYA: Plan[] = [
  { nom: "Titre", duree: 105, C: KasuyaTitre },
  { nom: "Principe", duree: PRINCIPE_DUREE, C: KasuyaPrincipe, transition: "fondu" },
  { nom: "Matériel", duree: 110, C: Materiel, transition: "fondu" },
  { nom: "Eau", duree: 100, C: KasuyaEau, transition: "glisse" },
  { nom: "Café", duree: 130, C: KasuyaCafe, transition: "glisse" },
  { nom: "Rinçage", duree: RINCAGE_DUREE, C: KasuyaRincage, transition: "fondu" },
  { nom: "Versements", duree: VERSEMENTS_K_DUREE, C: KasuyaVersements },
  { nom: "Retrait", duree: RETRAIT_SCENE, C: KasuyaRetrait },
  { nom: "Réglages", duree: REGLAGES_DUREE, C: KasuyaReglages, transition: "fondu" },
  { nom: "Fin", duree: 120, C: KasuyaFin, transition: "fondu" },
];

export const KASUYA_DUREE = dureeFilm(PLANS_KASUYA);
export const KasuyaVertical: React.FC = () => <Film format="vertical" plans={PLANS_KASUYA} />;
export const KasuyaPaysage: React.FC = () => <Film format="paysage" plans={PLANS_KASUYA} />;
