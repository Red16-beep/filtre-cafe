import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Fond } from "../dessins/Fond";
import { Trace } from "../dessins/Trace";
import { vu } from "../episodes/habillage";
import { texteSans, texteSerif } from "../episodes/ui";
import { FormatCtx } from "../format";
import { C, DOUX, SANS, SERIF, SORTIE, mix, prog } from "../theme";

// Épingle vidéo Pinterest des fêtes (1000 × 1500, 2:3), lisible sans le son : quatre dates, du calendrier de
// l'avent à commander au cadeau du 24. Tous les chiffres viennent de journal/idees-cadeaux-cafe (calendriers,
// packs) et de journal/black-friday-cafe (la règle des -15 %) ; l'épingle renvoie vers le guide des cadeaux.
// Musique : MELODIE=celesta BATTERIE=jazz GRILLE=chemex node outils/musique-sf2.mjs fetes 28 2412.

const W = 1000;
// Débuts des scènes : ouverture, les quatre dates, puis l'adresse.
const S = [0, 105, 245, 380, 550, 710];
export const FETES_DUREE = 830;
const VERT = C.feuilleClaire;
const ROUGE = C.ceriseVive;
const ENCRE = "#2b1d15";

const DATES = [
  { jour: "20", sup: "", mois: "NOVEMBRE", kicker: "AVANT LE 20 NOVEMBRE", titre: "Commander son calendrier de l’avent" },
  { jour: "27", sup: "", mois: "NOVEMBRE", kicker: "LE 27 NOVEMBRE", titre: "Black Friday : repérer la vraie promo" },
  { jour: "1", sup: "er", mois: "DÉCEMBRE", kicker: "LE 1ER DÉCEMBRE", titre: "Ouvrir la première case" },
  { jour: "24", sup: "", mois: "DÉCEMBRE", kicker: "LE 24 DÉCEMBRE", titre: "Offrir le bon cadeau" },
];

// Une scène apparaît, puis s'efface sur ses 12 dernières images.
const Scene: React.FC<{ duree: number; children: React.ReactNode }> = ({ duree, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: 1 - prog(f, duree - 12, duree, DOUX) }}>{children}</AbsoluteFill>;
};

// ── Feuille d'éphéméride : le fil des quatre dates ──────────────────────────────
const Feuille: React.FC<{ d: (typeof DATES)[number]; style?: React.CSSProperties }> = ({ d, style }) => (
  <div style={{ position: "absolute", left: 70, top: 176, width: 250, height: 280, borderRadius: 22, backgroundColor: C.papier, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,0.35)", transformOrigin: "50% 0%", ...style }}>
    <div style={{ height: 74, backgroundColor: C.cerise, display: "flex", alignItems: "center", justifyContent: "center", ...texteSans(28, { fontWeight: 700, letterSpacing: "0.16em", color: C.creme }) }}>{d.mois}</div>
    <div style={{ height: 206, display: "flex", alignItems: "center", justifyContent: "center", ...texteSerif(168, { fontWeight: 500, color: ENCRE, lineHeight: 1 }) }}>
      {d.jour}
      {d.sup ? <span style={{ fontSize: 64, alignSelf: "flex-start", marginTop: 40 }}>{d.sup}</span> : null}
    </div>
  </div>
);

const Anneaux: React.FC = () => (
  <svg width={W} height={260} style={{ position: "absolute", left: 0, top: 150 }}>
    {[140, 250].map((x) => (
      <g key={x}>
        <rect x={x - 9} y={4} width={18} height={44} rx={9} fill={ENCRE} stroke={C.crema} strokeWidth={3} />
      </g>
    ))}
  </svg>
);

// La page du jour tient pendant sa scène, puis se tourne vers le haut au début de la suivante.
const Ephemeride: React.FC = () => {
  const f = useCurrentFrame();
  const entree = prog(f, S[1] - 2, S[1] + 16, SORTIE);
  const sortie = prog(f, S[5] - 12, S[5], DOUX);
  if (entree <= 0 || sortie >= 1) return null;
  return (
    <AbsoluteFill style={{ opacity: entree * (1 - sortie), translate: `0 ${(1 - entree) * 30}px`, perspective: 1400 }}>
      {DATES.map((d, k) => {
        const debut = S[k + 1];
        const fin = S[k + 2];
        if (f < debut - 2 || f > fin + 16) return null;
        const tourne = k < 3 ? prog(f, fin, fin + 14, DOUX) : 0;
        return <Feuille key={d.jour} d={d} style={{ zIndex: 10 - k, rotate: `x ${-100 * tourne}deg`, opacity: 1 - prog(tourne, 0.7, 1) }} />;
      })}
      <Anneaux />
    </AbsoluteFill>
  );
};

// Le titre de chaque date, à droite de la page.
const TitreDate: React.FC<{ k: number }> = ({ k }) => {
  const f = useCurrentFrame();
  const d = DATES[k];
  return (
    <div style={{ position: "absolute", left: 370, right: 60, top: 196 }}>
      <div style={{ ...texteSans(26, { fontWeight: 700, letterSpacing: "0.16em", color: C.crema }), ...vu(f, 8, undefined, 14) }}>{d.kicker}</div>
      <div style={{ ...texteSerif(66, { marginTop: 16, lineHeight: 1.05 }), ...vu(f, 12, undefined, 22) }}>{d.titre}</div>
    </div>
  );
};

// ── Dessins ─────────────────────────────────────────────────────────────────────
const Grain: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = -25 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse rx={13} ry={18} fill={C.cerise} />
    <path d="M 0 -14 C 6 -5 -6 5 0 14" stroke="#5a1f0d" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

const COTE = 96;
const ECART = 16;
const GX = (W - (6 * COTE + 5 * ECART)) / 2;
const GY = 540;
const caseXY = (i: number) => ({ x: GX + (i % 6) * (COTE + ECART), y: GY + Math.floor(i / 6) * (COTE + ECART) });

// Le calendrier de l'avent : 24 cases qui se dessinent, et s'ouvrent (charnière à gauche) sur deux grains.
const Calendrier: React.FC<{ trace: number; ouverture?: (i: number) => number }> = ({ trace, ouverture }) => (
  <svg width={W} height={1500} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 24 }, (_, i) => {
      const { x, y } = caseXY(i);
      const p = prog(trace, (i / 24) * 0.6, (i / 24) * 0.6 + 0.4);
      const o = ouverture ? ouverture(i) : 0;
      return (
        <g key={i}>
          {o > 0.25 ? (
            <g opacity={prog(o, 0.25, 0.6)}>
              <rect x={x} y={y} width={COTE} height={COTE} rx={14} fill="rgba(20,13,9,0.55)" />
              <Grain x={x + COTE * 0.36} y={y + COTE * 0.56} s={0.95} r={-28} />
              <Grain x={x + COTE * 0.64} y={y + COTE * 0.46} s={0.95} r={22} />
            </g>
          ) : null}
          <g transform={`translate(${x} ${y}) scale(${1 - 0.86 * o} 1)`} opacity={p}>
            <rect x={0} y={0} width={COTE} height={COTE} rx={14} fill={o > 0 ? C.espressoChaud : "rgba(239,199,156,0.06)"} />
          </g>
          <rect x={x} y={y} width={COTE} height={COTE} rx={14} fill="none" stroke={C.crema} strokeWidth={3.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={0.9} />
          <text x={x + 14} y={y + 34} fontFamily={SERIF} fontSize={26} fill={C.creme} opacity={p * (1 - 0.7 * o)}>
            {i + 1}
          </text>
        </g>
      );
    })}
  </svg>
);

// Étiquette de prix du Black Friday (repère : centre), la forme du Short.
const Etiquette: React.FC<{ x: number; y: number; trace: number }> = ({ x, y, trace }) => (
  <g transform={`translate(${x} ${y}) rotate(-8)`}>
    <Trace d="M -250 -130 L 170 -130 L 260 0 L 170 130 L -250 130 Q -280 130 -280 100 L -280 -100 Q -280 -130 -250 -130 Z" p={trace} w={6} fill="rgba(239,199,156,0.06)" />
    <circle cx={175} cy={0} r={22} fill="none" stroke={C.crema} strokeWidth={6} opacity={prog(trace, 0.7, 1)} />
  </g>
);

// Le paquet cadeau : boîte, ruban, nœud ; le couvercle se soulève.
const Cadeau: React.FC<{ x: number; y: number; trace: number; ouvre: number }> = ({ x, y, trace, ouvre }) => (
  <g transform={`translate(${x} ${y})`}>
    <Trace d="M -150 0 L 150 0 L 150 190 L -150 190 Z" p={prog(trace, 0, 0.5)} w={6} fill="rgba(239,199,156,0.06)" />
    <Trace d="M -20 0 L -20 190 M 20 0 L 20 190" p={prog(trace, 0.3, 0.7)} w={5} c={ROUGE} />
    <g transform={`translate(0 ${-36 * ouvre}) rotate(${-7 * ouvre})`}>
      <Trace d="M -168 -56 L 168 -56 L 168 0 L -168 0 Z" p={prog(trace, 0.15, 0.6)} w={6} fill="rgba(239,199,156,0.1)" />
      <Trace d="M -20 -56 L -20 0 M 20 -56 L 20 0" p={prog(trace, 0.4, 0.75)} w={5} c={ROUGE} />
      <Trace d="M 0 -56 C -26 -118 -112 -112 -84 -72 C -64 -50 -24 -56 0 -56 C 24 -56 64 -50 84 -72 C 112 -112 26 -118 0 -56" p={prog(trace, 0.55, 1)} w={5} c={ROUGE} />
    </g>
    {[
      [-120, -150, 0],
      [110, -170, 6],
      [0, -205, 12],
      [-60, -120, 18],
      [70, -125, 9],
    ].map(([sx, sy, r], i) => {
      const e = prog(ouvre, 0.2 + i * 0.1, 0.6 + i * 0.1);
      return <path key={i} d={`M ${sx} ${sy - 14} L ${sx + 4} ${sy - 4} L ${sx + 14} ${sy} L ${sx + 4} ${sy + 4} L ${sx} ${sy + 14} L ${sx - 4} ${sy + 4} L ${sx - 14} ${sy} L ${sx - 4} ${sy - 4} Z`} fill={C.crema} opacity={e * (0.6 + 0.4 * Math.sin(r))} transform={`rotate(${r} ${sx} ${sy})`} />;
    })}
  </g>
);

const Coche: React.FC = () => (
  <svg width={44} height={44} viewBox="0 0 44 44" style={{ flex: "none" }}>
    <circle cx={22} cy={22} r={19} fill="none" stroke={VERT} strokeWidth={3} />
    <path d="M 13 22.5 L 19.5 29 L 31 16" fill="none" stroke={VERT} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Une carte de deux lignes (grille 2 × 2 sous les dessins).
const Carte: React.FC<{ x: number; y: number; haut: string; bas: string; style?: React.CSSProperties; grand?: boolean }> = ({ x, y, haut, bas, style, grand }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 420, height: 136, borderRadius: 22, border: "2px solid rgba(239,199,156,0.22)", backgroundColor: "rgba(20,13,9,0.35)", padding: "18px 26px", ...style }}>
    <div style={texteSerif(grand ? 60 : 46, { lineHeight: 1, whiteSpace: "nowrap" })}>{haut}</div>
    <div style={texteSans(30, { marginTop: 12, color: "rgba(239,199,156,0.9)" })}>{bas}</div>
  </div>
);
const CASES = [
  { x: 70, y: 0 },
  { x: 510, y: 0 },
  { x: 70, y: 156 },
  { x: 510, y: 156 },
];

// ── Ouverture : les quatre dates ────────────────────────────────────────────────
const RESUME = [
  { date: "20 nov.", quoi: "commander le calendrier" },
  { date: "27 nov.", quoi: "le Black Friday" },
  { date: "1er déc.", quoi: "la première case" },
  { date: "24 déc.", quoi: "le cadeau" },
];

const Ouverture: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 250, ...vu(f, 0, undefined, 20) }}>
        <div style={texteSerif(140, { lineHeight: 1, whiteSpace: "nowrap" })}>Quatre dates</div>
        <div style={texteSerif(62, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 14 })}>pour offrir juste, au bon prix</div>
      </div>
      {RESUME.map((r, i) => (
        <div key={r.date} style={{ position: "absolute", left: 70, right: 70, top: 600 + i * 150, display: "flex", alignItems: "baseline", gap: 30, borderTop: "2px solid rgba(239,199,156,0.18)", paddingTop: 26, ...vu(f, 14 + i * 9, undefined, 18) }}>
          <span style={texteSerif(76, { width: 290, whiteSpace: "nowrap", color: i === 1 ? ROUGE : C.creme })}>{r.date}</span>
          <span style={texteSans(42, { color: "rgba(239,199,156,0.92)" })}>{r.quoi}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ── 20 novembre : commander le calendrier ──────────────────────────────────────
const CRITERES = ["En grain entier", "24 origines nommées", "15 à 20 g par dose"];

const Commander: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TitreDate k={0} />
      <Calendrier trace={prog(f, 10, 52, DOUX)} />
      <div style={{ position: "absolute", left: GX, top: 1010 }}>
        {CRITERES.map((c, i) => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 22, ...vu(f, 46 + i * 10, undefined, 16) }}>
            <Coche />
            <span style={texteSans(42, { color: C.creme })}>{c}</span>
          </div>
        ))}
        <div style={{ ...texteSerif(40, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 14 }), ...vu(f, 84, undefined, 14) }}>commandé à temps, il arrive pour le 1er décembre</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 27 novembre : le Black Friday ───────────────────────────────────────────────
const BlackFriday: React.FC = () => {
  const f = useCurrentFrame();
  const barre = prog(f, 44, 58, DOUX);
  return (
    <AbsoluteFill>
      <TitreDate k={1} />
      <svg width={W} height={1500} style={{ position: "absolute", inset: 0 }}>
        <g opacity={1 - 0.45 * barre}>
          <Etiquette x={480} y={700} trace={prog(f, 8, 40, DOUX)} />
        </g>
        <Trace d="M 260 790 L 700 610" p={barre} w={12} c={ROUGE} />
      </svg>
      <div style={{ position: "absolute", left: 110, width: 640, top: 628, textAlign: "center", rotate: "-8deg", ...texteSerif(136, { lineHeight: 1, whiteSpace: "nowrap" }), opacity: prog(f, 26, 40) * (1 - 0.45 * barre) }}>-30 %</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 930, ...vu(f, 60, undefined, 20) }}>
        <div style={texteSans(42, { color: C.creme })}>Une vraie promo, c’est au moins</div>
        <div style={texteSerif(200, { color: VERT, lineHeight: 1, marginTop: 6, whiteSpace: "nowrap" })}>-15 %</div>
        <div style={texteSans(42, { color: C.creme, marginTop: 6 })}>sous le prix habituel</div>
        <div style={{ ...texteSerif(40, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 30 }), ...vu(f, 84, undefined, 12) }}>les prix habituels, relevés le 9 octobre</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 1er décembre : la première case ─────────────────────────────────────────────
const CALENDRIERS = [
  { nom: "Arlo’s", fait: "30 g par case" },
  { nom: "Coffee Friend", fait: "24 g par case" },
  { nom: "19grams", fait: "24 pays" },
  { nom: "Kaffebox", fait: "50 g par case" },
];

const PremiereCase: React.FC = () => {
  const f = useCurrentFrame();
  // La case 1 s'ouvre d'abord, les 23 autres défilent comme les jours de décembre.
  const ouverture = (i: number) => (i === 0 ? prog(f, 10, 24, SORTIE) : prog(f, 30 + i * 1.4, 40 + i * 1.4, SORTIE));
  const glisse = prog(f, 70, 86, DOUX);
  return (
    <AbsoluteFill>
      <TitreDate k={2} />
      <div style={{ position: "absolute", inset: 0, scale: String(mix(1, 0.78, glisse)), transformOrigin: "50% 36%" }}>
        <Calendrier trace={1} ouverture={ouverture} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000 }}>
        <div style={{ ...texteSans(34, { textAlign: "center", color: C.crema, letterSpacing: "0.04em" }), ...vu(f, 74, undefined, 12) }}>quatre calendriers qui valent le coup</div>
        <div style={{ position: "relative", marginTop: 26 }}>
          {CALENDRIERS.map((c, i) => (
            <Carte key={c.nom} x={CASES[i].x} y={CASES[i].y} haut={c.nom} bas={c.fait} style={vu(f, 80 + i * 5, undefined, 18)} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 24 décembre : le cadeau ─────────────────────────────────────────────────────
const PACKS = [
  { prix: "~85 €", quoi: "moulin et V60" },
  { prix: "~100 €", quoi: "un calendrier" },
  { prix: "~175 €", quoi: "la station filtre" },
  { prix: "~665 €", quoi: "machine et moulin" },
];

const Cadeaux: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TitreDate k={3} />
      <svg width={W} height={1500} style={{ position: "absolute", inset: 0 }}>
        <Cadeau x={500} y={660} trace={prog(f, 6, 36, DOUX)} ouvre={prog(f, 38, 56, SORTIE)} />
      </svg>
      <div style={{ position: "absolute", left: 70, right: 70, top: 900, textAlign: "center", ...vu(f, 42, undefined, 16) }}>
        <div style={texteSerif(54, { fontStyle: "italic", fontWeight: 400, color: C.crema, lineHeight: 1.12 })}>Le moulin d’abord,</div>
        <div style={texteSerif(54, { fontStyle: "italic", fontWeight: 400, color: C.crema, lineHeight: 1.12 })}>jamais la machine seule.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1068 }}>
        {PACKS.map((p, i) => (
          <Carte key={p.prix} x={CASES[i].x} y={CASES[i].y} haut={p.prix} bas={p.quoi} grand style={vu(f, 52 + i * 6, undefined, 18)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── L'adresse ───────────────────────────────────────────────────────────────────
const Adresse: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 400, textAlign: "center" }}>
        <div style={{ ...texteSans(28, { fontWeight: 700, letterSpacing: "0.18em", color: C.crema }), ...vu(f, 4, undefined, 14) }}>TOUT EST DANS LE GUIDE</div>
        <div style={{ ...texteSerif(116, { marginTop: 26, lineHeight: 1 }), ...vu(f, 8, undefined, 22) }}>Idées cadeaux café</div>
        <div style={{ ...texteSerif(50, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 22 }), ...vu(f, 14, undefined, 18) }}>calendriers, packs et prix habituels</div>
        <div style={{ display: "inline-block", marginTop: 56, padding: "20px 44px", borderRadius: 999, backgroundColor: C.cerise, ...texteSans(48, { fontWeight: 700, color: C.creme }), ...vu(f, 22, undefined, 16) }}>filtre.cafe</div>
        <div style={{ marginTop: 120, ...texteSerif(150, { fontStyle: "italic", fontWeight: 500, lineHeight: 1 }), ...vu(f, 30, undefined, 16) }}>
          filtré<span style={{ color: ROUGE }}>.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SCENES: React.FC[] = [Ouverture, Commander, BlackFriday, PremiereCase, Cadeaux, Adresse];

export const FetesPinterest: React.FC = () => (
  <FormatCtx.Provider value="vertical">
    <AbsoluteFill>
      <Fond />
      {SCENES.map((Sc, k) => {
        const debut = S[k];
        const duree = (k + 1 < S.length ? S[k + 1] : FETES_DUREE) - debut;
        return (
          <Sequence key={k} from={debut} durationInFrames={duree} name={Sc.displayName ?? `scène ${k}`}>
            <Scene duree={k + 1 < S.length ? duree : duree + 30}>
              <Sc />
            </Scene>
          </Sequence>
        );
      })}
      <Ephemeride />
      <div style={{ position: "absolute", left: 70, top: 54, fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 54, color: C.creme }}>
        filtré<span style={{ color: C.cerise }}>.</span>
      </div>
      <div style={{ position: "absolute", right: 70, top: 74, display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: "0.16em", color: C.crema }}>
        <span style={{ width: 46, height: 2, background: C.cerise, display: "inline-block" }} />
        NOËL CAFÉ 2026
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1404, borderTop: "1.5px solid rgba(239,199,156,0.2)", paddingTop: 20, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 25, color: "rgba(239,199,156,0.75)" }}>
        <span style={{ fontWeight: 600, color: C.creme }}>filtre.cafe</span>
        <span>Guide indépendant du café de spécialité</span>
      </div>
      <Audio src={staticFile("audio/fetes-mix.wav")} />
    </AbsoluteFill>
  </FormatCtx.Provider>
);
