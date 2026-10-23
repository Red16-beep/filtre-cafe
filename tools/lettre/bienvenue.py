#!/usr/bin/env python3
"""Mail de bienvenue : la dernière lettre parue, précédée d'un mot d'accueil.

  python3 tools/lettre/bienvenue.py 11      # écrit newsletter/bienvenue.html à partir de newsletter/nl-011.html

Brevo l'envoie à chaque nouvel abonné : automatisation « Contact ajouté à une liste », liste n° 2 (celle de
functions/api/subscribe.js), action « Envoyer un e-mail » avec ce HTML. Avec le double opt-in, l'adresse n'entre
dans la liste qu'après le clic de confirmation : le mail ne part qu'aux adresses confirmées.

Après chaque nouvelle lettre : relancer le script avec son numéro, puis recoller le HTML dans l'e-mail de
l'automatisation (Brevo garde sa copie, il ne relit pas ce fichier).
"""
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
NBSP = ' '
P = "margin:0 0 14px;font-size:15px;line-height:1.75;color:#292524;font-weight:300;font-family:'Inter',Arial,sans-serif;"


def accueil(numero):
    lien = 'style="color:#92400e;text-decoration:underline;"'
    return f'''          <tr>
            <td class="content-padding" style="padding:32px 48px 28px;background-color:#ffffff;border:1px solid #e7e5e4;border-radius:16px;">
              <p style="margin:0 0 6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.3em;color:#92400e;font-family:'Inter',Arial,sans-serif;">Bienvenue</p>
              <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:22px;line-height:1.25;color:#1c1917;">Merci de votre inscription.</p>
              <p style="{P}">Vous recevrez la prochaine lettre dès sa sortie. En attendant, voici la dernière, la N°{numero:02d}{NBSP}: elle vous donne le ton et le niveau de détail.</p>
              <p style="{P}">Pour découvrir le site, la page <a href="https://filtre.cafe/commencer-ici" target="_blank" {lien}>Commencer ici</a> propose quatre chemins, selon ce que vous cherchez. Et pour une question sur un réglage, un café ou du matériel, répondez à ce mail{NBSP}: je lis tout.</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1c1917;font-family:'Inter',Arial,sans-serif;">Reda</p>
            </td>
          </tr>
          <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>

'''


def bienvenue(numero):
    s = (RACINE / 'newsletter' / f'nl-{numero:03d}.html').read_text(encoding='utf-8')
    s = re.sub(r'<title>.*?</title>', '<title>Bienvenue dans filtré.</title>', s, count=1)
    s = re.sub(r'<!-- Version email de /newsletter/\d+[^>]*-->',
               f'<!-- Mail de bienvenue (Brevo) : la N°{numero:02d}, précédée d\'un mot d\'accueil. Généré par tools/lettre/bienvenue.py. -->', s, count=1)

    def entete(m):
        texte = m.group(2).strip()
        return m.group(1) + f'Merci de votre inscription. En attendant la prochaine, voici la dernière lettre{NBSP}: ' + texte[:1].lower() + texte[1:]
    s, n = re.subn(r'(<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">\s*)([^&]*)', entete, s, count=1)
    assert n == 1, 'préheader introuvable'
    # Le bandeau « Au programme » des anciennes lettres portait des emojis : la copie de bienvenue s'en passe.
    s = re.sub(r'Au programme &nbsp;&rarr;&nbsp;.*?</td>', lambda m: re.sub(
        r'(?:&#\d+;|[\U0001F300-\U0001FAFF\u2600-\u27BF]\ufe0f?)\s*', '', m.group(0)), s, count=1, flags=re.S)
    rang = s.index('<table class="email-container"')
    rang = s.index('<tr>', rang)
    return s[:rang] + accueil(numero).lstrip() + '          ' + s[rang:]


if __name__ == '__main__':
    if len(sys.argv) != 2 or not sys.argv[1].isdigit():
        sys.exit(__doc__)
    sortie = RACINE / 'newsletter' / 'bienvenue.html'
    sortie.write_text(bienvenue(int(sys.argv[1])), encoding='utf-8')
    print(sortie.relative_to(RACINE), sortie.stat().st_size // 1024, 'Ko')
