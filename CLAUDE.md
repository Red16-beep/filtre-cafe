# filtré. — règles de travail

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

**Une limite par IP.** Compteur sur `CF-Connecting-IP`, via le KV s'il existe un
binding, sinon via le cache local. Voir `functions/api/subscribe.js` pour le
motif : trois par heure y suffisent.

**Un échec silencieux.** Au-delà de la limite, renvoyer la même réponse qu'un
succès. Un bot qui apprend qu'il est bloqué ajuste et recommence ; un bot qui
croit avoir réussi s'arrête là.

**Aucun blocage d'un lecteur légitime.** Si le stockage du compteur tombe, la
requête passe. Un garde-fou qui casse une inscription réelle coûte plus cher
que le spam qu'il évite.

## Ce qui ne se règle pas dans le code

Le double opt-in de la liste Brevo est la protection la plus efficace contre
l'injection d'adresses, et elle se configure dans leur interface. Une adresse
injectée ne confirme jamais. Le rate-limit ralentit, le double opt-in assainit.

Turnstile reste la réponse si l'abus devient réel. Ne pas l'ajouter par
précaution : c'est du poids sur toutes les pages pour un problème hypothétique.

## Secrets

Aucune clé dans le dépôt, y compris dans l'historique. Les clés vivent dans les
variables d'environnement Cloudflare et se lisent via `env.`. Vérifier avant
tout commit qui touche `functions/`.

Attention : les déploiements de preview utilisent les mêmes variables que la
production. Tester un formulaire sur une URL `*.pages.dev` écrit dans la vraie
liste Brevo.
