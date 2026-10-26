import readline from 'node:readline/promises'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { config } from './config.js'
import { Admin } from './models.js'
import { passwordPolicy } from './validation.js'

async function main() {
  let pw = process.env.ADMIN_PASSWORD ?? ''
  if (!pw) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    pw = await rl.question('Nouveau mot de passe du vétérinaire (8 caractères minimum) : ')
    rl.close()
  }
  const check = passwordPolicy.safeParse(pw)
  if (!check.success) { console.error(check.error.issues[0]?.message); process.exit(1) }
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 })
  const passwordHash = await bcrypt.hash(pw, 12)
  await Admin.deleteMany({})
  await Admin.create({ passwordHash })
  console.log('Mot de passe enregistré. Tu peux te connecter sur /admin.')
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1) })
