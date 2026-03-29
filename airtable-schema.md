# Airtable — Table "Cafés"

Crée une nouvelle base Airtable, puis une table nommée exactement **Cafés**.
Ajoute ces colonnes dans cet ordre :

| Nom de la colonne | Type Airtable       | Valeurs possibles / Notes              |
|-------------------|---------------------|----------------------------------------|
| Nom               | Single line text    | Ex : Kenya Karogoto                    |
| Marque            | Single line text    | Ex : Klover Coffee Paris               |
| URL               | URL                 | Lien direct vers la page produit       |
| Prix              | Number (décimal)    | Ex : 20.00                             |
| Poids             | Number (entier)     | En grammes. Ex : 200, 250, 1000        |
| Type              | Single select       | arabica / robusta / blend              |
| Intensite         | Number (entier)     | De 1 (doux) à 4 (puissant)            |
| Acidite           | Number (entier)     | De 0 à 100                             |
| Corps             | Number (entier)     | De 0 à 100                             |
| Sucre             | Number (entier)     | De 0 à 100                             |
| Aromes            | Multiple select     | fruité / chocolat / floral / épicé / terreux / caramel |
| Methodes          | Multiple select     | expresso / v60 / piston / chemex / moka / aeropress    |
| Note              | Number (décimal)    | De 0 à 10. Ex : 9.5                    |
| SCA               | Number (entier)     | De 80 à 100                            |
| Verdict           | Long text           | Ton avis perso, 1-3 phrases            |
| Icone             | Single select       | bean / flower / leaf / berry / sparkle |
| Status            | Single select       | active / inactive                      |

---

## 5 étapes pour tout connecter

**1. Airtable**
- Crée la table ci-dessus
- Copie l'ID de ta base depuis l'URL : airtable.com/appXXXXXXXX/...
- Génère un token API : airtable.com/create/tokens (scope : data.records:read + data.records:write)

**2. n8n — Workflow API (n8n-workflow-api.json)**
- Importe le fichier dans n8n (menu → Import workflow)
- Dans le nœud "Lire Airtable" : remplace REMPLACER_PAR_TON_BASE_ID par ton ID Airtable
- Connecte ton credential Airtable (colle ton token)
- Active le workflow → copie l'URL du webhook (ex: https://xxx.app.n8n.cloud/webhook/cafes)

**3. n8n — Workflow Checker (n8n-workflow-checker.json)**
- Importe le fichier dans n8n
- Dans les nœuds Airtable : remplace l'ID de base + connecte le credential
- Dans "Envoyer email alerte" : remplace REMPLACER_PAR_TON_EMAIL + connecte ton SMTP (ou Gmail)
- Active le workflow

**4. index.html — une seule ligne**
Ouvre index.html, cherche :
  const N8N_WEBHOOK_URL = '';
Remplace par :
  const N8N_WEBHOOK_URL = 'https://ton-url-webhook.app.n8n.cloud/webhook/cafes';

**5. C'est tout.**
- Le site lit les cafés en temps réel depuis Airtable
- Chaque lundi à 9h, n8n vérifie tous les liens
- Si un lien est mort : le café passe inactif automatiquement + tu reçois un email
