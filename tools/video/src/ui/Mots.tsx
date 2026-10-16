import { interpolate, useCurrentFrame } from "remotion";
import { SORTIE } from "../theme";

// Mots qui glissent depuis une fente, l'un après l'autre.
// Les espaces insécables (U+00A0, U+202F) gardent « 15 g » d'un seul tenant.
export const Mots: React.FC<{
  texte: string;
  debut?: number;
  decalage?: number;
  duree?: number;
  sortie?: number; // image de début de sortie, dans le repère du parent
  style?: React.CSSProperties;
  accent?: string[]; // mots en italique couleur crema
}> = ({
  texte,
  debut = 0,
  decalage = 2.5,
  duree = 20,
  sortie,
  style,
  accent = [],
}) => {
  const frame = useCurrentFrame();
  const mots = texte.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.25em",
        ...style,
      }}
    >
      {mots.map((m, i) => {
        // « / » seul force un retour à la ligne.
        if (m === "/")
          return <span key={i} style={{ flexBasis: "100%", height: 0 }} />;
        const t0 = debut + i * decalage;
        const entree = interpolate(frame, [t0, t0 + duree], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: SORTIE,
        });
        const s =
          sortie === undefined
            ? 0
            : interpolate(
                frame,
                [sortie + i * 1.2, sortie + i * 1.2 + 12],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: SORTIE,
                },
              );
        const enAccent = accent.includes(m);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              paddingBottom: "0.14em",
              marginBottom: "-0.14em",
              paddingTop: "0.06em",
              marginTop: "-0.06em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                translate: `0 ${(1 - entree) * 105 - s * 105}%`,
                opacity: Math.min(entree * 1.6, 1 - s),
                fontStyle: enAccent ? "italic" : undefined,
                color: enAccent ? "#efc79c" : undefined,
              }}
            >
              {m}
            </span>
          </span>
        );
      })}
    </div>
  );
};
