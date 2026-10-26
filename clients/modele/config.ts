// RÉGLAGES DU CLIENT « modele » : modèle vide à copier pour chaque nouveau client.
//
// POUR UN NOUVEAU CLIENT
//   1. Copie le dossier "clients/modele" et renomme la copie (ex. "clients/dr-martin").
//   2. Dans la copie, modifie ce fichier config.ts (nom, adresses, téléphones, horaires, services…).
//   3. Remplace les logos dans public/ (logo-blue.png et logo-white.png) et ajoute les photos dans public/photos/.
//   4. Construis le site avec  CLIENT=dr-martin  (voir le fichier VENDRE.md).
// Ne modifie rien d'autre dans le projet.

import type { SiteConfig } from '../../src/siteTypes'

const horaires = [
  { jours: 'Dimanche – Jeudi', heures: '9h – 17h' },
  { jours: 'Vendredi', heures: 'Fermé' },
  { jours: 'Samedi', heures: '9h – 16h' },
]

const config: SiteConfig = {
  titre: 'Cabinet Vétérinaire – Exemple', // titre de l'onglet : une seule ligne
  nom: 'Cabinet Vétérinaire Exemple',
  ville: 'Votre ville',
  accroche: 'Des soins attentionnés pour vos compagnons',
  indicatifPays: '213', // 213 Algérie · 216 Tunisie · 212 Maroc · 33 France
  couleur: '#1D3FA8',
  cabinets: [
    {
      id: 'cabinet', // sans espace ni accent
      nom: 'Cabinet vétérinaire',
      court: 'Cabinet',
      adresse: 'Adresse du cabinet, ville',
      telephone: '0555 00 00 00',
      email: '',
      horaires,
      carte: 'Adresse du cabinet, ville',
    },
    // Deuxième cabinet ? Copie le bloc ci-dessus, change l'id et les infos.
  ],
  services: [
    { title: 'Consultations', icon: 'consultation', text: 'Bilan de santé et suivi régulier de votre animal.', points: ['Examen clinique complet', "Conseils d'alimentation", 'Suivi de croissance et de poids'] },
    { title: 'Vaccination', icon: 'vaccin', text: "Vaccins et rappels selon l'espèce et l'âge.", points: ['Chiens, chats, lapins, furets', 'Rappels notés dans la fiche', 'Vermifuge et anti-puces'] },
    { title: 'Chirurgie', icon: 'chirurgie', text: 'Interventions programmées, avec suivi post-opératoire.', points: ['Stérilisation et castration', 'Chirurgie des tissus mous', "Contrôle après l'opération"] },
    { title: 'Identification', icon: 'identification', text: 'Identification par puce électronique ou tatouage.', points: ['Numéro noté dans la fiche', 'Retrouver rapidement un animal'] },
    { title: 'Dossier numérique', icon: 'dossier', text: 'Chaque animal a sa fiche : historique médical toujours à jour.', points: ['Antécédents et traitements', 'Vaccins et visites', 'Examens et images'] },
    // Autres services disponibles (icon) : 'radio', 'echo', 'imagerie', 'dents'. Supprime ceux que le client ne propose pas.
  ],
  avis: [], // ex. [{ texte: 'Très bon accueil.', auteur: 'Sara M. · chat' }]  (vide = section masquée)
}

export default config
