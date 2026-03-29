#!/usr/bin/env python3
"""
filtré. — Vérificateur de liens hebdomadaire
Vérifie chaque URL dans Airtable, désactive les cafés avec liens morts (404/timeout).
Usage : python3 check_urls.py
Automatisation macOS : launchd (voir README ci-dessous)
"""

import json
import urllib.request
import urllib.error
import urllib.parse
import http.client
import ssl
import sys
from datetime import datetime

# ── Config ─────────────────────────────────────────────────────────────────
AIRTABLE_TOKEN = 'patsWMMKdF39ftMkO.33191de3ceea06c9d85a02bdbdb0ecb42ce63069834ccd60c67289e412288b2e'
AIRTABLE_BASE  = 'app7QoSQdT5sYoQ8F'
AIRTABLE_TABLE = 'tblg9QAw3WRD4UZ1v'
TIMEOUT        = 10   # secondes par URL
LOG_FILE       = '/Users/redahassani/Webo/url_check.log'

HEADERS = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}


def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M')
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, 'a') as f:
        f.write(line + '\n')


def airtable_get(path, params=None):
    url = f'https://api.airtable.com/v0/{AIRTABLE_BASE}/{AIRTABLE_TABLE}'
    if path:
        url += '/' + path
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def airtable_patch(record_id, fields):
    url = f'https://api.airtable.com/v0/{AIRTABLE_BASE}/{AIRTABLE_TABLE}/{record_id}'
    body = json.dumps({'fields': fields}).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=HEADERS, method='PATCH')
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def check_url(url):
    """Retourne (ok: bool, status_code: int|str)"""
    if not url or url == '#':
        return False, 'no_url'
    try:
        ctx = ssl.create_default_context()
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (filtré-bot/1.0)'},
            method='HEAD'
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as r:
            code = r.status
            return code < 400, code
    except urllib.error.HTTPError as e:
        return e.code < 400, e.code
    except Exception as e:
        return False, str(e)[:40]


def main():
    log("=== Début vérification liens filtré. ===")

    # Récupère tous les cafés actifs
    try:
        data = airtable_get('', {'filterByFormula': '{Actif}=1'})
    except Exception as e:
        log(f"ERREUR lecture Airtable: {e}")
        sys.exit(1)

    records = data.get('records', [])
    log(f"{len(records)} cafés actifs trouvés")

    dead   = []
    ok_cnt = 0

    for rec in records:
        fields = rec.get('fields', {})
        name   = fields.get('Nom', '?')
        url    = fields.get('URL', '')

        ok, status = check_url(url)

        if ok:
            log(f"✅ {name} — {status}")
            ok_cnt += 1
        else:
            log(f"❌ {name} — {status} → désactivation")
            dead.append((rec['id'], name, status))

    # Désactive les liens morts
    for rid, name, status in dead:
        try:
            airtable_patch(rid, {'Actif': False})
            log(f"   ↳ {name} passé en 'inactive'")
        except Exception as e:
            log(f"   ↳ ERREUR mise à jour {name}: {e}")

    log(f"=== Fin : {ok_cnt} OK · {len(dead)} désactivés ===\n")

    # Résumé en sortie standard pour launchd
    if dead:
        print(f"\n⚠️  {len(dead)} lien(s) mort(s) désactivé(s) :")
        for _, name, status in dead:
            print(f"   • {name} ({status})")
    else:
        print(f"\n✅ Tous les {ok_cnt} liens sont valides.")


if __name__ == '__main__':
    main()
