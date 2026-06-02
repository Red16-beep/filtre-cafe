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
