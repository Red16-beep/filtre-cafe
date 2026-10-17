import { AbsoluteFill } from "remotion";
import { Fond } from "../dessins/Fond";
import { Format, FormatCtx } from "../format";

const Puces: React.FC<{ puces: string[]; centre?: boolean }> = ({ puces, centre }) => (
  <div style={{ display: "flex", gap: 22, justifyContent: centre ? "center" : "flex-start" }}>
    {puces.map((p, i) => {
      const fort = i === puces.length - 1;
      return (
        <div
          key={p}
          style={{
            padding: "16px 30px",
            borderRadius: 999,
            border: `2.5px solid ${fort ? "#b8401f" : "rgba(239,199,156,0.55)"}`,
            backgroundColor: fort ? "#b8401f" : "rgba(20,13,9,0.55)",
            color: "#f6f1ea",
            fontFamily: '"Instrument Sans", sans-serif',
            fontWeight: 600,
            fontSize: 46,
            whiteSpace: "nowrap",
          }}
        >
          {p}
        </div>
      );
    })}
  </div>
);

const Signature: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily: "Newsreader, serif",
      fontStyle: "italic",
      fontWeight: 500,
      fontSize: 76,
      color: "#f6f1ea",
      ...style,
    }}
  >
    filtré<span style={{ color: "#b8401f" }}>.</span>
  </div>
);

// Affiche commune : vignette YouTube, image de l'article, poster de la vidéo.
// Le poste (figé dans un bel instant) est fourni par la méthode.
export const AfficheMethode: React.FC<{
  format: Format;
  nom: string;
  surtitre?: string; // « La recette » par défaut
  tailleNom?: { paysage: number; vertical: number };
  puces: string[];
  poste: React.ReactNode;
}> = ({ format, nom, surtitre = "La recette", tailleNom = { paysage: 400, vertical: 280 }, puces, poste }) => {
  const paysage = format === "paysage";
  return (
    <FormatCtx.Provider value={format}>
      <AbsoluteFill>
        <Fond />
        {poste}
        {paysage ? (
          <>
            <div style={{ position: "absolute", left: 120, top: 150 }}>
              <div
                style={{
                  fontFamily: "Newsreader, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 116,
                  color: "#efc79c",
                  lineHeight: 1,
                }}
              >{surtitre}</div>
              <div
                style={{
                  fontFamily: "Newsreader, serif",
                  fontWeight: 500,
                  fontSize: tailleNom.paysage,
                  lineHeight: 0.92,
                  color: "#f6f1ea",
                  marginLeft: -12,
                  marginTop: 18,
                  whiteSpace: "nowrap",
                }}
              >
                {nom}
              </div>
              <div style={{ marginTop: 44 }}>
                <Puces puces={puces} />
              </div>
            </div>
            <Signature style={{ left: 120, bottom: 96 }} />
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Newsreader, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 96,
                  color: "#efc79c",
                  lineHeight: 1,
                }}
              >{surtitre}</div>
              <div
                style={{
                  fontFamily: "Newsreader, serif",
                  fontWeight: 500,
                  fontSize: tailleNom.vertical,
                  lineHeight: 0.95,
                  color: "#f6f1ea",
                  marginTop: 10,
                  whiteSpace: "nowrap",
                }}
              >
                {nom}
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1540 }}>
              <Puces puces={puces} centre />
            </div>
            <Signature style={{ left: 0, right: 0, top: 1690, textAlign: "center" }} />
          </>
        )}
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};
