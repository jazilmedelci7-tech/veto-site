// RÉGLAGES DU CLIENT « cabinet-belcourt »
// Tout ce qui est propre à ce vétérinaire est ICI et dans le dossier "public" (logos et photos).
// Pour un nouveau client : copie le dossier "modele", renomme-le, puis modifie ce genre de fichier.
// PHOTOS DES SERVICES : dossier public/services/, puis  image: '/services/radiographie.jpg'

import type { SiteConfig } from '../../src/siteTypes'

const horaires = [
  { jours: 'Dimanche – Jeudi', heures: '9h – 17h' },
  { jours: 'Vendredi', heures: 'Fermé' },
  { jours: 'Samedi', heures: '9h – 16h' },
]

const config: SiteConfig = {
  titre: 'Docteur Vétérinaire – Belcourt et Oued Romane',
  nom: 'Docteur Vétérinaire',
  ville: 'Alger',
  accroche: 'Des soins attentionnés pour vos compagnons',
  indicatifPays: '213',
  couleur: '#1D3FA8',
  cabinets: [
    {
      id: 'belcourt',
      nom: 'Cabinet principal – Belcourt',
      court: 'Belcourt',
      adresse: '45 rue Mohamed Bouchnafa, Belouizdad, Alger',
      telephone: '0551 39 10 39',
      email: '',
      horaires,
      carte: '45 rue Mohamed Bouchnafa, Belouizdad, Alger',
    },
    {
      id: 'oued-romane',
      nom: 'Annexe – Oued Romane',
      court: 'Oued Romane',
      adresse: '06 cité Onaparc, El Achour, Alger',
      telephone: '0796 36 31 06',
      email: '',
      horaires,
      carte: '06 cité Onaparc, El Achour, Alger',
    },
  ],
  services: [
    { title: 'Consultations', icon: 'consultation', text: 'Bilan de santé et suivi régulier de votre animal.', points: ['Examen clinique complet', "Conseils d'alimentation", 'Suivi de croissance et de poids'] },
    { title: 'Vaccination', icon: 'vaccin', text: "Vaccins et rappels selon l'espèce et l'âge.", points: ['Chiens, chats, lapins, furets', 'Rappels notés dans la fiche', 'Vermifuge et anti-puces'] },
    { title: 'Chirurgie', icon: 'chirurgie', text: 'Interventions programmées, avec suivi post-opératoire.', points: ['Stérilisation et castration', 'Chirurgie des tissus mous', "Contrôle après l'opération"] },
    { title: 'Radiographie', icon: 'radio', text: 'Examen radiographique pour mieux voir les os et les organes.', points: ['Os, articulations, thorax, abdomen', 'Aide au diagnostic des fractures', 'Image conservée dans la fiche'] },
    { title: 'Échographie', icon: 'echo', text: 'Examen non douloureux pour explorer les organes internes.', points: ["Exploration de l'abdomen", 'Suivi de gestation', 'Image conservée dans la fiche'] },
    { title: 'Imagerie médicale', icon: 'imagerie', text: "Des examens d'imagerie pour affiner le diagnostic.", points: ['Radiographie et échographie', 'Résultats expliqués au propriétaire', 'Historique des examens par animal'] },
    { title: 'Soins dentaires', icon: 'dents', text: 'Entretien de la bouche et des dents de votre animal.', points: ['Détartrage', 'Contrôle de la bouche'] },
    { title: 'Identification', icon: 'identification', text: 'Identification par puce électronique ou tatouage.', points: ['Numéro noté dans la fiche', 'Retrouver rapidement un animal'] },
    { title: 'Dossier numérique', icon: 'dossier', text: 'Chaque animal a sa fiche : historique médical toujours à jour.', points: ['Antécédents et traitements', 'Vaccins et visites', 'Radios et échographies'] },
  ],
  avis: [],
}

export default config
