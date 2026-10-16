import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Station } from "../../dessins/Station";
import { Legende } from "../../ui/Legende";
import { RINCAGE_DUREE, etatRincage } from "../etats";

export const Rincage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Rinçage">
      <Station e={etatRincage(frame)} />
      <Sequence name="Rincer" durationInFrames={104} layout="none">
        <Legende
          puce="ÉTAPE 3"
          titre="Rincer le filtre"
          sous="à l’eau chaude, puis jeter l’eau"
          duree={104}
        />
      </Sequence>
      <Sequence
        name="Café et tare"
        from={100}
        durationInFrames={RINCAGE_DUREE - 100}
        layout="none"
      >
        <Legende
          puce="ÉTAPE 3"
          titre="Ajouter le café"
          sous="puis tarer la balance à zéro"
          duree={RINCAGE_DUREE - 100}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
