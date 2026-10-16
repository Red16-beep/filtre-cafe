import { random } from "remotion";
import { usePaysage } from "../format";
import { C, SANS, SERIF } from "../theme";

// Pièces communes à tous les postes de préparation (V60, AeroPress, …).

// Cadre : en vertical, toute l'image ; en paysage, la moitié droite, et une
// surcouche (encart, minuteur) dans la colonne de gauche sous le texte.
export const CadrePoste: React.FC<{
  camera?: { s: number; x: number; y: number };
  surcouche?: React.ReactNode;
  defs?: React.ReactNode;
  children: React.ReactNode;
}> = ({ camera, surcouche, defs, children }) => {
  const paysage = usePaysage();
  const cam = camera ?? { s: 1, x: 0, y: 0 };
  return (
    <>
      <svg
        viewBox={paysage ? "100 470 1040 1083" : "0 0 1080 1920"}
        style={
          paysage
            ? { position: "absolute", left: 880, top: 0, width: 1040, height: 1080, overflow: "hidden" }
            : { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }
        }
      >
        {defs ? <defs>{defs}</defs> : null}
        <g transform={`translate(${540 + cam.x} ${1060 + cam.y}) scale(${cam.s}) translate(-540 -1060)`}>
          {children}
        </g>
      </svg>
      {surcouche ? (
        <svg
          viewBox={paysage ? "30 615 300 330" : "0 0 1080 1920"}
          style={
            paysage
              ? { position: "absolute", left: 110, top: 600, width: 300, height: 330, overflow: "visible" }
              : { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }
          }
        >
          {surcouche}
        </svg>
      ) : null}
    </>
  );
};

// Filet d'eau du bec au point d'impact ; tete et queue (0 → 1) le font
// naître et se détacher.
export const Filet: React.FC<{
  de: { x: number; y: number };
  vers: { x: number; y: number };
  traine?: number;
  tete: number;
  queue: number;
}> = ({ de, vers, traine = 0, tete, queue }) => {
  if (tete <= queue) return null;
  const ctrl = { x: de.x + (vers.x - de.x) * 0.12 + traine, y: de.y + (vers.y - de.y) * 0.5 };
  const d = `M ${de.x.toFixed(1)} ${de.y.toFixed(1)} Q ${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${vers.x.toFixed(1)} ${vers.y.toFixed(1)}`;
  return (
    <g>
      <path
        d={d}
        pathLength={1}
        strokeDasharray={`${tete - queue} 2`}
        strokeDashoffset={-queue}
        stroke="#f6f1ea"
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        opacity={0.88}
      />
      <path
        d={d}
        pathLength={1}
        strokeDasharray={`${tete - queue} 2`}
        strokeDashoffset={-queue}
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.9}
      />
    </g>
  );
};

// Gouttes (et filet continu quand le débit monte) entre deux hauteurs.
export const Gouttes: React.FC<{
  x: number;
  y0: number;
  y1: number;
  intensite: number;
  frame: number;
  xOnde?: number; // abscisse des ronds à l'arrivée (si la carafe bouge)
  couleur?: string;
}> = ({ x, y0, y1, intensite, frame, xOnde, couleur = "#9a5a2c" }) => {
  if (intensite <= 0.02 || y1 <= y0) return null;
  const elems: React.ReactNode[] = [];
  if (intensite > 0.55) {
    const largeur = 2 + (intensite - 0.55) * 7;
    const ondule = Math.sin(frame * 0.7) * 1.2;
    elems.push(
      <path
        key="filet-bas"
        d={`M ${x} ${y0} Q ${x + ondule} ${(y0 + y1) / 2} ${x} ${y1}`}
        stroke="#8a4b22"
        strokeWidth={largeur}
        strokeLinecap="round"
        fill="none"
        opacity={0.95}
      />,
    );
  }
  const periode = intensite > 0.55 ? 10 : 22 - intensite * 12;
  for (let k = 0; k < 3; k++) {
    if (intensite < k * 0.18) continue;
    const ph = ((frame + (k * periode) / 3) % periode) / periode;
    const yy = y0 + ph * ph * (y1 - y0);
    elems.push(
      <ellipse key={`g${k}`} cx={x} cy={yy} rx={4.5} ry={7} fill={couleur} opacity={ph > 0.92 ? (1 - ph) * 12 : 1} />,
    );
    if (ph > 0.9) {
      const q = (ph - 0.9) / 0.1;
      elems.push(
        <ellipse
          key={`r${k}`}
          cx={xOnde ?? x}
          cy={y1 + 4}
          rx={6 + q * 22}
          ry={(6 + q * 22) * 0.12}
          fill="none"
          stroke="#e8c49a"
          strokeWidth={2}
          opacity={(1 - q) * 0.6}
        />,
      );
    }
  }
  return <g>{elems}</g>;
};

// Mouture qui tombe en pluie vers un point.
export const ChuteMouture: React.FC<{ p: number; x: number; yFond: number; yDepart?: number; largeur?: number }> = ({
  p,
  x,
  yFond,
  yDepart = 640,
  largeur = 70,
}) => {
  if (p <= 0 || p >= 1) return null;
  const grains: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const debut = random(`gm-${i}`) * 0.72;
    const q = (p - debut) / 0.28;
    if (q <= 0 || q >= 1) continue;
    const gx = x + (random(`gx-${i}`) - 0.5) * largeur + (random(`gd-${i}`) - 0.5) * q * 60;
    const gy = yDepart + q * q * (yFond - yDepart);
    grains.push(
      <circle
        key={i}
        cx={gx}
        cy={gy}
        r={2 + random(`gr-${i}`) * 3}
        fill={random(`gc-${i}`) > 0.5 ? "#7a4a2a" : "#a46a3c"}
        opacity={Math.min(1, q * 5)}
      />,
    );
  }
  return <g>{grains}</g>;
};

// Repère en pointillés, du point (x0, y) au bord droit, texte en dessous.
export const Repere: React.FC<{
  x0: number;
  y: number;
  lignes: string[];
  visible: number;
  taille?: number;
  gauche?: boolean; // vers le bord gauche, texte aligné à gauche
  limite?: number; // bord du repère (par défaut 990, ou 90 à gauche)
}> = ({ x0, y, lignes, visible, taille = 64, gauche = false, limite }) => {
  if (visible <= 0.01) return null;
  const bord = limite ?? (gauche ? 90 : 990);
  return (
    <g opacity={Math.min(1, visible * 1.5)}>
      <line
        x1={x0}
        y1={y}
        x2={x0 + (bord - x0) * visible}
        y2={y}
        stroke={C.crema}
        strokeWidth={3}
        strokeDasharray="10 9"
        strokeLinecap="round"
      />
      <circle cx={x0} cy={y} r={7} fill={C.crema} />
      {lignes.map((l, i) => (
        <text
          key={l}
          x={bord}
          y={y + taille + i * (taille * 0.9)}
          textAnchor={gauche ? "start" : "end"}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: taille }}
          fill={C.crema}
        >
          {l}
        </text>
      ))}
    </g>
  );
};

// Compte à rebours circulaire (dans la surcouche).
export const CompteARebours: React.FC<{
  restant: number;
  p: number;
  visible: number;
  libelle?: string;
  minutes?: boolean; // affichage « 3:20 » au lieu de « 20 s »
  texte?: string; // affichage libre (« 14 h », « 10 j »)
}> = ({ restant, p, visible, libelle = "ATTENTE", minutes = false, texte }) => {
  if (visible <= 0.01) return null;
  const cx = 180;
  const cy = 760;
  const r = 88;
  const a = p * Math.PI * 2;
  const arc =
    p >= 0.999
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`
      : `M ${cx} ${cy - r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${cx + Math.sin(a) * r} ${cy - Math.cos(a) * r}`;
  return (
    <g opacity={visible} transform={`translate(${cx} ${cy}) scale(${0.85 + visible * 0.15}) translate(${-cx} ${-cy})`}>
      <circle cx={cx} cy={cy} r={r + 16} fill={C.nuit} opacity={0.55} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.crema} strokeWidth={8} opacity={0.18} />
      {p > 0.002 ? <path d={arc} fill="none" stroke={C.ceriseVive} strokeWidth={8} strokeLinecap="round" /> : null}
      <text
        x={cx - 6}
        y={cy + 24}
        textAnchor="middle"
        style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 76, fontVariantNumeric: "tabular-nums" }}
        fill={C.creme}
      >
        {texte !== undefined
          ? texte
          : minutes
            ? `${Math.floor(Math.ceil(Math.max(0, restant)) / 60)}:${String(Math.ceil(Math.max(0, restant)) % 60).padStart(2, "0")}`
            : Math.ceil(Math.max(0, restant))}
        {minutes || texte !== undefined ? null : (
          <tspan style={{ fontFamily: SANS, fontSize: 34 }} fill={C.crema} dx={6}>
            s
          </tspan>
        )}
      </text>
      <text
        x={cx}
        y={cy + r + 58}
        textAnchor="middle"
        style={{ fontFamily: SANS, fontSize: 32, letterSpacing: "0.08em" }}
        fill={C.crema}
        opacity={0.8}
      >
        {libelle}
      </text>
    </g>
  );
};

// Compteur générique (ex. « 3 / 5 » pour les tours d'agitation), même place.
export const Compteur: React.FC<{ valeur: string; libelle: string; visible: number }> = ({ valeur, libelle, visible }) => {
  if (visible <= 0.01) return null;
  const cx = 180;
  const cy = 760;
  return (
    <g opacity={visible}>
      <circle cx={cx} cy={cy} r={104} fill={C.nuit} opacity={0.55} />
      <circle cx={cx} cy={cy} r={88} fill="none" stroke={C.crema} strokeWidth={4} opacity={0.35} />
      <text
        x={cx}
        y={cy + 26}
        textAnchor="middle"
        style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 80, fontVariantNumeric: "tabular-nums" }}
        fill={C.creme}
      >
        {valeur}
      </text>
      <text
        x={cx}
        y={cy + 146}
        textAnchor="middle"
        style={{ fontFamily: SANS, fontSize: 32, letterSpacing: "0.08em" }}
        fill={C.crema}
        opacity={0.8}
      >
        {libelle}
      </text>
    </g>
  );
};
