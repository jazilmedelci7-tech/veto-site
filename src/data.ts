export interface Service { title: string; text: string }
export interface Visite { id: string; date: string; note: string }
export interface Fiche {
  id: string; nom: string; prenom: string; age: string; telephone: string; adresse: string
  animal: string; espece: string; race: string; ageAnimal: string; visites: Visite[]
}
export interface Rdv {
  id: string; nom: string; telephone: string; animal: string; date: string; message: string
  statut: 'nouvelle' | 'confirmée' | 'refusée'; createdAt: string
}

export const services: Service[] = [
  { title: 'Consultations', text: 'Bilan de santé et suivi régulier de votre animal.' },
  { title: 'Vaccination', text: "Vaccins et rappels selon l'espèce et l'âge." },
  { title: 'Chirurgie', text: 'Interventions programmées, avec suivi post-opératoire.' },
  { title: 'Dossier numérique', text: 'Chaque animal a sa fiche : historique médical toujours à jour.' },
  { title: 'Identification', text: '[Service à confirmer]' },
  { title: 'Soins dentaires', text: '[Service à confirmer]' },
]

export const seedFiches: Fiche[] = [
  { id: 'f1', nom: 'Benali', prenom: 'Karim', age: '38', telephone: '[0X XX XX XX XX]', adresse: '[Adresse]', animal: 'Rex', espece: 'Chien', race: 'Berger allemand', ageAnimal: '4 ans',
    visites: [{ id: 'v1', date: '2026-09-12', note: 'Vaccin rappel.' }, { id: 'v2', date: '2026-03-20', note: 'Consultation de contrôle.' }] },
  { id: 'f2', nom: 'Messaoud', prenom: 'Amel', age: '31', telephone: '[0X XX XX XX XX]', adresse: '[Adresse]', animal: 'Mimi', espece: 'Chat', race: '', ageAnimal: '2 ans', visites: [{ id: 'v3', date: '2026-09-03', note: '' }] },
  { id: 'f3', nom: 'Haddad', prenom: 'Sofiane', age: '45', telephone: '[0X XX XX XX XX]', adresse: '[Adresse]', animal: 'Luna', espece: 'Chien', race: '', ageAnimal: '6 ans', visites: [{ id: 'v4', date: '2026-08-28', note: '' }] },
]
export const seedRdvs: Rdv[] = [
  { id: 'r1', nom: 'Bouzid Lina', telephone: '[0X XX XX XX XX]', animal: 'Coco (oiseau)', date: '2026-10-12', message: 'Contrôle de routine.', statut: 'nouvelle', createdAt: '2026-10-07' },
]
export const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—')
