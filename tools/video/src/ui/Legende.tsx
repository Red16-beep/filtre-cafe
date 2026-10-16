import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { usePaysage } from "../format";
import { Mots } from "./Mots";

// Bloc de texte d'une étape : pastille, titre, phrase d'appui.
// Placé dans la zone sûre du vertical (sous les 220 px du haut).
export const Legende: React.FC<{
  puce?: string;
  puceFond?: string;
  titre: string;
  sous?: string;
  accent?: string[];
  duree?: number; // si fournie, le bloc sort sur ses 14 dernières images
  haut?: number;
  taille?: number;
}> = ({
  puce,
  puceFond = "#b8401f",
  titre,
  sous,
  accent,
  duree,
  haut,
  taille,
}) => {
  const frame = useCurrentFrame();
  const paysage = usePaysage();
  const top = haut ?? (paysage ? 140 : 250);
  const tailleTitre = (taille ?? 116) * (paysage ? 0.9 : 1);
  const sortie = duree === undefined ? undefined : duree - 14;
  return (
    <Interactive.Div
      name="Légende"
      style={{
        position: "absolute",
        left: paysage ? 120 : 80,
        top,
        width: paysage ? 800 : 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {puce ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 66,
            padding: "0 26px",
            borderRadius: 999,
            backgroundColor: puceFond,
            color: "#f6f1ea",
            fontFamily: '"Instrument Sans", sans-serif',
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: "0.05em",
            fontVariantNumeric: "tabular-nums",
            scale: interpolate(frame, [0, 14], [0.6, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 14, mass: 0.6 }),
            }),
            opacity:
              interpolate(frame, [0, 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }) *
              (sortie === undefined
                ? 1
                : interpolate(frame, [sortie, sortie + 10], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })),
            transformOrigin: "left center",
          }}
        >
          {puce}
        </div>
      ) : null}
      <Mots
        texte={titre}
        debut={4}
        sortie={sortie}
        accent={accent}
        style={{
          marginTop: puce ? 30 : 0,
          fontFamily: "Newsreader, serif",
          fontWeight: 500,
          fontSize: tailleTitre,
          lineHeight: 1.02,
          color: "#f6f1ea",
        }}
      />
      {sous ? (
        <Mots
          texte={sous}
          debut={11}
          decalage={1.6}
          sortie={sortie === undefined ? undefined : sortie + 2}
          style={{
            marginTop: 24,
            maxWidth: paysage ? 740 : 880,
            fontFamily: '"Instrument Sans", sans-serif',
            fontWeight: 400,
            fontSize: paysage ? 46 : 50,
            lineHeight: 1.22,
            color: "rgba(239,199,156,0.94)",
          }}
        />
      ) : null}
    </Interactive.Div>
  );
};
