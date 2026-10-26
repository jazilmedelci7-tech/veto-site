# Vendre le site à plusieurs vétérinaires

## Le principe

- **Un seul code** (ce projet) pour tous les clients.
- **Un dossier par client** dans `clients/` : ses réglages (`config.ts`) et ses images (`public/`).
- **Un site en ligne par client**, avec **sa propre base de données**, **son propre mot de passe**, **son propre Telegram**. Les données d'un client ne touchent jamais celles d'un autre.
- Pour un nouveau client, tu ne modifies **jamais le code** : tu copies un dossier et tu changes ses réglages.

Dossiers actuels :

| Dossier | Rôle |
|---|---|
| `clients/modele/` | Modèle vide et neutre. **Ne l'utilise jamais pour un vrai client : copie-le.** |
| `clients/cabinet-belcourt/` | Premier client (Belcourt + Oued Romane). |

## Nouveau client : étape par étape

**A. Créer son dossier**
Copie `clients/modele` et renomme la copie, par exemple `clients/dr-martin` (lettres minuscules, tirets, pas d'espace).

**B. Remplir ses réglages**
Ouvre `clients/dr-martin/config.ts` et change : `titre`, `nom`, `ville`, `accroche`, `indicatifPays` (213 Algérie, 216 Tunisie, 212 Maroc, 33 France), `couleur`, les `cabinets` (adresse, téléphone, horaires), les `services` et, si le client en a, les `avis` (de vrais avis de ses clients).
Ne mets que de vraies informations : si la liste des avis est vide, la section est masquée automatiquement.

**C. Mettre ses images**
Dans `clients/dr-martin/public/` : remplace `logo-blue.png` et `logo-white.png` (même noms). Photos facultatives des services : dossier `services/`, puis `image: '/services/radiographie.jpg'` dans `config.ts`.

**D. Tester chez toi**
À la racine du projet, crée (ou modifie) le fichier `.env` avec une seule ligne :
```
CLIENT=dr-martin
```
Puis `npm run dev:all` et ouvre http://localhost:5173. Vérifie le nom, les adresses, les téléphones, la couleur, le formulaire de rendez-vous, la création du mot de passe et un lien WhatsApp.
⚠️ Pour tester, utilise ta base locale, jamais la base d'un autre client.

**E. Créer sa base de données (MongoDB Atlas)**
Une base **à part** pour chaque client : nom de base différent (ex. `dr-martin`), avec son propre utilisateur Atlas. Copie son adresse de connexion :
`mongodb+srv://UTILISATEUR:MOTDEPASSE@cluster0.xxxxx.mongodb.net/dr-martin`
Dans Atlas → Network Access, autorise l'accès (`0.0.0.0/0`) car les adresses de l'hébergeur changent.

**F. Le mot de passe : c'est le client qui le crée, pas toi**
Tu n'as rien à faire avec son mot de passe. À sa première visite sur `/admin`, le site lui demande de **créer son mot de passe** (8 caractères minimum), puis il est connecté. Il peut le changer ensuite dans le menu « Mot de passe ».
Pour qu'un inconnu ne puisse pas créer le mot de passe à sa place avant lui, tu mets une variable `SETUP_CODE` (un code que tu inventes, par exemple `K7M2-Q9XP`) chez l'hébergeur, et tu le donnes au client avec l'adresse du site. Le site le lui demande une seule fois, à la création du mot de passe.
Si le client **oublie** son mot de passe : sur ton PC, `$env:MONGODB_URI="adresse de SA base"` puis `npm run set-password --prefix server`, et tu lui donnes un mot de passe provisoire qu'il change aussitôt.

**G. Mettre en ligne (un service par client)**
Chez l'hébergeur, crée **un service Node pour ce client**, relié au même dépôt GitHub, avec :

| Réglage | Valeur |
|---|---|
| Build command | `npm run deploy:build` |
| Start command | `npm start` |
| Node | 20 ou plus |

Et ces **variables d'environnement** (propres à ce client) :

| Variable | Valeur |
|---|---|
| `CLIENT` | `dr-martin` (le nom du dossier) |
| `MONGODB_URI` | l'adresse Atlas de CE client |
| `NODE_ENV` | `production` |
| `COOKIE_SECURE` | `true` |
| `TRUST_PROXY` | `1` |
| `SETUP_CODE` | un code à toi, donné au client pour créer son mot de passe |
| `UPLOADS_DIR` | dossier du disque persistant, ex. `/data/uploads` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | facultatif : le bot Telegram de CE vétérinaire |

**Disque persistant** : attache-en un au service et fais pointer `UPLOADS_DIR` dessus. Sans ça, les radios disparaissent à chaque redémarrage.

**H. Livrer**
Donne au client : l'adresse du site, l'adresse de l'espace vétérinaire (`/admin`), son code d'activation (`SETUP_CODE`), et explique-lui le bouton « Sauvegarde » (une fois par semaine, avec copie sur clé USB ou Drive).

## Choisir l'hébergeur

Il faut un service **toujours allumé** (sinon le message Telegram de 8 h ne part pas) et un **disque persistant** (pour les radios).

- **Offres gratuites : à éviter pour un vrai client.** Chez Render, un service gratuit s'endort après 15 minutes sans visite (réveil d'environ une minute), il ne peut pas avoir de disque persistant, et sa base gratuite expire après 30 jours. Elles ne conviennent que pour une démonstration.
- **Offre payante simple** : par exemple Railway (plan Hobby à 5 $ par mois, avec 5 Go de volume) ou un service payant Render avec disque. Vérifie les prix et l'offre à jour avant de t'engager : ils changent.
- Compte les coûts dans ton prix : hébergement du site + base de données (Atlas gratuit M0 pour démarrer, 512 Mo, sans sauvegarde automatique).
- Une base partagée entre plusieurs clients n'est pas recommandée pour de vraies données de santé. Au minimum : une base **et** un utilisateur séparés par client.

Sources : render.com/free · docs.railway.com/pricing/plans

## Mettre à jour le code

Quand tu améliores le site, tous les clients reçoivent la mise à jour **au prochain déploiement de leur service**. Teste toujours d'abord avec `CLIENT=modele` (puis avec un vrai client sur ton PC) avant de redéployer chez tout le monde.

## Données et contrat (à discuter avec le client)

Les fiches contiennent des noms, téléphones et dossiers médicaux d'animaux : ce sont des données personnelles de propriétaires. Avant de vendre, prévois par écrit : à qui appartiennent les données (au vétérinaire), qui fait les sauvegardes, ce qui se passe s'il arrête l'abonnement (export des données), le prix, la maintenance et l'hébergement. Renseigne-toi sur la loi algérienne de protection des données personnelles (loi 18-07) auprès d'un juriste : je ne suis pas juriste.

## Si on te demande « et si je veux un 2ᵉ cabinet ? »

Dans `config.ts`, copie le bloc du cabinet dans la liste `cabinets`, change son `id`, son nom, son adresse et son téléphone. Le formulaire de rendez-vous propose alors le choix du cabinet tout seul.
