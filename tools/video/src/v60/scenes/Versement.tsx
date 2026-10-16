import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Station } from "../../dessins/Station";
import { Legende } from "../../ui/Legende";
import { VERSEMENT_DUREE, etatVersement } from "../etats";

export const Versement: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Versement">
      <Station e={etatVersement(frame)} />
      <Sequence name="Bloom" durationInFrames={135} layout="none">
        <Legende
          puce="0:00"
          titre="Le bloom"
          sous="30 g d’eau sur tout le café, puis 30 s d’attente"
          duree={135}
        />
      </Sequence>
      <Sequence name="150 g" from={135} durationInFrames={120} layout="none">
        <Legende
          puce="0:30"
          titre="Jusqu’à 150 g"
          sous="en spirale lente, du centre vers l’extérieur"
          duree={120}
        />
      </Sequence>
      <Sequence name="200 g" from={255} durationInFrames={90} layout="none">
        <Legende
          puce="1:00"
          titre="Jusqu’à 200 g"
          sous="toujours en spirale"
          duree={90}
        />
      </Sequence>
      <Sequence
        name="250 g"
        from={345}
        durationInFrames={VERSEMENT_DUREE - 345}
        layout="none"
      >
        <Legende
          puce="1:30"
          titre="Jusqu’à 250 g"
          sous="finir au centre pour lisser le lit"
          duree={VERSEMENT_DUREE - 345}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
