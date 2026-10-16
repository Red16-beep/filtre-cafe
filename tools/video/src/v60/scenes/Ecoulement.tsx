import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Station } from "../../dessins/Station";
import { Legende } from "../../ui/Legende";
import { etatEcoulement } from "../etats";

export const Ecoulement: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Écoulement">
      <Station e={etatEcoulement(frame)} />
      <Legende
        puce="2:30 – 3:30"
        puceFond="#4b6b4f"
        titre="Laisser couler"
        sous="le lit doit être à sec entre 2:30 et 3:30"
      />
    </AbsoluteFill>
  );
};
