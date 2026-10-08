#!/usr/bin/env python3
"""Pre-deploy guard rails, run against the built dist/ (or any HTML dir).

ERRORS (exit 1, block deploy):
  - dead internal links        — href="/..." that resolves to nothing
  - canned AI marketing phrases — the forbidden-expressions list
  - "introduction"/"conclusion" used as a section heading

WARNINGS (reported, non-blocking):
  - <title> over MAX_TITLE chars (branding truncates; audit deemed this minor)
  - "questions fréquentes" headings (legit FAQ-schema convention sitewide)

Usage: python3 lint.py dist
"""
import re, sys, os, glob, datetime

MAX_TITLE = 70

# Promo Caprisette/Parallel (encadré <!-- cafe-cf -->) : valable jusqu'au 29 novembre 2026.
# Au-delà, l'encadré doit avoir été retiré : python3 promo-cafe.py remove
PROMO_CF_END = datetime.date(2026, 11, 29)

# Canned AI phrases + banned section titles (subset of the editorial anti-IA rules).
FORBIDDEN = [
    "dans un monde en constante évolution", "à l'ère du numérique",
    "à l'ère de la digitalisation", "plongez dans un univers",
    "il est important de noter que", "il est essentiel de comprendre que",
    "des possibilités infinies", "un voyage inoubliable",
    "solution idéale pour vos besoins", "approche innovante et dynamique",
]
# section <h2>/<h3> titles that must never appear (hard error)
BANNED_HEADINGS = {"introduction", "conclusion"}
# tolerated but reported (legit FAQ-schema heading used sitewide)
WARN_HEADINGS = {"questions fréquentes"}

def html_files(root):
    return sorted(glob.glob(os.path.join(root, "**", "*.html"), recursive=True))

def url_to_path(root, href):
    href = href.split("#")[0].split("?")[0]
    if not href.startswith("/"):
        return None  # external / relative — skip
    p = href.lstrip("/")
    cands = [os.path.join(root, p)]
    if p == "" or href.endswith("/"):
        cands.append(os.path.join(root, p, "index.html"))
    else:
        cands.append(os.path.join(root, p + ".html"))      # format:file routes
        cands.append(os.path.join(root, p, "index.html"))
    return cands

def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "dist"
    files = html_files(root)
    if not files:
        print(f"lint: no HTML under {root}/"); return 1
    errors, warnings = [], []
    for f in files:
        rel = os.path.relpath(f, root)
        t = open(f, encoding="utf-8").read()
        low = t.lower()
        # 1. internal links (ERROR)
        for href in re.findall(r'href="(/[^"]*)"', t):
            cands = url_to_path(root, href)
            if cands and not any(os.path.exists(c) for c in cands):
                errors.append(f"[link] {rel}: dead internal link {href}")
        # 1b. promo expirée encore en ligne (ERROR)
        if datetime.date.today() > PROMO_CF_END and "Deux cafés en promotion chez Coffee Friend" in t:
            errors.append(f"[promo] {rel}: encadré promo expiré le {PROMO_CF_END} — lancer promo-cafe.py remove")
        # 2. title length (WARN)
        m = re.search(r"<title>(.*?)</title>", t, re.S)
        if m and len(m.group(1).strip()) > MAX_TITLE:
            warnings.append(f"[title] {rel}: {len(m.group(1).strip())} chars > {MAX_TITLE}")
        # 3a. canned AI phrases (ERROR)
        for phrase in FORBIDDEN:
            if phrase in low:
                errors.append(f"[anti-ia] {rel}: forbidden phrase “{phrase}”")
        # 3b. headings (ERROR for introduction/conclusion, WARN for FAQ)
        for h in re.findall(r"<h[23][^>]*>(.*?)</h[23]>", t, re.S):
            txt = re.sub(r"<[^>]+>", "", h).strip().lower().rstrip(" :")
            if txt in BANNED_HEADINGS:
                errors.append(f"[anti-ia] {rel}: banned section heading “{txt}”")
            elif txt in WARN_HEADINGS:
                warnings.append(f"[heading] {rel}: “{txt}” (tolerated)")

    if warnings:
        print(f"lint: {len(warnings)} warning(s):")
        for w in warnings:
            print("  " + w)
        print()
    if errors:
        print(f"lint: FAIL — {len(errors)} error(s) across {len(files)} pages\n")
        for e in errors:
            print("  " + e)
        return 1
    print(f"lint: OK — {len(files)} pages, no blocking errors.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
