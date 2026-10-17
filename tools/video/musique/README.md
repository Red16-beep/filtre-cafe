# Fonds musicaux des tutos vidéo

Composés le 17 octobre 2026 avec le skill `build-music` (dépôt `lens-studio-devs/ls-extensions`, Apache-2.0),
installé dans `~/.claude/skills/build-music` avec `build-sfx`, dont il dépend. Synthèse algorithmique locale :
ni échantillon, ni modèle entraîné, donc aucun droit tiers sur le son produit.

Chaque vidéo du site (`videos/<méthode>-recette.mp4` et `-vertical.mp4`) porte sa musique en AAC 128 kb/s,
montée sur 0,4 s, éteinte sur les 2,5 dernières secondes, à −1,5 dB. Les vidéos se lancent toujours en muet
(lecture automatique) ; le visiteur active le son avec les commandes du lecteur. Les versions verticales
servent aussi aux épingles Pinterest.

## Réglages retenus (les compositions sont tirées au hasard : ces valeurs servent à retrouver une prise)

Uniquement du lo-fi (demande de Reda : pas de R&B, pas de folk ni de jazz rapide), une suite d'accords différente par tuto.

- V60 (44,8 s) : lofi-jazz, si bémol majeur, ii7 V7 Imaj7 vi7, 76 bpm, piano électrique, kalimba au milieu. Graines : harmonie 86804048, batterie 50569594.
- AeroPress (42,0 s) : lofi, sol majeur, Imaj7 IVmaj7 iii7 vi7, 83 bpm, piano, marimba. Graines : harmonie 559708430, batterie 487461937.
- French press (44,2 s) : lofi, do majeur, IVmaj7 iii7 ii7 Imaj7, 76 bpm, vibraphone, flûte. Graines : harmonie 138552678, batterie 637577733.
- Moka (41,9 s) : lofi-jazz, la bémol majeur, Imaj7 vi7 ii7 V7, 77 bpm, piano, clarinette. Graines : harmonie 136219571, batterie 96023928.
- Cold brew (40,8 s) : lofi, ré bémol majeur, vi7 ii7 V7 Imaj7, 69 bpm, piano électrique, boîte à musique. Graines : harmonie 324008732, batterie 307699834.
- Espresso (34,4 s) : lofi, la bémol majeur, Imaj7 iii7 vi7 IVmaj7, 73 bpm, guitare nylon, vibraphone. Graines : harmonie 870561892, batterie 94340152.

La basse et la mélodie n'exposent pas leur graine : une nouvelle exécution donne un morceau voisin, pas identique.
Les WAV d'origine ne sont pas gardés ; la musique de référence est celle des MP4.

## Refaire une musique

```bash
node tools/video/musique/gen_music_tuto.js aeropress 42.03 lofi piano marimba 0.4
node tools/video/musique/niveau.js tools/video/public/audio/aeropress-musique.wav
```

`BPM_MAX` plafonne le tempo tiré au hasard, `BATTERIE` emprunte le groove d'un autre genre. Le genre lofi
tire souvent la même suite d'accords : relancer jusqu'à en obtenir une que les autres tutos n'ont pas. Montage sur la vidéo, depuis le projet Remotion :

```bash
npx remotion ffmpeg -i video.mp4 -i musique.wav -map 0:v:0 -map 1:a:0 -c:v copy -af "atrim=0:<durée>,volume='0.84*if(lt(t,0.4),t/0.4,if(gt(t,<durée-2.5>),max(0,(<durée>-t)/2.5),1))':eval=frame" -c:a aac -b:a 128k -shortest -movflags +faststart sortie.mp4
```

Le ffmpeg fourni par Remotion n'a ni `afade` ni `volumedetect` : d'où le filtre `volume` à expression
et le contrôle de niveau en Node (`niveau.js`).
