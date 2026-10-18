# Carnet filtré.

Projet à part du site : le carnet de bord du café. On note une tasse en trente secondes, le carnet dit quoi changer
à la suivante, et chaque origine goûtée s'allume sur une carte.

## Où on en est

Prototype v0, 18 octobre 2026. Appli web installable sur l'écran d'accueil, qui marche hors ligne.

- **Noter** : méthode (V60, Chemex, AeroPress, piston, espresso, moka, 4:6, Switch, glacé, cold brew), café,
  dose, eau, mouture, température, temps (avec chrono), goût, note sur 5, deux mots. Le formulaire reprend la
  dernière tasse du même café avec la même méthode, sinon la recette du site.
- **Conseil** après chaque tasse : le goût d'abord (acide, amer, trop léger, trop fort, équilibré), le temps en
  appoint quand le guide donne une fenêtre (V60, Chemex, espresso). Un seul réglage à la fois, avec le lien vers
  l'article du site qui l'explique. Le conseil revient en rappel à la tasse suivante.
- **Cafés** : l'historique par café, le meilleur réglage, « Rejouer » pour repartir d'une tasse.
- **Carte** : les origines goûtées sur la carte de la ceinture du café (le dessin de `/cafes-du-monde`), et les
  origines que le site traite, à découvrir.
- **Données** : export et import en JSON, effacement.

## Décisions prises

- **Pas une appli native, pas un clone de Beanconqueror.** Beanconqueror est recommandé dans la lettre 06
  (gratuit, open source, le plus complet) ; son seul défaut cité est une interface dense. Le carnet vise le lecteur
  qui débute : simple, en français, relié aux recettes et aux diagnostics du site.
- **Pas de « Google Maps de tous les cafés ».** European Coffee Trip recense déjà plus de 6 000 cafés de
  spécialité. Une carte vaut par sa couverture et sa mise à jour, c'est le travail d'une équipe. Ici, la carte se
  remplit avec les tasses du lecteur.
- **Données sur le téléphone, sans compte ni serveur** (`localStorage`). Pas de données personnelles côté
  serveur, pas de route `functions/api/` à protéger. Revers : sur iPhone, Safari efface les données d'un site
  resté fermé pendant sept jours d'utilisation, sauf s'il est installé sur l'écran d'accueil. D'où l'encadré
  d'installation et l'export.
- **Pas de balance Bluetooth** : Safari sur iOS ne gère pas Web Bluetooth.
- **Hors du site** : `astro/sync-public.sh` ne copie pas ce dossier. Il n'est ni construit ni déployé avec
  filtre.cafe, et `astro/lint.py` ne le lit pas.
- **Chiffres et conseils repris des guides** (étapes HowTo des pages du journal). Si une recette change sur le
  site, la changer aussi dans `donnees.js`.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html`, `app.css`, `app.js` | L'appli. Aucune dépendance, aucune étape de construction. |
| `donnees.js` | Méthodes et recettes, origines, procédés, goûts, conseils. |
| `carte.js` | Terres de la carte, généré par `python3 carnet/outils/carte.py` depuis `tools/v2/scenes.py`. |
| `sw.js`, `manifest.webmanifest` | Hors ligne et installation. Changer `VERSION` dans `sw.js` quand la liste des fichiers change. |
| `polices/` | Copies des polices v2 du site (Newsreader, Instrument Sans, sous-ensemble latin). |
| `icones/` | `icone.svg`, le logo du site sur fond espresso, et ses rendus PNG (192, 512, masquable, Apple). |

## Tester

En local, depuis la racine du dépôt :

```
python3 -m http.server 8765 --directory carnet
```

puis `http://localhost:8765/`.

Sur téléphone, il faut une adresse en HTTPS. Le plus simple : un projet Cloudflare Pages à part, branché sur ce
dépôt, avec `carnet` comme répertoire racine et aucune commande de construction. Chaque branche y a son aperçu,
et le site n'est pas touché. Le dossier n'ayant pas de `functions/`, aucune route ni variable d'environnement
n'y est exposée. Dans les réglages de construction du projet, limiter les chemins surveillés (build watch paths)
à `carnet/*` : une modification du site ne relance alors pas le carnet.

## Suite possible

1. Une semaine d'essai sur téléphone : est-ce qu'on note vraiment chaque tasse ?
2. Modifier une tasse (aujourd'hui : supprimer, puis noter à nouveau).
3. Les adresses : le torréfacteur de chaque paquet sur une carte OpenStreetMap, gardé sur le téléphone.
4. La couche « adresses filtré. » : les adresses testées dans les articles (6 cafés à Paris, 14 torréfacteurs).
5. Plus tard, et seulement si l'usage le justifie : compte et synchronisation. La route suivrait alors les règles
   du `CLAUDE.md` racine (limite par IP, échec silencieux, contrôle d'origine).
