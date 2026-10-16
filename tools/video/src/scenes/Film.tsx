import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { Fragment } from "react";
import { AbsoluteFill } from "remotion";
import { Fond } from "../dessins/Fond";
import { Format, FormatCtx } from "../format";
import { fondu } from "../ui/transitions";

// Un film = une suite de plans. La transition d'un plan s'applique entre le
// plan précédent et lui ; « null » : coupe franche (le poste continue).
export type Plan = {
  nom: string;
  duree: number;
  C: React.FC;
  transition?: "fondu" | "glisse" | null;
};

const DUREE_TRANSITION = { fondu: 18, glisse: 22 };

export const dureeFilm = (plans: Plan[]) =>
  plans.reduce((t, p, i) => t + p.duree - (i > 0 && p.transition ? DUREE_TRANSITION[p.transition] : 0), 0);

export const Film: React.FC<{ format: Format; plans: Plan[] }> = ({ format, plans }) => (
  <FormatCtx.Provider value={format}>
    <AbsoluteFill>
      <Fond />
      <TransitionSeries>
        {plans.map((p, i) => (
          <Fragment key={p.nom}>
            {i > 0 && p.transition === "glisse" ? (
              <TransitionSeries.Transition
                presentation={slide({ direction: "from-right" })}
                timing={springTiming({ config: { damping: 200 }, durationInFrames: DUREE_TRANSITION.glisse })}
              />
            ) : null}
            {i > 0 && p.transition === "fondu" ? (
              <TransitionSeries.Transition
                presentation={fondu()}
                timing={springTiming({ config: { damping: 200 }, durationInFrames: DUREE_TRANSITION.fondu })}
              />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={p.duree} name={p.nom}>
              <p.C />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  </FormatCtx.Provider>
);
