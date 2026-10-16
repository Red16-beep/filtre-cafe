// La recette V60 du site (journal/v60-guide-complet). Aucun chiffre ajouté.
export const RECETTE_V60 = {
  nom: "V60",
  cafe: 15,
  eau: 250,
  temperature: 93,
  mouture: "médium-fine",
  repereMouture: "comme du sucre semoule",
  rincage: 100,
  versements: [
    { debut: 0, jusqua: 30, titre: "Le bloom" },
    { debut: 30, jusqua: 150, titre: "Jusqu’à 150 g" },
    { debut: 60, jusqua: 200, titre: "Jusqu’à 200 g" },
    { debut: 90, jusqua: 250, titre: "Jusqu’à 250 g" },
  ],
  fenetre: [150, 210] as const, // 2:30 à 3:30
  url: "filtre.cafe/journal/v60-guide-complet",
};
