/* Carnet filtré. : données de référence. Chiffres repris des recettes du site (HowTo des guides). */
var CARNET = {
  site: 'https://filtre.cafe',

  // temps : fenêtre de temps total (secondes) quand le guide en donne une, sinon null.
  // enTasse : on pèse la boisson (espresso), pas l'eau versée. heures : infusion comptée en heures.
  // tour : le temps intermédiaire que le chrono propose de noter (fin du bloom, ou première goutte de l'espresso).
  methodes: [
    { cle: 'v60', nom: 'V60', dose: 15, eau: 250, temperature: 93, mouture: 'médium, sucre fin', temps: [150, 210], tour: 'bloom', guide: '/journal/v60-guide-complet' },
    { cle: 'chemex', nom: 'Chemex', dose: 45, eau: 750, temperature: 94, mouture: 'médium-grossière', temps: [240, 300], tour: 'bloom', guide: '/journal/chemex-guide-complet' },
    { cle: 'aeropress', nom: 'AeroPress', dose: 16, eau: 210, temperature: 88, mouture: 'médium-fine', temps: null, guide: '/journal/aeropress-guide-complet' },
    { cle: 'piston', nom: 'Piston', dose: 15, eau: 250, temperature: 93, mouture: 'grossière, sucre gros', temps: null, guide: '/journal/french-press-guide' },
    { cle: 'espresso', nom: 'Espresso', dose: 18, eau: 36, temperature: 93, mouture: 'fine, sable fin', temps: [25, 30], enTasse: true, tour: 'goutte', guide: '/journal/comment-faire-espresso-parfait' },
    { cle: 'moka', nom: 'Moka', dose: null, eau: null, temperature: null, mouture: 'médium, panier à ras', temps: null, guide: '/journal/moka-pot-guide-complet' },
    { cle: 'kasuya', nom: '4:6', dose: 20, eau: 300, temperature: 93, mouture: 'médium-grossière', temps: null, tour: 'bloom', guide: '/journal/methode-4-6-kasuya' },
    { cle: 'switch', nom: 'Switch', dose: 20, eau: 300, temperature: 93, mouture: 'moyenne', temps: null, tour: 'bloom', guide: '/journal/hario-switch-guide-recettes' },
    { cle: 'glace', nom: 'Glacé', dose: 22, eau: 220, temperature: 93, mouture: 'moyenne, un cran plus fine qu’en V60', temps: null, tour: 'bloom', guide: '/journal/cafe-glace-maison' },
    { cle: 'coldbrew', nom: 'Cold brew', dose: 100, eau: 1000, temperature: null, mouture: 'très grossière', temps: null, heures: [12, 16], guide: '/journal/cold-brew-maison' }
  ],

  // Coordonnées approchées des grandes régions caféières (projection de la carte de /cafes-du-monde).
  // guide et titre : la page filtré. qui en parle, quand elle existe.
  origines: [
    { cle: 'ethiopie', nom: 'Éthiopie', zone: 'afrique', lat: 7.9, lon: 38.7, guide: '/journal/cafe-ethiopien-yirgacheffe-sidama-guji', titre: 'Café éthiopien : Yirgacheffe, Sidama, Guji' },
    { cle: 'kenya', nom: 'Kenya', zone: 'afrique', lat: -0.4, lon: 36.9, guide: '/journal/cafe-kenya-guide', titre: 'Café du Kenya' },
    { cle: 'rwanda', nom: 'Rwanda', zone: 'afrique', lat: -2, lon: 29.9 },
    { cle: 'burundi', nom: 'Burundi', zone: 'afrique', lat: -3.4, lon: 29.9 },
    { cle: 'rdc', nom: 'RD Congo', zone: 'afrique', lat: -2.5, lon: 28.9 },
    { cle: 'ouganda', nom: 'Ouganda', zone: 'afrique', lat: 1.1, lon: 34.2 },
    { cle: 'tanzanie', nom: 'Tanzanie', zone: 'afrique', lat: -3.3, lon: 37.3 },
    { cle: 'yemen', nom: 'Yémen', zone: 'afrique', lat: 15.3, lon: 44.2 },
    { cle: 'colombie', nom: 'Colombie', zone: 'ameriques', lat: 4.6, lon: -74.1, guide: '/journal/cafe-colombie-specialite', titre: 'Café de Colombie' },
    { cle: 'bresil', nom: 'Brésil', zone: 'ameriques', lat: -18.5, lon: -44.5, guide: '/journal/cafe-bresil-specialite', titre: 'Café du Brésil' },
    { cle: 'guatemala', nom: 'Guatemala', zone: 'ameriques', lat: 14.6, lon: -90.5, guide: '/journal/cafe-guatemala-specialite', titre: 'Café du Guatemala : Antigua, Huehuetenango' },
    { cle: 'panama', nom: 'Panama', zone: 'ameriques', lat: 8.8, lon: -82.4, guide: '/journal/cafe-geisha-gesha-guide', titre: 'Café geisha : le plus prisé au monde' },
    { cle: 'salvador', nom: 'Salvador', zone: 'ameriques', lat: 13.9, lon: -89.6 },
    { cle: 'honduras', nom: 'Honduras', zone: 'ameriques', lat: 14.6, lon: -88.2 },
    { cle: 'nicaragua', nom: 'Nicaragua', zone: 'ameriques', lat: 13.1, lon: -86 },
    { cle: 'costarica', nom: 'Costa Rica', zone: 'ameriques', lat: 9.7, lon: -84 },
    { cle: 'mexique', nom: 'Mexique', zone: 'ameriques', lat: 17, lon: -96.5 },
    { cle: 'jamaique', nom: 'Jamaïque', zone: 'ameriques', lat: 18.1, lon: -76.6 },
    { cle: 'cuba', nom: 'Cuba', zone: 'ameriques', lat: 20.1, lon: -76.2 },
    { cle: 'perou', nom: 'Pérou', zone: 'ameriques', lat: -5.7, lon: -78.8 },
    { cle: 'equateur', nom: 'Équateur', zone: 'ameriques', lat: -4, lon: -79.2 },
    { cle: 'bolivie', nom: 'Bolivie', zone: 'ameriques', lat: -16.2, lon: -67.7 },
    { cle: 'hawai', nom: 'Hawaï', zone: 'ameriques', lat: 19.6, lon: -155.9 },
    { cle: 'indonesie', nom: 'Indonésie', zone: 'asie', lat: 2.5, lon: 98.5, guide: '/journal/cafe-indonesie-specialite', titre: 'Café d’Indonésie : Sumatra, Java, Bali' },
    { cle: 'vietnam', nom: 'Vietnam', zone: 'asie', lat: 11.9, lon: 108.4, guide: '/journal/cafe-au-vietnam', titre: 'Café au Vietnam : robusta, specialty et rituels' },
    { cle: 'thailande', nom: 'Thaïlande', zone: 'asie', lat: 20.1, lon: 99.8, guide: '/journal/cafe-en-thailande', titre: 'Café en Thaïlande : Doi Chang et l’arabica' },
    { cle: 'myanmar', nom: 'Myanmar', zone: 'asie', lat: 20.8, lon: 97 },
    { cle: 'laos', nom: 'Laos', zone: 'asie', lat: 15.1, lon: 106.4 },
    { cle: 'chine', nom: 'Chine (Yunnan)', zone: 'asie', lat: 22.8, lon: 100.9 },
    { cle: 'inde', nom: 'Inde', zone: 'asie', lat: 13.3, lon: 75.8 },
    { cle: 'png', nom: 'Papouasie-Nouvelle-Guinée', zone: 'asie', lat: -6.1, lon: 145.4 },
    { cle: 'timor', nom: 'Timor oriental', zone: 'asie', lat: -8.8, lon: 125.6 }
  ],
  zones: { afrique: 'Afrique et Yémen', ameriques: 'Amériques', asie: 'Asie et Océanie' },

  // Adresses des maisons recommandées sur filtré. Positions : © contributeurs OpenStreetMap (ODbL), relevées le
  // 18 octobre 2026. choix : adresse retenue dans « Meilleurs cafés de spécialité à Paris ». Absentes faute de
  // position vérifiée : Café Oberkampf, La Brûlerie du Cantin, Ximun. MUDA et Cloudforest ne sont pas goûtées.
  adresses: [
    { id: 'lomi', nom: 'Café Lomi', type: 'cafe', adresse: '3 ter rue Marcadet', ville: 'Paris 18e', lat: 48.89031, lon: 2.35526, choix: true, guide: 'paris' },
    { id: 'terres-6', nom: 'Terres de Café', type: 'boutique', adresse: 'rue de Bourbon-le-Château', ville: 'Paris 6e', lat: 48.85387, lon: 2.33631, choix: true, guide: 'paris' },
    { id: 'coutume-7', nom: 'Coutume', type: 'cafe', adresse: '47 rue de Babylone', ville: 'Paris 7e', lat: 48.85166, lon: 2.3183, choix: true, guide: 'paris' },
    { id: 'ten-belles', nom: 'Ten Belles', type: 'cafe', adresse: '10 rue de la Grange-aux-Belles', ville: 'Paris 10e', lat: 48.87349, lon: 2.36474, choix: true, guide: 'paris' },
    { id: 'tanat-1', nom: 'Tanat', type: 'cafe', adresse: '22 avenue Victoria', ville: 'Paris 1er', lat: 48.85833, lon: 2.34621, choix: true, guide: 'paris' },
    { id: 'tanat-2', nom: 'Tanat', type: 'cafe', adresse: '46 rue Tiquetonne', ville: 'Paris 2e', lat: 48.8648, lon: 2.34723, choix: true, guide: 'paris' },
    { id: 'tanat-3', nom: 'Tanat', type: 'cafe', adresse: '96 rue des Archives', ville: 'Paris 3e', lat: 48.86351, lon: 2.36098, choix: true, guide: 'paris' },
    { id: 'ten-belles-6', nom: 'Ten Belles Rive Gauche', type: 'cafe', adresse: 'rue du Cherche-Midi', ville: 'Paris 6e', lat: 48.84879, lon: 2.32525, guide: 'paris' },
    { id: 'coutume-8', nom: 'Coutume', type: 'cafe', adresse: '3 rue de Ponthieu', ville: 'Paris 8e', lat: 48.87005, lon: 2.31129, guide: 'torrefacteurs' },
    { id: 'coutume-9', nom: 'Coutume', type: 'cafe', adresse: '63 rue du Faubourg-Poissonnière', ville: 'Paris 9e', lat: 48.87533, lon: 2.34801, guide: 'torrefacteurs' },
    { id: 'coutume-16', nom: 'Coutume', type: 'cafe', adresse: '78 rue de Passy', ville: 'Paris 16e', lat: 48.85822, lon: 2.27615, guide: 'torrefacteurs' },
    { id: 'terres-blancs-manteaux', nom: 'Terres de Café', type: 'cafe', adresse: '36 rue des Blancs-Manteaux', ville: 'Paris 4e', lat: 48.85963, lon: 2.35554, guide: 'torrefacteurs' },
    { id: 'terres-rambuteau', nom: 'Terres de Café', type: 'boutique', adresse: '14 rue Rambuteau', ville: 'Paris', lat: 48.86061, lon: 2.35554, guide: 'torrefacteurs' },
    { id: 'terres-tiquetonne', nom: 'Terres de Café', type: 'boutique', adresse: '56 rue Tiquetonne', ville: 'Paris 2e', lat: 48.86484, lon: 2.34654, guide: 'torrefacteurs' },
    { id: 'terres-capucines', nom: 'Terres de Café', type: 'cafe', adresse: '20 rue des Capucines', ville: 'Paris', lat: 48.86935, lon: 2.32891, guide: 'torrefacteurs' },
    { id: 'terres-saint-honore', nom: 'Terres de Café', type: 'boutique', adresse: 'rue Saint-Honoré', ville: 'Paris 1er', lat: 48.86197, lon: 2.34038, guide: 'torrefacteurs' },
    { id: 'terres-beaumarchais', nom: 'Terres de Café', type: 'cafe', adresse: 'boulevard Beaumarchais', ville: 'Paris 4e', lat: 48.85534, lon: 2.36832, guide: 'torrefacteurs' },
    { id: 'terres-bourdonnais', nom: 'Terres de Café', type: 'cafe', adresse: 'avenue de La Bourdonnais', ville: 'Paris 7e', lat: 48.85695, lon: 2.30158, guide: 'torrefacteurs' },
    { id: 'terres-daguerre', nom: 'Terres de Café', type: 'boutique', adresse: 'rue Daguerre', ville: 'Paris 14e', lat: 48.83436, lon: 2.32871, guide: 'torrefacteurs' },
    { id: 'terres-batignolles', nom: 'Terres de Café', type: 'boutique', adresse: 'rue des Batignolles', ville: 'Paris 17e', lat: 48.8851, lon: 2.32049, guide: 'torrefacteurs' },
    { id: 'arbre-nil', nom: 'L’Arbre à Café', type: 'boutique', adresse: '10 rue du Nil', ville: 'Paris 2e', lat: 48.86774, lon: 2.34767, guide: 'torrefacteurs' },
    { id: 'arbre-6', nom: 'L’Arbre à Café', type: 'boutique', adresse: 'rue Monsieur-le-Prince', ville: 'Paris 6e', lat: 48.85176, lon: 2.33896, guide: 'torrefacteurs' },
    { id: 'arbre-9', nom: 'L’Arbre à Café', type: 'boutique', adresse: '35 rue des Martyrs', ville: 'Paris 9e', lat: 48.87906, lon: 2.33974, guide: 'torrefacteurs' },
    { id: 'arbre-11', nom: 'L’Arbre à Café', type: 'boutique', adresse: 'rue Oberkampf', ville: 'Paris 11e', lat: 48.86477, lon: 2.37265, guide: 'torrefacteurs' },
    { id: 'belleville', nom: 'Belleville Brûlerie', type: 'boutique', adresse: '14 bis rue Lally-Tollendal', ville: 'Paris 19e', lat: 48.8831, lon: 2.37427, guide: 'torrefacteurs' },
    { id: 'mokxa-bellecour', nom: 'Mokxa', type: 'cafe', adresse: 'place Amédée-Bonnet', ville: 'Lyon 2e', lat: 45.75888, lon: 4.83609, guide: 'torrefacteurs' },
    { id: 'mokxa-croix-rousse', nom: 'Mokxa', type: 'cafe', adresse: '5 rue Victor-Fort', ville: 'Lyon 4e', lat: 45.77527, lon: 4.83128, guide: 'torrefacteurs' },
    { id: 'mokxa-strasbourg', nom: 'Mokxa', type: 'cafe', adresse: '9 rue du Parchemin', ville: 'Strasbourg', lat: 48.5847, lon: 7.75392, guide: 'torrefacteurs' },
    { id: 'omnino-kiosque', nom: 'Le kiosque d’Omnino', type: 'cafe', adresse: '1 place Saint-Pierre-le-Vieux', ville: 'Strasbourg', lat: 48.58317, lon: 7.74019, guide: 'torrefacteurs' },
    { id: 'omnino-boutique', nom: 'Belles Rencontres d’Omnino', type: 'boutique', adresse: '5 rue du Renard-Prêchant', ville: 'Strasbourg', lat: 48.5794, lon: 7.75724, guide: 'torrefacteurs' },
    { id: 'alchimiste', nom: 'L’Alchimiste Café Boutique', type: 'cafe', adresse: '12 rue de la Vieille-Tour', ville: 'Bordeaux', lat: 44.84122, lon: -0.5795, guide: 'torrefacteurs' },
    { id: 'hayuco-boutique', nom: 'Hayuco Coffee Boutique', type: 'boutique', adresse: '31 rue Bouquières', ville: 'Toulouse', lat: 43.59858, lon: 1.44677, guide: 'torrefacteurs' },
    { id: 'hayuco-copola', nom: 'Hayuco Coffee Copola', type: 'cafe', adresse: 'allée des Professeurs Pontonnier', ville: 'Toulouse', lat: 43.59989, lon: 1.43273, guide: 'torrefacteurs' }
  ],
  guidesAdresses: {
    paris: ['/journal/meilleurs-cafes-paris', 'Les meilleurs cafés de Paris'],
    torrefacteurs: ['/journal/torrefacteurs-francais', 'Les torréfacteurs français']
  },
  // Raccourcis de recherche : les villes où filtré. a des adresses, au centre-ville.
  villes: [
    { cle: 'paris', nom: 'Paris', lat: 48.8566, lon: 2.3522 },
    { cle: 'lyon', nom: 'Lyon', lat: 45.764, lon: 4.8357 },
    { cle: 'strasbourg', nom: 'Strasbourg', lat: 48.5818, lon: 7.7509 },
    { cle: 'bordeaux', nom: 'Bordeaux', lat: 44.8412, lon: -0.5745 },
    { cle: 'toulouse', nom: 'Toulouse', lat: 43.6045, lon: 1.444 }
  ],

  procedes: [
    { cle: 'lave', nom: 'Lavé' },
    { cle: 'nature', nom: 'Nature' },
    { cle: 'honey', nom: 'Honey' },
    { cle: 'autre', nom: 'Autre' }
  ],

  // Deux axes : l'extraction (acide ou amer) et la force (trop léger ou trop fort). Équilibré exclut le reste.
  gouts: [
    { cle: 'acide', nom: 'Acide', axe: 'extraction' },
    { cle: 'amer', nom: 'Amer', axe: 'extraction' },
    { cle: 'leger', nom: 'Trop léger', axe: 'force' },
    { cle: 'fort', nom: 'Trop fort', axe: 'force' },
    { cle: 'equilibre', nom: 'Équilibré', axe: 'tout' }
  ],

  // Conseils alignés sur les articles de diagnostic : un seul réglage à la fois, un cran, puis on regoûte.
  // court : la même consigne, reprise en rappel à la tasse suivante.
  conseils: {
    acide: {
      titre: 'Sous-extrait',
      texte: 'Moulez un cran plus fin. Si la mouture est déjà fine, montez l’eau de 1 à 2 °C.',
      espresso: 'Le shot coule trop vite. Moulez un cran plus fin.',
      court: 'moulez un cran plus fin',
      guide: ['/journal/pourquoi-cafe-acide', 'Pourquoi mon café est acide'],
      guideEspresso: ['/journal/espresso-trop-rapide-trop-lent-diagnostic', 'Espresso trop rapide ou trop lent']
    },
    amer: {
      titre: 'Sur-extrait',
      texte: 'Moulez un cran plus gros, ou baissez l’eau de 1 à 2 °C.',
      espresso: 'Le shot coule trop lentement. Moulez un cran plus gros.',
      court: 'moulez un cran plus gros',
      guide: ['/journal/pourquoi-cafe-amer', 'Pourquoi mon café est amer'],
      guideEspresso: ['/journal/espresso-trop-rapide-trop-lent-diagnostic', 'Espresso trop rapide ou trop lent']
    },
    leger: {
      titre: 'Trop léger',
      texte: 'Resserrez le ratio : 1 g de café en plus pour la même eau.',
      court: 'resserrez le ratio',
      guide: ['/journal/ratio-cafe-eau-extraction', 'Le ratio café/eau par méthode']
    },
    fort: {
      titre: 'Trop fort',
      texte: 'Allongez le ratio : un peu plus d’eau pour la même dose.',
      court: 'allongez le ratio',
      guide: ['/journal/ratio-cafe-eau-extraction', 'Le ratio café/eau par méthode']
    },
    equilibre: {
      titre: 'Réglage trouvé',
      texte: 'Gardez-le : c’est votre recette pour ce café. Elle vous attend dans l’onglet Cafés.'
    }
  },

  // Repos après torréfaction, repris de l'article sur le dégazage : en filtre la fenêtre s'ouvre vers J+7,
  // en espresso vers J+10, jusqu'à J+21 ; au-delà de six semaines, les arômes s'estompent.
  repos: {
    filtre: [7, 21], espresso: [10, 21], fatigue: 42,
    guide: ['/journal/degazage-cafe', 'Dégazage : combien de jours avant de le boire'],
    conserver: ['/journal/comment-conserver-cafe', 'Comment conserver son café']
  },
  ages: { repos: 'au repos', fenetre: 'dans sa fenêtre', bon: 'encore bon', fatigue: 'à finir' },
  poids: [250, 500, 1000],

  // Le jeu : des points pour chaque tasse (trois par jour au plus) et chaque succès, des niveaux qui suivent
  // la torréfaction, du grain vert au maître torréfacteur. couleur : celle du grain à ce niveau.
  points: { tasse: 10, gout: 5, succes: 40, parJour: 3 },
  niveaux: [
    { nom: 'Grain vert', points: 0, couleur: '#8f9a5b' },
    { nom: 'Séchage', points: 50, couleur: '#b5ad66' },
    { nom: 'Jaunissement', points: 150, couleur: '#d4b25c' },
    { nom: 'Premier crack', points: 300, couleur: '#b9824a' },
    { nom: 'Développement', points: 500, couleur: '#9c6438' },
    { nom: 'Torréfaction médium', points: 800, couleur: '#7b4a2a' },
    { nom: 'Second crack', points: 1200, couleur: '#5a3520' },
    { nom: 'Torréfacteur', points: 1800, couleur: '#3f2516' },
    { nom: 'Maître torréfacteur', points: 2600, couleur: '#2a170d' }
  ],
  // Douze succès, calculés depuis le carnet : rien n'est stocké à part, un import ou une suppression les recalcule.
  succes: [
    { cle: 'premiere', nom: 'Première tasse', but: 'Noter une première tasse.', icone: 'tasse' },
    { cle: 'mille', nom: 'Dans le mille', but: 'Une tasse au centre de la boussole : équilibrée.', icone: 'cible' },
    { cle: 'affilee', nom: 'Trois d’affilée', but: 'Trois tasses équilibrées de suite sur le même café.', icone: 'trois' },
    { cle: 'fenetre', nom: 'Dans la fenêtre', but: 'Un espresso tiré entre 25 et 30 s, comme le protocole.', icone: 'fenetre' },
    { cle: 'methodes', nom: 'Tour des méthodes', but: 'Cinq méthodes différentes.', icone: 'dripper' },
    { cle: 'origines', nom: 'Globe-trotteur', but: 'Des cafés de cinq origines.', icone: 'globe' },
    { cle: 'continents', nom: 'Trois continents', but: 'Une origine d’Afrique, une d’Amérique, une d’Asie.', icone: 'bande' },
    { cle: 'fraicheur', nom: 'Pic de fraîcheur', but: 'Une tasse en pleine fenêtre de repos : J+7 à J+21, J+10 en espresso.', icone: 'grain' },
    { cle: 'sachet', nom: 'Jusqu’au dernier grain', but: 'Finir un sachet.', icone: 'sachet' },
    { cle: 'tour', nom: 'Chrono en main', but: 'Noter au chrono la fin du bloom ou la première goutte.', icone: 'goutte' },
    { cle: 'semaine', nom: 'Sept jours de suite', but: 'Une tasse par jour pendant une semaine.', icone: 'semaine' },
    { cle: 'carnet', nom: 'Carnet de bord', but: 'Trente tasses notées.', icone: 'carnet' }
  ],
  // Icônes des succès, même trait que les icônes du site (viewBox 48, trait de 2).
  icones: {
    tasse: '<path d="M11 20h22v7a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9z"/><path d="M33 22h3a4 4 0 0 1 0 8h-3"/><path d="M18 9c-1.5 2 1.5 3.5 0 5.5M25 9c-1.5 2 1.5 3.5 0 5.5"/>',
    cible: '<circle cx="24" cy="24" r="15"/><circle cx="24" cy="24" r="8.5"/><circle cx="24" cy="24" r="2.6" fill="currentColor" stroke="none"/>',
    trois: '<path d="M11 24h26"/><circle cx="11" cy="24" r="4.6" fill="currentColor" stroke="none"/><circle cx="24" cy="24" r="4.6" fill="currentColor" stroke="none"/><circle cx="37" cy="24" r="4.6" fill="currentColor" stroke="none"/>',
    fenetre: '<circle cx="24" cy="27" r="13"/><path d="M24 27L33.2 17.8A13 13 0 0 1 37 27z" fill="currentColor" stroke="none" opacity=".4"/><path d="M21 8h6M24 8v6"/>',
    dripper: '<path d="M9 14h30l-10 14h-10z"/><path d="M16 36h16"/><path d="M24 28v4"/>',
    globe: '<circle cx="24" cy="24" r="15"/><path d="M9 24h30"/><path d="M24 9c4.6 4.4 6.8 9.4 6.8 15S28.6 34.6 24 39c-4.6-4.4-6.8-9.4-6.8-15S19.4 13.4 24 9z"/>',
    bande: '<rect x="6" y="14" width="36" height="20" rx="3"/><path d="M6 19.5h36M6 28.5h36" stroke-dasharray="2 3" opacity=".5"/><circle cx="15" cy="22" r="2.5" fill="currentColor" stroke="none"/><circle cx="25" cy="27" r="2.5" fill="currentColor" stroke="none"/><circle cx="34" cy="21" r="2.5" fill="currentColor" stroke="none"/>',
    grain: '<ellipse cx="21" cy="27" rx="8.5" ry="12.5" transform="rotate(24 21 27)"/><path d="M17.5 16.5c5 5-2 10.5 3.5 21"/><path d="M36 7v7M32.5 10.5h7"/>',
    sachet: '<path d="M14 13h20l2 25a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2z"/><path d="M14 13l3-5h14l3 5"/><circle cx="24" cy="23" r="3"/>',
    goutte: '<path d="M24 7c6.5 8.5 10 13.5 10 19.5a10 10 0 0 1-20 0C14 20.5 17.5 15.5 24 7z"/><path d="M24 21v6l4 2.5"/>',
    semaine: '<rect x="9" y="11" width="30" height="28" rx="3"/><path d="M9 18h30M16 7v7M32 7v7"/><path d="M17 28.5l4.5 4.5 9-10"/>',
    carnet: '<path d="M13 8h20a3 3 0 0 1 3 3v26a3 3 0 0 1-3 3H13z"/><path d="M13 8v32"/><path d="M19 16h11M19 22h11M19 28h7"/>'
  }
};
