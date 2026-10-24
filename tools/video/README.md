# Tutos vidéo en motion design (Remotion)

Six méthodes : V60, AeroPress, French press, moka, cold brew, espresso.
Chaque film existe en vertical (1080 × 1920 : Shorts, Reels, Pinterest) et en
paysage (1920 × 1080 : article, YouTube), avec affiches et épingles.

Les chiffres viennent des articles du site, rien n'est inventé.

## Installer et ouvrir

    npm i
    npx remotion studio

## Rendre une méthode pour le site

    outils/rendre.sh V60Paysage V60Vertical V60Affiche V60AfficheVerticale v60-recette

Vidéos et affiches arrivent dans `videos/` à la racine du site. L'intégration
dans l'article : `python3 outils/integrer.py <article> <fichier> <titre> <description> <légende> <durée>`.

Épingles Pinterest (1000 × 1500) : `node outils/epingles.mjs` (dossier `pins/`).

Le rendu utilise le Chrome du Mac (`--browser-executable`), voir les scripts.

## Illustrations d'articles (17 octobre 2026)

Les 110 articles sans tuto vidéo ont une illustration 1200 × 675 sous leur en-tête : une boucle de 6 s
(MP4, 60 à 600 Ko) et une image fixe (WebP 1200 et 720 pour la page, JPEG pour og:image et le JSON-LD).

- Scènes : `src/illustrations/scenes*.tsx` (cadre commun dans `Cadre.tsx`, période de 180 images : toutes
  les phases sont des multiples de la boucle). Planche de contrôle : `node outils/planche-illu.mjs <ids> <image> <sortie.png>`.
- Correspondance article → scène, légende et texte alternatif : `src/illustrations/illustrations.json`, généré par
  `python3 outils/illu_fiches.py src/illustrations/illustrations.json` (vérifie que chaque article est couvert).
- Rendu : `node outils/illustrations.mjs ../../illustrations [slugs]`. Sans slugs, les illustrations déjà rendues sont sautées.
- Intégration : `python3 outils/integrer-illu.py ../.. src/illustrations/illustrations.json` (figure, og:image,
  max-image-preview, image du JSON-LD ; une page déjà traitée est laissée telle quelle).
- Côté site : `.illu-article` dans `v2/v2.css`, chargement de la boucle à l'écran et figure masquée si l'image manque
  dans `v2/v2.js`, cache de 7 jours sur `/illustrations/*` dans `_headers`, dossier copié par `astro/sync-public.sh`.

## Épisodes narrés : « les méthodes de A à Z » (22 octobre 2026)

Un épisode YouTube de 4 à 5 min par méthode, voix de synthèse, et trois ou quatre Shorts tirés de ses chapitres.
Épisode 1 : le V60 (`src/episodes/v60/`, 4 min 20, compositions `V60Episode`, `V60EpisodeMiniature`, `V60Short-*`,
et `V60EpisodeLettre`, l'image sans texte de la lettre, rendue avec `--scale=0.625`). Habillage de la chaîne YouTube :
`ChaineBanniere` (2560 × 1440) et `ChaineAvatar` (800 × 800), dans `src/chaine/`.
Épisode 2 : l'espresso (`src/episodes/espresso/`, compositions `EspressoEpisode`, `EspressoEpisodeMiniature`,
`EspressoEpisodeLettre`, `EspressoShort-*`). La recette, le diagnostic et la fiche de fin rejouent les scènes du tuto
espresso ; la machine de l'auteur figure en annotation écrite, la voix ne dit pas « je ». Musique :
`MELODIE=aucune BATTERIE=standard node outils/musique-sf2.mjs episode-espresso <durée en s> 1476816975`, la graine du
tuto espresso. Épisode 3 : la Chemex (`src/episodes/chemex/`, compositions `ChemexEpisode`,
`ChemexEpisodeMiniature`, `ChemexEpisodeLettre`, `ChemexShort-*`). Le filtre, la mouture, l'eau, la recette, le
diagnostic et la fiche de fin rejouent les scènes du tuto Chemex (`ChemexCafe` prend une `puce`, le nom du chapitre).
Musique : `GRILLE=chemex MELODIE=aucune BATTERIE=room node outils/musique-sf2.mjs episode-chemex <durée en s> 1941`.
Les briques de mise en page des épisodes (toile, légendes, styles de texte) sont dans `src/episodes/ui.tsx`.

Hors série, `BlackFridayShort` (`src/episodes/black-friday/`) : un Short narré de 50 s tiré de la page
journal/black-friday-cafe, un seul chapitre sans carte, même chaîne voix, musique (`BATTERIE=standard`, graine
1580660788) et mixage.

`FetesPinterest` (`src/fetes/`) : l'épingle vidéo de Noël (1000 × 1500, 27,7 s, sans voix, lisible sans le son).
Quatre dates sur une page d'éphéméride qui se tourne : commander le calendrier de l'avent, le Black Friday, la
première case, le cadeau. Chiffres de journal/idees-cadeaux-cafe et journal/black-friday-cafe. Musique :
`GRILLE=chemex MELODIE=celesta BATTERIE=jazz node outils/musique-sf2.mjs fetes 28 2412`, puis
`ffmpeg -i public/audio/fetes-sf2.wav -af "atrim=0:27.667,afade=t=in:d=0.25,afade=t=out:st=25.2:d=2.45,loudnorm=I=-16:TP=-1.5"
public/audio/fetes-mix.wav`.

La voix fixe tout le minutage. Chaîne complète, depuis `tools/video` :

1. **Texte** : `src/episodes/<méthode>/narration.json`, chapitres et phrases. Champ `ecrit` pour les sous-titres,
   champ `dit` pour la voix (nombres en toutes lettres, « V soixante », « bloum »). Aucun chiffre hors des articles.
   La voix étant synthétique, la narration ne dit pas « je ».
2. **Voix** : `python outils/narration.py v60`, avec un Python 3.12 où sont installés torch (CPU), `voxcpm
   faster-whisper num2words speechbrain` (et librosa). Moteur VoxCPM2 (`openbmb/VoxCPM2`, Apache-2.0, 4,7 Go
   téléchargés au premier lancement), environ 40 min de calcul pour 4 min de voix sur 4 cœurs, plus les reprises. Le
   narrateur de la série est une voix créée par description, sans cloner personne (`outils/voix.py`), figée dans
   `voix/narrateur.flac` et `voix/narrateur.json` (sa transcription, la description et la graine d'origine, et sa
   chaîne « studio », voir le mixage) : chaque phrase reprend ce timbre, d'un épisode à l'autre. La référence ne donne
   que le timbre ; le ton suit le texte. Une consigne de ton (`"style"` dans le JSON) reste possible mais n'est plus
   utilisée : « animateur souriant » montait la voix de deux demi-tons et faisait partir les phrases courtes dans
   l'aigu. Le mode `"mode": "complet"` amorce aussi chaque phrase avec l'extrait de référence : il en recopie le ton
   posé, et toutes les phrases finissent sur la même note (voix jugée plate). Écrit la piste voix (`public/audio/`),
   `minutage.json` (à suivre dans git) et `out/episode-v60.srt`. Chaque prise est relue par faster-whisper et refaite
   si plus de 15 % des mots échappent. Elle passe aussi un garde-fou de ton, qui la compare à la référence : hauteur
   médiane à 3 demi-tons près, envolées (97e centile) sous +12 demi-tons, timbre (ECAPA de speechbrain) à 0,80 au
   moins. Trois prises au plus, la meilleure est gardée. Une phrase signalée « À REVOIR » est à réécrire dans `dit`
   (les homophones sont de fausses alertes) ; une phrase « TON À REVOIR » est à écouter, et à reformuler si elle sonne
   faux. Un mot mal prononcé passe parfois sous le seuil (« chimiste » dit « chemiste ») : `python
   outils/contre-ecoute.py <méthode> <ids> "<amorce>"` retranscrit des phrases de la piste finale, sans puis avec une
   amorce de vocabulaire, et `MODELE=medium` prend un modèle plus précis. Ce que deux modèles entendent de travers se
   reprend dans `dit`, au besoin par une graphie phonétique (« Kénia », le texte écrit gardant « Kenya »). Autres moteurs : `"moteur": "qwen3"` (Qwen3-TTS, Apache-2.0, `pip install qwen-tts`, par lots, plus rapide),
   et la première voix, Kokoro, jugée trop robotique (`"moteur": "kokoro", "locuteur": "ff_siwis", "vitesse": 0.92`).
3. **Musique** : `MELODIE=aucune BATTERIE=jazz node outils/musique-sf2.mjs episode-v60 <durée en s> 462885100`, la graine du tuto
   V60 sans sa mélodie (même accompagnement, rien ne chante sous la voix).
4. **Mixage** : `python3 outils/mixage.py v60`. La voix passe d'abord par la chaîne « studio » du narrateur (filtres
   ffmpeg de `voix/narrateur.json`, appliqués à -20 LUFS : graves parasites coupés sous 80 Hz, débruitage léger,
   -4 dB à 230 Hz, +4,5 dB à 3,3 kHz, +3,5 dB au-dessus de 9 kHz, dé-esseur, compression 2:1 légère pour garder le
   relief, pauses nettoyées), pour un son de studio radio ; puis musique à 18 dB sous la voix, 9 dB dans les silences,
   -14 LUFS. `voix.py` n'écrit pas `studio` : la reporter si l'on recrée la voix.
5. **Contrôle** : `CHROME=… CHROME_MODE=headless-shell node outils/planche.mjs V60Episode <images> planche.png 0.25 7`.
6. **Rendu** : `npx remotion render V60Episode out/episode-v60.mp4 --crf=18 --audio-codec=aac --audio-bitrate=192k`
   (le son est dans la composition), puis les Shorts : `npx remotion render V60Short-dose …`.

Les scènes du tuto (poste de préparation, diagnostic, fin, eau) sont rejouées au rythme de la voix avec `<Freeze>` et
`recale()` (`src/episodes/temps.ts`) : aucune ne change pour l'épisode. En session cloud, `package.json` manque (le
`.gitignore` racine exclut tous les `package.json`) : Remotion 4.0.537, React 19, spessasynth_core 4.3.22, et le
Chromium de Playwright avec `--browser-executable`.
