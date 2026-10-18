# Carnet filtré.

Projet à part du site : le carnet de bord du café, tout en un. On note une tasse en trente secondes, le carnet dit
quoi changer à la suivante, chaque origine goûtée s'allume sur une carte, et les bonnes adresses autour de soi sont
à un onglet.

## Où on en est

Prototype v0.2, 18 octobre 2026. Appli web installable sur l'écran d'accueil, qui marche hors ligne (sauf la
recherche d'adresses, qui a besoin du réseau).

- **Noter** : méthode (V60, Chemex, AeroPress, piston, espresso, moka, 4:6, Switch, glacé, cold brew), café,
  dose, eau, mouture, température, temps (avec chrono), goût, note sur 5, deux mots. Le formulaire reprend la
  dernière tasse du même café avec la même méthode, sinon la recette du site.
- **Conseil** après chaque tasse : le goût d'abord (acide, amer, trop léger, trop fort, équilibré), le temps en
  appoint quand le guide donne une fenêtre (V60, Chemex, espresso). Un seul réglage à la fois, avec le lien vers
  l'article du site qui l'explique. Le conseil revient en rappel à la tasse suivante.
- **Cafés** : l'historique par café, le meilleur réglage, « Rejouer » pour repartir d'une tasse.
- **Origines** : les origines goûtées sur la carte de la ceinture du café (le dessin de `/cafes-du-monde`), et les
  origines que le site traite, à découvrir.
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
- **Hors du site** : `astro/sync-public.sh` ne copie pas ce dossier. Il n'est ni construit ni déployé avec
  filtre.cafe, et `astro/lint.py` ne le lit pas.
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
| `index.html`, `app.css`, `app.js` | L'appli. Aucune dépendance, aucune étape de construction. |
| `donnees.js` | Méthodes et recettes, origines, adresses de filtré., villes, goûts, conseils. |
| `carte.js` | Terres de la carte, généré par `python3 carnet/outils/carte.py` depuis `tools/v2/scenes.py`. |
| `sw.js`, `manifest.webmanifest` | Hors ligne et installation. Changer `VERSION` dans `sw.js` à chaque modification des fichiers. |
| `polices/` | Copies des polices v2 du site (Newsreader, Instrument Sans, sous-ensemble latin). |
| `icones/` | `icone.svg`, le logo du site sur fond espresso, et ses rendus PNG (192, 512, masquable, Apple). |
| `outils/tester.js` | Le parcours complet dans Chromium, réseau simulé (87 vérifications). |

## Tester

```
node carnet/outils/tester.js
```

Le script sert le dossier lui-même et a besoin de Playwright (`PLAYWRIGHT=` et `CHROMIUM=` si le module ou le
navigateur ne sont pas trouvés).

Pour l'essayer à la main : `python3 -m http.server 8765 --directory carnet`, puis `http://localhost:8765/`.

Sur téléphone, il faut une adresse en HTTPS. Le plus simple : un projet Cloudflare Pages à part, branché sur ce
dépôt, avec `carnet` comme répertoire racine et aucune commande de construction. Chaque branche y a son aperçu,
et le site n'est pas touché. Le dossier n'ayant pas de `functions/`, aucune route ni variable d'environnement
n'y est exposée. Dans les réglages de construction du projet, limiter les chemins surveillés (build watch paths)
à `carnet/*` : une modification du site ne relance alors pas le carnet.

## Suite possible

1. Une semaine d'essai sur téléphone : est-ce qu'on note vraiment chaque tasse ?
2. Relier une tasse à une adresse : « bu ici » depuis un café gardé.
3. Modifier une tasse (aujourd'hui : supprimer, puis noter à nouveau).
4. Une vraie carte de quartier avec les rues (tuiles OpenStreetMap), en plus du radar.
5. Plus tard, et seulement si l'usage le justifie : compte et synchronisation. La route suivrait alors les règles
   du `CLAUDE.md` racine (limite par IP, échec silencieux, contrôle d'origine).
