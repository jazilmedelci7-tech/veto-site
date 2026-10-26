import fs from 'node:fs'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import express, { type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { loadSecret } from './auth.js'
import { config } from './config.js'
import { startNotifier } from './notify.js'
import { router } from './routes.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  if (config.trustProxy > 0) app.set('trust proxy', config.trustProxy)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          styleSrcAttr: ["'unsafe-inline'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ['https://www.google.com'],
          frameAncestors: ["'none'"],
        },
      },
    }),
  )
  app.use(express.json({ limit: '200kb' }))
  app.use(cookieParser())

  app.use('/api', router)
  app.use('/api', (_req, res) => { res.status(404).json({ error: 'Route introuvable' }) })

  // Site construit (npm run build à la racine) servi par le même serveur
  const index = path.join(config.distDir, 'index.html')
  if (fs.existsSync(index)) {
    app.use(express.static(config.distDir, { index: false, maxAge: '1h' }))
    app.use((req, res, next) => (req.method === 'GET' || req.method === 'HEAD' ? res.sendFile(index) : next()))
  }

  // Gestion d'erreurs : jamais de détails techniques envoyés au navigateur
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = typeof (err as { status?: unknown }).status === 'number' ? (err as { status: number }).status : 500
    if (status >= 400 && status < 500) { res.status(status).json({ error: status === 413 ? 'Données trop volumineuses' : 'Requête invalide' }); return }
    console.error(err)
    res.status(500).json({ error: 'Erreur du serveur. Réessaie dans un instant.' })
  })
  return app
}

async function main() {
  mongoose.set('strictQuery', true)
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 })
  } catch (e) {
    console.error(`\nImpossible de se connecter à MongoDB (${config.mongoUri.replace(/\/\/[^@]*@/, '//***@')}).`)
    console.error("Vérifie que MongoDB est lancé, ou corrige MONGODB_URI dans server/.env.\n")
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  }
  await loadSecret()
  const app = createApp()
  // Express 5 appelle ce rappel aussi en cas d'erreur (port déjà utilisé, par exemple)
  app.listen(config.port, (err?: Error) => {
    if (err) {
      console.error(err.message.includes('EADDRINUSE') ? `Le port ${config.port} est déjà utilisé. Ferme l'autre programme ou change PORT dans server/.env.` : err.message)
      process.exit(1)
    }
    console.log(`API prête sur http://localhost:${config.port}`)
    startNotifier()
  })
}
main()
