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
Épisode 1 : le V60 (`src/episodes/v60/`, 4 min 22, compositions `V60Episode`, `V60EpisodeMiniature`, `V60Short-*`).

La voix fixe tout le minutage. Chaîne complète, depuis `tools/video` :

1. **Texte** : `src/episodes/<méthode>/narration.json`, chapitres et phrases. Champ `ecrit` pour les sous-titres,
   champ `dit` pour la voix (nombres en toutes lettres, « V soixante », « bloum »). Aucun chiffre hors des articles.
   La voix étant synthétique, la narration ne dit pas « je ».
2. **Voix** : `python outils/narration.py v60`, avec un Python où sont installés `kokoro-onnx soundfile faster-whisper
   num2words` (paquets précompilés : `pip install --only-binary=:all: …`). Modèles hors dépôt dans `$TTS_MODELES` :
   `kokoro.onnx` et `ff_siwis.bin` (dépôt Hugging Face `onnx-community/Kokoro-82M-v1.0-ONNX`). Écrit la piste voix
   (`public/audio/`), `minutage.json` (à suivre dans git) et `out/episode-v60.srt`. Chaque phrase est relue par
   faster-whisper : une phrase signalée « À REVOIR » est à réécrire dans `dit` (les homophones sont de fausses alertes).
   Kokoro rate l'attaque des phrases très courtes : les allonger (« Jetez cette eau de rinçage. »).
3. **Musique** : `MELODIE=aucune BATTERIE=jazz node outils/musique-sf2.mjs episode-v60 262 462885100`, la graine du tuto
   V60 sans sa mélodie (même accompagnement, rien ne chante sous la voix).
4. **Mixage** : `python3 outils/mixage.py v60`, musique à 18 dB sous la voix, 9 dB dans les silences, -14 LUFS.
5. **Contrôle** : `CHROME=… CHROME_MODE=headless-shell node outils/planche.mjs V60Episode <images> planche.png 0.25 7`.
6. **Rendu** : `npx remotion render V60Episode out/episode-v60.mp4 --crf=18 --audio-codec=aac --audio-bitrate=192k`
   (le son est dans la composition), puis les Shorts : `npx remotion render V60Short-dose …`.

Les scènes du tuto (poste de préparation, diagnostic, fin, eau) sont rejouées au rythme de la voix avec `<Freeze>` et
`recale()` (`src/episodes/temps.ts`) : aucune ne change pour l'épisode. En session cloud, `package.json` manque (le
`.gitignore` racine exclut tous les `package.json`) : Remotion 4.0.537, React 19, spessasynth_core 4.3.22, et le
Chromium de Playwright avec `--browser-executable`.
