#!/usr/bin/env python3
"""Construit la version test v2 (inspirée de croatie.org) : accueil, 404, hubs, habillage du site.
Usage : python3 tools/v2/build.py   (depuis la racine du dépôt)"""
import os, re, html, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import shell, scenes

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
J = os.path.join(R, 'astro/src/fragments/journal/')
G = os.path.join(R, 'astro/src/fragments/guides/')

def lire(p): return open(p, encoding='utf-8').read()
def ecrire(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w', encoding='utf-8').write(s); print('écrit', os.path.relpath(p, R))

def info(slug, d=J):
    h, b = lire(d + slug + '.head.html'), lire(d + slug + '.body.html')
    t = re.search(r'<title>(.*?)</title>', h, re.S).group(1)
    desc = re.search(r'<meta name="description" content="([^"]*)"', h)
    rt = re.search(r'(\d+)\s*min de lecture', b)
    return {'titre': html.unescape(re.sub(r'\s*\|\s*filtré\.?$', '', t)).strip(), 'desc': html.unescape(desc.group(1)) if desc else '', 'rt': rt.group(1) if rt else ''}

NB_ARTICLES = len([f for f in os.listdir(J) if f.endswith('.body.html') and 'cafe-specialite-france-2024' not in f]) + len([f for f in os.listdir(G) if f.endswith('.body.html')])
FL = '<span class="v2-fleche" aria-hidden="true">→</span>'

def page(titre, desc, canon, corps, head_extra='', robots='index, follow', scripts_extra='', og_titre=None, og_desc=None):
    og_titre = og_titre or titre; og_desc = og_desc or desc
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{titre}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="https://filtre.cafe{canon}">
<meta property="og:type" content="website"><meta property="og:url" content="https://filtre.cafe{canon}"><meta property="og:title" content="{og_titre}"><meta property="og:description" content="{html.escape(og_desc, quote=True)}"><meta property="og:image" content="https://filtre.cafe/og-image.png"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="filtré.">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{og_titre}"><meta name="twitter:description" content="{html.escape(og_desc, quote=True)}"><meta name="twitter:image" content="https://filtre.cafe/og-image.png">
<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="filtré." href="/rss.xml">
{head_extra}
{shell.HEAD_LIENS}
{shell.CMP_PROD}
<script>(function(){{if(location.hostname.replace(/^www\\./,'')!=='filtre.cafe')return;var c=document.currentScript,s=document.createElement('script');s.src='https://app.equateur.org/e.js';s.setAttribute('data-site','filtre.cafe');s.defer=true;c&&c.parentNode?c.parentNode.insertBefore(s,c):document.head.appendChild(s);}})();</script>
</head>
<body class="v2">
<a class="v2-lien" href="#contenu" style="position:absolute;left:-9999px">Aller au contenu</a>
{shell.header()}
{shell.tiroir()}
<main id="contenu">
{corps}
</main>
{shell.footer()}
{shell.onglets()}
<script defer src="/nl-subscribe.js"></script>
<script defer src="/v2/v2.js"></script>
<script defer src="/js/track.js"></script>
{scripts_extra}
</body>
</html>
'''

# ── Accueil ────────────────────────────────────────────────────────────────
def accueil():
    sc = ''
    for k, (titre, sous, f) in enumerate(scenes.HERO):
        sc += f'<div class="v2-scene{" actif" if k == 0 else ""}" data-titre="{titre}" data-sous="{html.escape(sous)}">{f()}</div>'
    hero = f'''<section class="v2-hero" aria-label="filtré., le guide">
  <div class="v2-hero__scenes">{sc}</div>
  <div class="v2-hero__in">
    <p class="v2-kicker v2-kicker--crema">Le guide indépendant du café de spécialité</p>
    <h1>Le café,<br><em>au gramme près</em>.</h1>
    <p class="v2-hero__chapeau">Pour bien commencer : un moulin à meules, une balance au dixième de gramme et une eau peu minéralisée. Ensuite, 15 g de café pour 250 g d’eau à 93 °C. Le reste se règle au goût.</p>
    <div class="v2-hero__actions"><a class="v2-btn" href="/commencer-ici">Commencer ici {FL}</a><a class="v2-lien" href="/guides/methodes-extraction">Les méthodes {FL}</a></div>
    <div class="v2-hero__bas">
      <div class="v2-chiffres">
        <div class="v2-chiffre"><strong>{NB_ARTICLES}</strong><span>guides, tests et recettes, datés et mis à jour</span></div>
        <div class="v2-chiffre"><strong>6</strong><span>eaux goûtées à l’aveugle</span></div>
        <a class="v2-protocole" href="/journal/eau-cafe-filtre-tds-mineraux#test">
          <svg class="v2-protocole__anim" viewBox="0 0 48 56" aria-hidden="true">
            <ellipse class="onde o1" cx="24" cy="31" rx="7" ry="1.4"/><ellipse class="onde o2" cx="24" cy="31" rx="7" ry="1.4"/><ellipse class="onde o3" cx="24" cy="31" rx="7" ry="1.4"/>
            <path class="g g1" d="M24 2C26.5 6 28 8.5 28 10.5A4 4 0 0 1 20 10.5C20 8.5 21.5 6 24 2Z"/><path class="g g2" d="M24 2C26.5 6 28 8.5 28 10.5A4 4 0 0 1 20 10.5C20 8.5 21.5 6 24 2Z"/><path class="g g3" d="M24 2C26.5 6 28 8.5 28 10.5A4 4 0 0 1 20 10.5C20 8.5 21.5 6 24 2Z"/>
            <ellipse class="surface" cx="24" cy="31" rx="15" ry="2.2"/>
            <path class="trait" d="M9 31H39V35C39 44 33 50 24 50C15 50 9 44 9 35Z"/><path class="trait" d="M39 35C45 35 45 43 38.5 43.5"/><path class="trait" d="M5 53.5H43"/>
          </svg>
          <span><b>Mon protocole</b><small>ou comment goûter (vraiment) un café</small></span>
          <span class="v2-fleche" aria-hidden="true">→</span>
        </a>
      </div>
      <div class="v2-legende" aria-live="polite">
        <div class="v2-legende__nav"><button id="v2-legende-prec" type="button" aria-label="Scène précédente">‹</button><span id="v2-legende-num">01 / 05</span><button id="v2-legende-suiv" type="button" aria-label="Scène suivante">›</button></div>
        <b id="v2-legende-titre">{scenes.HERO[0][0]}</b><span id="v2-legende-sous">{scenes.HERO[0][1]}</span>
        <div class="v2-legende__barre"><i id="v2-legende-barre"></i></div>
      </div>
    </div>
  </div>
</section>'''

    incont = [
        ('v60-guide-complet', 'v60', 'Méthode', 'V60', 'La recette qui va avec'),
        ('eau-cafe-filtre-tds-mineraux', 'eau', 'Test à l’aveugle', 'L’eau', 'Six eaux, un café, à l’aveugle'),
        ('meilleur-moulin-cafe-electrique', 'moulin', 'Matériel', 'Le moulin', 'Ce qui compte vraiment'),
        ('ratio-cafe-eau-extraction', 'ratio', 'Repères', 'Le ratio', '1:16 en filtre, 1:2 en espresso'),
        ('espresso-trop-rapide-trop-lent-diagnostic', 'espresso', 'Diagnostic', 'L’espresso', 'Lire le shot, puis corriger'),
        ('temperature-eau-cafe-filtre', 'temperature', 'Repères', 'La température', 'Pourquoi pas 96 °C'),
        ('mousser-lait-vapeur-temperature', 'lait', 'Technique', 'Le lait', 'Étirer, tourbillonner, couper'),
        ('methode-4-6-kasuya', 'quatre-six', 'Recette', 'La 4:6', '20 g, 300 g, cinq versements'),
        ('meilleur-cafe-en-grain-2025', 'grain', 'Choisir', 'Le grain', 'La date avant l’origine'),
    ]
    cartes = ''
    for k, (slug, ico, kick, titre, sous) in enumerate(incont):
        i = info(slug)
        cartes += (f'<a class="v2-carte" href="/journal/{slug}" style="--fond:{scenes.CARTES_FOND[ico]}" aria-label="{html.escape(i["titre"])}">'
                   f'<span class="v2-carte__num" aria-hidden="true">{k+1:02d}</span><span class="v2-carte__illu">{scenes.ICONES[ico]}</span>'
                   f'<span class="v2-kicker">{kick}</span><h3>{titre}</h3><p>{sous}</p><span class="v2-carte__pied">{i["rt"]} min de lecture {FL}</span></a>')
    cartes += (f'<a class="v2-carte v2-carte--fin" href="/journal/"><span class="v2-kicker">Et tout le journal</span><div><h3>{NB_ARTICLES} articles, des méthodes aux cafés du monde</h3><p>Tous datés, avec ce qui est testé et ce qui ne l’est pas.</p></div><span class="v2-carte__pied">Voir le journal {FL}</span></a>')
    incontournables = f'''<section class="v2-section" aria-labelledby="t-incont">
  <div class="v2-wrap">
    <div class="v2-tete"><div><p class="v2-kicker">Les incontournables</p><h2 class="v2-h2" id="t-incont">9 guides à lire<br>au moins une fois</h2></div>
    <p class="v2-chapeau">De l’eau à la mouture : chacun a son guide complet, avec les chiffres vérifiés et mon avis quand j’ai testé.</p></div>
    <div data-v2-rail><div class="v2-rail">{cartes}</div>
    <div class="v2-rail__controles"><div class="v2-rail__progres"><i></i></div><button class="v2-rond" type="button" data-v2-prec aria-label="Précédent"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 3L5 8l5 5"/></svg></button><button class="v2-rond" type="button" data-v2-suiv aria-label="Suivant"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3l5 5-5 5"/></svg></button></div></div>
  </div>
</section>'''

    envies_l = [
        ('filtre', 'Méthodes douces', 'Le filtre', 'V60, Chemex, Kalita : la tasse claire et parfumée.', '/guides/methodes-extraction'),
        ('espresso', 'Espresso', 'L’espresso maison', 'Recette, réglage de la mouture et diagnostic.', '/journal/comment-faire-espresso-parfait'),
        ('monde', 'Voyager', 'Cafés du monde', 'Café de olla, qahwa, bicerin, kaffeost.', '/cafes-du-monde'),
        ('glace', 'L’été', 'Le café glacé', 'Flash brew, cold brew : la vraie différence.', '/journal/cafe-glace-maison'),
        ('materiel', 'S’équiper', 'Le bon matériel', 'Ce que j’utilise, et l’ordre des achats.', '/materiel'),
    ]
    envies = ''.join(f'<a class="v2-envie" href="{h}"><span class="v2-envie__icone">{scenes.ENVIES_ICONES[i]}</span><span class="v2-kicker">{k}</span><h3>{t}</h3><p>{d}</p><span class="v2-carte__pied">Découvrir {FL}</span></a>' for i, k, t, d, h in envies_l)
    section_envies = f'''<section class="v2-section" style="padding-top:0" aria-labelledby="t-envies">
  <div class="v2-wrap"><div class="v2-tete"><div><p class="v2-kicker">Vos envies</p><h2 class="v2-h2" id="t-envies">Quel café<br>vous fait envie ?</h2></div></div>
  <div class="v2-envies">{envies}</div>
  <p style="margin-top:22px"><a class="v2-lien" href="/recettes">Toutes les recettes, au lait, glacées, sans caféine {FL}</a></p></div>
</section>'''

    reglages_l = [
        ('Méthode douce', 'V60', [('Ratio', '1:16'), ('Temps', '2:30 à 3:30'), ('Mouture', 'médium-fine')], 'les cafés fruités, les matins sans presse', '/journal/v60-guide-complet', 'Le guide V60'),
        ('Pression', 'Espresso', [('Ratio', '1:2'), ('Temps', '25 à 30 s'), ('Mouture', 'fine')], 'les boissons au lait, le café serré', '/journal/comment-faire-espresso-parfait', 'Le guide espresso'),
        ('Immersion', 'Piston', [('Ratio', '1:15 à 1:16'), ('Temps', '4 min'), ('Mouture', 'grossière')], 'commencer sans matériel compliqué', '/journal/french-press-guide', 'Le guide French press'),
        ('À froid', 'Cold brew', [('Ratio', '1:10'), ('Temps', '12 à 16 h'), ('Mouture', 'très grossière')], 'l’été, les cafés chocolatés', '/journal/cold-brew-maison', 'Le guide cold brew'),
    ]
    reg = ''
    for kick, titre, stats, ideal, lien, lien_t in reglages_l:
        dl = ''.join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a, b in stats)
        reg += f'<article class="v2-reglage"><div><p class="v2-kicker">{kick}</p><h3>{titre}</h3></div><dl>{dl}</dl><p class="v2-reglage__ideal"><b>Idéal pour</b>{ideal}</p><a href="{lien}">{lien_t} {FL}</a></article>'
    section_reglage = f'''<section class="v2-section" style="background:var(--creme-fonce)" aria-labelledby="t-reglage">
  <div class="v2-wrap v2-reglages">
    <div><p class="v2-kicker">Le bon réglage</p><h2 class="v2-h2" id="t-reglage">Quelle méthode,<br>pour quel café ?</h2>
      <p class="v2-chapeau" style="margin-top:20px">Le compromis le plus simple pour débuter : un V60 ou un piston, un café torréfié depuis une à deux semaines, et une balance. L’espresso demande plus de réglages, et un bon moulin d’abord.</p>
      <p style="margin-top:24px"><a class="v2-lien" href="/journal/ratio-cafe-eau-extraction">Tous les ratios, méthode par méthode {FL}</a></p></div>
    <div class="v2-reglages__cartes">{reg}</div>
  </div>
</section>
<section class="v2-section v2-dark v2-bandeau" aria-label="Trois règles">
  <div class="v2-wrap v2-bandeau__grille">
    <div><p class="v2-kicker">Trois règles</p><p class="v2-triptyque" style="margin-top:18px"><span>Moudre juste avant.</span><span>Peser au gramme.</span><span>Goûter avant de corriger.</span></p>
    <p class="v2-chapeau" style="margin-top:24px">Un café acide est souvent trop court, un café amer souvent trop long. Le schéma montre pourquoi.</p></div>
    <div data-schema="extraction"></div>
  </div>
</section>'''

    itin_l = ['comment-faire-un-bon-cafe', 'debuter-cafe-filtre-guide', 'chemex-v60-aeropress', 'meilleure-cafetiere-filtre-2025', 'quel-cafe-pour-v60', 'naturel-lave-honey', 'meilleur-cafe-specialite-2025']
    itin = ''
    for k, slug in enumerate(itin_l):
        i = info(slug)
        itin += f'<li><a href="/journal/{slug}"><span class="n">{k+1:02d}</span><span><b>{html.escape(i["titre"])}</b><small>{i["rt"]} min de lecture</small></span><span class="v2-fleche" aria-hidden="true">→</span></a></li>'
    section_itin = f'''<section class="v2-section" aria-labelledby="t-itin">
  <div class="v2-wrap v2-itineraire">
    <div><p class="v2-kicker">Itinéraire</p><h2 class="v2-h2" id="t-itin">Du café de tous les jours<br>au café de spécialité</h2>
    <p class="v2-chapeau" style="margin-top:20px">Sept lectures, dans l’ordre : les bases, le choix d’une méthode, puis celui du café.</p>
    <p style="margin-top:24px"><a class="v2-lien" href="/guides/">Tous les guides {FL}</a></p></div>
    <ol class="v2-liste-num">{itin}</ol>
  </div>
</section>'''
    lis = ''.join(f'<li><a href="{l}" data-origine="{c}"><span class="n">{k+1:02d}</span><span><b>{n}</b><small>{s}</small></span><span class="v2-fleche" aria-hidden="true">→</span></a></li>' for k, (c, n, _a, _o, l, s, _p) in enumerate(scenes.ORIGINES))
    section_origines = f'''<section class="v2-section" aria-labelledby="t-origines">
  <div class="v2-wrap">
    <div class="v2-tete"><div><p class="v2-kicker">D’où vient votre café</p><h2 class="v2-h2" id="t-origines">Le café pousse<br>entre les tropiques</h2></div>
    <p class="v2-chapeau">De l’Éthiopie, berceau de l’arabica, aux hauts plateaux du Vietnam : huit origines, leurs régions et ce qu’elles donnent en tasse.</p></div>
    <div class="v2-origines"><div class="v2-carte-monde">{scenes.carte_monde()}</div>
    <div><ol class="v2-liste-num">{lis}</ol><p style="margin-top:24px"><a class="v2-lien" href="/cafes-du-monde">Toutes les origines et les recettes du monde {FL}</a></p></div></div>
  </div>
</section>'''

    prat_l = ['top-moulins-manuels-cafe', 'top-balances-cafe', 'top-bouilloires-cafe-filtre', 'top-drippers-cafe-filtre', 'top-machines-cafe-grain-entree-de-gamme', 'top-entretien-machine-cafe']
    prat = ''
    for s in prat_l:
        i = info(s)
        prat += f'<a class="v2-pratique" href="/journal/{s}"><span class="v2-kicker">Matériel</span><h3>{html.escape(i["titre"])}</h3><p>{html.escape(i["desc"])}</p><span class="v2-carte__pied">Découvrir {FL}</span></a>'
    section_prat = f'''<section class="v2-section" style="padding-top:0" aria-labelledby="t-prat">
  <div class="v2-wrap">
    <div class="v2-tete"><div><p class="v2-kicker">S’équiper</p><h2 class="v2-h2" id="t-prat">Bien s’équiper,<br>sans se ruiner</h2></div>
    <div><p class="v2-chapeau">Prix relevés et datés, ce que j’utilise moi-même, et la mention « d’après la fiche » quand je n’ai pas testé.</p><p style="margin-top:18px"><a class="v2-lien" href="/materiel">Tout le matériel {FL}</a></p></div></div>
    <div class="v2-pratiques">{prat}</div>
  </div>
</section>'''

    bref_l = [('Ratio filtre', '1:16', '15 g pour 240 g d’eau'), ('Eau', '93 °C', '30 à 40 s après ébullition'), ('Espresso', '1:2', '18 g pour 36 g, 25 à 30 s'),
              ('Repos', '7 à 14 j', 'après torréfaction, en filtre'), ('Minéraux', '75 à 250', 'mg/L de résidu sec (SCAA)'), ('Mouture', 'Juste avant', 'les arômes partent en minutes'), ('Balance', '0,1 g', 'avec minuteur, 40 à 60 €')]
    bref = ''.join(f'<div><dt>{a}</dt><dd>{b}<small>{c}</small></dd></div>' for a, b, c in bref_l)
    section_bref = f'<section class="v2-bref" aria-label="Le café en bref"><div class="v2-wrap v2-bref__in" style="margin:0 auto"><span class="v2-bref__titre">Le café en bref</span><dl style="display:contents">{bref}</dl></div><p class="v2-wrap v2-bref__lien"><a class="v2-lien" href="/journal/cafe-specialite-france-chiffres-2026">Le café de spécialité en France, en chiffres {FL}</a></p></section>'

    faq_l = [
        ('Quel matériel pour commencer le café de spécialité ?', 'Un moulin à meules d’abord, puis une balance au dixième de gramme avec minuteur, et une méthode simple comme le V60 ou le piston. Le moulin compte plus que la machine.', '/guides/equipement-cafe-maison', 'Le guide de l’équipement'),
        ('Quel ratio café/eau utiliser ?', 'En filtre, 1:16, soit 15 g de café pour 240 g d’eau. En espresso, 1:2 : 18 g de café pour 36 g en tasse. Ajustez ensuite au goût.', '/journal/ratio-cafe-eau-extraction', 'Les ratios par méthode'),
        ('Quelle eau pour faire son café ?', 'Une eau peu minéralisée. Dans mon test à l’aveugle de six eaux, la Mont Blanc et la Volvic sont arrivées en tête, l’eau du robinet très calcaire en dernier.', '/journal/eau-cafe-filtre-tds-mineraux', 'Le test des eaux'),
        ('Combien de temps attendre après la torréfaction ?', 'Pour le filtre, 7 à 14 jours de repos après la date de torréfaction. Pour l’espresso, 10 à 21 jours, davantage sur une torréfaction claire et dense.', '/journal/degazage-cafe', 'Le guide du dégazage'),
        ('Pourquoi mon café est-il amer ?', 'Souvent parce qu’il est trop extrait : mouture trop fine, contact trop long, ou eau trop chaude sur une torréfaction foncée. La torréfaction elle-même apporte aussi de l’amertume.', '/journal/pourquoi-cafe-amer', 'Café amer : causes et corrections'),
        ('Comment savoir ce qui est vraiment testé sur filtré. ?', 'Chaque page le dit : « testé », « utilisé au quotidien », ou « d’après la fiche » quand je n’ai pas eu l’objet en main. Les liens marchands sont affiliés et signalés.', '/a-propos#transparence', 'Comment je me rémunère'),
    ]
    faq_html = ''.join(f'<details><summary>{q}<span aria-hidden="true">+</span></summary><p>{a} <a href="{l}">{lt}</a>.</p></details>' for q, a, l, lt in faq_l)
    faq_ld = json.dumps({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': f'{a} {lt}.'}} for q, a, l, lt in faq_l]}, ensure_ascii=False)
    section_faq = f'''<section class="v2-section" aria-labelledby="t-faq">
  <div class="v2-wrap v2-faq">
    <div><p class="v2-kicker">Avant de commencer</p><h2 class="v2-h2" id="t-faq">Vos questions,<br>nos réponses</h2>
    <p class="v2-chapeau" style="margin-top:20px">Les questions qui reviennent le plus souvent. Pour aller plus loin : <a href="/commencer-ici" style="color:var(--cerise-texte)">commencer ici</a> et <a href="/schemas" style="color:var(--cerise-texte)">le café en schémas</a>.</p></div>
    <div>{faq_html}</div>
  </div>
</section>'''

    section_lettre = f'''<section class="v2-section v2-dark" id="newsletter" aria-labelledby="t-lettre">
  <div class="v2-wrap v2-lettre">
    <div><p class="v2-kicker">La lettre filtré.</p><h2 class="v2-h2" id="t-lettre">Du grain à la tasse,<br><em>sans bruit</em>.</h2>
    <p class="v2-chapeau" style="margin-top:18px">Les cafés que je goûte, les origines rares, les erreurs que je corrige. Gratuit, sans spam.</p></div>
    <div><form onsubmit="nlSubscribe(event)"><label for="v2-email" style="position:absolute;left:-9999px">Votre adresse e-mail</label><input id="v2-email" type="email" placeholder="votre@email.fr" required autocomplete="email"><button type="submit" class="v2-btn">S’inscrire {FL}</button></form>
    <p class="v2-lettre__note">Lire les <a href="/newsletter">lettres déjà parues</a>. Désinscription en un clic.</p></div>
  </div>
</section>'''

    corps = hero + incontournables + section_envies + section_reglage + section_itin + section_origines + section_prat + section_bref + section_faq + section_lettre
    ld = '''<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"filtré.","url":"https://filtre.cafe/","description":"Le guide indépendant du café de spécialité : méthodes, matériel testé, origines et recettes.","inLanguage":"fr-FR"}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"filtré.","url":"https://filtre.cafe/","sameAs":["https://www.pinterest.com/filtrecafe/"]}</script>
<script type="application/ld+json">''' + faq_ld + '</script>\n<meta name="p:domain_verify" content="4e7a1938b80241103ae563d2e22cdc4f"/>'
    # titre, description et Open Graph identiques à la version en ligne : la refonte ne touche pas au SEO
    ecrire(os.path.join(R, 'index.html'), page('Cafés de spécialité : sélection & guides | filtré.',
        "Guide indépendant du café de spécialité. Comparatifs matériel, guides d'extraction et sélection de cafés, V60, moulin, machine expresso.",
        '/', corps, head_extra=ld, scripts_extra='<script defer src="/js/exit-intent.js"></script>',
        og_titre='filtré. Le guide du café de spécialité', og_desc='Moulin, V60, machine espresso, eau, chaque variable compte. Le guide indépendant du café de spécialité.'))

# ── 404 ────────────────────────────────────────────────────────────────────
def page_404():
    sorties = [('Il existe toujours', 'Le diagnostic espresso', 'Trop rapide, trop lent : lire le shot, puis corriger.', '/journal/espresso-trop-rapide-trop-lent-diagnostic'),
               ('Rubrique', 'Les méthodes', 'Filtre, espresso, immersion, à froid.', '/guides/methodes-extraction'),
               ('Rubrique', 'Le matériel', 'Moulins, balances, bouilloires, machines.', '/materiel'),
               ('Rubrique', 'Cafés du monde', 'Origines et recettes, du Mexique à la Laponie.', '/cafes-du-monde')]
    cs = ''.join(f'<a class="v2-pratique v2-pratique--sombre" href="{h}"><span class="v2-kicker v2-kicker--crema">{k}</span><h3>{t}</h3><p>{d}</p><span class="v2-carte__pied">Découvrir {FL}</span></a>' for k, t, d, h in sorties)
    corps = f'''<section class="v2-err" aria-labelledby="t-404">
  <div class="v2-wrap v2-err__grille">
    <div class="v2-err__texte">
      <p class="v2-kicker v2-kicker--crema">Erreur 404 · page introuvable</p>
      <h1 id="t-404">Cette page n’existe pas.<br><em>Réglez le moulin.</em></h1>
      <p class="v2-err__chapeau">L’adresse est fausse, ou la page a déménagé. Tirez un espresso réussi, 36 g en tasse entre 25 et 30 secondes, et je vous sers une page qui existe.</p>
      <div class="v2-err__reglage">
        <div class="v2-err__etiquette"><label for="v2-mouture">Mouture</label><output id="v2-mouture-val" for="v2-mouture">20</output></div>
        <input type="range" id="v2-mouture" min="1" max="20" step="1" value="20" aria-describedby="v2-mouture-aide">
        <div class="v2-err__graduation" id="v2-mouture-aide"><span>1 · très fin</span><span>20 · très gros</span></div>
      </div>
      <div class="v2-err__actions"><button class="v2-btn" type="button" id="v2-tirer">Tirer le shot {FL}</button><a class="v2-lien" href="/">Ou rentrer à l’accueil {FL}</a></div>
      <div class="v2-err__fiche" id="v2-fiche" hidden>
        <p class="v2-err__fiche-titre">Fiche de dégustation</p>
        <dl><div><dt>Mouture</dt><dd id="v2-f-mouture"></dd></div><div><dt>Temps</dt><dd id="v2-f-temps"></dd></div><div><dt>En tasse</dt><dd id="v2-f-poids"></dd></div></dl>
        <p class="v2-err__verdict" id="v2-verdict" aria-live="polite"></p>
        <span class="v2-err__tampon" id="v2-tampon"></span>
      </div>
      <p class="v2-err__repere">Repère du site : 18 g de café moulu, 36 g en tasse, 25 à 30 secondes. Le détail est dans le <a href="/journal/espresso-trop-rapide-trop-lent-diagnostic">diagnostic espresso</a>.</p>
    </div>
    <div class="v2-err__machine">{scenes.machine_404()}</div>
  </div>
</section>
<section class="v2-section v2-dark" style="padding-top:24px" aria-labelledby="t-repartir">
  <div class="v2-wrap"><p class="v2-kicker v2-kicker--crema">Sans passer par la machine</p><h2 class="v2-h2" id="t-repartir" style="color:#f6efe6">Par où repartir ?</h2>
  <div class="v2-pratiques" style="margin-top:28px">{cs}</div></div>
</section>'''
    ecrire(os.path.join(R, '404.html'), page('Page introuvable · filtré.', 'Cette page n’existe pas. Réglez le moulin, tirez un espresso réussi, et on vous sert une page qui existe.', '/', corps, robots='noindex, follow'))

# ── Pages Astro : cafés du monde, schémas ──────────────────────────────────
def astro_page(nom, titre, desc, canon, corps, fil):
    """Même motif que materiel.astro : fragments head/body + enveloppe."""
    d = html.escape(desc, quote=True)
    ld = json.dumps({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'filtré.', 'item': 'https://filtre.cafe/'},
        {'@type': 'ListItem', 'position': 2, 'name': fil, 'item': 'https://filtre.cafe' + canon}]}, ensure_ascii=False)
    head = f'''<title>{titre}</title>
<meta name="description" content="{d}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://filtre.cafe{canon}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://filtre.cafe{canon}">
<meta property="og:title" content="{titre}">
<meta property="og:description" content="{d}">
<meta property="og:image" content="https://filtre.cafe/og-image.png">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="filtré.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://filtre.cafe/og-image.png">
<script type="application/ld+json">{ld}</script>
'''
    ecrire(os.path.join(R, 'astro/src/fragments', nom + '.head.html'), head)
    ecrire(os.path.join(R, 'astro/src/fragments', nom + '.body.html'), corps)
    ecrire(os.path.join(R, 'astro/src/pages', nom + '.astro'), f'''---
import Base from '../layouts/Base.astro';
import head from '../fragments/{nom}.head.html?raw';
import body from '../fragments/{nom}.body.html?raw';
---
<Base>
  <Fragment slot="head" set:html={{head}} />
  <Fragment set:html={{body}} />
</Base>
''')

def cafes_du_monde():
    recettes = ['cafe-de-olla-mexique', 'cafe-cubano-espumita', 'bicerin-turin', 'qahwa-cafe-arabe-cardamome', 'cafe-touba-senegal', 'kopi-tubruk-indonesie',
                'ipoh-white-coffee-malaisie', 'yuanyang-hong-kong', 'kaffeost-cafe-fromage-laponie', 'mazagran-cafe-glace-citron', 'cafe-aux-epices-fes', 'cafe-vietnamien-recette-ca-phe-sua-da', 'cafe-turc-recette-guide']
    cultures = ['cafe-au-japon', 'cafe-en-coree', 'cafe-en-thailande', 'cafe-au-vietnam']
    def cartes(lst, kick):
        out = ''
        for s in lst:
            if not os.path.exists(J + s + '.head.html'): continue
            i = info(s)
            out += f'<a class="v2-pratique" href="/journal/{s}"><span class="v2-kicker">{kick}</span><h3>{html.escape(i["titre"])}</h3><p>{html.escape(i["desc"])}</p><span class="v2-carte__pied">{i["rt"]} min de lecture {FL}</span></a>'
        return out
    lis = ''.join(f'<li><a href="{l}" data-origine="{c}"><span class="n">{k+1:02d}</span><span><b>{n}</b><small>{s}</small></span><span class="v2-fleche" aria-hidden="true">→</span></a></li>' for k, (c, n, _a, _o, l, s, _p) in enumerate(scenes.ORIGINES))
    corps = f'''<section class="v2-section v2-dark" style="padding-bottom:64px"><div class="v2-wrap">
  <nav aria-label="Fil d'Ariane" style="font-family:var(--sans);font-size:13px;color:rgba(244,236,227,.6);margin-bottom:28px"><a href="/">Accueil</a> › Cafés du monde</nav>
  <p class="v2-kicker v2-kicker--crema">Voyager</p><h1 class="v2-h2" style="font-size:var(--t-h1);color:#f6efe6">Les cafés du monde</h1>
  <p class="v2-chapeau" style="margin-top:18px">Huit origines et leurs régions, puis les façons de boire le café ailleurs : à la cannelle au Mexique, à la cardamome dans le Golfe, au fromage en Laponie.</p>
  <div class="v2-origines" style="margin-top:40px"><div class="v2-carte-monde" style="background:var(--espresso-2)">{scenes.carte_monde()}</div><div><ol class="v2-liste-num v2-liste-num--sombre">{lis}</ol></div></div>
</div></section>
<section class="v2-section"><div class="v2-wrap"><div class="v2-tete"><div><p class="v2-kicker">Recettes</p><h2 class="v2-h2">Le café, ailleurs</h2></div><p class="v2-chapeau">Chaque recette avec son histoire, ses proportions et le café qui va avec.</p></div>
<div class="v2-pratiques">{cartes(recettes, 'Recette du monde')}</div></div></section>
<section class="v2-section" style="padding-top:0"><div class="v2-wrap"><div class="v2-tete"><div><p class="v2-kicker">Cultures</p><h2 class="v2-h2">Le café, au quotidien</h2></div></div>
<div class="v2-pratiques">{cartes(cultures, 'Culture café')}</div></div></section>
<section class="v2-section" style="padding-top:0"><div class="v2-wrap"><div class="v2-tete"><div><p class="v2-kicker">Adresses</p><h2 class="v2-h2">Où le boire</h2></div></div>
<div class="v2-pratiques">{cartes(['meilleurs-cafes-paris', 'torrefacteurs-francais'], 'Adresses')}</div></div></section>'''
    astro_page('cafes-du-monde', 'Cafés du monde : origines et recettes | filtré.', 'Huit origines du café et une douzaine de recettes du monde : café de olla, qahwa, bicerin, kaffeost, touba, kopi tubruk.', '/cafes-du-monde', corps, 'Cafés du monde')

def page_recettes():
    groupes = [
        ('Au lait', 'Avec un espresso', ['cappuccino-recette-maison-guide', 'flat-white-recette-guide', 'cafe-cortado-recette-guide', 'cafe-noisette-recette-guide', 'pumpkin-spice-latte-recette-guide', 'mousser-lait-vapeur-temperature']),
        ('Glacé', 'Pour l’été', ['cafe-glace-maison', 'cold-brew-maison', 'cold-brew-vs-cafe-glace-differences', 'mazagran-cafe-glace-citron', 'cafe-vietnamien-recette-ca-phe-sua-da']),
        ('Sans caféine, ou presque', 'Le soir', ['cafe-decafeine-specialite', 'champignon-lion-mane-cafe']),
        ('Sans machine', 'Avec ce qu’on a', ['espresso-maison-sans-machine']),
    ]
    sections = ''
    for titre_g, kick, slugs in groupes:
        cartes = ''
        for slug in slugs:
            if not os.path.exists(J + slug + '.head.html'): continue
            i = info(slug)
            cartes += f'<a class="v2-pratique" href="/journal/{slug}"><span class="v2-kicker">{kick}</span><h3>{html.escape(i["titre"])}</h3><p>{html.escape(i["desc"])}</p><span class="v2-carte__pied">{i["rt"]} min de lecture {FL}</span></a>'
        sections += f'<section class="v2-section" style="padding-top:0"><div class="v2-wrap"><div class="v2-tete"><div><h2 class="v2-h2">{titre_g}</h2></div></div><div class="v2-pratiques">{cartes}</div></div></section>'
    corps = f'''<section class="v2-page-tete"><div class="v2-wrap"><div><nav class="v2-page-tete__fil" aria-label="Fil d’Ariane"><a href="/">Accueil</a> › <span aria-current="page">Les recettes</span></nav>
  <p class="v2-kicker v2-kicker--crema">Recettes</p><h1>Les recettes</h1>
  <p class="v2-page-tete__chapeau">Les boissons au lait, le café glacé, les soirs sans caféine. Chaque recette avec ses grammes, sa température et ce qui la rate.</p></div>
  <div class="v2-page-tete__illu" aria-hidden="true">{scenes.ICONES['lait']}</div></div></section>
<div style="height:56px"></div>
{sections}
<section class="v2-section" style="padding-top:0"><div class="v2-wrap"><p class="v2-chapeau">Les recettes d’ailleurs, du café de olla au kaffeost, sont sur la page <a class="v2-lien" href="/cafes-du-monde">Cafés du monde {FL}</a></p></div></section>'''
    astro_page('recettes', 'Recettes de café : au lait, glacé, sans caféine | filtré.', 'Cappuccino, flat white, cortado, noisette, café glacé, cold brew, décaféiné : les recettes de filtré., avec les grammes et les températures.', '/recettes', corps, 'Les recettes')

def page_schemas():
    corps = '''<section class="v2-section v2-dark" style="padding-bottom:56px"><div class="v2-wrap">
  <nav aria-label="Fil d'Ariane" style="font-family:var(--sans);font-size:13px;color:rgba(244,236,227,.6);margin-bottom:28px"><a href="/">Accueil</a> › Le café en schémas</nav>
  <p class="v2-kicker v2-kicker--crema">Comprendre</p><h1 class="v2-h2" style="font-size:var(--t-h1);color:#f6efe6">Le café en schémas</h1>
  <p class="v2-chapeau" style="margin-top:18px">Six schémas animés pour voir ce que les guides expliquent : l’extraction, la recette V60, la mouture, l’eau, le dégazage et l’espresso. Tous les chiffres viennent des pages du site.</p>
</div></section>
<section class="v2-section" style="padding-top:40px"><div class="v2-wrap" style="max-width:980px">
  <div data-schema="extraction"></div><div data-schema="v60"></div><div data-schema="mouture"></div>
  <div data-schema="eau"></div><div data-schema="degazage"></div><div data-schema="espresso"></div>
</div></section>'''
    astro_page('schemas', 'Le café en schémas animés | filtré.', 'Extraction, recette V60, mouture, eau, dégazage, espresso : six schémas animés pour comprendre le café de spécialité.', '/schemas', corps, 'Le café en schémas')

# ── Habillage : Base.astro et pages racine ────────────────────────────────
BASE = '98c34d9'  # commit de main d'où part la refonte (Equateur à jour) : on habille toujours les fichiers d'origine

def original(rel):
    import subprocess
    return subprocess.run(['git', 'show', f'{BASE}:{rel}'], cwd=R, capture_output=True, text=True, check=True).stdout

def _table_couleurs():
    js = lire(os.path.join(R, 'astro/src/lib/v2.js'))
    hexa = dict(re.findall(r"'(#[0-9a-f]{6})': '(#[0-9a-f]{6})'", js))
    rgba = dict(re.findall(r"'(\d+,\d+,\d+)': '(\d+,\d+,\d+)'", js))
    return hexa, rgba

def v2ise(s):
    """Même conversion que astro/src/lib/v2.js (table lue dans ce fichier), pour les pages hors Astro."""
    hexa, rgba = _table_couleurs()
    s = re.sub(r'#[0-9a-fA-F]{6}\b', lambda m: hexa.get(m.group(0).lower(), m.group(0)), s)
    def _rgba(m):
        k = ','.join(m.group(i) for i in (1, 2, 3))
        return f'rgba({rgba[k]},' if k in rgba else m.group(0)
    s = re.sub(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,', _rgba, s)
    s = re.sub(r"""(['"])Instrument Serif\1""", "'Newsreader'", s)
    return re.sub(r"""(['"])Inter\1""", "'Instrument Sans'", s)

def base_astro():
    p = os.path.join(R, 'astro/src/layouts/Base.astro'); s = original('astro/src/layouts/Base.astro')
    s = s.replace('\n---\n<!DOCTYPE html>', "\nimport { v2ise } from '../lib/v2.js';\nconst tete = v2ise(await Astro.slots.render('head'));\nconst corps = v2ise(await Astro.slots.render('default'));\nconst style = Astro.slots.has('style') ? v2ise(await Astro.slots.render('style')) : '';\n---\n<!DOCTYPE html>", 1)
    s = s.replace('<slot name="head" />', '<Fragment set:html={tete} />', 1)
    s = s.replace('<slot name="style" />', '<Fragment set:html={style} />\n' + shell.HEAD_LIENS, 1)
    s = s.replace('<script is:inline defer src="https://equateur.org/assets/js/cmp.js" data-site="aff654dd0df3f7e406ecb0a7e78ced5a"></script>',
                  shell.CMP_PROD.replace('<script>', '<script is:inline>'), 1)
    s = re.sub(r'<link rel="preload" href="/fonts/(?!v2/)[^"]+" as="font"[^>]*>\n', '', s)  # anciennes polices : plus utilisées
    s = s.replace('<link rel="stylesheet" href="/fonts/fonts.css">\n', '')
    s = s.replace('<body class="antialiased">', '<body class="antialiased v2">')
    s = re.sub(r'<nav class="glass-nav.*?</nav>\n', lambda m: shell.header() + '\n' + shell.tiroir() + '\n', s, count=1, flags=re.S)
    s = s.replace('\n<slot />\n', '\n<Fragment set:html={corps} />\n', 1)
    s = re.sub(r'<footer class="border-t.*?</footer>\n', lambda m: shell.footer() + '\n' + shell.onglets() + '\n', s, count=1, flags=re.S)
    s = s.replace('<script is:inline defer src="/js/track.js"></script>', '<script is:inline defer src="/v2/v2.js"></script>\n<script is:inline defer src="/js/track.js"></script>')
    s = s.replace('<script is:inline src="/nl-subscribe.js"></script>', '<script is:inline defer src="/nl-subscribe.js"></script>')
    assert 'tracker.js' not in s and s.count('app.equateur.org/e.js') == 1, 'Base.astro : chargeur Equateur'
    for attendu in ('v2-header', 'v2-footer', '/v2/v2.js', 'set:html={corps}', 'set:html={style}', 'set:html={tete}', 'v2ise(', 'cmp.js'):
        assert attendu in s, f'Base.astro : {attendu} manquant'
    ecrire(p, s)

TETES = {  # page : (fil d'Ariane, icône du bandeau)
    'journal/index.html': ('Le journal', 'grain'), 'guides/index.html': ('Les guides', 'v60'),
    'a-propos.html': ('À propos', 'moulin'), 'commencer-ici.html': ('Commencer ici', 'quatre-six'),
    'mentions-legales.html': ('Mentions légales', None), 'politique-confidentialite.html': ('Confidentialité', None),
    'newsletter.html': ('La lettre', None),
}

def tete_v2(s, f):
    """Transforme l'en-tête d'une page hub en bandeau sombre v2 (fil d'Ariane, surtitre, titre, chapeau, icône)."""
    if f not in TETES: return s
    fil, ico = TETES[f]
    ariane = f'<nav class="v2-page-tete__fil" aria-label="Fil d’Ariane"><a href="/">Accueil</a> › <span aria-current="page">{fil}</span></nav>'
    illu = f'<div class="v2-page-tete__illu" aria-hidden="true">{scenes.ICONES[ico]}</div>' if ico else ''
    def habiller(bloc):
        bloc = re.sub(r'<p class="text-\[10px\][^"]*text-amber-[0-9]+[^"]*">', '<p class="v2-kicker v2-kicker--crema">', bloc, count=1)
        bloc = re.sub(r'<h1 class="[^"]*"', '<h1', bloc, count=1)
        bloc = re.sub(r'(</h1>\s*)<p class="[^"]*"', r'\1<p class="v2-page-tete__chapeau"', bloc, count=1)
        return bloc
    # A : journal, guides, à propos (+ filet de séparation)
    m = re.search(r'<section class="max-w-6xl mx-auto px-6 md:px-10 lg:px-12 pt-20 pb-16 md:pt-28 md:pb-20">(.*?)</section>\s*(<div class="max-w-6xl mx-auto px-6 md:px-10 lg:px-12">\s*<div class="h-px bg-stone-200"></div>\s*</div>)?', s, re.S)
    # B : commencer ici
    if not m: m = re.search(r'<section class="max-w-5xl mx-auto px-5 pt-16 pb-10">(.*?)</section>()', s, re.S)
    if m:
        return s[:m.start()] + f'<section class="v2-page-tete"><div class="v2-wrap"><div>{ariane}{habiller(m.group(1))}</div>{illu}</div></section>' + s[m.end():]
    # C : mentions, confidentialité
    m = re.search(r'<main class="pt-32 pb-24 px-6 max-w-2xl mx-auto">\s*<h1 class="[^"]*">(.*?)</h1>\s*<p class="[^"]*">(.*?)</p>', s, re.S)
    if m:
        return (s[:m.start()] + f'<section class="v2-page-tete"><div class="v2-wrap"><div>{ariane}<p class="v2-kicker v2-kicker--crema">Informations</p>'
                f'<h1>{m.group(1)}</h1><p class="v2-page-tete__chapeau">{m.group(2)}</p></div></div></section>'
                '<main class="v2-page-texte pb-24 px-6 max-w-2xl mx-auto">' + s[m.end():])
    # D : la lettre (bandeau déjà sombre) : on ajoute le fil d'Ariane
    m = re.search(r'(<section class="bg-stone-900 text-stone-50">\s*<div class="[^"]*">\s*<div class="reveal max-w-2xl">)', s)
    if m:
        return s[:m.end()] + ariane + s[m.end():]
    return s

RACINE_PAGES = ['journal/index.html', 'guides/index.html', 'a-propos.html', 'newsletter.html', 'commencer-ici.html',
                'mentions-legales.html', 'politique-confidentialite.html'] + [f'newsletter/{k:02d}.html' for k in range(1, 11)]

def pages_racine():
    for f in RACINE_PAGES:
        p = os.path.join(R, f); s = v2ise(original(f))
        s = re.sub(r'<script defer src="https://equateur\.org/assets/js/cmp\.js"[^>]*></script>', '', s)
        s = re.sub(r'\s*<script>\s*tailwind\.config\s*=.*?</script>', '', s, flags=re.S)  # reste du CDN Tailwind : erreur en console
        s = re.sub(r'\s*<link rel="preload" href="/fonts/(?!v2/)[^"]+" as="font"[^>]*>', '', s)
        s = re.sub(r'\s*<link rel="stylesheet" href="/fonts/fonts\.css">', '', s)
        s = s.replace('</head>', shell.HEAD_LIENS + '\n' + shell.CMP_PROD + '\n</head>', 1)
        s = re.sub(r'<body class="([^"]*)">', lambda m: f'<body class="{m.group(1)} v2">', s, count=1)
        if re.search(r'<header class="glass-nav', s):
            s = re.sub(r'<header class="glass-nav.*?</header>', lambda m: shell.header() + '\n' + shell.tiroir(), s, count=1, flags=re.S)
        elif re.search(r'<nav class="glass-nav', s):
            s = re.sub(r'<nav class="glass-nav.*?</nav>', lambda m: shell.header() + '\n' + shell.tiroir(), s, count=1, flags=re.S)
        else:
            s = re.sub(r'<nav class="fixed top-0.*?</nav>', lambda m: shell.header() + '\n' + shell.tiroir(), s, count=1, flags=re.S)
        s = re.sub(r'<footer.*?</footer>', lambda m: shell.footer() + '\n' + shell.onglets(), s, count=1, flags=re.S)
        s = tete_v2(s, f)
        s = s.replace('</body>', '<script defer src="/v2/v2.js"></script>\n</body>', 1)
        assert 'v2-header' in s and 'v2-footer' in s, f'{f} : habillage incomplet'
        ecrire(p, s)

MINIFIER = '''# v2 : copies minifiées dans public/ (les sources lisibles restent dans v2/)
ESB=astro/node_modules/.bin/esbuild
if [ -x "$ESB" ]; then
  "$ESB" v2/v2.css --minify --outfile="$PUB/v2/v2.css" --log-level=error
  "$ESB" v2/v2.js --minify --outfile="$PUB/v2/v2.js" --log-level=error
fi
'''

def sync_public():
    p = os.path.join(R, 'astro/sync-public.sh'); s = lire(p)
    if ' v2 ' not in s and ' v2;' not in s:
        s = s.replace('js images.filtre fonts pins', 'js images.filtre fonts pins v2')
    if 'esbuild' not in s:
        s = s.replace('echo "public/ synced."', MINIFIER + 'echo "public/ synced."')
    ecrire(p, s)

if __name__ == '__main__':
    accueil(); page_404(); cafes_du_monde(); page_schemas(); page_recettes(); base_astro(); pages_racine(); sync_public()
