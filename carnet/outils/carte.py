#!/usr/bin/env python3
"""Régénère carnet/carte.js : les terres de la carte de /cafes-du-monde (tools/v2/scenes.py).

Usage, depuis la racine du dépôt : python3 carnet/outils/carte.py
"""
import os
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, '..', '..'))
sys.path.insert(0, os.path.join(RACINE, 'tools', 'v2'))

import scenes  # noqa: E402

chemin = os.path.join(ICI, '..', 'carte.js')
with open(chemin, 'w', encoding='utf-8') as f:
    f.write('/* Généré par carnet/outils/carte.py depuis tools/v2/scenes.py : ne pas modifier à la main.\n'
            '   Projection équirectangulaire 720 × 360, la même que la carte de /cafes-du-monde. */\n')
    f.write("var CARNET_TERRES = '" + scenes.terres_d() + "';\n")
print('carte.js écrit :', os.path.relpath(chemin, RACINE))
