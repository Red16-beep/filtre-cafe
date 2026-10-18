import { Balance } from "../dessins/Balance";
import { Bouilloire, pointeBec } from "../dessins/Bouilloire";
import { BEC_CHEMEX, Chemex, surfaceBulbe } from "../dessins/Chemex";
import { Dripper, demi, hautDuLit, niveauEau } from "../dessins/Dripper";
import { CadrePoste, ChuteMouture, CompteARebours, Filet, Gouttes, Repere } from "../dessins/Poste";
import { EncartSpirale } from "../dessins/Station";
import { Trace, arcAvant, ellipse } from "../dessins/Trace";
import { usePaysage } from "../format";
import { C, prog } from "../theme";

// Poste Chemex : la Chemex sur la balance, le filtre papier dans son cône,
// la bouilloire à droite. Même balance, même bouilloire que le poste V60.
export const CHX = {
  x: 540,
  y: 802, // centre du bord du verre
  s: 0.86,
  bouilloireRepos: { x: 900, y: 700, angle: 0 },
  bouilloireDehors: { x: 1600, y: 640, angle: 8 },
  echelleBouilloire: 0.92,
  pointe: { x: 540, y: 722 }, // pointe du bec pendant le versement
};
const S = CHX.s;
// L'inclinaison se fait autour du col.
const PIVOT = { x: CHX.x, y: CHX.y + 250 * S };
const TASSE = { x: 248, y: 1318 };

export type EtatChemex = {
  frame: number;
  bouilloire: { x: number; y: number; angle: number };
  filet: { tete: number; queue: number } | null;
  impactX: number; // repère local du cône
  traine?: number;
  poids: number | null;
  temps: number | null;
  tare?: number;
  papier: number; // le filtre, 0 → 1
  papierDy?: number; // en pixels : le filtre descend dans le cône, ou en sort
  papierMouille: number;
  lit: number;
  dome: number;
  bulles: number;
  eau: number;
  niveau: number; // liquide dans le bas de la Chemex
  teinte: number; // 0 eau de rinçage, 1 café
  gouttes: number;
  mouture?: number;
  inclinaison?: number; // vider par le bec, servir
  leve?: number;
  vidage?: number; // filet d'eau qui sort du bec, 0 → 1
  tasse?: { trace: number; niveau: number } | null;
  service?: number; // filet de café vers la tasse, 0 → 1
  triple?: number; // repère « 3 épaisseurs »
  spirale?: { p: number; rMax: number; tours: number; finCentre: number; visible: number } | null;
  cible?: { texte: string; eau: number; visible: number } | null;
  note?: { lignes: string[]; y: number; visible: number } | null;
  attente?: { restant: number; p: number; visible: number; libelle?: string } | null;
  camera?: { s: number; x: number; y: number };
};

// Tasse en céramique, comme au poste piston. Repère : centre du fond.
const Tasse: React.FC<{ x: number; y: number; trace: number; niveau: number }> = ({ x, y, trace, niveau }) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const corps = "M -78 -118 C -78 -40 -56 0 0 0 C 56 0 78 -40 78 -118";
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M 74 -96 C 122 -96 126 -40 70 -36" fill="none" stroke={C.crema} strokeWidth={9} opacity={remplir} />
      <path d="M 74 -96 C 122 -96 126 -40 70 -36" fill="none" stroke={C.corps} strokeWidth={3} opacity={remplir} />
      <path d={`${corps} Z`} fill={C.corps} opacity={remplir} />
      {niveau > 0.01 ? (
        <ellipse cx={0} cy={-118 + 26 * (1 - niveau)} rx={70 - 6 * (1 - niveau)} ry={11} fill="#8a4b22" opacity={Math.min(1, niveau * 4)} />
      ) : null}
      <Trace d={corps} p={t(0, 0.6)} w={4.5} />
      <Trace d={ellipse(0, -118, 78, 13)} p={t(0.3, 0.8)} w={4} />
      <Trace d={arcAvant(0, 0, 40, 6)} p={t(0.5, 0.8)} w={3} o={0.6} />
    </g>
  );
};

// Point du repère local de la Chemex, une fois inclinée et levée.
const versImage = (lx: number, ly: number, inclinaison: number, leve: number) => {
  const a = (inclinaison * Math.PI) / 180;
  const x = CHX.x + lx * S - PIVOT.x;
  const y = CHX.y + ly * S - PIVOT.y;
  return {
    x: PIVOT.x + x * Math.cos(a) - y * Math.sin(a),
    y: PIVOT.y + x * Math.sin(a) + y * Math.cos(a) - leve,
  };
};

// En vertical, le poste descend sous la légende : la Chemex et sa bouilloire
// sont plus hautes que le V60.
const DESCENTE_VERTICALE = 120;

export const PosteChemex: React.FC<{ e: EtatChemex; descente?: boolean }> = ({ e, descente = true }) => {
  const { frame } = e;
  const paysage = usePaysage();
  const cam = e.camera ?? { s: 1, x: 0, y: 0 };
  const camera = { ...cam, y: cam.y + (paysage || !descente ? 0 : DESCENTE_VERTICALE) };
  const sB = CHX.echelleBouilloire;
  const pointe = pointeBec(e.bouilloire.x, e.bouilloire.y, e.bouilloire.angle, sB);
  const pdy = e.papierDy ?? 0;
  const surfaceLocale = e.eau > 0.004 ? niveauEau(e.lit, e.eau) : e.lit > 0.001 ? hautDuLit(e.lit, e.dome) : 236;
  const impact = { x: CHX.x + e.impactX * S, y: CHX.y + surfaceLocale * S };
  const niveauCible = e.cible ? niveauEau(e.lit, e.cible.eau) : 0;
  const incl = e.inclinaison ?? 0;
  const leve = e.leve ?? 0;
  const groupe = `translate(0 ${-leve}) rotate(${incl} ${PIVOT.x} ${PIVOT.y})`;
  const bec = versImage(BEC_CHEMEX.x, BEC_CHEMEX.y, incl, leve);
  const vidage = e.vidage ?? 0;
  const service = e.service ?? 0;
  const couleurPapier = e.papierMouille > 0 ? `rgba(226,196,160,${0.9 - e.papierMouille * 0.15})` : C.papier;
  const filtre = (couche: "arriere" | "avant") => (
    <Dripper
      x={CHX.x}
      y={CHX.y + pdy}
      s={S}
      corps={false}
      papier={e.papier}
      lit={e.lit}
      dome={e.dome}
      eau={e.eau}
      bulles={e.bulles}
      papierMouille={e.papierMouille}
      versementX={couche === "arriere" && e.filet && e.filet.tete > 0.98 && e.filet.queue < 0.02 ? e.impactX : null}
      frame={frame}
      couche={couche}
    />
  );
  return (
    <CadrePoste
      camera={camera}
      surcouche={
        <>
          {e.spirale ? <EncartSpirale {...e.spirale} frame={frame} /> : null}
          {e.attente ? <CompteARebours {...e.attente} /> : null}
        </>
      }
    >
      <Balance x={540} y={1330} poids={e.poids} temps={e.temps} tare={e.tare ?? 0} />
      {e.tasse ? <Tasse x={TASSE.x} y={TASSE.y} trace={e.tasse.trace} niveau={e.tasse.niveau} /> : null}
      <g transform={groupe}>
        <Chemex x={CHX.x} y={CHX.y} s={S} niveau={e.niveau} teinte={e.teinte} couche="arriere" inclinaison={incl} />
        <Gouttes
          x={CHX.x}
          y0={CHX.y + pdy + 240 * S}
          y1={CHX.y + surfaceBulbe(e.niveau) * S - 4}
          intensite={e.papier > 0.5 ? e.gouttes : 0}
          frame={frame}
          couleur={e.teinte > 0.5 ? "#9a5a2c" : "#e8d8c0"}
        />
        {e.papier > 0.01 ? filtre("arriere") : null}
      </g>
      {e.mouture !== undefined ? (
        <ChuteMouture p={e.mouture} x={CHX.x} yDepart={600} yFond={CHX.y + hautDuLit(Math.max(0.05, e.lit), 0) * S} />
      ) : null}
      {e.filet ? <Filet de={pointe} vers={impact} traine={e.traine} tete={e.filet.tete} queue={e.filet.queue} /> : null}
      <g transform={groupe}>
        {e.papier > 0.01 ? filtre("avant") : null}
        {/* Côté triple du filtre, contre le bec */}
        {e.papier > 0.01 ? (
          <g transform={`translate(${CHX.x} ${CHX.y + pdy}) scale(${S})`} opacity={e.papier}>
            <path d="M -181 -24 L -26 238 L -14 236 L -150 -27 Z" fill={couleurPapier} opacity={0.42} />
            <path d="M -150 -27 L -14 236" fill="none" stroke={couleurPapier} strokeWidth={2.5} opacity={0.7} />
            <path d="M -166 -26 L -20 237" fill="none" stroke={couleurPapier} strokeWidth={2} opacity={0.45} />
          </g>
        ) : null}
        <Chemex x={CHX.x} y={CHX.y} s={S} niveau={e.niveau} teinte={e.teinte} couche="avant" />
      </g>
      {vidage > 0.01 ? (
        <path
          d={`M ${bec.x} ${bec.y} Q ${bec.x - 50} ${bec.y + 20} ${bec.x - 70} ${bec.y + 520}`}
          fill="none"
          stroke="#e8d8c0"
          strokeWidth={8}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${Math.min(1, vidage * 3)} 2`}
          opacity={Math.min(1, (1 - vidage) * 6) * 0.8}
        />
      ) : null}
      {service > 0.01 ? (
        <path
          d={`M ${bec.x} ${bec.y} Q ${bec.x - 18} ${bec.y + 40} ${TASSE.x + 8} ${TASSE.y - 112}`}
          fill="none"
          stroke="#8a4b22"
          strokeWidth={9}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${Math.min(1, service * 3)} 2`}
          opacity={Math.min(1, (1 - service) * 6)}
        />
      ) : null}
      {e.triple ? (
        <Repere
          x0={CHX.x - 98 * S}
          y={CHX.y + 96 * S}
          lignes={["3 épaisseurs", "côté bec"]}
          visible={e.triple}
          taille={50}
          gauche
          limite={130}
        />
      ) : null}
      {e.cible ? (
        <Repere x0={CHX.x + (demi(niveauCible) + 10) * S} y={CHX.y + niveauCible * S} lignes={[e.cible.texte]} visible={e.cible.visible} />
      ) : null}
      {e.note ? (
        <Repere
          x0={CHX.x + (demi(e.note.y) + 8) * S}
          y={CHX.y + e.note.y * S}
          lignes={e.note.lignes}
          visible={e.note.visible}
          taille={54}
        />
      ) : null}
      <Bouilloire x={e.bouilloire.x} y={e.bouilloire.y} angle={e.bouilloire.angle} s={sB} />
    </CadrePoste>
  );
};
