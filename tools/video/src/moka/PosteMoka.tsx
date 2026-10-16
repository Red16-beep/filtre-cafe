import { Bouilloire, pointeBec } from "../dessins/Bouilloire";
import { Bruleur, EtatMoka, Moka, VALVE_Y } from "../dessins/Moka";
import { CadrePoste, ChuteMouture, CompteARebours, Filet, Repere } from "../dessins/Poste";
import { Vapeur } from "../dessins/Vapeur";

// Poste moka : la cafetière sur un brûleur à gaz, sans balance.
export const MOKA = {
  s: 1.45,
  x: 540,
  y: 1380, // fond de la chaudière
  bruleurY: 1392,
  bouilloireRepos: { x: 900, y: 772, angle: 0 },
  bouilloireDehors: { x: 1600, y: 700, angle: 8 },
};
const S = MOKA.s;
export const yMoka = (local: number) => MOKA.y + local * S;

export type EtatPosteMoka = {
  frame: number;
  bouilloire: { x: number; y: number; angle: number };
  filet: { tete: number; queue: number } | null;
  impactX: number;
  traine?: number;
  moka: Omit<EtatMoka, "frame">;
  feu: number;
  mokaDy?: number; // on retire la moka du feu
  mouture?: number;
  vapeurBec?: number;
  repere?: { lignes: string[]; y: number; visible: number; gauche?: boolean } | null; // y : repère local de la moka
  attente?: { restant: number; p: number; visible: number; libelle?: string; minutes?: boolean } | null;
  camera?: { s: number; x: number; y: number };
};

export const PosteMoka: React.FC<{ e: EtatPosteMoka }> = ({ e }) => {
  const { frame } = e;
  const sB = 0.92;
  const pointe = pointeBec(e.bouilloire.x, e.bouilloire.y, e.bouilloire.angle, sB);
  const dy = e.mokaDy ?? 0;
  const m = e.moka;
  const surface = m.eau > 0.003 ? -m.eau * -VALVE_Y : 0;
  const impact = { x: MOKA.x + e.impactX, y: yMoka(surface) + dy };
  return (
    <CadrePoste camera={e.camera} surcouche={e.attente ? <CompteARebours {...e.attente} /> : null}>
      <Bruleur x={MOKA.x} y={MOKA.bruleurY} s={1.15} feu={e.feu} frame={frame} />
      <Moka x={MOKA.x} y={MOKA.y + dy} s={S} e={{ ...m, frame }} />
      {e.mouture !== undefined ? (
        <ChuteMouture p={e.mouture} x={MOKA.x} yFond={yMoka(-118) + dy} yDepart={700} largeur={110} />
      ) : null}
      {e.filet ? <Filet de={pointe} vers={impact} traine={e.traine} tete={e.filet.tete} queue={e.filet.queue} /> : null}
      {e.vapeurBec ? <Vapeur x={MOKA.x - 136 * S} y={yMoka(-318) + dy} frame={frame} intensite={e.vapeurBec} hauteur={120} /> : null}
      {e.repere ? (
        <Repere
          x0={MOKA.x + (e.repere.gauche ? -96 : 100) * S}
          y={yMoka(e.repere.y) + dy}
          lignes={e.repere.lignes}
          visible={e.repere.visible}
          taille={56}
          gauche={e.repere.gauche}
        />
      ) : null}
      <Bouilloire x={e.bouilloire.x} y={e.bouilloire.y} angle={e.bouilloire.angle} s={sB} />
    </CadrePoste>
  );
};
