// Envoie tout de suite les rappels qui arrivent (sans attendre l'heure du matin) :  npm run notify-now
import mongoose from 'mongoose'
import { config } from './config.js'
import { envoyerRappels, notificationsEnabled } from './notify.js'

async function main() {
  if (!notificationsEnabled()) {
    console.error("Telegram n'est pas configuré. Ajoute TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID dans server/.env.")
    process.exit(1)
  }
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 })
  const n = await envoyerRappels()
  console.log(n ? `${n} rappel(s) envoyé(s) sur Telegram.` : `Aucun nouveau rappel à signaler (rappels dans les ${config.notifyDaysBefore} prochains jours, ou en retard de moins de 14 jours, pas déjà signalés).`)
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1) })
