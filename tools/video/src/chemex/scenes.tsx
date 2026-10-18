import { AbsoluteFill, Sequence, random, useCurrentFrame } from "remotion";
import { Balance } from "../dessins/Balance";
import { Bouilloire } from "../dessins/Bouilloire";
import { Chemex } from "../dessins/Chemex";
import { Dripper } from "../dessins/Dripper";
import { usePaysage } from "../format";
import { AfficheMethode } from "../scenes/AfficheMethode";
import { DiagnosticMethode } from "../scenes/DiagnosticMethode";
import { EauMethode } from "../scenes/EauMethode";
import { EpingleMethode } from "../scenes/EpingleMethode";
import { FinMethode } from "../scenes/FinMethode";
import { MaterielMethode } from "../scenes/MaterielMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { C, SANS, SERIF, SORTIE, cles, prog } from "../theme";
import { Legende } from "../ui/Legende";
import { PosteChemex } from "./PosteChemex";
import {
  BLOOM_DUREE,
  CAFE_A,
  ECOULEMENT_DUREE,
  ETAPES,
  FILTRE_DUREE,
  RINCER_A,
  SERVIR_A,
  SERVIR_DUREE,
  VERSEMENTS_DUREE,
  etatBloom,
  etatEcoulement,
  etatFiltre,
  etatServir,
  etatVersements,
} from "./etats";

// Chemex : tout ce qui est dit ici vient de l'article chemex-guide-complet.
const NB = "\u202F";
const VERT = C.feuille;

// La Chemex garnie : verre, filtre, lit de café, café dans le bas.
export const ChemexGarnie: React.FC<{
  x: number;
  y: number; // centre du bord
  s: number;
  trace?: number;
  papier?: number;
  lit?: number;
  niveau?: number;
}> = ({ x, y, s, trace = 1, papier = 1, lit = 0, niveau = 0 }) => (
  <g>
    <Chemex x={x} y={y} s={s} trace={trace} niveau={niveau} couche="arriere" />
    {papier > 0 ? (
      <>
        <Dripper x={x} y={y} s={s} corps={false} trace={trace} papier={papier} papierMouille={lit > 0 ? 1 : 0} lit={lit} couche="arriere" />
        <Dripper x={x} y={y} s={s} corps={false} trace={trace} papier={papier} papierMouille={lit > 0 ? 1 : 0} lit={lit} couche="avant" />
        <g transform={`translate(${x} ${y}) scale(${s})`} opacity={papier * prog(trace, 0.5, 1)}>
          <path d="M -181 -24 L -26 238 L -14 236 L -150 -27 Z" fill={lit > 0 ? "rgb(226,196,160)" : C.papier} opacity={0.42} />
          <path d="M -150 -27 L -14 236" fill="none" stroke={lit > 0 ? "rgb(226,196,160)" : C.papier} strokeWidth={2.5} opacity={0.7} />
        </g>
      </>
    ) : null}
    <Chemex x={x} y={y} s={s} trace={trace} niveau={niveau} couche="avant" />
  </g>
);

export const ChemexTitre: React.FC = () => (
  <TitreMethode
    nom="Chemex"
    tailleNom={230}
    puces={[`45${NB}g de café`, `750${NB}g d’eau`, `4 à 5${NB}min`]}
    objet={{ vertical: { x: 540, y: 1292, s: 0.78 }, paysage: { x: 1440, y: 866, s: 0.62 } }}
    sol={{ vertical: 1294, paysage: 868 }}
    dessin={({ x, y, s, trace, frame }) => (
      <ChemexGarnie x={x} y={y - 600 * s} s={s} trace={trace} papier={prog(trace, 0.5, 0.9)} lit={prog(frame, 50, 70)} niveau={cles(frame, [[64, 0], [104, 0.8]])} />
    )}
  />
);

// Dessins en coordonnées verticales ; en paysage, dans la moitié droite.
const Dessin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const paysage = usePaysage();
  return (
    <svg
      width={paysage ? 1920 : 1080}
      height={paysage ? 1080 : 1920}
      viewBox={paysage ? "0 0 1920 1080" : "0 0 1080 1920"}
      style={{ position: "absolute", inset: 0 }}
    >
      <g transform={paysage ? "translate(850 -560)" : undefined}>{children}</g>
    </svg>
  );
};

// ── Le filtre : plus lourd, il retient huiles et fines ──────────────────────
export const PRINCIPE_DUREE = 200;
const BASCULE = 100;
const X0 = 150;
const L = 520; // 100 % : le papier d'un V60
const BANDE = { x0: 170, x1: 910, y: 1150, h: 44 };
const VERRE = { x: 540, haut: 1400, bas: 1590 };
type Particule = { type: "eau" | "huile" | "fine"; x: number; d: number; y0: number };
const PARTICULES: Particule[] = Array.from({ length: 46 }).map((_, i) => {
  const r = random(`chx-p-${i}`);
  return {
    type: r < 0.56 ? "eau" : r < 0.78 ? "huile" : "fine",
    x: BANDE.x0 + 30 + random(`chx-x-${i}`) * (BANDE.x1 - BANDE.x0 - 60),
    d: BASCULE + 8 + random(`chx-d-${i}`) * 58,
    y0: 960 + random(`chx-y-${i}`) * 50,
  };
});
const NB_EAU = PARTICULES.filter((p) => p.type === "eau").length;

export const ChemexPrincipe: React.FC = () => {
  const f = useCurrentFrame();
  const a = 1 - prog(f, BASCULE - 12, BASCULE);
  const b = prog(f, BASCULE, BASCULE + 12);
  const p1 = prog(f, 12, 38, SORTIE);
  const p2 = prog(f, 26, 60, SORTIE);
  const plage = prog(f, 58, 74, SORTIE);
  const repere = prog(f, 50, 62);
  const bande = prog(f, BASCULE + 2, BASCULE + 16, SORTIE);
  const verre = prog(f, BASCULE + 10, BASCULE + 24, SORTIE);
  let arrivees = 0;
  const elems: React.ReactNode[] = [];
  PARTICULES.forEach((p, i) => {
    const t = f - p.d;
    if (t <= 0) return;
    const yBande = BANDE.y - (p.type === "huile" ? 11 : 6);
    const descente = Math.min(1, t / 20);
    const y1 = p.y0 + (yBande - p.y0) * descente * descente;
    if (p.type === "eau") {
      // L'eau traverse le papier, puis tombe dans le verre.
      if (t <= 20) {
        elems.push(<ellipse key={i} cx={p.x} cy={y1} rx={6.5} ry={10} fill="#e8d8c0" opacity={0.85} />);
        return;
      }
      const tt = t - 20;
      if (tt < 8) {
        elems.push(<ellipse key={i} cx={p.x} cy={BANDE.y + (tt / 8) * BANDE.h} rx={4} ry={6} fill="#d9a066" opacity={0.6} />);
        return;
      }
      const q = Math.min(1, (tt - 8) / 18);
      const xv = p.x + (VERRE.x - p.x) * q;
      const yv = BANDE.y + BANDE.h + (VERRE.haut + 30 - BANDE.y - BANDE.h) * q * q;
      if (q < 1) {
        elems.push(<ellipse key={i} cx={xv} cy={yv} rx={6.5} ry={10} fill="#c98a4a" opacity={0.9} />);
      } else {
        arrivees += 1;
      }
      return;
    }
    // Huiles et fines restent sur le papier.
    if (p.type === "huile") {
      elems.push(<circle key={i} cx={p.x} cy={y1} r={11} fill="#d9a24a" stroke="#f3dcbc" strokeWidth={2} opacity={0.95} />);
    } else {
      elems.push(<circle key={i} cx={p.x} cy={y1} r={6.5} fill="#2a140a" stroke="#7a4a2a" strokeWidth={1.5} />);
    }
  });
  const plein = arrivees / NB_EAU;
  const libelles = prog(f, BASCULE + 40, BASCULE + 54, SORTIE);
  return (
    <AbsoluteFill name="Principe">
      <Sequence name="Poids" durationInFrames={BASCULE} layout="none">
        <Legende puce="LE FILTRE" titre="Un papier épais" sous={`de 20 à 30${NB}% plus lourd que celui d’un V60`} duree={BASCULE} />
      </Sequence>
      <Sequence name="Tasse" from={BASCULE - 2} durationInFrames={PRINCIPE_DUREE - BASCULE + 2} layout="none">
        <Legende puce="DANS LA TASSE" puceFond={VERT} titre="Limpide et légère" sous="il retient les huiles et les particules fines" accent={["Limpide"]} />
      </Sequence>
      <Dessin>
        {a > 0 ? (
          <g opacity={a}>
            <text x={X0} y={1040} style={{ fontFamily: SANS, fontSize: 32, letterSpacing: "0.08em" }} fill={C.crema} opacity={0.7 * p1}>
              POIDS DU FILTRE
            </text>
            <text x={X0} y={1112} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44 }} fill={C.creme} opacity={p1}>
              V60
            </text>
            <rect x={X0} y={1132} width={Math.max(1, L * p1)} height={66} rx={14} fill={C.papier} opacity={0.9} />
            <text x={X0} y={1302} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44 }} fill={C.creme} opacity={p2}>
              Chemex
            </text>
            <rect x={X0} y={1322} width={Math.max(1, L * 1.2 * p2)} height={66} rx={14} fill={C.papier} opacity={0.9} />
            <rect x={X0 + L * 1.2 - 14} y={1322} width={L * 0.1 + 14} height={66} rx={14} fill={C.papier} opacity={0.38 * plage} />
            <line x1={X0 + L} y1={1112} x2={X0 + L} y2={1414} stroke={C.crema} strokeWidth={3} strokeDasharray="10 9" opacity={0.7 * repere} />
            <g opacity={plage} transform={`translate(0 ${(1 - plage) * 20})`}>
              <path
                d={`M ${X0 + L} 1414 L ${X0 + L} 1430 L ${X0 + L * 1.3} 1430 L ${X0 + L * 1.3} 1414`}
                fill="none"
                stroke={C.crema}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <text x={X0 + L * 1.15} y={1520} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 84 }} fill={C.creme}>
                {`+20 à 30${NB}%`}
              </text>
            </g>
          </g>
        ) : null}
        {b > 0 ? (
          <g opacity={b}>
            {/* Le papier en coupe */}
            <g opacity={bande} transform={`translate(0 ${(1 - bande) * 20})`}>
              <rect x={BANDE.x0} y={BANDE.y} width={BANDE.x1 - BANDE.x0} height={BANDE.h} rx={10} fill={C.papier} opacity={0.92} />
              {Array.from({ length: 30 }).map((_, k) => {
                const fx = BANDE.x0 + 16 + k * 24.5;
                const fy = BANDE.y + 8 + (k % 3) * 9;
                return <path key={k} d={`M ${fx} ${fy} q 8 -5 16 0`} fill="none" stroke="#c9ab86" strokeWidth={2} opacity={0.7} />;
              })}
            </g>
            {elems}
            {/* Le verre qui reçoit la tasse */}
            <g opacity={verre}>
              <clipPath id="chx-verre">
                <path d={`M ${VERRE.x - 120} ${VERRE.haut} L ${VERRE.x - 96} ${VERRE.bas} L ${VERRE.x + 96} ${VERRE.bas} L ${VERRE.x + 120} ${VERRE.haut} Z`} />
              </clipPath>
              <g clipPath="url(#chx-verre)">
                <rect
                  x={VERRE.x - 130}
                  y={VERRE.bas - (VERRE.bas - VERRE.haut - 24) * plein}
                  width={260}
                  height={VERRE.bas - VERRE.haut}
                  fill="#b8742f"
                  opacity={0.55}
                />
              </g>
              <path
                d={`M ${VERRE.x - 120} ${VERRE.haut} L ${VERRE.x - 96} ${VERRE.bas} L ${VERRE.x + 96} ${VERRE.bas} L ${VERRE.x + 120} ${VERRE.haut}`}
                fill="none"
                stroke={C.crema}
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path d={`M ${VERRE.x + 84} ${VERRE.haut + 30} L ${VERRE.x + 70} ${VERRE.bas - 30}`} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.14} />
            </g>
            <g opacity={libelles}>
              <text x={BANDE.x0} y={1100} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 54 }} fill="#e9b765">
                huiles
              </text>
              <text x={BANDE.x1} y={1100} textAnchor="end" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 54 }} fill={C.crema}>
                fines
              </text>
            </g>
          </g>
        ) : null}
      </Dessin>
    </AbsoluteFill>
  );
};

export const ChemexMateriel: React.FC = () => (
  <MaterielMethode
    cases={[
      {
        titre: "Une Chemex",
        detail: "6 tasses",
        dessin: ({ x, base, trace }) => <ChemexGarnie x={x} y={base - 600 * 0.4} s={0.4} trace={trace} papier={0} />,
      },
      {
        titre: "Des filtres",
        detail: "Chemex, pas V60",
        dessin: ({ x, base, trace }) => (
          <g>
            <Dripper x={x + 6} y={base - 240 * 0.62} s={0.62} corps={false} trace={trace} papier={trace} couche="tout" />
            <g transform={`translate(${x + 6} ${base - 240 * 0.62}) scale(0.62)`} opacity={prog(trace, 0.5, 1)}>
              <path d="M -181 -24 L -26 238 L -14 236 L -150 -27 Z" fill={C.papier} opacity={0.5} />
              <path d="M -150 -27 L -14 236" fill="none" stroke={C.papier} strokeWidth={3} opacity={0.8} />
            </g>
          </g>
        ),
      },
      {
        titre: "Une balance",
        detail: "avec chronomètre",
        dessin: ({ x, base, trace }) => <Balance x={x} y={base - 150 * 0.62} s={0.62} trace={trace} poids={0} temps={0} />,
      },
      {
        titre: "Une bouilloire",
        detail: "col de cygne, 1 l",
        dessin: ({ x, base, trace }) => <Bouilloire x={x + 45} y={base - 80 * 0.68} s={0.68} trace={trace} />,
      },
    ]}
  />
);

export const ChemexEau: React.FC = () => <EauMethode puce="L’EAU" temperature={94} sous={`93 à 96${NB}°C pour une torréfaction claire`} />;

export const ChemexFiltre: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Filtre">
      <PosteChemex e={etatFiltre(frame)} />
      <Sequence name="Poser" durationInFrames={RINCER_A + 4} layout="none">
        <Legende puce="LE FILTRE" titre="Côté triple contre le bec" sous="l’air sort pendant que le café descend" duree={RINCER_A + 4} taille={104} />
      </Sequence>
      <Sequence name="Rincer" from={RINCER_A} durationInFrames={CAFE_A - RINCER_A + 4} layout="none">
        <Legende puce="LE FILTRE" titre="Rincer, puis vider" sous="par le bec, filtre en place" duree={CAFE_A - RINCER_A + 4} />
      </Sequence>
      <Sequence name="Café" from={CAFE_A} durationInFrames={FILTRE_DUREE - CAFE_A} layout="none">
        <Legende puce="LE CAFÉ" titre={`Verser les 45${NB}g`} sous="égaliser le lit, puis tarer à zéro" duree={FILTRE_DUREE - CAFE_A} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const ChemexBloom: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Bloom">
      <PosteChemex e={etatBloom(frame)} />
      <Legende puce="BLOOM" titre={`90${NB}g d’eau`} sous={`deux fois le poids du café, puis 30${NB}s`} duree={BLOOM_DUREE} />
    </AbsoluteFill>
  );
};

export const ChemexVersements: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Versements">
      <PosteChemex e={etatVersements(frame)} />
      <Sequence name="450 g" durationInFrames={ETAPES[1] + 2} layout="none">
        <Legende puce={`APRÈS 30${NB}S`} titre={`Jusqu’à 450${NB}g`} sous="en spirales régulières" duree={ETAPES[1] + 2} />
      </Sequence>
      <Sequence name="600 g" from={ETAPES[1]} durationInFrames={ETAPES[2] - ETAPES[1] + 2} layout="none">
        <Legende puce="PALIER 2" titre={`Puis 600${NB}g`} sous="l’eau toujours sous le bord du filtre" duree={ETAPES[2] - ETAPES[1] + 2} />
      </Sequence>
      <Sequence name="750 g" from={ETAPES[2]} durationInFrames={VERSEMENTS_DUREE - ETAPES[2]} layout="none">
        <Legende puce="PALIER 3" titre={`Puis 750${NB}g`} sous="et c’est tout pour l’eau" duree={VERSEMENTS_DUREE - ETAPES[2]} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const ChemexEcoulement: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Écoulement">
      <PosteChemex e={etatEcoulement(frame)} />
      <Legende puce="ÉCOULEMENT" titre={`4 à 5${NB}min au total`} sous="bloom compris" duree={ECOULEMENT_DUREE} />
    </AbsoluteFill>
  );
};

export const ChemexServir: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Servir">
      <PosteChemex e={etatServir(frame)} />
      <Sequence name="Filtre" durationInFrames={SERVIR_A + 4} layout="none">
        <Legende puce="C’EST PRÊT" titre="Retirer le filtre" duree={SERVIR_A + 4} />
      </Sequence>
      <Sequence name="Servir" from={SERVIR_A} durationInFrames={SERVIR_DUREE - SERVIR_A} layout="none">
        <Legende puce="C’EST PRÊT" puceFond={VERT} titre="Servir" sous="pour deux ou trois personnes" />
      </Sequence>
    </AbsoluteFill>
  );
};

export const ChemexDiagnostic: React.FC = () => (
  <DiagnosticMethode
    titre="Regardez le chrono"
    sous={`avant de goûter\u00a0: finir entre 4 et 5${NB}min`}
    graduations={["3:30", "4:00", "4:30", "5:00", "5:30"]}
    fenetre="la bonne fenêtre"
    gauche={{ titre: "Moins de 4\u00a0min\u202f?", verbe: "moudre", accent: "plus fin" }}
    droite={{ titre: "Plus de 5\u00a0min\u202f?", verbe: "moudre", accent: "plus gros" }}
  />
);

export const ChemexFin: React.FC = () => (
  <FinMethode
    titre="La recette Chemex"
    lignes={[
      { l: "Café", v: `45${NB}g, médium-grossière` },
      { l: "Eau", v: `750${NB}g à 94${NB}°C` },
      { l: "Bloom", v: `90${NB}g, 30${NB}s` },
      { l: "Paliers", v: `450, 600, 750${NB}g` },
      { l: "Temps", v: `4 à 5${NB}min au total` },
    ]}
    url="filtre.cafe/journal/chemex-guide-complet"
  />
);

const PUCES = [`45${NB}g de café`, `750${NB}g d’eau`, `4 à 5${NB}min`];
const posteAffiche = <PosteChemex e={{ ...etatVersements(52), cible: null, spirale: null }} descente={false} />;
export const ChemexAffiche: React.FC = () => (
  <AfficheMethode format="paysage" nom="Chemex" tailleNom={{ paysage: 236, vertical: 240 }} puces={PUCES} poste={posteAffiche} />
);
export const ChemexAfficheVerticale: React.FC = () => (
  <AfficheMethode format="vertical" nom="Chemex" tailleNom={{ paysage: 236, vertical: 240 }} puces={PUCES} poste={posteAffiche} />
);
export const EpingleChemex: React.FC = () => (
  <EpingleMethode nom="Chemex" tailleNom={220} accroche="Un filtre épais, une tasse limpide" puces={PUCES} poste={posteAffiche} />
);

export const DUREES_CHEMEX = { PRINCIPE_DUREE, FILTRE_DUREE, BLOOM_DUREE, VERSEMENTS_DUREE, ECOULEMENT_DUREE, SERVIR_DUREE };
