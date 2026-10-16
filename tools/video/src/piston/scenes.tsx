import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Balance } from "../dessins/Balance";
import { Bouilloire } from "../dessins/Bouilloire";
import { FrenchPress } from "../dessins/FrenchPress";
import { Trace } from "../dessins/Trace";
import { AfficheMethode } from "../scenes/AfficheMethode";
import { DiagnosticMethode } from "../scenes/DiagnosticMethode";
import { EauMethode } from "../scenes/EauMethode";
import { FinMethode } from "../scenes/FinMethode";
import { MaterielMethode } from "../scenes/MaterielMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { C, prog } from "../theme";
import { Legende } from "../ui/Legende";
import { PostePress } from "./PostePress";
import {
  CAFE_DUREE,
  INFUSER_DUREE,
  PRECHAUFFER_DUREE,
  PRESSER_DUREE,
  SERVIR_DUREE,
  VERSER_DUREE,
  etatCafe,
  etatInfuser,
  etatPrechauffer,
  etatPresser,
  etatServir,
  etatVerser,
} from "./etats";

const PLEINE = {
  eau: 0.9,
  teinte: 1,
  lit: 0.8,
  croute: 0,
  suspension: 0.2,
  maille: -284,
  couvercle: 1,
  inclinaison: 0,
  frame: 0,
};

const Cuillere: React.FC<{ x: number; y: number; s: number; trace: number }> = ({ x, y, s, trace }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-30)`}>
    <Trace d="M -6 -230 L -6 -40 L 6 -40 L 6 -230 Z" p={prog(trace, 0, 0.6)} w={4} />
    <Trace d="M 0 -52 C 26 -52 30 -12 0 10 C -30 -12 -26 -52 0 -52 Z" p={prog(trace, 0.4, 1)} w={4} />
  </g>
);

export const PressTitre: React.FC = () => (
  <TitreMethode
    nom="French press"
    tailleNom={160}
    puces={["15 g de café", "250 ml d’eau", "4 min"]}
    objet={{ vertical: { x: 560, y: 1290, s: 1.12 }, paysage: { x: 1420, y: 860, s: 1 } }}
    sol={{ vertical: 1292, paysage: 862 }}
    dessin={({ x, y, s, trace, frame }) => (
      <FrenchPress x={x} y={y} s={s} trace={trace} e={{ ...PLEINE, frame, eau: 0.9 * prog(trace, 0.6, 1) }} />
    )}
  />
);

export const PressMateriel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Une cafetière",
        detail: "à piston",
        dessin: ({ x, base, trace }) => (
          <FrenchPress x={x - 10} y={base} s={0.5} trace={trace} e={{ ...PLEINE, eau: 0 }} />
        ),
      },
      {
        titre: "Une balance",
        detail: "au 0,1 g",
        dessin: ({ x, base, trace }) => (
          <Balance x={x} y={base - 150 * 0.62} s={0.62} trace={trace} poids={0.1} decimales temps={null} />
        ),
      },
      {
        titre: "Une bouilloire",
        detail: "d’eau chaude",
        dessin: ({ x, base, trace }) => <Bouilloire x={x + 45} y={base - 80 * 0.68} s={0.68} trace={trace} />,
      },
      {
        titre: "Une cuillère",
        detail: "pour mélanger",
        dessin: ({ x, base, trace }) => <Cuillere x={x + 30} y={base - 10} s={0.95} trace={trace} />,
      },
    ]}
  />
);

export const PressEau: React.FC = () => <EauMethode temperature={93} sous={"jamais au-dessus de 95 °C"} />;

export const PressPrechauffer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Préchauffer">
      <PostePress e={etatPrechauffer(frame)} />
      <Legende puce="ÉTAPE 2" titre="Préchauffer" sous={"un peu d’eau chaude, 30 s, puis vider"} duree={PRECHAUFFER_DUREE} />
    </AbsoluteFill>
  );
};

export const PressCafe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Café">
      <PostePress e={etatCafe(frame)} />
      <Legende puce="ÉTAPE 3" titre={"15 g de café"} sous="mouture grossière, comme du sel gros" duree={CAFE_DUREE} />
    </AbsoluteFill>
  );
};

export const PressVerser: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Verser">
      <PostePress e={etatVerser(frame)} />
      <Sequence name="250 ml" durationInFrames={94} layout="none">
        <Legende puce="ÉTAPE 4" titre={"Verser 250 ml"} sous={"d’eau à 93 °C, en cercles"} duree={94} />
      </Sequence>
      <Sequence name="Mélanger" from={90} durationInFrames={VERSER_DUREE - 90} layout="none">
        <Legende puce="ÉTAPE 4" titre={"Mélanger 10 s"} sous="pour ne laisser aucune zone sèche" duree={VERSER_DUREE - 90} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const PressInfuser: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Infuser">
      <PostePress e={etatInfuser(frame)} />
      <Legende puce="ÉTAPE 5" titre={"Infuser 4 min"} sous="couvercle posé, sans presser" duree={INFUSER_DUREE} />
    </AbsoluteFill>
  );
};

export const PressPresser: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Presser">
      <PostePress e={etatPresser(frame)} />
      <Legende puce="ÉTAPE 6" titre={"Presser en 30 s"} sous="lentement, régulièrement" duree={PRESSER_DUREE} />
    </AbsoluteFill>
  );
};

export const PressServir: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Servir">
      <PostePress e={etatServir(frame)} />
      <Legende puce="ÉTAPE 7" titre="Servir aussitôt" sous="sinon le café continue d’extraire" />
    </AbsoluteFill>
  );
};

export const PressDiagnostic: React.FC = () => (
  <DiagnosticMethode
    titre={"Le piston résiste ?"}
    sous="il dit si la mouture est bonne"
    graduations={["dur", "", "", "", "sans effort"]}
    fenetre="résistance légère"
    gauche={{ titre: "Trop dur ?", verbe: "moudre", accent: "plus gros" }}
    droite={{ titre: "Sans effort ?", verbe: "moudre", accent: "plus fin" }}
  />
);

export const PressFin: React.FC = () => (
  <FinMethode
    titre="La recette French press"
    lignes={[
      { l: "Café", v: "15 g, mouture grossière" },
      { l: "Eau", v: "250 ml à 93 °C" },
      { l: "Infusion", v: "4 min, couvercle posé" },
      { l: "Piston", v: "30 s, lentement" },
      { l: "Ratio", v: "1:16" },
    ]}
    url="filtre.cafe/journal/french-press-guide"
  />
);

const PUCES = ["15 g de café", "250 ml d’eau", "4 min"];
const posteAffiche = <PostePress e={{ ...etatVerser(46), repere: null, attente: null }} />;
export const PressAffiche: React.FC = () => (
  <AfficheMethode format="paysage" nom="French press" tailleNom={{ paysage: 190, vertical: 170 }} puces={PUCES} poste={posteAffiche} />
);
export const PressAfficheVerticale: React.FC = () => (
  <AfficheMethode format="vertical" nom="French press" tailleNom={{ paysage: 190, vertical: 170 }} puces={PUCES} poste={posteAffiche} />
);

export const DUREES_PRESS = { PRECHAUFFER_DUREE, CAFE_DUREE, VERSER_DUREE, INFUSER_DUREE, PRESSER_DUREE, SERVIR_DUREE };
export const COULEUR = C.crema;
