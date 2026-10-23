import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Balance } from "../dessins/Balance";
import { Machine, PorteFiltre, Tamper, TasseEspresso } from "../dessins/Espresso";
import { AfficheMethode } from "../scenes/AfficheMethode";
import { DiagnosticMethode } from "../scenes/DiagnosticMethode";
import { Film, Plan, dureeFilm } from "../scenes/Film";
import { FinMethode } from "../scenes/FinMethode";
import { MaterielMethode } from "../scenes/MaterielMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { prog } from "../theme";
import { Legende } from "../ui/Legende";
import { EtatEspresso, PosteEspresso } from "./PosteEspresso";
import {
  DOSE_DUREE,
  EXTRAIRE_DUREE,
  PLACER_DUREE,
  SERVIR_DUREE,
  TASSER_DUREE,
  etatDose,
  etatExtraire,
  etatPlacer,
  etatServir,
  etatTasser,
} from "./etats";

// La machine, porte-filtre en place, tasse dessous (repère : bas de la caisse).
export const MachineComplete: React.FC<{ x: number; y: number; s: number; trace: number }> = ({ x, y, s, trace }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(${-540} ${-1250})`}>
    <Machine x={540} y={1250} trace={trace} />
    <TasseEspresso x={540} y={1150} trace={prog(trace, 0.4, 1)} niveau={prog(trace, 0.8, 1)} />
    <PorteFiltre x={540} y={792} trace={trace} dose={1} tasse={1} />
  </g>
);

export const EspTitre: React.FC = () => (
  <TitreMethode
    nom="Espresso"
    tailleNom={230}
    puces={["18 g de café", "36 g en tasse", "25 à 30 s"]}
    objet={{ vertical: { x: 540, y: 1270, s: 0.95 }, paysage: { x: 1420, y: 900, s: 1 } }}
    sol={{ vertical: 1272, paysage: 902 }}
    dessin={({ x, y, s, trace }) => <MachineComplete x={x} y={y} s={s} trace={trace} />}
  />
);

export const EspMateriel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Une machine",
        detail: "à porte-filtre",
        dessin: ({ x, base, trace }) => <MachineComplete x={x} y={base} s={0.36} trace={trace} />,
      },
      {
        titre: "Un tamper",
        detail: "adapté au panier",
        dessin: ({ x, base, trace }) => <Tamper x={x} y={base} s={1.1} trace={trace} />,
      },
      {
        titre: "Une balance",
        detail: "au 0,1 g",
        dessin: ({ x, base, trace }) => (
          <Balance x={x} y={base - 150 * 0.62} s={0.62} trace={trace} poids={0.1} decimales temps={null} />
        ),
      },
      {
        titre: "Une petite tasse",
        detail: "préchauffée",
        dessin: ({ x, base, trace }) => <TasseEspresso x={x} y={base - 10} s={1.3} trace={trace} niveau={0} />,
      },
    ]}
  />
);

const Scene: React.FC<{ nom: string; etat: (f: number) => EtatEspresso; children: React.ReactNode }> = ({ nom, etat, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill name={nom}>
      <PosteEspresso e={etat(f)} />
      {children}
    </AbsoluteFill>
  );
};

export const EspDose: React.FC = () => (
  <Scene nom="Dose" etat={etatDose}>
    <Legende puce="ÉTAPE 1" titre={"18 g de café"} sous="mouture fine, comme du sable fin" duree={DOSE_DUREE} />
  </Scene>
);
export const EspTasser: React.FC = () => (
  <Scene nom="Tasser" etat={etatTasser}>
    <Legende puce="ÉTAPE 2" titre="Répartir, tasser" sous="droit, de niveau, ferme" duree={TASSER_DUREE} />
  </Scene>
);
export const EspPlacer: React.FC = () => (
  <Scene nom="En place" etat={etatPlacer}>
    <Legende puce="ÉTAPE 3" titre="En place" sous="la tasse sur la balance, à zéro" duree={PLACER_DUREE} />
  </Scene>
);
export const EspExtraire: React.FC = () => (
  <Scene nom="Extraire" etat={etatExtraire}>
    <Legende puce="ÉTAPE 4" titre={"36 g en 25 à 30 s"} taille={100} sous="le ratio 1:2" duree={EXTRAIRE_DUREE} />
  </Scene>
);
export const EspServir: React.FC = () => (
  <Scene nom="Servir" etat={etatServir}>
    <Legende puce="ÉTAPE 5" titre="Servir tout de suite" taille={100} sous="la crema retombe vite" />
  </Scene>
);

export const EspDiagnostic: React.FC = () => (
  <DiagnosticMethode
    titre={"Trop rapide, trop lent ?"}
    sous="on règle la mouture : c’est le dial-in"
    graduations={["", "25 s", "", "30 s", ""]}
    fenetre="la bonne fenêtre"
    gauche={{ titre: "Plus rapide ?", verbe: "moudre", accent: "plus fin" }}
    droite={{ titre: "Plus lent ?", verbe: "moudre", accent: "plus gros" }}
  />
);

export const EspFin: React.FC = () => (
  <FinMethode
    titre="La recette espresso"
    lignes={[
      { l: "Café", v: "18 g, mouture fine" },
      { l: "En tasse", v: "36 g (ratio 1:2)" },
      { l: "Temps", v: "25 à 30 s" },
      { l: "Eau", v: "92 à 94 °C" },
      { l: "Pression", v: "9 bars" },
    ]}
    url="filtre.cafe/journal/comment-faire-espresso-parfait"
  />
);

export const PLANS_ESP: Plan[] = [
  { nom: "Titre", duree: 105, C: EspTitre },
  { nom: "Matériel", duree: 120, C: EspMateriel, transition: "fondu" },
  { nom: "Dose", duree: DOSE_DUREE, C: EspDose, transition: "fondu" },
  { nom: "Tasser", duree: TASSER_DUREE, C: EspTasser },
  { nom: "En place", duree: PLACER_DUREE, C: EspPlacer },
  { nom: "Extraire", duree: EXTRAIRE_DUREE, C: EspExtraire },
  { nom: "Servir", duree: SERVIR_DUREE, C: EspServir },
  { nom: "Diagnostic", duree: 140, C: EspDiagnostic, transition: "fondu" },
  { nom: "Fin", duree: 120, C: EspFin, transition: "fondu" },
];
export const ESP_DUREE = dureeFilm(PLANS_ESP);
export const EspVertical: React.FC = () => <Film format="vertical" plans={PLANS_ESP} />;
export const EspPaysage: React.FC = () => <Film format="paysage" plans={PLANS_ESP} />;

const PUCES = ["18 g de café", "36 g en tasse", "25 à 30 s"];
const posteAffiche = <PosteEspresso e={{ ...etatExtraire(110), repere: null }} />;
export const EspAffiche: React.FC = () => (
  <AfficheMethode format="paysage" nom="Espresso" tailleNom={{ paysage: 230, vertical: 230 }} puces={PUCES} poste={posteAffiche} />
);
export const EspAfficheVerticale: React.FC = () => (
  <AfficheMethode format="vertical" nom="Espresso" tailleNom={{ paysage: 230, vertical: 230 }} puces={PUCES} poste={posteAffiche} />
);
