import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from "remotion";
import { Dripper } from "../dessins/Dripper";
import { Station } from "../dessins/Station";
import { usePaysage } from "../format";
import { EauMethode } from "../scenes/EauMethode";
import { FinMethode } from "../scenes/FinMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { C, SANS, SERIF, SORTIE, prog } from "../theme";
import { Legende } from "../ui/Legende";
import { RINCAGE_DUREE } from "../v60/etats";
import { ETAPES_K, RETRAIT_DUREE, VERSEMENTS_K_DUREE, etatRetrait, etatRincageK, etatVersementsK } from "./etats";

// Méthode 4:6 de Tetsu Kasuya : tout ce qui est dit ici vient de l'article methode-4-6-kasuya.
const NB = " ";
const VERT = C.feuille; // les 60 %
const ROUGE = C.cerise; // les 40 %

export const KasuyaTitre: React.FC = () => (
  <TitreMethode
    surtitre="La méthode"
    nom="4:6"
    puces={[`20${NB}g de café`, `300${NB}g d’eau`, `5${NB}×${NB}60${NB}g`]}
    objet={{ vertical: { x: 540, y: 700, s: 1.3 }, paysage: { x: 1400, y: 300, s: 1.25 } }}
    sol={{ vertical: 1222, paysage: 900 }}
    goutte={{ dx: 0, dy: 242 }}
    dessin={({ x, y, s, trace, frame }) => <Dripper x={x} y={y} s={s} trace={trace} papier={prog(frame, 24, 48)} />}
  />
);

// Un bloc d'eau : contour au trait, remplissage qui monte, poids au centre.
const Bloc: React.FC<{ x: number; y: number; w: number; h: number; plein: number; couleur: string; texte: string; trace: number; taille?: number }> = ({
  x,
  y,
  w,
  h,
  plein,
  couleur,
  texte,
  trace,
  taille = 40,
}) => (
  <g opacity={trace}>
    <clipPath id={`bloc-${x}-${y}-${w}`}>
      <rect x={x} y={y} width={w} height={h} rx={18} />
    </clipPath>
    <rect x={x} y={y + h * (1 - plein)} width={w} height={h * plein} fill={couleur} opacity={0.85} clipPath={`url(#bloc-${x}-${y}-${w})`} />
    <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke={C.crema} strokeWidth={4} />
    <text x={x + w / 2} y={y + h / 2 + taille * 0.36} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 600, fontSize: taille }} fill={C.creme} opacity={prog(plein, 0.4, 1)}>
      {texte}
    </text>
  </g>
);

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

// ── Le principe : 300 g en cinq versements, 40 % puis 60 % ─────────────────
export const PRINCIPE_DUREE = 140;
export const KasuyaPrincipe: React.FC = () => {
  const f = useCurrentFrame();
  const trace = prog(f, 0, 18, SORTIE);
  const W = 180, G = 16, X0 = 58, Y = 1100, H = 230;
  const heures = ["0:00", "0:45", "1:30", "2:15", "2:45"];
  const accolade = (x1: number, x2: number, p: number) => (
    <path d={`M ${x1} ${Y + H + 28} L ${x1} ${Y + H + 52} L ${x2} ${Y + H + 52} L ${x2} ${Y + H + 28}`} fill="none" stroke={C.crema} strokeWidth={3.5} opacity={p} />
  );
  const fin40 = X0 + 2 * W + G;
  const debut60 = X0 + 2 * (W + G);
  const fin60 = X0 + 5 * W + 4 * G;
  const pa = prog(f, 82, 100, SORTIE);
  const pb = prog(f, 92, 110, SORTIE);
  return (
    <AbsoluteFill name="Principe">
      <Legende puce="LE PRINCIPE" titre="40 % puis 60 %" sous={`300${NB}g d’eau en cinq versements de 60${NB}g`} accent={["40 %", "60 %"]} />
      <Dessin>
        {heures.map((h, i) => (
          <text key={h} x={X0 + i * (W + G) + W / 2} y={Y - 34} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 38 }} fill={C.crema} opacity={0.75 * prog(f, 20 + i * 6, 34 + i * 6)}>
            {h}
          </text>
        ))}
        {heures.map((_, i) => (
          <Bloc key={i} x={X0 + i * (W + G)} y={Y} w={W} h={H} plein={prog(f, 16 + i * 13, 34 + i * 13, Easing.inOut(Easing.quad))} couleur={i < 2 ? ROUGE : VERT} texte={`60${NB}g`} trace={trace} taille={48} />
        ))}
        {accolade(X0, fin40, pa)}
        {accolade(debut60, fin60, pa)}
        <g opacity={pb}>
          <text x={(X0 + fin40) / 2} y={Y + H + 150} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 100 }} fill={C.creme}>
            40 %
          </text>
          <text x={(X0 + fin40) / 2} y={Y + H + 212} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 42 }} fill={C.crema}>
            acidité et douceur
          </text>
          <text x={(debut60 + fin60) / 2} y={Y + H + 150} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 100 }} fill={C.creme}>
            60 %
          </text>
          <text x={(debut60 + fin60) / 2} y={Y + H + 212} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 42 }} fill={C.crema}>
            la force
          </text>
        </g>
      </Dessin>
    </AbsoluteFill>
  );
};

export const KasuyaEau: React.FC = () => <EauMethode temperature={93} sous={`torréfaction claire / 88${NB}°C en médium, 83${NB}°C en foncée`} />;

export const KasuyaRincage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Rinçage">
      <Station e={etatRincageK(frame)} />
      <Sequence name="Rincer" durationInFrames={104} layout="none">
        <Legende puce="ÉTAPE 3" titre="Rincer le filtre" sous="à l’eau chaude, puis jeter l’eau" duree={104} />
      </Sequence>
      <Sequence name="Café et tare" from={100} durationInFrames={RINCAGE_DUREE - 100} layout="none">
        <Legende puce="ÉTAPE 3" titre="Ajouter le café" sous="puis tarer la balance à zéro" duree={RINCAGE_DUREE - 100} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Les cinq versements ──────────────────────────────────────────────────────
const LEGENDES_VERSEMENTS = [
  { puce: "0:00", titre: `Jusqu’à 60${NB}g`, sous: "premier versement des 40 %", fond: ROUGE },
  { puce: "0:45", titre: `Jusqu’à 120${NB}g`, sous: "second versement des 40 %", fond: ROUGE },
  { puce: "1:30", titre: `Jusqu’à 180${NB}g`, sous: "les 60 % commencent", fond: VERT },
  { puce: "2:15", titre: `Jusqu’à 240${NB}g`, sous: "quand l’eau a presque fini de passer", fond: VERT },
  { puce: "2:45", titre: `Jusqu’à 300${NB}g`, sous: "30 secondes plus tard, pas 45", fond: VERT },
];
export const KasuyaVersements: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Versements">
      <Station e={etatVersementsK(frame)} />
      {LEGENDES_VERSEMENTS.map((l, i) => {
        const debut = ETAPES_K[i];
        const duree = (ETAPES_K[i + 1] ?? VERSEMENTS_K_DUREE) - debut;
        return (
          <Sequence key={l.puce} name={l.puce} from={debut} durationInFrames={duree} layout="none">
            <Legende puce={l.puce} puceFond={l.fond} titre={l.titre} sous={l.sous} duree={duree} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const RETRAIT_SCENE = 140;
export const KasuyaRetrait: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Retrait">
      <Station e={etatRetrait(Math.min(frame, RETRAIT_DUREE))} />
      <Sequence name="3:30" durationInFrames={78} layout="none">
        <Legende puce="3:30" puceFond={VERT} titre="Retirer le dripper" sous={`300${NB}g, la tasse est prête`} duree={78} />
      </Sequence>
      <Sequence name="Mouture" from={74} durationInFrames={RETRAIT_SCENE - 74} layout="none">
        <Legende puce="TROP VITE, TROP LENT ?" titre="Régler la mouture" sous="pas les horaires" accent={["mouture"]} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Régler : la répartition des 40 %, puis le fractionnement des 60 % ───────
type Ligne = { blocs: number[]; titre: string; sous: string; repere?: boolean };
const LIGNES_40: Ligne[] = [
  { blocs: [50, 70], titre: "plus doux", sous: "moins acide" },
  { blocs: [60, 60], titre: "équilibré", sous: "le point de départ", repere: true },
  { blocs: [70, 50], titre: "plus vif", sous: "acidité marquée" },
];
const LIGNES_60: Ligne[] = [
  { blocs: [180], titre: "le plus léger", sous: "1 versement" },
  { blocs: [90, 90], titre: "intermédiaire", sous: "2 versements" },
  { blocs: [60, 60, 60], titre: "le plus dense", sous: "3 versements, recommandé", repere: true },
];
const Lignes: React.FC<{ lignes: Ligne[]; echelle: number; couleur: string; debut: number; f: number }> = ({ lignes, echelle, couleur, debut, f }) => (
  <g>
    {lignes.map((l, r) => {
      const y = 930 + r * 200;
      const p = prog(f, debut + r * 10, debut + 16 + r * 10, SORTIE);
      let x = 70;
      const largeurTotale = l.blocs.reduce((s, g) => s + g * echelle, 0) + (l.blocs.length - 1) * 12;
      return (
        <g key={r} opacity={p} transform={`translate(${(1 - p) * -30} 0)`}>
          {l.repere ? <rect x={46} y={y - 24} width={988} height={168} rx={24} fill={C.crema} opacity={0.07} stroke={C.crema} strokeOpacity={0.35} strokeWidth={2} /> : null}
          {l.blocs.map((g, k) => {
            const w = g * echelle;
            const bloc = <Bloc key={k} x={x} y={y} w={w} h={120} plein={prog(f, debut + 6 + r * 10 + k * 4, debut + 22 + r * 10 + k * 4)} couleur={couleur} texte={`${g}${NB}g`} trace={1} taille={36} />;
            x += w + 12;
            return bloc;
          })}
          <text x={70 + largeurTotale + 34} y={y + 54} style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 52 }} fill={C.creme}>
            {l.titre}
          </text>
          <text x={70 + largeurTotale + 34} y={y + 100} style={{ fontFamily: SANS, fontSize: 32 }} fill={C.crema} opacity={0.85}>
            {l.sous}
          </text>
        </g>
      );
    })}
  </g>
);
export const REGLAGES_DUREE = 220;
export const KasuyaReglages: React.FC = () => {
  const f = useCurrentFrame();
  const a = 1 - prog(f, 100, 112);
  const b = prog(f, 112, 124);
  return (
    <AbsoluteFill name="Réglages">
      <Sequence name="40 %" durationInFrames={112} layout="none">
        <Legende puce="LES 40 %" puceFond={ROUGE} titre="Plus doux ou plus vif ?" sous="on répartit autrement les deux premiers versements" duree={112} taille={104} />
      </Sequence>
      <Sequence name="60 %" from={110} durationInFrames={REGLAGES_DUREE - 110} layout="none">
        <Legende puce="LES 60 %" puceFond={VERT} titre="Plus léger ou plus fort ?" sous={`on fractionne les 180${NB}g restants`} taille={104} />
      </Sequence>
      <Dessin>
        {a > 0 ? (
          <g opacity={a}>
            <Lignes lignes={LIGNES_40} echelle={3.6} couleur={ROUGE} debut={8} f={f} />
          </g>
        ) : null}
        {b > 0 ? (
          <g opacity={b}>
            <Lignes lignes={LIGNES_60} echelle={2.4} couleur={VERT} debut={116} f={f} />
          </g>
        ) : null}
      </Dessin>
    </AbsoluteFill>
  );
};

export const KasuyaFin: React.FC = () => (
  <FinMethode
    titre="La méthode 4:6"
    lignes={[
      { l: "Café", v: `20${NB}g, médium-grossière` },
      { l: "Eau", v: `300${NB}g, 83 à 93${NB}°C` },
      { l: "Versements", v: `5${NB}×${NB}60${NB}g` },
      { l: "Retrait", v: "3:30" },
    ]}
    url="filtre.cafe/journal/methode-4-6-kasuya"
  />
);
