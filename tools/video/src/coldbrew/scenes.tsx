import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Balance } from "../dessins/Balance";
import { Bocal, Frigo } from "../dessins/Bocal";
import { Filtre } from "../dessins/Filtre";
import { AfficheMethode } from "../scenes/AfficheMethode";
import { DiagnosticMethode } from "../scenes/DiagnosticMethode";
import { Film, Plan, dureeFilm } from "../scenes/Film";
import { FinMethode } from "../scenes/FinMethode";
import { MaterielMethode } from "../scenes/MaterielMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { Legende } from "../ui/Legende";
import { EtatFroid, PosteFroid } from "./PosteFroid";
import {
  CAFE_DUREE,
  EAU_DUREE,
  FILTRER_DUREE,
  FRIGO_DUREE,
  GARDER_DUREE,
  MELANGER_DUREE,
  etatCafe,
  etatEau,
  etatFiltrer,
  etatFrigo,
  etatGarder,
  etatMelanger,
} from "./etats";

const PLEIN = { marc: 0.85, eau: 1, teinte: 1, suspension: 0.15, couvercle: 1, inclinaison: 0, frame: 0 };

export const FroidTitre: React.FC = () => (
  <TitreMethode
    nom="Cold brew"
    tailleNom={190}
    puces={["100 g de café", "1 L d’eau", "12 à 16 h"]}
    objet={{ vertical: { x: 540, y: 1250, s: 1.25 }, paysage: { x: 1420, y: 860, s: 1.25 } }}
    sol={{ vertical: 1252, paysage: 862 }}
    dessin={({ x, y, s, trace, frame }) => <Bocal x={x} y={y} s={s} trace={trace} e={{ ...PLEIN, frame }} />}
  />
);

export const FroidMateriel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Un bocal",
        detail: "avec couvercle",
        dessin: ({ x, base, trace }) => <Bocal x={x} y={base} s={0.58} trace={trace} e={{ ...PLEIN, eau: 0, marc: 0 }} />,
      },
      {
        titre: "Une balance",
        detail: "pour les 100 g",
        dessin: ({ x, base, trace }) => (
          <Balance x={x} y={base - 150 * 0.62} s={0.62} trace={trace} poids={100} temps={null} />
        ),
      },
      {
        titre: "Un filtre papier",
        detail: "ou une étamine",
        dessin: ({ x, base, trace }) => <Filtre x={x} y={base - 115 * 0.95} s={0.95} trace={trace} />,
      },
      {
        titre: "Un frigo",
        detail: "toujours au froid",
        dessin: ({ x, base, trace }) => <Frigo x={x - 50} y={base} s={0.34} trace={trace} porte={1} />,
      },
    ]}
  />
);

const Scene: React.FC<{ nom: string; etat: (f: number) => EtatFroid; children: React.ReactNode }> = ({ nom, etat, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill name={nom}>
      <PosteFroid e={etat(f)} />
      {children}
    </AbsoluteFill>
  );
};

export const FroidCafe: React.FC = () => (
  <Scene nom="Café" etat={etatCafe}>
    <Legende puce="ÉTAPE 1" titre={"100 g de café"} sous="mouture très grossière, comme du sucre gros" duree={CAFE_DUREE} />
  </Scene>
);
export const FroidEau: React.FC = () => (
  <Scene nom="Eau" etat={etatEau}>
    <Legende puce="ÉTAPE 2" titre={"1 litre d’eau froide"} taille={100} sous="filtrée, de préférence" duree={EAU_DUREE} />
  </Scene>
);
export const FroidMelanger: React.FC = () => (
  <Scene nom="Mélanger" etat={etatMelanger}>
    <Legende puce="ÉTAPE 3" titre="Mélanger" sous="pour mouiller tout le café" duree={MELANGER_DUREE} />
  </Scene>
);
export const FroidFrigo: React.FC = () => (
  <Scene nom="Frigo" etat={etatFrigo}>
    <Legende puce="ÉTAPE 4" titre={"12 à 16 h au frigo"} taille={100} sous={"couvert, jamais plus de 20 h"} duree={FRIGO_DUREE} />
  </Scene>
);
export const FroidFiltrer: React.FC = () => (
  <Scene nom="Filtrer" etat={etatFiltrer}>
    <Legende puce="ÉTAPE 5" titre="Filtrer au papier" sous="jusqu’à un liquide clair" duree={FILTRER_DUREE} />
  </Scene>
);
export const FroidGarder: React.FC = () => (
  <Scene nom="Garder" etat={etatGarder}>
    <Legende puce="ÉTAPE 6" titre={"Jusqu’à 10 jours"} sous="au frigo, bien filtré" />
  </Scene>
);

export const FroidDiagnostic: React.FC = () => (
  <DiagnosticMethode
    titre={"Amer ou plat ?"}
    sous="on ajuste la mouture, un cran à la fois"
    graduations={["amer", "", "", "", "plat"]}
    fenetre="équilibré"
    gauche={{ titre: "Amer ?", verbe: "moudre", accent: "plus gros" }}
    droite={{ titre: "Plat ?", verbe: "moudre", accent: "plus fin" }}
  />
);

export const FroidFin: React.FC = () => (
  <FinMethode
    titre="La recette cold brew"
    lignes={[
      { l: "Café", v: "100 g, très grossière" },
      { l: "Eau", v: "1 litre, froide" },
      { l: "Infusion", v: "12 à 16 h au frigo" },
      { l: "Filtre", v: "papier" },
      { l: "Garde", v: "10 jours au frigo" },
    ]}
    url="filtre.cafe/journal/cold-brew-maison"
  />
);

export const PLANS_FROID: Plan[] = [
  { nom: "Titre", duree: 105, C: FroidTitre },
  { nom: "Matériel", duree: 120, C: FroidMateriel, transition: "fondu" },
  { nom: "Café", duree: CAFE_DUREE, C: FroidCafe, transition: "fondu" },
  { nom: "Eau", duree: EAU_DUREE, C: FroidEau },
  { nom: "Mélanger", duree: MELANGER_DUREE, C: FroidMelanger },
  { nom: "Frigo", duree: FRIGO_DUREE, C: FroidFrigo },
  { nom: "Filtrer", duree: FILTRER_DUREE, C: FroidFiltrer },
  { nom: "Garder", duree: GARDER_DUREE, C: FroidGarder },
  { nom: "Diagnostic", duree: 140, C: FroidDiagnostic, transition: "fondu" },
  { nom: "Fin", duree: 120, C: FroidFin, transition: "fondu" },
];
export const FROID_DUREE = dureeFilm(PLANS_FROID);
export const FroidVertical: React.FC = () => <Film format="vertical" plans={PLANS_FROID} />;
export const FroidPaysage: React.FC = () => <Film format="paysage" plans={PLANS_FROID} />;

const PUCES = ["100 g de café", "1 L d’eau", "12 à 16 h"];
const posteAffiche = <PosteFroid e={{ ...etatFiltrer(100) }} />;
export const FroidAffiche: React.FC = () => (
  <AfficheMethode format="paysage" nom="Cold brew" tailleNom={{ paysage: 220, vertical: 190 }} puces={PUCES} poste={posteAffiche} />
);
export const FroidAfficheVerticale: React.FC = () => (
  <AfficheMethode format="vertical" nom="Cold brew" tailleNom={{ paysage: 220, vertical: 190 }} puces={PUCES} poste={posteAffiche} />
);
