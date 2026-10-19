# Site du cabinet vétérinaire – Annexe Oued Romane

Site public (Accueil, Services, À propos, Galerie, Contact + demande de rendez-vous) et espace sécurisé du vétérinaire (fiches clients/animaux, demandes de rendez-vous).

- Frontend : React + TypeScript + Tailwind (Vite)
- Backend : Node + Express + MongoDB (Mongoose) dans le dossier `server/`
- Connexion réelle : mot de passe haché (bcrypt), session par cookie `httpOnly`

## Prérequis

- Node.js 18 ou plus
- MongoDB en local ([MongoDB Community](https://www.mongodb.com/try/download/community)) **ou** une base Atlas (gratuite)

## Installation (une seule fois)

```bash
npm run install:all          # installe le site ET le serveur
cp server/.env.example server/.env
npm run set-password --prefix server   # choisit le mot de passe du vétérinaire (8 caractères min.)
```

Dans `server/.env` : `MONGODB_URI` (par défaut `mongodb://127.0.0.1:27017/vet-site`), `PORT` (4000).

## Développement

```bash
npm run dev:all
```

Le site tourne sur http://localhost:5173 et l'API est appelée automatiquement via `/api`.
Espace vétérinaire : http://localhost:5173/admin

Données d'exemple (facultatif) : `npm run seed --prefix server`

## Utilisation au cabinet (un seul processus)

```bash
npm run build:all
npm start
```

Le serveur sert le site et l'API sur http://localhost:4000.

## Sauvegardes

- **Radios et images** : elles sont enregistrées comme fichiers dans le dossier `server/uploads/` (pas dans le JSON de sauvegarde). Copie ce dossier en même temps que le fichier JSON.
- Bouton « Sauvegarde » dans l'espace vétérinaire : télécharge `sauvegarde-veto-AAAA-MM-JJ.json`.
- Restauration : `npm run restore --prefix server -- chemin/vers/sauvegarde.json`
- Faire une sauvegarde régulièrement (clé USB / autre disque), surtout avec une base locale.

## Sécurité

- Mot de passe haché (bcrypt), jamais stocké en clair ; changer : `npm run set-password --prefix server`.
- Cookie `httpOnly`, `SameSite=Strict`, session de 12 h ; 10 tentatives de connexion max / 15 min.
- Toutes les routes de fiches/RDV/export exigent la connexion.
- Formulaire de RDV public : validé côté serveur, limité (10 / h), champ anti-robot.
- **Si le site est mis en ligne** : utiliser HTTPS et mettre `COOKIE_SECURE=true` dans `server/.env`.

## Déploiement : à décider

Les fiches sont sensibles. Deux options : tout sur le PC du cabinet (simple, non public), ou site public en ligne avec une base hébergée (Atlas) et HTTPS.

## API

| Route                                                               | Accès            |
| ------------------------------------------------------------------- | ---------------- |
| POST `/api/auth/login`, POST `/api/auth/logout`, GET `/api/auth/me` | public / session |
| POST `/api/rdv`                                                     | public           |
| GET/POST `/api/fiches`, GET/PUT/DELETE `/api/fiches/:id`            | connecté         |
| GET `/api/rdvs`, PATCH/DELETE `/api/rdvs/:id`                       | connecté         |
| GET `/api/export`                                                   | connecté         |
