/* filtré. v2 : interactions et schémas animés (version test). Aucune dépendance. */
(function () {
  'use strict';
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── En-tête : méga-menus au clic (tactile) et tiroir mobile ── */
  $$('.v2-nav__item > button.v2-nav__lien').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var it = b.parentNode, etait = it.classList.contains('ouvert');
      $$('.v2-nav__item.ouvert').forEach(function (x) { x.classList.remove('ouvert'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
      if (!etait) { it.classList.add('ouvert'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.v2-nav__item')) $$('.v2-nav__item.ouvert').forEach(function (x) { x.classList.remove('ouvert'); });
  });
  // Survol d'une autre catégorie : le panneau ouvert (clic ou focus) se ferme aussitôt, un seul à la fois.
  $$('.v2-nav__item').forEach(function (it) {
    it.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      $$('.v2-nav__item').forEach(function (x) {
        if (x === it) return;
        if (x.classList.contains('ouvert')) { x.classList.remove('ouvert'); x.firstElementChild.setAttribute('aria-expanded', 'false'); }
        if (x.contains(document.activeElement)) document.activeElement.blur();
      });
    });
  });
  var tiroir = $('#v2-tiroir');
  function tiroirOuvrir() { if (!tiroir) return; tiroir.classList.add('ouvert'); document.body.style.overflow = 'hidden'; }
  function tiroirFermer() { if (!tiroir) return; tiroir.classList.remove('ouvert'); document.body.style.overflow = ''; }
  $$('[data-v2-tiroir]').forEach(function (b) { b.addEventListener('click', tiroirOuvrir); });
  $$('[data-v2-fermer]').forEach(function (b) { b.addEventListener('click', tiroirFermer); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { tiroirFermer(); $$('.v2-nav__item.ouvert').forEach(function (x) { x.classList.remove('ouvert'); }); }
  });

  /* ── Héros : scènes qui tournent ── */
  var scenes = $$('.v2-scene');
  if (scenes.length) {
    var i = 0, minuterie = null;
    var num = $('#v2-legende-num'), titre = $('#v2-legende-titre'), sous = $('#v2-legende-sous'), barre = $('#v2-legende-barre');
    function montrer(n) {
      scenes[i].classList.remove('actif');
      i = (n + scenes.length) % scenes.length;
      var s = scenes[i]; s.classList.add('actif');
      if (num) num.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(scenes.length).padStart(2, '0');
      if (titre) titre.textContent = s.dataset.titre || '';
      if (sous) sous.innerHTML = s.dataset.sous || '';
      if (barre) { barre.classList.remove('joue'); void barre.offsetWidth; if (!reduit) barre.classList.add('joue'); }
    }
    function lancer() { if (reduit) return; clearInterval(minuterie); minuterie = setInterval(function () { montrer(i + 1); }, 7000); }
    var prec = $('#v2-legende-prec'), suiv = $('#v2-legende-suiv');
    if (prec) prec.addEventListener('click', function () { montrer(i - 1); lancer(); });
    if (suiv) suiv.addEventListener('click', function () { montrer(i + 1); lancer(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(minuterie); else lancer(); });
    montrer(0); lancer();
  }

  /* ── Rail des incontournables ── */
  $$('[data-v2-rail]').forEach(function (bloc) {
    var rail = $('.v2-rail', bloc), progres = $('.v2-rail__progres i', bloc);
    if (!rail) return;
    function maj() {
      var max = rail.scrollWidth - rail.clientWidth;
      var part = rail.clientWidth / rail.scrollWidth;
      if (progres) { progres.style.width = (part * 100) + '%'; progres.style.left = (max > 0 ? (rail.scrollLeft / max) * (100 - part * 100) : 0) + '%'; }
    }
    rail.addEventListener('scroll', maj, { passive: true }); window.addEventListener('resize', maj); maj();
    var pas = function () { var c = $('.v2-carte', rail); return c ? c.getBoundingClientRect().width + 18 : 320; };
    var p = $('[data-v2-prec]', bloc), s = $('[data-v2-suiv]', bloc);
    if (p) p.addEventListener('click', function () { rail.scrollBy({ left: -pas(), behavior: reduit ? 'auto' : 'smooth' }); });
    if (s) s.addEventListener('click', function () { rail.scrollBy({ left: pas(), behavior: reduit ? 'auto' : 'smooth' }); });
  });

  /* ── Carte des origines : survol de la liste ── */
  $$('[data-origine]').forEach(function (lien) {
    var id = lien.getAttribute('data-origine');
    function points() { return $$('#point-' + id + ', [data-point="' + id + '"]'); }
    function on() { points().forEach(function (d) { d.classList.add('allume'); }); }
    function off() { points().forEach(function (d) { d.classList.remove('allume'); }); }
    lien.addEventListener('mouseenter', on); lien.addEventListener('mouseleave', off);
    lien.addEventListener('focus', on); lien.addEventListener('blur', off);
  });

  /* ── Schémas animés ── */
  var CSS_SCHEMAS = [
    '.v2-anim *{animation-play-state:paused}', '.v2-anim.joue *{animation-play-state:running}',
    '@keyframes v2-trace{from{stroke-dashoffset:var(--l,600)}to{stroke-dashoffset:0}}',
    '@keyframes v2-balaye{from{transform:translateX(0)}to{transform:translateX(var(--d,600px))}}',
    '@keyframes v2-pousse{from{transform:scaleY(0)}to{transform:scaleY(1)}}',
    '@keyframes v2-pousse-x{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
    '@keyframes v2-apparait{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '@keyframes v2-goutte{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(var(--h,60px));opacity:0}}',
    '@keyframes v2-bulle{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-46px);opacity:0}}',
    '@keyframes v2-pulse{0%,100%{r:5}50%{r:9}}',
    '@keyframes v2-tombe{from{transform:translateY(-26px);opacity:0}to{transform:none;opacity:1}}',
    '.v2-anim .trace{stroke-dasharray:var(--l,600);stroke-dashoffset:var(--l,600);animation:v2-trace 2.4s cubic-bezier(.4,0,.2,1) forwards}',
    '.v2-anim .apparait{opacity:0;animation:v2-apparait .6s ease forwards}',
    '.v2-anim .pousse{transform-box:fill-box;transform-origin:bottom;transform:scaleY(0);animation:v2-pousse 1.2s cubic-bezier(.2,.8,.2,1) forwards}',
    '.v2-anim .pousse-x{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:v2-pousse-x 1.2s cubic-bezier(.2,.8,.2,1) forwards}',
    '.v2-anim .tombe{opacity:0;animation:v2-tombe .7s cubic-bezier(.2,.8,.2,1) forwards}',
    '.v2-anim .v2-svg-etroit{display:none}',
    '@media (max-width:640px){.v2-anim .v2-svg-large{display:none}.v2-anim .v2-svg-etroit{display:block}}'
  ].join('\n');
  function injecterCss() {
    if (document.getElementById('v2-schemas-css')) return;
    var st = document.createElement('style'); st.id = 'v2-schemas-css'; st.textContent = CSS_SCHEMAS; document.head.appendChild(st);
  }
  /* Typographie française des légendes (injectées ici, elles ne passent pas par typo() au build). */
  function fines(t) {
    return t.replace(/(?:&nbsp;|\u00a0)(?=[?!;])/g, '\u202f').replace(/ ([;?!])/g, '\u202f$1').replace(/ ([:\u00bb])/g, '\u00a0$1').replace(/\u00ab /g, '\u00ab\u00a0').replace(/(\d)\u2013(?=\d)/g, '$1\u2013\u2060')
      .replace(/(\d) (g|kg|ml|cl|L|°C|s|min|mm|%|€)(?![A-Za-zÀ-ÿ])/g, '$1\u00a0$2');
  }
  function fig(cle, titre, etiquette, svg, legende) {
    legende = legende ? fines(legende) : legende;
    var etroit = ETROITS[cle] ? ETROITS[cle]() : '';
    if (etroit) svg = svg.replace('<svg ', '<svg class="v2-svg-large" ');
    return '<figure class="v2-schema" data-cle="' + cle + '"><div class="v2-schema__tete"><div><span>' + etiquette + '</span><h3>' + titre + '</h3></div>' +
      '<button type="button" class="rejouer">Rejouer l’animation</button></div><div class="v2-anim">' + svg + etroit + '</div>' +
      (legende ? '<figcaption>' + legende + '</figcaption>' : '') + '</figure>';
  }
  var C = { crema: '#efc79c', cerise: '#e0673f', feuille: '#8fb08f', cuivre: '#c98a5c', texte: '#f4ece3', doux: 'rgba(244,236,227,.55)', filet: 'rgba(244,236,227,.18)', douxE: 'rgba(244,236,227,.72)' };

  /* Versions étroites des schémas, affichées sous 640 px : viewBox de 360 de large,
     texte d'au moins 13 unités (environ 11,5 px réels dans une colonne de téléphone). */
  function svgE(h, label, contenu) { return '<svg class="v2-svg-etroit" viewBox="0 0 360 ' + h + '" role="img" aria-label="' + label + '">' + contenu + '</svg>'; }
  function mmss(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  var ETROITS = {
    extraction: function () {
      var x0 = 20, x1 = 340, y0 = 170, y1 = 14;
      var courbe = function (debut, pente) { var d = ''; for (var k = 0; k <= 40; k++) { var t = k / 40, x = x0 + (x1 - x0) * t, v = 1 / (1 + Math.exp(-(t - debut) * pente)); d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 - (y0 - y1) * v * 0.85).toFixed(1); } return d; };
      var zones = '<rect x="20" y="' + y1 + '" width="100" height="' + (y0 - y1) + '" fill="rgba(143,176,143,.10)"/><rect x="120" y="' + y1 + '" width="115" height="' + (y0 - y1) + '" fill="rgba(239,199,156,.12)"/><rect x="235" y="' + y1 + '" width="105" height="' + (y0 - y1) + '" fill="rgba(224,103,63,.12)"/>' +
        '<text x="70" y="27" fill="' + C.feuille + '" font-size="16" font-weight="700" text-anchor="middle">1</text><text x="177" y="27" fill="' + C.crema + '" font-size="16" font-weight="700" text-anchor="middle">2</text><text x="287" y="27" fill="' + C.cerise + '" font-size="16" font-weight="700" text-anchor="middle">3</text>';
      var axes = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" stroke="' + C.filet + '"/>' +
        '<text x="' + x0 + '" y="190" fill="' + C.douxE + '" font-size="15">Plus court, plus grossier</text><text x="' + x1 + '" y="208" fill="' + C.douxE + '" font-size="15" text-anchor="end">Plus long, plus fin</text>';
      var c = '<path class="trace" style="--l:520" d="' + courbe(0.12, 14) + '" fill="none" stroke="' + C.feuille + '" stroke-width="3"/>' +
        '<path class="trace" style="--l:520;animation-delay:.5s" d="' + courbe(0.45, 12) + '" fill="none" stroke="' + C.crema + '" stroke-width="3"/>' +
        '<path class="trace" style="--l:520;animation-delay:1s" d="' + courbe(0.78, 12) + '" fill="none" stroke="' + C.cerise + '" stroke-width="3"/>';
      var curseur = '<g style="animation:v2-balaye 6s 2.6s ease-in-out infinite alternate;--d:280px"><line x1="' + (x0 + 10) + '" y1="' + (y1 + 34) + '" x2="' + (x0 + 10) + '" y2="' + y0 + '" stroke="' + C.texte + '" stroke-dasharray="3 5"/><circle cx="' + (x0 + 10) + '" cy="' + y0 + '" r="6" fill="' + C.texte + '"/></g>';
      var leg = '<g font-size="14"><circle cx="26" cy="231" r="5" fill="' + C.feuille + '"/><text x="38" y="236" fill="' + C.texte + '">acides</text><circle cx="114" cy="231" r="5" fill="' + C.crema + '"/><text x="126" y="236" fill="' + C.texte + '">sucres</text><circle cx="202" cy="231" r="5" fill="' + C.cerise + '"/><text x="214" y="236" fill="' + C.texte + '">composés amers</text></g>';
      var rangs = [[C.feuille, '1 · Sous-extrait', 'acide, salé, maigre'], [C.crema, '2 · Équilibré', 'sucré, rond, long'], [C.cerise, '3 · Sur-extrait', 'amer, sec, astringent']].map(function (r, k) {
        return '<text x="20" y="' + (268 + k * 22) + '" font-size="14"><tspan fill="' + r[0] + '" font-weight="600">' + r[1] + '</tspan><tspan fill="' + C.douxE + '"> — ' + r[2] + '</tspan></text>';
      }).join('');
      return svgE(326, 'Courbes d’extraction : acides, puis sucres, puis composés amers', zones + axes + c + curseur + leg + rangs);
    },
    v60: function () {
      var etapes = [
        { a: 0, b: 30, g: 30, n: 'Bloom' }, { a: 30, b: 60, g: 150, n: '1er versement' }, { a: 60, b: 90, g: 200, n: '2e versement' },
        { a: 90, b: 120, g: 250, n: 'Versement final' }, { a: 120, b: 195, g: 250, n: 'Écoulement' }];
      var lignes = etapes.map(function (e, k) {
        var y = 14 + k * 50, w = e.g / 250 * 172, d = (0.3 + k * 0.4).toFixed(1);
        var fond = k === 4 ? 'rgba(239,199,156,.22)' : (k === 0 ? C.feuille : C.crema);
        return '<g class="apparait" style="animation-delay:' + d + 's"><text x="0" y="' + (y + 16) + '" fill="' + C.texte + '" font-size="14.5" font-weight="600">' + e.n + '</text>' +
          '<text x="0" y="' + (y + 34) + '" fill="' + C.douxE + '" font-size="15">' + mmss(e.a) + ' – ' + mmss(e.b) + '</text>' +
          '<rect class="pousse-x" style="animation-delay:' + d + 's" x="128" y="' + (y + 4) + '" width="' + w.toFixed(1) + '" height="20" rx="5" fill="' + fond + '"/>' +
          (k === 4 ? '<text x="128" y="' + (y + 42) + '" fill="' + C.cerise + '" font-size="15" font-weight="600">fin entre 2:30 et 3:30</text>' : '<text x="' + (128 + w + 8).toFixed(1) + '" y="' + (y + 19) + '" fill="' + C.texte + '" font-size="14" font-weight="600">' + e.g + ' g</text>') + '</g>';
      }).join('');
      return svgE(272, 'Chronologie de la recette V60', lignes);
    },
    mouture: function () {
      var m = [
        { n: 'Espresso', d: 'fine', r: 2.2 }, { n: 'V60', d: 'médium-fine, sucre semoule', r: 3.4 }, { n: 'Moka', d: 'médium', r: 4.2 },
        { n: 'Piston', d: 'grossière', r: 5.6 }, { n: 'Cold brew', d: 'très grossière, sucre gros', r: 7 }];
      var lignes = m.map(function (e, k) {
        var y = 32 + k * 54, cx = 34, cy = y + 20, pts = '';
        for (var j = 0; j < 14; j++) {
          var a = (j * 137.5) * Math.PI / 180, rr = 4 + 18 * Math.sqrt(j / 14), x = cx + rr * Math.cos(a), yy = cy + rr * Math.sin(a) * 0.9;
          pts += '<circle class="tombe" style="animation-delay:' + (k * 0.25 + j * 0.03).toFixed(2) + 's" cx="' + x.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="' + (e.r * 0.72).toFixed(2) + '" fill="' + C.cuivre + '"/>';
        }
        return '<g>' + pts + '<text x="80" y="' + (y + 17) + '" fill="' + C.texte + '" font-size="15.5" font-weight="600">' + e.n + '</text><text x="80" y="' + (y + 36) + '" fill="' + C.douxE + '" font-size="15">' + e.d + '</text></g>';
      }).join('');
      var fl = '<text x="0" y="16" fill="' + C.douxE + '" font-size="15">Plus fin, extraction rapide</text><text x="0" y="324" fill="' + C.douxE + '" font-size="15">Plus grossier, contact long</text>' +
        '<line x1="344" y1="28" x2="344" y2="300" stroke="' + C.filet + '"/><path d="M339 294 L344 302 L349 294" fill="none" stroke="' + C.douxE + '"/>';
      return svgE(332, 'Taille de mouture par méthode, de l’espresso au cold brew', fl + lignes);
    },
    eau: function () {
      var eaux = [
        { n: 'Mont Blanc', v: 134, r: '1re ex æquo', c: C.crema }, { n: 'Volvic', v: 130, r: '1re ex æquo', c: C.crema },
        { n: 'Rocheval', v: 240, r: '3e', c: C.cuivre }, { n: 'Cristaline (Louise)', v: 477, r: '5e', c: C.cerise },
        { n: 'Mont Roucous', v: 33, r: 'non goûtée', c: 'rgba(244,236,227,.35)' }];
      var x0 = 0, x1 = 340, sx = function (v) { return x0 + (x1 - x0) * v / 500; };
      var bande = '<rect x="' + sx(75) + '" y="24" width="' + (sx(250) - sx(75)) + '" height="272" fill="rgba(143,176,143,.10)"/><text x="' + sx(162) + '" y="16" fill="' + C.feuille + '" font-size="15" font-weight="600" text-anchor="middle">SCAA : 75 à 250</text>' +
        '<line x1="' + sx(150) + '" y1="24" x2="' + sx(150) + '" y2="296" stroke="' + C.feuille + '" stroke-dasharray="4 5"/>';
      var lignes = eaux.map(function (e, k) {
        var y = 32 + k * 54;
        return '<text x="0" y="' + (y + 14) + '" fill="' + C.texte + '" font-size="14">' + e.n + '</text>' +
          '<text class="apparait" style="animation-delay:' + (1 + k * 0.25) + 's" x="340" y="' + (y + 14) + '" fill="' + C.texte + '" font-size="15" font-weight="600" text-anchor="end">' + e.v + ' mg/L · ' + e.r + '</text>' +
          '<rect class="pousse-x" style="animation-delay:' + (0.3 + k * 0.25) + 's" x="' + x0 + '" y="' + (y + 22) + '" width="' + (sx(e.v) - x0).toFixed(1) + '" height="16" rx="4" fill="' + e.c + '"/>';
      }).join('');
      var axe = [0, 100, 200, 300, 400, 500].map(function (v, k) { return '<text x="' + sx(v) + '" y="316" fill="' + C.douxE + '" font-size="15" text-anchor="' + (k === 0 ? 'start' : k === 5 ? 'end' : 'middle') + '">' + v + '</text>'; }).join('');
      return svgE(324, 'Résidu sec des eaux testées face à la plage SCAA', bande + lignes + axe);
    },
    degazage: function () {
      var x0 = 14, x1 = 346, sx = function (j) { return x0 + (x1 - x0) * j / 49; };
      var zones = '<text x="' + sx(7) + '" y="40" fill="' + C.crema + '" font-size="14" font-weight="600">Filtre : 7 à 14 j de repos</text><rect class="pousse-x" x="' + sx(7) + '" y="48" width="' + (sx(14) - sx(7)).toFixed(1) + '" height="26" rx="6" fill="' + C.crema + '"/>' +
        '<text x="' + sx(10) + '" y="104" fill="' + C.cuivre + '" font-size="14" font-weight="600">Espresso : 10 à 21 j</text><rect class="pousse-x" style="animation-delay:.4s" x="' + sx(10) + '" y="112" width="' + (sx(21) - sx(10)).toFixed(1) + '" height="26" rx="6" fill="' + C.cuivre + '"/>' +
        '<text x="' + sx(49) + '" y="168" fill="' + C.cerise + '" font-size="14" font-weight="600" text-anchor="end">les arômes fins s’estompent</text><rect class="pousse-x" style="animation-delay:.8s" x="' + sx(42) + '" y="176" width="' + (sx(49) - sx(42)).toFixed(1) + '" height="18" rx="6" fill="rgba(224,103,63,.55)"/>';
      var ticks = [0, 7, 14, 21, 28, 35, 42, 49].map(function (j, k) { return '<line x1="' + sx(j) + '" y1="212" x2="' + sx(j) + '" y2="218" stroke="' + C.douxE + '"/><text x="' + sx(j) + '" y="234" fill="' + C.douxE + '" font-size="15" text-anchor="' + (k === 0 ? 'start' : k === 7 ? 'end' : 'middle') + '">' + j + '</text>'; }).join('');
      var bulles = '';
      for (var b = 0; b < 10; b++) { var x = sx(0.6 + (b % 5) * 1.2), dl = (b * 0.37) % 3; bulles += '<circle cx="' + x.toFixed(1) + '" cy="200" r="' + (2 + (b % 3)) + '" fill="none" stroke="' + C.texte + '" stroke-opacity=".6" style="animation:v2-bulle 2.6s ' + dl.toFixed(2) + 's ease-out infinite"/>'; }
      return svgE(262, 'Fenêtres de repos après torréfaction', '<line x1="' + x0 + '" y1="212" x2="' + x1 + '" y2="212" stroke="' + C.filet + '"/>' + zones + bulles + '<text x="' + sx(1.5) + '" y="152" fill="' + C.douxE + '" font-size="15">CO₂</text>' + ticks + '<text x="180" y="254" fill="' + C.douxE + '" font-size="15" text-anchor="middle">jours après la torréfaction</text>');
    },
    espresso: function () {
      var x0 = 14, x1 = 346, sx = function (s) { return x0 + (x1 - x0) * s / 45; };
      var zones = '<rect x="' + sx(0) + '" y="30" width="' + (sx(22) - sx(0)).toFixed(1) + '" height="40" fill="rgba(143,176,143,.18)"/><rect x="' + sx(25) + '" y="30" width="' + (sx(30) - sx(25)).toFixed(1) + '" height="40" fill="rgba(239,199,156,.45)"/><rect x="' + sx(35) + '" y="30" width="' + (sx(45) - sx(35)).toFixed(1) + '" height="40" fill="rgba(224,103,63,.25)"/>';
      var ticks = [0, 10, 20, 30, 40].map(function (v) { return '<text x="' + sx(v) + '" y="90" fill="' + C.douxE + '" font-size="15" text-anchor="' + (v === 0 ? 'start' : 'middle') + '">' + v + ' s</text>'; }).join('');
      var reel = '<rect x="' + sx(22) + '" y="100" width="' + (sx(40) - sx(22)).toFixed(1) + '" height="6" rx="3" fill="' + C.douxE + '"/>';
      var aiguille = '<g style="animation:v2-balaye 4s 1s cubic-bezier(.3,.1,.3,1) forwards;--d:' + (sx(26) - x0).toFixed(1) + 'px"><line x1="' + x0 + '" y1="24" x2="' + x0 + '" y2="76" stroke="' + C.texte + '" stroke-width="2.5"/><circle cx="' + x0 + '" cy="24" r="5" fill="' + C.texte + '"/></g>';
      var leg = [['rgba(143,176,143,.6)', C.feuille, 'trop rapide : acide, maigre'], ['rgba(239,199,156,.8)', C.crema, 'repère 25 à 30 s'], ['rgba(224,103,63,.6)', C.cerise, 'trop lent : amer, astringent']].map(function (r, k) {
        var y = 134 + k * 24; return '<rect x="14" y="' + (y - 11) + '" width="12" height="12" rx="3" fill="' + r[0] + '"/><text x="34" y="' + y + '" fill="' + r[1] + '" font-size="14" font-weight="600">' + r[2] + '</text>';
      }).join('');
      var bas = '<rect x="14" y="' + 201 + '" width="12" height="5" rx="2" fill="' + C.douxE + '"/><text x="34" y="208" fill="' + C.douxE + '" font-size="15">en coffee shop : de 22 à 40 s</text>' +
        '<text x="14" y="236" fill="' + C.texte + '" font-size="15" font-weight="600">18 g → 36 g</text><text x="14" y="260" fill="' + C.texte + '" font-size="14" font-weight="600">Mon protocole : environ 26 s, 92 à 94 °C</text>';
      return svgE(270, 'Temps d’extraction de l’espresso et goût', zones + ticks + reel + aiguille + leg + bas);
    }
  };

  var SCHEMAS = {
    extraction: function () {
      var w = 720, h = 300, x0 = 50, x1 = 690, y0 = 240, y1 = 40;
      var courbe = function (debut, pente) { var d = ''; for (var k = 0; k <= 40; k++) { var t = k / 40, x = x0 + (x1 - x0) * t, v = 1 / (1 + Math.exp(-(t - debut) * pente)); d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 - (y0 - y1) * v * 0.72).toFixed(1); } return d; };
      var zones = '<rect x="' + x0 + '" y="' + y1 + '" width="200" height="' + (y0 - y1) + '" fill="rgba(143,176,143,.10)"/>' +
        '<rect x="250" y="' + y1 + '" width="230" height="' + (y0 - y1) + '" fill="rgba(239,199,156,.12)"/>' +
        '<rect x="480" y="' + y1 + '" width="210" height="' + (y0 - y1) + '" fill="rgba(224,103,63,.12)"/>';
      var axes = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" stroke="' + C.filet + '"/>' +
        '<text x="' + x0 + '" y="' + (y0 + 26) + '" fill="' + C.doux + '" font-size="12">Plus court, plus grossier</text>' +
        '<text x="' + x1 + '" y="' + (y0 + 26) + '" fill="' + C.doux + '" font-size="12" text-anchor="end">Plus long, plus fin</text>';
      var labels = '<text x="150" y="64" fill="' + C.feuille + '" font-size="13" font-weight="600" text-anchor="middle">SOUS-EXTRAIT</text><text x="150" y="82" fill="' + C.doux + '" font-size="12" text-anchor="middle">acide, salé, maigre</text>' +
        '<text x="365" y="64" fill="' + C.crema + '" font-size="13" font-weight="600" text-anchor="middle">ÉQUILIBRÉ</text><text x="365" y="82" fill="' + C.doux + '" font-size="12" text-anchor="middle">sucré, rond, long</text>' +
        '<text x="585" y="64" fill="' + C.cerise + '" font-size="13" font-weight="600" text-anchor="middle">SUR-EXTRAIT</text><text x="585" y="82" fill="' + C.doux + '" font-size="12" text-anchor="middle">amer, sec, astringent</text>';
      var c1 = '<path class="trace" style="--l:900" d="' + courbe(0.12, 14) + '" fill="none" stroke="' + C.feuille + '" stroke-width="3"/>';
      var c2 = '<path class="trace" style="--l:900;animation-delay:.5s" d="' + courbe(0.45, 12) + '" fill="none" stroke="' + C.crema + '" stroke-width="3"/>';
      var c3 = '<path class="trace" style="--l:900;animation-delay:1s" d="' + courbe(0.78, 12) + '" fill="none" stroke="' + C.cerise + '" stroke-width="3"/>';
      var leg = '<g font-size="12.5"><circle cx="60" cy="282" r="5" fill="' + C.feuille + '"/><text x="72" y="286" fill="' + C.texte + '">acides</text><circle cx="140" cy="282" r="5" fill="' + C.crema + '"/><text x="152" y="286" fill="' + C.texte + '">sucres</text><circle cx="222" cy="282" r="5" fill="' + C.cerise + '"/><text x="234" y="286" fill="' + C.texte + '">composés amers</text></g>';
      var curseur = '<g style="animation:v2-balaye 6s 2.6s ease-in-out infinite alternate;--d:600px"><line x1="' + (x0 + 20) + '" y1="' + (y1 + 52) + '" x2="' + (x0 + 20) + '" y2="' + y0 + '" stroke="' + C.texte + '" stroke-dasharray="3 5"/><circle cx="' + (x0 + 20) + '" cy="' + y0 + '" r="6" fill="' + C.texte + '"/></g>';
      return fig('extraction', 'Ce que le temps fait au goût', 'Extraction', '<svg viewBox="0 0 ' + w + ' 300" role="img" aria-label="Courbes d’extraction : acides, puis sucres, puis composés amers">' + zones + axes + labels + c1 + c2 + c3 + curseur + leg + '</svg>',
        'Les acides s’extraient en premier, les sucres ensuite, les composés amers en dernier. Un café trop court est acide, un café trop long est amer. Voir <a href="/journal/pourquoi-cafe-acide">café acide</a> et <a href="/journal/pourquoi-cafe-amer">café amer</a>.');
    },
    v60: function () {
      var etapes = [
        { a: 0, b: 30, g: 30, n: 'Bloom' }, { a: 30, b: 60, g: 150, n: '1er versement' }, { a: 60, b: 90, g: 200, n: '2e versement' },
        { a: 90, b: 120, g: 250, n: 'Versement final' }, { a: 120, b: 195, g: 250, n: 'Écoulement' }];
      var x0 = 40, x1 = 680, t1 = 210, sx = function (s) { return x0 + (x1 - x0) * s / t1; };
      var barres = etapes.map(function (e, k) {
        var x = sx(e.a), wd = sx(e.b) - sx(e.a), hh = e.g / 250 * 150, y = 200 - hh;
        return '<g class="apparait" style="animation-delay:' + (0.4 + k * 0.5) + 's"><rect class="pousse" style="animation-delay:' + (0.4 + k * 0.5) + 's" x="' + (x + 2) + '" y="' + y + '" width="' + (wd - 4) + '" height="' + hh + '" rx="6" fill="' + (k === 4 ? 'rgba(239,199,156,.22)' : (k === 0 ? C.feuille : C.crema)) + '"/>' +
          '<text x="' + (x + wd / 2) + '" y="' + (y - 10) + '" fill="' + C.texte + '" font-size="13" font-weight="600" text-anchor="middle">' + (k === 4 ? '' : e.g + ' g') + '</text>' +
          '<text x="' + (x + wd / 2) + '" y="226" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">' + e.n + '</text></g>';
      }).join('');
      var ticks = [0, 30, 60, 90, 120, 150, 180, 210].map(function (s) { return '<text x="' + sx(s) + '" y="250" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + '</text>'; }).join('');
      var fin = '<rect x="' + sx(150) + '" y="236" width="' + (sx(210) - sx(150)) + '" height="4" rx="2" fill="' + C.cerise + '"/><text x="' + sx(180) + '" y="272" fill="' + C.cerise + '" font-size="11.5" text-anchor="middle" font-weight="600">fin entre 2:30 et 3:30</text>';
      var tete = '<g style="animation:v2-balaye 8s 3s linear infinite;--d:' + (x1 - x0) + 'px"><line x1="' + x0 + '" y1="40" x2="' + x0 + '" y2="236" stroke="' + C.texte + '" stroke-width="1.5"/><circle cx="' + x0 + '" cy="40" r="4" fill="' + C.texte + '"/></g>';
      return fig('v60', 'La recette V60, seconde par seconde', 'V60 · 15 g · 250 g · 93 °C', '<svg viewBox="0 0 720 280" role="img" aria-label="Chronologie de la recette V60">' + '<line x1="' + x0 + '" y1="236" x2="' + x1 + '" y2="236" stroke="' + C.filet + '"/>' + barres + ticks + fin + tete + '</svg>',
        'Bloom de 30 g pendant 30 secondes, puis 150 g, 200 g et 250 g en trois versements en spirale. Le débit s’arrête vers 2:30 à 3:30 : plus long, desserrez la mouture. Recette complète dans le <a href="/journal/v60-guide-complet">guide V60</a>.');
    },
    mouture: function () {
      var m = [
        { n: 'Espresso', d: 'fine', r: 2.2, lien: '/journal/comment-faire-espresso-parfait' },
        { n: 'V60', d: 'médium-fine, sucre semoule', r: 3.4, lien: '/journal/v60-guide-complet' },
        { n: 'Moka', d: 'médium', r: 4.2, lien: '/journal/moka-pot-guide-complet' },
        { n: 'Piston', d: 'grossière', r: 5.6, lien: '/journal/french-press-guide' },
        { n: 'Cold brew', d: 'très grossière, sucre gros', r: 7, lien: '/journal/cold-brew-maison' }];
      var out = m.map(function (e, k) {
        var cx = 75 + k * 142, pts = '';
        for (var j = 0; j < 14; j++) {
          var a = (j * 137.5) * Math.PI / 180, rr = 6 + 26 * Math.sqrt(j / 14), x = cx + rr * Math.cos(a), y = 110 + rr * Math.sin(a) * 0.9;
          pts += '<circle class="tombe" style="animation-delay:' + (k * 0.25 + j * 0.03).toFixed(2) + 's" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + e.r + '" fill="' + C.cuivre + '"/>';
        }
        return '<g>' + pts + '<text x="' + cx + '" y="186" fill="' + C.texte + '" font-size="15" font-weight="600" text-anchor="middle">' + e.n + '</text><text x="' + cx + '" y="206" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">' + e.d + '</text></g>';
      }).join('');
      var fl = '<line x1="40" y1="236" x2="690" y2="236" stroke="' + C.filet + '"/><path d="M684 231 L692 236 L684 241" fill="none" stroke="' + C.doux + '"/><text x="40" y="258" fill="' + C.doux + '" font-size="11.5">plus fin, extraction rapide</text><text x="690" y="258" fill="' + C.doux + '" font-size="11.5" text-anchor="end">plus grossier, contact long</text>';
      return fig('mouture', 'La mouture, méthode par méthode', 'Mouture', '<svg viewBox="0 0 720 270" role="img" aria-label="Taille de mouture par méthode, de l’espresso au cold brew">' + out + fl + '</svg>',
        'Plus le contact entre l’eau et le café est court, plus la mouture est fine. Repères tirés des guides <a href="/journal/v60-guide-complet">V60</a>, <a href="/journal/moka-pot-guide-complet">moka</a>, <a href="/journal/french-press-guide">piston</a> et <a href="/journal/cold-brew-maison">cold brew</a>.');
    },
    eau: function () {
      var eaux = [
        { n: 'Mont Blanc', v: 134, r: '1re ex æquo', c: C.crema }, { n: 'Volvic', v: 130, r: '1re ex æquo', c: C.crema },
        { n: 'Rocheval', v: 240, r: '3e', c: C.cuivre }, { n: 'Cristaline (Louise)', v: 477, r: '5e', c: C.cerise },
        { n: 'Mont Roucous', v: 33, r: 'non goûtée', c: 'rgba(244,236,227,.35)' }];
      var x0 = 170, x1 = 620, sx = function (v) { return x0 + (x1 - x0) * v / 500; };
      var bandes = '<rect x="' + sx(75) + '" y="20" width="' + (sx(250) - sx(75)) + '" height="232" fill="rgba(143,176,143,.10)"/><text x="' + sx(162) + '" y="14" fill="' + C.feuille + '" font-size="11.5" font-weight="600" text-anchor="middle">SCAA : 75 à 250</text>' +
        '<line x1="' + sx(150) + '" y1="20" x2="' + sx(150) + '" y2="252" stroke="' + C.feuille + '" stroke-dasharray="4 5"/>';
      var barres = eaux.map(function (e, k) {
        var y = 34 + k * 44;
        return '<text x="' + (x0 - 12) + '" y="' + (y + 15) + '" fill="' + C.texte + '" font-size="13.5" text-anchor="end">' + e.n + '</text>' +
          '<rect class="pousse-x" style="animation-delay:' + (0.3 + k * 0.25) + 's" x="' + x0 + '" y="' + y + '" width="' + (sx(e.v) - x0) + '" height="22" rx="5" fill="' + e.c + '"/>' +
          '<text class="apparait" style="animation-delay:' + (1.2 + k * 0.25) + 's" x="' + (sx(e.v) + 8) + '" y="' + (y + 15) + '" fill="' + C.texte + '" font-size="12.5" font-weight="600">' + e.v + ' mg/L · ' + e.r + '</text>';
      }).join('');
      var axe = [0, 100, 200, 300, 400, 500].map(function (v) { return '<text x="' + sx(v) + '" y="270" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + v + '</text>'; }).join('');
      return fig('eau', 'Mon test à l’aveugle, en résidu sec', 'Eau · 6 eaux · 1 café', '<svg viewBox="0 0 720 280" role="img" aria-label="Résidu sec des eaux testées face à la plage SCAA">' + bandes + barres + axe + '</svg>',
        'Résidu sec des étiquettes (mg/L) face à la plage SCAA de 2009 (75 à 250, cible 150). Le Brita avec magnésium (4e) et l’eau du robinet (6e) n’ont pas de chiffre publié. Détails et protocole dans le <a href="/journal/eau-cafe-filtre-tds-mineraux">test des eaux</a>.');
    },
    degazage: function () {
      var x0 = 40, x1 = 690, sx = function (j) { return x0 + (x1 - x0) * j / 49; };
      var zones = '<rect class="pousse-x" x="' + sx(7) + '" y="70" width="' + (sx(14) - sx(7)) + '" height="34" rx="6" fill="' + C.crema + '"/><text x="' + sx(10.5) + '" y="62" fill="' + C.crema + '" font-size="12" font-weight="600" text-anchor="middle">Filtre : 7 à 14 j de repos</text>' +
        '<rect class="pousse-x" style="animation-delay:.4s" x="' + sx(10) + '" y="130" width="' + (sx(21) - sx(10)) + '" height="34" rx="6" fill="' + C.cuivre + '"/><text x="' + sx(15.5) + '" y="122" fill="' + C.cuivre + '" font-size="12" font-weight="600" text-anchor="middle">Espresso : 10 à 21 j</text>' +
        '<rect class="pousse-x" style="animation-delay:.8s" x="' + sx(42) + '" y="186" width="' + (sx(49) - sx(42)) + '" height="20" rx="6" fill="rgba(224,103,63,.55)"/><text x="' + sx(45.5) + '" y="180" fill="' + C.cerise + '" font-size="12" font-weight="600" text-anchor="middle">les arômes fins s’estompent</text>';
      var ticks = [0, 7, 14, 21, 28, 35, 42, 49].map(function (j) { return '<line x1="' + sx(j) + '" y1="216" x2="' + sx(j) + '" y2="222" stroke="' + C.doux + '"/><text x="' + sx(j) + '" y="238" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + (j === 0 ? 'torréfaction' : 'J+' + j) + '</text>'; }).join('');
      var bulles = '';
      for (var b = 0; b < 16; b++) { var x = sx(1 + (b % 8) * 1.4), dl = (b * 0.37) % 3; bulles += '<circle cx="' + x.toFixed(1) + '" cy="200" r="' + (2 + (b % 3)) + '" fill="none" stroke="' + C.texte + '" stroke-opacity=".6" style="animation:v2-bulle 2.6s ' + dl.toFixed(2) + 's ease-out infinite"/>'; }
      return fig('degazage', 'Quand boire son café après torréfaction', 'Dégazage', '<svg viewBox="0 0 720 250" role="img" aria-label="Fenêtres de repos après torréfaction">' + '<line x1="' + x0 + '" y1="216" x2="' + x1 + '" y2="216" stroke="' + C.filet + '"/>' + zones + bulles + ticks + '<text x="' + sx(2.5) + '" y="150" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">CO₂</text></svg>',
        'Le grain relâche du CO₂ pendant des jours après la torréfaction. Repères du <a href="/journal/degazage-cafe">guide du dégazage</a> ; au-delà de six semaines, les arômes les plus fins s’estompent (<a href="/journal/meilleur-cafe-en-grain-2025">café en grain</a>).');
    },
    espresso: function () {
      var x0 = 60, x1 = 680, sx = function (s) { return x0 + (x1 - x0) * s / 45; };
      var zones = '<rect x="' + sx(0) + '" y="90" width="' + (sx(22) - sx(0)) + '" height="40" fill="rgba(143,176,143,.18)"/><rect x="' + sx(25) + '" y="90" width="' + (sx(30) - sx(25)) + '" height="40" fill="rgba(239,199,156,.45)"/><rect x="' + sx(35) + '" y="90" width="' + (sx(45) - sx(35)) + '" height="40" fill="rgba(224,103,63,.25)"/>' +
        '<text x="' + sx(11) + '" y="82" fill="' + C.feuille + '" font-size="12" font-weight="600" text-anchor="middle">trop rapide : acide, maigre</text>' +
        '<text x="' + sx(27.5) + '" y="82" fill="' + C.crema + '" font-size="12" font-weight="600" text-anchor="middle">repère 25 à 30 s</text>' +
        '<text x="' + sx(40) + '" y="82" fill="' + C.cerise + '" font-size="12" font-weight="600" text-anchor="middle">trop lent : amer, astringent</text>';
      var ticks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].map(function (s) { return '<text x="' + sx(s) + '" y="152" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + s + ' s</text>'; }).join('');
      var reel = '<rect x="' + sx(22) + '" y="166" width="' + (sx(40) - sx(22)) + '" height="6" rx="3" fill="' + C.doux + '"/><text x="' + sx(31) + '" y="190" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">en coffee shop : de 22 à 40 s</text>';
      var aiguille = '<g style="animation:v2-balaye 4s 1s cubic-bezier(.3,.1,.3,1) forwards;--d:' + (sx(26) - x0) + 'px"><line x1="' + x0 + '" y1="84" x2="' + x0 + '" y2="136" stroke="' + C.texte + '" stroke-width="2.5"/><circle cx="' + x0 + '" cy="84" r="5" fill="' + C.texte + '"/></g>';
      var tasse = '<g transform="translate(560 200)"><text x="0" y="40" fill="' + C.texte + '" font-size="13" font-weight="600" text-anchor="middle">18 g → 36 g</text></g><text x="' + x0 + '" y="240" fill="' + C.texte + '" font-size="13" font-weight="600">Mon protocole : environ 26 s, 92 à 94 °C</text>';
      return fig('espresso', 'Lire le temps d’un espresso', 'Espresso · 1:2', '<svg viewBox="0 62 720 193" role="img" aria-label="Temps d’extraction de l’espresso et goût">' + zones + ticks + reel + aiguille + tasse + '</svg>',
        'Le repère : 18 g de café pour 36 g en tasse, en 25 à 30 secondes. Plus rapide, le shot est acide et sous-extrait ; plus lent, sur-extrait et astringent. Diagnostic complet : <a href="/journal/espresso-trop-rapide-trop-lent-diagnostic">espresso trop rapide ou trop lent</a>.');
    }
  };

  function demarrerSchemas(racine) {
    var cibles = $$('[data-schema]', racine || document);
    if (!cibles.length) return;
    injecterCss();
    cibles.forEach(function (el) {
      var f = SCHEMAS[el.getAttribute('data-schema')];
      if (!f || el.dataset.rendu) return;
      el.innerHTML = f(); el.dataset.rendu = '1';
      /* pas de lien vers la page où l'on se trouve déjà */
      $$('a[href]', el).forEach(function (a) {
        if (a.getAttribute('href').replace(/\.html$/, '') === location.pathname.replace(/\.html$/, '')) a.replaceWith(document.createTextNode(a.textContent));
      });
      var anim = $('.v2-anim', el), bouton = $('.rejouer', el);
      if (bouton) bouton.addEventListener('click', function () {
        var neuf = anim.cloneNode(true); anim.parentNode.replaceChild(neuf, anim); anim = neuf;
        requestAnimationFrame(function () { anim.classList.add('joue'); });
      });
      if (reduit || !('IntersectionObserver' in window)) { anim.classList.add('joue'); return; }
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { anim.classList.add('joue'); io.disconnect(); } }); }, { threshold: 0.35 });
      io.observe(el);
    });
  }

  /* ── Pages article : schéma au bon endroit et sommaire latéral ── */
  var CARTE = {
    '/journal/v60-guide-complet': ['v60', /recette de base|protocole/i],
    '/journal/eau-cafe-filtre-tds-mineraux': ['eau', /ce que disent les chiffres/i],
    '/journal/degazage-cafe': ['degazage', null],
    '/journal/espresso-trop-rapide-trop-lent-diagnostic': ['espresso', null],
    '/journal/comment-faire-espresso-parfait': ['espresso', null],
    '/journal/pourquoi-cafe-amer': ['extraction', null],
    '/journal/pourquoi-cafe-acide': ['extraction', null],
    '/journal/ratio-cafe-eau-extraction': ['extraction', /ajuster|goût/i],
    '/journal/meilleur-moulin-cafe-electrique': ['mouture', null],
    '/journal/meilleur-moulin-cafe-manuel': ['mouture', null],
    '/journal/mouture-cafe-v60': ['mouture', null]
  };
  var chemin = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  var article = $('main article') || $('article');
  if (article && CARTE[chemin]) {
    var cfg = CARTE[chemin], h2s = $$('h2', article), cible = null;
    if (cfg[1]) cible = h2s.filter(function (h) { return cfg[1].test(h.textContent); })[0];
    if (!cible) cible = h2s[0];
    if (cible) {
      var bloc = document.createElement('div'); bloc.setAttribute('data-schema', cfg[0]);
      var apres = cible.nextElementSibling || cible;
      apres.parentNode.insertBefore(bloc, apres.nextSibling);
    }
  }
  demarrerSchemas();

  if (article) {
    var titres = $$('h2', article).filter(function (h) { return !h.closest('details, .top-item, .v2-schema') && h.textContent.trim().length > 2; });
    if (titres.length >= 3) {
      var nav = document.createElement('nav'); nav.className = 'v2-sommaire'; nav.setAttribute('aria-label', 'Au sommaire');
      var html = '<p>Au sommaire</p><ol>';
      titres.forEach(function (h, k) {
        if (!h.id) h.id = 'section-' + (k + 1);
        html += '<li><a href="#' + h.id + '"><span>' + String(k + 1).padStart(2, '0') + '</span>' + h.textContent.trim().replace(/^\d+\s*/, '') + '</a></li>';
      });
      nav.innerHTML = html + '</ol>'; document.body.appendChild(nav); nav.classList.add('pret');
      /* le sommaire s'efface dès que la fin de l'article remonte à sa hauteur :
         il ne recouvre ni l'encadré auteur, ni les blocs de fin, ni le pied de page */
      var attente = false;
      var placer = function () {
        attente = false;
        var fin = article.getBoundingClientRect().bottom;
        nav.classList.toggle('cache', fin < nav.getBoundingClientRect().top + nav.offsetHeight + 24);
      };
      window.addEventListener('scroll', function () { if (!attente) { attente = true; requestAnimationFrame(placer); } }, { passive: true });
      window.addEventListener('resize', placer);
      placer();
      var liens = $$('a', nav);
      if ('IntersectionObserver' in window) {
        var io2 = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { liens.forEach(function (l) { l.classList.toggle('actif', l.getAttribute('href') === '#' + e.target.id); }); } });
        }, { rootMargin: '-20% 0px -70% 0px' });
        titres.forEach(function (h) { io2.observe(h); });
      }
    }
  }

  /* ── 404 : régler le moulin, tirer le shot ──
     Temps pour 36 g selon la mouture (1 très fin, 20 très gros) : 4,04 s à 20, 27 s vers 8,
     plus de 45 s en dessous de 5 : ça ne coule plus. Un shot entre 25 et 30 s ouvre une vraie page. */
  var tirer = document.getElementById('v2-tirer');
  if (tirer) {
    var el = function (id) { return document.getElementById(id); };
    var curseur = el('v2-mouture'), valeur = el('v2-mouture-val'), poids = el('v2-poids'), chrono = el('v2-chrono'),
        liquide = el('v2-liquide'), aiguille = el('v2-aiguille'), voyant = el('v2-voyant'), filets = $$('.v2-err__filet'),
        fiche = el('v2-fiche'), verdict = el('v2-verdict'), tampon = el('v2-tampon');
    var PAGES = [
      ['/journal/espresso-trop-rapide-trop-lent-diagnostic', 'Espresso trop rapide ou trop lent : le diagnostic'],
      ['/journal/comment-faire-espresso-parfait', 'Comment faire un espresso, recette et réglages'],
      ['/journal/v60-guide-complet', 'Le guide V60, dose et recette'],
      ['/journal/eau-cafe-filtre-tds-mineraux', 'Six eaux goûtées à l’aveugle'],
      ['/journal/ratio-cafe-eau-extraction', 'Le ratio café/eau, méthode par méthode'],
      ['/journal/methode-4-6-kasuya', 'La méthode 4:6 de Tetsu Kasuya']
    ];
    var sansAnim = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var enCours = false;
    var fr = function (n, d) { return n.toFixed(d).replace('.', ','); };
    poids.classList.add('clignote');
    curseur.addEventListener('input', function () { valeur.textContent = curseur.value; });

    var afficher = function (s, w, bar, debit, coule) {
      chrono.textContent = fr(s, 1);
      poids.textContent = fr(w, 1);
      liquide.style.transform = 'scaleY(' + Math.min(1, w / 40).toFixed(3) + ')';
      aiguille.style.transform = 'rotate(' + (-120 + bar / 12 * 240).toFixed(1) + 'deg)';
      filets.forEach(function (f) {
        f.classList.toggle('coule', coule);
        f.style.strokeWidth = coule ? Math.max(1.4, Math.min(6, 1.2 + debit * 1.1)).toFixed(2) : 0;
      });
    };

    var conclure = function (g, t, bouche, w) {
      enCours = false; tirer.disabled = false;
      tirer.firstChild.nodeValue = 'Retirer un shot ';
      voyant.setAttribute('fill', '#4b6b4f');
      el('v2-f-mouture').textContent = g + ' / 20';
      var dec = !bouche && t < 10 ? 2 : 1;
      chrono.textContent = fr(bouche ? 45 : t, dec);
      el('v2-f-temps').textContent = fr(bouche ? 45 : t, dec) + ' s';
      el('v2-f-poids').textContent = fr(w, 1) + ' g';
      var texte, cachet, reussi = false, lien = null;
      if (g === 20) { texte = '4,04 secondes. Évidemment. Mouture beaucoup trop grosse : l’eau traverse sans rien extraire, comme vous à travers cette page. Moulez plus fin.'; cachet = 'Sous-extrait'; }
      else if (bouche) { texte = 'Ça ne coule plus. Moulu trop fin, la galette bloque l’eau : la page s’est bouchée. Notes de dégustation : clope froide. Un cran plus gros.'; cachet = 'Bouché'; }
      else if (t < 15) { texte = fr(t, 1) + ' s pour 36 g : beaucoup trop rapide. Sous-extrait, acide, creux. Plus fin.'; cachet = 'Sous-extrait'; }
      else if (t < 25) { texte = fr(t, 1) + ' s : encore un peu rapide. Un cran plus fin.'; cachet = 'Presque'; }
      else if (t <= 30) { texte = fr(t, 1) + ' s pour 36 g. Shot réussi. Votre page vous attend : '; cachet = 'Réussi'; reussi = true; lien = PAGES[Math.floor(Math.random() * PAGES.length)]; }
      else { texte = fr(t, 1) + ' s : trop lent. Amer, astringent. Un cran plus gros.'; cachet = 'Sur-extrait'; }
      verdict.textContent = texte;
      if (lien) { var a = document.createElement('a'); a.href = lien[0]; a.textContent = lien[1] + ' →'; verdict.appendChild(a); }
      tampon.textContent = cachet;
      tampon.className = 'v2-err__tampon' + (reussi ? ' reussi' : '');
      fiche.hidden = false;
      void tampon.offsetWidth; tampon.classList.add('frappe');
    };

    tirer.addEventListener('click', function () {
      if (enCours) return;
      enCours = true; tirer.disabled = true;
      var g = +curseur.value;
      var t = g === 20 ? 4.04 : Math.max(3.6, 4.04 * Math.exp(0.158 * (20 - g)) + (Math.random() * 1.2 - 0.6));
      var bouche = t > 45, fin = bouche ? 45 : t;
      var pre = Math.min(4, t * 0.15);
      var wFin = bouche ? 36 * 0.3 * (45 - pre) / (t - pre) : 36;
      var barMax = bouche ? 11 : g >= 16 ? 4 : g >= 12 ? 7 : 9;
      var poidsA = function (s) { var x = (s - pre) / (fin - pre); return x <= 0 ? 0 : wFin * Math.pow(Math.min(1, x), 1.1); };
      poids.classList.remove('clignote'); poids.classList.add('actif');
      voyant.setAttribute('fill', '#e0673f');
      if (sansAnim) { afficher(fin, wFin, barMax, 0, false); conclure(g, t, bouche, wFin); return; }
      var vitesse = 7, debut = null, avant = 0;
      var image = function (horo) {
        if (debut === null) debut = horo;
        var s = Math.min(fin, (horo - debut) / 1000 * vitesse);
        var w = poidsA(s), debit = (w - avant) / Math.max(0.001, (s - (image.s || 0)));
        avant = w; image.s = s;
        afficher(s, w, barMax * Math.min(1, s / 3), debit, s > pre && s < fin);
        if (s < fin) requestAnimationFrame(image);
        else { afficher(fin, wFin, 0, 0, false); conclure(g, t, bouche, wFin); }
      };
      requestAnimationFrame(image);
    });
  }

  /* ── Vidéos tutos : lecture quand elles sont à l'écran, pause sinon.
     preload="none" : rien n'est téléchargé avant qu'on arrive dessus.
     Animations réduites : la vidéo attend un clic. ── */
  var videos = $$('video[data-auto]');
  // Petit écran : la version verticale (choisie par <source media>) prend son affiche verticale.
  if (window.matchMedia && window.matchMedia('(max-width: 640px)').matches) {
    videos.forEach(function (v) { if (v.dataset.posterVertical) v.poster = v.dataset.posterVertical; });
  }
  if (videos.length && !reduit && 'IntersectionObserver' in window) {
    var ioVid = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) v.pause();
      });
    }, { threshold: [0, 0.5] });
    videos.forEach(function (v) { ioVid.observe(v); });
  }

  /* ── Illustrations d'articles : l'image fixe s'affiche tout de suite ; la boucle (60 à 600 Ko)
     ne se télécharge que si l'illustration est à l'écran, sauf animations réduites ou économie
     de données. Elle apparaît en fondu quand elle joue vraiment. ── */
  // Une illustration absente ne doit jamais laisser un cadre vide : la figure disparaît.
  $$('figure[data-illu] img').forEach(function (img) {
    var cacher = function () { img.closest('figure').hidden = true; };
    if (img.complete && !img.naturalWidth) cacher(); else img.addEventListener('error', cacher);
  });
  var illus = $$('figure[data-illu] video');
  var econome = navigator.connection && navigator.connection.saveData;
  if (illus.length && !reduit && !econome && 'IntersectionObserver' in window) {
    var ioIllu = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) {
            v.addEventListener('playing', function () { v.closest('figure').classList.add('joue'); }, { once: true });
            /* téléphone : boucle sans bandeau de légende, plus légère (768 × 432) */
            v.src = (v.dataset.srcM && matchMedia('(max-width: 640px)').matches) ? v.dataset.srcM : v.dataset.src;
          }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) v.pause();
      });
    }, { threshold: 0.2 });
    illus.forEach(function (v) { ioIllu.observe(v); });
  }
  /* ── Tableaux plus larges que l'écran : mention « Faites glisser » et fondu à droite
     jusqu'à ce que la fin soit visible (styles .v2-glisser et .v2-deborde dans v2.css). ── */
  var SEL_DEFILANTS = '.prose-article table:not([role=presentation]), .prose-article .overflow-x-auto, .prose-article [style*="overflow"], .top8-tableau, .table-scroll, .calc-ratio__tableau, .outil-eau__tableau, .torref-tableau';
  var defilants = $$(SEL_DEFILANTS);
  function marquerDefilants() {
    defilants = $$(SEL_DEFILANTS);
    var vus = [];
    defilants.forEach(function (el) {
      var ox = getComputedStyle(el).overflowX;
      var deborde = (ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 4;
      el.classList.toggle('v2-deborde', deborde);
      if (deborde && !el.v2Indice) {
        var cadre = el;
        while (cadre.parentElement && cadre.parentElement.children.length === 1 && !cadre.parentElement.matches('article, main, body, .prose-article')) cadre = cadre.parentElement;
        var avant = cadre.previousElementSibling;
        if (avant && avant.classList.contains('v2-glisser')) el.v2Indice = avant;
        else {
          el.v2Indice = document.createElement('p');
          el.v2Indice.className = 'v2-glisser';
          el.v2Indice.setAttribute('aria-hidden', 'true');
          el.v2Indice.textContent = 'Faites glisser le tableau\u00a0→';
          cadre.parentNode.insertBefore(el.v2Indice, cadre);
        }
        el.addEventListener('scroll', function () { el.classList.toggle('fin', el.scrollLeft + el.clientWidth >= el.scrollWidth - 2); }, { passive: true });
      }
      if (el.v2Indice) {
        if (vus.indexOf(el.v2Indice) < 0) { vus.push(el.v2Indice); el.v2Indice.hidden = true; }
        if (deborde) el.v2Indice.hidden = false;
      }
    });
  }
  if (defilants.length || document.getElementById('oe-resultat')) {
    marquerDefilants();
    window.addEventListener('load', marquerDefilants);
    window.addEventListener('resize', marquerDefilants);
    /* l'outil eau injecte son tableau après la recherche */
    var oe = document.getElementById('oe-resultat');
    if (oe && 'MutationObserver' in window) new MutationObserver(function () { marquerDefilants(); }).observe(oe, { childList: true, subtree: true });
  }
})();
