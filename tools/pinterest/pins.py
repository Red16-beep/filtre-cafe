#!/usr/bin/env python3
"""Build Pinterest pins from the site's own articles.

Reads the metadata already present in journal/ and guides/ (og:title, meta
description, canonical, article:section, h2 outline), renders one 1000x1500
card per article with the site's fonts and palette, screenshots it with headless
Chrome, and writes the CSV Pinterest's bulk upload expects.

  python3 tools/pinterest/pins.py                    # tout le site
  python3 tools/pinterest/pins.py journal/v60-guide-complet
  python3 tools/pinterest/pins.py --csv-only         # regenere juste le CSV
  python3 tools/pinterest/pins.py --depuis 2026-09-01 --par-jour 3

Sortie : pins/<slug>.png (deploye sur filtre.cafe/pins/) + tools/pinterest/pins.csv
"""
import argparse, base64, csv, datetime, glob, hashlib, html, json, os, re, shutil
import struct, subprocess, sys, tempfile, zlib

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "tools", "pinterest")
OUT_IMG = os.path.join(ROOT, "pins")
OUT_CSV = os.path.join(HERE, "pins.csv")
SITE = "https://filtre.cafe"

WIDTH, HEIGHT = 1000, 1500          # 2:3, le format que Pinterest recommande
TAGLINE = "Guide indépendant du café de spécialité"

# Les 24 valeurs d'article:section du site, ramenees aux 6 tableaux Pinterest.
# La cle est comparee en minuscules ; le defaut est "Comprendre le café".
BOARDS = {
    "technique": "Méthodes & extraction",
    "technique & extraction": "Méthodes & extraction",
    "méthodes & extraction": "Méthodes & extraction",
    "entretien": "Méthodes & extraction",
    "recette": "Recettes & boissons",
    "recettes": "Recettes & boissons",
    "sélection": "Matériel & achat",
    "sélection & achat": "Matériel & achat",
    "matériel": "Matériel & achat",
    "comparatif": "Matériel & achat",
    "test": "Matériel & achat",
    "test & avis": "Matériel & achat",
    "guide": "Matériel & achat",
    "guides & débutants": "Comprendre le café",
    "comprendre": "Comprendre le café",
    "histoire": "Comprendre le café",
    "culture": "Comprendre le café",
    "tendances": "Comprendre le café",
    "origines": "Origines & terroirs",
    "origine": "Origines & terroirs",
    "terroir": "Origines & terroirs",
    "culture & terroir": "Origines & terroirs",
    "adresses": "Adresses & voyages",
    "voyages": "Adresses & voyages",
}
DEFAULT_BOARD = "Comprendre le café"

# article:section ne suffit pas partout : un billet de voyage est classe "Culture",
# un guide d'achat "Technique". Ces regles passent devant, par slug.
SLUG_BOARD = {
    "cafe-au-japon": "Adresses & voyages",
    "cafe-au-vietnam": "Adresses & voyages",
    "cafe-en-coree": "Adresses & voyages",
    "cafe-en-thailande": "Adresses & voyages",
    "cafe-aux-epices-fes": "Adresses & voyages",
    "meilleurs-cafes-paris": "Adresses & voyages",
    "comment-choisir-son-moulin-cafe": "Matériel & achat",
    "machine-espresso-manuelle-vs-automatique": "Matériel & achat",
    "equipement-cafe-maison": "Matériel & achat",
    "methodes-extraction": "Méthodes & extraction",
    "cafe-geisha-gesha-guide": "Origines & terroirs",
}

# Le libelle imprime sur l'epingle, plus court que le nom du tableau.
KICKERS = {
    "Méthodes & extraction": "Méthode",
    "Recettes & boissons": "Recette",
    "Matériel & achat": "Matériel",
    "Comprendre le café": "Comprendre",
    "Origines & terroirs": "Origine",
    "Adresses & voyages": "Adresses",
}

# Heures d'etalement quand on programme les epingles (--depuis).
SLOTS = ["09:00", "13:00", "18:00", "21:00"]

META = r'<meta\s+(?:name|property)="{}"\s+content="([^"]*)"'
H2_RE = re.compile(r"<h2[^>]*>(.*?)</h2>", re.S | re.I)
TAG_RE = re.compile(r"<[^>]+>")


def curl(t):
    """Apostrophe typographique : le site écrit ', une épingle mérite mieux."""
    return t.replace("'", "\u2019")


def text(raw):
    """Strip tags and entities, collapse whitespace."""
    return re.sub(r"\s+", " ", html.unescape(TAG_RE.sub(" ", raw))).strip()


def meta(doc, key):
    m = re.search(META.format(re.escape(key)), doc, re.I)
    return html.unescape(m.group(1)).strip() if m else ""


def outline(doc):
    """The article's h2 titles, kept only when they read as a real section."""
    out = []
    for raw in H2_RE.findall(doc):
        t = text(raw)
        if not t or len(t) > 48:
            continue
        if t.lower().startswith(("questions fréquentes", "faq", "sur le même", "à lire")):
            continue
        # une puce qui contient deja un tiret cadratin passe mal en petit
        t = t.split(" — ")[0].strip()
        if 8 <= len(t) <= 48 and t not in out:
            out.append(t)
    return out


def title_size(t):
    """Le corps du titre, choisi sur la longueur pour tenir dans la carte."""
    n = len(t)
    if n <= 30:  return 112
    if n <= 42:  return 98
    if n <= 56:  return 86
    if n <= 72:  return 74
    return 64


def collect(only=None):
    """Every article page, with the fields the pin and the CSV need."""
    # Sources reelles : les fragments Astro. Les fichiers journal/ et guides/ a la
    # racine sont legataires, ils ne sont plus deployes et gardent une ponctuation
    # obsolete (tirets cadratins) que la charte editoriale proscrit.
    FRAG = os.path.join(ROOT, "astro", "src", "fragments")
    files = sorted(glob.glob(os.path.join(FRAG, "journal", "*.head.html")) +
                   glob.glob(os.path.join(FRAG, "guides", "*.head.html")))
    arts = []
    for path in files:
        slug = os.path.basename(path)[:-len(".head.html")]
        kind = os.path.basename(os.path.dirname(path))
        rel = f"{kind}/{slug}"
        if slug == "index":
            continue
        if only and only not in (slug, rel, f"{rel}.html"):
            continue
        doc = open(path, encoding="utf-8").read()
        body = path[:-len(".head.html")] + ".body.html"
        if os.path.exists(body):
            doc += open(body, encoding="utf-8").read()

        url = meta(doc, "og:url") or ""
        if not url:
            m = re.search(r'<link\s+rel="canonical"\s+href="([^"]*)"', doc, re.I)
            url = m.group(1) if m else f"{SITE}/{rel}"

        title = meta(doc, "og:title")
        if not title:
            m = re.search(r"<title>(.*?)</title>", doc, re.S | re.I)
            title = text(m.group(1)) if m else slug.replace("-", " ")
        title = re.sub(r"\s*\|\s*filtré\.?\s*$", "", title).strip()

        desc = meta(doc, "description") or meta(doc, "og:description")
        section = text(meta(doc, "article:section"))
        board = (SLUG_BOARD.get(slug)
                 or ("Recettes & boissons" if "recette" in slug else None)
                 or BOARDS.get(section.lower(), DEFAULT_BOARD))

        arts.append({
            "slug": slug, "url": url, "title": curl(title), "desc": curl(desc),
            "board": board, "kicker": KICKERS[board],
            "outline": [curl(h) for h in outline(doc)],
        })
    return arts + extras(only)


def extras(only=None):
    """Epingles sur-mesure declarees a la main dans extras.json.

    Pinterest etant un moteur de recherche, une meme page merite plusieurs
    epingles quand elle repond a plusieurs requetes : le hub cadeaux sert aussi
    bien "idees cadeaux cafe" que "calendrier de l'avent cafe". Ces entrees
    traversent ensuite la meme chaine que les autres, rendu et CSV compris.
    """
    path = os.path.join(HERE, "extras.json")
    if not os.path.exists(path):
        return []
    out = []
    for e in json.load(open(path, encoding="utf-8")):
        slug = e["slug"]
        if only and only not in (slug, f"extras/{slug}"):
            continue
        board = e.get("board", DEFAULT_BOARD)
        out.append({
            "slug": slug, "url": e["url"], "title": curl(e["title"]),
            "desc": curl(e.get("desc", "")), "board": board,
            "kicker": KICKERS[board],
            "outline": [curl(h) for h in e.get("outline", [])],
            "theme": e.get("theme"), "layout": e.get("layout"),
        })
    return out


def fonts_css():
    """Inline the site's woff2 so the render never depends on the network."""
    faces = [
        ("Instrument Serif", "400", "instrumentserif-normal-latin.woff2"),
        ("Instrument Serif", "400", "instrumentserif-normal-latinext.woff2"),
        ("Inter", "100 900", "inter-latin.woff2"),
        ("Inter", "100 900", "inter-vietnamese.woff2"),
    ]
    css = []
    for family, weight, name in faces:
        blob = open(os.path.join(ROOT, "fonts", name), "rb").read()
        b64 = base64.b64encode(blob).decode()
        css.append(f"@font-face{{font-family:'{family}';font-style:normal;"
                   f"font-weight:{weight};src:url(data:font/woff2;base64,{b64}) format('woff2');}}")
    return "\n".join(css)


def clamp(t, limit=170):
    """Couper l'accroche sur une fin de phrase quand il y en a une, sinon sur un mot."""
    if len(t) <= limit:
        return t
    head = t[:limit]
    cut = max(head.rfind(". "), head.rfind("? "), head.rfind("! "))
    if cut >= limit * 0.55:
        return head[:cut + 1]
    return head.rsplit(" ", 1)[0].rstrip(" ,;:—-") + "…"


def build_html(art, template, fonts):
    """Deterministic theme + layout, so a given article always renders the same."""
    seed = int(hashlib.sha1(art["slug"].encode()).hexdigest()[:8], 16)
    # Les epingles sur-mesure peuvent imposer leur rendu : deux epingles vers la
    # meme page doivent se distinguer dans le fil, et le tirage par slug ne le
    # garantit pas.
    theme = art.get("theme") or ("sombre" if seed % 3 == 0 else "clair")
    veut_toc = art.get("layout") == "sommaire" or (art.get("layout") is None and seed % 3 == 1)

    steps = art["outline"][:4]
    if veut_toc and len(steps) >= 3:
        items = "".join(f'<li><span class="n">{i:02d}</span>{html.escape(s)}</li>'
                        for i, s in enumerate(steps, 1))
        body = f'<ol class="toc">{items}</ol>'
    else:
        body = f'<p class="sub">{html.escape(clamp(art["desc"]))}</p>' if art["desc"] else ""

    return (template
            .replace("{{FONTS}}", fonts)
            .replace("{{THEME}}", theme)
            .replace("{{KICKER}}", html.escape(art["kicker"]))
            .replace("{{TITLE_SIZE}}", str(title_size(art["title"])))
            .replace("{{TITLE}}", html.escape(art["title"]))
            .replace("{{BODY}}", body)
            .replace("{{NOTE}}", html.escape(TAGLINE)))


def find_chrome():
    """$CHROME wins; otherwise the usual Linux / macOS install paths."""
    if os.environ.get("CHROME"):
        return os.environ["CHROME"]
    for name in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        p = shutil.which(name)
        if p:
            return p
    globs = [
        "/opt/pw-browsers/chromium-*/chrome-linux/chrome",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        os.path.expanduser("~/Library/Caches/ms-playwright/chromium-*/chrome-mac/Chromium.app/"
                           "Contents/MacOS/Chromium"),
    ]
    for g in globs:
        hits = sorted(glob.glob(g))
        if hits:
            return hits[-1]
    return None


# --- capture -----------------------------------------------------------------
# Chrome sans interface rend la page dans une fenetre plus haute que le viewport
# (barre d'onglets et barre d'outils comptees dans --window-size). L'ecart varie
# selon la version et la plateforme : on le mesure une fois, on demande une
# fenetre d'autant plus haute, et on retaille le PNG a 1500 px.

CHROME_FLAGS = ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
                "--force-device-scale-factor=1"]


def chrome_gap(chrome, tmp):
    """Hauteur perdue entre --window-size et le viewport réel, en pixels."""
    probe = os.path.join(tmp, "_calibrage.html")
    open(probe, "w", encoding="utf-8").write(
        "<!DOCTYPE html><html><body><i id=v></i>"
        "<script>document.getElementById('v').textContent='VH='+innerHeight;</script>"
        "</body></html>")
    r = subprocess.run([chrome, *CHROME_FLAGS, f"--window-size={WIDTH},{HEIGHT}",
                        "--virtual-time-budget=600", "--dump-dom", f"file://{probe}"],
                       capture_output=True, text=True)
    m = re.search(r"VH=(\d+)", r.stdout)
    return HEIGHT - int(m.group(1)) if m else 0


def crop_height(path, keep):
    """Ne garder que les `keep` premières lignes d'un PNG, sans dépendance."""
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise RuntimeError(f"{path} n'est pas un PNG")
    pos, others, idat, ihdr = 8, [], bytearray(), None
    while pos < len(data):
        (ln,) = struct.unpack(">I", data[pos:pos + 4])
        typ, body = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + ln]
        pos += 12 + ln
        if typ == b"IHDR":   ihdr = body
        elif typ == b"IDAT": idat += body
        elif typ == b"IEND": break
        else:                others.append((typ, body))

    w, h, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", ihdr)
    if interlace or depth != 8 or color not in (0, 2, 4, 6):
        raise RuntimeError(f"PNG non géré (depth={depth} color={color} interlace={interlace})")
    if h <= keep:
        return
    stride = 1 + w * {0: 1, 2: 3, 4: 2, 6: 4}[color]
    raw = zlib.decompress(bytes(idat))[:keep * stride]

    def chunk(typ, body):
        return struct.pack(">I", len(body)) + typ + body + struct.pack(">I", zlib.crc32(typ + body))

    out = [data[:8], chunk(b"IHDR", struct.pack(">IIBBBBB", w, keep, depth, color, 0, 0, 0))]
    out += [chunk(t, b) for t, b in others]
    out += [chunk(b"IDAT", zlib.compress(raw, 9)), chunk(b"IEND", b"")]
    open(path, "wb").write(b"".join(out))


def shoot(chrome, html_path, png_path, gap, w=WIDTH, h=HEIGHT):
    cmd = [chrome, *CHROME_FLAGS, f"--window-size={w},{h + gap}",
           "--virtual-time-budget=3000", f"--screenshot={png_path}", f"file://{html_path}"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if not os.path.exists(png_path):
        raise RuntimeError(f"chrome n'a rien produit pour {png_path}\n{r.stderr[-800:]}")
    if gap:
        crop_height(png_path, h)


def schedule(n, start, per_day):
    """Etale n epingles sur les creneaux de SLOTS, per_day par jour."""
    if not start:
        return [""] * n
    day = datetime.date.fromisoformat(start)
    out = []
    for i in range(n):
        slot = SLOTS[i % per_day]
        out.append(f"{day + datetime.timedelta(days=i // per_day)} {slot}")
    return out


def write_csv(arts, start, per_day):
    when = schedule(len(arts), start, per_day)
    with open(OUT_CSV, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["board_name", "title", "description", "link", "image_url", "published_at"])
        for art, ts in zip(arts, when):
            w.writerow([
                art["board"],
                art["title"][:100],
                art["desc"][:800],
                art["url"],
                f"{SITE}/pins/{art['slug']}.png",
                ts,
            ])
    return OUT_CSV


AVATARS = [("profil-mot.png", "filtré", 250), ("profil-lettre.png", "f", 520)]


def make_avatars(chrome, fonts, tmp, gap):
    """Deux avatars carrés 1000 px, à charger dans le profil Pinterest."""
    template = open(os.path.join(HERE, "avatar.html"), encoding="utf-8").read()
    for name, mark, size in AVATARS:
        page = os.path.join(tmp, name.replace(".png", ".html"))
        open(page, "w", encoding="utf-8").write(
            template.replace("{{FONTS}}", fonts).replace("{{SIZE}}", str(size))
                    .replace("{{MARK}}", mark))
        out = os.path.join(HERE, name)
        shoot(chrome, page, out, gap, 1000, 1000)
        print(f"  {os.path.relpath(out, ROOT)}")


def main():
    ap = argparse.ArgumentParser(description="Genere les epingles Pinterest du site.")
    ap.add_argument("cible", nargs="?", help="un slug ou journal/<slug> ; par defaut, tout")
    ap.add_argument("--csv-only", action="store_true", help="ne regenere que le CSV")
    ap.add_argument("--avatar", action="store_true", help="rend les deux avatars de profil, rien d'autre")
    ap.add_argument("--depuis", metavar="AAAA-MM-JJ", help="programme les epingles a partir de cette date")
    ap.add_argument("--par-jour", type=int, default=2, choices=range(1, len(SLOTS) + 1),
                    metavar="N", help=f"epingles par jour avec --depuis (1-{len(SLOTS)}, defaut 2)")
    args = ap.parse_args()

    chrome = find_chrome()

    if args.avatar:
        if not chrome:
            sys.exit("Chrome/Chromium introuvable. Lance avec CHROME=/chemin/vers/chrome")
        with tempfile.TemporaryDirectory() as tmp:
            make_avatars(chrome, fonts_css(), tmp, chrome_gap(chrome, tmp))
        return

    arts = collect(args.cible)
    if not arts:
        sys.exit(f"aucun article trouvé pour « {args.cible} »")

    if not args.csv_only:
        if not chrome:
            sys.exit("Chrome/Chromium introuvable. Installe-le, ou lance avec CHROME=/chemin/vers/chrome")
        os.makedirs(OUT_IMG, exist_ok=True)
        template = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
        fonts = fonts_css()
        with tempfile.TemporaryDirectory() as tmp:
            gap = chrome_gap(chrome, tmp)
            for i, art in enumerate(arts, 1):
                page = os.path.join(tmp, art["slug"] + ".html")
                open(page, "w", encoding="utf-8").write(build_html(art, template, fonts))
                png = os.path.join(OUT_IMG, art["slug"] + ".png")
                shoot(chrome, page, png, gap)
                print(f"  [{i}/{len(arts)}] {art['slug']}.png  ({art['board']})")

    # le CSV reste toujours complet, meme quand on ne regenere qu'une image
    path = write_csv(collect(), args.depuis, args.par_jour)
    print(f"\n{len(arts)} épingle(s) dans pins/ — feuille d'import : {os.path.relpath(path, ROOT)}")


if __name__ == "__main__":
    main()
