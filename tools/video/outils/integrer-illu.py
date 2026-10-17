"""Pose les illustrations animées dans les articles de la version test.

python3 outils/integrer-illu.py <racine du site> <illustrations.json>

Pour chaque fiche : figure (image WebP + boucle MP4 chargée à la demande) sous l'en-tête de
l'article, og:image et twitter:image vers l'illustration, max-image-preview:large, image dans
le JSON-LD Article (et en tête des images d'une Recipe). Idempotent : une page déjà traitée
est laissée telle quelle. Chaque bloc JSON-LD modifié est relu avec json.loads.
"""
import html, json, pathlib, re, sys

def attr(s):  # échappe pour un attribut entre guillemets doubles, apostrophes laissées telles quelles
    return html.escape(s, quote=False).replace('"', "&quot;")

racine = pathlib.Path(sys.argv[1])
fiches = json.loads(pathlib.Path(sys.argv[2]).read_text())
FR = racine / "astro/src/fragments/journal"
URL = "https://filtre.cafe/illustrations/{slug}.jpg"

def figure(slug, alt):
    a = attr(alt)
    return (
        f'<figure class="illu-article max-w-3xl mx-auto px-5" data-illu>\n'
        f'  <div class="illu-article__cadre">\n'
        f'    <picture><source media="(max-width: 640px)" srcset="/illustrations/{slug}-m-720.webp 720w, /illustrations/{slug}-m-1200.webp 1200w" sizes="calc(100vw - 2.5rem)">'
        f'<img src="/illustrations/{slug}-1200.webp" srcset="/illustrations/{slug}-720.webp 720w, /illustrations/{slug}-1200.webp 1200w" '
        f'sizes="(max-width: 808px) calc(100vw - 2.5rem), 728px" width="1200" height="675" alt="{a}" fetchpriority="high" decoding="async"></picture>\n'
        f'    <video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-src="/illustrations/{slug}.mp4" data-src-m="/illustrations/{slug}-m.mp4"></video>\n'
        f'  </div>\n'
        f'</figure>\n'
    )

def tete(t, slug, alt):
    url = URL.format(slug=slug)
    n = 0
    for prop in ('property="og:image"', 'name="twitter:image"'):
        avant = f'<meta {prop} content="https://filtre.cafe/og-image.png">'
        if avant in t:
            t = t.replace(avant, f'<meta {prop} content="{url}">')
            n += 1
    if 'og:image:width' not in t:
        m = re.search(r'^([ \t]*)<meta property="og:image" content="[^"]*">\n', t, re.M)
        if m:
            ind = m.group(1)
            ajout = (f'{ind}<meta property="og:image:width" content="1200">\n{ind}<meta property="og:image:height" content="675">\n'
                     f'{ind}<meta property="og:image:alt" content="{attr(alt)}">\n')
            t = t[:m.end()] + ajout + t[m.end():]
    if 'max-image-preview' not in t:
        t = t.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="index, follow, max-image-preview:large">')

    def jsonld(m):
        bloc = m.group(2)
        if '"@type": "Article"' in bloc and not re.search(r'"@type": "Article",(?:(?!"@type").)*"image"', bloc, re.S):
            u = re.search(r'("@type": "Article",(?:(?!"@type").)*?\n([ \t]*)"url": "[^"]*",\n)', bloc, re.S)
            if u:
                ind = u.group(2)
                ajout = f'{ind}"image": {{ "@type": "ImageObject", "url": "{url}", "width": 1200, "height": 675 }},\n'
                bloc = bloc[:u.end()] + ajout + bloc[u.end():]
        r = re.search(r'("@type": "Recipe",(?:(?!"@type").)*?"image": \[)', bloc, re.S)
        if r and url not in bloc[r.end():r.end() + 200]:
            bloc = bloc[:r.end()] + f'"{url}", ' + bloc[r.end():]
        json.loads(bloc)
        return m.group(1) + bloc + m.group(3)

    t = re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', jsonld, t, flags=re.S)
    return t, n

faits = 0
for f in fiches:
    slug, alt = f["slug"], f["alt"]
    pc, pt = FR / f"{slug}.body.html", FR / f"{slug}.head.html"
    corps = pc.read_text()
    if 'data-illu' not in corps:
        if "</header>" in corps:
            i = corps.index("</header>") + len("</header>\n")
        else:  # quatre articles à l'ancien gabarit : en-tête en <div>, suivi de ce commentaire
            i = corps.index("<!-- ─── ARTICLE BODY ─── -->")
        corps = corps[:i] + figure(slug, alt) + corps[i:]
        pc.write_text(corps)
    t, n = tete(pt.read_text(), slug, alt)
    pt.write_text(t)
    faits += 1
    if n != 2:
        print("og:image non remplacé (déjà fait ou absent) :", slug, n)
print(faits, "articles traités")
