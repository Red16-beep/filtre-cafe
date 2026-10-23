#!/usr/bin/env python3
"""Icônes de la lettre : les dessins du site, en GIF animés pour le mail.

  python3 tools/lettre/icones.py 11 telephone lait filtre   # écrit newsletter/img/11/telephone.gif…
  python3 tools/lettre/icones.py                            # liste les icônes disponibles
  python3 tools/lettre/icones.py --web lait                 # pastille SVG pour la version en ligne

Les dessins viennent de tools/v2/scenes.py (ENVIES_ICONES, LETTRE_ICONES et METHODES_ICONES) et bougent avec les
classes de v2/v2.css. Gmail et Outlook n'affichent pas le SVG : le mail reçoit des GIF (pastille crème
de 128 px, affichée à 56 px), la version en ligne garde le SVG animé du site. La pastille fait partie
de l'image : sans elle, le trait brun disparaîtrait dans le mode sombre de Gmail.

Les vieux Outlook sur PC n'affichent que la première image d'un GIF : DEPART la choisit pour que la
goutte ou la vapeur y soit visible.

Il faut ffmpeg, et Node avec Playwright (PLAYWRIGHT=chemin du module s'il n'est pas résolu,
CHROMIUM=chemin du navigateur), comme pour carnet/outils/tester.js.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RACINE / 'tools' / 'v2'))
import scenes  # noqa: E402

SITE = 'https://filtre.cafe'
ICONES = {**scenes.ENVIES_ICONES, **scenes.LETTRE_ICONES, **scenes.METHODES_ICONES}
BOUCLES = {'espresso': 3.2, 'lait': 2.4, 'monde': 4, 'glace': 4, 'materiel': 4, 'cadeau': 4, 'moka': 3.2, 'piston': 7, 'aeropress': 6.5}  # durée d'un tour du GIF (s), 2,6 s sinon
DEPART = {'filtre': .1, 'telephone': .1, 'espresso': .45, 'v60': .1, 'chemex': .1, 'moka': .45}  # première image, en fraction du tour
IPS = 12             # images par seconde
COTE, DESSIN = 64, 40  # pastille et dessin, en px CSS ; capture en 2x
FOND = '#ece2d4'     # --creme-fonce, le fond des pastilles du site


def planche(noms):
    """Page qui pose les icônes dans leur pastille, avec les animations de v2.css."""
    css = (RACINE / 'v2' / 'v2.css').read_text(encoding='utf-8')
    anim = '\n'.join(l for l in css.splitlines()
                     if l.startswith('@keyframes v2-') or re.match(r'\.v2-[a-z-]+\{[^}]*animation:', l))
    pastilles = ''.join(f'<div class="pastille" id="i-{n}">{ICONES[n]}</div>' for n in noms)
    return f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
body{{margin:0;padding:16px;display:flex;flex-wrap:wrap;gap:16px;background:#fff}}
.pastille{{width:{COTE}px;height:{COTE}px;display:grid;place-items:center;background:{FOND}}}
.pastille svg{{width:{DESSIN}px;height:{DESSIN}px;overflow:visible}}
{anim}
</style></head><body>{pastilles}</body></html>'''


def balise_mail(numero, nom):
    return (f'<img src="{SITE}/newsletter/img/{numero}/{nom}.gif" width="56" height="56" alt="" '
            'style="display:block;width:56px;height:56px;border:0;border-radius:14px;margin:0 0 14px;">')


def balise_web(nom):
    svg = ICONES[nom].replace('<svg ', '<svg width="30" height="30" ', 1)
    return ('<span aria-hidden="true" style="flex:none;width:48px;height:48px;border-radius:12px;'
            f'background:var(--creme-fonce);display:grid;place-items:center">{svg}</span>')


def exporter(numero, noms):
    if not shutil.which('ffmpeg'):
        sys.exit('ffmpeg introuvable.')
    sortie = RACINE / 'newsletter' / 'img' / numero
    sortie.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        (tmp / 'planche.html').write_text(planche(noms), encoding='utf-8')
        travail = {'page': str(tmp / 'planche.html'), 'dossier': str(tmp), 'ips': IPS,
                   'icones': [{'nom': n, 'boucle': BOUCLES.get(n, 2.6), 'depart': DEPART.get(n, 0)} for n in noms]}
        (tmp / 'travail.json').write_text(json.dumps(travail), encoding='utf-8')
        subprocess.run(['node', str(Path(__file__).with_name('capturer.js')), str(tmp / 'travail.json')], check=True)
        for n in noms:
            gif = sortie / f'{n}.gif'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(IPS), '-i', str(tmp / n / '%03d.png'),
                            '-vf', 'split[a][b];[a]palettegen=max_colors=48:reserve_transparent=0[p];[b][p]paletteuse=dither=none',
                            '-loop', '0', str(gif)], check=True)
            print(f'{gif.relative_to(RACINE)}  {gif.stat().st_size / 1024:.1f} Ko')
            print('  ' + balise_mail(numero, n))


def main():
    ap = argparse.ArgumentParser(description='Exporte les icônes du site en GIF pour la lettre.')
    ap.add_argument('--web', action='store_true', help='affiche la pastille SVG pour newsletter/NN.html, sans rien exporter')
    ap.add_argument('noms', nargs='*', help='numéro de la lettre, puis les icônes (avec --web : les icônes seules)')
    a = ap.parse_args()
    numero, noms = (None, a.noms) if a.web else (a.noms[0] if a.noms else None, a.noms[1:])
    inconnues = [n for n in noms if n not in ICONES]
    if not noms or inconnues:
        if inconnues:
            print('Icône inconnue :', ' '.join(inconnues))
        print('Icônes disponibles :', ' '.join(sorted(ICONES)))
        sys.exit(1 if inconnues else 0)
    if a.web:
        for n in noms:
            print(balise_web(n))
        return
    if not numero.isdigit():
        sys.exit('Le premier argument est le numéro de la lettre, par exemple 11.')
    exporter(f'{int(numero):02d}', noms)


if __name__ == '__main__':
    main()
