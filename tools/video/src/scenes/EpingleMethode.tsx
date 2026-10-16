import { AbsoluteFill } from "remotion";
import { Fond } from "../dessins/Fond";
import { FormatCtx } from "../format";

// Épingle Pinterest 1000 × 1500 : même gabarit que les épingles du site
// (logo en haut, filtre.cafe en pied), avec le poste dessiné au centre.
export const EpingleMethode: React.FC<{
  nom: string;
  tailleNom?: number;
  accroche: string;
  puces: string[];
  poste: React.ReactNode;
}> = ({ nom, tailleNom = 200, accroche, puces, poste }) => (
  <FormatCtx.Provider value="vertical">
    <AbsoluteFill>
      <Fond />
      {poste}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 54,
          fontFamily: "Newsreader, serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 54,
          color: "#f6f1ea",
        }}
      >
        filtré<span style={{ color: "#b8401f" }}>.</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 74,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: '"Instrument Sans", sans-serif',
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "0.16em",
          color: "#efc79c",
        }}
      >
        <span style={{ width: 46, height: 2, background: "#b8401f", display: "inline-block" }} />
        TUTO EN VIDÉO
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 168, textAlign: "center" }}>
        <div style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: 72, color: "#efc79c", lineHeight: 1 }}>
          La recette
        </div>
        <div
          style={{
            fontFamily: "Newsreader, serif",
            fontWeight: 500,
            fontSize: tailleNom,
            lineHeight: 0.95,
            color: "#f6f1ea",
            whiteSpace: "nowrap",
            marginTop: 6,
          }}
        >
          {nom}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1196,
          display: "flex",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {puces.map((p, i) => {
          const fort = i === puces.length - 1;
          return (
            <div
              key={p}
              style={{
                padding: "12px 24px",
                borderRadius: 999,
                border: `2px solid ${fort ? "#b8401f" : "rgba(239,199,156,0.55)"}`,
                backgroundColor: fort ? "#b8401f" : "rgba(20,13,9,0.6)",
                color: "#f6f1ea",
                fontFamily: '"Instrument Sans", sans-serif',
                fontWeight: 600,
                fontSize: 34,
                whiteSpace: "nowrap",
              }}
            >
              {p}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1290,
          textAlign: "center",
          fontFamily: '"Instrument Sans", sans-serif',
          fontSize: 32,
          lineHeight: 1.3,
          color: "rgba(239,199,156,0.92)",
        }}
      >
        {accroche}
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 52,
          paddingTop: 22,
          borderTop: "1.5px solid rgba(239,199,156,0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: '"Instrument Sans", sans-serif',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 32, color: "#f6f1ea" }}>filtre.cafe</span>
        <span style={{ fontSize: 24, color: "rgba(239,199,156,0.8)" }}>Guide indépendant du café de spécialité</span>
      </div>
    </AbsoluteFill>
  </FormatCtx.Provider>
);
