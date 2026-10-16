import { Balance } from "../dessins/Balance";
import { Bocal, EtatBocal, Frigo, NIVEAU_BOCAL } from "../dessins/Bocal";
import { Carafe, surfaceCarafe } from "../dessins/Carafe";
import { Dripper, niveauEau } from "../dessins/Dripper";
import { CadrePoste, ChuteMouture, CompteARebours, Gouttes, Repere } from "../dessins/Poste";

// Poste cold brew : le bocal sur la balance, le pichet d'eau froide, le frigo,
// puis la filtration au papier dans un dripper posé sur une carafe.
export const FROID = { x: 540, y: 1318, s: 1.15 };

export type EtatFroid = {
  frame: number;
  poids: number | null;
  temps: number | null;
  tare?: number;
  balance: number; // opacité de la balance
  bocal: Omit<EtatBocal, "frame"> | null;
  bocalPos?: { x: number; y: number; s: number };
  mouture?: number;
  pichet?: { visible: number; angle: number; versement: number } | null; // versement : 0 → 1 (filet)
  frigo?: { trace: number; porte: number } | null;
  filtre?: { visible: number; eau: number; lit: number; carafe: number; gouttes: number; filet: number; dripper?: number } | null;
  repere?: { lignes: string[]; y: number; visible: number } | null; // y : repère local du bocal
  attente?: { restant: number; p: number; visible: number; libelle?: string; texte?: string } | null;
  camera?: { s: number; x: number; y: number };
};

// Pichet d'eau froide (la carafe, penchée) : position de son bec.
const PICHET = { x: 860, y: 900 };

export const PosteFroid: React.FC<{ e: EtatFroid }> = ({ e }) => {
  const { frame } = e;
  const pos = e.bocalPos ?? FROID;
  const b = e.bocal;
  const surface = b ? (b.eau > 0.003 ? -b.eau * NIVEAU_BOCAL : -b.marc * 62) : 0;
  const pi = e.pichet;
  // bec du pichet : bord gauche du col de la carafe, penchée autour de son fond
  const a = pi ? (pi.angle * Math.PI) / 180 : 0;
  const becLocal = { x: -118, y: -190 };
  const bec = {
    x: PICHET.x + becLocal.x * Math.cos(a) - becLocal.y * Math.sin(a),
    y: PICHET.y + becLocal.x * Math.sin(a) + becLocal.y * Math.cos(a),
  };
  const fi = e.filtre;
  // goulot du bocal penché (rotation autour du coin bas gauche)
  const ab = b ? (b.inclinaison * Math.PI) / 180 : 0;
  const goulot = {
    x: pos.x - 122 * pos.s + pos.s * (122 * Math.cos(ab) + 292 * Math.sin(ab)),
    y: pos.y + pos.s * (122 * Math.sin(ab) - 292 * Math.cos(ab)),
  };
  return (
    <CadrePoste camera={e.camera} surcouche={e.attente ? <CompteARebours {...e.attente} /> : null}>
      {e.frigo ? <Frigo x={FROID.x} y={FROID.y + 14} trace={e.frigo.trace} porte={e.frigo.porte} /> : null}
      {e.balance > 0.01 ? (
        <g opacity={e.balance}>
          <Balance x={540} y={1330} poids={e.poids} temps={e.temps} tare={e.tare ?? 0} />
        </g>
      ) : null}
      {fi && fi.visible > 0.01 ? (
        <g opacity={fi.visible}>
          <Carafe x={540} y={1318} niveau={fi.carafe} teinte={1} />
          <Gouttes x={540} y0={884 + 246} y1={1318 + surfaceCarafe(fi.carafe) - 4} intensite={fi.gouttes} frame={frame} />
          <g opacity={fi.dripper ?? 1}>
            <Dripper x={540} y={884} lit={fi.lit} eau={fi.eau} papierMouille={1} frame={frame} couche="arriere" />
          </g>
          {fi.filet > 0.01 ? (
            <path
              d={`M ${goulot.x} ${goulot.y} Q ${goulot.x - 4} ${goulot.y + 60} 540 ${884 + niveauEau(fi.lit, fi.eau)}`}
              fill="none"
              stroke="#5e2f14"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={Math.min(1, fi.filet * 3)}
            />
          ) : null}
          <g opacity={fi.dripper ?? 1}>
            <Dripper x={540} y={884} lit={fi.lit} eau={fi.eau} papierMouille={1} frame={frame} couche="avant" />
          </g>
        </g>
      ) : null}
      {b ? <Bocal x={pos.x} y={pos.y} s={pos.s} e={{ ...b, frame }} couche="arriere" /> : null}
      {e.mouture !== undefined && b ? (
        <ChuteMouture p={e.mouture} x={pos.x} yFond={pos.y - Math.max(0.05, b.marc) * 62 * pos.s} largeur={130} yDepart={700} />
      ) : null}
      {pi && pi.visible > 0.01 && pi.versement > 0.01 ? (
        <path
          d={`M ${bec.x} ${bec.y} Q ${bec.x - 60} ${bec.y + 40} ${pos.x + 20} ${pos.y + surface * pos.s}`}
          fill="none"
          stroke="#e8eef0"
          strokeWidth={11}
          strokeLinecap="round"
          opacity={0.75 * Math.min(1, pi.versement * 4) * Math.min(1, (1 - pi.versement) * 8)}
        />
      ) : null}
      {b ? <Bocal x={pos.x} y={pos.y} s={pos.s} e={{ ...b, frame }} couche="avant" /> : null}
      {pi && pi.visible > 0.01 ? (
        <g opacity={pi.visible} transform={`rotate(${pi.angle} ${PICHET.x} ${PICHET.y})`}>
          <Carafe x={PICHET.x} y={PICHET.y} s={1} niveau={0} teinte={0} />
        </g>
      ) : null}
      {e.repere && b ? (
        <Repere x0={pos.x + 124 * pos.s} y={pos.y + e.repere.y * pos.s} lignes={e.repere.lignes} visible={e.repere.visible} taille={56} />
      ) : null}
    </CadrePoste>
  );
};
