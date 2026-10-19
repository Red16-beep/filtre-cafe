# filtré. : règles de travail

## Rédaction

La ligne éditoriale, le ton et le protocole d'extraction sont dans `.clinerules`.
Ce fichier-ci ne traite que du code et de l'exploitation du site.

## Validation : jamais côté navigateur seul

Tout contrôle qui protège quelque chose doit être appliqué dans la fonction
Cloudflare, dans `functions/api/`. Un contrôle qui vit dans le HTML ou dans un
script de page est indicatif, jamais protecteur : on ouvre l'inspecteur, on lit
le `fetch`, on rejoue la requête avec les valeurs qu'on veut.

Le champ `_ts` du formulaire d'inscription en est l'exemple : il filtre les bots
les plus simples pour zéro coût, et il ne vaut rien contre quelqu'un qui vise
l'endpoint directement. On le garde, on ne compte pas dessus.

Ça vaut pour la validation d'email, les limites d'usage, et tout ce qui
ressemble à une autorisation.

## Toute route publique sous `functions/api/`

Trois exigences, à respecter dès l'écriture de la route :

**Une limite par IP.** Compteur sur `CF-Connecting-IP`, via le KV `NL_RATELIMIT`
s'il existe un binding, sinon via le cache local. Voir `functions/api/subscribe.js`
pour le motif : cinq par heure y suffisent (plusieurs personnes derrière une même
connexion ne doivent pas se bloquer).

**Un échec silencieux.** Au-delà de la limite, renvoyer la même réponse qu'un
succès. Un bot qui apprend qu'il est bloqué ajuste et recommence ; un bot qui
croit avoir réussi s'arrête là.

**Aucun blocage d'un lecteur légitime.** Si le stockage du compteur tombe, la
requête passe. Un garde-fou qui casse une inscription réelle coûte plus cher
que le spam qu'il évite.

## Origine, type de contenu, taille

`/api/subscribe` refuse (403) toute requête dont l'`Origin` n'est pas
`https://filtre.cafe` ou `https://www.filtre.cafe` (ou `Sec-Fetch-Site:
same-origin` sans `Origin`), exige du JSON (415), borne le corps à 2 Ko (413) et
l'email à 254 caractères. Les erreurs de Brevo ne sont jamais renvoyées au
visiteur. Aucune réponse n'ouvre CORS : tous les formulaires sont same-origin.
Conséquence : un déploiement de preview `*.pages.dev` n'accepte pas d'inscription,
ce qui évite d'écrire dans la vraie liste.

## Double opt-in

La fonction appelle `POST /v3/contacts/doubleOptinConfirmation` dès que la
variable d'environnement `BREVO_DOI_TEMPLATE_ID` existe : l'adresse n'entre dans
la liste qu'après un clic dans le mail de confirmation, et une adresse injectée ne
confirme jamais. Sans la variable, l'inscription est directe (ancien comportement).
Le modèle est prêt dans Brevo : n° 1, « Template de confirmation double opt-in par
défaut », expéditeur « filtré. » <reda@news.filtre.cafe> (domaine authentifié), objet
« Confirmez votre inscription à la lettre filtré. » (réglé le 18 octobre 2026). Pour
l'activer : Cloudflare Pages, projet filtre-cafe, Settings, Variables d'environnement
(production), `BREVO_DOI_TEMPLATE_ID` = `1`, puis redéployer. La redirection après clic
va vers `https://filtre.cafe/newsletter`. Si Brevo refuse la demande de confirmation
(modèle supprimé ou mal réglé), la fonction inscrit directement l'adresse et l'écrit dans
les journaux : un réglage cassé ne fait jamais perdre un lecteur.

Turnstile reste la réponse si l'abus devient réel. Ne pas l'ajouter par
précaution : c'est du poids sur toutes les pages pour un problème hypothétique.

## Mesure d'audience : relais Equateur

Les pages chargent Equateur Analytics par `/api/e` (`functions/api/e.js`), plus par app.equateur.org :
les bloqueurs qui visent ce domaine ne coupent plus la mesure. En GET, la fonction sert le script
d'Equateur ; en POST, elle transmet ses envois à `https://app.equateur.org/api/e` avec l'adresse IP du
visiteur (`X-Forwarded-For` et `X-Real-IP`) et le jeton du relais (`X-Equateur-Proxy-Token`), lu dans la
variable Cloudflare `EQUATEUR_PROXY_TOKEN` (type Secret, production). Sans la variable, ou si le script
ne se lit pas chez Equateur, `/api/e` renvoie le chargeur d'origine et la mesure part directement, comme
avant : d'où `app.equateur.org` gardé dans la CSP. Le jeton se remplace dans Equateur (réglages du site,
section Collecte), puis dans Cloudflare, et vaut au déploiement suivant.

Mêmes règles que les autres routes : origine filtre.cafe (une preview ne transmet rien), corps borné à
4 Ko, envois du seul site filtre.cafe, mille envois par heure et par IP puis la même réponse 204, et
l'envoi passe si le compteur tombe. Ce compteur vit dans le cache local seulement : le KV facture ses
écritures (mille par jour en offre gratuite), et `/api/subscribe` s'en sert.

## Secrets

Aucune clé dans le dépôt, y compris dans l'historique. Les clés vivent dans les
variables d'environnement Cloudflare et se lisent via `env.`. Vérifier avant
tout commit qui touche `functions/`.

Attention : les déploiements de preview utilisent les mêmes variables que la
production. Le contrôle d'origine de `/api/subscribe` les bloque, mais toute
nouvelle route qui écrit quelque part doit prévoir la même protection.

## Après une publication

Pour signaler à Bing les pages nouvelles ou modifiées, depuis une machine avec accès
réseau : `node scripts/indexnow-submit.mjs <urls>` (sans argument, tout le sitemap part).
Ne jamais le lancer sans l'accord de l'auteur : il émet des requêtes vers `api.indexnow.org`.
La clé est publique par construction (fichier `.txt` à la racine), ce n'est pas un secret.

Pour la Search Console : `node scripts/gsc.mjs` donne l'état d'indexation des pages du dernier `lastmod`
du sitemap (ou des URL passées en argument), `--sitemap` renvoie le sitemap à Google. Il lit la clé d'un
compte de service Google dans les variables d'environnement `GSC_CLIENT_EMAIL` et `GSC_PRIVATE_KEY`
(réglages de l'environnement cloud, jamais dans le dépôt), ajouté comme utilisateur de la propriété
filtre.cafe ; en session cloud, préfixer la commande de `NODE_USE_ENV_PROXY=1`. L'API ne sait pas
« Demander l'indexation » : ce clic se fait dans la Search Console.

## Illustration et icônes de la lettre

Depuis la N°11, chaque lettre porte l'illustration de l'article du sujet et une icône par rubrique.
Le mail ne lit ni le SVG ni la vidéo : `python3 tools/lettre/icones.py NN nom…` exporte les dessins de
`tools/v2/scenes.py` (`ENVIES_ICONES`, `LETTRE_ICONES`) en GIF dans `newsletter/img/NN/` et affiche la
balise `<img>` à coller dans `nl-0NN.html`. L'illustration du mail est le `.jpg` 1200 px de
`illustrations/`, en URL absolue `https://filtre.cafe/…`. La version en ligne (`newsletter/NN.html`)
reprend la figure `data-illu` des articles et le SVG animé du site (`icones.py --web nom`). Aucun texte
dans les images. Les images n'existent en ligne qu'après le déploiement : le test Brevo se fait après.

## Pages générées par `tools/v2/build.py`

Depuis le lancement de la v2 (17 octobre 2026), `astro/src/layouts/Base.astro` et les pages
racine (`a-propos.html`, `commencer-ici.html`, `mentions-legales.html`, `newsletter/NN.html`…)
sont des sources ordinaires : on les modifie directement. `python3 tools/v2/build.py` ne
régénère plus que l'accueil, la 404, `/cafes-du-monde`, `/schemas` et `/recettes` (à modifier
dans `build.py` ou `scenes.py`), puis met à jour en place, dans les sources, le numéro de
version de `v2.css` / `v2.js` et les espaces insécables. L'option `--habiller-originaux`
reconstruit encore Base.astro et les pages racine depuis l'ancien `main` (98c34d9) : elle écrase
toute modification faite depuis, ne pas l'utiliser.

## Projet à part : `carnet/`, en bêta cachée sur `/carnet/`

`carnet/` est un side project, le carnet de bord du café (appli web installable). Depuis le 19 octobre 2026, il est
en bêta cachée sur https://filtre.cafe/carnet/ : aucun lien depuis le site, `noindex` (balise et `X-Robots-Tag`).
`astro/sync-public.sh` le copie sans `outils/` ni `README.md`, et le lint le lit.

Il garde sa propre politique de sécurité, en `<meta>` dans `carnet/index.html` : le bloc `/carnet/*` de `_headers`
détache celle du site et rouvre la géolocalisation. Une nouvelle source externe du carnet s'ajoute dans cette
balise, pas dans la politique du site.

Le carnet cite le site : recettes, repères de repos et 26 anecdotes, chacune avec le lien de son article
(`carnet/donnees.js`). Un article renommé, supprimé ou corrigé sur l'un de ces points se reporte dans `donnees.js` ;
`node carnet/outils/tester.js` vérifie que chaque lien du carnet vers le journal mène à un article qui existe.

Avant un lancement public : compléter la politique de confidentialité (position envoyée à OpenStreetMap, ville à la
Géoplateforme de l'IGN), puis faire un lien depuis le site. Décisions, périmètre et tests : `carnet/README.md`. Il
n'a aucune route serveur ; s'il lui en faut une un jour, elle suit les règles ci-dessus.
