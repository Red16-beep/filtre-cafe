import { AbsoluteFill } from "remotion";
import { Dripper } from "../dessins/Dripper";
import { Fond } from "../dessins/Fond";
import { C, SANS, SERIF } from "../theme";

// Habillage de la chaîne YouTube de filtré.
// Bannière 2560 × 1440 : tout ce qui compte tient dans la zone visible partout (1546 × 423, au centre) ;
// au-delà, le fond seul, que la télévision et l'ordinateur montrent en plus.
export const ChaineBanniere: React.FC = () => (
  <AbsoluteFill>
    <Fond />
    <svg width={2560} height={1440} viewBox="0 0 2560 1440" style={{ position: "absolute", inset: 0 }}>
      <Dripper x={800} y={604} s={1.04} trace={1} papier={1} lit={1} dome={8} />
    </svg>
    <div style={{ position: "absolute", left: 1070, top: 556, width: 980 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 210, lineHeight: 0.9, color: C.creme }}>
        filtré<span style={{ color: "#e0673f" }}>.</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap", color: "rgba(239,199,156,0.78)", marginTop: 30 }}>
        Le café de spécialité, méthode par méthode
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: C.crema, marginTop: 16 }}>
        V60 · Chemex · AeroPress · expresso · moka
      </div>
    </div>
  </AbsoluteFill>
);

// Photo de profil 800 × 800, recadrée en rond par YouTube : le monogramme tient dans le disque central.
export const ChaineAvatar: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.espresso, alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(60% 60% at 50% 45%, #3a2819 0%, rgba(31,22,16,0) 80%)",
      }}
    />
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 560, lineHeight: 1, color: C.creme, translate: "-14px -36px" }}>
      f<span style={{ color: "#e0673f" }}>.</span>
    </div>
  </AbsoluteFill>
);
