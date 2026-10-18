/* Carnet filtré. : tasses, cafés et origines, gardés sur le téléphone. Aucune dépendance, aucun serveur. */
(function () {
  'use strict';
  var D = window.CARNET;
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CLE = 'filtre-carnet';

  /* ── Typographie : même passe que typo() du site (astro/src/lib/v2.js), sur les nœuds texte ── */
  var NBSP = '\u00a0', FINE = '\u202f';
  var UNITES = /(\d) (€|%|°C|°|g|kg|mg|ml|cl|L|min|s|mm|bars?|ppm|mg\/L)(?=[\s.,;:!?)»]|$)/g;
  function typo(t) {
    return t
      .replace(/\u00a0(?=[?!;])/g, FINE)
      .replace(/(\S) · /g, '$1' + NBSP + '· ')
      .replace(/(\d)–(?=\d)/g, '$1–\u2060')
      .replace(/(\S) ([?!;])/g, '$1' + FINE + '$2')
      .replace(/(\S) ([:»])/g, '$1' + NBSP + '$2')
      .replace(/« /g, '«' + NBSP)
      .replace(UNITES, '$1' + NBSP + '$2')
      .replace(/ →/g, NBSP + '→');
  }
  function typographier(racine) {
    var w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        return !p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName) || p.closest('svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n, liste = [];
    while ((n = w.nextNode())) liste.push(n);
    liste.forEach(function (x) { var t = typo(x.nodeValue); if (t !== x.nodeValue) x.nodeValue = t; });
  }

  /* ── Stockage : un seul objet JSON, dans ce navigateur ── */
  function vide() { return { version: 1, cafes: [], tasses: [], adresses: [] }; }
  function charger() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(CLE) || 'null'); } catch (e) { /* stockage indisponible : on part d'un carnet vide */ }
    // CARNET_DEPART : carnet de départ facultatif (l'aperçu y met des tasses d'exemple).
    if (!(d && d.version === 1 && Array.isArray(d.cafes) && Array.isArray(d.tasses))) d = window.CARNET_DEPART ? JSON.parse(JSON.stringify(window.CARNET_DEPART)) : vide();
    if (!Array.isArray(d.adresses)) d.adresses = [];
    return d;
  }
  var etat = charger();
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(etat)); return true; }
    catch (e) { message('Enregistrement impossible sur ce téléphone. Exportez le carnet avant de fermer.'); return false; }
  }
  function demanderPersistance() {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  }

  /* ── Outils ── */
  var NF = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  var JOUR = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
  var JOUR_AN = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function echapper(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nombre(v) {
    if (v == null || v === '') return null;
    var n = parseFloat(String(v).replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'));
    return isFinite(n) && n > 0 ? n : null;
  }
  function fr(n) { return NF.format(n); }
  function pourSaisie(n) { return n == null ? '' : String(Math.round(n * 10) / 10).replace('.', ','); }
  function ratio(dose, eau) { return dose && eau ? '1:' + fr(eau / dose) : ''; }
  function deux(n) { return (n < 10 ? '0' : '') + n; }
  // « 2 min 30 » ne se coupe jamais en fin de ligne.
  function ecrireTemps(s) {
    if (s == null) return '';
    if (s >= 3600) return fr(s / 3600) + NBSP + 'h';
    if (s < 60) return s + NBSP + 's';
    var m = Math.floor(s / 60), r = s % 60;
    return r ? m + NBSP + 'min' + NBSP + deux(r) : m + NBSP + 'min';
  }
  function fenetre(m) {
    var a = m.temps[0], b = m.temps[1];
    if (b < 60) return a + ' à ' + b + ' s';
    if (a % 60 === 0 && b % 60 === 0) return a / 60 + ' à ' + b / 60 + ' min';
    return ecrireTemps(a) + ' à ' + ecrireTemps(b);
  }
  function quand(iso) {
    var d = new Date(iso), j = new Date(d), auj = new Date();
    if (isNaN(d)) return '';
    j.setHours(0, 0, 0, 0); auj.setHours(0, 0, 0, 0);
    var ecart = Math.round((auj - j) / 864e5);
    if (ecart === 0) return 'aujourd’hui';
    if (ecart === 1) return 'hier';
    return 'le ' + (d.getFullYear() === auj.getFullYear() ? JOUR : JOUR_AN).format(d);
  }
  function premier(liste, test) { for (var i = 0; i < liste.length; i++) if (test(liste[i])) return liste[i]; return null; }
  function methode(cle) { return premier(D.methodes, function (m) { return m.cle === cle; }) || D.methodes[0]; }
  function origine(cle) { return premier(D.origines, function (o) { return o.cle === cle; }); }
  function gout(cle) { return premier(D.gouts, function (g) { return g.cle === cle; }); }
  function procede(cle) { var p = premier(D.procedes, function (x) { return x.cle === cle; }); return p ? p.nom : ''; }
  function cafe(cid) { return premier(etat.cafes, function (c) { return c.id === cid; }); }
  function tasse(tid) { return premier(etat.tasses, function (t) { return t.id === tid; }); }
  function tassesDu(cid) { return etat.tasses.filter(function (t) { return t.cafe === cid; }); }
  function parDate(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }
  function derniereTasse(test) { return premier(etat.tasses.slice().sort(parDate), test); }
  function nomOrigine(cle) { var o = origine(cle); return o ? o.nom : cle === 'assemblage' ? 'Assemblage' : ''; }
  function reglages(t) {
    var m = methode(t.methode), p = [];
    if (t.dose && t.eau) p.push(fr(t.dose) + ' g → ' + fr(t.eau) + ' g', ratio(t.dose, t.eau));
    else if (t.dose) p.push(fr(t.dose) + ' g');
    if (t.temperature) p.push(fr(t.temperature) + ' °C');
    if (t.temps) p.push(ecrireTemps(t.temps));
    if (t.mouture) p.push('mouture ' + t.mouture);
    return p.length ? p.join(' · ') : m.nom;
  }
  function pointsNote(n) {
    n = Math.max(0, Math.min(5, Math.round(+n || 0)));
    return n ? '<span class="points" aria-label="Note ' + n + ' sur 5">' + '●'.repeat(n) + '○'.repeat(5 - n) + '</span>' : '';
  }

  /* ── Conseil : le goût d'abord, le temps en appoint quand la recette donne une fenêtre ── */
  function conseil(t) {
    var m = methode(t.methode), g = t.gouts || [], C = D.conseils, esp = m.cle === 'espresso';
    var ext = g.indexOf('acide') >= 0 ? 'acide' : g.indexOf('amer') >= 0 ? 'amer' : null;
    var force = g.indexOf('leger') >= 0 ? 'leger' : g.indexOf('fort') >= 0 ? 'fort' : null;
    var hors = m.temps && t.temps ? (t.temps < m.temps[0] ? 'court' : t.temps > m.temps[1] ? 'long' : null) : null;
    var r = { titre: null, lignes: [], liens: [], regle: false, court: null };
    if (g.indexOf('equilibre') >= 0) {
      r.titre = C.equilibre.titre;
      r.lignes.push(C.equilibre.texte);
      if (hors) r.lignes.push('Le temps sort de la recette (' + fenetre(m) + '), mais le goût prime.');
      return r;
    }
    if (ext) {
      var c = C[ext];
      r.titre = c.titre; r.court = c.court;
      r.lignes.push(esp ? c.espresso : c.texte);
      r.liens.push(esp ? c.guideEspresso : c.guide);
      if (hors && (hors === 'court') === (ext === 'acide')) r.lignes.push('Le temps le confirme : ' + ecrireTemps(t.temps) + ', pour ' + fenetre(m) + ' dans la recette.');
    }
    if (force) {
      var f = C[force];
      if (!r.titre) { r.titre = f.titre; r.court = f.court; }
      r.lignes.push(ext ? 'Ensuite seulement, ' + f.texte.charAt(0).toLowerCase() + f.texte.slice(1) : f.texte);
      r.liens.push(f.guide);
    }
    if (!ext && !force && hors) {
      var sens = hors === 'court' ? 'affinez' : 'grossissez';
      r.titre = 'Temps hors recette';
      r.court = sens + ' la mouture d’un cran';
      r.lignes.push('En ' + ecrireTemps(t.temps) + ', c’est plus ' + hors + ' que la recette (' + fenetre(m) + ') : ' + sens + ' la mouture d’un cran.');
      r.liens.push(esp ? C.acide.guideEspresso : [m.guide, 'Le guide ' + m.nom]);
    }
    r.regle = !!(ext || force || hors);
    return r.titre ? r : null;
  }
  // Rappel du conseil de la tasse reprise : « la dernière fois », ou « ce jour-là » pour un réglage rejoué.
  function rappel(ref, rejoue) {
    var g = ref.gouts || [];
    if (g.indexOf('equilibre') >= 0) return 'Il vous avait plu : gardez-le.';
    var c = conseil(ref);
    if (!c || !c.court) return '';
    var noms = g.filter(gout).map(function (k) { return gout(k).nom.toLowerCase(); });
    var debut = rejoue ? 'Ce jour-là' : 'La dernière fois';
    return (noms.length ? debut + ', c’était ' + noms.join(' et ') : debut + ', le temps sortait de la recette') + ' : ' + c.court + '.';
  }

  /* ── Navigation ── */
  var VUES = ['noter', 'cafes', 'origines', 'adresses', 'donnees'];
  var rendre = {};
  function aller(vue) {
    if (VUES.indexOf(vue) < 0) vue = 'noter';
    $$('.vue').forEach(function (v) { v.hidden = v.getAttribute('data-vue') !== vue; });
    $$('.onglets button').forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('data-vers') === vue ? 'page' : 'false'); });
    rendre[vue]();
    window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + vue); } catch (e) { /* aperçu sans historique */ }
  }

  /* ── Noter une tasse ── */
  var saisie = { methode: null, cafe: null, gouts: [], note: null, procede: null, modele: null, aRafraichir: true, cafeCree: null };
  var chrono = { debut: null, minuterie: null };

  function puces(conteneur, liste) {
    conteneur.innerHTML = liste.map(function (x) {
      return '<button type="button" class="puce" data-cle="' + x.cle + '" aria-pressed="false">' + echapper(x.nom) + '</button>';
    }).join('');
  }
  function marquer(conteneur, choisis) {
    $$('.puce', conteneur).forEach(function (b) { b.setAttribute('aria-pressed', choisis.indexOf(b.getAttribute('data-cle')) >= 0 ? 'true' : 'false'); });
  }
  function valeur(sel, v) { $(sel).value = v == null ? '' : typeof v === 'number' ? pourSaisie(v) : v; }
  function cafeChoisi() { var v = $('#champ-cafe').value; return v && v !== 'nouveau' ? v : null; }
  function derniereDate(cid) {
    var t = derniereTasse(function (x) { return x.cafe === cid; }), c = cafe(cid);
    return t ? t.date : c ? c.cree : '';
  }

  function remplirCafes(choix) {
    var sel = $('#champ-cafe');
    var tri = etat.cafes.slice().sort(function (a, b) { var x = derniereDate(a.id), y = derniereDate(b.id); return x < y ? 1 : x > y ? -1 : 0; });
    sel.innerHTML = tri.map(function (c) {
      return '<option value="' + echapper(c.id) + '">' + echapper(c.nom + (c.torrefacteur ? ' · ' + c.torrefacteur : '')) + '</option>';
    }).join('') + '<option value="nouveau">+ Nouveau café</option>';
    sel.value = choix && cafe(choix) ? choix : tri[0] ? tri[0].id : 'nouveau';
    $('#nouveau-cafe').hidden = sel.value !== 'nouveau';
  }
  function remplirOrigines() {
    var html = '<option value="">Je ne sais pas</option>';
    Object.keys(D.zones).forEach(function (z) {
      html += '<optgroup label="' + echapper(D.zones[z]) + '">' + D.origines.filter(function (o) { return o.zone === z; })
        .sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr'); })
        .map(function (o) { return '<option value="' + o.cle + '">' + echapper(o.nom) + '</option>'; }).join('') + '</optgroup>';
    });
    $('#cafe-origine').innerHTML = html + '<option value="assemblage">Assemblage</option>';
  }
  function resumeRecette(m) {
    var p = [];
    if (m.dose && m.eau) p.push(fr(m.dose) + ' g pour ' + fr(m.eau) + ' g' + (m.enTasse ? ' en tasse' : ''));
    if (m.temperature) p.push(m.temperature + ' °C');
    if (m.temps) p.push(fenetre(m));
    if (m.heures) p.push(m.heures[0] + ' à ' + m.heures[1] + ' h au frais');
    p.push('mouture ' + m.mouture);
    return p.join(', ');
  }
  function shotCourt(m) { return !!(m.temps && m.temps[1] < 60); }
  function majChamps(m) {
    $('#libelle-eau').textContent = m.enTasse ? 'En tasse' : 'Eau';
    $('#champ-temp').hidden = !!m.heures;
    $('#champ-h').hidden = !m.heures;
    $('#champ-min').hidden = !!m.heures || shotCourt(m);
    $('#champ-sec').hidden = !!m.heures;
    $('#chrono').hidden = !!m.heures;
    $('#libelle-temps').textContent = m.heures ? 'Infusion' : shotCourt(m) ? 'Temps du shot' : 'Temps total';
    $('#t-dose').placeholder = m.dose ? pourSaisie(m.dose) : '';
    $('#t-eau').placeholder = m.eau ? pourSaisie(m.eau) : '';
    $('#t-temp').placeholder = m.temperature ? String(m.temperature) : '';
    $('#t-sec').placeholder = shotCourt(m) ? '27' : '00';
  }
  function majRatio() {
    var r = ratio(nombre($('#t-dose').value), nombre($('#t-eau').value));
    $('#t-ratio').textContent = r ? 'Ratio ' + r : '';
  }
  function lireTemps(m) {
    if (m.heures) { var h = nombre($('#t-h').value); return h ? Math.round(h * 3600) : null; }
    var mn = shotCourt(m) ? 0 : parseInt($('#t-min').value, 10) || 0, s = parseInt($('#t-sec').value, 10) || 0;
    return mn * 60 + s || null;
  }
  function ecrireChampsTemps(s, m) {
    if (shotCourt(m)) { valeur('#t-sec', String(s)); return; }
    valeur('#t-min', String(Math.floor(s / 60)));
    valeur('#t-sec', deux(s % 60));
  }
  function arreterChrono(remplir) {
    var b = $('#chrono');
    if (!chrono.debut) return;
    clearInterval(chrono.minuterie);
    if (remplir) ecrireChampsTemps(Math.round((Date.now() - chrono.debut) / 1000), methode(saisie.methode));
    chrono.debut = null;
    b.textContent = 'Chrono'; b.classList.remove('actif');
  }
  function basculerChrono() {
    var b = $('#chrono');
    if (chrono.debut) return arreterChrono(true);
    chrono.debut = Date.now();
    b.classList.add('actif');
    b.textContent = 'Stop 0:00';
    chrono.minuterie = setInterval(function () {
      var s = Math.floor((Date.now() - chrono.debut) / 1000);
      b.textContent = 'Stop ' + Math.floor(s / 60) + ':' + deux(s % 60);
    }, 250);
  }

  function preRemplir() {
    var m = methode(saisie.methode), cid = cafeChoisi(), modele = saisie.modele;
    saisie.modele = null;
    var memeCafe = cid && derniereTasse(function (t) { return t.methode === m.cle && t.cafe === cid; });
    var ref = modele || memeCafe || derniereTasse(function (t) { return t.methode === m.cle; });
    var src = ref || { dose: m.dose, eau: m.eau, temperature: m.temperature, mouture: '' };
    majChamps(m);
    arreterChrono(false);
    valeur('#t-dose', src.dose); valeur('#t-eau', src.eau); valeur('#t-temp', m.heures ? null : src.temperature); valeur('#t-mouture', src.mouture);
    valeur('#t-min', ''); valeur('#t-sec', ''); valeur('#t-h', '');
    var rep = $('#reprise');
    if (ref) {
      var txt = modele ? 'Réglage ' + (quand(ref.date) === 'aujourd’hui' ? 'd’aujourd’hui' : quand(ref.date) === 'hier' ? 'd’hier' : quand(ref.date).replace(/^le /, 'du ')) + ' rejoué.'
        : 'Repris de votre dernière tasse ' + (ref.cafe === cid ? 'de ce café' : 'en ' + m.nom) + ', ' + quand(ref.date) + '.';
      if (ref.cafe === cid) { var rp = rappel(ref, !!modele); if (rp) txt += ' ' + rp; }
      rep.textContent = txt; rep.hidden = false;
    } else rep.hidden = true;
    $('#indice').innerHTML = 'Recette filtré. : ' + echapper(resumeRecette(m)) + '. <a href="' + D.site + m.guide + '">Lire le guide →</a>';
    majRatio();
    typographier($('#form-tasse'));
  }
  function viderSaisie() {
    saisie.gouts = []; saisie.note = null; saisie.procede = null;
    marquer($('#puces-gout'), []); marquer($('#puces-procede'), []); majNote();
    ['#t-notes', '#cafe-nom', '#cafe-torref', '#cafe-origine'].forEach(function (s) { valeur(s, ''); });
  }
  function majNote() {
    $$('#note button').forEach(function (b) {
      var n = +b.getAttribute('data-note');
      b.classList.toggle('plein', saisie.note != null && n <= saisie.note);
      b.setAttribute('aria-pressed', saisie.note === n ? 'true' : 'false');
    });
  }
  function basculerGout(cle) {
    var g = gout(cle), i = saisie.gouts.indexOf(cle);
    if (i >= 0) saisie.gouts.splice(i, 1);
    else {
      saisie.gouts = saisie.gouts.filter(function (k) { var a = gout(k).axe; return g.axe !== 'tout' && a !== 'tout' && a !== g.axe; });
      saisie.gouts.push(cle);
    }
    marquer($('#puces-gout'), saisie.gouts);
  }

  rendre.noter = function () {
    if (!saisie.aRafraichir) return;
    saisie.aRafraichir = false;
    if (!saisie.methode) { var der = derniereTasse(function () { return true; }); saisie.methode = der ? der.methode : 'v60'; }
    marquer($('#puces-methode'), [saisie.methode]);
    remplirCafes(saisie.cafe);
    preRemplir();
  };

  function enregistrer(e) {
    e.preventDefault();
    var m = methode(saisie.methode), cid = cafeChoisi(), nouveau = null;
    if (!cid) {
      var nom = $('#cafe-nom').value.trim();
      if (!nom) { message('Donnez un nom au café.'); $('#cafe-nom').focus(); return; }
      nouveau = { id: id(), nom: nom, torrefacteur: $('#cafe-torref').value.trim(), origine: $('#cafe-origine').value || null, procede: saisie.procede, cree: new Date().toISOString() };
      etat.cafes.push(nouveau);
      cid = nouveau.id;
    }
    arreterChrono(true);
    var t = {
      id: id(), cafe: cid, methode: m.cle, date: new Date().toISOString(),
      dose: nombre($('#t-dose').value), eau: nombre($('#t-eau').value), mouture: $('#t-mouture').value.trim(),
      temperature: m.heures ? null : nombre($('#t-temp').value), temps: lireTemps(m),
      gouts: saisie.gouts.slice(), note: saisie.note, notes: $('#t-notes').value.trim()
    };
    etat.tasses.push(t);
    sauver();
    demanderPersistance();
    saisie.cafe = cid;
    saisie.cafeCree = nouveau ? nouveau.id : null;
    viderSaisie();
    remplirCafes(cid);
    preRemplir();
    afficherConseil(t);
  }
  function afficherConseil(t) {
    var m = methode(t.methode), c = conseil(t), boite = $('#conseil'), cf = cafe(t.cafe);
    var html = '<p class="kicker">Tasse enregistrée · ' + echapper(m.nom) + '</p>';
    if (c) {
      html += '<h2>' + echapper(c.titre) + '</h2>' + c.lignes.map(function (l) { return '<p>' + echapper(l) + '</p>'; }).join('');
      if (c.regle) html += '<p class="regle">Un seul réglage à la fois, puis regoûtez.</p>';
      if (c.liens.length) html += '<p class="conseil__liens">' + c.liens.map(function (l) { return '<a href="' + D.site + l[0] + '">' + echapper(l[1]) + ' →</a>'; }).join('') + '</p>';
    } else {
      html += '<h2>' + echapper(cf ? cf.nom : m.nom) + '</h2><p>Notez le goût à la prochaine tasse : le carnet vous dira quoi changer.</p>';
    }
    html += '<div class="actions"><button type="button" class="btn btn--petit btn--clair" data-action="voir-cafe" data-cafe="' + echapper(t.cafe) + '">Voir ce café</button>' +
      '<button type="button" class="lien" data-action="annuler" data-tasse="' + echapper(t.id) + '">Annuler cette tasse</button></div>';
    boite.innerHTML = html;
    boite.hidden = false;
    typographier(boite);
    window.scrollTo(0, 0);
    boite.focus({ preventScroll: true });
  }
  function annuler(tid) {
    etat.tasses = etat.tasses.filter(function (t) { return t.id !== tid; });
    if (saisie.cafeCree && !tassesDu(saisie.cafeCree).length) {
      var cid = saisie.cafeCree;
      etat.cafes = etat.cafes.filter(function (c) { return c.id !== cid; });
      saisie.cafe = null;
    }
    saisie.cafeCree = null;
    sauver();
    $('#conseil').hidden = true;
    saisie.aRafraichir = true;
    rendre.noter();
    message('Tasse annulée.');
  }

  /* ── Cafés et historique ── */
  function meilleureTasse(ts) {
    var notees = ts.filter(function (t) { return t.note; }).sort(function (a, b) { return b.note - a.note || parDate(a, b); });
    return notees[0] || premier(ts.slice().sort(parDate), function (t) { return (t.gouts || []).indexOf('equilibre') >= 0; });
  }
  rendre.cafes = function () {
    $('#cafe-detail').hidden = true;
    $('#cafes-liste').hidden = false;
    var liste = $('#liste-cafes');
    if (!etat.cafes.length) {
      liste.innerHTML = '<p class="vide">Aucun café pour l’instant. Notez une première tasse : son café apparaîtra ici, avec tout son historique.</p>';
    } else {
      var tri = etat.cafes.slice().sort(function (a, b) { var x = derniereDate(a.id), y = derniereDate(b.id); return x < y ? 1 : x > y ? -1 : 0; });
      liste.innerHTML = tri.map(function (c) {
        var ts = tassesDu(c.id), der = ts.slice().sort(parDate)[0], best = meilleureTasse(ts);
        var stats = ts.length + ' tasse' + (ts.length > 1 ? 's' : '') + (der ? ' · dernière ' + quand(der.date) : '');
        return '<button type="button" class="carte-cafe" data-action="ouvrir-cafe" data-cafe="' + echapper(c.id) + '">' +
          '<span class="carte-cafe__nom">' + echapper(c.nom) + '</span>' +
          '<span class="carte-cafe__meta">' + echapper([c.torrefacteur, nomOrigine(c.origine), procede(c.procede)].filter(Boolean).join(' · ') || 'Sans détails') + '</span>' +
          '<span class="carte-cafe__stats">' + echapper(stats) + (best && best.note ? ' · ' + pointsNote(best.note) : '') + '</span></button>';
      }).join('');
    }
    typographier($('#cafes-liste'));
  };
  function ligneTasse(t) {
    var m = methode(t.methode), g = t.gouts || [];
    return '<li class="tasse"><div class="tasse__tete"><span><b>' + echapper(m.nom) + '</b> · ' + quand(t.date) + '</span>' + pointsNote(t.note) + '</div>' +
      '<p class="tasse__reglages">' + echapper(reglages(t)) + '</p>' +
      (g.length ? '<div class="tasse__gouts">' + g.map(function (k) { var x = gout(k); return x ? '<span class="etiquette' + (k === 'equilibre' ? ' etiquette--equilibre' : '') + '">' + echapper(x.nom) + '</span>' : ''; }).join('') + '</div>' : '') +
      (t.notes ? '<p class="tasse__notes">' + echapper(t.notes) + '</p>' : '') +
      '<div class="tasse__actions"><button type="button" class="lien" data-action="rejouer" data-tasse="' + echapper(t.id) + '">Rejouer</button>' +
      '<button type="button" class="lien" data-action="supprimer-tasse" data-tasse="' + echapper(t.id) + '">Supprimer</button></div></li>';
  }
  function ouvrirCafe(cid) {
    var c = cafe(cid);
    if (!c) return rendre.cafes();
    var ts = tassesDu(c.id).sort(parDate), best = meilleureTasse(ts), o = origine(c.origine), boite = $('#cafe-detail');
    var html = '<button type="button" class="retour" data-action="liste-cafes">← Cafés</button>' +
      '<p class="kicker">' + echapper(nomOrigine(c.origine) || 'Café') + '</p>' +
      '<h1 class="titre">' + echapper(c.nom) + '</h1>';
    var meta = [c.torrefacteur, procede(c.procede)].filter(Boolean).join(' · ');
    if (meta) html += '<p class="meta">' + echapper(meta) + '</p>';
    if (best) {
      html += '<div class="encadre"><h2>Votre meilleur réglage</h2><p>' + echapper(methode(best.methode).nom + ' · ' + reglages(best)) + '</p>' +
        '<div class="actions"><button type="button" class="btn btn--petit" data-action="rejouer" data-tasse="' + echapper(best.id) + '">Rejouer ce réglage</button></div></div>';
    }
    if (o && o.guide) html += '<p class="indice">Sur filtré. : <a href="' + D.site + o.guide + '">' + echapper(o.titre || o.nom) + ' →</a></p>';
    html += ts.length ? '<ul class="tasses">' + ts.map(ligneTasse).join('') + '</ul>' : '<p class="vide">Aucune tasse pour ce café.</p>';
    html += '<button type="button" class="lien-danger" data-action="supprimer-cafe" data-cafe="' + echapper(c.id) + '">Supprimer ce café et ses tasses</button>';
    boite.innerHTML = html;
    $('#cafes-liste').hidden = true;
    boite.hidden = false;
    boite.setAttribute('data-cafe', c.id);
    typographier(boite);
    window.scrollTo(0, 0);
  }
  function rejouer(tid) {
    var t = tasse(tid);
    if (!t) return;
    saisie.methode = t.methode; saisie.cafe = t.cafe; saisie.modele = t; saisie.aRafraichir = true;
    $('#conseil').hidden = true;
    viderSaisie();
    aller('noter');
  }
  // Confirmation dans la page : un premier toucher arme le bouton, le second agit. confirm() n'est pas
  // fiable partout (certains cadres le refusent sans rien afficher).
  function confirmer(bouton, libelle, action) {
    if (bouton.classList.contains('a-confirmer')) {
      clearTimeout(bouton.minuterie);
      bouton.classList.remove('a-confirmer');
      bouton.textContent = bouton.getAttribute('data-libelle');
      action();
      return;
    }
    bouton.setAttribute('data-libelle', bouton.textContent);
    bouton.classList.add('a-confirmer');
    bouton.textContent = typo(libelle);
    bouton.minuterie = setTimeout(function () {
      bouton.classList.remove('a-confirmer');
      bouton.textContent = bouton.getAttribute('data-libelle');
    }, 4000);
  }
  function supprimerTasse(tid) {
    var t = tasse(tid);
    etat.tasses = etat.tasses.filter(function (x) { return x.id !== tid; });
    sauver();
    saisie.aRafraichir = true;
    if (t) ouvrirCafe(t.cafe);
  }
  function supprimerCafe(cid) {
    if (!cafe(cid)) return;
    etat.cafes = etat.cafes.filter(function (x) { return x.id !== cid; });
    etat.tasses = etat.tasses.filter(function (x) { return x.cafe !== cid; });
    sauver();
    if (saisie.cafe === cid) saisie.cafe = null;
    saisie.aRafraichir = true;
    rendre.cafes();
  }

  /* ── Carte des origines : le dessin de /cafes-du-monde, recadré sur la ceinture du café ── */
  function X(lon) { return (lon + 180) / 360 * 720; }
  function Y(lat) { return (90 - lat) / 180 * 360; }
  function n1(v) { return Math.round(v * 10) / 10; }
  function comptesOrigines() {
    var compte = {};
    etat.tasses.forEach(function (t) { var c = cafe(t.cafe); if (c && c.origine) compte[c.origine] = (compte[c.origine] || 0) + 1; });
    return compte;
  }
  function point(o, n) {
    var x = n1(X(o.lon)), y = n1(Y(o.lat)), r = n ? Math.min(4 + n * 0.6, 8) : 3.6;
    var droite = x > 600, tx = droite ? x - r - 5 : x + r + 5;
    var nom = o.nom + ' · ' + (n ? n + ' tasse' + (n > 1 ? 's' : '') : 'à découvrir');
    var aria = o.nom + (n ? ', ' + n + ' tasse' + (n > 1 ? 's' : '') : ', à découvrir sur filtré.');
    return '<g class="point ' + (n ? 'point--goutee' : 'point--guide') + '" data-origine="' + o.cle + '" tabindex="0" role="button" aria-label="' + echapper(aria) + '">' +
      '<circle class="zone-tactile" cx="' + x + '" cy="' + y + '" r="12"/>' +
      (n ? '<circle class="onde" cx="' + x + '" cy="' + y + '" r="' + r + '"/>' : '') +
      '<circle class="coeur" cx="' + x + '" cy="' + y + '" r="' + r + '"/>' +
      '<text x="' + tx + '" y="' + (y + 4) + '" text-anchor="' + (droite ? 'end' : 'start') + '">' + echapper(nom) + '</text></g>';
  }
  function svgCarte(compte) {
    var g = '', lon, yt = n1(Y(23.44)), yc = n1(Y(-23.44)), ye = Y(0);
    for (lon = -150; lon <= 180; lon += 30) g += '<line x1="' + X(lon) + '" y1="20" x2="' + X(lon) + '" y2="340"/>';
    [60, 30, -30, -60].forEach(function (lat) { g += '<line x1="0" y1="' + Y(lat) + '" x2="720" y2="' + Y(lat) + '"/>'; });
    var bande = '<rect class="bande" x="0" y="' + yt + '" width="720" height="' + n1(yc - yt) + '"/>' +
      '<line class="tropique" x1="0" y1="' + yt + '" x2="720" y2="' + yt + '"/><line class="tropique" x1="0" y1="' + yc + '" x2="720" y2="' + yc + '"/>' +
      '<line class="equateur" x1="0" y1="' + ye + '" x2="720" y2="' + ye + '"/>';
    var pts = D.origines.filter(function (o) { return o.guide && !compte[o.cle]; }).map(function (o) { return point(o, 0); }).join('') +
      D.origines.filter(function (o) { return compte[o.cle]; }).map(function (o) { return point(o, compte[o.cle]); }).join('');
    return '<svg viewBox="0 96 720 168" role="group" aria-label="Carte des origines, entre les tropiques">' +
      '<g class="grille-carte">' + g + '</g><path class="terres" fill-rule="evenodd" d="' + window.CARNET_TERRES + '"/>' + bande + pts + '</svg>';
  }
  function ligneOrigine(o, n) {
    var lien = o.guide ? '<a href="' + D.site + o.guide + '">' + (n ? 'le guide' : 'Lire le guide') + ' →</a>' : '';
    var info = n ? n + ' tasse' + (n > 1 ? 's' : '') + (lien ? ' · ' + lien : '') : lien;
    return '<li data-origine="' + o.cle + '"><span class="origines__nom">' + echapper(o.nom) + '</span><span class="origines__info">' + info + '</span></li>';
  }
  function centrerCarte() {
    var d = $('#carte-defile'), svg = $('svg', d);
    if (!svg || d.scrollWidth <= d.clientWidth) return;
    var xs = $$('.point--goutee .coeur', svg).map(function (c) { return +c.getAttribute('cx'); });
    var cx = xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : X(30);
    d.scrollLeft = cx / 720 * svg.getBoundingClientRect().width - d.clientWidth / 2;
  }
  // Un point choisi (sur la carte ou dans la liste) affiche son nom et revient au centre de la carte.
  function choisirOrigine(cle) {
    $$('#carte-defile .point').forEach(function (p) { p.classList.toggle('choisi', p.getAttribute('data-origine') === cle && !p.classList.contains('choisi')); });
    var actif = $('#carte-defile .point.choisi'), d = $('#carte-defile');
    $$('#carte-listes li').forEach(function (li) { li.classList.toggle('choisi', !!actif && li.getAttribute('data-origine') === cle); });
    if (actif && d.scrollWidth > d.clientWidth) {
      var cx = +$('.coeur', actif).getAttribute('cx');
      d.scrollTo({ left: cx / 720 * $('svg', d).getBoundingClientRect().width - d.clientWidth / 2, behavior: reduit ? 'auto' : 'smooth' });
    }
  }
  rendre.origines = function () {
    var compte = comptesOrigines();
    var goutees = D.origines.filter(function (o) { return compte[o.cle]; })
      .sort(function (a, b) { return compte[b.cle] - compte[a.cle] || a.nom.localeCompare(b.nom, 'fr'); });
    var aDecouvrir = D.origines.filter(function (o) { return o.guide && !compte[o.cle]; });
    $('#titre-carte').textContent = goutees.length ? goutees.length + (goutees.length > 1 ? ' origines goûtées' : ' origine goûtée') : 'Vos origines';
    $('#carte-defile').innerHTML = svgCarte(compte);
    var html = '<div class="origines">';
    html += goutees.length ? '<h2>Goûtées</h2><ul>' + goutees.map(function (o) { return ligneOrigine(o, compte[o.cle]); }).join('') + '</ul>'
      : '<p class="vide">Chaque café noté pose un point sur la carte. Indiquez l’origine d’un café, notez une tasse, et le point s’allume.</p>';
    if (compte.assemblage) html += '<p class="indice">' + compte.assemblage + ' tasse' + (compte.assemblage > 1 ? 's' : '') + ' d’assemblage : sans origine unique, elles ne figurent pas sur la carte.</p>';
    if (aDecouvrir.length) html += '<h2>À découvrir sur filtré.</h2><ul>' + aDecouvrir.map(function (o) { return ligneOrigine(o, 0); }).join('') + '</ul>';
    $('#carte-listes').innerHTML = html + '</div>';
    typographier($('#carte-listes'));
    typographier($('[data-vue="origines"] .titre'));
    requestAnimationFrame(centrerCarte);
  };

  /* ── Adresses : les maisons de filtré., les coffee shops indépendants d'OpenStreetMap, les vôtres ── */
  var RAYON = 2000;      // mètres : rayon de la recherche et du radar
  var PROCHE = 30000;    // au-delà, une adresse de filtré. passe dans « Ailleurs en France »
  var CLE_LIEU = 'filtre-carnet-lieu';
  var lieu = null;       // point de départ : { nom, lat, lon, gps }
  var osm = { cle: null, etat: 'vide', lieux: [] };
  var resultatsLieu = [], choixAdresse = null;
  var OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  // Chaînes et faux amis (thé, capsules, CBD) écartés : il reste les indépendants.
  var CHAINES = /starbucks|columbus|costa coffee|mc ?caf|nespresso|brioche dor|coffee shop company|caf[ée] coton|french coffee shop|(^|\W)cosi(\W|$)|capsul|(^|\W)cbd(\W|$)|bubble|boba|(^|\W)tea(\W|$)|(^|\W)thé(\W|$)/i;

  function rad(x) { return x * Math.PI / 180; }
  function distance(a, b) {
    var dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    var h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.pow(Math.sin(dLon / 2), 2);
    return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function ecrireDistance(m) {
    if (m < 1000) return Math.max(10, Math.round(m / 10) * 10) + ' m';
    return (m < 10000 ? fr(Math.round(m / 100) / 10) : Math.round(m / 1000)) + ' km';
  }
  function aPied(m) { return m <= 3000 ? ' · ' + Math.max(1, Math.round(m / 80)) + ' min à pied' : ''; }
  function itineraire(a) {
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return ios ? 'https://maps.apple.com/?daddr=' + a.lat + ',' + a.lon + '&dirflg=w&q=' + encodeURIComponent(a.nom)
      : 'https://www.google.com/maps/dir/?api=1&destination=' + a.lat + ',' + a.lon + '&travelmode=walking';
  }
  function independant(t) {
    return !!t.name && !t.brand && !t['brand:wikidata'] && !/bubble_tea/.test(t.cuisine || '') && !CHAINES.test(t.name);
  }
  // Coffee shops (amenity=cafe + cuisine=coffee_shop) et boutiques de café (shop=coffee) autour d'un point.
  // Deux serveurs Overpass publics : le second si le premier ne répond pas.
  function interrogerOverpass(lat, lon, rayon) {
    var autour = '(around:' + rayon + ',' + lat + ',' + lon + ')';
    var q = '[out:json][timeout:20];(nwr["amenity"="cafe"]["cuisine"~"coffee_shop"]' + autour + ';nwr["shop"="coffee"]' + autour + ';);out center tags 120;';
    function essai(i) {
      if (i >= OVERPASS.length) return Promise.reject(new Error('Overpass injoignable'));
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var minuterie = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      return fetch(OVERPASS[i], { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (d) {
          clearTimeout(minuterie);
          return (d.elements || []).filter(function (e) { return e.tags && independant(e.tags); }).map(function (e) {
            var t = e.tags, c = e.center || e;
            return { id: e.type + '/' + e.id, nom: t.name, lat: c.lat, lon: c.lon, adresse: [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' '), type: t.shop === 'coffee' ? 'boutique' : 'cafe' };
          });
        })
        .catch(function () { clearTimeout(minuterie); return essai(i + 1); });
    }
    return essai(0);
  }
  // CARNET_SOURCE_OSM : source de remplacement (l'aperçu, qui ne peut pas joindre Overpass, y met un échantillon).
  var sourceOSM = window.CARNET_SOURCE_OSM || interrogerOverpass;
  // Recherche d'une ville ou d'une adresse : Géoplateforme de l'IGN, sans clé.
  function chercherLieux(q) {
    return fetch('https://data.geopf.fr/geocodage/search?limit=5&q=' + encodeURIComponent(q))
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        return (d.features || []).map(function (f) {
          var p = f.properties || {};
          return { nom: p.label || q, detail: p.context || '', lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
        });
      });
  }
  function cleLieu() { return lieu ? Math.round(lieu.lat * 1000) / 1000 + ',' + Math.round(lieu.lon * 1000) / 1000 : null; }
  function lieuGarde() {
    try {
      var l = JSON.parse(localStorage.getItem(CLE_LIEU) || 'null');
      if (l && typeof l.nom === 'string' && isFinite(l.lat) && isFinite(l.lon)) return l;
    } catch (e) { /* pas de ville gardée */ }
    return null;
  }
  function choisirLieu(l) {
    lieu = l;
    // Une ville choisie est gardée pour la prochaine visite ; une position GPS, jamais.
    if (!l.gps) { try { localStorage.setItem(CLE_LIEU, JSON.stringify({ nom: l.nom, lat: l.lat, lon: l.lon })); } catch (e) { /* simple confort */ } }
    $('#resultats-lieu').hidden = true;
    choixAdresse = null;
    rendre.adresses();
  }
  // La position part arrondie à 100 m ; une recherche en échec ne se relance que sur demande.
  function chargerOSM() {
    var cle = cleLieu(), p = cle.split(',');
    osm = { cle: cle, etat: 'chargement', lieux: [] };
    sourceOSM(+p[0], +p[1], RAYON).then(function (lieux) {
      if (osm.cle !== cle) return;
      osm.etat = 'ok'; osm.lieux = lieux;
      if (!$('[data-vue="adresses"]').hidden) rendre.adresses();
    }, function () {
      if (osm.cle !== cle) return;
      osm.etat = 'erreur';
      if (!$('[data-vue="adresses"]').hidden) rendre.adresses();
    });
  }
  function meLocaliser() {
    var b = $('#me-localiser');
    if (!navigator.geolocation) { message('La localisation n’est pas disponible ici. Choisissez une ville.'); return; }
    b.disabled = true;
    b.textContent = 'Localisation…';
    // Sans réponse à la demande d'autorisation, le bouton revient au bout de 20 s.
    setTimeout(function () { if (b.disabled) { b.disabled = false; b.textContent = 'Me localiser'; } }, 20000);
    navigator.geolocation.getCurrentPosition(function (p) {
      b.disabled = false; b.textContent = 'Me localiser';
      choisirLieu({ nom: 'votre position', lat: p.coords.latitude, lon: p.coords.longitude, gps: true });
    }, function () {
      b.disabled = false; b.textContent = 'Me localiser';
      message('Position indisponible. Autorisez la localisation, ou choisissez une ville.');
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }
  function rechercherLieu(e) {
    e.preventDefault();
    var q = $('#champ-lieu').value.trim(), boite = $('#resultats-lieu');
    if (q.length < 2) return;
    boite.innerHTML = '<p class="indice">Recherche…</p>';
    boite.hidden = false;
    chercherLieux(q).then(function (liste) {
      resultatsLieu = liste;
      boite.innerHTML = liste.length ? liste.map(function (l, i) {
        return '<button type="button" data-lieu="' + i + '">' + echapper(l.nom) + (l.detail ? '<small>' + echapper(l.detail) + '</small>' : '') + '</button>';
      }).join('') : '<p class="indice">Aucun lieu trouvé pour « ' + echapper(q) + ' ».</p>';
      typographier(boite);
    }, function () {
      boite.hidden = true;
      message('Recherche indisponible pour l’instant. Choisissez une ville ci-dessous.');
    });
  }

  function gardee(cle) { return premier(etat.adresses, function (x) { return x.cle === cle; }); }
  function trouverAdresse(cle) {
    var id = cle.slice(2);
    return gardee(cle) || (cle.charAt(0) === 'f' ? premier(D.adresses, function (a) { return a.id === id; }) : premier(osm.lieux, function (a) { return a.id === id; }));
  }
  function basculerGarde(cle) {
    var g = gardee(cle), a = trouverAdresse(cle);
    if (g) etat.adresses = etat.adresses.filter(function (x) { return x.cle !== cle; });
    else if (a) etat.adresses.push({ cle: cle, nom: a.nom, type: a.type, adresse: a.adresse || '', ville: a.ville || '', lat: a.lat, lon: a.lon, guide: a.guide || null, garde: new Date().toISOString() });
    else return;
    sauver();
    rendre.adresses();
    message(g ? 'Retirée de vos adresses.' : 'Gardée dans vos adresses.');
  }
  function ligneAdresse(x) {
    var a = x.a, g = !!gardee(x.cle), guide = a.guide && D.guidesAdresses[a.guide];
    var meta = (a.type === 'boutique' ? 'Boutique' : 'Café') + ([a.adresse, a.ville].filter(Boolean).length ? ' · ' + [a.adresse, a.ville].filter(Boolean).join(', ') : '');
    return '<li class="adresse" data-adresse="' + echapper(x.cle) + '">' +
      '<div class="adresse__tete"><span class="adresse__nom">' + echapper(a.nom) + '</span>' + (x.d != null ? '<span class="adresse__distance">' + ecrireDistance(x.d) + aPied(x.d) + '</span>' : '') + '</div>' +
      '<p class="adresse__meta">' + echapper(meta) + '</p>' +
      (a.choix && guide ? '<span class="adresse__badge">Dans la sélection « ' + echapper(guide[1]) + ' »</span>' : '') +
      '<div class="adresse__actions"><a href="' + echapper(itineraire(a)) + '" target="_blank" rel="noopener">Itinéraire</a>' +
      (guide ? '<a href="' + D.site + guide[0] + '">L’article →</a>' : '') +
      '<button type="button" class="lien" data-action="garder" data-adresse="' + echapper(x.cle) + '" aria-pressed="' + g + '">' + (g ? 'Gardée' : 'Garder') + '</button></div></li>';
  }
  // Radar : le point de départ au centre, le nord en haut, des anneaux à 500 m, 1 km et 2 km.
  function radar(proches, autour, mes) {
    var T = 340, C = T / 2, R = 150, k = R / RAYON, cosLat = Math.cos(rad(lieu.lat)), s = '';
    function xy(a) { return [C + (a.lon - lieu.lon) * cosLat * 111320 * k, C - (a.lat - lieu.lat) * 110540 * k]; }
    function pt(x, classe) {
      var p = xy(x.a);
      if (Math.sqrt(Math.pow(p[0] - C, 2) + Math.pow(p[1] - C, 2)) > R + 2) return '';
      var r = classe === 'osm' ? 3.4 : 4.6, gauche = p[0] > C + R * 0.4, px = n1(p[0]), py = n1(p[1]);
      return '<g class="radar__point radar__point--' + classe + '" data-adresse="' + echapper(x.cle) + '" tabindex="0" role="button" aria-label="' + echapper(x.a.nom + ', ' + ecrireDistance(x.d)) + '">' +
        '<circle class="zone-tactile" cx="' + px + '" cy="' + py + '" r="11"/><circle class="coeur" cx="' + px + '" cy="' + py + '" r="' + r + '"/>' +
        '<text x="' + n1(gauche ? p[0] - r - 4 : p[0] + r + 4) + '" y="' + n1(p[1] + 4) + '" text-anchor="' + (gauche ? 'end' : 'start') + '">' + echapper(x.a.nom) + '</text></g>';
    }
    s += '<line class="radar__axe" x1="' + C + '" y1="' + (C - R - 6) + '" x2="' + C + '" y2="' + (C + R + 6) + '"/>' +
      '<line class="radar__axe" x1="' + (C - R - 6) + '" y1="' + C + '" x2="' + (C + R + 6) + '" y2="' + C + '"/>';
    [[500, '500 m'], [1000, '1 km'], [2000, '2 km']].forEach(function (a) {
      s += '<circle class="radar__anneau" cx="' + C + '" cy="' + C + '" r="' + n1(a[0] * k) + '"/>' +
        '<text class="radar__echelle" x="' + (C + 6) + '" y="' + n1(C - a[0] * k - 4) + '">' + a[1] + '</text>';
    });
    s += '<text class="radar__nord" x="' + C + '" y="11" text-anchor="middle">N</text>';
    var garde = {};
    mes.forEach(function (x) { garde[x.cle] = true; });
    s += autour.filter(function (x) { return !garde[x.cle]; }).map(function (x) { return pt(x, 'osm'); }).join('');
    s += proches.filter(function (x) { return !garde[x.cle]; }).map(function (x) { return pt(x, 'filtre'); }).join('');
    s += mes.filter(function (x) { return x.d != null; }).map(function (x) { return pt(x, 'garde'); }).join('');
    s += (lieu.gps ? '<circle class="onde radar__centre-onde" cx="' + C + '" cy="' + C + '" r="6"/>' : '') +
      '<circle class="radar__centre" cx="' + C + '" cy="' + C + '" r="' + (lieu.gps ? 5 : 3.5) + '"/>';
    return '<svg viewBox="0 0 ' + T + ' ' + T + '" role="group" aria-label="Radar des adresses à moins de 2 km">' + s + '</svg>' +
      '<p class="radar__legende"><span class="pastille pastille--filtre"></span>filtré. <span class="pastille pastille--osm"></span>OpenStreetMap' +
      (mes.length ? ' <span class="pastille pastille--garde"></span>vos adresses' : '') + '</p>';
  }
  function choisirAdresse(cle, depuisRadar) {
    choixAdresse = choixAdresse === cle ? null : cle;
    $$('#radar .radar__point').forEach(function (p) { p.classList.toggle('choisi', p.getAttribute('data-adresse') === choixAdresse); });
    $$('#listes-adresses .adresse').forEach(function (li) { li.classList.toggle('choisi', li.getAttribute('data-adresse') === choixAdresse); });
    if (choixAdresse && depuisRadar) {
      var li = premier($$('#listes-adresses .adresse'), function (x) { return x.getAttribute('data-adresse') === choixAdresse; });
      if (li) li.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' });
    }
  }
  rendre.adresses = function () {
    if (!lieu) lieu = lieuGarde();
    if (lieu && osm.cle !== cleLieu()) chargerOSM();
    var info = $('#lieu-actuel'), html = '<div class="adresses">';
    var parDistance = function (x, y) { return x.d - y.d; };
    var avecDistance = function (a, cle) { return { a: a, cle: cle, d: lieu ? distance(lieu, a) : null }; };
    var f = D.adresses.map(function (a) { return avecDistance(a, 'f:' + a.id); });
    var mes = etat.adresses.map(function (a) { return avecDistance(a, a.cle); });
    var proches = lieu ? f.filter(function (x) { return x.d <= PROCHE; }).sort(parDistance) : [];
    var loin = lieu ? f.filter(function (x) { return x.d > PROCHE; }) : f;
    var autour = !lieu || osm.etat !== 'ok' ? [] : osm.lieux
      .filter(function (o) { return !premier(D.adresses, function (a) { return distance(a, o) < 60; }); })
      .map(function (o) { return avecDistance(o, 'o:' + o.id); }).sort(parDistance).slice(0, 40);
    marquer($('#puces-villes'), lieu && !lieu.gps ? D.villes.filter(function (v) { return v.nom === lieu.nom; }).map(function (v) { return v.cle; }) : []);
    info.innerHTML = lieu ? 'Autour de <b>' + echapper(lieu.nom) + '</b>, dans un rayon de 2 km.' : '';
    info.hidden = !lieu;
    $('#radar').innerHTML = lieu ? radar(proches, autour, mes) : '';
    $('#radar').hidden = !lieu;
    // Les plus proches d'abord ; le reste se déplie.
    var liste = function (items, visibles, suite) {
      if (items.length <= visibles + 2) return '<ul>' + items.map(ligneAdresse).join('') + '</ul>';
      return '<ul>' + items.slice(0, visibles).map(ligneAdresse).join('') + '</ul><details class="ville"><summary>' + suite +
        ' <span>· ' + (items.length - visibles) + '</span></summary><ul>' + items.slice(visibles).map(ligneAdresse).join('') + '</ul></details>';
    };
    if (mes.length) html += '<h2>Vos adresses</h2>' + liste(lieu ? mes.sort(parDistance) : mes, 6, 'Les autres');
    if (lieu) {
      html += '<h2>Les adresses de filtré.</h2>' + (proches.length ? liste(proches, 6, 'Plus loin')
        : '<p class="etat-osm">Aucune adresse de filtré. à moins de 30 km. Les villes couvertes sont plus bas.</p>');
      html += '<h2>Coffee shops du quartier</h2><p class="indice">Indépendants recensés par OpenStreetMap, non testés par filtré. Les chaînes sont écartées.</p>';
      if (osm.etat === 'chargement') html += '<p class="etat-osm">Recherche autour de ' + echapper(lieu.nom) + '…</p>';
      else if (osm.etat === 'erreur') html += '<p class="etat-osm">OpenStreetMap ne répond pas pour l’instant. <button type="button" class="lien" data-action="osm-reessayer">Réessayer</button></p>';
      else html += autour.length ? liste(autour, 10, 'Les autres') : '<p class="etat-osm">Aucun coffee shop indépendant recensé à moins de 2 km.</p>';
    } else {
      html += '<p class="vide">Choisissez un point de départ, votre position ou une ville : les adresses de filtré. et les coffee shops du quartier s’affichent autour.</p>';
    }
    var villes = {};
    loin.forEach(function (x) { var v = x.a.ville.split(' ')[0]; (villes[v] = villes[v] || []).push(x); });
    var noms = Object.keys(villes);
    if (noms.length) {
      html += '<h2>' + (lieu ? 'Ailleurs en France' : 'Les adresses de filtré.') + '</h2>' + noms.map(function (v) {
        var n = villes[v].length;
        return '<details class="ville"><summary>' + echapper(v) + ' <span>· ' + n + ' adresse' + (n > 1 ? 's' : '') + '</span></summary><ul>' + villes[v].map(ligneAdresse).join('') + '</ul></details>';
      }).join('');
    }
    $('#listes-adresses').innerHTML = html + '</div>';
    if (choixAdresse) { var c = choixAdresse; choixAdresse = null; choisirAdresse(c); }
    typographier($('[data-vue="adresses"]'));
  };

  /* ── Apparence : celle du téléphone, ou claire, ou sombre (choix gardé sur l'appareil) ── */
  var CLE_THEME = 'filtre-carnet-theme';
  var THEMES = [{ cle: 'auto', nom: 'Comme le téléphone' }, { cle: 'clair', nom: 'Clair' }, { cle: 'sombre', nom: 'Sombre' }];
  function lireTheme() { try { return localStorage.getItem(CLE_THEME) || 'auto'; } catch (e) { return 'auto'; } }
  // Le lecteur d'un aperçu peut poser son propre data-theme : « Comme le téléphone » le lui rend.
  var themeHote = lireTheme() === 'auto' ? document.documentElement.getAttribute('data-theme') : null;
  function appliquerTheme(t) {
    var r = document.documentElement;
    if (t === 'clair') r.setAttribute('data-theme', 'light');
    else if (t === 'sombre') r.setAttribute('data-theme', 'dark');
    else if (themeHote) r.setAttribute('data-theme', themeHote);
    else r.removeAttribute('data-theme');
    marquer($('#puces-theme'), [t]);
  }
  function choisirTheme(t) {
    try { if (t === 'auto') localStorage.removeItem(CLE_THEME); else localStorage.setItem(CLE_THEME, t); } catch (e) { /* le choix vaut pour cette visite */ }
    appliquerTheme(t);
  }

  /* ── Données : export, import, effacement ── */
  function installe() {
    return window.navigator.standalone === true || !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }
  rendre.donnees = function () {
    var nc = etat.cafes.length, nt = etat.tasses.length, na = etat.adresses.length;
    $('#resume-donnees').textContent = nc + ' café' + (nc > 1 ? 's' : '') + ' · ' + nt + ' tasse' + (nt > 1 ? 's' : '') +
      (na ? ' · ' + na + ' adresse' + (na > 1 ? 's' : '') : '') + ' dans le carnet';
    marquer($('#puces-theme'), [lireTheme()]);
    $('#encadre-installer').hidden = installe();
    $('#encadre-installe').hidden = !installe();
    $('#exporter').disabled = $('#copier-export').disabled = !nc && !nt;
    $('#zone-export').hidden = true;
    typographier($('[data-vue="donnees"]'));
  };
  function exporter() {
    var nom = 'carnet-filtre-' + new Date().toISOString().slice(0, 10) + '.json';
    var blob = new Blob([JSON.stringify(etat, null, 2)], { type: 'application/json' });
    var fichier = typeof File === 'function' ? new File([blob], nom, { type: 'application/json' }) : null;
    var tactile = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (tactile && fichier && navigator.canShare && navigator.canShare({ files: [fichier] })) {
      navigator.share({ files: [fichier], title: 'Carnet filtré.' }).catch(function () {});
      return;
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  // Copie de l'export, à coller dans une note : une sauvegarde sans fichier.
  function copierExport() {
    var texte = JSON.stringify(etat, null, 2), zone = $('#zone-export');
    var aLaMain = function () {
      zone.value = texte;
      zone.hidden = false;
      zone.focus();
      zone.select();
      message('Le texte est sélectionné : copiez-le.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { zone.hidden = true; message('Export copié. Collez-le dans une note pour le garder.'); }, aLaMain);
    } else aLaMain();
  }
  function importer(fichier) {
    var lecteur = new FileReader();
    lecteur.onload = function () {
      var d;
      try { d = JSON.parse(lecteur.result); } catch (e) { d = null; }
      if (!d || d.version !== 1 || !Array.isArray(d.cafes) || !Array.isArray(d.tasses)) { message('Ce fichier n’est pas un export du carnet.'); return; }
      var connus = {}, n = { cafes: 0, tasses: 0, adresses: 0 };
      etat.cafes.concat(etat.tasses).forEach(function (x) { connus[x.id] = true; });
      d.cafes.forEach(function (c) { if (c && typeof c.id === 'string' && typeof c.nom === 'string' && !connus[c.id]) { etat.cafes.push(c); n.cafes++; } });
      d.tasses.forEach(function (t) {
        if (t && typeof t.id === 'string' && typeof t.cafe === 'string' && typeof t.date === 'string' && !connus[t.id]) { etat.tasses.push(t); n.tasses++; }
      });
      (Array.isArray(d.adresses) ? d.adresses : []).forEach(function (a) {
        if (a && typeof a.cle === 'string' && typeof a.nom === 'string' && isFinite(a.lat) && isFinite(a.lon) && !gardee(a.cle)) { etat.adresses.push(a); n.adresses++; }
      });
      sauver();
      saisie.aRafraichir = true;
      rendre.donnees();
      message(n.cafes + ' café' + (n.cafes > 1 ? 's' : '') + ' et ' + n.tasses + ' tasse' + (n.tasses > 1 ? 's' : '') + ' ajoutés' +
        (n.adresses ? ', plus ' + n.adresses + ' adresse' + (n.adresses > 1 ? 's' : '') : '') + '.');
    };
    lecteur.readAsText(fichier);
  }
  function effacer() {
    etat = vide();
    sauver();
    saisie.cafe = null; saisie.methode = null; saisie.aRafraichir = true;
    $('#conseil').hidden = true;
    rendre.donnees();
    message('Carnet effacé.');
  }

  /* ── Message bref ── */
  var minuterieMessage;
  function message(t) {
    var m = $('#message');
    m.textContent = typo(t);
    m.hidden = false;
    clearTimeout(minuterieMessage);
    minuterieMessage = setTimeout(function () { m.hidden = true; }, 3400);
  }

  /* ── Démarrage ── */
  puces($('#puces-methode'), D.methodes);
  puces($('#puces-gout'), D.gouts);
  puces($('#puces-procede'), D.procedes);
  puces($('#puces-villes'), D.villes);
  puces($('#puces-theme'), THEMES);
  appliquerTheme(lireTheme());
  remplirOrigines();
  $('#note').innerHTML = [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-note="' + n + '" aria-pressed="false" aria-label="' + n + ' sur 5">' + n + '</button>'; }).join('');
  $$('[placeholder]').forEach(function (el) { el.placeholder = typo(el.placeholder); });

  $('#puces-methode').addEventListener('click', function (e) {
    var b = e.target.closest('.puce');
    if (!b) return;
    saisie.methode = b.getAttribute('data-cle');
    marquer(this, [saisie.methode]);
    preRemplir();
  });
  $('#puces-gout').addEventListener('click', function (e) { var b = e.target.closest('.puce'); if (b) basculerGout(b.getAttribute('data-cle')); });
  $('#puces-procede').addEventListener('click', function (e) {
    var b = e.target.closest('.puce');
    if (!b) return;
    var k = b.getAttribute('data-cle');
    saisie.procede = saisie.procede === k ? null : k;
    marquer(this, saisie.procede ? [saisie.procede] : []);
  });
  $('#note').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var n = +b.getAttribute('data-note');
    saisie.note = saisie.note === n ? null : n;
    majNote();
  });
  $('#champ-cafe').addEventListener('change', function () {
    $('#nouveau-cafe').hidden = this.value !== 'nouveau';
    saisie.cafe = cafeChoisi();
    preRemplir();
    if (this.value === 'nouveau') $('#cafe-nom').focus();
  });
  ['#t-dose', '#t-eau'].forEach(function (s) { $(s).addEventListener('input', majRatio); });
  $('#chrono').addEventListener('click', basculerChrono);
  $('#form-tasse').addEventListener('submit', enregistrer);
  $('#exporter').addEventListener('click', exporter);
  $('#copier-export').addEventListener('click', copierExport);
  $('#importer').addEventListener('change', function () { if (this.files[0]) importer(this.files[0]); this.value = ''; });
  $('#effacer').addEventListener('click', function () { confirmer(this, 'Toucher encore pour tout effacer', effacer); });
  $('#carte-defile').addEventListener('click', function (e) { var p = e.target.closest('.point'); if (p) choisirOrigine(p.getAttribute('data-origine')); });
  $('#carte-defile').addEventListener('keydown', function (e) {
    var p = e.target.closest('.point');
    if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choisirOrigine(p.getAttribute('data-origine')); }
  });
  $('#carte-listes').addEventListener('click', function (e) {
    var li = e.target.closest('li[data-origine]');
    if (!li || e.target.closest('a')) return;
    choisirOrigine(li.getAttribute('data-origine'));
    $('.carte-monde').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' });
  });
  $('#puces-theme').addEventListener('click', function (e) { var b = e.target.closest('.puce'); if (b) choisirTheme(b.getAttribute('data-cle')); });
  $('#me-localiser').addEventListener('click', meLocaliser);
  $('#form-lieu').addEventListener('submit', rechercherLieu);
  $('#resultats-lieu').addEventListener('click', function (e) {
    var b = e.target.closest('[data-lieu]');
    if (b) choisirLieu(resultatsLieu[+b.getAttribute('data-lieu')]);
  });
  $('#puces-villes').addEventListener('click', function (e) {
    var b = e.target.closest('.puce');
    if (b) choisirLieu(premier(D.villes, function (v) { return v.cle === b.getAttribute('data-cle'); }));
  });
  $('#radar').addEventListener('click', function (e) { var p = e.target.closest('.radar__point'); if (p) choisirAdresse(p.getAttribute('data-adresse'), true); });
  $('#radar').addEventListener('keydown', function (e) {
    var p = e.target.closest('.radar__point');
    if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choisirAdresse(p.getAttribute('data-adresse'), true); }
  });
  $('#listes-adresses').addEventListener('click', function (e) {
    var li = e.target.closest('.adresse');
    if (li && !e.target.closest('a, button')) choisirAdresse(li.getAttribute('data-adresse'));
  });
  document.addEventListener('click', function (e) {
    var onglet = e.target.closest('[data-vers]');
    if (onglet) { aller(onglet.getAttribute('data-vers')); return; }
    var b = e.target.closest('[data-action]');
    if (!b) return;
    var a = b.getAttribute('data-action');
    if (a === 'ouvrir-cafe' || a === 'voir-cafe') { if (a === 'voir-cafe') aller('cafes'); ouvrirCafe(b.getAttribute('data-cafe')); }
    else if (a === 'liste-cafes') rendre.cafes();
    else if (a === 'rejouer') rejouer(b.getAttribute('data-tasse'));
    else if (a === 'annuler') annuler(b.getAttribute('data-tasse'));
    else if (a === 'garder') basculerGarde(b.getAttribute('data-adresse'));
    else if (a === 'osm-reessayer') { osm.cle = null; rendre.adresses(); }
    else if (a === 'supprimer-tasse') confirmer(b, 'Toucher encore pour supprimer', function () { supprimerTasse(b.getAttribute('data-tasse')); });
    else if (a === 'supprimer-cafe') {
      var n = tassesDu(b.getAttribute('data-cafe')).length;
      confirmer(b, 'Toucher encore pour supprimer le café et ' + (n > 1 ? 'ses ' + n + ' tasses' : n ? 'sa tasse' : 'rien d’autre'), function () { supprimerCafe(b.getAttribute('data-cafe')); });
    }
  });

  typographier(document.body);
  aller(location.hash.slice(1));
  window.addEventListener('hashchange', function () { aller(location.hash.slice(1)); });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne indisponible, le carnet marche quand même */ });
  }
})();
