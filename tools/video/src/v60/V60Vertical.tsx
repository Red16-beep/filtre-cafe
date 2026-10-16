import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill } from "remotion";
import { Fond } from "../dessins/Fond";
import { Format, FormatCtx } from "../format";
import { fondu } from "../ui/transitions";
import { Cafe } from "./scenes/Cafe";
import { Diagnostic } from "./scenes/Diagnostic";
import { Eau } from "./scenes/Eau";
import { Ecoulement } from "./scenes/Ecoulement";
import { Fin } from "./scenes/Fin";
import { Materiel } from "./scenes/Materiel";
import { Rincage } from "./scenes/Rincage";
import { Titre } from "./scenes/Titre";
import { Versement } from "./scenes/Versement";

// 1460 images de scènes, moins 116 de transitions : 1344 images, 44,8 s.
export const V60_DUREE = 1344;

export const V60Vertical: React.FC = () => <V60Film format="vertical" />;
export const V60Paysage: React.FC = () => <V60Film format="paysage" />;

const V60Film: React.FC<{ format: Format }> = ({ format }) => {
  return (
    <FormatCtx.Provider value={format}>
      <AbsoluteFill>
        <Fond />
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={105} name="Titre">
            <Titre />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fondu()}
            timing={springTiming({
              config: { damping: 200 },
              durationInFrames: 18,
            })}
          />
          <TransitionSeries.Sequence durationInFrames={120} name="Matériel">
            <Materiel />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={springTiming({
              config: { damping: 200 },
              durationInFrames: 22,
            })}
          />
          <TransitionSeries.Sequence durationInFrames={105} name="Eau">
            <Eau />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={springTiming({
              config: { damping: 200 },
              durationInFrames: 22,
            })}
          />
          <TransitionSeries.Sequence durationInFrames={140} name="Café">
            <Cafe />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fondu()}
            timing={springTiming({
              config: { damping: 200 },
              durationInFrames: 18,
            })}
          />
          <TransitionSeries.Sequence durationInFrames={175} name="Rinçage">
            <Rincage />
          </TransitionSeries.Sequence>
          <TransitionSeries.Sequence durationInFrames={450} name="Versement">
            <Versement />
          </TransitionSeries.Sequence>
          <TransitionSeries.Sequence durationInFrames={105} name="Écoulement">
            <Ecoulement />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fondu()}
            timing={springTiming({
              config: { damping: 200 },
              durationInFrames: 18,
            })}
          />
          <TransitionSeries.Sequence durationInFrames={140} name="Diagnostic">
            <Diagnostic />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fondu()}
            timing={springTiming({
              config: { damping: 200 },
              durationInFrames: 18,
            })}
          />
          <TransitionSeries.Sequence durationInFrames={120} name="Fin">
            <Fin />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>
    </FormatCtx.Provider>
  );
};
