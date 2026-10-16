import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Bouilloire } from "../dessins/Bouilloire";
import { Bruleur, Moka } from "../dessins/Moka";
import { AfficheMethode } from "../scenes/AfficheMethode";
import { DiagnosticMethode } from "../scenes/DiagnosticMethode";
import { EauMethode } from "../scenes/EauMethode";
import { Film, Plan, dureeFilm } from "../scenes/Film";
import { FinMethode } from "../scenes/FinMethode";
import { MaterielMethode } from "../scenes/MaterielMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { Legende } from "../ui/Legende";
import { PosteMoka } from "./PosteMoka";
import {
  CAFE_DUREE,
  MONTEE_DUREE,
  REMPLIR_DUREE,
  RETIRER_DUREE,
  VISSER_DUREE,
  etatCafe,
  etatMontee,
  etatRemplir,
  etatRetirer,
  etatVisser,
} from "./etats";

const MOKA_FERMEE = {
  eau: 0,
  entonnoir: 0,
  remplissage: 0,
  haut: 1,
  hautDy: 0,
  rotation: 0,
  couvercle: 0,
  cafeHaut: 0,
  flux: 0,
  crachote: 0,
};

export const MokaTitre: React.FC = () => (
  <TitreMethode
    nom="Moka"
    puces={["Eau à 70 °C", "Feu doux", "4 à 6 min"]}
    objet={{ vertical: { x: 540, y: 1262, s: 1.3 }, paysage: { x: 1420, y: 860, s: 1.2 } }}
    sol={{ vertical: 1264, paysage: 862 }}
    dessin={({ x, y, s, trace, frame }) => <Moka x={x} y={y} s={s} trace={trace} e={{ ...MOKA_FERMEE, frame }} />}
  />
);

export const MokaMateriel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Une moka",
        detail: "1, 3, 6 ou 9 tasses",
        dessin: ({ x, base, trace }) => <Moka x={x} y={base} s={0.58} trace={trace} e={{ ...MOKA_FERMEE, frame: 0 }} />,
      },
      {
        titre: "De l’eau chaude",
        detail: "vers 70 °C",
        dessin: ({ x, base, trace }) => <Bouilloire x={x + 45} y={base - 80 * 0.68} s={0.68} trace={trace} />,
      },
      {
        titre: "Un feu",
        detail: "doux à moyen",
        dessin: ({ x, base, trace }) => <Bruleur x={x} y={base - 30} s={0.9} feu={0.4 * trace} frame={0} trace={trace} />,
      },
    ]}
  />
);

export const MokaEau: React.FC = () => <EauMethode temperature={70} sous="montée plus rapide, moins de goût de métal" />;

const AvecPoste: React.FC<{ etat: Parameters<typeof PosteMoka>[0]["e"]; children: React.ReactNode; nom: string }> = ({
  etat,
  children,
  nom,
}) => (
  <AbsoluteFill name={nom}>
    <PosteMoka e={etat} />
    {children}
  </AbsoluteFill>
);

export const MokaRemplir: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AvecPoste nom="Remplir" etat={etatRemplir(f)}>
      <Legende puce="ÉTAPE 2" titre="Remplir la base" sous="d’eau chaude, jusqu’à la valve" duree={REMPLIR_DUREE} />
    </AvecPoste>
  );
};

export const MokaCafe: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AvecPoste nom="Café" etat={etatCafe(f)}>
      <Legende puce="ÉTAPE 3" titre="Le filtre à ras bord" taille={100} sous="mouture médium-fine, sans tasser" duree={CAFE_DUREE} />
    </AvecPoste>
  );
};

export const MokaVisser: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AvecPoste nom="Visser" etat={etatVisser(f)}>
      <Legende puce="ÉTAPE 4" titre="Visser fermement" taille={100} sous="puis feu doux, couvercle ouvert" duree={VISSER_DUREE} />
    </AvecPoste>
  );
};

export const MokaMontee: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AvecPoste nom="Montée" etat={etatMontee(f)}>
      <Legende puce="ÉTAPE 5" titre="La montée" sous="un glouglou régulier : tout va bien" duree={MONTEE_DUREE} />
    </AvecPoste>
  );
};

export const MokaRetirer: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AvecPoste nom="Retirer" etat={etatRetirer(f)}>
      <Sequence name="Crachote" durationInFrames={76} layout="none">
        <Legende puce="ÉTAPE 6" titre={"Ça crachote\u202f?"} sous="retirer aussitôt du feu" duree={76} />
      </Sequence>
      <Sequence name="Temps" from={72} durationInFrames={RETIRER_DUREE - 72} layout="none">
        <Legende puce="ÉTAPE 6" titre={"4 à 6 min en tout"} taille={100} sous="et jamais sur le feu après" />
      </Sequence>
    </AvecPoste>
  );
};

export const MokaDiagnostic: React.FC = () => (
  <DiagnosticMethode
    titre={"Amer ou aqueux ?"}
    sous="la mouture règle la montée"
    graduations={["lente", "", "", "", "rapide"]}
    fenetre="montée régulière"
    gauche={{ titre: "Amer, lent ?", verbe: "moudre", accent: "plus gros" }}
    droite={{ titre: "Aqueux ?", verbe: "moudre", accent: "plus fin" }}
  />
);

export const MokaFin: React.FC = () => (
  <FinMethode
    titre="La recette moka"
    lignes={[
      { l: "Eau", v: "chaude, jusqu’à la valve" },
      { l: "Café", v: "médium-fine, à ras bord" },
      { l: "Tasser", v: "jamais" },
      { l: "Feu", v: "doux, couvercle ouvert" },
      { l: "Temps", v: "4 à 6 min" },
    ]}
    url="filtre.cafe/journal/moka-pot-guide-complet"
  />
);

export const PLANS_MOKA: Plan[] = [
  { nom: "Titre", duree: 105, C: MokaTitre },
  { nom: "Matériel", duree: 120, C: MokaMateriel, transition: "fondu" },
  { nom: "Eau", duree: 105, C: MokaEau, transition: "glisse" },
  { nom: "Remplir", duree: REMPLIR_DUREE, C: MokaRemplir, transition: "fondu" },
  { nom: "Café", duree: CAFE_DUREE, C: MokaCafe },
  { nom: "Visser", duree: VISSER_DUREE, C: MokaVisser },
  { nom: "Montée", duree: MONTEE_DUREE, C: MokaMontee },
  { nom: "Retirer", duree: RETIRER_DUREE, C: MokaRetirer },
  { nom: "Diagnostic", duree: 140, C: MokaDiagnostic, transition: "fondu" },
  { nom: "Fin", duree: 120, C: MokaFin, transition: "fondu" },
];
export const MOKA_DUREE = dureeFilm(PLANS_MOKA);
export const MokaVertical: React.FC = () => <Film format="vertical" plans={PLANS_MOKA} />;
export const MokaPaysage: React.FC = () => <Film format="paysage" plans={PLANS_MOKA} />;

const PUCES = ["Eau à 70 °C", "Feu doux", "4 à 6 min"];
const posteAffiche = <PosteMoka e={{ ...etatMontee(120), repere: null, attente: null }} />;
export const MokaAffiche: React.FC = () => <AfficheMethode format="paysage" nom="Moka" puces={PUCES} poste={posteAffiche} />;
export const MokaAfficheVerticale: React.FC = () => <AfficheMethode format="vertical" nom="Moka" puces={PUCES} poste={posteAffiche} />;
