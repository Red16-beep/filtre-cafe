import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { Balance } from "../../dessins/Balance";
import { PorteFiltre, Tamper, TasseEspresso } from "../../dessins/Espresso";
import { Moulin } from "../../dessins/Moulin";
import { Trace } from "../../dessins/Trace";
import { PosteEspresso } from "../../espresso/PosteEspresso";
import {
  DOSE_DUREE,
  PLACER_DUREE,
  SERVIR_DUREE,
  TASSER_DUREE,
  etatDose,
  etatExtraire,
  etatPlacer,
  etatServir,
  etatTasser,
} from "../../espresso/etats";
import { EspDiagnostic, EspFin, MachineComplete } from "../../espresso/scenes";
import { usePaysage } from "../../format";
import { C, DOUX, FINE, SANS, SORTIE, mix, prog } from "../../theme";
import { vu } from "../habillage";
import { CARTE, outilsTemps, recale } from "../temps";
import { LegendeDe, Toile, texteSans, texteSerif } from "../ui";
import minutage from "./minutage.json";
import narration from "./narration.json";

// Les scènes de l'épisode « L'espresso de A à Z ». Chaque scène lit l'image de son chapitre
// (0 = début de la carte de chapitre) et se cale sur les phrases de la voix. La recette, le
// diagnostic et la fiche de fin rejouent les scènes du tuto espresso au rythme de la voix.
const T = outilsTemps(minutage, narration);
const { ph, mot } = T;

// ── 0. Ouverture ──────────────────────────────────────────────────────────────
const CHIFFRES = [
  { v: `18${FINE}g`, l: "de café", m: "Dix-huit" },
  { v: `36${FINE}g`, l: "en tasse", m: "trente-six" },
  { v: `25–30${FINE}s`, l: "d’extraction", m: "vingt-cinq" },
];
const SOMMAIRE = [
  { n: "02", t: "Le matériel", m: "le matériel" },
  { n: "03", t: "La dose", m: "la dose" },
  { n: "04", t: "La mouture", m: "la mouture" },
  { n: "05", t: "La recette pas à pas", m: "la recette" },
  { n: "06", t: "Les réglages", m: "quoi régler" },
];

export const Ouverture: React.FC = () => {
  const f = useCurrentFrame();
  const o2 = ph("o2").debut;
  return (
    <AbsoluteFill>
      {CHIFFRES.map((c, i) => {
        const a = mot("o1", c.m);
        return (
          <div key={c.v} style={{ position: "absolute", left: 420 + i * 540 - 270, width: 540, top: 330, textAlign: "center", ...vu(f, a, o2 - 10, 40) }}>
            <div style={texteSerif(140, { fontWeight: 450, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" })}>{c.v}</div>
            <div style={texteSans(34, { marginTop: 18, color: "rgba(239,199,156,0.75)" })}>{c.l}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 140, top: 210, ...vu(f, o2) }}>
        <div style={texteSerif(200, { fontWeight: 450 })}>L’espresso</div>
        <div style={texteSerif(132, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 6 })}>de A à Z</div>
      </div>
      <Toile>
        <g opacity={prog(f, o2 - 2, o2 + 8)}>
          <MachineComplete x={1480} y={940} s={0.86} trace={prog(f, o2, o2 + 56, DOUX)} />
        </g>
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

// ── 1. Ce qu'est un espresso ─────────────────────────────────────────────────
const REPERES = [
  { v: `93${FINE}°C`, l: "l’eau", m: "quatre-vingt-treize" },
  { v: `9${FINE}bars`, l: "de pression", m: "neuf bars" },
  { v: `25–30${FINE}s`, l: "d’extraction", m: "vingt-cinq" },
];
const EQUILIBRE = [
  { t: "Acidité", d: "la vivacité", m: "acidité" },
  { t: "Sucres", d: "la rondeur", m: "sucres" },
  { t: "Amertume", d: "le corps", m: "amertume" },
];

export const Pourquoi: React.FC = () => {
  const f = useCurrentFrame();
  const p2 = ph("p2"), p3 = ph("p3");
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: prog(f, CARTE, CARTE + 20) }}>
        <PosteEspresso e={{ ...etatExtraire(110), frame: f, repere: null }} />
      </div>
      {REPERES.map((r, i) => (
        <div key={r.v} style={{ position: "absolute", left: 140, top: 250 + i * 190, display: "flex", alignItems: "baseline", gap: 28, ...vu(f, mot("p1", r.m) - 4, p2.debut - 8, 24) }}>
          <span style={texteSerif(128, { fontWeight: 450, fontVariantNumeric: "tabular-nums" })}>{r.v}</span>
          <span style={texteSans(36, { color: "rgba(239,199,156,0.75)" })}>{r.l}</span>
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: 230, ...vu(f, p2.debut, undefined, 20) }}>
        <div style={texteSans(30, { fontWeight: 600, letterSpacing: "0.2em", color: "rgba(239,199,156,0.7)" })}>UN ÉQUILIBRE</div>
      </div>
      {EQUILIBRE.map((e, i) => (
        <div key={e.t} style={{ position: "absolute", left: 140, top: 300 + i * 132, width: 760, display: "flex", alignItems: "baseline", gap: 26, ...vu(f, mot("p2", e.m) - 4, undefined, 20) }}>
          <span style={texteSerif(84)}>{e.t}</span>
          <span style={texteSerif(52, { fontStyle: "italic", fontWeight: 400, color: C.crema })}>pour {e.d}</span>
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: 760, ...vu(f, p3.debut) }}>
        <span style={{ display: "inline-block", padding: "16px 32px", borderRadius: 999, border: "2px solid rgba(239,199,156,0.5)", ...texteSerif(50, { fontStyle: "italic", fontWeight: 400, color: C.crema }) }}>
          sous une crema dense et persistante
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── 2. Le matériel : quatre objets, et le budget d'abord au moulin ───────────
const OBJETS = [
  { id: "m2", t: "Une machine*", d: "à porte-filtre, 9 bars" },
  { id: "m3", t: "Un moulin", d: "à meules, réglable finement" },
  { id: "m4", t: "Une balance", d: "au dixième de gramme" },
  { id: "m5", t: "Un tamper", d: "adapté au panier" },
];

export const Materiel: React.FC = () => {
  const f = useCurrentFrame();
  const xs = [330, 750, 1170, 1590];
  const base = 760;
  const m6 = ph("m6");
  const debuts = OBJETS.map((o) => ph(o.id).debut);
  // Sur le budget, le moulin reste seul en avant.
  const actif = f >= m6.debut ? 1 : debuts.reduce((k, d, i) => (f >= d ? i : k), -1);
  const tr = (k: number) => prog(f, debuts[k], debuts[k] + 34, DOUX);
  const flotte = (k: number) => Math.sin((f + k * 20) * 0.05) * 4;
  const net = (k: number) => (f < debuts[k] ? 0 : k === actif ? 1 : 0.45);
  const fin = T.duree("materiel");
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={m6.debut} puce="MATÉRIEL" titre="Quatre objets" />
      <LegendeDe de={m6.debut} a={fin} puce="LE BUDGET" titre="Le moulin d’abord" taille={92} sous="il compte plus que la machine" />
      <Toile>
        <g opacity={net(0)} transform={`translate(0 ${flotte(0)})`}>
          <MachineComplete x={xs[0]} y={base} s={0.44} trace={tr(0)} />
        </g>
        <g opacity={net(1)} transform={`translate(0 ${flotte(1)})`}>
          <Moulin x={xs[1]} y={base} s={0.74} trace={tr(1)} tour={prog(f, debuts[1] + 30, debuts[1] + 90, DOUX)} />
        </g>
        <g opacity={net(2)} transform={`translate(0 ${flotte(2)})`}>
          <Balance x={xs[2]} y={base - 150 * 0.46} s={0.46} trace={tr(2)} poids={0} decimales temps={null} />
        </g>
        <g opacity={net(3)} transform={`translate(0 ${flotte(3)})`}>
          <Tamper x={xs[3]} y={base} s={1.1} trace={tr(3)} />
        </g>
        <circle cx={xs[1]} cy={base - 160} r={172} fill="none" stroke={C.crema} strokeWidth={3} strokeDasharray="6 8" opacity={prog(f, m6.debut, m6.debut + 16, SORTIE)} />
      </Toile>
      {OBJETS.map((o, k) => (
        <div key={o.id} style={{ position: "absolute", left: xs[k] - 190, width: 380, top: base + 42, textAlign: "center", ...vu(f, debuts[k] + 8, undefined, 16), opacity: vu(f, debuts[k] + 8).opacity * (k === actif ? 1 : 0.55) }}>
          <div style={texteSerif(52)}>{o.t}</div>
          <div style={texteSans(30, { marginTop: 8 })}>{o.d}</div>
        </div>
      ))}
      {/* L'annotation de l'auteur : écrite, pas dite (la voix de synthèse ne dit pas « je »). */}
      <div style={{ position: "absolute", left: 140, top: 990, ...vu(f, debuts[0] + 20, undefined, 10), ...texteSans(28, { fontStyle: "italic", color: "rgba(239,199,156,0.7)" }) }}>
        * J’utilise une De’Longhi Specialista Arte.
      </div>
    </AbsoluteFill>
  );
};

// ── 3. La dose ────────────────────────────────────────────────────────────────
const RATIOS = [
  { r: 1.5, n: "Ristretto", d: "plus concentré", m: "un pour un et demi" },
  { r: 2, n: "Espresso", d: "le point d’équilibre", m: "" },
  { r: 3, n: "Lungo", d: "plus dilué", m: "un pour trois" },
];

export const Dose: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const d1 = ph("d1"), d2 = ph("d2"), d3 = ph("d3"), d4 = ph("d4");
  const fin = T.duree("dose");
  const poids = f < d2.debut ? mix(0, 18, prog(f, d1.debut + 4, d1.debut + 44, SORTIE)) : mix(18, 36, prog(f, d2.debut + 2, d2.debut + 40, SORTIE));
  const B = paysage ? { x: 1380, y: 470, s: 1.0 } : { x: 520, y: 1100, s: 1.25 };
  const E = paysage ? { x0: 980, x1: 1800, y: 560 } : { x0: 170, x1: 840, y: 1250 };
  const sx = (r: number) => E.x0 + ((E.x1 - E.x0) * (r - 1.5)) / 1.5;
  const tasse = paysage ? { x: 1380, y: 760, s: 2.3 } : { x: 540, y: 1480, s: 2.3 };
  const echelle = vu(f, d3.debut - 4, d4.debut - 8);
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={d2.debut} puce="LA DOSE" titre={`18${FINE}g de café`} sous="pesés, pas dosés à l’œil" />
      <LegendeDe de={d2.debut} a={d3.debut} puce="EN TASSE" titre={`36${FINE}g`} sous="un ratio de 1:2" accent={["1:2"]} />
      <LegendeDe de={d3.debut} a={d4.debut} puce="LE RATIO" titre="Plus court, plus long" sous="du ristretto au lungo" taille={100} />
      <LegendeDe de={d4.debut} a={fin} puce="PESEZ" titre="La crema trompe" sous={`36${FINE}g peuvent ressembler à 50${FINE}g`} taille={100} />
      <div style={{ position: "absolute", inset: 0, opacity: vu(f, CARTE + 4, d3.debut - 8).opacity }}>
        <Toile>
          <Balance x={B.x} y={B.y} s={B.s} trace={prog(f, CARTE + 4, CARTE + 34, DOUX)} poids={poids} decimales temps={null} />
        </Toile>
      </div>
      <div style={{ position: "absolute", inset: 0, ...echelle }}>
        <Toile>
          <line x1={E.x0 - 30} y1={E.y} x2={E.x1 + 30} y2={E.y} stroke="rgba(239,199,156,0.35)" strokeWidth={3} />
          {RATIOS.map((r) => {
            const on = r.r === 2;
            const p = r.m ? prog(f, mot("d3", r.m) - 4, mot("d3", r.m) + 10, SORTIE) : 1;
            return <circle key={r.n} cx={sx(r.r)} cy={E.y} r={on ? 18 : 13} fill={on ? C.crema : C.cafeClair} opacity={p} />;
          })}
        </Toile>
        {RATIOS.map((r) => {
          const on = r.r === 2;
          const p = r.m ? prog(f, mot("d3", r.m) - 4, mot("d3", r.m) + 10, SORTIE) : 1;
          return (
            <div key={r.n} style={{ position: "absolute", left: sx(r.r) - 170, width: 340, top: E.y - 150, textAlign: "center", opacity: p }}>
              <div style={texteSans(paysage ? 30 : 34, { fontWeight: 600, color: on ? C.crema : "rgba(239,199,156,0.75)" })}>{`1:${String(r.r).replace(".", ",")}`}</div>
              <div style={{ height: paysage ? 130 : 136 }} />
              <div style={texteSerif(paysage ? 50 : 56, { color: on ? C.crema : C.creme })}>{r.n}</div>
              <div style={texteSans(paysage ? 28 : 32, { marginTop: 6 })}>{r.d}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: vu(f, d4.debut).opacity }}>
        <Toile>
          <TasseEspresso x={tasse.x} y={tasse.y} s={tasse.s} trace={prog(f, d4.debut, d4.debut + 26, DOUX)} niveau={prog(f, d4.debut + 10, d4.debut + 40, SORTIE)} />
        </Toile>
      </div>
      <div style={{ position: "absolute", left: paysage ? 1040 : 140, width: paysage ? 680 : 800, top: paysage ? 360 : 1060, textAlign: "center", ...vu(f, mot("d4", "trente-six grammes peuvent")), ...texteSerif(paysage ? 64 : 70, { fontStyle: "italic", fontWeight: 400, color: C.crema }) }}>
        {`36${FINE}g ≈ 50${FINE}g à l’œil`}
      </div>
    </AbsoluteFill>
  );
};

// ── 4. La mouture ─────────────────────────────────────────────────────────────
const GRAINS = [
  { n: "Plus fine", r: 1.4 },
  { n: "Sable fin", r: 2.2 },
  { n: "Plus grosse", r: 3.6 },
];

export const Mouture: React.FC = () => {
  const f = useCurrentFrame();
  const u2 = ph("u2"), u3 = ph("u3"), u4 = ph("u4");
  const xs = [560, 960, 1360];
  const Y = 560;
  const anneau = prog(f, CARTE + 30, CARTE + 48, SORTIE);
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={u2.debut} puce="LA MOUTURE" titre="Fine" sous="proche du sable fin" accent={["Fine"]} />
      <LegendeDe de={u2.debut} a={T.duree("mouture")} puce="LA MOUTURE" titre="Un point de départ" sous="selon le café et sa fraîcheur" taille={100} />
      <Toile>
        {GRAINS.map((g, k) => (
          <g key={g.n}>
            {Array.from({ length: 16 }, (_, j) => {
              const a = (j * 137.5 * Math.PI) / 180;
              const rr = 8 + 44 * Math.sqrt(j / 16);
              const t0 = CARTE + 6 + k * 6 + j * 0.8;
              const p = prog(f, t0, t0 + 12, SORTIE);
              return <circle key={j} cx={xs[k] + rr * Math.cos(a)} cy={Y - 20 + rr * Math.sin(a) * 0.9 - (1 - p) * 60} r={g.r * 2.1} fill={C.cafeClair} opacity={p} />;
            })}
          </g>
        ))}
        <circle cx={xs[1]} cy={Y - 20} r={92} fill="none" stroke={C.crema} strokeWidth={3} strokeDasharray="6 8" opacity={anneau} />
        {/* plus fin, vers la gauche ; plus gros, vers la droite */}
        <Trace d={`M ${xs[1] - 110} ${Y + 170} L ${xs[0] - 160} ${Y + 170} M ${xs[0] - 142} ${Y + 156} L ${xs[0] - 160} ${Y + 170} L ${xs[0] - 142} ${Y + 184}`} p={prog(f, u4.debut, u4.debut + 20)} c="#d9582f" w={4} />
        <Trace d={`M ${xs[1] + 110} ${Y + 170} L ${xs[2] + 160} ${Y + 170} M ${xs[2] + 142} ${Y + 156} L ${xs[2] + 160} ${Y + 170} L ${xs[2] + 142} ${Y + 184}`} p={prog(f, u3.debut, u3.debut + 20)} c={C.feuilleClaire} w={4} />
      </Toile>
      {GRAINS.map((g, k) => (
        <div key={g.n} style={{ position: "absolute", left: xs[k] - 150, width: 300, top: Y + 92, textAlign: "center", ...vu(f, CARTE + 6 + k * 6, undefined, 14) }}>
          <div style={texteSerif(46, { color: k === 1 && anneau > 0.5 ? C.crema : C.creme })}>{g.n}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: Y + 220, width: 760, ...vu(f, u4.debut + 6) }}>
        <div style={texteSerif(50, { color: "#e0673f" })}>Trop fine</div>
        <div style={texteSans(32, { marginTop: 8 })}>l’eau peine à passer : le café tourne amer</div>
      </div>
      <div style={{ position: "absolute", left: 1020, top: Y + 220, width: 760, textAlign: "right", ...vu(f, u3.debut + 6) }}>
        <div style={texteSerif(50, { color: C.feuilleClaire })}>Trop grosse</div>
        <div style={texteSans(32, { marginTop: 8 })}>l’eau passe trop vite : acide et creux</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. La recette pas à pas (le poste du tuto, au rythme de la voix) ─────────
export const Recette: React.FC = () => {
  const f = useCurrentFrame();
  const r = Object.fromEntries(["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9"].map((id) => [id, ph(id)]));
  const etat =
    f < r.r3.debut
      ? etatDose(recale(f, [[r.r2.debut, 0], [r.r2.fin, DOSE_DUREE]]))
      : f < r.r5.debut
        ? etatTasser(recale(f, [[r.r3.debut, 0], [r.r3.fin + 10, TASSER_DUREE]]))
        : f < r.r6.debut
          ? etatPlacer(recale(f, [[r.r5.debut, 0], [r.r5.fin, PLACER_DUREE]]))
          : f < r.r9.debut
            ? etatExtraire(recale(f, [[r.r6.debut, 0], [r.r6.fin, 30], [r.r7.debut, 30], [r.r7.fin, 110], [r.r8.debut, 110], [r.r8.fin, 172]]))
            : etatServir(recale(f, [[r.r9.debut, 0], [r.r9.fin, SERVIR_DUREE]]));
  const fin = T.duree("recette");
  return (
    <AbsoluteFill>
      <PosteEspresso e={{ ...etat, frame: f }} />
      <LegendeDe de={r.r2.debut} a={r.r3.debut} puce="1" titre={`18${FINE}g de café`} sous="moulu fin, juste avant" />
      <LegendeDe de={r.r3.debut} a={r.r5.debut} puce="2" titre="Répartir, tasser" sous="droit, de niveau, ferme" />
      <LegendeDe de={r.r5.debut} a={r.r6.debut} puce="3" titre="En place" sous="la tasse sur la balance, à zéro" />
      <LegendeDe de={r.r6.debut} a={r.r9.debut} puce="4" titre={`36${FINE}g en 25 à 30${FINE}s`} taille={100} sous="le ratio 1:2" />
      <LegendeDe de={r.r9.debut} a={fin} puce="5" titre="Servir tout de suite" taille={100} sous="la crema retombe vite" />
    </AbsoluteFill>
  );
};

// ── 6. Trop rapide, trop lent : le dial-in (la scène du tuto, recalée) ───────
export const Diagnostic: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const g1 = ph("g1"), g2 = ph("g2"), g3 = ph("g3"), g4 = ph("g4"), g5 = ph("g5");
  const image = recale(f, [[CARTE, 0], [g1.fin, 40], [g2.debut, 40], [g2.fin, 74], [g3.debut, 80], [g3.fin, 112], [g4.debut, 112], [g4.fin, 140]]);
  return (
    <AbsoluteFill>
      {/* En vertical (Short), la scène du tuto est réduite pour passer à gauche de la colonne de boutons. */}
      <AbsoluteFill style={paysage ? undefined : { scale: "0.86", transformOrigin: "80px 200px" }}>
        <Freeze frame={image}>
          <EspDiagnostic />
        </Freeze>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: paysage ? 120 : 80, top: paysage ? 790 : 1300, ...vu(f, g4.debut) }}>
        <div style={texteSerif(paysage ? 66 : 62, { fontStyle: "italic", fontWeight: 400, color: C.crema })}>Un seul réglage à la fois.</div>
        <div style={{ ...texteSans(paysage ? 34 : 38, { marginTop: 12 }), ...vu(f, g5.debut, undefined, 12) }}>À refaire à chaque nouveau paquet.</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 7. Trois erreurs ──────────────────────────────────────────────────────────
const ERREURS = [
  { id: "x2", t: "Garder le même réglage", d: "le café vieillit, le paquet change" },
  { id: "x3", t: "Bâcler le tassage", d: "l’eau creuse un canal" },
  { id: "x4", t: "Du café pré-moulu", d: "arômes partis, crema effondrée" },
];

export const Erreurs: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const debuts = ERREURS.map((e) => ph(e.id).debut);
  const actif = debuts.reduce((k, d, i) => (f >= d ? i : k), -1);
  const cases = paysage
    ? ERREURS.map((_, k) => ({ x: 120 + k * 580, y: 370, w: 540, h: 520, dx: 270, dy: 250 }))
    : ERREURS.map((_, k) => ({ x: 80, y: 470 + k * 330, w: 840, h: 300, dx: 170, dy: 190 }));
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
              {k === 0 ? <Moulin x={c.dx} y={c.dy + 40} s={0.55} trace={tr} tour={prog(f, debuts[k] + 20, debuts[k] + 60, DOUX)} /> : null}
              {k === 1 ? (
                <>
                  <PorteFiltre x={c.dx - 70} y={c.dy - 40} trace={tr} dose={1} tasse={0.6} />
                  <Trace d={`M ${c.dx - 80} ${c.dy - 36} L ${c.dx - 62} ${c.dy - 18} L ${c.dx - 78} ${c.dy - 2} L ${c.dx - 60} ${c.dy + 16}`} p={prog(f, debuts[k] + 22, debuts[k] + 42)} c="#d9582f" w={5} />
                </>
              ) : null}
              {k === 2 ? <TasseEspresso x={c.dx} y={c.dy + 40} s={1.5} trace={tr} niveau={0.35} /> : null}
            </svg>
            <div style={{ position: "absolute", right: 22, top: 22, width: 58, height: 58, borderRadius: 999, backgroundColor: C.cerise, color: C.creme, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 34, scale: String(mix(0.4, 1, prog(f, debuts[k] + 10, debuts[k] + 24, SORTIE))) }}>
              ✕
            </div>
            <div style={{ position: "absolute", left: paysage ? 34 : 340, right: 30, top: paysage ? 330 : 90 }}>
              <div style={texteSerif(paysage ? 50 : 58)}>{e.t}</div>
              <div style={texteSans(paysage ? 30 : 36, { marginTop: 10 })}>{e.d}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── 8. Quel café ──────────────────────────────────────────────────────────────
const ETIQUETTES = [
  { t: "Torréfaction médium", m: "torréfaction médium" },
  { t: "Chocolat", m: "chocolat" },
  { t: "Caramel", m: "caramel" },
  { t: "Fruits cuits", m: "fruits cuits" },
];

export const Cafe: React.FC = () => {
  const f = useCurrentFrame();
  const c2 = ph("c2"), c3 = ph("c3");
  const pastille = (couleur: string, fond: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "16px 30px",
    borderRadius: 999,
    border: `2px solid ${couleur}`,
    backgroundColor: fond,
    ...texteSans(36, { color: C.creme, fontWeight: 500 }),
  });
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={T.duree("cafe")} puce="QUEL CAFÉ" titre="Médium pour débuter" sous="le plus indulgent" taille={100} />
      <div style={{ position: "absolute", left: 1000, top: 260, width: 820, display: "flex", flexWrap: "wrap", gap: 22 }}>
        {ETIQUETTES.map((e) => (
          <span key={e.t} style={{ ...pastille(C.feuilleClaire, "rgba(75,107,79,0.18)"), ...vu(f, mot("c1", e.m) - 4, undefined, 20) }}>
            {e.t}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 1000, top: 520, width: 820, ...vu(f, c2.debut) }}>
        <span style={pastille("#d9582f", "rgba(184,64,31,0.18)")}>Torréfaction claire</span>
        <div style={texteSans(34, { marginTop: 18 })}>superbe, mais un réglage plus serré et une eau un peu plus chaude</div>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 790, width: 820, ...vu(f, c3.debut) }}>
        <span style={pastille(C.crema, "rgba(239,199,156,0.12)")}>Torréfié il y a moins de 3 à 4 semaines</span>
      </div>
    </AbsoluteFill>
  );
};

// ── 9. Récapitulatif (la fiche de fin du tuto, recalée) ──────────────────────
export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const f1 = ph("f1"), f2 = ph("f2");
  return (
    <AbsoluteFill>
      <Freeze frame={recale(f, [[CARTE, 0], [f1.fin, 58], [f2.debut, 60], [f2.fin + 30, 120]])}>
        <EspFin />
      </Freeze>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC> = {
  ouverture: Ouverture,
  pourquoi: Pourquoi,
  materiel: Materiel,
  dose: Dose,
  mouture: Mouture,
  recette: Recette,
  diagnostic: Diagnostic,
  erreurs: Erreurs,
  cafe: Cafe,
  recap: Recap,
};

