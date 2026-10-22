import { AbsoluteFill, Freeze, Sequence, useCurrentFrame } from "remotion";
import { Balance } from "../../dessins/Balance";
import { Bouilloire } from "../../dessins/Bouilloire";
import { Dripper } from "../../dessins/Dripper";
import { Filtre } from "../../dessins/Filtre";
import { Moulin } from "../../dessins/Moulin";
import { Station } from "../../dessins/Station";
import { Trace } from "../../dessins/Trace";
import { usePaysage } from "../../format";
import { EauMethode } from "../../scenes/EauMethode";
import { C, DOUX, FINE, SANS, SERIF, SORTIE, mix, prog } from "../../theme";
import { Legende } from "../../ui/Legende";
import { Mots } from "../../ui/Mots";
import { etatEcoulement, etatRincage, etatVersement } from "../../v60/etats";
import { Diagnostic as DiagnosticTuto } from "../../v60/scenes/Diagnostic";
import { Fin } from "../../v60/scenes/Fin";
import { vu } from "../habillage";
import { CARTE, outilsTemps, recale } from "../temps";
import minutage from "./minutage.json";
import narration from "./narration.json";

// Les scènes de l'épisode « Le V60 de A à Z ». Chaque scène lit l'image de son chapitre
// (0 = début de la carte de chapitre) et se cale sur les phrases de la voix.
const T = outilsTemps(minutage, narration);
const { ph, mot } = T;

const Toile: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const paysage = usePaysage();
  const [w, h] = paysage ? [1920, 1080] : [1080, 1920];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
      {children}
    </svg>
  );
};

// Une légende du tuto, présente d'une image à une autre du chapitre.
const LegendeDe: React.FC<{ de: number; a: number } & React.ComponentProps<typeof Legende>> = ({ de, a, ...l }) => (
  <Sequence from={de} durationInFrames={Math.max(1, a - de)} layout="none">
    <Legende {...l} duree={Math.max(1, a - de)} />
  </Sequence>
);

const texteSerif = (taille: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 500,
  fontSize: taille,
  lineHeight: 1.04,
  color: C.creme,
  ...extra,
});
const texteSans = (taille: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 400,
  fontSize: taille,
  lineHeight: 1.25,
  color: "rgba(239,199,156,0.94)",
  ...extra,
});

// ── 0. Ouverture ──────────────────────────────────────────────────────────────
const CHIFFRES = [
  { v: `15${FINE}g`, l: "de café", m: "Quinze" },
  { v: `250${FINE}g`, l: "d’eau", m: "deux cent cinquante" },
  { v: `93${FINE}°C`, l: "de température", m: "quatre-vingt-treize" },
  { v: `3${FINE}min`, l: "devant vous", m: "trois minutes" },
];
const SOMMAIRE = [
  { n: "02", t: "Le matériel", m: "le matériel" },
  { n: "03", t: "La dose", m: "la dose" },
  { n: "04", t: "La mouture", m: "la mouture" },
  { n: "05", t: "L’eau", m: "l'eau" },
  { n: "06", t: "La recette pas à pas", m: "la recette" },
  { n: "07", t: "Les réglages", m: "quoi régler" },
];

export const Ouverture: React.FC = () => {
  const f = useCurrentFrame();
  const o2 = ph("o2").debut;
  return (
    <AbsoluteFill>
      {CHIFFRES.map((c, i) => {
        const a = mot("o1", c.m);
        const s = vu(f, a, o2 - 10, 40);
        return (
          <div key={c.v} style={{ position: "absolute", left: 360 + i * 400 - 200, width: 400, top: 330, textAlign: "center", ...s }}>
            <div style={texteSerif(150, { fontWeight: 450, fontVariantNumeric: "tabular-nums" })}>{c.v}</div>
            <div style={texteSans(34, { marginTop: 18, color: "rgba(239,199,156,0.75)" })}>{c.l}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 140, top: 210, ...vu(f, o2) }}>
        <div style={texteSerif(200, { fontWeight: 450 })}>Le V60</div>
        <div style={texteSerif(132, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 6 })}>de A à Z</div>
      </div>
      <Toile>
        <Dripper x={1440} y={250} s={1.32} trace={prog(f, o2, o2 + 50, DOUX)} papier={prog(f, o2 + 20, o2 + 60)} />
      </Toile>
      {SOMMAIRE.map((s, i) => {
        const a = mot("o3", s.m);
        const col = Math.floor(i / 3);
        const rang = i % 3;
        const actif = f >= a && (i === SOMMAIRE.length - 1 || f < mot("o3", SOMMAIRE[i + 1].m));
        return (
          <div key={s.n} style={{ position: "absolute", left: 146 + col * 470, top: 690 + rang * 76, display: "flex", gap: 18, alignItems: "baseline", ...vu(f, a, undefined, 18) }}>
            <span style={texteSans(30, { fontWeight: 600, color: C.ceriseVive, letterSpacing: "0.06em" })}>{s.n}</span>
            <span style={texteSerif(52, { opacity: actif ? 1 : 0.62 })}>{s.t}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── 1. Pourquoi le V60 ───────────────────────────────────────────────────────
export const Pourquoi: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = ph("p1"), p2 = ph("p2"), p3 = ph("p3");
  return (
    <AbsoluteFill>
      <Toile>
        <Dripper x={1470} y={250} s={1.4} trace={prog(f, CARTE + 4, CARTE + 54, DOUX)} papier={prog(f, CARTE + 24, CARTE + 64)} lit={prog(f, p2.debut, p2.debut + 30)} />
      </Toile>
      <div style={{ position: "absolute", left: 140, top: 300, ...vu(f, p1.debut, p2.debut - 8) }}>
        <div style={texteSans(30, { fontWeight: 600, letterSpacing: "0.2em", color: "rgba(239,199,156,0.7)" })}>HARIO</div>
        <div style={texteSerif(150, { marginTop: 14, fontWeight: 450 })}>2004</div>
        <div style={texteSerif(64, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 10 })}>et toujours la référence</div>
      </div>
      <Sequence from={p2.debut} layout="none">
        <Mots
          texte={"Ce que vous mettez dedans, / vous le retrouvez / dans la tasse."}
          decalage={2}
          accent={["tasse."]}
          style={{ position: "absolute", left: 140, top: 300, width: 980, ...texteSerif(70) }}
        />
      </Sequence>
      <div style={{ position: "absolute", left: 140, top: 700, ...vu(f, p3.debut) }}>
        <span style={{ display: "inline-block", padding: "16px 32px", borderRadius: 999, border: "2px solid rgba(239,199,156,0.5)", ...texteSerif(54, { fontStyle: "italic", fontWeight: 400, color: C.crema }) }}>
          l’école du café filtre
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── 2. Le matériel : cinq objets ─────────────────────────────────────────────
const OBJETS = [
  { id: "m2", t: "Un V60", d: "taille 02, moins de 15 €" },
  { id: "m3", t: "Des filtres", d: "rincés à l’eau chaude" },
  { id: "m4", t: "Une balance", d: "avec minuteur" },
  { id: "m5", t: "Une bouilloire", d: "à col de cygne" },
  { id: "m6", t: "Un moulin", d: "juste avant de préparer" },
];

export const Materiel: React.FC = () => {
  const f = useCurrentFrame();
  const xs = [250, 600, 960, 1330, 1680];
  const base = 700;
  const debuts = OBJETS.map((o) => ph(o.id).debut);
  const actif = debuts.reduce((k, d, i) => (f >= d ? i : k), -1);
  const tr = (k: number) => prog(f, debuts[k], debuts[k] + 34, DOUX);
  const flotte = (k: number) => Math.sin((f + k * 20) * 0.05) * 4;
  const net = (k: number) => (f < debuts[k] ? 0 : k === actif ? 1 : 0.5);
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={T.duree("materiel")} puce="MATÉRIEL" titre="Cinq objets" />
      <Toile>
        <g opacity={net(0)} transform={`translate(0 ${flotte(0)})`}>
          <Dripper x={xs[0] + 8} y={base - 265 * 0.6} s={0.6} trace={tr(0)} papier={tr(0)} />
        </g>
        <g opacity={net(1)} transform={`translate(0 ${flotte(1)})`}>
          <Filtre x={xs[1]} y={base - 115 * 0.82} s={0.82} trace={tr(1)} />
        </g>
        <g opacity={net(2)} transform={`translate(0 ${flotte(2)})`}>
          <Balance x={xs[2]} y={base - 150 * 0.46} s={0.46} trace={tr(2)} poids={0} decimales temps={0} />
        </g>
        <g opacity={net(3)} transform={`translate(0 ${flotte(3)})`}>
          <Bouilloire x={xs[3] + 70} y={base - 80 * 0.56} s={0.56} trace={tr(3)} />
        </g>
        <g opacity={net(4)} transform={`translate(0 ${flotte(4)})`}>
          <Moulin x={xs[4]} y={base} s={0.74} trace={tr(4)} tour={prog(f, debuts[4] + 30, debuts[4] + 90, DOUX)} />
        </g>
      </Toile>
      {OBJETS.map((o, k) => (
        <div key={o.id} style={{ position: "absolute", left: xs[k] - 170, width: 340, top: base + 42, textAlign: "center", ...vu(f, debuts[k] + 8, undefined, 16), opacity: vu(f, debuts[k] + 8).opacity * (k === actif ? 1 : 0.6) }}>
          <div style={texteSerif(52)}>{o.t}</div>
          <div style={texteSans(30, { marginTop: 8 })}>{o.d}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ── 3. La dose ────────────────────────────────────────────────────────────────
const DOSES = [
  { eau: "200 ml", cafe: "12 g", usage: "petite tasse", p: "" },
  { eau: "250 ml", cafe: "15 g", usage: "une tasse", p: "d1" },
  { eau: "350 ml", cafe: "22 g", usage: "grand mug", p: "d2" },
  { eau: "500 ml", cafe: "31 g", usage: "deux tasses", p: "d3" },
];

const Cuillere: React.FC<{ x: number; y: number; s: number; trace: number; plein: number }> = ({ x, y, s, trace, plein }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Trace d="M -70 0 C -70 -48 70 -48 70 0 C 70 40 -70 40 -70 0 Z" p={trace} fill="rgba(239,199,156,0.07)" />
    <Trace d="M 70 0 C 120 -2 200 -10 300 -6" p={prog(trace, 0.4, 1)} w={9} />
    <ellipse cx={0} cy={-2} rx={52 * plein} ry={20 * plein} fill={C.cafeClair} opacity={0.85 * plein} />
  </g>
);

export const Dose: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const d1 = ph("d1"), d2 = ph("d2"), d4 = ph("d4");
  const finBalance = d2.debut - 4;
  const finTable = d4.debut - 4;
  const poids = mix(0, 15, prog(f, d1.debut + 4, d1.debut + 44, SORTIE));
  const actif = f >= ph("d3").debut ? 3 : f >= d2.debut ? 2 : 1;
  const balance = vu(f, CARTE + 4, finBalance);
  const table = vu(f, d2.debut - 2, finTable);
  const B = paysage ? { x: 1380, y: 470, s: 1.0 } : { x: 540, y: 1150, s: 0.95 };
  const TB = paysage ? { x: 1020, y: 300, w: 760 } : { x: 90, y: 860, w: 900 };
  const CU = paysage ? [{ x: 1150, y: 520 }, { x: 1150, y: 760 }] : [{ x: 360, y: 1060 }, { x: 360, y: 1330 }];
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={d4.debut} puce="LA DOSE" titre={`15${FINE}g pour 250${FINE}g`} sous="soit un ratio de 1:16" accent={["1:16"]} />
      <LegendeDe de={d4.debut} a={T.duree("dose")} puce="PESEZ" titre={`De 5 à 8${FINE}g`} sous="par cuillère à soupe, jusqu’à 60 % d’écart" />
      <div style={{ position: "absolute", inset: 0, opacity: balance.opacity }}>
        <Toile>
          <Balance x={B.x} y={B.y} s={B.s} trace={prog(f, CARTE + 4, CARTE + 34, DOUX)} poids={poids} decimales temps={null} />
        </Toile>
      </div>
      <div style={{ position: "absolute", left: TB.x, top: TB.y, width: TB.w, ...table }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", ...texteSans(paysage ? 24 : 30, { fontWeight: 600, letterSpacing: "0.16em", color: "rgba(239,199,156,0.6)" }), paddingBottom: 14 }}>
          <span>EAU</span>
          <span>CAFÉ</span>
          <span>POUR</span>
        </div>
        {DOSES.map((d, i) => {
          const on = i === actif;
          return (
            <div key={d.eau} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", alignItems: "baseline", padding: "14px 0", borderTop: "1.5px solid rgba(239,199,156,0.18)", opacity: vu(f, d2.debut + i * 3).opacity * (on ? 1 : 0.5) }}>
              <span style={texteSerif(paysage ? 54 : 62)}>{d.eau}</span>
              <span style={texteSerif(paysage ? 54 : 62, { color: on ? C.crema : C.creme })}>{d.cafe}</span>
              <span style={texteSans(paysage ? 32 : 38)}>{d.usage}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: vu(f, d4.debut).opacity }}>
        <Toile>
          <Cuillere x={CU[0].x} y={CU[0].y} s={1.05} trace={prog(f, d4.debut, d4.debut + 24, DOUX)} plein={prog(f, d4.debut + 14, d4.debut + 30, SORTIE) * 0.62} />
          <Cuillere x={CU[1].x} y={CU[1].y} s={1.05} trace={prog(f, d4.debut + 8, d4.debut + 32, DOUX)} plein={prog(f, d4.debut + 22, d4.debut + 40, SORTIE)} />
        </Toile>
      </div>
      {[`5${FINE}g`, `8${FINE}g`].map((v, i) => (
        <div key={v} style={{ position: "absolute", left: CU[i].x + (paysage ? 360 : 330), top: CU[i].y - 70, ...vu(f, d4.debut + 16 + i * 8), ...texteSerif(110, { fontWeight: 450 }) }}>
          {v}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ── 4. La mouture ─────────────────────────────────────────────────────────────
const GRAINS = [
  { n: "Espresso", d: "fine", r: 2.2 },
  { n: "V60", d: "médium-fine", r: 3.4 },
  { n: "Moka", d: "médium", r: 4.2 },
  { n: "Piston", d: "grossière", r: 5.6 },
  { n: "Cold brew", d: "très grossière", r: 7 },
];

export const Mouture: React.FC = () => {
  const f = useCurrentFrame();
  const u2 = ph("u2"), u3 = ph("u3"), u4 = ph("u4");
  const xs = [330, 645, 960, 1275, 1590];
  const Y = 610;
  const anneau = prog(f, mot("u2", "médium-fine") - 4, mot("u2", "médium-fine") + 14, SORTIE);
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={u2.debut} puce="LA MOUTURE" titre="La variable qui compte le plus" taille={100} />
      <LegendeDe de={u2.debut} a={T.duree("mouture")} puce="LA MOUTURE" titre="Médium-fine" sous="comme du sucre semoule" accent={["Médium-fine"]} />
      <Toile>
        {GRAINS.map((g, k) => (
          <g key={g.n}>
            {Array.from({ length: 16 }, (_, j) => {
              const a = (j * 137.5 * Math.PI) / 180;
              const rr = 8 + 44 * Math.sqrt(j / 16);
              const t0 = u2.debut - 16 + k * 5 + j * 0.8;
              const p = prog(f, t0, t0 + 12, SORTIE);
              return <circle key={j} cx={xs[k] + rr * Math.cos(a)} cy={Y - 20 + rr * Math.sin(a) * 0.9 - (1 - p) * 60} r={g.r * 1.7} fill={C.cafeClair} opacity={p} />;
            })}
          </g>
        ))}
        <circle cx={xs[1]} cy={Y - 20} r={86} fill="none" stroke={C.crema} strokeWidth={3} strokeDasharray="6 8" opacity={anneau} />
        {/* plus fin, vers la gauche ; plus gros, vers la droite */}
        <Trace d={`M ${xs[1] - 30} ${Y + 170} L ${xs[0] - 40} ${Y + 170} M ${xs[0] - 22} ${Y + 156} L ${xs[0] - 40} ${Y + 170} L ${xs[0] - 22} ${Y + 184}`} p={prog(f, u3.debut, u3.debut + 20)} c="#d9582f" w={4} />
        <Trace d={`M ${xs[1] + 30} ${Y + 170} L ${xs[4] + 40} ${Y + 170} M ${xs[4] + 22} ${Y + 156} L ${xs[4] + 40} ${Y + 170} L ${xs[4] + 22} ${Y + 184}`} p={prog(f, u4.debut, u4.debut + 28)} c={C.feuilleClaire} w={4} />
      </Toile>
      {GRAINS.map((g, k) => (
        <div key={g.n} style={{ position: "absolute", left: xs[k] - 150, width: 300, top: Y + 52, textAlign: "center", ...vu(f, u2.debut - 6 + k * 5, undefined, 14) }}>
          <div style={texteSerif(46, { color: k === 1 && anneau > 0.5 ? C.crema : C.creme })}>{g.n}</div>
          <div style={texteSans(28, { marginTop: 4, color: "rgba(239,199,156,0.7)" })}>{g.d}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: Y + 200, width: 720, ...vu(f, u3.debut + 6) }}>
        <div style={texteSerif(50, { color: "#e0673f" })}>Plus fine</div>
        <div style={texteSans(32, { marginTop: 8 })}>l’eau coule moins vite : plus intense, jusqu’à l’amertume</div>
      </div>
      <div style={{ position: "absolute", left: 1040, top: Y + 200, width: 720, textAlign: "right", ...vu(f, u4.debut + 6) }}>
        <div style={texteSerif(50, { color: C.feuilleClaire })}>Plus grosse</div>
        <div style={texteSans(32, { marginTop: 8 })}>l’eau passe trop vite : plate, acide, aqueuse</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. L'eau ──────────────────────────────────────────────────────────────────
const EAUX = [
  { n: "Mont Blanc", v: 134, rang: "1re ex æquo", c: C.crema },
  { n: "Volvic", v: 130, rang: "1re ex æquo", c: C.crema },
  { n: "Rocheval", v: 240, rang: "3e", c: C.cafeClair },
  { n: "Cristaline", v: 477, rang: "5e", c: "#d9582f" },
];

export const Eau: React.FC = () => {
  const f = useCurrentFrame();
  const e2 = ph("e2"), e3 = ph("e3"), e4 = ph("e4");
  const x0 = 700, x1 = 1700;
  const sx = (v: number) => x0 + ((x1 - x0) * v) / 500;
  const bande = prog(f, e3.debut + 4, e3.debut + 26, SORTIE);
  const cible = prog(f, mot("e3", "cent cinquante") - 4, mot("e3", "cent cinquante") + 12, SORTIE);
  const graphe = vu(f, e3.debut - 6);
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={e2.debut - 6} puce="L’EAU" titre="L’essentiel de votre tasse" />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(f, e2.debut - 14, e2.debut - 6) }}>
        <Toile>
          <Trace
            d="M 1480 360 C 1540 440 1580 500 1580 560 C 1580 620 1535 660 1480 660 C 1425 660 1380 620 1380 560 C 1380 500 1420 440 1480 360 Z"
            p={prog(f, CARTE + 6, CARTE + 40, DOUX)}
            w={6}
            fill="rgba(239,199,156,0.08)"
          />
        </Toile>
      </div>
      <Sequence from={e2.debut - 4} durationInFrames={e3.debut - 8 - (e2.debut - 4)} layout="none">
        <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(f, e3.debut - 20, e3.debut - 8) }}>
          <Freeze frame={recale(f, [[e2.debut - 4, 0], [e3.debut - 20, 100]])}>
            <EauMethode temperature={93} puce="L’EAU" sous="le point de départ / pour la plupart des cafés" />
          </Freeze>
        </div>
      </Sequence>
      <LegendeDe de={e3.debut - 4} a={T.duree("eau")} puce="LES MINÉRAUX" titre={`Cible : 150${FINE}mg/L`} sous="plage SCAA : 75 à 250 mg/L" />
      <div style={{ position: "absolute", inset: 0, ...graphe }}>
        <Toile>
          <rect x={sx(75)} y={410} width={(sx(250) - sx(75)) * bande} height={420} fill="rgba(127,163,131,0.16)" />
          <line x1={sx(150)} y1={410} x2={sx(150)} y2={410 + 420 * cible} stroke={C.feuilleClaire} strokeWidth={3} strokeDasharray="8 10" />
          <line x1={x0} y1={832} x2={x1} y2={832} stroke="rgba(239,199,156,0.3)" strokeWidth={2} />
          {[0, 100, 200, 300, 400, 500].map((v) => (
            <text key={v} x={sx(v)} y={872} fill="rgba(239,199,156,0.55)" fontFamily="Instrument Sans" fontSize={24} textAnchor="middle">{v}</text>
          ))}
          {EAUX.map((e, k) => {
            const p = prog(f, e4.debut + 6 + k * 10, e4.debut + 30 + k * 10, SORTIE);
            const y = 440 + k * 96;
            return (
              <g key={e.n} opacity={prog(f, e4.debut + k * 10, e4.debut + 8 + k * 10)}>
                <text x={x0 - 22} y={y + 30} fill={C.creme} fontFamily="Newsreader" fontSize={40} textAnchor="end">{e.n}</text>
                <rect x={x0} y={y} width={(sx(e.v) - x0) * p} height={44} rx={8} fill={e.c} opacity={0.9} />
                <text x={x0 + (sx(e.v) - x0) * p + 18} y={y + 32} fill={C.creme} fontFamily="Instrument Sans" fontWeight={600} fontSize={28} opacity={p}>{`${e.v} mg/L · ${e.rang}`}</text>
              </g>
            );
          })}
        </Toile>
      </div>
      <div style={{ position: "absolute", left: x0, top: 910, ...vu(f, mot("e4", "une eau du robinet")), ...texteSans(32) }}>
        Le robinet, très calcaire : dernier.
      </div>
    </AbsoluteFill>
  );
};

// ── 6. La recette pas à pas (le poste du tuto, au rythme de la voix) ─────────
export const Recette: React.FC = () => {
  const f = useCurrentFrame();
  const r = Object.fromEntries(["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10"].map((id) => [id, ph(id)]));
  const finR = r.r5.debut - 4;
  const finV = r.r10.debut - 4;
  const etat =
    f < finR
      ? etatRincage(recale(f, [[CARTE, 0], [r.r1.fin + 4, 22], [r.r2.debut, 22], [r.r2.fin, 92], [r.r3.debut, 92], [r.r3.fin + 6, 128], [r.r4.debut, 128], [r.r4.fin, 175]]))
      : f < finV
        ? etatVersement(recale(f, [[finR, 0], [r.r5.fin, 100], [r.r6.debut, 100], [r.r6.fin + 4, 135], [r.r7.debut, 135], [r.r7.fin, 255], [r.r8.debut, 255], [r.r8.fin, 345], [r.r9.debut, 345], [r.r9.fin + 6, 450]]))
        : etatEcoulement(recale(f, [[finV, 0], [r.r10.fin, 105]]));
  const fin = T.duree("recette");
  return (
    <AbsoluteFill>
      <Station e={etat} />
      <LegendeDe de={r.r2.debut} a={r.r4.debut} puce="1" titre="Rincer le filtre" sous="100 g d’eau chaude, puis jeter l’eau" />
      <LegendeDe de={r.r4.debut} a={r.r5.debut} puce="2" titre="Ajouter le café" sous="15 g, puis tarer à zéro" />
      <LegendeDe de={r.r5.debut} a={r.r7.debut} puce="0:00" titre="Le bloom" sous="30 g d’eau, puis 30 s d’attente" />
      <LegendeDe de={r.r7.debut} a={r.r8.debut} puce="0:30" titre="Jusqu’à 150 g" sous="en spirale lente, du centre vers l’extérieur" />
      <LegendeDe de={r.r8.debut} a={r.r9.debut} puce="1:00" titre="Jusqu’à 200 g" sous="toujours en spirale" />
      <LegendeDe de={r.r9.debut} a={r.r10.debut} puce="1:30" titre="Jusqu’à 250 g" sous="finir au centre pour lisser le lit" />
      <LegendeDe de={r.r10.debut} a={fin} puce="2:30 – 3:30" puceFond="#4b6b4f" titre="Laisser couler" sous="le lit doit être à sec entre 2:30 et 3:30" />
    </AbsoluteFill>
  );
};

// ── 7. Trop rapide, trop lent (la scène du tuto, recalée) ─────────────────────
export const Diagnostic: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const g1 = ph("g1"), g2 = ph("g2"), g3 = ph("g3"), g4 = ph("g4");
  const image = recale(f, [[CARTE, 0], [g1.fin, 40], [g2.debut, 40], [g2.fin, 74], [g3.debut, 80], [g3.fin, 112], [g4.debut, 112], [g4.fin, 140]]);
  return (
    <AbsoluteFill>
      <Freeze frame={image}>
        <DiagnosticTuto />
      </Freeze>
      {/* En vertical, une seule ligne, au-dessus du bas de l'écran que couvre l'interface des Shorts. */}
      <div style={{ position: "absolute", left: paysage ? 120 : 80, top: paysage ? 790 : 1462, ...vu(f, g4.debut) }}>
        <div style={texteSerif(paysage ? 66 : 62, { fontStyle: "italic", fontWeight: 400, color: C.crema })}>Une seule variable à la fois.</div>
        {paysage ? <div style={texteSans(34, { marginTop: 12 })}>Et notez vos temps.</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ── 8. Trois erreurs ──────────────────────────────────────────────────────────
const ERREURS = [
  { id: "x2", t: "Sauter le rinçage", d: "le goût de papier reste" },
  { id: "x3", t: "Oublier le bloom", d: "le CO₂ empêche l’eau de mouiller le café" },
  { id: "x4", t: "Verser sur les bords", d: "l’eau contourne le café et dilue la tasse" },
];

export const Erreurs: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const debuts = ERREURS.map((e) => ph(e.id).debut);
  const actif = debuts.reduce((k, d, i) => (f >= d ? i : k), -1);
  const cases = paysage
    ? ERREURS.map((_, k) => ({ x: 120 + k * 580, y: 370, w: 540, h: 520, dx: 270, dy: 250 }))
    : ERREURS.map((_, k) => ({ x: 80, y: 470 + k * 330, w: 840, h: 300, dx: 180, dy: 210 }));
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={T.duree("erreurs")} puce="3 ERREURS" titre="À éviter" />
      {ERREURS.map((e, k) => {
        const c = cases[k];
        const s = vu(f, debuts[k], undefined, 30);
        const tr = prog(f, debuts[k] + 2, debuts[k] + 30, DOUX);
        return (
          <div key={e.id} style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 28, border: "2px solid rgba(239,199,156,0.22)", backgroundColor: "rgba(20,13,9,0.35)", ...s, opacity: s.opacity * (k === actif ? 1 : 0.55) }}>
            <svg width={c.w} height={c.h} style={{ position: "absolute", inset: 0 }}>
              {k === 0 ? <Filtre x={c.dx} y={c.dy - 115 * 0.72} s={0.72} trace={tr} /> : null}
              {k === 1 ? <Dripper x={c.dx} y={c.dy - 265 * 0.5 + 20} s={0.5} trace={tr} papier={tr} lit={tr} dome={0} /> : null}
              {k === 2 ? (
                <>
                  <Dripper x={c.dx} y={c.dy - 265 * 0.5 + 20} s={0.5} trace={tr} papier={tr} lit={tr} />
                  <Trace d={`M ${c.dx + 140} ${c.dy - 190} Q ${c.dx + 120} ${c.dy - 150} ${c.dx + 82} ${c.dy - 118}`} p={prog(f, debuts[k] + 20, debuts[k] + 40)} c="#d9582f" w={5} />
                </>
              ) : null}
            </svg>
            <div style={{ position: "absolute", right: 22, top: 22, width: 58, height: 58, borderRadius: 999, backgroundColor: C.cerise, color: C.creme, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 34, scale: String(mix(0.4, 1, prog(f, debuts[k] + 10, debuts[k] + 24, SORTIE))) }}>
              ✕
            </div>
            <div style={{ position: "absolute", left: paysage ? 34 : 350, right: 30, top: paysage ? 330 : 90 }}>
              <div style={texteSerif(paysage ? 50 : 58)}>{e.t}</div>
              <div style={texteSans(paysage ? 30 : 36, { marginTop: 10 })}>{e.d}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── 9. Quel café ──────────────────────────────────────────────────────────────
const ETIQUETTES = [
  { t: "Cafés d’origine", m: "cafés d'origine" },
  { t: "Torréfaction claire à médium", m: "torréfaction" },
  { t: "Floral", m: "florales" },
  { t: "Agrumes", m: "agrumes" },
  { t: "Fruits rouges", m: "fruits rouges" },
];

export const Cafe: React.FC = () => {
  const f = useCurrentFrame();
  const c2 = ph("c2");
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={T.duree("cafe")} puce="QUEL CAFÉ" titre="Clair à médium" sous="des cafés d’origine aux notes vives" />
      <div style={{ position: "absolute", left: 1000, top: 300, width: 820, display: "flex", flexWrap: "wrap", gap: 22 }}>
        {ETIQUETTES.map((e) => (
          <span key={e.t} style={{ display: "inline-block", padding: "16px 30px", borderRadius: 999, border: `2px solid ${C.feuilleClaire}`, backgroundColor: "rgba(75,107,79,0.18)", ...texteSans(36, { color: C.creme, fontWeight: 500 }), ...vu(f, mot("c1", e.m) - 4, undefined, 20) }}>
            {e.t}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 1000, top: 700, width: 820, ...vu(f, c2.debut) }}>
        <span style={{ display: "inline-block", padding: "16px 30px", borderRadius: 999, border: "2px solid #d9582f", backgroundColor: "rgba(184,64,31,0.18)", ...texteSans(36, { color: C.creme, fontWeight: 500 }) }}>
          Très torréfié, pensé pour l’espresso
        </span>
        <div style={texteSans(34, { marginTop: 22 })}>en V60 : souvent plat et amer</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 10. Récapitulatif (la carte de fin du tuto, recalée) ─────────────────────
export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const f1 = ph("f1"), f2 = ph("f2");
  return (
    <AbsoluteFill>
      <Freeze frame={recale(f, [[CARTE, 0], [f1.fin, 58], [f2.debut, 60], [f2.fin + 30, 120]])}>
        <Fin />
      </Freeze>
    </AbsoluteFill>
  );
};
