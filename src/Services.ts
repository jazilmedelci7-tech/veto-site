// Liste des services du cabinet. Modifie ce fichier pour changer un texte ou ajouter une photo.
//
// PHOTOS : copie l'image dans le dossier public/services/ puis écris son chemin dans "image",
// par exemple  image: '/services/radiographie.jpg'
// Sans photo, une illustration bleue est affichée à la place.

export interface Service {
  title: string;
  text: string;
  points: string[];
  icon:
    | "consultation"
    | "vaccin"
    | "chirurgie"
    | "radio"
    | "echo"
    | "imagerie"
    | "dents"
    | "identification"
    | "dossier";
  image?: string;
}

export const services: Service[] = [
  {
    title: "Consultations",
    icon: "consultation",
    text: "Bilan de santé et suivi régulier de votre animal.",
    points: [
      "Examen clinique complet",
      "Conseils d'alimentation",
      "Suivi de croissance et de poids",
    ],
  },
  {
    title: "Vaccination",
    icon: "vaccin",
    text: "Vaccins et rappels selon l'espèce et l'âge.",
    points: [
      "Chiens, chats, lapins, furets",
      "Rappels notés dans la fiche",
      "Vermifuge et anti-puces",
    ],
  },
  {
    title: "Chirurgie",
    icon: "chirurgie",
    text: "Interventions programmées, avec suivi post-opératoire.",
    points: [
      "Stérilisation et castration",
      "Chirurgie des tissus mous",
      "Contrôle après l'opération",
    ],
  },
  {
    title: "Radiographie",
    icon: "radio",
    text: "Examen radiographique pour mieux voir les os et les organes.",
    points: [
      "Os, articulations, thorax, abdomen",
      "Aide au diagnostic des fractures",
      "Image conservée dans la fiche",
    ],
  },
  {
    title: "Échographie",
    icon: "echo",
    text: "Examen non douloureux pour explorer les organes internes.",
    points: [
      "Exploration de l'abdomen",
      "Suivi de gestation",
      "Image conservée dans la fiche",
    ],
  },
  {
    title: "Imagerie médicale",
    icon: "imagerie",
    text: "Des examens d'imagerie pour affiner le diagnostic.",
    points: [
      "Radiographie et échographie",
      "Résultats expliqués au propriétaire",
      "Historique des examens par animal",
    ],
  },
  {
    title: "Soins dentaires",
    icon: "dents",
    text: "[Service à confirmer]",
    points: ["Détartrage", "Contrôle de la bouche"],
  },
  {
    title: "Identification",
    icon: "identification",
    text: "Identification par puce électronique ou tatouage.",
    points: ["Numéro noté dans la fiche", "Retrouver rapidement un animal"],
  },
  {
    title: "Dossier numérique",
    icon: "dossier",
    text: "Chaque animal a sa fiche : historique médical toujours à jour.",
    points: [
      "Antécédents et traitements",
      "Vaccins et visites",
      "Radios et échographies",
    ],
  },
];
