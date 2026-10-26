# Site de cabinet vétérinaire (modèle pour plusieurs clients)

Site public (Accueil, Services, Contact + demande de rendez-vous) et espace sécurisé du vétérinaire (fiches clients et animaux, rendez-vous, rappels de vaccin, sauvegarde).

- Frontend : React + TypeScript + Tailwind (Vite)
- Backend : Node + Express + MongoDB (Mongoose) dans `server/`
- Connexion : mot de passe chiffré (bcrypt), session par cookie `httpOnly`

**Vendre à un nouveau client : lis [VENDRE.md](VENDRE.md).** Tout ce qui est propre à un client est dans `clients/<nom>/`.

## Prérequis

- Node.js 18 ou plus
- MongoDB en local ([MongoDB Community](https://www.mongodb.com/try/download/community)) ou MongoDB Atlas (gratuit)

## Installation (une seule fois)

```bash
npm run install:all
cp server/.env.example server/.env
cp .env.example .env              # puis mets CLIENT=<nom du dossier dans clients/>
```

Au premier accès à `/admin`, le vétérinaire crée lui-même son mot de passe (il peut le changer dans le menu « Mot de passe »).
Mot de passe oublié : `npm run set-password --prefix server`.

## Développement

```bash
npm run dev:all
```

Site : http://localhost:5173 · Espace vétérinaire : http://localhost:5173/admin
Le client affiché est celui de la variable `CLIENT` dans le fichier `.env` de la racine (par défaut : `modele`).

## Utilisation avec un seul processus

```bash
npm run build:all
npm start
```

Le serveur sert le site et l'API sur http://localhost:4000.

## Sauvegardes

- **Radios et images** : fichiers dans `server/uploads/` (ou dans `UPLOADS_DIR`), pas dans le fichier JSON. Copie ce dossier avec le JSON.
- Bouton « Télécharger une sauvegarde » : `sauvegarde-veto-AAAA-MM-JJ.json`.
- Restauration : `npm run restore --prefix server -- chemin/vers/sauvegarde.json`
- Sauvegarde régulière (clé USB, autre disque, Drive). Un rappel s'affiche après 7 jours sans sauvegarde.

## Sécurité

- Mot de passe chiffré, jamais stocké en clair ; créé puis modifié par le vétérinaire dans le site (en ligne : code d'activation `SETUP_CODE`).
- Cookie `httpOnly`, `SameSite=Strict`, session de 12 h ; 10 tentatives de connexion maximum par 15 min.
- Toutes les routes de fiches, rendez-vous et export exigent la connexion.
- Formulaire de rendez-vous public : validé côté serveur, limité (10 par heure), champ anti-robot.
- En ligne : HTTPS, `COOKIE_SECURE=true`, `TRUST_PROXY=1`.

## API

| Route | Accès |
|---|---|
| POST `/api/auth/login`, `/api/auth/setup`, `/api/auth/logout`, GET `/api/auth/status`, `/api/auth/me` | public / session |
| POST `/api/auth/change-password` | connecté |
| POST `/api/rdv` | public |
| GET/POST `/api/fiches`, GET/PUT/DELETE `/api/fiches/:id` | connecté |
| GET `/api/rdvs`, PATCH/DELETE `/api/rdvs/:id` | connecté |
| GET `/api/export`, GET `/api/backup-status` | connecté |
