import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { usePaysage } from "../format";
import { C, prog } from "../theme";
import { Mots } from "../ui/Mots";

// Carte finale commune : la fiche à enregistrer, l'adresse, la signature.
export const FinMethode: React.FC<{
  titre: string;
  lignes: Array<{ l: string; v: string }>;
  url: string;
}> = ({ titre, lignes, url }) => {
  const frame = useCurrentFrame();
  const paysage = usePaysage();
  // Paysage : la fiche à gauche, l'adresse et la signature à droite.
  const L = paysage
    ? {
        titre: 150,
        lignes: 270,
        larg: 760,
        adresse: { left: 960, top: 660, w: 960 },
        logo: { left: 960, top: 330 },
      }
    : {
        titre: 250,
        lignes: 380,
        larg: 920,
        adresse: { left: 80, top: 940, w: 920 },
        logo: { left: 0, top: 1130 },
      };
  const chute = prog(frame, 60, 76, Easing.in(Easing.quad));
  const rebond = prog(frame, 76, 92, Easing.out(Easing.back(3)));
  const pointY =
    frame < 76
      ? -420 * (1 - chute)
      : -26 *
        Math.sin(Math.PI * Math.min(1, (frame - 76) / 14)) *
        (1 - rebond * 0.4);
  const onde = prog(frame, 76, 104, Easing.out(Easing.quad));
  return (
    <AbsoluteFill name="Fin">
      <Mots
        texte={titre}
        debut={0}
        style={{
          position: "absolute",
          left: paysage ? 120 : 80,
          top: L.titre,
          fontFamily: "Newsreader, serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 76,
          color: "#efc79c",
        }}
      />
      {lignes.map((li, i) => (
        <div
          key={li.l}
          style={{
            position: "absolute",
            left: paysage ? 120 : 80,
            width: L.larg,
            top: L.lignes + i * 98,
            height: 98,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(239,199,156,0.22)",
            opacity: interpolate(frame, [6 + i * 5, 18 + i * 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [6 + i * 5, 24 + i * 5],
              ["40px 0px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          <span
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 600,
              fontSize: 36,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(239,199,156,0.8)",
            }}
          >
            {li.l}
          </span>
          <span
            style={{
              fontFamily: "Newsreader, serif",
              fontWeight: 500,
              fontSize: 58,
              color: "#f6f1ea",
            }}
          >
            {li.v}
          </span>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: paysage ? 120 : 80,
          width: L.larg,
          top: L.lignes + lignes.length * 98,
          borderTop: "2px solid rgba(239,199,156,0.22)",
          opacity: interpolate(frame, [31, 43], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Interactive.Div
        name="Adresse"
        style={{
          position: "absolute",
          left: L.adresse.left,
          width: L.adresse.w,
          top: L.adresse.top,
          textAlign: paysage ? "center" : "left",
          opacity: interpolate(frame, [30, 44], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [30, 48], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div
          style={{
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: 44,
            color: "#efc79c",
          }}
        >
          La recette complète :
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: '"Instrument Sans", sans-serif',
            fontWeight: 600,
            fontSize: Math.min(47, Math.floor(900 / (url.length * 0.5))),
            fontStretch: "85%",
            color: "#f6f1ea",
            whiteSpace: "nowrap",
          }}
        >
          {url}
        </div>
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: L.logo.left,
          right: 0,
          top: L.logo.top,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          fontFamily: "Newsreader, serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 250,
          lineHeight: 1,
          color: "#f6f1ea",
        }}
      >
        <Mots texte="filtré" debut={44} duree={22} style={{}} />
        <span style={{ position: "relative", display: "inline-block" }}>
          <span
            style={{
              color: "#b8401f",
              display: "inline-block",
              translate: `0px ${pointY}px`,
              opacity: frame < 60 ? 0 : 1,
            }}
          >
            .
          </span>
          {onde > 0 && onde < 1 ? (
            <svg
              width={300}
              height={60}
              viewBox="-150 -30 300 60"
              style={{
                position: "absolute",
                left: "42%",
                top: "73%",
                marginLeft: -150,
                marginTop: -30,
                overflow: "visible",
              }}
            >
              <ellipse
                cx={0}
                cy={0}
                rx={12 + onde * 120}
                ry={(12 + onde * 120) * 0.13}
                fill="none"
                stroke={C.cerise}
                strokeWidth={3}
                opacity={1 - onde}
              />
            </svg>
          ) : null}
        </span>
      </div>
    </AbsoluteFill>
  );
};
