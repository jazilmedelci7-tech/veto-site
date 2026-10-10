# Site vétérinaire – Docteur Vétérinaire, Annexe Oued Romane

React + TypeScript + Tailwind (Vite).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Pages
Publiques : `/`, `/services`, `/a-propos`, `/galerie`, `/contact`
Espace vétérinaire : `/admin` (fiches), `/admin/fiches/:id` (créer / modifier / supprimer), `/admin/rendez-vous`

## Espace vétérinaire
- Mot de passe provisoire : `veto2026` (à changer : variable `VITE_ADMIN_PASSWORD` dans un fichier `.env`)
- Créer, modifier, supprimer une fiche (avec confirmation), historique médical, recherche, filtre par espèce
- Les demandes envoyées depuis la page Contact arrivent dans « Rendez-vous » : confirmer, refuser, supprimer, ou créer la fiche pré-remplie

## Important : stockage actuel
Les données sont enregistrées dans le navigateur (localStorage, voir `src/store.tsx`), pas dans une base de données.
Elles sont donc propres à chaque navigateur/ordinateur, et le mot de passe n'est pas une vraie sécurité.
Étape suivante : une API (Node + MongoDB) avec connexion sécurisée. Il suffira de remplacer le contenu de `src/store.tsx` et `src/auth.ts`.

Logo : `public/logo-white.png` (fonds bleus) et `public/logo-blue.png` (fonds clairs).
