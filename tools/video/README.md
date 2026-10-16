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
