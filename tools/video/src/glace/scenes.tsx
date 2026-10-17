import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from "remotion";
import { Carafe } from "../dessins/Carafe";
import { Station } from "../dessins/Station";
import { Vapeur } from "../dessins/Vapeur";
import { usePaysage } from "../format";
import { EauMethode } from "../scenes/EauMethode";
import { FinMethode } from "../scenes/FinMethode";
import { TitreMethode } from "../scenes/TitreMethode";
import { C, SANS, SERIF, SORTIE, cles, prog } from "../theme";
import { Legende } from "../ui/Legende";
import {
  BLOOM_G_DUREE,
  CAFE_G,
  ETAPES_G,
  FILTRE_G_DUREE,
  GLACE_ARRIVE,
  REMUER_DUREE,
  SERVIR,
  VERSEMENTS_G_DUREE,
  etatBloomG,
  etatFiltreG,
  etatRemuer,
  etatVersementsG,
} from "./etats";

// Café glacé (flash brew) : tout ce qui est dit ici vient de l'article cafe-glace-maison.
const NB = " ";
const VERT = C.feuille;

export const GlaceTitre: React.FC = () => (
  <TitreMethode
    surtitre="Le flash brew"
    nom="Café glacé"
    tailleNom={190}
    puces={[`22${NB}g de café`, `220${NB}g d’eau`, `150${NB}g de glace`]}
    objet={{ vertical: { x: 540, y: 1226, s: 1.85 }, paysage: { x: 1460, y: 868, s: 1.85 } }}
    sol={{ vertical: 1228, paysage: 870 }}
    dessin={({ x, y, s, trace, frame }) => (
      <Carafe
        x={x}
        y={y}
        s={s}
        trace={trace}
        glace={prog(frame, 40, 78, (t) => t)}
        chute={150}
        niveau={cles(frame, [
          [70, 0],
          [104, 0.62],
        ])}
        teinte={1}
        buee={prog(frame, 74, 105)}
      />
    )}
  />
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

// Un bloc d'eau : contour au trait, remplissage qui monte, poids au centre.
const Bloc: React.FC<{ x: number; y: number; w: number; h: number; plein: number; couleur: string; texte: string; trace: number; glace?: boolean }> = ({
  x,
  y,
  w,
  h,
  plein,
  couleur,
  texte,
  trace,
  glace,
}) => (
  <g opacity={trace}>
    <clipPath id={`bloc-g-${x}`}>
      <rect x={x} y={y} width={w} height={h} rx={18} />
    </clipPath>
    <g clipPath={`url(#bloc-g-${x})`}>
      <rect x={x} y={y + h * (1 - plein)} width={w} height={h * plein} fill={couleur} opacity={glace ? 0.16 : 0.85} />
      {glace
        ? [0, 1, 2, 3, 4, 5].map((k) => {
            const cx = x + 44 + (k % 2) * (w - 88);
            const cy = y + h - 58 - Math.floor(k / 2) * 76;
            return cy > y + h * (1 - plein) + 20 ? (
              <rect
                key={k}
                x={cx - 28}
                y={cy - 28}
                width={56}
                height={56}
                rx={12}
                transform={`rotate(${(k * 37) % 24 - 12} ${cx} ${cy})`}
                fill="#f6f1ea"
                fillOpacity={0.14}
                stroke={C.creme}
                strokeOpacity={0.6}
                strokeWidth={2.5}
              />
            ) : null;
          })
        : null}
    </g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke={glace ? C.creme : C.crema} strokeWidth={4} />
    <text
      x={x + w / 2}
      y={y + h / 2 + 18}
      textAnchor="middle"
      style={{ fontFamily: SANS, fontWeight: 600, fontSize: 50 }}
      fill={C.creme}
      opacity={prog(plein, 0.4, 1)}
    >
      {texte}
    </text>
  </g>
);

// ── L'erreur, puis le principe ───────────────────────────────────────────────
export const PRINCIPE_G_DUREE = 240;
const BASCULE = 112;
export const GlacePrincipe: React.FC = () => {
  const f = useCurrentFrame();
  const a = 1 - prog(f, BASCULE - 12, BASCULE);
  const b = prog(f, BASCULE, BASCULE + 12);
  // L'erreur : un café chaud qui tiédit vingt minutes, puis trois glaçons qui fondent.
  const vapeur = 1 - prog(f, 22, 60);
  const minutes = prog(f, 18, 60, (t) => t);
  const glacons = prog(f, 62, 84, (t) => t);
  const fonte = prog(f, 78, 104);
  const teinte = 1 - 0.45 * fonte - 0.12 * prog(f, 22, 60);
  const niveau = 0.5 + 0.12 * fonte;
  // Le flash brew : 220 g d'eau chaude + 150 g de glace, ratio autour de 1:17.
  const H = 1.5;
  const BAS = 1330;
  const pc = prog(f, BASCULE + 8, BASCULE + 34, Easing.inOut(Easing.quad));
  const pg = prog(f, BASCULE + 24, BASCULE + 50, Easing.inOut(Easing.quad));
  const signe = prog(f, BASCULE + 18, BASCULE + 30, SORTIE);
  const ratio = prog(f, BASCULE + 58, BASCULE + 76, SORTIE);
  const arc = (p: number) => {
    const an = p * Math.PI * 2;
    return p >= 0.999
      ? "M 860 880 A 74 74 0 1 1 859.99 880"
      : `M 860 880 A 74 74 0 ${an > Math.PI ? 1 : 0} 1 ${860 + Math.sin(an) * 74} ${954 - Math.cos(an) * 74}`;
  };
  return (
    <AbsoluteFill name="Principe">
      <Sequence name="Erreur" durationInFrames={BASCULE} layout="none">
        <Legende puce="L’ERREUR" titre="Laisser refroidir" sous="il s’oxyde, puis la glace le dilue" duree={BASCULE} />
      </Sequence>
      <Sequence name="Flash brew" from={BASCULE - 2} durationInFrames={PRINCIPE_G_DUREE - BASCULE + 2} layout="none">
        <Legende puce="LE FLASH BREW" puceFond={VERT} titre="Chaud, sur la glace" sous="la glace compte comme de l’eau" accent={["glace"]} />
      </Sequence>
      <Dessin>
        {a > 0 ? (
          <g opacity={a}>
            <Carafe x={480} y={1400} s={1.45} niveau={niveau} teinte={teinte} glace={glacons} glacons={[4, 5, 6]} fonte={fonte} />
            <Vapeur x={480} y={1400 - 250} frame={f} intensite={vapeur} hauteur={190} ecart={26} />
            {/* Vingt minutes sur le plan de travail */}
            <g opacity={prog(f, 12, 24)}>
              <circle cx={860} cy={954} r={74} fill="none" stroke={C.crema} strokeWidth={7} opacity={0.2} />
              {minutes > 0.002 ? <path d={arc(minutes)} fill="none" stroke={C.ceriseVive} strokeWidth={7} strokeLinecap="round" /> : null}
              <text x={860} y={970} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 52 }} fill={C.creme}>
                {Math.round(minutes * 20)}
              </text>
              <text x={860} y={1070} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 32, letterSpacing: "0.08em" }} fill={C.crema} opacity={0.8}>
                MINUTES
              </text>
            </g>
            <text x={480} y={1500} textAnchor="middle" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 58 }} fill={C.crema} opacity={prog(f, 40, 54)}>
              oxydation
            </text>
            <text x={480} y={1572} textAnchor="middle" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 58 }} fill={C.crema} opacity={prog(f, 86, 100)}>
              + dilution
            </text>
          </g>
        ) : null}
        {b > 0 ? (
          <g opacity={b}>
            <Bloc x={110} y={BAS - 220 * H} w={300} h={220 * H} plein={pc} couleur={C.cerise} texte={`220${NB}g`} trace={1} />
            <Bloc x={590} y={BAS - 150 * H} w={300} h={150 * H} plein={pg} couleur={C.creme} texte={`150${NB}g`} trace={prog(f, BASCULE + 16, BASCULE + 28)} glace />
            <text x={500} y={BAS - 110} textAnchor="middle" style={{ fontFamily: SERIF, fontSize: 110 }} fill={C.crema} opacity={signe}>
              +
            </text>
            <text x={260} y={BAS + 62} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 40 }} fill={C.crema} opacity={pc}>
              eau chaude
            </text>
            <text x={740} y={BAS + 62} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 40 }} fill={C.crema} opacity={pg}>
              glace
            </text>
            <g opacity={ratio} transform={`translate(0 ${(1 - ratio) * 24})`}>
              <text x={500} y={BAS + 196} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 108 }} fill={C.creme}>
                ≈ 1:17
              </text>
              <text x={500} y={BAS + 252} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 38 }} fill={C.crema}>
                {`avec 22${NB}g de café`}
              </text>
            </g>
          </g>
        ) : null}
      </Dessin>
    </AbsoluteFill>
  );
};

export const GlaceEau: React.FC = () => <EauMethode puce="L’EAU" temperature={93} sous={`220${NB}g d’eau chaude en tout`} />;

export const GlaceFiltre: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Filtre et glace">
      <Station e={etatFiltreG(frame)} />
      <Sequence name="Rincer" durationInFrames={GLACE_ARRIVE} layout="none">
        <Legende puce="LE FILTRE" titre="Rincer le filtre" sous="puis jeter l’eau de rinçage" duree={GLACE_ARRIVE} />
      </Sequence>
      <Sequence name="Glace" from={GLACE_ARRIVE - 4} durationInFrames={CAFE_G - GLACE_ARRIVE + 8} layout="none">
        <Legende
          puce="LA GLACE"
          titre={`150${NB}g de glaçons`}
          sous="dans la carafe, sous le dripper"
          accent={["glaçons"]}
          duree={CAFE_G - GLACE_ARRIVE + 8}
        />
      </Sequence>
      <Sequence name="Café" from={CAFE_G} durationInFrames={FILTRE_G_DUREE - CAFE_G} layout="none">
        <Legende puce="LE CAFÉ" titre="Ajouter le café" sous="égaliser le lit, puis tarer à zéro" duree={FILTRE_G_DUREE - CAFE_G} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const GlaceBloom: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Dégazage">
      <Station e={etatBloomG(frame)} />
      <Legende puce="0:00" titre={`Jusqu’à 50${NB}g`} sous={`à 93${NB}°C, dégazer 30 à 40 s`} duree={BLOOM_G_DUREE} />
    </AbsoluteFill>
  );
};

export const GlaceVersements: React.FC = () => {
  const frame = useCurrentFrame();
  const fin2 = VERSEMENTS_G_DUREE - ETAPES_G[1];
  return (
    <AbsoluteFill name="Versements">
      <Station e={etatVersementsG(frame)} />
      <Sequence name="220 g" durationInFrames={ETAPES_G[1]} layout="none">
        <Legende puce="APRÈS 30 À 40 S" titre={`Jusqu’à 220${NB}g`} sous={`spirales lentes, en deux ou trois${NB}fois`} duree={ETAPES_G[1]} />
      </Sequence>
      <Sequence name="Choc" from={ETAPES_G[1]} durationInFrames={fin2} layout="none">
        <Legende puce="SUR LA GLACE" puceFond={VERT} titre="Choc thermique" sous="le café chaud refroidit d’un coup" duree={fin2} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const GlaceRemuer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Remuer">
      <Station e={etatRemuer(frame)} />
      <Sequence name="Remuer" durationInFrames={SERVIR} layout="none">
        <Legende puce="ÉCOULEMENT FINI" titre="Remuer" sous="pour homogénéiser" duree={SERVIR} />
      </Sequence>
      <Sequence name="Servir" from={SERVIR - 4} durationInFrames={REMUER_DUREE - SERVIR + 4} layout="none">
        <Legende puce="TOUT DE SUITE" puceFond={VERT} titre="Servir tel quel" sous="ou sur quelques glaçons frais" />
      </Sequence>
    </AbsoluteFill>
  );
};

export const GlaceFin: React.FC = () => (
  <FinMethode
    titre="Le café glacé"
    lignes={[
      { l: "Glace", v: `150${NB}g dans la carafe` },
      { l: "Café", v: `22${NB}g, un cran plus fin` },
      { l: "Dégazage", v: `50${NB}g, 30 à 40 s` },
      { l: "Eau", v: `220${NB}g à 93${NB}°C` },
      { l: "Ratio", v: "autour de 1:17" },
    ]}
    url="filtre.cafe/journal/cafe-glace-maison"
  />
);
