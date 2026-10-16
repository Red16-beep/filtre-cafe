import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { AbsoluteFill, Easing } from "remotion";

// Fondu en deux temps : la scène sortante s'efface en montant, puis la
// suivante arrive par le bas. Les textes ne se superposent jamais.
type Props = { decalage: number };

const doux = Easing.bezier(0.65, 0, 0.35, 1);

const Fondu: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const p = presentationProgress;
  const sortie = presentationDirection === "exiting";
  const t = sortie ? doux(Math.min(1, p * 2)) : doux(Math.max(0, p * 2 - 1));
  return (
    <AbsoluteFill
      style={{
        opacity: sortie ? 1 - t : t,
        translate: sortie
          ? `0px ${-t * passedProps.decalage}px`
          : `0px ${(1 - t) * passedProps.decalage}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const fondu = (decalage = 36): TransitionPresentation<Props> => ({
  component: Fondu,
  props: { decalage },
});
