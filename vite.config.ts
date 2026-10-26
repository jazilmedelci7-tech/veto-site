import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En développement, les appels /api vont au serveur. Port lu dans server/.env (4000 par défaut).
function apiPort(): string {
  try { const m = /^PORT=(\d+)/m.exec(fs.readFileSync('server/.env', 'utf8')); if (m?.[1]) return m[1] } catch { /* pas de .env */ }
  return '4000'
}
const api = { '/api': `http://localhost:${apiPort()}` }

export default defineConfig(({ mode }) => {
  // Client choisi : variable CLIENT (fichier .env à la racine, ou variable d'environnement de l'hébergeur).
  // Chaque client a son dossier clients/<nom>/ avec config.ts et public/ (logos, photos).
  const client = (loadEnv(mode, process.cwd(), '')['CLIENT'] || 'modele').trim()
  const dir = path.resolve('clients', client)
  if (!fs.existsSync(path.join(dir, 'config.ts'))) {
    throw new Error(`Client introuvable : le dossier clients/${client}/config.ts n'existe pas. Vérifie la variable CLIENT.`)
  }
  console.log(`\n→ Client : ${client}\n`)
  // Titre de la page : lu dans la ligne  titre: '...'  du config.ts du client
  const src = fs.readFileSync(path.join(dir, 'config.ts'), 'utf8')
  const title = /^\s*titre:\s*(['"`])(.*?)\1/m.exec(src)?.[2] ?? 'Cabinet vétérinaire'

  return {
    plugins: [react(), { name: 'titre-client', transformIndexHtml: (html: string) => html.replace('%SITE_TITLE%', title.replace(/&/g, '&amp;').replace(/</g, '&lt;')) }],
    resolve: { alias: { '@client': dir } },
    publicDir: path.join(dir, 'public'),
    server: { proxy: api, fs: { allow: ['.'] } },
    preview: { proxy: api },
  }
})
