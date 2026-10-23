import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Fond } from "../../dessins/Fond";
import { Moulin } from "../../dessins/Moulin";
import { Trace } from "../../dessins/Trace";
import { FormatCtx } from "../../format";
import { C, DOUX, FINE, SORTIE, prog } from "../../theme";
import { vu } from "../habillage";
import { Minutage, outilsTemps } from "../temps";
import { Toile, texteSans, texteSerif } from "../ui";
import minutageBrut from "./minutage.json";
import narration from "./narration.json";

// Short « Black Friday café » (vertical, environ 50 s), tiré de la page journal/black-friday-cafe : le prix normal
// relevé avant la saison des promos, la règle des -15 %, la loi des 30 jours et ses deux trous.
// La voix fixe le minutage (outils/narration.py black-friday), le mixage la piste son (outils/mixage.py).
// Zone utile : sous les 220 px du haut, au-dessus des 440 px du bas et à gauche des boutons des Shorts.
const M = minutageBrut as Minutage;
export const BLACK_FRIDAY_DUREE = M.duree;
const T = outilsTemps(M, narration);
const { ph, mot } = T;

const VERT = C.feuilleClaire;
const ROUGE = C.ceriseVive;

// Étiquette de prix, repère : centre.
const Etiquette: React.FC<{ x: number; y: number; trace: number }> = ({ x, y, trace }) => (
  <g transform={`translate(${x} ${y}) rotate(-8)`}>
    <Trace d="M -250 -130 L 170 -130 L 260 0 L 170 130 L -250 130 Q -280 130 -280 100 L -280 -100 Q -280 -130 -250 -130 Z" p={trace} w={6} fill="rgba(239,199,156,0.06)" />
    <circle cx={175} cy={0} r={22} fill="none" stroke={C.crema} strokeWidth={6} opacity={prog(trace, 0.7, 1)} />
  </g>
);

// Courbe de prix sur un mois, de gauche à droite (valeurs de 0, bas, à 1, haut).
const Courbe: React.FC<{ points: number[]; x0: number; x1: number; yBas: number; yHaut: number; p: number; c?: string }> = ({ points, x0, x1, yBas, yHaut, p, c = C.crema }) => {
  const px = (i: number) => x0 + ((x1 - x0) * i) / (points.length - 1);
  const py = (v: number) => yBas - (yBas - yHaut) * v;
  const d = points.map((v, i) => `${i ? "L" : "M"} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  return <Trace d={d} p={p} w={5} c={c} />;
};

const CHART = { x0: 120, x1: 900, yBas: 1340, yHaut: 900 };
const px = (n: number, i: number) => CHART.x0 + ((CHART.x1 - CHART.x0) * i) / (n - 1);
const py = (v: number) => CHART.yBas - (CHART.yBas - CHART.yHaut) * v;

// La loi : la réduction part du prix le plus bas des 30 jours précédents.
const MOIS = [0.62, 0.6, 0.64, 0.58, 0.61, 0.55, 0.57, 0.52, 0.56, 0.5, 0.47, 0.44, 0.48, 0.53, 0.5, 0.55, 0.58, 0.54, 0.57, 0.6, 0.56, 0.59, 0.62, 0.6, 0.63, 0.61, 0.64, 0.62, 0.6, 0.63];
const MIN = MOIS.indexOf(Math.min(...MOIS));
// Le piège : un prix monté début octobre sert de référence fin novembre.
const AUTOMNE = [0.4, 0.4, 0.41, 0.4, 0.4, 0.66, 0.66, 0.67, 0.66, 0.66, 0.66, 0.67, 0.66, 0.66, 0.56];

const Puce: React.FC<{ texte: string; fond?: string; style?: React.CSSProperties }> = ({ texte, fond = C.cerise, style }) => (
  <span style={{ display: "inline-block", padding: "10px 22px", borderRadius: 999, backgroundColor: fond, ...texteSans(30, { fontWeight: 700, letterSpacing: "0.12em", color: C.creme }), ...style }}>{texte}</span>
);

export const BlackFridayShort: React.FC = () => {
  const f = useCurrentFrame();
  const b = Object.fromEntries(["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9"].map((id) => [id, ph(id)]));
  const finTag = b.b3.debut - 8;
  return (
    <FormatCtx.Provider value="vertical">
      <AbsoluteFill>
        <Fond />

        {/* 1-2 : le prix barré, et la question du prix normal */}
        <div style={{ position: "absolute", left: 80, top: 260, ...vu(f, 6, finTag) }}>
          <Puce texte="BLACK FRIDAY" />
          <div style={texteSerif(132, { marginTop: 22 })}>27 novembre</div>
          <div style={texteSerif(60, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 10 })}>tout affichera un prix barré</div>
        </div>
        <div style={{ position: "absolute", inset: 0, ...vu(f, 10, finTag, 40) }}>
          <Toile>
            <Etiquette x={500} y={960} trace={prog(f, 10, 50, DOUX)} />
          </Toile>
        </div>
        <div style={{ position: "absolute", left: 165, width: 560, top: 880, textAlign: "center", rotate: "-8deg", ...vu(f, mot("b1", "prix barré") - 4, finTag, 20), ...texteSerif(160, { fontWeight: 500, color: ROUGE, whiteSpace: "nowrap" }) }}>
          -30{FINE}%
        </div>
        <div style={{ position: "absolute", left: 80, width: 860, top: 1200, ...vu(f, mot("b2", "le prix normal") - 6, finTag), ...texteSerif(72, { fontStyle: "italic", fontWeight: 400, color: C.crema }) }}>
          … mais de quel prix ?
        </div>

        {/* 3 : le relevé du 9 octobre */}
        <div style={{ position: "absolute", left: 80, top: 300, width: 860, ...vu(f, b.b3.debut, b.b4.debut - 8) }}>
          <div style={texteSans(30, { fontWeight: 600, letterSpacing: "0.2em", color: "rgba(239,199,156,0.7)" })}>LES PRIX NORMAUX, RELEVÉS LE</div>
          <div style={texteSerif(170, { fontWeight: 450, marginTop: 10, whiteSpace: "nowrap" })}>9 octobre</div>
          <div style={texteSerif(56, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 12 })}>avant la saison des promos</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 70 }}>
            {["Moulins", "Balances", "Bouilloires", "Machines"].map((r, i) => (
              <span key={r} style={{ display: "inline-block", padding: "14px 28px", borderRadius: 999, border: `2px solid rgba(239,199,156,0.45)`, ...texteSans(38, { color: C.creme }), ...vu(f, b.b3.debut + 18 + i * 6, undefined, 14) }}>{r}</span>
            ))}
          </div>
        </div>

        {/* 4 : un exemple, le moulin Timemore C3S Pro */}
        <div style={{ position: "absolute", inset: 0, ...vu(f, b.b4.debut, b.b5.debut - 8) }}>
          <Toile>
            <Moulin x={300} y={1230} s={1.1} trace={prog(f, b.b4.debut, b.b4.debut + 40, DOUX)} tour={prog(f, b.b4.debut + 30, b.b4.debut + 100, DOUX)} />
          </Toile>
          <div style={{ position: "absolute", left: 80, top: 290 }}>
            <Puce texte="EXEMPLE" fond="rgba(239,199,156,0.18)" style={{ color: C.crema }} />
            <div style={texteSerif(84, { marginTop: 22 })}>Timemore C3S Pro</div>
          </div>
          <div style={{ position: "absolute", left: 560, top: 760, width: 400 }}>
            <div style={texteSans(30, { fontWeight: 600, letterSpacing: "0.14em", color: "rgba(239,199,156,0.7)" })}>PRIX HABITUEL</div>
            <div style={texteSerif(130, { fontWeight: 450 })}>69{FINE}€</div>
            <div style={{ ...vu(f, mot("b4", "Une vraie promo") - 4, undefined, 16), marginTop: 36 }}>
              <div style={texteSans(30, { fontWeight: 600, letterSpacing: "0.14em", color: VERT })}>VRAIE PROMO SOUS</div>
              <div style={texteSerif(130, { fontWeight: 450, color: VERT })}>59{FINE}€</div>
            </div>
          </div>
        </div>

        {/* 5 : la règle des -15 % */}
        <div style={{ position: "absolute", inset: 0, ...vu(f, b.b5.debut, b.b6.debut - 8) }}>
          <div style={{ position: "absolute", left: 80, top: 290, width: 860 }}>
            <Puce texte="LA RÈGLE" />
            <div style={texteSerif(170, { fontWeight: 450, marginTop: 22 })}>-15{FINE}%</div>
            <div style={texteSerif(58, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 8 })}>au moins, sous le prix habituel</div>
          </div>
          <Toile>
            {(() => {
              const x0 = 120, x1 = 900, y = 1040;
              const xs = (v: number) => x0 + ((x1 - x0) * v) / 69;
              const zone = prog(f, mot("b5", "au moins") - 4, mot("b5", "au moins") + 20, SORTIE);
              return (
                <>
                  <rect x={x0} y={y - 26} width={(xs(59) - x0) * zone} height={52} rx={10} fill="rgba(127,163,131,0.35)" />
                  <line x1={x0} y1={y} x2={x1} y2={y} stroke="rgba(239,199,156,0.45)" strokeWidth={4} />
                  <circle cx={xs(69)} cy={y} r={14} fill={C.crema} />
                  <line x1={xs(59)} y1={y - 70} x2={xs(59)} y2={y + 70} stroke={VERT} strokeWidth={4} strokeDasharray="8 8" opacity={zone} />
                </>
              );
            })()}
          </Toile>
          <div style={{ position: "absolute", left: 700, width: 240, top: 1090, textAlign: "center", ...texteSerif(56) }}>69{FINE}€</div>
          <div style={{ position: "absolute", left: 470, width: 280, top: 1120, textAlign: "center", ...vu(f, mot("b5", "au moins") + 6, undefined, 12), ...texteSerif(56, { color: VERT }) }}>59{FINE}€</div>
          <div style={{ position: "absolute", left: 120, width: 520, top: 900, ...vu(f, mot("b5", "au moins") + 12, undefined, 12), ...texteSans(36, { color: VERT }) }}>la zone des vraies promos</div>
        </div>

        {/* 6 : la loi des 30 jours */}
        <div style={{ position: "absolute", inset: 0, ...vu(f, b.b6.debut, b.b7.debut - 8) }}>
          <div style={{ position: "absolute", left: 80, top: 290, width: 860 }}>
            <Puce texte="LA LOI, DEPUIS 2022" />
            <div style={texteSerif(80, { marginTop: 22 })}>La réduction part du prix le plus bas</div>
            <div style={texteSerif(58, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 12 })}>des 30 jours précédents</div>
          </div>
          <Toile>
            <rect x={CHART.x0} y={CHART.yHaut - 40} width={CHART.x1 - CHART.x0} height={CHART.yBas - CHART.yHaut + 80} rx={18} fill="rgba(239,199,156,0.05)" />
            <Courbe points={MOIS} {...CHART} p={prog(f, b.b6.debut + 10, b.b6.debut + 70, DOUX)} />
            <circle cx={px(MOIS.length, MIN)} cy={py(MOIS[MIN])} r={14} fill={VERT} opacity={prog(f, mot("b6", "le prix le plus bas") - 2, mot("b6", "le prix le plus bas") + 10)} />
            <line x1={CHART.x0} y1={py(MOIS[MIN])} x2={CHART.x1} y2={py(MOIS[MIN])} stroke={VERT} strokeWidth={3} strokeDasharray="8 10" opacity={prog(f, mot("b6", "le prix le plus bas") + 4, mot("b6", "le prix le plus bas") + 20)} />
          </Toile>
          <div style={{ position: "absolute", left: CHART.x0, top: CHART.yBas + 60, ...texteSans(34) }}>30 jours avant la promo</div>
        </div>

        {/* 7 : le « prix conseillé » barré */}
        <div style={{ position: "absolute", left: 80, top: 300, width: 860, ...vu(f, b.b7.debut, b.b8.debut - 8) }}>
          <Puce texte="PREMIER TROU" fond="rgba(217,88,47,0.85)" />
          <div style={{ position: "relative", display: "inline-block", marginTop: 60 }}>
            <div style={texteSerif(110, { color: "rgba(246,241,234,0.85)" })}>Prix conseillé</div>
            <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 8, borderRadius: 4, backgroundColor: ROUGE, scale: `${prog(f, b.b7.debut + 10, b.b7.debut + 26, SORTIE)} 1`, transformOrigin: "left" }} />
          </div>
          <div style={{ ...vu(f, mot("b7", "n'est pas une réduction") - 4, undefined, 16), marginTop: 60 }}>
            <div style={texteSerif(84)}>n’est pas une réduction</div>
            <div style={texteSans(40, { marginTop: 20 })}>c’est une comparaison : la règle des 30 jours ne s’y applique pas</div>
          </div>
        </div>

        {/* 8 : le prix monté début octobre */}
        <div style={{ position: "absolute", inset: 0, ...vu(f, b.b8.debut, b.b9.debut - 8) }}>
          <div style={{ position: "absolute", left: 80, top: 290, width: 860 }}>
            <Puce texte="DEUXIÈME TROU" fond="rgba(217,88,47,0.85)" />
            <div style={texteSerif(80, { marginTop: 22 })}>Un prix monté début octobre</div>
            <div style={texteSerif(58, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 12 })}>sert de référence fin novembre</div>
          </div>
          <Toile>
            <Courbe points={AUTOMNE} {...CHART} p={prog(f, b.b8.debut + 6, b.b8.debut + 56, DOUX)} />
            <line x1={CHART.x0} y1={py(0.4)} x2={CHART.x1} y2={py(0.4)} stroke={VERT} strokeWidth={3} strokeDasharray="8 10" opacity={prog(f, b.b8.debut + 40, b.b8.debut + 56)} />
            <circle cx={px(AUTOMNE.length, AUTOMNE.length - 1)} cy={py(AUTOMNE[AUTOMNE.length - 1])} r={14} fill={ROUGE} opacity={prog(f, b.b8.debut + 50, b.b8.debut + 60)} />
          </Toile>
          <div style={{ position: "absolute", left: 340, top: py(0.66) - 64, ...vu(f, b.b8.debut + 24, undefined, 10), ...texteSans(32) }}>début octobre : le prix monte</div>
          <div style={{ position: "absolute", left: CHART.x0, top: py(0.4) + 18, ...vu(f, b.b8.debut + 48, undefined, 10), ...texteSans(32, { color: VERT }) }}>le prix habituel</div>
          <div style={{ position: "absolute", left: 560, width: 380, top: py(AUTOMNE[AUTOMNE.length - 1]) + 36, textAlign: "right", ...vu(f, b.b8.debut + 56, undefined, 10), ...texteSans(32, { color: ROUGE }) }}>« -15 % » fin novembre</div>
        </div>

        {/* 9 : la page */}
        <div style={{ position: "absolute", left: 80, top: 420, width: 860, ...vu(f, b.b9.debut) }}>
          <div style={texteSerif(96)}>Les prix normaux,</div>
          <div style={texteSerif(96, { fontStyle: "italic", fontWeight: 400, color: C.crema })}>rayon par rayon</div>
          <div style={{ marginTop: 70, display: "inline-block", padding: "22px 34px", borderRadius: 20, border: "2px solid rgba(239,199,156,0.5)", ...texteSans(40, { color: C.creme, fontWeight: 600 }) }}>
            filtre.cafe/journal/black-friday-cafe
          </div>
          <div style={{ marginTop: 120, ...texteSerif(120, { fontStyle: "italic", fontWeight: 400 }) }}>
            filtré<span style={{ color: "#e0673f" }}>.</span>
          </div>
        </div>

        <Audio src={staticFile("audio/episode-black-friday-mix.wav")} />
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};

