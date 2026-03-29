# filtré. — Guide de mise en ligne

## Étape 1 — Cloudflare Worker (token sécurisé)

**But :** cacher le token Airtable dans un serveur Cloudflare, pas dans le JS du navigateur.

1. Aller sur **dash.cloudflare.com** → Workers & Pages → Create Worker
2. Nommer le worker : `filtre-api`
3. Copier-coller le code de `cloudflare-worker.js`
4. Cliquer **Deploy**
5. Aller dans **Settings → Variables and Secrets** → Add les 3 variables :
   - `AIRTABLE_TOKEN` = `patQV7UcOnLulYE5m.f51b883c70122a972ebaac553a3ab5432b3428d7bec2459b8e409ffdb2c99cea`
   - `AIRTABLE_BASE`  = `app7QoSQdT5sYoQ8F`
   - `AIRTABLE_TABLE` = `tblg9QAw3WRD4UZ1v`
6. Copier l'URL du worker : `https://filtre-api.TON-SOUS-DOMAINE.workers.dev`
7. Dans `index.html`, remplacer :
   ```
   const WORKER_URL = 'REMPLACER_PAR_URL_WORKER';
   ```
   par :
   ```
   const WORKER_URL = 'https://filtre-api.TON-SOUS-DOMAINE.workers.dev';
   ```
8. Supprimer les 3 lignes `AIRTABLE_BASE / TABLE / TOKEN` dans `index.html` (plus nécessaires en prod)

---

## Étape 2 — Equateur Analytics

1. Créer un compte sur **equateur.org**
2. Ajouter le site `filtre.cafe`
3. Récupérer ta clé (format `pk_live_XXXX`)
4. Dans `index.html`, remplacer :
   ```
   data-equateur-key="REMPLACER_PAR_TON_ID_EQUATEUR"
   ```
   par ta vraie clé.

---

## Étape 3 — Image OG (partage réseaux sociaux)

Créer une image `og-image.png` (1200×630px) avec :
- Fond sombre (#0f172a)
- Logo "filtré." en blanc (Instrument Serif)
- Tagline "Le guide du café de spécialité"
- Uploader à la racine du site

---

## Étape 4 — OVH (hébergement)

### Option A : Hébergement mutualisé OVH (FTP)

Fichiers à uploader via FTP dans `www/` ou `public_html/` :
```
index.html          ← fichier principal
robots.txt
sitemap.xml
og-image.png        ← à créer
```

Ne pas uploader :
- `cloudflare-worker.js` (reste en local)
- `check_urls.py` (tourne sur ta machine)
- `DEPLOIEMENT.md`
- `airtable-schema.md`
- `n8n-workflow-*.json`

Accès FTP OVH :
- Hôte : `ftp.cluster0XX.hosting.ovh.net` (voir email OVH)
- Login : ton identifiant OVH
- Mot de passe : mot de passe FTP (dans Manager → Hébergements → FTP-SSH)

### Option B : VPS OVH (SSH)

```bash
# Connexion
ssh ubuntu@TON-IP-VPS

# Installer nginx
sudo apt install nginx -y

# Uploader les fichiers
scp index.html robots.txt sitemap.xml og-image.png ubuntu@TON-IP-VPS:/var/www/html/

# Config nginx (déjà inclus dans /etc/nginx/sites-available/default)
sudo systemctl restart nginx
```

---

## Étape 5 — DNS OVH (pointer le domaine)

Dans **Manager OVH → Domaines → Zone DNS** :
- Type `A`     → `filtre.cafe` → IP du serveur
- Type `CNAME` → `www`         → `filtre.cafe`

Si hébergement mutualisé : OVH gère le DNS automatiquement.

---

## Checklist finale avant go-live

- [ ] Worker Cloudflare déployé avec les 3 variables
- [ ] `WORKER_URL` mis à jour dans `index.html`
- [ ] Token Airtable read-only créé et mis dans CF
- [ ] Clé Equateur ajoutée dans `index.html`
- [ ] `og-image.png` créée et uploadée
- [ ] Fichiers uploadés sur OVH
- [ ] DNS configuré et propagé (24-48h max)
- [ ] Tester https://filtre.cafe → catalogue se charge depuis Airtable
- [ ] Tester partage sur iMessage/WhatsApp → aperçu OG s'affiche
