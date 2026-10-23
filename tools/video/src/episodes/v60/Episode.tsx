import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Dripper } from "../../dessins/Dripper";
import { Fond } from "../../dessins/Fond";
import { Format, FormatCtx } from "../../format";
import { C, FINE, SANS, SERIF } from "../../theme";
import { CarteChapitre, FinChapitre, Reperes } from "../habillage";
import { CARTE, Minutage } from "../temps";
import minutageBrut from "./minutage.json";
import { Cafe, Diagnostic, Dose, Eau, Erreurs, Materiel, Mouture, Ouverture, Pourquoi, Recap, Recette } from "./scenes";

// Épisode 1 de la série « les méthodes de A à Z » : le V60, 4 min 20, voix de synthèse et musique du tuto V60.
// La voix fixe le minutage (outils/narration.py → minutage.json), le mixage la piste son (outils/mixage.py).
const M = minutageBrut as Minutage;
export const V60_EPISODE_DUREE = M.duree;
const SERIE = "Le V60 de A à Z";

const SCENES: Record<string, React.FC> = {
  ouverture: Ouverture,
  pourquoi: Pourquoi,
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

export const V60Episode: React.FC<{ format?: Format }> = ({ format = "paysage" }) => {
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
        <Audio src={staticFile("audio/episode-v60-mix.wav")} />
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};

// Shorts : un chapitre seul, en vertical, avec sa part de la piste son. Le Short renvoie à l'épisode
// par le lien « vidéo associée » de YouTube ; sa carte d'ouverture n'a pas de numéro de chapitre.
export const V60_SHORTS = ["dose", "recette", "diagnostic", "erreurs"] as const;
export const dureeShort = (id: string) => {
  const c = M.chapitres.find((x) => x.id === id);
  if (!c) throw new Error(id);
  return c.fin - c.debut;
};

export const V60Short: React.FC<{ chapitre: string }> = ({ chapitre }) => {
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
        <Audio src={staticFile("audio/episode-v60-mix.wav")} startFrom={c.debut} endAt={c.fin} />
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};

// Miniature YouTube (1920 × 1080, réduite en 1280 × 720 à l'export).
export const V60EpisodeMiniature: React.FC = () => (
  <FormatCtx.Provider value="paysage">
    <AbsoluteFill>
      <Fond />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Dripper x={1420} y={200} s={1.62} trace={1} papier={1} lit={1} dome={10} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 210 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: "0.22em", color: "rgba(239,199,156,0.75)" }}>ÉPISODE 1</div>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 250, lineHeight: 0.95, color: C.creme, marginTop: 20 }}>Le V60</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 168, lineHeight: 1, color: C.crema, marginTop: 4 }}>de A à Z</div>
        <div style={{ display: "inline-block", marginTop: 54, padding: "18px 36px", borderRadius: 999, backgroundColor: C.cerise, color: C.creme, fontFamily: SANS, fontWeight: 600, fontSize: 46, letterSpacing: "0.02em" }}>
          {`15${FINE}g · 250${FINE}g · 93${FINE}°C`}
        </div>
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 54, fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: C.creme }}>
        filtré<span style={{ color: "#e0673f" }}>.</span>
      </div>
    </AbsoluteFill>
  </FormatCtx.Provider>
);
