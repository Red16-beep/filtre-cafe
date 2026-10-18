import { useId } from "react";
import { C, SANS } from "../theme";
import { Balance } from "./Balance";
import { Bouilloire, pointeBec } from "./Bouilloire";
import { Carafe, Remuer, impactCarafe } from "./Carafe";
import { Dripper, demi, hautDuLit, niveauEau } from "./Dripper";
import { CadrePoste, ChuteMouture, CompteARebours, Filet, Gouttes, Repere } from "./Poste";
import { nettoyerId } from "./Trace";
import { Vapeur } from "./Vapeur";

// Le poste complet : balance, carafe, dripper, bouilloire, filet, gouttes.
// Toutes les scènes de préparation l'affichent au même endroit, ce qui rend
// les enchaînements invisibles.
export const POSTE = {
  balance: { x: 540, y: 1330 },
  carafe: { x: 540, y: 1318 },
  dripper: { x: 540, y: 884 },
  bouilloireVerse: { x: 860, y: 765, angle: -24 },
  bouilloireRepos: { x: 900, y: 772, angle: 0 },
  bouilloireDehors: { x: 1600, y: 700, angle: 8 },
  echelleBouilloire: 0.92,
};

export type EtatStation = {
  frame: number;
  bouilloire: { x: number; y: number; angle: number };
  filet: { tete: number; queue: number } | null; // portion visible du filet, 0 → 1
  impactX: number; // décalage horizontal du point d'impact
  traine?: number; // le filet traîne derrière le geste
  poids: number;
  temps: number | null;
  tare?: number;
  lit: number;
  dome: number;
  bulles: number;
  eau: number;
  papierMouille: number;
  carafe: number;
  teinteCarafe: number;
  gouttes: number;
  dripperDy?: number;
  dripperDx?: number; // le dripper sort par le côté (café glacé, avant de remuer)
  carafeDx?: number;
  glace?: number; // glaçons dans la carafe (café glacé)
  fonte?: number;
  remuer?: Remuer | null;
  buee?: number;
  mouture?: number; // 0 → 1 : le café tombe dans le filtre
  vapeur?: number;
  spirale?: {
    p: number;
    rMax: number;
    tours: number;
    finCentre: number;
    visible: number;
  } | null;
  cible?: { texte: string; eau: number; visible: number } | null;
  note?: { lignes: string[]; y: number; visible: number } | null; // y : repère local du cône
  attente?: { restant: number; p: number; visible: number; libelle?: string } | null;
  camera?: { s: number; x: number; y: number };
};

// Trajectoire du versement : du centre vers l'extérieur, puis retour au centre.
export const spirale = (
  t: number,
  rMax: number,
  tours: number,
  finCentre = 0,
) => {
  const tp = Math.min(1, t / Math.max(0.01, 1 - finCentre));
  const r = rMax * Math.sin(Math.PI * tp);
  const a = tours * 2 * Math.PI * t - Math.PI / 2;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
};

// Vue de dessus : la spirale tracée par le filet.
export const EncartSpirale: React.FC<{
  p: number;
  rMax: number;
  tours: number;
  finCentre: number;
  visible: number;
  frame: number;
}> = ({ p, rMax, tours, finCentre, visible, frame }) => {
  const id = nettoyerId(useId());
  if (visible <= 0.01) return null;
  const cx = 180;
  const cy = 760;
  const R = 98;
  const pts: string[] = [];
  const n = Math.max(2, Math.round(p * 120));
  for (let i = 0; i <= n; i++) {
    const tt = i / 120;
    if (tt > p) break;
    const pt = spirale(tt, rMax, tours, finCentre);
    pts.push(`${i ? "L" : "M"} ${(cx + (pt.x / 60) * R * 0.78).toFixed(1)} ${(cy + (pt.y / 60) * R * 0.78).toFixed(1)}`);
  }
  const cur = spirale(p, rMax, tours, finCentre);
  return (
    <g opacity={visible}>
      <defs>
        <pattern id={`${id}-m`} width={18} height={18} patternUnits="userSpaceOnUse">
          <circle cx={4} cy={5} r={2} fill="#b07a48" />
          <circle cx={13} cy={3} r={1.5} fill="#2a140a" />
          <circle cx={9} cy={13} r={1.8} fill="#c08a55" />
        </pattern>
      </defs>
      <circle cx={cx} cy={cy} r={R + 14} fill={C.nuit} opacity={0.55} />
      <circle cx={cx} cy={cy} r={R} fill="#4a2a17" stroke={C.crema} strokeWidth={3} opacity={0.95} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#${id}-m)`} opacity={0.5} />
      <circle cx={cx} cy={cy} r={R + 14} fill="none" stroke={C.crema} strokeWidth={2} opacity={0.35} />
      {pts.length > 1 ? (
        <path d={pts.join(" ")} fill="none" stroke={C.creme} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      ) : null}
      <circle cx={cx + (cur.x / 60) * R * 0.78} cy={cy + (cur.y / 60) * R * 0.78} r={11} fill={C.ceriseVive} />
      <circle
        cx={cx + (cur.x / 60) * R * 0.78}
        cy={cy + (cur.y / 60) * R * 0.78}
        r={11 + ((frame % 16) / 16) * 14}
        fill="none"
        stroke={C.ceriseVive}
        strokeWidth={2}
        opacity={1 - (frame % 16) / 16}
      />
      <text
        x={cx}
        y={cy + R + 56}
        textAnchor="middle"
        style={{ fontFamily: SANS, fontSize: 32, letterSpacing: "0.08em" }}
        fill={C.crema}
        opacity={0.8}
      >
        VU DE DESSUS
      </text>
    </g>
  );
};

export const Station: React.FC<{ e: EtatStation }> = ({ e }) => {
  const { frame } = e;
  const D = { x: POSTE.dripper.x + (e.dripperDx ?? 0), y: POSTE.dripper.y };
  const dy = e.dripperDy ?? 0;
  const sB = POSTE.echelleBouilloire;
  const pointe = pointeBec(e.bouilloire.x, e.bouilloire.y, e.bouilloire.angle, sB);
  const surfaceLocale =
    e.eau > 0.004 ? niveauEau(e.lit, e.eau) : e.lit > 0.001 ? hautDuLit(e.lit, e.dome) : 236;
  const impact = { x: D.x + e.impactX, y: D.y + dy + surfaceLocale };
  const niveauCible = e.cible ? niveauEau(e.lit, e.cible.eau) : 0;

  return (
    <CadrePoste
      camera={e.camera}
      surcouche={
        <>
          {e.spirale ? <EncartSpirale {...e.spirale} frame={frame} /> : null}
          {e.attente ? <CompteARebours {...e.attente} /> : null}
        </>
      }
    >
      <Balance x={POSTE.balance.x} y={POSTE.balance.y} poids={e.poids} temps={e.temps} tare={e.tare ?? 0} />
      <Carafe
        x={POSTE.carafe.x + (e.carafeDx ?? 0)}
        y={POSTE.carafe.y}
        niveau={e.carafe}
        teinte={e.teinteCarafe}
        glace={e.glace ?? 0}
        fonte={e.fonte ?? 0}
        remuer={e.remuer ?? null}
        buee={e.buee ?? 0}
      />
      <Gouttes
        x={D.x}
        y0={D.y + dy + 246}
        y1={POSTE.carafe.y + impactCarafe(e.carafe, e.glace ?? 0) - 4}
        intensite={e.gouttes}
        frame={frame}
        xOnde={POSTE.carafe.x + (e.carafeDx ?? 0)}
      />
      <Dripper
        x={D.x}
        y={D.y + dy}
        lit={e.lit}
        dome={e.dome}
        eau={e.eau}
        bulles={e.bulles}
        papierMouille={e.papierMouille}
        versementX={e.filet && e.filet.tete > 0.98 && e.filet.queue < 0.02 ? e.impactX : null}
        frame={frame}
        couche="arriere"
      />
      {e.mouture !== undefined ? (
        <ChuteMouture p={e.mouture} x={D.x} yFond={D.y + dy + hautDuLit(Math.max(0.05, e.lit), 0)} />
      ) : null}
      {e.filet ? <Filet de={pointe} vers={impact} traine={e.traine} tete={e.filet.tete} queue={e.filet.queue} /> : null}
      <Dripper
        x={D.x}
        y={D.y + dy}
        lit={e.lit}
        dome={e.dome}
        eau={e.eau}
        papierMouille={e.papierMouille}
        frame={frame}
        couche="avant"
      />
      {e.cible ? (
        <Repere
          x0={D.x + demi(niveauCible) + 10}
          y={D.y + dy + niveauCible}
          lignes={[e.cible.texte]}
          visible={e.cible.visible}
        />
      ) : null}
      {e.note ? (
        <Repere
          x0={D.x + demi(e.note.y) + 8}
          y={D.y + dy + e.note.y}
          lignes={e.note.lignes}
          visible={e.note.visible}
          taille={54}
        />
      ) : null}
      {e.vapeur ? <Vapeur x={pointe.x} y={pointe.y} frame={frame} intensite={e.vapeur} /> : null}
      <Bouilloire x={e.bouilloire.x} y={e.bouilloire.y} angle={e.bouilloire.angle} s={sB} />
    </CadrePoste>
  );
};
