import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { ChambreAero, Chapeau, FOND, Piston } from "../dessins/AeroPress";
import { Balance } from "../dessins/Balance";
import { Bouilloire } from "../dessins/Bouilloire";
import { Trace, ellipse } from "../dessins/Trace";
import { DiagnosticMethode } from "../scenes/DiagnosticMethode";
import { EauMethode } from "../scenes/EauMethode";
import { FinMethode } from "../scenes/FinMethode";
import { MaterielMethode } from "../scenes/MaterielMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { C, prog } from "../theme";
import { Legende } from "../ui/Legende";
import { PosteAero } from "./PosteAero";
import {
  BLOOM_DUREE,
  CAFE_DUREE,
  INFUSION_DUREE,
  PISTON_DUREE,
  PREPARER_DUREE,
  etatBloom,
  etatCafe,
  etatInfusion,
  etatPiston,
  etatPreparer,
} from "./etats";

// L'AeroPress montée : chapeau, chambre, piston engagé.
const AeroComplete: React.FC<{ x: number; y: number; s: number; trace: number; joint?: number }> = ({
  x,
  y,
  s,
  trace,
  joint = 110,
}) => (
  <g>
    <Chapeau x={x} y={y + (FOND - 6) * s} s={s} trace={trace} />
    <ChambreAero x={x} y={y} s={s} trace={trace} couche="arriere" />
    <Piston x={x} y={y + joint * s} s={s} trace={trace} />
    <ChambreAero x={x} y={y} s={s} trace={trace} couche="avant" />
  </g>
);

// Filtres papier ronds, en petite pile.
const FiltresRonds: React.FC<{ x: number; y: number; s: number; trace: number }> = ({ x, y, s, trace }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[24, 12, 0].map((dy, i) => (
      <g key={dy} opacity={prog(trace, i * 0.15, 0.5 + i * 0.15)}>
        <ellipse cx={0} cy={dy} rx={110} ry={30} fill={C.papier} opacity={0.18} />
        <Trace d={ellipse(0, dy, 110, 30)} p={prog(trace, i * 0.15, 0.6 + i * 0.13)} w={4} c={C.papier} />
      </g>
    ))}
  </g>
);

export const AeroTitre: React.FC = () => (
  <TitreMethode
    nom="AeroPress"
    tailleNom={200}
    puces={["15 g de café", "200 ml d’eau", "88 °C"]}
    objet={{ vertical: { x: 540, y: 800, s: 1.1 }, paysage: { x: 1400, y: 320, s: 1 } }}
    sol={{ vertical: 1250, paysage: 760 }}
    goutte={{ dx: 0, dy: FOND + 24 }}
    dessin={({ x, y, s, trace }) => <AeroComplete x={x} y={y} s={s} trace={trace} />}
  />
);

export const AeroMateriel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Une AeroPress",
        detail: "et son piston",
        dessin: ({ x, base, trace }) => (
          <AeroComplete x={x} y={base - (FOND + 20) * 0.5} s={0.5} trace={trace} joint={150} />
        ),
      },
      {
        titre: "Un filtre",
        detail: "papier rond",
        dessin: ({ x, base, trace }) => <FiltresRonds x={x} y={base - 80} s={0.95} trace={trace} />,
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
    ]}
  />
);

export const AeroEau: React.FC = () => <EauMethode temperature={88} sous="pour la recette standard" />;

export const AeroPreparer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Préparer">
      <PosteAero e={etatPreparer(frame)} />
      <Sequence name="Rincer" durationInFrames={92} layout="none">
        <Legende puce="ÉTAPE 2" titre="Rincer le filtre" sous="puis visser le chapeau" duree={92} />
      </Sequence>
      <Sequence name="Poser" from={88} durationInFrames={PREPARER_DUREE - 88} layout="none">
        <Legende puce="ÉTAPE 2" titre="Sur la tasse" sous="ou un récipient solide" duree={PREPARER_DUREE - 88} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const AeroCafe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Café">
      <PosteAero e={etatCafe(frame)} />
      <Legende puce="ÉTAPE 3" titre={"15 g de café"} sous="mouture médium, comme du sel fin" duree={CAFE_DUREE} />
    </AbsoluteFill>
  );
};

export const AeroBloom: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Bloom">
      <PosteAero e={etatBloom(frame)} />
      <Sequence name="50 ml" durationInFrames={62} layout="none">
        <Legende puce="ÉTAPE 4" titre={"Verser 50 ml"} sous={"d’eau à 88 °C"} duree={62} />
      </Sequence>
      <Sequence name="Agiter" from={58} durationInFrames={60} layout="none">
        <Legende puce="ÉTAPE 4" titre="Agiter 5 fois" duree={60} />
      </Sequence>
      <Sequence name="30 s" from={114} durationInFrames={BLOOM_DUREE - 114} layout="none">
        <Legende puce="ÉTAPE 4" titre={"Attendre 30 s"} sous="c’est le bloom" duree={BLOOM_DUREE - 114} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const AeroInfusion: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Infusion">
      <PosteAero e={etatInfusion(frame)} />
      <Legende puce="ÉTAPE 5" titre={"Jusqu’à 200 ml"} sous={"puis attendre 60 s"} duree={INFUSION_DUREE} />
    </AbsoluteFill>
  );
};

export const AeroPiston: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Piston">
      <PosteAero e={etatPiston(frame)} />
      <Legende
        puce="ÉTAPE 6"
        titre={"Appuyer 20 à 30 s"}
        taille={100}
        sous="jusqu’au premier sifflement"
      />
    </AbsoluteFill>
  );
};

export const AeroDiagnostic: React.FC = () => (
  <DiagnosticMethode
    titre={"Trop acide, trop amer ?"}
    sous="un cran à la fois, une seule variable"
    graduations={["acide", "", "", "", "amer"]}
    fenetre="équilibré"
    gauche={{ titre: "Trop acide ?", verbe: "moudre", accent: "plus fin" }}
    droite={{ titre: "Trop amer ?", verbe: "moudre", accent: "plus gros" }}
  />
);

export const AeroFin: React.FC = () => (
  <FinMethode
    titre="La recette AeroPress"
    lignes={[
      { l: "Café", v: "15 g, mouture médium" },
      { l: "Eau", v: "200 ml à 88 °C" },
      { l: "Bloom", v: "50 ml, 5 tours, 30 s" },
      { l: "Infusion", v: "200 ml, 60 s de plus" },
      { l: "Piston", v: "20 à 30 s" },
    ]}
    url="filtre.cafe/journal/aeropress-guide-complet"
  />
);

export const DUREES_AERO = { PREPARER_DUREE, CAFE_DUREE, BLOOM_DUREE, INFUSION_DUREE, PISTON_DUREE };
