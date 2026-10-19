// Toutes les infos des deux cabinets sont ici. Modifie ce fichier quand un horaire,
// un numéro ou une adresse change, et ajoute les photos dans la liste "photos".
//
// PHOTOS : copie l'image dans le dossier public/photos/ puis ajoute une ligne, par exemple
//   photos: ['/photos/belcourt-accueil.jpg', '/photos/belcourt-salle.jpg'],

export type CabinetId = "belcourt" | "oued-romane";

export interface Cabinet {
  id: CabinetId;
  nom: string;
  court: string;
  adresse: string;
  telephone: string;
  email: string;
  horaires: { jours: string; heures: string }[];
  /** Texte envoyé à Google Maps pour afficher la carte */
  carte: string;
  photos: string[];
}

const horaires = [
  { jours: "Dimanche – Jeudi", heures: "9h – 17h" },
  { jours: "Vendredi", heures: "Fermé" },
  { jours: "Samedi", heures: "9h – 16h" },
];

export const cabinets: Cabinet[] = [
  {
    id: "belcourt",
    nom: "Cabinet principal – Belcourt",
    court: "Belcourt",
    adresse: "45 rue Mohamed Bouchnafa, Belouizdad, Alger",
    telephone: "0551 39 10 39",
    email: "",
    horaires,
    carte: "45 rue Mohamed Bouchnafa, Belouizdad, Alger",
    photos: [],
  },
  {
    id: "oued-romane",
    nom: "Annexe – Oued Romane",
    court: "Oued Romane",
    adresse: "06 cité Onaparc, El Achour, Alger",
    telephone: "0796 36 31 06",
    email: "",
    horaires,
    carte: "06 cité Onaparc, El Achour, Alger",
    photos: [],
  },
];

export const cabinetNom = (id: string) =>
  cabinets.find((c) => c.id === id)?.court ?? "";
export const telHref = (t: string) => `tel:${t.replace(/\s/g, "")}`;
