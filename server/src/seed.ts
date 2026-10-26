// Fiches d'exemple pour essayer le site. À NE PAS lancer sur la vraie base du cabinet.
import mongoose from 'mongoose'
import { config } from './config.js'
import { Fiche, Rdv } from './models.js'

const base = { prenom: '', age: '', telephone: '0555 00 00 00', adresse: 'Alger', precision: '', race: '', sexe: '', sterilise: '', ageAnimal: '', poids: '' }

async function main() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 })
  if ((await Fiche.countDocuments()) > 0) { console.error('La base contient déjà des fiches : rien ajouté.'); process.exit(1) }
  await Fiche.create([
    { ...base, nom: 'Benali', prenom: 'Karim', age: '38', animal: 'Rex', espece: 'Chien', race: 'Berger allemand', sexe: 'Mâle', sterilise: 'Non', ageAnimal: '4 ans', poids: '32',
      visites: [{ id: 'a1', date: '2026-09-12', motifs: ['Vaccination'], vaccins: ['Rage'], note: 'Rappel annuel.' }] },
    { ...base, nom: 'Messaoud', prenom: 'Amel', age: '31', animal: 'Mimi', espece: 'Chat', race: 'Européen (commun)', sexe: 'Femelle', sterilise: 'Oui', ageAnimal: '2 ans', poids: '4',
      visites: [{ id: 'a2', date: '2026-09-03', motifs: ['Consultation'], vaccins: [], note: '' }] },
  ])
  await Rdv.create({ nom: 'Bouzid Lina', telephone: '0555 11 22 33', animal: 'Coco (oiseau)', cabinet: 'cabinet', date: '2026-10-12', message: 'Contrôle de routine.' })
  console.log('Données d\'exemple ajoutées.')
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1) })
