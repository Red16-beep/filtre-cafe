# Fonds musicaux des tutos vidéo

Composés le 17 octobre 2026 avec le skill `build-music` (dépôt `lens-studio-devs/ls-extensions`, Apache-2.0),
installé dans `~/.claude/skills/build-music` avec `build-sfx`, dont il dépend. Synthèse algorithmique locale :
ni échantillon, ni modèle entraîné, donc aucun droit tiers sur le son produit.

Chaque vidéo du site (`videos/<méthode>-recette.mp4` et `-vertical.mp4`) porte sa musique en AAC 128 kb/s,
montée sur 0,4 s, éteinte sur les 2,5 dernières secondes, à −1,5 dB. Les vidéos se lancent toujours en muet
(lecture automatique) ; le visiteur active le son avec les commandes du lecteur. Les versions verticales
servent aussi aux épingles Pinterest.

## Version retenue (17 oct. 2026) : vrais instruments échantillonnés

Validée par Reda (« parfait les musiques comme ça »). Les versions précédentes, synthétisées (`gen_music_*.js`
avec le skill build-music), sonnaient métalliques : timbres FM et additifs. Elles restent ici pour mémoire.

Générateur : `outils/musique-sf2.mjs` (depuis `tools/video`) :

```bash
MELODIE=flute node outils/musique-sf2.mjs v60 44.8 462885100
```

- Composition originale tirée au hasard (graine), dans l'esprit de Nujabes (*Horizon*, *Modal Soul*) sans
  reprendre de thème ni de grille : grilles génériques du jazz-hop (ii9 V13 Imaj9…, vamp dorien i9 IV13…),
  accords sans fondamentale (formes A/B) menés au plus près, comp rejoué à l'identique sur 4 mesures comme un
  échantillon, contrebasse avec notes de passage, boom-bap balancé (56 à 60 %), caisse claire 10 à 18 ms en
  retard, notes fantômes, mélodie question-réponse. Règles reprises de la fiche « jazzy-downtempo » du skill
  music-composer (jamcgrath/music-theory-skill, MIT).
- Rendu : spessasynth_core 4.3.22 (npm, Apache-2.0), une partie à la fois, 48 kHz.
- Banques de sons, dans `sons/` (non suivies par git, 90 Mo) :
  - `UprightPianoKW-20220221.sf2` : piano droit Kawai, FreePats, **CC0**
    (https://freepats.zenvoid.org/Piano/UprightPianoKW/UprightPianoKW-SF2-20220221.7z, à extraire avec `tar -xf`).
  - `GeneralUser-GS.sf2` 2.0.3 : flûte, shakuhachi, guitare jazz, contrebasse, cordes, batteries ; usage commercial
    libre, sans attribution (https://github.com/mrbumpy409/GeneralUser-GS). Licences copiées dans `sons/`.
- Traitement « disque » : piano filtré (4,8 kHz), saturé, pleurage 0,55 Hz / 0,22 % et scintillement 7,5 Hz ;
  batterie 12 bits / 26 kHz à 45 % en parallèle, saturation ; basse filtrée à 1,6 kHz ; compression 2:1 du bus ;
  craquements et souffle de vinyle 26 dB sous la musique ; RMS -15 dBFS, crêtes sous -1 dB.

Prises retenues (graine, réglages) :

- V60 (44,8 s) : graine 462885100, `MELODIE=flute`. Si bémol dorien, i9 IV13, 89 bpm, batterie Jazz.
- AeroPress (42,03 s) : graine 1247351084, `MELODIE=shakuhachi`. Mi bémol majeur, ii9 V13 Imaj9 IVmaj9, 89 bpm, Room.
- French press (44,2 s) : graine 1580660788, `MELODIE=guitare`. Do majeur, iii9 Imaj9 ii9 V13, 90 bpm, Standard.
- Moka (41,87 s) : graine 1019387184, `MELODIE=flute`. Ré mineur, i9 iv9 bVII13 bIIImaj9, 88 bpm, Standard.
- Cold brew (40,77 s) : graine 23, `MELODIE=flute`. Do majeur, ii9 V13 Imaj9 VI7b13, 83 bpm, Room.
- Espresso (34,43 s) : graine 1476816975, `MELODIE=guitare`. Fa mineur, i9 bVImaj9 iv9 V7b13, 89 bpm, Standard.
- Méthode 4:6 (52,87 s) : graine 19, `MELODIE=flute`. Si bémol majeur, vi9 ii9 V13 Imaj9, 83 bpm, Standard.

Une même graine et les mêmes variables redonnent exactement le même morceau.

## Anciennes versions

## Réglages retenus (17 oct. 2026, version jazz-hop)

Demande de Reda : l'esprit de *Horizon* (Nujabes, album *Modal Soul*), pour toutes les vidéos. On reprend le style,
jamais le thème ni la grille du morceau : accords jazz égrenés comme un échantillon de piano, mélodie composée par
`composeMelody`, boom-bap balancé (84-94 bpm), basse ronde, nappe de cordes en seconde moitié, souffle et craquements
de vinyle synthétisés. Script : `gen_music_jazzhop.js` (les compositions sont tirées au hasard, ces valeurs servent à
retrouver une prise).

- V60 (44,8 s) : mi bémol dorien, i7 IV7 v7 i7, 90 bpm, piano, flûte. Graines : harmonie 82257475, batterie 790638952.
- AeroPress (42,0 s) : sol mineur, i7 VImaj7 iv7 v7 (neuvièmes), 94 bpm, Rhodes, vibraphone. Graines : 885718626, 243724707.
- French press (44,2 s) : mi bémol mineur, i7 iv7 IIImaj7 VImaj7, 88 bpm, guitare nylon, flûte. Graines : 712652756, 966442268.
- Moka (41,9 s) : ré bémol mineur, VImaj7 v7 iv7 i7 (neuvièmes), 90 bpm, piano, clarinette. Graines : 212581101, 226732238.
- Cold brew (40,8 s) : si bémol majeur, Imaj7 iii7 IVmaj7 iv7, 90 bpm, Rhodes, flûte. Graines : 33287063, 269896530.
- Espresso (34,4 s) : mi bémol dorien, i7 ii7 IIImaj7 ii7 (neuvièmes), 84 bpm, piano, vibraphone. Graines : 854966377, 669501305.

```bash
node tools/video/musique/gen_music_jazzhop.js v60 44.8 dorian i7,IV7,v7,i7 piano flute 0.5
```

Les versions précédentes (lo-fi de `gen_music_tuto.js`) restent dans l'historique git.

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
