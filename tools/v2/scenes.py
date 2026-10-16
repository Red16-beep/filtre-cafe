"""Illustrations animées (SVG) de la version test v2 : scènes du héros, icônes des cartes, carte des origines, 404."""
import math

CR = '#efc79c'   # crema
CU = '#c98a5c'   # cuivre
CF = '#6b3a1f'   # café
CL = '#d9a066'   # crème du café
TX = '#f4ece3'

HALO = '<defs><radialGradient id="halo{i}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#efc79c" stop-opacity=".16"/><stop offset="1" stop-color="#efc79c" stop-opacity="0"/></radialGradient></defs><circle cx="330" cy="360" r="300" fill="url(#halo{i})"/>'

def scene_v60():
    gouttes = ''.join(f'<circle class="v2-goutte" style="--h:{86}px;animation-delay:{d}s" cx="400" cy="462" r="4" fill="{CL}"/>' for d in (.9, 1.35, 1.8))
    cotes = ''.join(f'<path d="M{318+k*22} 340 L{386+k*5} 446" stroke="{CR}" stroke-opacity=".28" stroke-width="1.2"/>' for k in range(8))
    return f'''<svg viewBox="0 0 600 700" aria-hidden="true">{HALO.format(i=1)}
<g fill="none" stroke="{CR}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <g class="v2-bouilloire">
  <path d="M70 175 Q70 150 98 150 H238 Q262 150 262 175 V250 Q262 270 242 270 H90 Q70 270 70 250 Z" fill="rgba(239,199,156,.06)"/>
  <path d="M140 150 V138 Q140 128 150 128 H182 Q192 128 192 138 V150"/>
  <path d="M70 182 Q32 196 36 226 Q40 252 70 254"/>
  <path d="M262 236 Q300 236 318 206 Q336 176 368 184 Q392 192 398 228"/>
  </g>
  <path class="v2-flux" d="M399 236 C401 268 400 300 400 330" stroke="{CL}" stroke-width="3"/>
  <path d="M296 330 H504 L424 448 H376 Z" fill="rgba(239,199,156,.07)"/>
  {cotes}
  <path d="M290 330 H510"/>
  <path d="M352 468 H448 Q452 468 452 474 V488 Q500 520 500 572 Q500 642 400 646 Q300 642 300 572 Q300 520 348 488 V474 Q348 468 352 468 Z" fill="rgba(239,199,156,.05)"/>
</g>
<clipPath id="carafe"><path d="M300 572 Q300 520 348 488 H452 Q500 520 500 572 Q500 642 400 646 Q300 642 300 572 Z"/></clipPath>
<g clip-path="url(#carafe)"><rect class="v2-monte" x="290" y="520" width="220" height="130" fill="{CF}" opacity=".85"/></g>
{gouttes}
<path class="v2-vapeur" d="M380 470 q-10 -20 0 -40" fill="none" stroke="{CR}" stroke-opacity=".5" stroke-width="2"/>
</svg>'''

def scene_espresso():
    return f'''<svg viewBox="0 0 600 700" aria-hidden="true">{HALO.format(i=2)}
<g fill="none" stroke="{CR}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <rect x="150" y="80" width="300" height="120" rx="18" fill="rgba(239,199,156,.06)"/>
  <circle cx="200" cy="140" r="16"/><path d="M200 128 V140 L210 146"/>
  <rect x="268" y="200" width="64" height="34" rx="6"/>
  <path d="M236 234 H364 Q372 234 372 242 V256 Q372 272 356 272 H244 Q228 272 228 256 V242 Q228 234 236 234 Z" fill="rgba(239,199,156,.08)"/>
  <path d="M372 246 H520 Q532 246 532 256 Q532 266 520 266 H372"/>
  <path d="M284 272 V284 M316 272 V284"/>
  <path class="v2-flux" d="M284 288 V430" stroke="{CL}" stroke-width="3"/>
  <path class="v2-flux" d="M316 288 V430" stroke="{CL}" stroke-width="3" style="animation-delay:.3s"/>
  <path d="M230 432 H370 V500 Q370 548 300 548 Q230 548 230 500 Z" fill="rgba(239,199,156,.05)"/>
  <path d="M370 452 Q404 452 404 482 Q404 512 368 512"/>
  <rect x="190" y="556" width="220" height="30" rx="8"/>
  <circle cx="490" cy="560" r="46" stroke-opacity=".3"/>
  <circle class="v2-arc" cx="490" cy="560" r="46" stroke="{CL}" stroke-width="4" style="--l:289;transform:rotate(-90deg);transform-origin:490px 560px"/>
</g>
<clipPath id="tasse"><path d="M232 434 H368 V500 Q368 546 300 546 Q232 546 232 500 Z"/></clipPath>
<g clip-path="url(#tasse)"><g class="v2-monte"><rect x="228" y="470" width="144" height="80" fill="{CF}"/><rect x="228" y="462" width="144" height="12" fill="{CL}" opacity=".9"/></g></g>
<text x="490" y="566" text-anchor="middle" fill="{TX}" font-family="Instrument Sans, Arial" font-size="18" font-weight="600">26 s</text>
<text x="300" y="577" text-anchor="middle" fill="{TX}" font-family="Instrument Sans, Arial" font-size="15" font-weight="600">18 g → 36 g</text>
</svg>'''

def scene_piston():
    grains = ''.join(f'<circle class="v2-derive" style="--dx:{dx}px;--dy:{dy}px;animation-delay:{d}s" cx="{x}" cy="{y}" r="{r}" fill="{CU}" opacity=".8"/>'
                     for x, y, r, dx, dy, d in [(260, 520, 4, 6, -14, 0), (300, 560, 5, -8, -10, .7), (340, 500, 3.5, 9, -8, 1.3), (370, 548, 4.5, -6, -16, .4), (280, 470, 3, 7, -9, 2), (350, 440, 4, -5, -12, 1.1), (320, 590, 4, 6, -6, .2)])
    return f'''<svg viewBox="0 0 600 700" aria-hidden="true">{HALO.format(i=3)}
<g fill="none" stroke="{CR}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <rect x="222" y="190" width="200" height="430" rx="16" fill="rgba(239,199,156,.05)"/>
  <path d="M422 260 Q478 260 478 320 V480 Q478 540 422 540"/>
  <rect x="206" y="160" width="232" height="34" rx="10"/>
</g>
<rect x="226" y="330" width="192" height="286" rx="12" fill="{CF}" opacity=".7"/>
<g class="v2-piston" style="--p:250px">
  <path d="M322 80 V330" stroke="{CR}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="322" cy="70" r="16" fill="none" stroke="{CR}" stroke-width="2.6"/>
  <rect x="232" y="326" width="180" height="10" rx="5" fill="{CR}"/>
  <path d="M240 340 H404" stroke="{CR}" stroke-opacity=".4" stroke-dasharray="2 5"/>
</g>
{grains}
<text x="322" y="660" text-anchor="middle" fill="{TX}" font-family="Instrument Sans, Arial" font-size="15" font-weight="600">4 minutes</text>
</svg>'''

def scene_coldbrew():
    glacons = ''.join(f'<rect class="v2-flotte" style="--r:{rot}deg;animation-delay:{d}s" x="{x}" y="{y}" width="46" height="46" rx="8" fill="rgba(244,236,227,.16)" stroke="{CR}" stroke-width="2"/>'
                      for x, y, rot, d in [(240, 300, 12, 0), (318, 286, -8, .8), (276, 352, 4, 1.6)])
    return f'''<svg viewBox="0 0 600 700" aria-hidden="true">{HALO.format(i=4)}
<g fill="none" stroke="{CR}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M206 210 H414 V590 Q414 630 374 630 H246 Q206 630 206 590 Z" fill="rgba(239,199,156,.05)"/>
  <rect x="196" y="176" width="228" height="36" rx="10"/>
</g>
<path d="M210 290 H410 V588 Q410 626 372 626 H248 Q210 626 210 588 Z" fill="{CF}" opacity=".75"/>
{glacons}
<g fill="none" stroke="{CR}" stroke-width="2.6" stroke-linecap="round"><circle cx="486" cy="168" r="62"/>
<path class="v2-tourne-vite" d="M486 168 V122" style="transform-origin:486px 168px"/><path class="v2-tourne-lent" d="M486 168 H520" style="transform-origin:486px 168px"/></g>
<text x="486" y="262" text-anchor="middle" fill="{TX}" font-family="Instrument Sans, Arial" font-size="15" font-weight="600">12 à 16 h au frais</text>
</svg>'''

def scene_aveugle():
    tasses = ''
    for k in range(6):
        a = math.radians(k * 60 - 90)
        x, y = 300 + 168 * math.cos(a), 360 + 168 * math.sin(a)
        tasses += (f'<g><circle cx="{x:.1f}" cy="{y:.1f}" r="46" fill="rgba(239,199,156,.08)" stroke="{CR}" stroke-width="2.4"/>'
                   f'<circle cx="{x:.1f}" cy="{y:.1f}" r="33" fill="{CF}"/><circle cx="{x:.1f}" cy="{y:.1f}" r="33" fill="none" stroke="{CL}" stroke-opacity=".5"/>'
                   f'<text x="{x:.1f}" y="{y+7:.1f}" text-anchor="middle" fill="{CR}" font-family="Newsreader, Georgia" font-size="22">?</text></g>')
    return f'''<svg viewBox="0 0 600 700" aria-hidden="true">{HALO.format(i=5)}
<g class="v2-tourne" style="transform-origin:300px 360px">
<circle cx="300" cy="360" r="242" fill="rgba(239,199,156,.04)" stroke="{CR}" stroke-width="2.6"/>
<circle cx="300" cy="360" r="226" fill="none" stroke="{CR}" stroke-opacity=".25" stroke-dasharray="3 9"/>
{tasses}
</g>
<path d="M300 360 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0" fill="{CR}" opacity=".5"/>
<text x="300" y="652" text-anchor="middle" fill="{TX}" font-family="Instrument Sans, Arial" font-size="15" font-weight="600">6 eaux · 1 café · noms sous les tasses</text>
</svg>'''

HERO = [
    ('V60', 'Recette du guide · 15 g · 250 g · 93 °C', scene_v60),
    ('Espresso', 'Repère · 18 g pour 36 g en 25 à 30 s', scene_espresso),
    ('French press', 'Piston · 1:15 à 1:16 · 4 minutes', scene_piston),
    ('Cold brew', '100 g pour 1 litre · 12 à 16 h au réfrigérateur', scene_coldbrew),
    ('Test à l’aveugle', '6 eaux · 1 café · plateau tournant', scene_aveugle),
]

# ── Icônes animées des cartes (viewBox 120×120) ───────────────────────────
def ic(contenu):
    return f'<svg viewBox="0 0 120 120" fill="none" stroke="{CR}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{contenu}</svg>'

ICONES = {
    'v60': ic(f'<path d="M24 34 H96 L68 76 H52 Z" fill="rgba(239,199,156,.08)"/><path d="M48 92 H72"/><circle class="v2-goutte" style="--h:18px" cx="60" cy="80" r="3" fill="{CL}" stroke="none"/><path class="v2-flux" d="M60 6 V30" stroke="{CL}"/>'),
    'eau': ic('<path d="M30 40 h14 v-8 h6 v8 h0 q6 4 6 12 v40 q0 6-6 6 h-14 q-6 0-6-6 v-40 q0-8 6-12z"/><path d="M68 34 h12 v-6 h6 v6 q6 4 6 12 v46 q0 6-6 6 h-12 q-6 0-6-6 v-46 q0-8 6-12z"/>'
              f'<circle class="v2-goutte" style="--h:-30px" cx="44" cy="84" r="3" fill="{CR}" stroke="none"/><circle class="v2-goutte" style="--h:-34px;animation-delay:.6s" cx="80" cy="88" r="2.5" fill="{CR}" stroke="none"/>'),
    'moulin': ic('<g class="v2-tourne-vite" style="animation-duration:6s">' + ''.join(f'<path d="M60 60 L{60+40*math.cos(math.radians(a)):.1f} {60+40*math.sin(math.radians(a)):.1f}" stroke-opacity=".7"/>' for a in range(0, 360, 30)) + '<circle cx="60" cy="60" r="40"/></g><circle cx="60" cy="60" r="12" fill="rgba(239,199,156,.2)"/>'),
    'ratio': ic('<path d="M60 22 V92 M36 96 H84"/><g class="v2-balance-anim"><path d="M20 40 H100"/><path d="M20 40 l-10 24 h20 z M100 40 l-10 24 h20 z" fill="rgba(239,199,156,.1)"/></g><text x="60" y="114" fill="#efc79c" stroke="none" font-family="Instrument Sans, Arial" font-size="14" text-anchor="middle" font-weight="600">1:16</text>'),
    'espresso': ic(f'<path d="M30 52 H82 V74 Q82 96 56 96 Q30 96 30 74 Z" fill="rgba(239,199,156,.08)"/><path d="M82 60 Q96 60 96 70 Q96 80 82 80"/><circle cx="60" cy="30" r="16" stroke-opacity=".35"/><circle class="v2-arc" cx="60" cy="30" r="16" stroke="{CL}" style="--l:101;transform:rotate(-90deg);transform-origin:60px 30px"/>'),
    'temperature': ic(f'<path d="M52 20 Q52 12 60 12 Q68 12 68 20 V70 Q80 78 76 92 Q72 104 60 104 Q48 104 44 92 Q40 78 52 70 Z"/><rect class="v2-niveau" x="56" y="34" width="8" height="52" rx="4" fill="{CL}" stroke="none"/><circle cx="60" cy="88" r="9" fill="{CL}" stroke="none"/>'),
    'lait': ic(f'<path d="M32 30 H84 L80 96 Q80 102 74 102 H42 Q36 102 36 96 Z" fill="rgba(239,199,156,.06)"/><path d="M84 30 L98 22"/><path class="v2-tourne-vite" style="transform-origin:58px 66px;animation-duration:2.4s" d="M58 66 m-14 0 a14 14 0 1 1 28 0 a9 9 0 1 1 -18 0" stroke="{CL}"/>'),
    'quatre-six': ic(''.join(f'<rect class="v2-barreapp" style="animation-delay:{k*.6}s" x="{14+k*20}" y="{100-h}" width="14" height="{h}" rx="3" fill="{CL if k<2 else CR}" stroke="none" opacity="{.95 if k<2 else .55}"/>' for k, h in enumerate([34, 34, 52, 52, 52])) + '<path d="M54 18 V104" stroke-dasharray="3 5" stroke-opacity=".6"/>'),
    'grain': ic(f'<g class="v2-tourne-lent" style="animation-duration:14s"><ellipse cx="60" cy="60" rx="30" ry="40" fill="rgba(239,199,156,.1)"/><path d="M60 22 Q46 60 60 98" /></g>'),
}

CARTES_FOND = {
    'v60': 'linear-gradient(160deg,#5a3a26 0%,#24180f 75%)', 'eau': 'linear-gradient(160deg,#3d4f4a 0%,#1d1915 75%)',
    'moulin': 'linear-gradient(160deg,#4f3a2c 0%,#1f1610 75%)', 'ratio': 'linear-gradient(160deg,#6b4a2f 0%,#24180f 75%)',
    'espresso': 'linear-gradient(160deg,#5b2e1c 0%,#1d130d 75%)', 'temperature': 'linear-gradient(160deg,#6d3a24 0%,#21150e 75%)',
    'lait': 'linear-gradient(160deg,#5e4a3c 0%,#1f1610 75%)', 'quatre-six': 'linear-gradient(160deg,#4b5a45 0%,#1b1712 75%)',
    'grain': 'linear-gradient(160deg,#7a4a2c 0%,#24180f 75%)',
}

# ── Icônes des envies (viewBox 48×48, trait foncé) ─────────────────────────
def ie(c):
    return f'<svg viewBox="0 0 48 48" fill="none" stroke="#2b1d15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{c}</svg>'
ENVIES_ICONES = {
    'filtre': ie('<path d="M8 12 H40 L28 30 H20 Z"/><path d="M18 38 H30"/><circle class="v2-goutte" style="--h:6px" cx="24" cy="32" r="1.8" fill="#b8401f" stroke="none"/>'),
    'espresso': ie('<path d="M10 20 H34 V28 Q34 38 22 38 Q10 38 10 28 Z"/><path d="M34 23 Q41 23 41 28 Q41 33 34 33"/><path class="v2-vapeur" d="M18 16 q-3 -4 0 -9 M26 16 q-3 -4 0 -9" stroke="#b8401f"/>'),
    'monde': ie('<circle cx="24" cy="24" r="16"/><g class="v2-tourne-lent" style="transform-origin:24px 24px;animation-duration:12s"><path d="M24 8 Q14 24 24 40 Q34 24 24 8"/></g><path d="M8 24 H40"/><path d="M11 16 H37 M11 32 H37" stroke-opacity=".5"/>'),
    'glace': ie('<path d="M12 10 H36 L33 40 H15 Z"/><rect class="v2-flotte" x="17" y="18" width="8" height="8" rx="2"/><rect class="v2-flotte" style="animation-delay:1s" x="25" y="24" width="8" height="8" rx="2"/>'),
    'materiel': ie('<rect x="14" y="20" width="20" height="20" rx="3"/><path d="M18 20 L20 12 H28 L30 20"/><g class="v2-tourne-vite" style="transform-origin:24px 8px;animation-duration:4s"><path d="M24 8 H34"/></g>'),
}

# ── Carte des origines (projection équirectangulaire 720×360) ─────────────
ORIGINES = [
    ('ethiopie', 'Éthiopie', 7.9, 38.7, '/journal/cafe-ethiopien-yirgacheffe-sidama-guji', 'Yirgacheffe, Sidama, Guji', -1),
    ('kenya', 'Kenya', -0.4, 36.9, '/journal/cafe-kenya-guide', 'Nyeri, SL28, grade AA', 1),
    ('colombie', 'Colombie', 4.6, -74.1, '/journal/cafe-colombie-specialite', 'Huila, Nariño, Cauca', 2),
    ('bresil', 'Brésil', -18.5, -44.5, '/journal/cafe-bresil-specialite', 'Cerrado Mineiro, Yellow Bourbon', 1),
    ('guatemala', 'Guatemala', 14.6, -90.5, '/journal/cafe-guatemala-specialite', 'Antigua, Huehuetenango', -2),
    ('indonesie', 'Indonésie', 2.5, 98.5, '/journal/cafe-indonesie-specialite', 'Sumatra, Java, Bali', 1),
    ('vietnam', 'Vietnam', 11.9, 108.4, '/journal/cafe-au-vietnam', 'Robusta, phin, Da Lat', 2),
    ('thailande', 'Thaïlande', 20.1, 99.8, '/journal/cafe-en-thailande', 'Doi Chang, arabica de montagne', -2),
]
def xy(lat, lon):
    return (lon + 180) / 360 * 720, (90 - lat) / 180 * 360

# ── Continents simplifiés (lon, lat), projection équirectangulaire ─────────
TERRES = {
 'amerique_nord': [(-166,68),(-156,71),(-140,70),(-128,70),(-115,68),(-100,68),(-95,72),(-85,70),(-82,66),(-90,63),(-94,59),(-92,57),(-85,55),(-80,52),(-78,56),(-77,60),(-72,62),(-65,60),(-61,56),(-56,52),(-60,47),(-65,44),(-70,42),(-74,40),(-76,37),(-76,35),(-81,31),(-80,26),(-81,25),(-82,27),(-84,30),(-89,30),(-94,29),(-97,27),(-97,22),(-95,19),(-91,19),(-90,21),(-87,21),(-88,16),(-84,15),(-83,11),(-80,9),(-77,8),(-80,7),(-83,8),(-86,11),(-88,13),(-92,14),(-95,16),(-100,17),(-105,20),(-106,23),(-110,23),(-112,27),(-115,30),(-117,33),(-121,35),(-124,40),(-124,46),(-125,49),(-130,54),(-134,58),(-140,60),(-147,61),(-152,59),(-158,57),(-163,55),(-158,58),(-162,60),(-165,62),(-166,66)],
 'groenland': [(-73,78),(-67,81),(-50,82),(-30,83),(-20,82),(-18,77),(-22,72),(-25,69),(-33,67),(-40,65),(-43,60),(-48,61),(-52,65),(-54,69),(-57,74),(-66,76)],
 'baffin': [(-80,73),(-72,72),(-65,67),(-62,66),(-68,63),(-75,65),(-80,69)],
 'cuba': [(-85,21.9),(-82,23.2),(-77.5,22.2),(-74.2,20.2),(-77.7,19.9),(-79.5,21.6),(-82,22.2)],
 'hispaniola': [(-74.5,18.4),(-72.8,19.9),(-70,19.7),(-68.4,18.6),(-70,18.2),(-71.4,17.6)],
 'amerique_sud': [(-77,8),(-75,11),(-72,12),(-68,11),(-63,11),(-60,8),(-57,6),(-52,5),(-50,2),(-50,0),(-48,-1),(-44,-2),(-40,-3),(-35,-6),(-35,-9),(-37,-12),(-39,-15),(-39,-18),(-41,-22),(-44,-23),(-48,-26),(-49,-29),(-53,-34),(-57,-36),(-57,-38),(-62,-39),(-65,-41),(-64,-43),(-67,-46),(-66,-48),(-69,-51),(-68,-53),(-70,-55),(-74,-52),(-75,-48),(-74,-44),(-73,-40),(-73,-35),(-71,-30),(-71,-24),(-70,-18),(-72,-17),(-76,-14),(-78,-10),(-80,-6),(-81,-4),(-80,-1),(-80,1),(-78,2),(-77,4),(-77,7)],
 'afrique': [(-17,21),(-16,24),(-14,27),(-10,29),(-9,32),(-6,35),(-2,35),(3,37),(10,37),(11,34),(15,32),(19,30),(20,32),(23,33),(25,32),(29,31),(32,31),(33,28),(35,24),(37,20),(38,18),(39,15),(42,13),(43,12),(44,11),(51,12),(51,10),(49,7),(46,3),(42,-1),(40,-3),(39,-7),(40,-11),(40,-15),(37,-17),(35,-20),(35,-24),(33,-26),(32,-29),(28,-33),(25,-34),(20,-35),(18,-34),(18,-31),(16,-28),(14,-23),(12,-18),(12,-13),(13,-9),(12,-5),(9,-1),(9,2),(9,4),(6,4),(3,6),(0,5),(-3,5),(-5,5),(-8,4),(-11,6),(-13,8),(-15,11),(-17,13),(-17,15),(-16,18)],
 'madagascar': [(49,-12),(50,-15),(49,-20),(47,-25),(45,-25),(44,-22),(44,-17),(47,-15)],
 'eurasie': [(-9,37),(-9,39),(-9,43),(-8,44),(-2,43),(-1,46),(-3,48),(-5,48),(-2,49),(1,50),(3,51),(5,53),(8,54),(8,57),(10,58),(11,56),(12,55),(14,55),(18,55),(20,55),(21,57),(24,58),(23,60),(28,60),(25,61),(21,61),(21,63),(25,65),(22,66),(18,63),(17,61),(19,60),(17,57),(16,56),(13,55.4),(12,58),(10,59),(6,58),(5,61),(7,63),(12,66),(15,68),(20,70),(26,71),(31,70),(33,69),(41,67),(44,68),(54,69),(60,70),(68,71),(68,73),(72,73),(76,72),(80,73),(87,75),(98,76),(105,78),(112,76),(120,73),(130,71),(140,72),(150,71),(160,70),(170,70),(180,69),(180,65),(178,63),(172,61),(165,60),(162,57),(160,53),(156,51),(156,57),(160,61),(155,60),(150,59),(142,59),(137,55),(141,52),(140,48),(138,46),(133,43),(130,42),(129,40),(129,36),(127,35),(126,37),(125,39),(121,39),(122,40),(119,39),(118,38),(120,37),(122,37),(119,35),(121,32),(122,30),(120,27),(117,24),(114,22),(110,21),(108,21),(106,19),(108,15),(109,12),(107,10),(105,9),(104,10),(103,11),(101,13),(100,12),(99,10),(100,7),(102,6),(103,4),(104,1),(103,1),(101,3),(100,5),(98,8),(98,11),(97,16),(95,16),(94,18),(93,20),(92,22),(90,22),(88,22),(87,21),(85,19),(82,17),(80,15),(80,12),(79,9),(77,8),(76,10),(75,13),(73,17),(73,20),(72,22),(70,22),(68,24),(66,25),(62,25),(58,25),(57,27),(54,27),(51,28),(49,30),(48,30),(50,26),(51,25),(52,24),(56,24),(56,26),(57,23),(59,22),(57,19),(55,17),(52,16),(48,14),(45,13),(43,13),(42,16),(39,21),(37,25),(35,28),(34.5,29.5),(34,31),(35,33),(36,35),(36,37),(33,36),(30,36),(28,37),(27,38),(26,40),(23,40),(23,38),(22,37),(21,38),(20,40),(19,42),(16,43),(14,45),(13,45),(12,44),(14,42),(16,41),(18,40),(16,38),(15,40),(12,42),(10,44),(8,44),(6,43),(3,43),(3,42),(1,41),(0,40),(-1,38),(-2,37),(-5,36),(-7,37)],
 'mer_noire': [(28,41),(28,43),(30,45),(33,45),(35,45),(37,45),(39,44),(41,42),(38,41),(35,42),(31,41)],
 'caspienne': [(47,45),(50,47),(53,46),(54,42),(53,40),(54,37),(51,37),(49,38),(50,40),(48,42)],
 'grande_bretagne': [(-5.7,50),(-3,50.6),(1.4,51.2),(1.7,52.7),(0.2,53.5),(-0.5,54.5),(-2,55.8),(-1.8,57.6),(-4,58.6),(-5,58.6),(-6.2,57),(-5.6,55.4),(-4.8,54.8),(-3,54),(-3,53.4),(-4.6,53.3),(-4.2,52.3),(-5.3,51.8),(-3.4,51.4)],
 'irlande': [(-10,51.6),(-6.2,52.2),(-6,53.4),(-5.5,54.6),(-7.3,55.3),(-8.5,54.5),(-10,54),(-9.5,53)],
 'islande': [(-24,65.5),(-22,66.4),(-16,66.5),(-13.5,65.2),(-15,64.3),(-19,63.4),(-22.5,63.8)],
 'honshu': [(130,31),(131.5,31.5),(132,33.5),(135,33.5),(136.8,34.5),(139.8,35),(141,36.5),(141.5,38.5),(142,40),(141.4,41.5),(140,40.8),(139.8,39),(138.5,37.8),(136.7,37.3),(136,35.7),(133,35.5),(131,34.5),(129.7,33.2)],
 'hokkaido': [(140,41.5),(141,41.8),(143.3,42),(145.5,43.3),(144.2,44),(142,45.4),(141.6,45),(141.4,43.3),(140,42.8)],
 'sri_lanka': [(79.8,6),(80,9.8),(81,8.5),(81.8,7),(81,6)],
 'taiwan': [(120.2,22.5),(121,25.3),(122,25),(121,22.3)],
 'luzon': [(120,18.5),(122.3,18.4),(122,16.5),(121.5,14.5),(124,13),(123,13.5),(120.6,14.3),(120,16)],
 'mindanao': [(122,7),(125.5,9.5),(126.6,7.3),(125.4,5.7),(123.8,7.6)],
 'sumatra': [(95.3,5.6),(97.5,5.2),(100.3,2.3),(103.7,-1),(106,-3.2),(105.9,-5.8),(104.5,-5.9),(102,-3.6),(100.3,-0.5),(98.7,1.7)],
 'java': [(105.2,-6.8),(106.5,-6),(108.3,-6.3),(110.4,-6.9),(112.6,-6.9),(114.4,-7.8),(114.4,-8.7),(111,-8.2),(108,-7.8)],
 'borneo': [(109,1.6),(109.6,-1.2),(110.2,-2.9),(114.5,-4),(116.5,-3.5),(116.1,-1),(117.6,0.8),(119,4.9),(117.2,7),(116.1,6.1),(114,4.6),(111,2),(109.6,2)],
 'sulawesi': [(119,-5.5),(120.5,-5.5),(120.4,-2.8),(121.5,-1.8),(123.3,-1),(121,-1),(120.5,0.5),(124.8,1.5),(124.3,0.4),(120.2,0.3),(119.7,-1),(118.8,-3)],
 'nouvelle_guinee': [(131,-1),(134,-0.8),(138,-1.7),(141,-2.6),(145,-4.5),(147.5,-6),(150.5,-10.5),(147,-10.2),(144,-7.7),(141,-9),(138.8,-8.2),(137.8,-5.5),(135,-4.4),(133,-4),(132,-2.8)],
 'australie': [(113.6,-22),(114.2,-26.3),(115,-30),(115.1,-33.6),(117.9,-35.1),(122,-33.9),(124,-33),(126.2,-32.2),(129,-31.6),(131.2,-31.5),(134.2,-32.6),(135.9,-34.8),(137.8,-32.9),(138,-35.6),(140,-37.9),(143.6,-38.8),(146.3,-39.1),(148.3,-37.8),(150,-37.4),(151.3,-33.5),(153.6,-28.4),(153.1,-25.3),(150.8,-22.6),(149,-20.4),(146.3,-19),(145.4,-15),(143.6,-14),(142.5,-10.7),(141.5,-13.5),(141.6,-17),(140,-17.7),(136.9,-15.9),(135.5,-14.7),(136.8,-12.3),(132.6,-11.5),(131,-12.2),(129.4,-14.9),(127.8,-14.2),(125.3,-14.6),(122.2,-17.5),(121,-19.5),(117.4,-20.7),(114.6,-21.8)],
 'tasmanie': [(144.7,-40.7),(148.3,-40.9),(148,-43.2),(146.5,-43.6),(145,-42.3)],
 'nz_nord': [(172.7,-34.4),(174.6,-36),(175.9,-37.6),(178.5,-37.7),(177.9,-39.2),(176.2,-41.3),(174.7,-41.3),(175.2,-40),(173.8,-39.2),(174.6,-37.7)],
 'nz_sud': [(172.7,-40.5),(174.3,-41.5),(173,-43.8),(171,-44.9),(169.4,-46.6),(166.5,-46),(166.7,-45.2),(168.4,-44),(170.6,-42.9),(172.1,-41.4)],
}
def terres_d():
    """Toutes les terres en un seul chemin ; mer Noire et Caspienne évidées (evenodd)."""
    d = ''
    for pts in TERRES.values():
        d += 'M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in (xy(la, lo) for lo, la in pts)) + 'Z'
    return d

def carte_monde():
    g = ''
    for lon in range(-150, 181, 30):
        x, _ = xy(0, lon); g += f'<line x1="{x:.1f}" y1="20" x2="{x:.1f}" y2="340" stroke="rgba(244,236,227,.07)"/>'
    for lat in (60, 30, -30, -60):
        _, y = xy(lat, 0); g += f'<line x1="0" y1="{y:.1f}" x2="720" y2="{y:.1f}" stroke="rgba(244,236,227,.07)"/>'
    _, yt = xy(23.44, 0); _, yc = xy(-23.44, 0); _, ye = xy(0, 0)
    bande = (f'<rect x="0" y="{yt:.1f}" width="720" height="{yc-yt:.1f}" fill="rgba(239,199,156,.08)"/>'
             f'<line x1="0" y1="{yt:.1f}" x2="720" y2="{yt:.1f}" stroke="{CR}" stroke-opacity=".5" stroke-dasharray="4 6"/>'
             f'<line x1="0" y1="{yc:.1f}" x2="720" y2="{yc:.1f}" stroke="{CR}" stroke-opacity=".5" stroke-dasharray="4 6"/>'
             f'<line x1="0" y1="{ye:.1f}" x2="720" y2="{ye:.1f}" stroke="rgba(244,236,227,.22)"/>'
             f'<text x="10" y="{yt-8:.1f}" fill="{CR}" font-family="Instrument Sans, Arial" font-size="11" letter-spacing="1.5">TROPIQUE DU CANCER</text>'
             f'<text x="10" y="{yc+18:.1f}" fill="{CR}" font-family="Instrument Sans, Arial" font-size="11" letter-spacing="1.5">TROPIQUE DU CAPRICORNE</text>'
             f'<text x="710" y="{ye-8:.1f}" fill="rgba(244,236,227,.5)" font-family="Instrument Sans, Arial" font-size="11" text-anchor="end" letter-spacing="1.5">ÉQUATEUR</text>')
    pts = ''
    for k, (cle, nom, lat, lon, _l, _s, cote) in enumerate(ORIGINES):
        x, y = xy(lat, lon)
        dx, dy, ancre = {-1: (0, -12, 'middle'), 1: (0, 22, 'middle'), 2: (11, 4, 'start'), -2: (-11, 4, 'end')}[cote]
        pts += (f'<g class="point" id="point-{cle}"><circle class="v2-onde" style="animation-delay:{k*.3:.1f}s" cx="{x:.1f}" cy="{y:.1f}" r="4" fill="none" stroke="{CR}"/>'
                f'<circle class="coeur" cx="{x:.1f}" cy="{y:.1f}" r="5"/><text x="{x+dx:.1f}" y="{y+dy:.1f}" text-anchor="{ancre}">{nom}</text></g>')
    terre = f'<path d="{terres_d()}" fill="rgba(244,236,227,.1)" stroke="rgba(244,236,227,.26)" stroke-width=".7" stroke-linejoin="round" fill-rule="evenodd"/>'
    return f'<svg viewBox="0 26 720 268" role="img" aria-label="Ceinture du café entre les tropiques et huit origines">{g}{terre}{bande}{pts}</svg>'

# ── Scène 404 ─────────────────────────────────────────────────────────────
def machine_404():
    """404 : machine « filtré. modèle 404 », porte-filtre, tasse sur balance à deux afficheurs."""
    graduations = ''
    import math
    for k in range(13):
        a = math.radians(-120 + k * 20)
        x1, y1 = 112 + 31 * math.sin(a), 88 - 31 * math.cos(a)
        x2, y2 = 112 + (25 if k % 3 else 22) * math.sin(a), 88 - (25 if k % 3 else 22) * math.cos(a)
        graduations += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#efc79c" stroke-width="{2 if k % 3 == 0 else 1.2}" stroke-opacity="{.9 if k in (8, 9) else .55}"/>'
    return f'''<svg class="v2-err__svg" viewBox="0 0 520 600" role="img" aria-label="Machine à espresso filtré. modèle 404, tasse posée sur une balance qui affiche 404">
<defs>
  <clipPath id="v2-tasse-clip"><path d="M196 352 H324 L314 452 Q311 470 292 470 H228 Q209 470 206 452 Z"/></clipPath>
  <linearGradient id="v2-cafe-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset=".16" stop-color="#94532b"/><stop offset="1" stop-color="#3b1d0f"/></linearGradient>
</defs>
<path d="M40 120 V470 Q40 486 56 486 H112 V120 Z" fill="#2b1d15" stroke="#efc79c" stroke-width="3" stroke-linejoin="round"/>
<path d="M58 210 V420" stroke="rgba(239,199,156,.25)" stroke-width="2" stroke-linecap="round"/><path d="M76 210 V420" stroke="rgba(239,199,156,.12)" stroke-width="2" stroke-linecap="round"/>
<rect x="40" y="24" width="440" height="128" rx="22" fill="#2b1d15" stroke="#efc79c" stroke-width="3"/>
<circle cx="112" cy="88" r="38" fill="#1f1610" stroke="#efc79c" stroke-width="3"/>
{graduations}
<g id="v2-aiguille" class="v2-err__aiguille"><path d="M112 92 L112 62" stroke="#e0673f" stroke-width="3" stroke-linecap="round"/></g>
<circle cx="112" cy="88" r="5" fill="#efc79c"/>
<text x="112" y="140" font-family="Instrument Sans, Arial" font-size="10" letter-spacing="2" fill="rgba(239,199,156,.6)" text-anchor="middle">BAR</text>
<text x="310" y="84" font-family="Newsreader, Georgia" font-size="38" font-style="italic" fill="#efc79c" text-anchor="middle">filtré<tspan fill="#e0673f">.</tspan></text>
<text x="310" y="112" font-family="Instrument Sans, Arial" font-size="11" letter-spacing="3.5" fill="rgba(239,199,156,.6)" text-anchor="middle">MODÈLE 404</text>
<circle id="v2-voyant" cx="446" cy="52" r="6" fill="#4b6b4f"/>
<path d="M205 152 H315 L305 176 H215 Z" fill="#33251b" stroke="#efc79c" stroke-width="3" stroke-linejoin="round"/>
<path d="M210 176 H310 V196 Q310 210 296 210 H224 Q210 210 210 196 Z" fill="#45362c" stroke="#efc79c" stroke-width="3" stroke-linejoin="round"/>
<rect x="306" y="182" width="172" height="16" rx="8" fill="#2b1d15" stroke="#efc79c" stroke-width="3"/>
<path d="M244 210 v14 M276 210 v14" stroke="#efc79c" stroke-width="6" stroke-linecap="round"/>
<path class="v2-err__filet" d="M244 228 V452" stroke="#7a3f1d" stroke-linecap="round"/>
<path class="v2-err__filet" d="M276 228 V452" stroke="#7a3f1d" stroke-linecap="round"/>
<g clip-path="url(#v2-tasse-clip)"><rect id="v2-liquide" class="v2-err__liquide" x="190" y="352" width="140" height="120" fill="url(#v2-cafe-grad)"/></g>
<path d="M196 352 H324 L314 452 Q311 470 292 470 H228 Q209 470 206 452 Z" fill="rgba(239,199,156,.06)" stroke="#efc79c" stroke-width="3" stroke-linejoin="round"/>
<path d="M321 372 Q354 372 352 398 Q350 424 316 426" fill="none" stroke="#efc79c" stroke-width="3" stroke-linecap="round"/>
<rect x="100" y="472" width="316" height="14" rx="5" fill="#33251b" stroke="#efc79c" stroke-width="3"/>
<rect x="140" y="486" width="240" height="84" rx="14" fill="#1f1610" stroke="#efc79c" stroke-width="3"/>
<rect x="156" y="500" width="112" height="48" rx="6" fill="#120c08"/>
<rect x="276" y="500" width="88" height="48" rx="6" fill="#120c08"/>
<text id="v2-poids" class="v2-err__led" x="258" y="534" text-anchor="end">404</text>
<text id="v2-chrono" class="v2-err__led v2-err__led--doux" x="354" y="534" text-anchor="end">--.-</text>
<text x="212" y="563" font-family="Instrument Sans, Arial" font-size="10" letter-spacing="2" fill="rgba(239,199,156,.55)" text-anchor="middle">GRAMMES</text>
<text x="320" y="563" font-family="Instrument Sans, Arial" font-size="10" letter-spacing="2" fill="rgba(239,199,156,.55)" text-anchor="middle">SECONDES</text>
</svg>'''
