/* Carnet filtré. : données de référence. Chiffres repris des recettes du site (HowTo des guides). */
var CARNET = {
  site: 'https://filtre.cafe',

  // temps : fenêtre de temps total (secondes) quand le guide en donne une, sinon null.
  // enTasse : on pèse la boisson (espresso), pas l'eau versée. heures : infusion comptée en heures.
  methodes: [
    { cle: 'v60', nom: 'V60', dose: 15, eau: 250, temperature: 93, mouture: 'médium, sucre fin', temps: [150, 210], guide: '/journal/v60-guide-complet' },
    { cle: 'chemex', nom: 'Chemex', dose: 45, eau: 750, temperature: 94, mouture: 'médium-grossière', temps: [240, 300], guide: '/journal/chemex-guide-complet' },
    { cle: 'aeropress', nom: 'AeroPress', dose: 16, eau: 210, temperature: 88, mouture: 'médium-fine', temps: null, guide: '/journal/aeropress-guide-complet' },
    { cle: 'piston', nom: 'Piston', dose: 15, eau: 250, temperature: 93, mouture: 'grossière, sucre gros', temps: null, guide: '/journal/french-press-guide' },
    { cle: 'espresso', nom: 'Espresso', dose: 18, eau: 36, temperature: 93, mouture: 'fine, sable fin', temps: [25, 30], enTasse: true, guide: '/journal/comment-faire-espresso-parfait' },
    { cle: 'moka', nom: 'Moka', dose: null, eau: null, temperature: null, mouture: 'médium, panier à ras', temps: null, guide: '/journal/moka-pot-guide-complet' },
    { cle: 'kasuya', nom: '4:6', dose: 20, eau: 300, temperature: 93, mouture: 'médium-grossière', temps: null, guide: '/journal/methode-4-6-kasuya' },
    { cle: 'switch', nom: 'Switch', dose: 20, eau: 300, temperature: 93, mouture: 'moyenne', temps: null, guide: '/journal/hario-switch-guide-recettes' },
    { cle: 'glace', nom: 'Glacé', dose: 22, eau: 220, temperature: 93, mouture: 'moyenne, un cran plus fine qu’en V60', temps: null, guide: '/journal/cafe-glace-maison' },
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
  }
};
