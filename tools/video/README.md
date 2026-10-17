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
