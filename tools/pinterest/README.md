# Pinterest

## Ce que c'est, vraiment

Pinterest n'est pas Instagram. Personne ne suit un compte pour ses stories. C'est un
moteur de recherche visuel : quelqu'un tape « recette v60 » ou « quel moulin à café »,
Pinterest lui sert des images, et chaque image renvoie vers une URL. Une épingle qui
prend continue de ramener du trafic six mois plus tard, là où un post Instagram est
mort en 48 heures.

Trois conséquences directes pour le site :

- **Le texte compte plus que l'image.** Le titre et la description de l'épingle sont
  indexés par Pinterest. C'est de la recherche, pas de la photo de bar à café.
- **Une épingle = un article = une URL.** 81 articles, donc 81 épingles au départ.
- **La régularité bat le volume.** Trois épingles par jour pendant un mois valent
  mieux que 81 le même matin.

C'est le seul réseau qui fonctionne comme ce que fait déjà le site : des requêtes,
des pages, du contenu qui vieillit bien.

## À faire une fois (30 minutes, à la main)

1. **Compte professionnel** sur `pinterest.com/business/create`. Gratuit.
2. **Revendiquer filtre.cafe** dans Paramètres → Comptes revendiqués. Pinterest donne
   une balise `<meta>` à coller dans le `<head>` des pages, exactement comme
   `BingSiteAuth.xml` pour Bing. Ça débloque les statistiques et affiche « filtré. »
   sur toutes les épingles qui pointent vers le site, même celles épinglées par
   d'autres.
3. **Rich Pins : rien à faire.** Les pages ont déjà `og:title`, `og:description` et le
   schema `Article`. Pinterest les lit tout seul et enrichit l'épingle avec le titre
   réel de la page. Le validateur maison de Pinterest a été retiré, la détection est
   automatique.
4. **Créer les six tableaux**, avec ces noms au caractère près (le CSV s'en sert comme
   clé de rattachement) :

   ```
   Méthodes & extraction
   Recettes & boissons
   Matériel & achat
   Comprendre le café
   Origines & terroirs
   Adresses & voyages
   ```

## Fabriquer les épingles

```bash
python3 tools/pinterest/pins.py                     # les 81 articles
python3 tools/pinterest/pins.py journal/v60-guide-complet   # une seule page
python3 tools/pinterest/pins.py --csv-only          # juste la feuille d'import
```

Le script lit `journal/` et `guides/`, récupère `og:title`, la meta description, l'URL
canonique, `article:section` et les `<h2>` de l'article, rend une carte 1000 × 1500 aux
polices et aux couleurs du site, la capture avec Chrome, puis écrit la feuille
d'import. Sortie :

- `pins/<slug>.png` — déployé sur `https://filtre.cafe/pins/<slug>.png`
- `tools/pinterest/pins.csv` — la feuille d'import en masse

Deux mises en page alternent selon le slug, en clair ou en sombre : titre + accroche,
ou titre + sommaire de l'article. Le rendu est déterministe, un article donné garde
toujours la même carte. Pour changer le design, tout est dans `template.html`.

## L'avatar du profil

```bash
python3 tools/pinterest/pins.py --avatar
```

Sort deux carrés de 1000 px dans `tools/pinterest/` : `profil-mot.png` avec le
logotype entier, `profil-lettre.png` avec le `f.` seul. Pinterest recadre en cercle
et descend jusqu'à 48 px dans le fil, taille à laquelle le logotype entier devient
illisible — d'où la deuxième version.

Chrome est cherché dans le `PATH` puis aux emplacements habituels sur macOS. Pour
forcer :

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  python3 tools/pinterest/pins.py
```

## Publier

**À la main, pour les dix premières.** Créer une épingle, déposer le PNG, coller le
titre, la description et le lien depuis `pins.csv`. Une minute par épingle. Ça permet
de voir à quoi ça ressemble dans le feed avant d'en envoyer quatre-vingts.

**En masse ensuite.** Pinterest accepte un import CSV sur les comptes pro.
`tools/pinterest/pins.csv` est déjà au format attendu :

```
board_name, title, description, link, image_url, published_at
```

Deux conditions pour que ça passe : les PNG doivent être en ligne (ils le sont dès le
déploiement, `sync-public.sh` copie `pins/`), et le nom du tableau doit correspondre
exactement à celui créé dans Pinterest.

Pour étaler la publication au lieu de tout envoyer d'un coup, la colonne
`published_at` se remplit toute seule :

```bash
python3 tools/pinterest/pins.py --depuis 2026-09-01 --par-jour 3
```

> Réserve : la page d'aide officielle de Pinterest est inaccessible depuis la machine
> qui a écrit ce script, le format des colonnes vient de sources secondaires
> concordantes. Au moment de l'import, télécharger leur modèle et comparer les
> en-têtes. S'ils ont bougé, il n'y a que `write_csv()` à retoucher dans `pins.py`.

## Le rythme réaliste

| Quand | Quoi |
|---|---|
| Semaine 1 | Les six tableaux, dix épingles à la main sur les articles les plus forts |
| Semaines 2 à 5 | Trois par jour jusqu'au bout du catalogue (27 jours pour 81) |
| Ensuite | Une épingle par nouvel article, plus un second visuel sur ce qui prend |

Compter six à huit semaines avant de voir quoi que ce soit. Pinterest met du temps à
situer un compte neuf. Juger au bout de trois semaines, c'est juger du bruit.

## Ce qui rate

- **Tout épingler le premier jour.** Compte neuf plus rafale, le signal est mauvais.
- **Des tableaux fourre-tout.** Six tableaux thématiques valent mieux qu'un seul à
  200 épingles.
- **Renommer un slug d'article.** Les épingles pointent en dur : l'article change
  d'adresse, l'épingle envoie sur un 404 et le trafic accumulé est perdu. Si un slug
  bouge, ajouter la redirection dans `_redirects`.

## Ce que le script ne fait pas

- Pas de publication automatique. L'API Pinterest demande une application validée par
  leurs équipes ; le CSV fait le même travail sans cette démarche.
- Pas de photo. Ce sont des cartes typographiques, ce qui tombe bien vu qu'il y a trois
  images sur tout le site. Le jour où il y a des photos de matériel, ça vaudra un
  deuxième gabarit dans `template.html`.
