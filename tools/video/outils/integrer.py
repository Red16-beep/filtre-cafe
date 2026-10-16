"""Intègre un tuto vidéo dans un article de la version test (filtre.cafe).

python3 outils/integrer.py <article> <fichier> <titre> <description> <légende> <durée en s>

- corps : <figure class="video-tuto"> juste avant le premier <h2> de l'article
  (ou remplace une figure existante) ;
- tête : og:image et twitter:image sur l'affiche, balises og:video,
  max-image-preview:large, VideoObject dans le @graph JSON-LD, lié à l'Article.
"""
import html
import json
import re
import sys

SITE = '/Users/redahassani/Webo-test-croatie'
FRAG = f'{SITE}/astro/src/fragments/journal'
DATE = '2026-10-17T00:00:00+02:00'

article, fichier, titre, description, legende, duree = sys.argv[1:7]
url_article = f'https://filtre.cafe/journal/{article}'
base = f'https://filtre.cafe/videos/{fichier}'

# --- Corps ---------------------------------------------------------------
corps_f = f'{FRAG}/{article}.body.html'
corps = open(corps_f, encoding='utf-8').read()
figure = f'''<figure class="video-tuto">
      <video data-auto muted playsinline loop controls preload="none" width="1920" height="1080" poster="/videos/{fichier}-1280.webp" data-poster-vertical="/videos/{fichier}-vertical-720.webp" aria-label="Tuto vidéo : {html.escape(titre, quote=True)}">
        <source src="/videos/{fichier}-vertical.mp4" type="video/mp4" media="(max-width: 640px)">
        <source src="/videos/{fichier}.mp4" type="video/mp4">
      </video>
      <figcaption>{html.escape(legende, quote=False)}</figcaption>
    </figure>
    '''
if 'class="video-tuto"' in corps:
    corps = re.sub(r'<figure class="video-tuto">.*?</figure>\s*', figure, corps, count=1, flags=re.S)
else:
    debut = corps.index('<article class="prose-article">')
    h2 = corps.index('<h2', debut)
    corps = corps[:h2] + figure + corps[h2:]
open(corps_f, 'w', encoding='utf-8').write(corps)

# --- Tête ------------------------------------------------------------------
tete_f = f'{FRAG}/{article}.head.html'
tete = open(tete_f, encoding='utf-8').read()
tete = re.sub(r'\n<meta property="og:(image:width|image:height|video|video:type|video:width|video:height)"[^>]*>', '', tete)
tete = re.sub(r'<meta property="og:image" content="[^"]*">',
              f'<meta property="og:image" content="{base}.jpg">\n'
              '<meta property="og:image:width" content="1920">\n'
              '<meta property="og:image:height" content="1080">\n'
              f'<meta property="og:video" content="{base}.mp4">\n'
              '<meta property="og:video:type" content="video/mp4">\n'
              '<meta property="og:video:width" content="1920">\n'
              '<meta property="og:video:height" content="1080">', tete, count=1)
tete = re.sub(r'<meta name="twitter:image" content="[^"]*">', f'<meta name="twitter:image" content="{base}.jpg">', tete, count=1)
tete = re.sub(r'<meta name="robots" content="[^"]*">',
              '<meta name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1">', tete, count=1)


def maj(m):
    data = json.loads(m.group(1))
    graphe = data.get('@graph', [])
    graphe = [n for n in graphe if n.get('@type') != 'VideoObject']
    vid = f'{url_article}#video'
    for n in graphe:
        if n.get('@type') == 'Article':
            n['image'] = f'{base}.jpg'
            n['video'] = {'@id': vid}
    graphe.insert(1, {
        '@type': 'VideoObject',
        '@id': vid,
        'name': titre,
        'description': description,
        'thumbnailUrl': [f'{base}.jpg'],
        'uploadDate': DATE,
        'duration': f'PT{int(duree)}S',
        'contentUrl': f'{base}.mp4',
        'inLanguage': 'fr-FR',
        'publisher': {'@type': 'Organization', 'name': 'filtré.', 'url': 'https://filtre.cafe'},
    })
    data['@graph'] = graphe
    return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n</script>'


tete, n = re.subn(r'<script type="application/ld\+json">\s*(\{.*?"@graph".*?\})\s*</script>', maj, tete, count=1, flags=re.S)
assert n == 1, 'bloc JSON-LD @graph introuvable'
open(tete_f, 'w', encoding='utf-8').write(tete)
for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', tete, re.S):
    json.loads(m.group(1))
print('intégré', article, '— JSON-LD valide')
