import { Balance } from "../dessins/Balance";
import { Bouilloire, pointeBec } from "../dessins/Bouilloire";
import { EtatPress, FrenchPress, HAUT, yEau } from "../dessins/FrenchPress";
import { CadrePoste, ChuteMouture, CompteARebours, Filet, Repere } from "../dessins/Poste";
import { Trace, arcAvant, ellipse } from "../dessins/Trace";
import { C, prog } from "../theme";

// Poste « cafetière à piston » : la cafetière posée sur la balance, une tasse
// qui arrive à gauche pour le service.
export const PRESS = {
  s: 1.2,
  x: 560,
  y: 1318, // fond du bécher
  bouilloireRepos: { x: 900, y: 772, angle: 0 },
  bouilloireDehors: { x: 1600, y: 700, angle: 8 },
};
const S = PRESS.s;

export type EtatPoste = {
  frame: number;
  bouilloire: { x: number; y: number; angle: number };
  filet: { tete: number; queue: number } | null;
  impactX: number;
  traine?: number;
  poids: number | null;
  temps: number | null;
  tare?: number;
  press: Omit<EtatPress, "frame">;
  dx?: number; // secousse
  mouture?: number;
  tasse?: { trace: number; niveau: number } | null;
  service?: number; // 0 → 1 : filet du bec vers la tasse
  vidage?: number; // 0 → 1 : filet du bec vers l'évier (préchauffage)
  repere?: { lignes: string[]; y: number; visible: number } | null;
  attente?: { restant: number; p: number; visible: number; libelle?: string; minutes?: boolean } | null;
  camera?: { s: number; x: number; y: number };
};

// Tasse en céramique. Repère : centre du fond.
const Tasse: React.FC<{ x: number; y: number; trace: number; niveau: number }> = ({ x, y, trace, niveau }) => {
  const t = (a: number, b: number) => prog(trace, a, b);
  const remplir = prog(trace, 0.6, 1);
  const corps = "M -78 -118 C -78 -40 -56 0 0 0 C 56 0 78 -40 78 -118";
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -74 -96 C -122 -96 -126 -40 -70 -36" fill="none" stroke={C.crema} strokeWidth={9} opacity={remplir} />
      <path d="M -74 -96 C -122 -96 -126 -40 -70 -36" fill="none" stroke={C.corps} strokeWidth={3} opacity={remplir} />
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

const TASSE = { x: 262, y: 1318 };

// Position du bec dans l'image, cafetière penchée.
const bec = (inclinaison: number, dx: number) => {
  const a = (inclinaison * Math.PI) / 180;
  const lx = -110 - 18;
  const ly = -HAUT - 14;
  // rotation autour du coin bas gauche (-110, 0)
  const rx = -110 + (lx + 110) * Math.cos(a) - ly * Math.sin(a);
  const ry = (lx + 110) * Math.sin(a) + ly * Math.cos(a);
  return { x: PRESS.x + dx + rx * S, y: PRESS.y + ry * S };
};

export const PostePress: React.FC<{ e: EtatPoste }> = ({ e }) => {
  const { frame } = e;
  const sB = 0.92;
  const dx = e.dx ?? 0;
  const pointe = pointeBec(e.bouilloire.x, e.bouilloire.y, e.bouilloire.angle, sB);
  const p = e.press;
  const surface = p.eau > 0.003 ? yEau(p.eau) : -p.lit * 26;
  const impact = { x: PRESS.x + dx + e.impactX, y: PRESS.y + surface * S };
  const etat: EtatPress = { ...p, frame };
  const b = bec(p.inclinaison, dx);
  const service = e.service ?? 0;
  const vidage = e.vidage ?? 0;
  return (
    <CadrePoste camera={e.camera} surcouche={e.attente ? <CompteARebours {...e.attente} /> : null}>
      <Balance x={540} y={1330} poids={e.poids} temps={e.temps} tare={e.tare ?? 0} />
      {e.tasse ? <Tasse x={TASSE.x} y={TASSE.y} trace={e.tasse.trace} niveau={e.tasse.niveau} /> : null}
      <FrenchPress x={PRESS.x + dx} y={PRESS.y} s={S} e={etat} couche="arriere" />
      {e.mouture !== undefined ? (
        <ChuteMouture p={e.mouture} x={PRESS.x} yFond={PRESS.y - Math.max(0.05, p.lit) * 26 * S} largeur={110} />
      ) : null}
      {e.filet ? <Filet de={pointe} vers={impact} traine={e.traine} tete={e.filet.tete} queue={e.filet.queue} /> : null}
      <FrenchPress x={PRESS.x + dx} y={PRESS.y} s={S} e={etat} couche="avant" />
      {service > 0.01 ? (
        <path
          d={`M ${b.x} ${b.y} Q ${b.x - 40} ${b.y + 40} ${TASSE.x + 10} ${TASSE.y - 112}`}
          fill="none"
          stroke="#8a4b22"
          strokeWidth={9}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${Math.min(1, service * 3)} 2`}
          opacity={Math.min(1, (1 - service) * 6)}
        />
      ) : null}
      {vidage > 0.01 ? (
        <path
          d={`M ${b.x} ${b.y} Q ${b.x - 60} ${b.y + 30} ${b.x - 80} ${b.y + 260}`}
          fill="none"
          stroke="#e8d8c0"
          strokeWidth={8}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${Math.min(1, vidage * 3)} 2`}
          opacity={Math.min(1, (1 - vidage) * 6) * 0.8}
        />
      ) : null}
      {e.repere ? (
        <Repere x0={PRESS.x + 116 * S} y={PRESS.y + e.repere.y * S} lignes={e.repere.lignes} visible={e.repere.visible} taille={58} />
      ) : null}
      <Bouilloire x={e.bouilloire.x} y={e.bouilloire.y} angle={e.bouilloire.angle} s={sB} />
    </CadrePoste>
  );
};
