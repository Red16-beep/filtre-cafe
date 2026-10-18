import "./polices";
import { AbsoluteFill, Composition, Folder, Still } from "remotion";
import { AERO_DUREE, AeroPressPaysage, AeroPressVertical } from "./aeropress/AeroPress";
import { AeroAffiche, AeroAfficheVerticale } from "./aeropress/Affiche";
import { EssaiAero } from "./aeropress/Essai";
import { EPINGLES } from "./epingles";
import { KASUYA_DUREE, KasuyaPaysage, KasuyaVertical } from "./kasuya/Kasuya";
import { KasuyaAffiche, KasuyaAfficheVerticale } from "./kasuya/Affiche";
import { GLACE_DUREE, GlacePaysage, GlaceVertical } from "./glace/Glace";
import { GlaceAffiche, GlaceAfficheVerticale } from "./glace/Affiche";
import { CHEMEX_DUREE, ChemexPaysage, ChemexVertical } from "./chemex/Film";
import { ChemexAffiche, ChemexAfficheVerticale } from "./chemex/scenes";
import { ESSAIS_ILLU } from "./illustrations/Essais";
import { FICHES_ILLU, IlluArticle } from "./illustrations/Articles";
import { PERIODE } from "./illustrations/Cadre";
import { ESP_DUREE, EspAffiche, EspAfficheVerticale, EspPaysage, EspVertical } from "./espresso/scenes";
import { FROID_DUREE, FroidAffiche, FroidAfficheVerticale, FroidPaysage, FroidVertical } from "./coldbrew/scenes";
import { MOKA_DUREE, MokaAffiche, MokaAfficheVerticale, MokaPaysage, MokaVertical } from "./moka/scenes";
import { PRESS_DUREE, PressPaysage, PressVertical } from "./piston/Piston";
import { PressAffiche, PressAfficheVerticale } from "./piston/scenes";
import { Fond } from "./dessins/Fond";
import { V60Affiche, V60AfficheVerticale } from "./v60/Affiche";
import { V60Paysage, V60Vertical, V60_DUREE } from "./v60/V60Vertical";
import { Cafe } from "./v60/scenes/Cafe";
import { Diagnostic } from "./v60/scenes/Diagnostic";
import { Eau } from "./v60/scenes/Eau";
import { Ecoulement } from "./v60/scenes/Ecoulement";
import { Fin } from "./v60/scenes/Fin";
import { Materiel } from "./v60/scenes/Materiel";
import { Rincage } from "./v60/scenes/Rincage";
import { Titre } from "./v60/scenes/Titre";
import { Versement } from "./v60/scenes/Versement";

// Chaque scène seule, sur le fond, pour la régler dans le Studio.
const surFond = (Scene: React.FC): React.FC => {
  const AvecFond: React.FC = () => (
    <AbsoluteFill>
      <Fond />
      <Scene />
    </AbsoluteFill>
  );
  return AvecFond;
};

const SCENES: Array<{ id: string; c: React.FC; d: number }> = [
  { id: "V60-1-Titre", c: surFond(Titre), d: 105 },
  { id: "V60-2-Materiel", c: surFond(Materiel), d: 120 },
  { id: "V60-3-Eau", c: surFond(Eau), d: 105 },
  { id: "V60-4-Cafe", c: surFond(Cafe), d: 140 },
  { id: "V60-5-Rincage", c: surFond(Rincage), d: 175 },
  { id: "V60-6-Versement", c: surFond(Versement), d: 450 },
  { id: "V60-7-Ecoulement", c: surFond(Ecoulement), d: 105 },
  { id: "V60-8-Diagnostic", c: surFond(Diagnostic), d: 140 },
  { id: "V60-9-Fin", c: surFond(Fin), d: 120 },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="V60Vertical"
        component={V60Vertical}
        durationInFrames={V60_DUREE}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="V60Paysage"
        component={V60Paysage}
        durationInFrames={V60_DUREE}
        fps={30}
        width={1920}
        height={1080}
      />
      <Still id="V60Affiche" component={V60Affiche} width={1920} height={1080} />
      <Still id="V60AfficheVerticale" component={V60AfficheVerticale} width={1080} height={1920} />
      <Composition id="AeroPressVertical" component={AeroPressVertical} durationInFrames={AERO_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="AeroPressPaysage" component={AeroPressPaysage} durationInFrames={AERO_DUREE} fps={30} width={1920} height={1080} />
      <Still id="AeroAffiche" component={AeroAffiche} width={1920} height={1080} />
      <Still id="AeroAfficheVerticale" component={AeroAfficheVerticale} width={1080} height={1920} />
      <Composition id="PressVertical" component={PressVertical} durationInFrames={PRESS_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="PressPaysage" component={PressPaysage} durationInFrames={PRESS_DUREE} fps={30} width={1920} height={1080} />
      <Still id="PressAffiche" component={PressAffiche} width={1920} height={1080} />
      <Still id="PressAfficheVerticale" component={PressAfficheVerticale} width={1080} height={1920} />
      <Composition id="MokaVertical" component={MokaVertical} durationInFrames={MOKA_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="MokaPaysage" component={MokaPaysage} durationInFrames={MOKA_DUREE} fps={30} width={1920} height={1080} />
      <Still id="MokaAffiche" component={MokaAffiche} width={1920} height={1080} />
      <Still id="MokaAfficheVerticale" component={MokaAfficheVerticale} width={1080} height={1920} />
      <Composition id="FroidVertical" component={FroidVertical} durationInFrames={FROID_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="FroidPaysage" component={FroidPaysage} durationInFrames={FROID_DUREE} fps={30} width={1920} height={1080} />
      <Still id="FroidAffiche" component={FroidAffiche} width={1920} height={1080} />
      <Still id="FroidAfficheVerticale" component={FroidAfficheVerticale} width={1080} height={1920} />
      <Composition id="EspVertical" component={EspVertical} durationInFrames={ESP_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="EspPaysage" component={EspPaysage} durationInFrames={ESP_DUREE} fps={30} width={1920} height={1080} />
      <Still id="EspAffiche" component={EspAffiche} width={1920} height={1080} />
      <Still id="EspAfficheVerticale" component={EspAfficheVerticale} width={1080} height={1920} />
      <Composition id="KasuyaVertical" component={KasuyaVertical} durationInFrames={KASUYA_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="KasuyaPaysage" component={KasuyaPaysage} durationInFrames={KASUYA_DUREE} fps={30} width={1920} height={1080} />
      <Still id="KasuyaAffiche" component={KasuyaAffiche} width={1920} height={1080} />
      <Still id="KasuyaAfficheVerticale" component={KasuyaAfficheVerticale} width={1080} height={1920} />
      <Composition id="GlaceVertical" component={GlaceVertical} durationInFrames={GLACE_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="GlacePaysage" component={GlacePaysage} durationInFrames={GLACE_DUREE} fps={30} width={1920} height={1080} />
      <Still id="GlaceAffiche" component={GlaceAffiche} width={1920} height={1080} />
      <Still id="GlaceAfficheVerticale" component={GlaceAfficheVerticale} width={1080} height={1920} />
      <Composition id="ChemexVertical" component={ChemexVertical} durationInFrames={CHEMEX_DUREE} fps={30} width={1080} height={1920} />
      <Composition id="ChemexPaysage" component={ChemexPaysage} durationInFrames={CHEMEX_DUREE} fps={30} width={1920} height={1080} />
      <Still id="ChemexAffiche" component={ChemexAffiche} width={1920} height={1080} />
      <Still id="ChemexAfficheVerticale" component={ChemexAfficheVerticale} width={1080} height={1920} />
      <Folder name="Epingles">
        {EPINGLES.map((p) => (
          <Still key={p.id} id={p.id} component={p.c} width={1000} height={1500} />
        ))}
      </Folder>
      <Folder name="Illustrations">
        {ESSAIS_ILLU.map((p) => (
          <Composition key={p.id} id={p.id} component={p.c} durationInFrames={PERIODE} fps={30} width={1200} height={675} />
        ))}
      </Folder>
      <Folder name="Articles">
        {FICHES_ILLU.map((a) => (
          <Composition
            key={a.slug}
            id={`A-${a.slug}`}
            component={IlluArticle}
            defaultProps={{ scene: a.scene, props: a.props, libelle: a.libelle }}
            durationInFrames={PERIODE}
            fps={30}
            width={1200}
            height={675}
          />
        ))}
      </Folder>
      <Folder name="Essais">
        <Composition id="EssaiAero" component={EssaiAero} durationInFrames={30} fps={30} width={1080} height={1920} />
      </Folder>
      <Folder name="V60-Scenes">
        {SCENES.map((s) => (
          <Composition
            key={s.id}
            id={s.id}
            component={s.c}
            durationInFrames={s.d}
            fps={30}
            width={1080}
            height={1920}
          />
        ))}
      </Folder>
    </>
  );
};
