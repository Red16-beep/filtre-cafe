import { ChambreAero, Chapeau, FOND, Piston, hautLit, niveauAero } from "../dessins/AeroPress";
import { Balance } from "../dessins/Balance";
import { Bouilloire, pointeBec } from "../dessins/Bouilloire";
import { Carafe, surfaceCarafe } from "../dessins/Carafe";
import { CadrePoste, ChuteMouture, CompteARebours, Compteur, Filet, Gouttes, Repere } from "../dessins/Poste";
import { arcAvant } from "../dessins/Trace";
import { C } from "../theme";

// Poste AeroPress : balance, carafe, AeroPress posée dessus (méthode standard).
export const AERO = {
  s: 1,
  x: 540,
  y: 828, // haut de la chambre ; la collerette repose sur la carafe
  bouilloireRepos: { x: 900, y: 772, angle: 0 },
  bouilloireDehors: { x: 1600, y: 700, angle: 8 },
};
const S = AERO.s;
export const yAbs = (local: number) => AERO.y + local * S;

export type EtatAero = {
  frame: number;
  bouilloire: { x: number; y: number; angle: number };
  filet: { tete: number; queue: number } | null;
  impactX: number;
  impactY?: number; // impact imposé (rinçage du chapeau seul)
  traine?: number;
  goutteY0?: number; // départ des gouttes imposé (chapeau seul)
  poids: number;
  temps: number | null;
  tare?: number;
  cafe: number;
  eau: number;
  remous?: number;
  carafe: number;
  gouttes: number;
  mouture?: number;
  // assemblage : la chambre et le chapeau arrivent (décalage vertical)
  chambreDy?: number;
  chambreTrace?: number; // la chambre se dessine sur place
  pistonTrace?: number;
  chapeau?: { dy: number; rotation: number; filtre: number; mouille: number } | null;
  agitateur?: { visible: number; phase: number } | null;
  piston?: { joint: number; visible: number } | null; // joint : repère local de la chambre
  sifflement?: number;
  repere?: { lignes: string[]; y: number; visible: number } | null; // y : repère local de la chambre
  attente?: { restant: number; p: number; visible: number } | null;
  compteur?: { valeur: string; libelle: string; visible: number } | null;
  camera?: { s: number; x: number; y: number };
};

// Spatule plate, vue de face. Repère : le bas de la pale.
const Agitateur: React.FC<{ x: number; y: number; angle: number; opacite: number }> = ({ x, y, angle, opacite }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacite}>
    <path d="M -6 -330 L -6 -70 L 6 -70 L 6 -330 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
    <path
      d="M -22 -76 Q -22 -82 -16 -82 L 16 -82 Q 22 -82 22 -76 L 22 -8 Q 22 0 14 0 L -14 0 Q -22 0 -22 -8 Z"
      fill={C.corps}
      stroke={C.crema}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </g>
);

export const PosteAero: React.FC<{ e: EtatAero }> = ({ e }) => {
  const { frame } = e;
  const sB = 0.92;
  const dyC = e.chambreDy ?? 0;
  const pointe = pointeBec(e.bouilloire.x, e.bouilloire.y, e.bouilloire.angle, sB);
  const surfaceLocale = e.eau > 0.003 ? niveauAero(e.cafe, e.eau) : e.cafe > 0.001 ? hautLit(e.cafe) : FOND;
  const impact = { x: AERO.x + e.impactX, y: e.impactY ?? yAbs(surfaceLocale) + dyC };
  const sortieY = yAbs(FOND + 18) + dyC;
  const ag = e.agitateur;
  const phaseAg = ag ? Math.sin(ag.phase * 2 * Math.PI) : 0;
  const jointLocal = e.piston ? e.piston.joint : null;
  const sif = e.sifflement ?? 0;

  return (
    <CadrePoste
      camera={e.camera}
      surcouche={
        <>
          {e.attente ? <CompteARebours {...e.attente} /> : null}
          {e.compteur ? <Compteur {...e.compteur} /> : null}
        </>
      }
    >
      <Balance x={540} y={1330} poids={e.poids} temps={e.temps} tare={e.tare ?? 0} />
      <Carafe x={540} y={1318} niveau={e.carafe} teinte={1} />
      <Gouttes
        x={AERO.x}
        y0={e.goutteY0 ?? sortieY}
        y1={1318 + surfaceCarafe(e.carafe) - 4}
        intensite={dyC === 0 || e.goutteY0 !== undefined ? e.gouttes : 0}
        frame={frame}
      />
      {e.chapeau ? (
        <Chapeau
          x={AERO.x}
          y={yAbs(FOND - 6) + dyC + e.chapeau.dy}
          s={S}
          rotation={e.chapeau.rotation}
          filtre={e.chapeau.filtre}
        />
      ) : null}
      <ChambreAero
        x={AERO.x}
        y={AERO.y + dyC}
        s={S}
        trace={e.chambreTrace ?? 1}
        cafe={e.cafe}
        eau={e.eau}
        joint={jointLocal}
        remous={e.remous ?? 0}
        frame={frame}
        couche="arriere"
      />
      {e.mouture !== undefined ? (
        <ChuteMouture p={e.mouture} x={AERO.x} yFond={yAbs(hautLit(Math.max(0.05, e.cafe))) + dyC} largeur={90} />
      ) : null}
      {e.filet ? <Filet de={pointe} vers={impact} traine={e.traine} tete={e.filet.tete} queue={e.filet.queue} /> : null}
      {ag && ag.visible > 0.01 ? (
        <Agitateur
          x={AERO.x + phaseAg * 34}
          y={yAbs(hautLit(e.cafe) - 4) + dyC}
          angle={phaseAg * 9}
          opacite={ag.visible}
        />
      ) : null}
      {e.piston && e.piston.visible > 0.01 && jointLocal !== null ? (
        <g opacity={e.piston.visible}>
          <Piston x={AERO.x} y={yAbs(jointLocal) + dyC} s={S} trace={e.pistonTrace ?? 1} />
        </g>
      ) : null}
      <ChambreAero x={AERO.x} y={AERO.y + dyC} s={S} trace={e.chambreTrace ?? 1} cafe={e.cafe} eau={e.eau} frame={frame} couche="avant" />
      {/* le bord avant de la carafe passe devant le bas de l'AeroPress */}
      {dyC === 0 ? (
        <path d={arcAvant(540, 1128, 118, 15)} fill="none" stroke={C.crema} strokeWidth={4} strokeLinecap="round" />
      ) : null}
      {sif > 0.01
        ? [-1, 1].map((cote) =>
            [0, 1, 2].map((k) => {
              const q = (sif * 2.2 + k * 0.28) % 1;
              const r = 18 + q * 46;
              const cx = AERO.x + cote * 150;
              const cy = yAbs(FOND - 40) + dyC;
              return (
                <path
                  key={`${cote}-${k}`}
                  d={`M ${cx} ${cy - r * 0.7} Q ${cx + cote * r * 0.7} ${cy} ${cx} ${cy + r * 0.7}`}
                  fill="none"
                  stroke={C.creme}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  opacity={(1 - q) * Math.min(1, sif * 4)}
                />
              );
            }),
          )
        : null}
      {e.repere ? (
        <Repere x0={AERO.x + 104 * S} y={yAbs(e.repere.y) + dyC} lignes={e.repere.lignes} visible={e.repere.visible} taille={54} />
      ) : null}
      <Bouilloire x={e.bouilloire.x} y={e.bouilloire.y} angle={e.bouilloire.angle} s={sB} />
    </CadrePoste>
  );
};
