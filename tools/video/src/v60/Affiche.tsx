import { AbsoluteFill } from "remotion";
import { Fond } from "../dessins/Fond";
import { Station } from "../dessins/Station";
import { Format, FormatCtx } from "../format";
import { etatVersement } from "./etats";

const PUCES = ["15 g de café", "250 g d’eau", "93 °C"];

const Puces: React.FC<{ centre?: boolean }> = ({ centre }) => (
  <div style={{ display: "flex", gap: 22, justifyContent: centre ? "center" : "flex-start" }}>
    {PUCES.map((p, i) => (
      <div
        key={p}
        style={{
          padding: "16px 30px",
          borderRadius: 999,
          border: `2.5px solid ${i === 2 ? "#b8401f" : "rgba(239,199,156,0.55)"}`,
          backgroundColor: i === 2 ? "#b8401f" : "rgba(20,13,9,0.55)",
          color: "#f6f1ea",
          fontFamily: '"Instrument Sans", sans-serif',
          fontWeight: 600,
          fontSize: 46,
          whiteSpace: "nowrap",
        }}
      >
        {p}
      </div>
    ))}
  </div>
);

// Image fixe : vignette YouTube, image de l'article, poster de la vidéo.
const Affiche: React.FC<{ format: Format }> = ({ format }) => {
  const paysage = format === "paysage";
  const e = {
    ...etatVersement(190),
    spirale: null,
    cible: null,
    note: null,
    attente: null,
    camera: { s: paysage ? 1.03 : 1, x: 0, y: 0 },
  };
  return (
    <FormatCtx.Provider value={format}>
      <AbsoluteFill>
        <Fond />
        <Station e={e} />
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
              >
                La recette
              </div>
              <div
                style={{
                  fontFamily: "Newsreader, serif",
                  fontWeight: 500,
                  fontSize: 400,
                  lineHeight: 0.92,
                  color: "#f6f1ea",
                  marginLeft: -12,
                  marginTop: 18,
                }}
              >
                V60
              </div>
              <div style={{ marginTop: 44 }}>
                <Puces />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 120,
                bottom: 96,
                fontFamily: "Newsreader, serif",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 76,
                color: "#f6f1ea",
              }}
            >
              filtré<span style={{ color: "#b8401f" }}>.</span>
            </div>
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
              >
                La recette
              </div>
              <div
                style={{
                  fontFamily: "Newsreader, serif",
                  fontWeight: 500,
                  fontSize: 280,
                  lineHeight: 0.95,
                  color: "#f6f1ea",
                  marginTop: 10,
                }}
              >
                V60
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1540 }}>
              <Puces centre />
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 1690,
                textAlign: "center",
                fontFamily: "Newsreader, serif",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 76,
                color: "#f6f1ea",
              }}
            >
              filtré<span style={{ color: "#b8401f" }}>.</span>
            </div>
          </>
        )}
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};

export const V60Affiche: React.FC = () => <Affiche format="paysage" />;
export const V60AfficheVerticale: React.FC = () => <Affiche format="vertical" />;
