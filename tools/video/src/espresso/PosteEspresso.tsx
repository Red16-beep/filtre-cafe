import { Balance } from "../dessins/Balance";
import { Machine, PorteFiltre, Tamper, TasseEspresso } from "../dessins/Espresso";
import { CadrePoste, ChuteMouture, Repere } from "../dessins/Poste";

// Poste espresso : la machine, une petite balance sur l'égouttoir, la tasse.
export const ESP = {
  machine: { x: 540, y: 1250 },
  groupe: { x: 540, y: 792 }, // haut du panier verrouillé
  balance: { x: 540, y: 1067, s: 0.62 },
  plateau: 1060, // dessus de la balance
};

export type EtatEspresso = {
  frame: number;
  poids: number | null;
  temps: number | null;
  tare?: number;
  pf: { x: number; y: number; angle: number; dose: number; tasse: number };
  mouture?: number;
  tamper?: { visible: number; y: number } | null;
  tasse?: { trace: number; niveau: number } | null;
  extraction: number; // filets sous les becs, 0 → 1
  repere?: { lignes: string[]; y: number; visible: number } | null; // y absolu
  camera?: { s: number; x: number; y: number };
};

export const PosteEspresso: React.FC<{ e: EtatEspresso }> = ({ e }) => {
  const { frame } = e;
  const B = ESP.balance;
  const pf = e.pf;
  const becY = pf.y + 82;
  const surfaceTasse = ESP.plateau - 6 - 84 + 22 * (1 - (e.tasse?.niveau ?? 0));
  return (
    <CadrePoste camera={e.camera}>
      <Machine x={ESP.machine.x} y={ESP.machine.y} />
      <Balance x={B.x} y={B.y} s={B.s} poids={e.poids} decimales temps={e.temps} tare={e.tare ?? 0} />
      {e.tasse ? <TasseEspresso x={540} y={ESP.plateau - 6} trace={e.tasse.trace} niveau={e.tasse.niveau} /> : null}
      {e.extraction > 0.01
        ? [-1, 1].map((cote) => (
            <path
              key={cote}
              d={`M ${pf.x + cote * 26} ${becY} Q ${pf.x + cote * 18 + Math.sin(frame * 0.5 + cote) * 1.5} ${(becY + surfaceTasse) / 2} ${pf.x + cote * 12} ${surfaceTasse}`}
              fill="none"
              stroke="#b8763e"
              strokeWidth={3 + 3 * e.extraction}
              strokeLinecap="round"
              opacity={Math.min(1, e.extraction * 2)}
            />
          ))
        : null}
      {e.mouture !== undefined ? <ChuteMouture p={e.mouture} x={pf.x} yFond={pf.y + 14} largeur={60} yDepart={690} /> : null}
      <PorteFiltre x={pf.x} y={pf.y} angle={pf.angle} dose={pf.dose} tasse={pf.tasse} />
      {e.tamper && e.tamper.visible > 0.01 ? (
        <g opacity={e.tamper.visible}>
          <Tamper x={pf.x} y={e.tamper.y} />
        </g>
      ) : null}
      {e.repere ? <Repere x0={pf.x + 40} y={e.repere.y} lignes={e.repere.lignes} visible={e.repere.visible} taille={44} limite={850} /> : null}
    </CadrePoste>
  );
};
