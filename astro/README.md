# filtre.cafe — migration Astro

Objectif : tuer la duplication ×80 du `<head>` / nav / footer / scripts. La nav,
le footer, les polices et le tracking vivent désormais dans **un seul fichier**
(`src/layouts/Base.astro`) au lieu d'être copiés dans 80 pages.

## Architecture

- `src/layouts/Base.astro` — chrome partagé (head boilerplate, nav, footer,
  polices, scripts de tracking). On édite la nav **ici une fois**, plus dans 80 fichiers.
- `src/fragments/<section>/<slug>.{head,style,body}.html` — contenu unique de
  chaque page (meta, JSON-LD, `<style>`, corps), extrait des pages legacy.
- `src/pages/<section>/<slug>.astro` — wrapper fin qui injecte les fragments dans
  `Base` via `set:html` (aucun ré-échappement, contenu fidèle au bit près).
- `gen.py` — régénère fragments + pages depuis les HTML legacy de `journal/` et
  `guides/`. Idempotent.
- `sync-public.sh` — copie les assets et les pages racine/hub (qui gardent leur
  propre chrome) dans `public/`.

## Build local

```bash
cd astro
npm install
./sync-public.sh        # assets + pages racine -> public/
npm run build           # -> dist/  (site complet)
npm run preview         # sert dist/ en local
```

`astro.config.mjs` utilise `build.format: 'file'` → sortie `/journal/<slug>.html`
servie en `/journal/<slug>` (URLs identiques aux canonicals actuels).

## Régénérer après une édition de contenu legacy

```bash
python3 gen.py                      # toutes les pages
python3 gen.py journal/mon-slug     # une page
```

## Sitemap

`sitemap.xml` vit à la racine et `sync-public.sh` le recopie dans `public/`. Les
sections thématiques, les `<priority>` et les `<changefreq>` restent posées à la
main : c'est du jugement éditorial, aucun script n'a à y toucher. Seules les
dates dérivent, et rien ne les régénérait.

```bash
python3 tools/sitemap.py            # aligne les lastmod sur les dateModified
python3 tools/sitemap.py --check    # sort 1 si le fichier est périmé (utilisé en CI)
python3 tools/sitemap.py --oublis   # pages éditées sans que leur dateModified suive
python3 tools/sitemap.py --oublis --corriger   # et écrit la date dans les pages
```

La source est la `dateModified` du JSON-LD de chaque page, jamais la date du
dernier commit. L'essai avec git avançait 99 lastmod sur 102, parce que
l'historique est fait de passes sur tout le site : 243 fragments pour la
migration Astro, 155 pour le retrait des tirets cadratins, 28 pour la mention
Amazon. Annoncer quatre-vingt-dix-neuf pages modifiées le même jour apprend à
Google à ignorer nos dates, ce qui coûte plus cher qu'une date en retard.

Une date ne recule jamais : une cinquantaine de pages portent déjà un lastmod
plus récent que leur schema, hérité de ces passes, et l'information est réelle.

`--oublis` est l'autre bout du problème : il croise l'historique git avec les
`dateModified` pour lister les pages dont le contenu a bougé sans que la date
déclarée suive. Ça se corrige dans la page, pas dans le sitemap, d'où
`--corriger` qui écrit la date dans le JSON-LD (et l'ajoute quand la page n'avait
qu'une `datePublished` — huit pages sont dans ce cas).

Deux filtres décident de ce qui compte comme une édition. Un commit de plus de
huit fichiers est une passe sur le site, pas la modification d'une page. Et un
commit dont le sujet parle de liens affiliés, d'images recompressées, de schema
ou de meta description touche le corps sans rien changer pour qui lit : la liste
`NON_EDITORIAL` les écarte. Sans ces deux filtres le rapport sortait 99 pages ;
avec, il en sort une vingtaine, et elles sont vraies.

## Vérification de fidélité

`gen.py` + le build ont été validés : sur les 81 pages article/guide, **0 perte**
de meta / JSON-LD / scripts spécifiques. Les seules différences de sortie sont les
normalisations voulues (footer clair + set de scripts complet partout) et
l'expansion par Astro de son propre SVG de nav (`<path/>` → `<path></path>`,
strictement équivalent).

## Cutover déploiement (action requise côté Cloudflare)

Le site passe de « servir le repo tel quel » à **un build**. Dans le dashboard
Cloudflare Pages :

- **Build command** : `cd astro && npm install && ./sync-public.sh && npm run build`
- **Build output directory** : `astro/dist`
- **Root directory** : laisser à la racine du repo.

> Tant que ces réglages ne sont pas changés, rien ne bouge en prod.

## Reste à faire

- `functions/` (Cloudflare Pages Functions) : décider de l'emplacement après cutover.
- Templating des pages racine/hub (actuellement passthrough via `public/`).
- CI (GitHub Actions) : build + check liens + lint titres/anti-IA avant déploiement.
