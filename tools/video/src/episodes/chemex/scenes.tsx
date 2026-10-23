import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { Balance } from "../../dessins/Balance";
import { Bouilloire } from "../../dessins/Bouilloire";
import { BEC_CHEMEX, Chemex } from "../../dessins/Chemex";
import { Dripper } from "../../dessins/Dripper";
import { Trace } from "../../dessins/Trace";
import { ChemexCafe } from "../../chemex/Cafe";
import { PosteChemex } from "../../chemex/PosteChemex";
import {
  BLOOM_DUREE,
  CAFE_A,
  ECOULEMENT_DUREE,
  ETAPES,
  FILTRE_DUREE,
  RINCER_A,
  SERVIR_DUREE,
  VERSEMENTS_DUREE,
  etatBloom,
  etatEcoulement,
  etatFiltre,
  etatServir,
  etatVersements,
} from "../../chemex/etats";
import { ChemexDiagnostic, ChemexEau, ChemexFin, ChemexGarnie, ChemexPrincipe } from "../../chemex/scenes";
import { usePaysage } from "../../format";
import { C, DOUX, FINE, SANS, SORTIE, mix, prog } from "../../theme";
import { vu } from "../habillage";
import { CARTE, outilsTemps, recale } from "../temps";
import { LegendeDe, Toile, texteSans, texteSerif } from "../ui";
import minutage from "./minutage.json";
import narration from "./narration.json";

// Les scènes de l'épisode « La Chemex de A à Z ». Chaque scène lit l'image de son chapitre
// (0 = début de la carte de chapitre) et se cale sur les phrases de la voix. Le filtre, la mouture,
// l'eau, la recette, le diagnostic et la fiche de fin rejouent les scènes du tuto Chemex.
const T = outilsTemps(minutage, narration);
const { ph, mot } = T;

const pastille = (couleur: string, fond: string, taille = 36): React.CSSProperties => ({
  display: "inline-block",
  padding: "16px 30px",
  borderRadius: 999,
  border: `2px solid ${couleur}`,
  backgroundColor: fond,
  ...texteSans(taille, { color: C.creme, fontWeight: 500 }),
});

// ── 0. Ouverture ──────────────────────────────────────────────────────────────
const CHIFFRES = [
  { v: `45${FINE}g`, l: "de café", m: "Quarante-cinq" },
  { v: `750${FINE}g`, l: "d’eau", m: "sept cent cinquante" },
  { v: `94${FINE}°C`, l: "de température", m: "quatre-vingt-quatorze" },
  { v: `4–5${FINE}min`, l: "au total", m: "quatre à cinq" },
];
const SOMMAIRE = [
  { n: "02", t: "Le filtre", m: "le filtre" },
  { n: "04", t: "La dose", m: "la dose" },
  { n: "05", t: "La mouture", m: "la mouture" },
  { n: "06", t: "L’eau", m: "l'eau" },
  { n: "07", t: "La recette pas à pas", m: "la recette" },
  { n: "08", t: "Les réglages", m: "quoi régler" },
];

export const Ouverture: React.FC = () => {
  const f = useCurrentFrame();
  const o2 = ph("o2").debut;
  return (
    <AbsoluteFill>
      {CHIFFRES.map((c, i) => (
        <div key={c.v} style={{ position: "absolute", left: 120 + i * 420, width: 420, top: 330, textAlign: "center", ...vu(f, mot("o1", c.m), o2 - 10, 40) }}>
          <div style={texteSerif(116, { fontWeight: 450, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" })}>{c.v}</div>
          <div style={texteSans(34, { marginTop: 18, color: "rgba(239,199,156,0.75)" })}>{c.l}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: 210, ...vu(f, o2) }}>
        <div style={texteSerif(200, { fontWeight: 450 })}>La Chemex</div>
        <div style={texteSerif(132, { fontStyle: "italic", fontWeight: 400, color: C.crema, marginTop: 6 })}>de A à Z</div>
      </div>
      <Toile>
        <g opacity={prog(f, o2 - 2, o2 + 8)}>
          <ChemexGarnie x={1490} y={300} s={0.95} trace={prog(f, o2, o2 + 50, DOUX)} papier={prog(f, o2 + 24, o2 + 60)} />
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

// ── 1. Un objet de 1941 ──────────────────────────────────────────────────────
const MATIERES = [
  { t: "verre soufflé", m: "verre soufflé" },
  { t: "col de bois", m: "col de bois" },
  { t: "lien de cuir", m: "lien de cuir" },
  { t: "MoMA, New York", m: "MoMA" },
];

export const Pourquoi: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = ph("p1"), p2 = ph("p2"), p3 = ph("p3");
  return (
    <AbsoluteFill>
      <Toile>
        <ChemexGarnie x={1470} y={300} s={0.95} trace={prog(f, CARTE + 4, CARTE + 54, DOUX)} papier={prog(f, CARTE + 24, CARTE + 64)} niveau={mix(0, 0.7, prog(f, p3.debut, p3.fin, DOUX))} />
      </Toile>
      <div style={{ position: "absolute", left: 140, top: 280, ...vu(f, p1.debut, p2.debut - 8) }}>
        <div style={texteSans(30, { fontWeight: 600, letterSpacing: "0.2em", color: "rgba(239,199,156,0.7)" })}>PETER SCHLUMBOHM, CHIMISTE</div>
        <div style={texteSerif(170, { marginTop: 14, fontWeight: 450 })}>1941</div>
      </div>
      <div style={{ position: "absolute", left: 140, top: 300, width: 860, display: "flex", flexWrap: "wrap", gap: 22 }}>
        {MATIERES.map((m) => (
          <span key={m.t} style={{ ...pastille("rgba(239,199,156,0.5)", "rgba(239,199,156,0.08)", 38), ...vu(f, mot("p2", m.m) - 4, p3.debut - 8, 18) }}>{m.t}</span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, top: 330, width: 860, ...vu(f, p3.debut) }}>
        <div style={texteSerif(84)}>Elle infuse et sert</div>
        <div style={texteSerif(84, { fontStyle: "italic", fontWeight: 400, color: C.crema })}>dans le même objet</div>
        <div style={texteSans(38, { marginTop: 24 })}>pour deux ou trois personnes</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 2. Le filtre (la scène du tuto, puis le poste) ──────────────────────────
export const LeFiltre: React.FC = () => {
  const f = useCurrentFrame();
  const f1 = ph("f1"), f2 = ph("f2"), f3 = ph("f3"), f4 = ph("f4"), f5 = ph("f5");
  const fin = T.duree("filtre");
  const principe = f < f3.debut - 6;
  return (
    <AbsoluteFill>
      {principe ? (
        <AbsoluteFill style={{ opacity: 1 - prog(f, f3.debut - 18, f3.debut - 6) }}>
          <Freeze frame={recale(f, [[CARTE, 0], [f1.fin, 94], [f2.debut, 100], [f2.fin + 20, 200]])}>
            <ChemexPrincipe />
          </Freeze>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ opacity: prog(f, f3.debut - 6, f3.debut + 8) }}>
          <PosteChemex e={{ ...etatFiltre(recale(f, [[f3.debut, 0], [f4.fin, RINCER_A - 4]])), frame: f }} />
          <LegendeDe de={f3.debut} a={f5.debut} puce="LE FILTRE" titre="Côté triple contre le bec" taille={100} sous="l’air sort pendant que le café descend" />
          <LegendeDe de={f5.debut} a={fin} puce="PAS DE FILTRE V60" titre="Des filtres Chemex" sous="le papier épais fait la tasse" taille={100} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ── 3. Le matériel : trois objets ────────────────────────────────────────────
const OBJETS = [
  { id: "m2", t: "Une Chemex", d: `6 tasses, autour de 44${FINE}€` },
  { id: "m3", t: "Une bouilloire", d: "col de cygne, au moins 1 litre" },
  { id: "m4", t: "Une balance", d: "avec chronomètre" },
];

export const Materiel: React.FC = () => {
  const f = useCurrentFrame();
  const xs = [430, 960, 1500];
  const base = 790;
  const debuts = OBJETS.map((o) => ph(o.id).debut);
  const actif = debuts.reduce((k, d, i) => (f >= d ? i : k), -1);
  const tr = (k: number) => prog(f, debuts[k], debuts[k] + 34, DOUX);
  const flotte = (k: number) => Math.sin((f + k * 20) * 0.05) * 4;
  const net = (k: number) => (f < debuts[k] ? 0 : k === actif ? 1 : 0.5);
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={T.duree("materiel")} puce="MATÉRIEL" titre="Trois objets" />
      <Toile>
        <g opacity={net(0)} transform={`translate(0 ${flotte(0)})`}>
          <ChemexGarnie x={xs[0]} y={base - 600 * 0.66} s={0.66} trace={tr(0)} papier={0} />
        </g>
        <g opacity={net(1)} transform={`translate(0 ${flotte(1)})`}>
          <Bouilloire x={xs[1] + 70} y={base - 80 * 0.95} s={0.95} trace={tr(1)} />
        </g>
        <g opacity={net(2)} transform={`translate(0 ${flotte(2)})`}>
          <Balance x={xs[2]} y={base - 150 * 0.7} s={0.7} trace={tr(2)} poids={0} temps={0} />
        </g>
      </Toile>
      {OBJETS.map((o, k) => (
        <div key={o.id} style={{ position: "absolute", left: xs[k] - 220, width: 440, top: base + 42, textAlign: "center", ...vu(f, debuts[k] + 8, undefined, 16), opacity: vu(f, debuts[k] + 8).opacity * (k === actif ? 1 : 0.6) }}>
          <div style={texteSerif(52)}>{o.t}</div>
          <div style={texteSans(30, { marginTop: 8 })}>{o.d}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ── 4. La dose ────────────────────────────────────────────────────────────────
const DOSES = [
  { eau: "500 ml", cafe: `31 à 33${FINE}g`, p: "d2" },
  { eau: "600 ml", cafe: `37,5 à 40${FINE}g`, p: "d3" },
  { eau: "750 g", cafe: `45${FINE}g`, p: "d1" },
];

export const Dose: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const d1 = ph("d1"), d2 = ph("d2"), d3 = ph("d3"), d4 = ph("d4");
  const fin = T.duree("dose");
  const poids = mix(0, 45, prog(f, d1.debut + 4, d1.debut + 44, SORTIE));
  const actif = f >= d4.debut ? -1 : f >= d3.debut ? 1 : f >= d2.debut ? 0 : 2;
  const B = paysage ? { x: 1380, y: 470, s: 1.0 } : { x: 520, y: 880, s: 1.25 };
  const TB = paysage ? { x: 1020, y: 330, w: 760 } : { x: 90, y: 760, w: 880 };
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={d2.debut} puce="LA DOSE" titre={`45${FINE}g pour 750${FINE}g`} sous="soit un ratio de 1:16,7" accent={["1:16,7"]} taille={100} />
      <LegendeDe de={d2.debut} a={d4.debut} puce="AUTRES QUANTITÉS" titre="La même logique" sous="même ratio, moins d’eau" />
      <LegendeDe de={d4.debut} a={fin} puce="LE RATIO" titre="De 1:15 à 1:17" sous="vers 1:17 pour une tasse plus légère" />
      <div style={{ position: "absolute", inset: 0, opacity: vu(f, CARTE + 4, d2.debut - 6).opacity }}>
        <Toile>
          <Balance x={B.x} y={B.y} s={B.s} trace={prog(f, CARTE + 4, CARTE + 34, DOUX)} poids={poids} decimales temps={null} />
        </Toile>
      </div>
      <div style={{ position: "absolute", left: TB.x, top: TB.y, width: TB.w, ...vu(f, d2.debut - 2) }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", ...texteSans(paysage ? 24 : 30, { fontWeight: 600, letterSpacing: "0.16em", color: "rgba(239,199,156,0.6)" }), paddingBottom: 14 }}>
          <span>EAU</span>
          <span>CAFÉ</span>
        </div>
        {DOSES.map((d, i) => (
          <div key={d.eau} style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", alignItems: "baseline", padding: "14px 0", borderTop: "1.5px solid rgba(239,199,156,0.18)", opacity: vu(f, d2.debut + i * 3).opacity * (actif < 0 || i === actif ? 1 : 0.5) }}>
            <span style={texteSerif(paysage ? 54 : 68)}>{d.eau}</span>
            <span style={texteSerif(paysage ? 54 : 68, { color: i === actif ? C.crema : C.creme })}>{d.cafe}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── 5. La mouture (la pesée et la loupe du tuto, recalées) ───────────────────
export const Mouture: React.FC = () => {
  const f = useCurrentFrame();
  const u1 = ph("u1"), u2 = ph("u2"), u3 = ph("u3");
  return (
    <AbsoluteFill>
      <Freeze frame={recale(f, [[CARTE, 66], [u1.fin, 104], [u2.debut, 104], [u2.fin, 145]])}>
        <ChemexCafe puce="LA MOUTURE" />
      </Freeze>
      <div style={{ position: "absolute", left: 120, top: 760, width: 760, ...vu(f, u3.debut) }}>
        <span style={pastille("#d9582f", "rgba(184,64,31,0.18)")}>Une mouture de V60</span>
        <div style={texteSans(36, { marginTop: 20 })}>l’eau stagne dans le cône : plus de 5{FINE}min</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 6. L'eau (la scène du tuto, puis les températures par torréfaction) ─────
const TORREFACTIONS = [
  { t: "Claire", v: `93 à 96${FINE}°C`, m: "torréfaction claire" },
  { t: "Médium", v: `91 à 93${FINE}°C`, m: "Pour une médium" },
  { t: "Foncée", v: `85 à 90${FINE}°C`, m: "Pour une foncée" },
];

export const Eau: React.FC = () => {
  const f = useCurrentFrame();
  const e1 = ph("e1"), e2 = ph("e2");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - prog(f, e2.debut - 14, e2.debut - 2) }}>
        <Freeze frame={recale(f, [[CARTE, 0], [e1.fin + 16, 100]])}>
          <ChemexEau />
        </Freeze>
      </AbsoluteFill>
      <LegendeDe de={e2.debut} a={T.duree("eau")} puce="L’EAU" titre="Selon la torréfaction" taille={100} />
      <div style={{ position: "absolute", left: 1020, top: 330, width: 760, ...vu(f, e2.debut + 4) }}>
        {TORREFACTIONS.map((t, i) => (
          <div key={t.t} style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", alignItems: "baseline", padding: "18px 0", borderTop: "1.5px solid rgba(239,199,156,0.18)", ...vu(f, mot("e2", t.m) - 4, undefined, 12) }}>
            <span style={texteSerif(58)}>{t.t}</span>
            <span style={texteSerif(58, { color: C.crema })}>{t.v}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── 7. La recette pas à pas (le poste du tuto, au rythme de la voix) ─────────
export const Recette: React.FC = () => {
  const f = useCurrentFrame();
  const r = Object.fromEntries(["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"].map((id) => [id, ph(id)]));
  const retirer = mot("r8", "Retirez");
  const etat =
    f < r.r4.debut
      ? etatFiltre(recale(f, [[r.r1.fin, RINCER_A], [r.r2.debut, RINCER_A], [r.r2.fin + 6, CAFE_A], [r.r3.debut, CAFE_A], [r.r3.fin, FILTRE_DUREE]]))
      : f < r.r6.debut
        ? etatBloom(recale(f, [[r.r4.debut, 0], [r.r4.fin, 110], [r.r5.debut, 110], [r.r5.fin + 8, BLOOM_DUREE]]))
        : f < r.r8.debut
          ? etatVersements(recale(f, [[r.r6.debut, 0], [r.r6.fin + 8, ETAPES[1]], [r.r7.debut, ETAPES[1]], [r.r7.fin + 8, VERSEMENTS_DUREE]]))
          : f < retirer
            ? etatEcoulement(recale(f, [[r.r8.debut, 0], [retirer, ECOULEMENT_DUREE]]))
            : etatServir(recale(f, [[retirer, 0], [r.r8.fin + 30, SERVIR_DUREE]]));
  const fin = T.duree("recette");
  return (
    <AbsoluteFill>
      <PosteChemex e={{ ...etat, frame: f }} />
      <LegendeDe de={CARTE + 2} a={r.r2.debut} puce="LA RECETTE" titre="Pas à pas" sous={`45${FINE}g de café, 750${FINE}g d’eau`} />
      <LegendeDe de={r.r2.debut} a={r.r3.debut} puce="1" titre="Rincer, puis vider" sous="par le bec, filtre en place" />
      <LegendeDe de={r.r3.debut} a={r.r4.debut} puce="2" titre={`Verser les 45${FINE}g`} sous="égaliser le lit, tarer à zéro" />
      <LegendeDe de={r.r4.debut} a={r.r6.debut} puce="0:00" titre="Le bloom" sous={`90${FINE}g d’eau, puis 30${FINE}s`} />
      <LegendeDe de={r.r6.debut} a={r.r7.debut} puce="0:30" titre={`Jusqu’à 450${FINE}g`} sous="en spirales régulières" />
      <LegendeDe de={r.r7.debut} a={r.r8.debut} puce="PALIERS" titre={`Puis 600 et 750${FINE}g`} sous="l’eau sous le bord du filtre" taille={100} />
      <LegendeDe de={r.r8.debut} a={fin} puce={`4 À 5${FINE}MIN`} puceFond="#4b6b4f" titre="Laisser passer, servir" sous="au total, bloom compris" taille={100} />
    </AbsoluteFill>
  );
};

// ── 8. Trop rapide, trop lent (la scène du tuto, recalée) ─────────────────────
export const Diagnostic: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const g1 = ph("g1"), g2 = ph("g2"), g3 = ph("g3"), g4 = ph("g4");
  const image = recale(f, [[CARTE, 0], [g1.fin, 30], [g2.debut, 30], [g2.debut + 24, 60], [g2.fin, 76], [g3.debut, 84], [g3.debut + 24, 108], [g3.fin, 114], [g4.debut, 114], [g4.fin, 140]]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={paysage ? undefined : { scale: "0.86", transformOrigin: "80px 200px" }}>
        <Freeze frame={image}>
          <ChemexDiagnostic />
        </Freeze>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: paysage ? 120 : 80, top: paysage ? 790 : 1330, ...vu(f, g4.debut) }}>
        <div style={texteSerif(paysage ? 66 : 62, { fontStyle: "italic", fontWeight: 400, color: C.crema })}>Une seule variable à la fois.</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 9. Trois erreurs ──────────────────────────────────────────────────────────
const ERREURS = [
  { id: "x2", t: "Le côté simple contre le bec", d: "le papier se plaque, l’air ne sort plus" },
  { id: "x3", t: "La mouture du V60", d: "l’eau stagne, la tasse tourne amère" },
  { id: "x4", t: "Sauter le rinçage", d: "goût de papier, verre froid" },
];
const GOUTTE = "M 0 -34 C 16 -10 24 4 24 14 A 24 24 0 0 1 -24 14 C -24 4 -16 -10 0 -34 Z";

// Une Chemex dont l'eau reste dans le cône : le papier et son contenu entre les deux couches du verre.
const ChemexNoyee: React.FC<{ x: number; y: number; s: number; trace: number; eau: number }> = ({ x, y, s, trace, eau }) => (
  <g>
    <Chemex x={x} y={y} s={s} trace={trace} niveau={0.12} couche="arriere" />
    <Dripper x={x} y={y} s={s} corps={false} trace={trace} papier={1} papierMouille={1} lit={1} eau={eau} couche="arriere" />
    <Dripper x={x} y={y} s={s} corps={false} trace={trace} papier={1} papierMouille={1} lit={1} eau={eau} couche="avant" />
    <Chemex x={x} y={y} s={s} trace={trace} niveau={0.12} couche="avant" />
  </g>
);

export const Erreurs: React.FC = () => {
  const f = useCurrentFrame();
  const paysage = usePaysage();
  const debuts = ERREURS.map((e) => ph(e.id).debut);
  const actif = debuts.reduce((k, d, i) => (f >= d ? i : k), -1);
  const cases = paysage
    ? ERREURS.map((_, k) => ({ x: 120 + k * 580, y: 370, w: 540, h: 520 }))
    : ERREURS.map((_, k) => ({ x: 80, y: 470 + k * 330, w: 840, h: 300 }));
  // Le dessin en haut de la carte (paysage) ou à gauche (vertical) ; y = centre du bord du verre.
  const s0 = paysage ? 0.42 : 0.36;
  const bord = paysage ? 52 : 42;
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={T.duree("erreurs")} puce="3 ERREURS" titre="À éviter" />
      {ERREURS.map((e, k) => {
        const c = cases[k];
        const cx = paysage ? c.w / 2 : 170;
        const s = vu(f, debuts[k], undefined, 30);
        const tr = prog(f, debuts[k] + 2, debuts[k] + 30, DOUX);
        const croix = prog(f, debuts[k] + 20, debuts[k] + 32);
        return (
          <div key={e.id} style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 28, border: "2px solid rgba(239,199,156,0.22)", backgroundColor: "rgba(20,13,9,0.35)", ...s, opacity: s.opacity * (k === actif ? 1 : 0.55) }}>
            <svg width={c.w} height={c.h} style={{ position: "absolute", inset: 0 }}>
              {k === 0 ? (
                <>
                  <ChemexGarnie x={cx} y={bord} s={s0} trace={tr} papier={tr} />
                  <circle cx={cx + BEC_CHEMEX.x * s0} cy={bord + BEC_CHEMEX.y * s0} r={24} fill="none" stroke={C.ceriseVive} strokeWidth={5} opacity={croix} />
                </>
              ) : null}
              {k === 1 ? <ChemexNoyee x={cx} y={bord} s={s0} trace={tr} eau={mix(0.2, 0.95, prog(f, debuts[k] + 14, debuts[k] + 44, DOUX))} /> : null}
              {k === 2 ? (
                <>
                  <ChemexGarnie x={cx - 24} y={bord} s={s0} trace={tr} papier={tr} />
                  <g transform={`translate(${cx + (paysage ? 120 : 100)} ${bord + 70})`} opacity={tr}>
                    <path d={GOUTTE} fill="rgba(159,196,214,0.25)" stroke="#9fc4d6" strokeWidth={3} />
                  </g>
                  <Trace d={`M ${cx + (paysage ? 84 : 64)} ${bord + 26} L ${cx + (paysage ? 156 : 136)} ${bord + 112}`} p={croix} c={C.ceriseVive} w={6} />
                </>
              ) : null}
            </svg>
            <div style={{ position: "absolute", right: 22, top: 22, width: 58, height: 58, borderRadius: 999, backgroundColor: C.cerise, color: C.creme, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 34, scale: String(mix(0.4, 1, prog(f, debuts[k] + 10, debuts[k] + 24, SORTIE))) }}>
              ✕
            </div>
            <div style={{ position: "absolute", left: paysage ? 34 : 330, right: 30, top: paysage ? 330 : 80 }}>
              <div style={texteSerif(paysage ? 48 : 56)}>{e.t}</div>
              <div style={texteSans(paysage ? 30 : 36, { marginTop: 10 })}>{e.d}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── 10. Quel café ─────────────────────────────────────────────────────────────
const ETIQUETTES = [
  { t: "Kenya, torréfié clair", m: "Kenya" },
  { t: "Éthiopie floral", m: "Éthiopie" },
];

export const Cafe: React.FC = () => {
  const f = useCurrentFrame();
  const c3 = ph("c3");
  return (
    <AbsoluteFill>
      <LegendeDe de={CARTE + 2} a={T.duree("cafe")} puce="QUEL CAFÉ" titre="La clarté d’abord" sous="et l’acidité au premier plan" taille={100} />
      <div style={{ position: "absolute", left: 1000, top: 280, width: 820, display: "flex", flexWrap: "wrap", gap: 22 }}>
        {ETIQUETTES.map((e) => (
          <span key={e.t} style={{ ...pastille(C.feuilleClaire, "rgba(75,107,79,0.18)"), ...vu(f, mot("c2", e.m) - 4, undefined, 20) }}>{e.t}</span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 1000, top: 560, width: 820, ...vu(f, c3.debut) }}>
        <span style={pastille("#d9582f", "rgba(184,64,31,0.18)")}>Chocolaté, plus torréfié</span>
        <div style={texteSans(34, { marginTop: 18 })}>perd une partie de son corps : le papier retient les huiles</div>
      </div>
    </AbsoluteFill>
  );
};

// ── 11. Récapitulatif (la fiche de fin du tuto, recalée) ─────────────────────
export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const f6 = ph("f6"), f7 = ph("f7");
  return (
    <AbsoluteFill>
      <Freeze frame={recale(f, [[CARTE, 0], [f6.fin, 58], [f7.debut, 60], [f7.fin + 30, 120]])}>
        <ChemexFin />
      </Freeze>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC> = {
  ouverture: Ouverture,
  pourquoi: Pourquoi,
  filtre: LeFiltre,
  materiel: Materiel,
  dose: Dose,
  mouture: Mouture,
  eau: Eau,
  recette: Recette,
  diagnostic: Diagnostic,
  erreurs: Erreurs,
  cafe: Cafe,
  recap: Recap,
};
