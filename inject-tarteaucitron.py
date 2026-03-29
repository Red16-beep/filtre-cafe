#!/usr/bin/env python3
import re, os

FILES = [
    'index.html',
    'newsletter.html',
    'a-propos.html',
    'newsletter-01.html',
    'newsletter-02.html',
]

TARTEAUCITRON = '''<!-- Tarteaucitron CMP -->
<script src="https://cdn.jsdelivr.net/npm/tarteaucitronjs@latest/tarteaucitron.js"></script>
<script>
tarteaucitron.init({
  "privacyUrl": "/politique-confidentialite.html",
  "orientation": "bottom",
  "showAlertSmall": false,
  "cookieslist": true,
  "DenyAllCta": true,
  "AcceptAllCta": true,
  "highPrivacy": true,
  "removeCredit": false,
  "showIcon": true,
  "iconPosition": "BottomRight"
});
tarteaucitron.services.equateur = {
  "key": "equateur", "type": "analytic", "name": "Equateur Analytics",
  "uri": "https://equateur.org", "needConsent": true, "cookies": [],
  "js": function() {
    var s = document.createElement("script");
    s.src = "https://equateur.org/tracker.js";
    s.setAttribute("data-equateur-key", "aff654dd0df3f7e406ecb0a7e78ced5a");
    s.defer = true;
    document.head.appendChild(s);
  }
};
(tarteaucitron.job = tarteaucitron.job || []).push("equateur");
</script>'''

# Regex to match the equateur script tag (single or multi-line)
PATTERN = re.compile(
    r'<!-- Equateur Analytics -->\s*\n\s*<script[^>]*equateur\.org[^>]*>[^<]*</script>|'
    r'<script[^>]*equateur\.org[^>]*(?:data-equateur-key[^>]*)?>(?:\s*)</script>|'
    r'<script src="https://equateur\.org/tracker\.js"\s*[\s\S]*?</script>',
    re.MULTILINE
)

base = '/Users/redahassani/Webo'
for fname in FILES:
    path = os.path.join(base, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find and replace equateur script block
    new_content = PATTERN.sub(TARTEAUCITRON, content, count=1)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'✅ {fname} — remplacé')
    else:
        print(f'⚠️  {fname} — pattern non trouvé, vérifier manuellement')
