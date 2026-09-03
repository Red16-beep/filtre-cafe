#!/usr/bin/env python3
"""Met a jour les <lastmod> de sitemap.xml depuis les sources du site.

Le sitemap reste tenu a la main pour tout ce qui releve du jugement : les
sections thematiques, la <priority> article par article, la <changefreq>. Seules
les dates sont derivees, parce que ce sont elles qui derivent : rien ne les
regenerait, et Google se cale dessus pour programmer ses passages. Une page
modifiee dont le lastmod reste vieux ne sera pas recrawlee, quoi qu'on demande
dans la Search Console.

La date retenue est la plus recente entre la dateModified declaree dans le
JSON-LD de la page et le lastmod deja present. Jamais en arriere : une
cinquantaine de pages portent deja un lastmod plus recent que leur schema,
herite de passes techniques reelles, reculer effacerait l'information.

La date du dernier commit ne sert PAS de source, et c'est deliberé. L'essayer
avancait 99 lastmod sur 102 : l'historique est fait de passes sur tout le site
(243 fragments pour la migration Astro, 155 pour le retrait des tirets
cadratins, 63 pour un titre interdit, 28 pour une mention Amazon). Annoncer
quatre-vingt-dix-neuf pages modifiees le meme jour, c'est apprendre a Google a
ignorer nos dates, ce qui coute plus cher qu'une date en retard. Git sert donc
a autre chose ici : reperer les pages dont les fichiers ont bouge dans un commit
cible, sans que la dateModified suive. Ce sont des oublis, ils se corrigent dans
la page, pas dans le sitemap.

  python3 tools/sitemap.py            # met a jour le fichier
  python3 tools/sitemap.py --check    # ne touche rien, sort 1 si perime
  python3 tools/sitemap.py --oublis   # les dateModified jamais mises a jour
  python3 tools/sitemap.py --oublis --corriger   # et les ecrit dans les pages
"""
import argparse, datetime, glob, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITEMAP = os.path.join(ROOT, "sitemap.xml")
SITE = "https://filtre.cafe"

# Pages racine qui gardent leur propre chrome : sync-public.sh les recopie
# telles quelles, elles n'ont ni fragment ni page .astro.
STATIQUES = {
    "/": "index.html",
    "/journal/": "journal/index.html",
    "/guides/": "guides/index.html",
    "/a-propos": "a-propos.html",
    "/commencer-ici": "commencer-ici.html",
    "/newsletter": "newsletter.html",
    "/mentions-legales": "mentions-legales.html",
    "/politique-confidentialite": "politique-confidentialite.html",
}
# 404 et og-image sont servis mais n'ont rien a faire dans un sitemap.
HORS_SITEMAP = {"404.html", "og-image.html"}

URL_RE = re.compile(r"<url>.*?</url>", re.S)
LOC_RE = re.compile(r"<loc>([^<]+)</loc>")
LASTMOD_RE = re.compile(r"<lastmod>([^<]+)</lastmod>")
DATE_RE = re.compile(r'"dateModified"\s*:\s*"([^"]+)"')
PUB_RE = re.compile(r'"datePublished"\s*:\s*"([^"]+)"')
NOINDEX_RE = re.compile(r'<meta\s+name="robots"[^>]*content="[^"]*noindex', re.I)

DEFAUTS = {"newsletter": ("monthly", "0.5")}
DEFAUT = ("monthly", "0.8")


# Au-dela de ce nombre de fichiers, un commit est une passe sur le site et non
# la modification d'une page : migration, ponctuation, mention legale ajoutee
# partout. Ces commits ne comptent pas comme une edition de contenu.
SEUIL_PASSE = 8


# Un commit peut toucher le corps d'une page sans rien changer pour qui la lit :
# lien affilie repare, image recompressee, schema corrige. Ces editions-la ne
# justifient pas d'annoncer une mise a jour.
NON_EDITORIAL = re.compile(
    r"posttap|liens? affili|liens? de recherche amazon|optimise les images|"
    r"donnees structurees|données structurées|meta description|conformite amazon|"
    r"conformité amazon|tiret cadratin|migrate |astro", re.I)


def commits_par_page():
    """Derniere edition de chaque corps de page, editoriale d'un cote et
    technique de l'autre.

    Un `git log` par page couterait cent appels ; l'historique complet en un
    seul suffit. Sur un clone superficiel (CI en fetch-depth 1) le resultat est
    partiel, ce qui ne prete pas a consequence : ces dates ne servent qu'au
    rapport --oublis, jamais au sitemap lui-meme.

    Seul le .body.html compte : une correction de meta description ou de JSON-LD
    ne touche que le .head.html et ne change rien a ce qu'on lit.
    """
    r = subprocess.run(["git", "-C", ROOT, "log", "--format=%cs|%s", "--name-only", "--no-renames"],
                       capture_output=True, text=True)
    commits, entete, lot = [], None, []
    for ligne in r.stdout.splitlines():
        ligne = ligne.strip()
        if re.match(r"\d{4}-\d{2}-\d{2}\|", ligne):
            if entete:
                commits.append((*entete, lot))
            entete, lot = ligne.split("|", 1), []
        elif ligne and entete:
            lot.append(ligne)
    if entete:
        commits.append((*entete, lot))

    CORPS = re.compile(r"astro/src/fragments/(.+)\.body\.html")
    edito, technique = {}, {}
    for jour, sujet, fichiers in commits:     # le log descend du plus recent
        if len(fichiers) > SEUIL_PASSE:
            continue
        ou = technique if NON_EDITORIAL.search(sujet) else edito
        for f in fichiers:
            m = CORPS.fullmatch(f)
            if m:
                ou.setdefault(m.group(1), (jour, sujet))
    return edito, technique


def sources(chemin_url):
    """Les fichiers dont depend une URL, sans les wrappers .astro : ils sont
    regeneres par gen.py, leur date de commit ne dit rien du contenu."""
    if chemin_url in STATIQUES:
        return [STATIQUES[chemin_url]]
    m = re.fullmatch(r"/newsletter/(\d+)", chemin_url)
    if m:
        return [f"newsletter/{m.group(1)}.html"]
    base = os.path.join("astro", "src", "fragments", chemin_url.strip("/"))
    trouves = [f"{base}.{p}.html" for p in ("head", "body", "style")]
    return [f for f in trouves if os.path.exists(os.path.join(ROOT, f))]


def lu(chemin):
    p = os.path.join(ROOT, chemin)
    return open(p, encoding="utf-8").read() if os.path.exists(p) else ""


def date_declaree(fichiers):
    """La dateModified du JSON-LD, a defaut la datePublished."""
    for f in fichiers:
        doc = lu(f)
        m = DATE_RE.search(doc) or PUB_RE.search(doc)
        if m:
            return m.group(1)[:10]
    return ""


def redirigees():
    """Les URL sources d'un 301 : elles ne doivent pas entrer au sitemap."""
    out = set()
    for ligne in lu("_redirects").splitlines():
        parts = ligne.split()
        if len(parts) >= 2 and parts[0].startswith("/"):
            out.add(parts[0])
    return out


def inventaire():
    """Toute page indexable du site, avec ses sources. Les noindex sortent."""
    pages = {}
    for chemin, fichier in STATIQUES.items():
        if fichier not in HORS_SITEMAP:
            pages[chemin] = [fichier]
    for f in sorted(glob.glob(os.path.join(ROOT, "newsletter", "[0-9][0-9].html"))):
        pages["/newsletter/" + os.path.basename(f)[:-len(".html")]] = \
            ["newsletter/" + os.path.basename(f)]
    for p in sorted(glob.glob(os.path.join(ROOT, "astro", "src", "fragments", "**", "*.head.html"),
                              recursive=True)):
        rel = os.path.relpath(p, os.path.join(ROOT, "astro", "src", "fragments"))
        chemin = "/" + rel[:-len(".head.html")]
        if chemin.endswith("/index"):
            chemin = chemin[:-len("index")]
        pages[chemin] = sources(chemin)

    exclues = redirigees()
    return {c: f for c, f in pages.items()
            if c not in exclues and not NOINDEX_RE.search("".join(lu(x) for x in f))}


def main():
    ap = argparse.ArgumentParser(description="Met a jour les lastmod du sitemap.")
    ap.add_argument("--check", action="store_true",
                    help="ne rien ecrire, sortir 1 si le sitemap est perime")
    ap.add_argument("--oublis", action="store_true",
                    help="lister les pages editees sans que leur dateModified suive")
    ap.add_argument("--corriger", action="store_true",
                    help="avec --oublis : ecrit les dateModified manquantes dans les pages")
    args = ap.parse_args()

    sm = open(SITEMAP, encoding="utf-8").read()
    pages = inventaire()
    aujourdhui = datetime.date.today().isoformat()
    bouges, orphelines = [], []

    if args.oublis:
        edito, technique = commits_par_page()
        a_corriger, laissees = [], []
        for base, (jour, sujet) in sorted(edito.items()):
            tete = os.path.join("astro", "src", "fragments", base + ".head.html")
            declare = date_declaree([tete])
            if declare and jour > declare:
                a_corriger.append((tete, base, declare, jour, sujet))
        for base, (jour, sujet) in sorted(technique.items()):
            tete = os.path.join("astro", "src", "fragments", base + ".head.html")
            declare = date_declaree([tete])
            if declare and jour > declare and base not in {c[1] for c in a_corriger}:
                laissees.append((base, declare, jour, sujet))

        for _, base, d, e, s in sorted(a_corriger, key=lambda x: x[3], reverse=True):
            print(f"  {d} -> {e}  {base:52s} {s[:52]}")
        print(f"\n{len(a_corriger)} page(s) dont le contenu a change sans que la dateModified suive")
        for base, d, e, s in sorted(laissees, key=lambda x: x[2], reverse=True):
            print(f"  {d} inchangée  {base:52s} {s[:52]}")
        print(f"{len(laissees)} page(s) laissee(s) en l'etat : edition technique, pas editoriale")

        if args.corriger:
            ajoutees = 0
            for tete, base, declare, jour, _ in a_corriger:
                p = os.path.join(ROOT, tete)
                doc = open(p, encoding="utf-8").read()
                if DATE_RE.search(doc):
                    # on garde le format existant, horodatage compris
                    doc = re.sub(r'("dateModified"\s*:\s*")([^"]+)(")',
                                 lambda m: m.group(1) + jour + m.group(2)[10:] + m.group(3),
                                 doc, count=1)
                else:
                    # huit pages n'ont jamais declare que leur datePublished :
                    # sans dateModified, une mise a jour est invisible pour Google.
                    m = re.search(r'([ \t]*)"datePublished"\s*:\s*"([^"]+)",?\n', doc)
                    doc = (doc[:m.end()]
                           + f'{m.group(1)}"dateModified": "{jour}{m.group(2)[10:]}",\n'
                           + doc[m.end():])
                    ajoutees += 1
                open(p, "w", encoding="utf-8").write(doc)
            print(f"\n{len(a_corriger)} dateModified corrigee(s), dont {ajoutees} ajoutee(s) "
                  f"a un schema qui n'en avait pas — relancer "
                  f"`python3 tools/sitemap.py` pour repercuter au sitemap")
        return

    def maj(bloc):
        loc = LOC_RE.search(bloc)
        lm = LASTMOD_RE.search(bloc)
        if not loc or not lm:
            return bloc
        chemin = loc.group(1).replace(SITE, "") or "/"
        fichiers = sources(chemin)
        if not fichiers or not any(os.path.exists(os.path.join(ROOT, f)) for f in fichiers):
            orphelines.append(chemin)
            return bloc
        ancien = lm.group(1)[:10]
        # jamais en arriere, jamais dans le futur
        neuf = min(max(ancien, date_declaree(fichiers)), aujourdhui)
        if neuf == ancien:
            return bloc
        bouges.append((chemin, ancien, neuf))
        return bloc.replace(lm.group(0), f"<lastmod>{neuf}</lastmod>")

    sortie = URL_RE.sub(lambda m: maj(m.group(0)), sm)

    presentes = {(LOC_RE.search(b).group(1).replace(SITE, "") or "/")
                 for b in URL_RE.findall(sm) if LOC_RE.search(b)}
    manquantes = sorted(set(pages) - presentes)
    if manquantes:
        blocs = []
        for chemin in manquantes:
            fichiers = pages[chemin]
            d = min(date_declaree(fichiers) or aujourdhui, aujourdhui)
            cf, pr = DEFAUTS.get(chemin.strip("/").split("/")[0], DEFAUT)
            blocs.append(f"  <url>\n    <loc>{SITE}{chemin}</loc>\n"
                         f"    <lastmod>{d}</lastmod>\n"
                         f"    <changefreq>{cf}</changefreq>\n"
                         f"    <priority>{pr}</priority>\n  </url>")
        ajout = "\n  <!-- Ajouts automatiques : a reclasser dans la bonne section -->\n" \
                + "\n".join(blocs) + "\n"
        sortie = sortie.replace("</urlset>", ajout + "</urlset>")

    for chemin, a, b in bouges:
        print(f"  {a} -> {b}  {chemin}")
    for chemin in manquantes:
        print(f"  + {chemin}  (entree ajoutee, priorite par defaut)")
    for chemin in orphelines:
        print(f"  ! {chemin}  au sitemap mais plus aucune source — 404 ou redirection ?")

    perime = bool(bouges or manquantes)
    if args.check:
        print(f"\n{'sitemap perime' if perime else 'sitemap a jour'}"
              f" — {len(presentes)} URL")
        sys.exit(1 if perime else 0)

    if perime:
        open(SITEMAP, "w", encoding="utf-8").write(sortie)
    print(f"\n{len(bouges)} date(s) avancee(s), {len(manquantes)} entree(s) ajoutee(s)"
          f" — {len(presentes) + len(manquantes)} URL au sitemap")


if __name__ == "__main__":
    main()
