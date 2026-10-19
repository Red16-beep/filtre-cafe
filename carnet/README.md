# Carnet filtré.

Projet à part du site : le carnet de bord du café, tout en un. On note une tasse en trente secondes, le carnet dit
quoi changer à la suivante, chaque origine goûtée pose un tampon dans un passeport, et les bonnes adresses autour de
soi sont à un onglet. Un peu de jeu pousse à noter chaque jour : des niveaux qui suivent la torréfaction, une série
de jours, douze succès.

## Où on en est

Prototype v0.3, 19 octobre 2026. Appli web installable sur l'écran d'accueil, qui marche hors ligne (sauf la
recherche d'adresses, qui a besoin du réseau).

- **Noter** : méthode (V60, Chemex, AeroPress, piston, espresso, moka, 4:6, Switch, glacé, cold brew), café,
  dose, eau, mouture, température, temps, goût, note sur 5, deux mots. Le formulaire reprend la dernière tasse du
  même café avec la même méthode, sinon la recette du site.
  - **Boussole du goût** : une grille de 3 × 3, l'acidité à gauche, l'amertume à droite, trop fort en haut, trop
    léger en bas, l'équilibre au centre. Un toucher note les deux axes à la fois.
  - **Sachet** (facultatif, à la création du café ou dans sa fiche) : date de torréfaction et poids.
  - **Chrono** : l'écran reste allumé tant qu'il tourne (Screen Wake Lock), et un second bouton note la fin du
    bloom (V60, Chemex, 4:6, Switch, glacé) ou la première goutte (espresso).
- **Conseil** après chaque tasse : le goût d'abord (acide, amer, trop léger, trop fort, équilibré), le temps en
  appoint quand le guide donne une fenêtre (V60, Chemex, espresso). Un seul réglage à la fois, avec le lien vers
  l'article du site qui l'explique, et la boussole qui montre le chemin vers le centre. Le conseil revient en rappel
  à la tasse suivante. Avec une date de torréfaction, il tient compte de l'âge : avant J+7 (J+10 en espresso) le café
  dégaze encore, au-delà de six semaines ses arômes s'estompent (repères de l'article sur le dégazage).
- **Cafés** : l'historique par café, le meilleur réglage, « Rejouer » pour repartir d'une tasse. L'âge du café
  (J+12, coloré selon la fenêtre de repos), ce qu'il reste dans le sachet et le nombre de tasses à venir. Sous 5 g,
  le carnet propose de déclarer le sachet fini : le café passe dans « Cafés rangés », avec la moyenne de ses notes ;
  « Nouveau sachet » le ressort. La boussole du café trace ses dernières tasses.
- **Passeport** (l'ancien onglet Origines ; `#origines` y mène encore) :
  - le niveau, du grain vert au maître torréfacteur, avec ses points et la série de jours ;
  - douze succès, du premier espresso dans la fenêtre au sachet fini ;
  - un tampon par origine goûtée, à la couleur de son continent, et la carte de la ceinture du café (le dessin de
    `/cafes-du-monde`), avec les origines que le site traite, à découvrir.
- **Grain de poche** : après 3 jours de suite, « Oh, un grain de café dans votre poche ! ». Il sauve la série le
  jour où l'on en saute un. Un seul à la fois ; le suivant se trouve après 7 jours de suite.
- **Le jeu** : 10 points par tasse (trois tasses par jour au plus), 5 de plus avec un goût noté, 40 par succès.
  Tout se recalcule depuis les tasses et les sachets, sans état à part : un import ou une suppression restent
  cohérents. Un succès ou un niveau débloqué fait voler des grains et des cerises de café, sauf si le téléphone
  demande moins d'animations.
- **Adresses** : depuis sa position ou une ville, un radar à 2 km et trois listes, avec distance, temps à pied,
  itinéraire (Plans sur iPhone, Google Maps ailleurs) :
  - les adresses de filtré. : 33 cafés et boutiques des maisons recommandées dans les articles, positions
    vérifiées dans OpenStreetMap ;
  - les coffee shops indépendants du quartier, d'après OpenStreetMap, non testés : chaînes, thé, capsules et CBD
    écartés ;
  - vos adresses : celles que vous gardez.
- **Données** : apparence (comme le téléphone, claire ou sombre), export en JSON (fichier, ou copie à coller dans
  une note), import, effacement. Les suppressions se confirment par un second toucher, dans la page :
  `confirm()` est refusé dans certains cadres.

## Décisions prises

- **Pas une appli native, pas un clone de Beanconqueror.** Beanconqueror est recommandé dans la lettre 06
  (gratuit, open source, le plus complet) ; son seul défaut cité est une interface dense. Le carnet vise le lecteur
  qui débute : simple, en français, relié aux recettes et aux diagnostics du site.
- **Tout en un, carnet et adresses** (choix de l'auteur). Une carte vaut par sa couverture : les adresses de
  filtré. donnent la qualité, OpenStreetMap la couverture, et chacun garde les siennes. Les coffee shops
  d'OpenStreetMap restent marqués « non testés ».
- **Données sur le téléphone, sans compte ni serveur à nous** (`localStorage`). Pas de route `functions/api/` à
  protéger. La recherche d'adresses interroge depuis le téléphone, sur demande, Overpass (OpenStreetMap) avec la
  position arrondie à 100 m, et la Géoplateforme de l'IGN pour une ville tapée. La position GPS n'est jamais
  enregistrée ; une ville choisie l'est, sur le téléphone, pour la visite suivante.
- **Safari efface les données d'un site resté fermé sept jours d'utilisation**, sauf s'il est installé sur l'écran
  d'accueil. D'où l'encadré d'installation et l'export.
- **Pas de balance Bluetooth** : Safari sur iOS ne gère pas Web Bluetooth.
- **Idées reprises de Beanconqueror, pas son code** : date de torréfaction, poids du sachet, temps intermédiaire
  au chrono, rangement d'un sachet fini. Son code est sous GPL-3.0 : rien n'en est copié. Le conseil après chaque
  tasse, lui, n'a pas d'équivalent dans Beanconqueror.
- **canvas-confetti** (1.9.4, licence ISC, `vendor/`) pour les grains qui volent : copié dans le dossier pour le
  hors ligne, appelé sans worker (certains cadres les refusent), coupé quand le téléphone demande moins
  d'animations.
- **Pas de vibration sur iPhone** : Safari n'a pas `navigator.vibrate`, et l'astuce de la case `switch` dont se
  servent des bibliothèques comme ios-haptics ne marche que d'iOS 17.4 à 26.4, d'après leur documentation. La
  vibration courte ne joue que sur Android.
- **Écran allumé** : Screen Wake Lock, dans Safari depuis iOS 16.4 et dans l'appli installée depuis iOS 18.4. Refusé
  ou absent, le chrono marche pareil.
- **Bêta cachée sur filtre.cafe/carnet/** (19 octobre 2026) : `astro/sync-public.sh` copie le dossier (sans
  `outils/` ni ce README) ; aucun lien depuis le site, `noindex` en balise et en `X-Robots-Tag`. Le carnet a sa
  propre politique de sécurité en `<meta>` dans `index.html` (OpenStreetMap, IGN) ; le bloc `/carnet/*` de
  `_headers` détache celle du site et permet la géolocalisation. Avant un lancement public : la politique de
  confidentialité du site, puis un lien.
- **Chiffres et conseils repris des guides** (étapes HowTo des pages du journal). Si une recette change sur le
  site, la changer aussi dans `donnees.js`.

## Adresses à compléter

- Sans position vérifiée dans OpenStreetMap, donc absentes : Café Oberkampf (Paris 11e), La Brûlerie du Cantin
  (Lens), Ximun (Pays basque). Avec l'adresse exacte, elles s'ajoutent dans `donnees.js`.
- Écartées : MUDA et Cloudforest (Lille), que l'article dit ne pas avoir encore goûtées.
- Les positions viennent d'OpenStreetMap (© contributeurs OpenStreetMap, ODbL), relevées le 18 octobre 2026.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html`, `app.css`, `app.js` | L'appli. Aucune étape de construction. |
| `donnees.js` | Méthodes et recettes, origines, adresses de filtré., villes, goûts, conseils, repos, niveaux, succès et leurs icônes. |
| `vendor/canvas-confetti.js` | Copie de canvas-confetti 1.9.4, licence ISC en tête du fichier. |
| `carte.js` | Terres de la carte, généré par `python3 carnet/outils/carte.py` depuis `tools/v2/scenes.py`. |
| `sw.js`, `manifest.webmanifest` | Hors ligne et installation. Changer `VERSION` dans `sw.js` à chaque modification des fichiers. |
| `polices/` | Copies des polices v2 du site (Newsreader, Instrument Sans, sous-ensemble latin). |
| `icones/` | `icone.svg`, le logo du site sur fond espresso, et ses rendus PNG (192, 512, masquable, Apple). |
| `outils/tester.js` | Le parcours complet dans Chromium, réseau et écran allumé simulés (144 vérifications). |

## Tester

```
node carnet/outils/tester.js
```

Le script sert le dossier lui-même et a besoin de Playwright (`PLAYWRIGHT=` et `CHROMIUM=` si le module ou le
navigateur ne sont pas trouvés).

Pour l'essayer à la main : `python3 -m http.server 8765 --directory carnet`, puis `http://localhost:8765/`.

Sur téléphone : https://filtre.cafe/carnet/ dans Safari, puis Partager, « Sur l'écran d'accueil ». Chaque
branche poussée a aussi son aperçu Cloudflare, `https://<branche>.filtre-cafe.pages.dev/carnet/`.

## Suite possible

1. Deux semaines d'essai sur téléphone : est-ce qu'on note vraiment chaque tasse ? Le réglage d'un nouveau café en
   espresso est le meilleur test.
2. Relier une tasse à une adresse : « bu ici » depuis un café gardé.
3. Modifier une tasse (aujourd'hui : supprimer, puis noter à nouveau).
4. Une vraie carte de quartier avec les rues (tuiles OpenStreetMap), en plus du radar.
5. Un défi de la semaine relié à la lettre (« un café, nature et au lait »), partager un café et sa meilleure
   recette par un lien, un bilan de l'année en décembre.
6. Plus tard, et seulement si l'usage le justifie : compte et synchronisation. La route suivrait alors les règles
   du `CLAUDE.md` racine (limite par IP, échec silencieux, contrôle d'origine).
