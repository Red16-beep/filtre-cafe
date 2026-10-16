"""Gabarits partagés de la version test v2 : en-tête, tiroir, onglets mobiles, pied de page."""

LOGO = '''<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".35"/><path d="M8 9h16l-5.4 9.2v4.6h-5.2v-4.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16" cy="26" r="1.6" fill="#b8401f"/></svg>'''

CHEVRON = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'

def mega(intro_titre, intro_txt, lien_intro, items, tous):
    lis = ''.join(f'<li><a href="{h}">{t}<small>{s}</small></a></li>' for h, t, s in items)
    return (f'<div class="v2-mega" role="region"><a class="v2-mega__intro" href="{lien_intro}" style="text-decoration:none">'
            f'<p>{intro_titre}</p><span>{intro_txt} <span class="v2-fleche">→</span></span></a>'
            f'<ul>{lis}<li><a class="v2-mega__tous" href="{tous[0]}">{tous[1]} <span class="v2-fleche">→</span></a></li></ul></div>')

MENUS = [
    ('Méthodes', mega('Choisir sa méthode', 'Filtre, espresso, immersion : laquelle pour vous ?', '/guides/methodes-extraction', [
        ('/journal/v60-guide-complet', 'V60', 'guide complet'),
        ('/journal/aeropress-guide-complet', 'AeroPress', 'guide complet'),
        ('/journal/french-press-guide', 'French press', 'piston'),
        ('/journal/moka-pot-guide-complet', 'Moka', 'italienne'),
        ('/journal/comment-faire-espresso-parfait', 'Espresso', 'recette et réglages'),
        ('/journal/cold-brew-maison', 'Cold brew', '12 à 16 h'),
    ], ('/guides/methodes-extraction', 'Toutes les méthodes'))),
    ('Matériel', mega('S’équiper sans se ruiner', 'L’ordre des achats compte plus que la marque.', '/guides/equipement-cafe-maison', [
        ('/journal/meilleur-moulin-cafe-electrique', 'Moulins électriques', 'guide'),
        ('/journal/top-moulins-manuels-cafe', 'Moulins manuels', 'Top 8'),
        ('/journal/top-balances-cafe', 'Balances', 'Top 8'),
        ('/journal/top-bouilloires-cafe-filtre', 'Bouilloires', 'Top 8'),
        ('/journal/meilleure-machine-espresso-manuelle-2026', 'Machines espresso', 'guide'),
        ('/journal/meilleure-machine-cafe-grain-automatique', 'Machines à grain', 'guide'),
    ], ('/materiel', 'Tout le matériel'))),
    ('Cafés du monde', mega('Le café, partout ailleurs', 'Origines, recettes et rituels, du Mexique à la Laponie.', '/cafes-du-monde', [
        ('/journal/cafe-ethiopien-yirgacheffe-sidama-guji', 'Éthiopie', 'origine'),
        ('/journal/cafe-colombie-specialite', 'Colombie', 'origine'),
        ('/journal/cafe-de-olla-mexique', 'Café de olla', 'recette'),
        ('/journal/bicerin-turin', 'Bicerin', 'recette'),
        ('/journal/qahwa-cafe-arabe-cardamome', 'Qahwa', 'recette'),
        ('/journal/cafe-au-japon', 'Japon', 'culture'),
    ], ('/cafes-du-monde', 'Tous les cafés du monde'))),
]

def header():
    items = ''
    for i, (nom, panneau) in enumerate(MENUS):
        items += (f'<div class="v2-nav__item"><button type="button" class="v2-nav__lien" aria-expanded="false" aria-haspopup="true">{nom} {CHEVRON}</button>{panneau}</div>')
    items += '<div class="v2-nav__item"><a class="v2-nav__lien" href="/journal/">Le journal</a></div>'
    items += '<div class="v2-nav__item"><a class="v2-nav__lien" href="/newsletter">La lettre</a></div>'
    return f'''<header class="v2-header">
  <div class="v2-header__in">
    <a class="v2-logo" href="/" aria-label="filtré., accueil">{LOGO}<span><span class="v2-logo__nom">filtré<b>.</b></span><span class="v2-logo__devise">Extraire · Comprendre · Goûter</span></span></a>
    <nav class="v2-nav" aria-label="Navigation principale">{items}</nav>
    <div class="v2-header__droite">
      <a class="v2-icone" href="/outils/calculateur-v60" aria-label="Calculateur V60" title="Calculateur V60"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h1M12 12h1M15.5 12h0M8.5 16h1M12 16h1M15.5 16h0"/></svg></a>
      <a class="v2-icone" href="/journal/" aria-label="Chercher dans le journal" title="Chercher dans le journal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg></a>
      <button class="v2-icone v2-burger" type="button" data-v2-tiroir aria-label="Ouvrir le menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
</header>'''

def tiroir():
    blocs = ''
    for nom, panneau in MENUS:
        import re
        liens = re.findall(r'<li><a(?: class="[^"]*")? href="([^"]+)">([^<]+)', panneau)
        blocs += f'<h3>{nom}</h3>' + ''.join(f'<a href="{h}">{t.strip()}</a>' for h, t in liens)
    return f'''<div class="v2-tiroir" id="v2-tiroir" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="v2-tiroir__fond" data-v2-fermer></div>
  <div class="v2-tiroir__panneau">
    <button class="v2-icone" type="button" data-v2-fermer aria-label="Fermer le menu" style="margin-left:auto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    {blocs}<h3>filtré.</h3><a href="/journal/">Le journal</a><a href="/newsletter">La lettre</a><a href="/a-propos">À propos</a><a href="/outils/calculateur-v60">Calculateur V60</a>
  </div>
</div>'''

def onglets():
    return '''<nav class="v2-onglets" aria-label="Raccourcis">
  <a href="/journal/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 14h8"/></svg>Journal</a>
  <a href="/guides/methodes-extraction"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 6h14l-5 8v4h-4v-4z"/></svg>Méthodes</a>
  <a href="/materiel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="13" r="6"/><path d="M12 4v3M9 4h6"/></svg>Matériel</a>
  <a href="/cafes-du-monde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/></svg>Monde</a>
  <button type="button" data-v2-tiroir><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/></svg>Menu</button>
</nav>'''

PINTEREST = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.43 7.63 11.17-.11-.95-.2-2.4.04-3.44l1.41-5.97s-.36-.72-.36-1.78c0-1.67.97-2.91 2.17-2.91 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-.99 4-.28 1.19.6 2.17 1.78 2.17 2.13 0 3.77-2.25 3.77-5.5 0-2.87-2.06-4.88-5.01-4.88-3.41 0-5.42 2.56-5.42 5.21 0 1.03.4 2.14.89 2.74a.36.36 0 0 1 .08.35l-.33 1.36c-.05.22-.17.27-.4.16-1.5-.7-2.44-2.89-2.44-4.65 0-3.79 2.75-7.26 7.93-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.61 7.46-6.23 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>'
RSS = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="19" r="2.4"/><path d="M3 10.6a.9.9 0 0 1 .9-.9A10.4 10.4 0 0 1 14.3 20a.9.9 0 0 1-.9.9h-1.3a.9.9 0 0 1-.9-.85A7.3 7.3 0 0 0 3.95 12.8a.9.9 0 0 1-.85-.9zM3 4.1a.9.9 0 0 1 .9-.9A16.9 16.9 0 0 1 20.8 20.1a.9.9 0 0 1-.9.9h-1.3a.9.9 0 0 1-.9-.88A13.8 13.8 0 0 0 3.88 6.3.9.9 0 0 1 3 5.4z"/></svg>'

def footer():
    return f'''<footer class="v2-footer">
  <div class="v2-footer__in">
    <div class="v2-footer__grille">
      <div class="v2-footer__marque">
        <a class="v2-logo" href="/">{LOGO}<span><span class="v2-logo__nom">filtré<b>.</b></span><span class="v2-logo__devise">Extraire · Comprendre · Goûter</span></span></a>
        <p>Le guide indépendant du café de spécialité, écrit par Reda dans sa cuisine du Nord : ce qui est testé est dit, ce qui ne l’est pas aussi.</p>
        <div class="v2-footer__reseaux"><a href="https://www.pinterest.com/filtrecafe/" rel="me noopener" target="_blank" aria-label="Pinterest">{PINTEREST}</a><a href="/rss.xml" aria-label="Flux RSS">{RSS}</a></div>
      </div>
      <div><h4>Explorer</h4><ul><li><a href="/journal/">Le journal</a></li><li><a href="/guides/">Tous les guides</a></li><li><a href="/guides/methodes-extraction">Les méthodes</a></li><li><a href="/cafes-du-monde">Cafés du monde</a></li><li><a href="/schemas">Le café en schémas</a></li><li><a href="/commencer-ici">Commencer ici</a></li></ul></div>
      <div><h4>Matériel</h4><ul><li><a href="/journal/meilleur-moulin-cafe-electrique">Moulins électriques</a></li><li><a href="/journal/meilleur-moulin-cafe-manuel">Moulins manuels</a></li><li><a href="/journal/meilleure-machine-espresso-manuelle-2026">Machines espresso</a></li><li><a href="/journal/meilleure-machine-cafe-grain-automatique">Machines à grain</a></li><li><a href="/journal/meilleure-balance-cafe">Balances</a></li><li><a href="/journal/meilleure-bouilloire-cafe-filtre">Bouilloires</a></li><li><a href="/journal/top-drippers-cafe-filtre">Drippers</a></li><li><a href="/materiel">Tout le matériel</a></li></ul></div>
      <div><h4>filtré.</h4><ul><li><a href="/newsletter">La lettre</a></li><li><a href="/a-propos">À propos</a></li><li><a href="/a-propos#transparence">Comment je me rémunère</a></li><li><a href="/journal/eau-cafe-filtre-tds-mineraux">Le test à l’aveugle</a></li><li><!--email_off--><a href="mailto:reda@filtre.cafe">reda@filtre.cafe</a><!--/email_off--></li></ul></div>
    </div>
    <div class="v2-footer__bas"><span>© 2026 filtré. · Guide indépendant du café de spécialité</span><nav aria-label="Informations légales"><a href="/mentions-legales">Mentions légales</a><a href="/politique-confidentialite">Confidentialité</a><a href="/a-propos#transparence">Liens affiliés signalés</a></nav></div>
  </div>
</footer>'''

HEAD_LIENS = '''<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap">
<link rel="stylesheet" href="/v2/v2.css">'''

CMP_PROD = '''<script>(function(){if(location.hostname.replace(/^www\\./,'')!=='filtre.cafe')return;var s=document.createElement('script');s.defer=true;s.src='https://equateur.org/assets/js/cmp.js';s.setAttribute('data-site','aff654dd0df3f7e406ecb0a7e78ced5a');document.head.appendChild(s);})();</script>'''
