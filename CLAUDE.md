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
Pour l'activer : créer dans Brevo un modèle de mail de double opt-in (dans les
paramètres des formulaires d'inscription du compte), puis renseigner son numéro
dans Cloudflare Pages, Settings, Variables d'environnement (production). La redirection après clic va
vers `https://filtre.cafe/newsletter`.

Turnstile reste la réponse si l'abus devient réel. Ne pas l'ajouter par
précaution : c'est du poids sur toutes les pages pour un problème hypothétique.

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
