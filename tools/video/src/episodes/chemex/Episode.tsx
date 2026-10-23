import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Fond } from "../../dessins/Fond";
import { ChemexGarnie } from "../../chemex/scenes";
import { Format, FormatCtx } from "../../format";
import { C, FINE, SANS, SERIF } from "../../theme";
import { CarteChapitre, FinChapitre, Reperes } from "../habillage";
import { CARTE, Minutage } from "../temps";
import minutageBrut from "./minutage.json";
import { SCENES } from "./scenes";

// Épisode 3 de la série « les méthodes de A à Z » : la Chemex, voix de synthèse et musique du tuto Chemex.
// La voix fixe le minutage (outils/narration.py → minutage.json), le mixage la piste son (outils/mixage.py).
const M = minutageBrut as Minutage;
export const CHEMEX_EPISODE_DUREE = M.duree;
const SERIE = "La Chemex de A à Z";
const SON = "audio/episode-chemex-mix.wav";

export const ChemexEpisode: React.FC<{ format?: Format }> = ({ format = "paysage" }) => {
  const recap = M.chapitres[M.chapitres.length - 1];
  return (
    <FormatCtx.Provider value={format}>
      <AbsoluteFill>
        <Fond />
        {M.chapitres.map((c, i) => {
          const S = SCENES[c.id];
          const dernier = i === M.chapitres.length - 1;
          const d = dernier ? M.duree - c.debut : c.fin - c.debut;
          return (
            <Sequence key={c.id} from={c.debut} durationInFrames={d} name={`${c.num} ${c.titre}`}>
              <FinChapitre duree={dernier ? d + 30 : d} carte={Boolean(c.carte)}>
                <S />
              </FinChapitre>
              {c.carte ? (
                <Sequence durationInFrames={CARTE} layout="none" name="Carte">
                  <CarteChapitre num={c.num} titre={c.titre} serie={SERIE} />
                </Sequence>
              ) : null}
            </Sequence>
          );
        })}
        <Reperes chapitres={M.chapitres} finAdresse={recap.debut} />
        <Audio src={staticFile(SON)} />
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};

// Shorts : un chapitre seul, en vertical, avec sa part de la piste son (relié à l'épisode par « vidéo associée »).
export const CHEMEX_SHORTS = ["dose", "recette", "diagnostic", "erreurs"] as const;
export const dureeShortChemex = (id: string) => {
  const c = M.chapitres.find((x) => x.id === id);
  if (!c) throw new Error(id);
  return c.fin - c.debut;
};

export const ChemexShort: React.FC<{ chapitre: string }> = ({ chapitre }) => {
  const c = M.chapitres.find((x) => x.id === chapitre);
  if (!c) throw new Error(chapitre);
  const S = SCENES[c.id];
  const d = c.fin - c.debut;
  return (
    <FormatCtx.Provider value="vertical">
      <AbsoluteFill>
        <Fond />
        <FinChapitre duree={d + 30} carte>
          <S />
        </FinChapitre>
        <Sequence durationInFrames={CARTE} layout="none" name="Carte">
          <CarteChapitre num="" titre={c.titre} serie={SERIE} />
        </Sequence>
        <Audio src={staticFile(SON)} startFrom={c.debut} endAt={c.fin} />
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};

// Miniature YouTube (1920 × 1080, réduite en 1280 × 720 à l'export), sur le modèle de celle de l'espresso :
// la Chemex garnie à droite, la marque en bas à gauche.
export const ChemexEpisodeMiniature: React.FC = () => (
  <FormatCtx.Provider value="paysage">
    <AbsoluteFill>
      <Fond />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <ChemexGarnie x={1500} y={250} s={1.22} lit={0.9} niveau={0.75} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 210 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: "0.22em", color: "rgba(239,199,156,0.75)" }}>ÉPISODE 3</div>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 230, lineHeight: 0.95, color: C.creme, marginTop: 20 }}>La Chemex</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 168, lineHeight: 1, color: C.crema, marginTop: 4 }}>de A à Z</div>
        <div style={{ display: "inline-block", marginTop: 54, padding: "18px 36px", borderRadius: 999, backgroundColor: C.cerise, color: C.creme, fontFamily: SANS, fontWeight: 600, fontSize: 46, letterSpacing: "0.02em" }}>
          {`45${FINE}g · 750${FINE}g · 4–5${FINE}min`}
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 54, fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: C.creme }}>
        filtré<span style={{ color: "#e0673f" }}>.</span>
      </div>
    </AbsoluteFill>
  </FormatCtx.Provider>
);

// Image de la lettre, reliée à l'épisode : la miniature sans texte, un bouton de lecture à la place du titre.
// Rendue à 1200 px de large (--scale=0.625).
export const ChemexEpisodeLettre: React.FC = () => (
  <FormatCtx.Provider value="paysage">
    <AbsoluteFill>
      <Fond />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <ChemexGarnie x={1260} y={220} s={1.3} lit={0.9} niveau={0.75} />
        <circle cx={536} cy={540} r={140} fill={C.cerise} />
        <path d="M 489 461 L 489 619 L 626 540 Z" fill={C.creme} />
      </svg>
    </AbsoluteFill>
  </FormatCtx.Provider>
);
