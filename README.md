# MADIS — Frontend

Interface web de **MADIS (Ma Distribution)**, une application de gestion
commerciale et de suivi des stocks. Elle permet aux administrateurs, vendeurs
et gestionnaires de stock d'accéder aux fonctionnalités correspondant à leurs
rôles et permissions.

## Fonctionnalités

- Connexion et navigation adaptées aux droits de l'utilisateur.
- Gestion des fournisseurs, produits et référentiels.
- Consultation des stocks, lots et mouvements d'inventaire.
- Grilles tarifaires et promotions.
- Panier de vente, validation, paiement, historique et remboursements.
- Consultation et téléchargement des factures.
- Tableaux de bord, indicateurs commerciaux et affichage des prévisions.
- Gestion des comptes et outils d'import/export selon les écrans.

## Technologies et organisation

Le projet utilise **React, TypeScript, Vite, React Router et Tailwind CSS**.
Les tests unitaires utilisent Vitest et le lint repose sur ESLint.

- `src/pages/` : écrans de l'application.
- `src/features/` : composants et appels API regroupés par fonctionnalité.
- `src/auth/` : session, connexion et règles d'accès.
- `src/components/` : composants d'interface partagés.
- `src/utils/` : utilitaires et client HTTP.
- `public/` : ressources statiques et identité visuelle.
- `nginx.conf` : service des fichiers compilés et proxy API en production.

Le frontend appelle le [backend NestJS](https://github.com/Tantelyy/madis-back).
Il n'accède directement ni à PostgreSQL ni au
[service ML](https://github.com/Tantelyy/madis-fastAPI). Les autorisations métier
sont également contrôlées par le backend.

## Développement local

Prérequis : Node.js 22.12 ou supérieur dans la branche 22, npm et le backend
configuré et démarré. Exécuter les commandes depuis la racine de ce dépôt.
Sous PowerShell, utiliser `npm.cmd` si les scripts `.ps1` sont bloqués.

```bash
npm ci
cp .env.example .env
```

Sous PowerShell, utiliser `Copy-Item .env.example .env` pour la copie.
Conserver le fichier existant si le projet est déjà configuré.

Le fichier [.env.example](.env.example) fournit les paramètres locaux :

```dotenv
VITE_BACKEND_URL=http://localhost:3000
VITE_MADIS_LOGO_PATH=/branding/madis-logo.png
VITE_MADIS_SLOGAN="SMART CHOICE, BETTER LIFE"
```

Démarrer l'interface :

```bash
npm run dev
```

Ouvrir l'adresse affichée par Vite, généralement `http://localhost:5173`.
Cette origine doit être autorisée dans `FRONTEND_URL` côté backend.
Les comptes sont créés dans le backend ; le premier administrateur provient
de son seed.

Les variables `VITE_*` sont intégrées au code envoyé au navigateur :
elles ne doivent contenir aucun secret.

## Vérifications

```bash
npm test
npm run lint
npm run build
```

Le build génère les fichiers dans `dist/`. `npm run preview` permet de
prévisualiser ce build localement.

## CI/CD et déploiement

La CI exécute tests, lint et build sur les pull requests et les branches
`dev` et `main`, puis vérifie l'image frontend et la configuration Nginx.
Un push sur `main` publie `ghcr.io/tantelyy/madis-front`. Le CD met à jour
le frontend sur Contabo lorsque `DEPLOY_ENABLED=true`.

En production, une seule image contient le frontend compilé et Nginx.
Le build utilise `VITE_BACKEND_URL=/api` : Nginx sert React et transmet
`/api/*` au backend privé. L'URL HTTPS publique est fournie par ngrok.

Consulter le **[guide de déploiement Contabo](https://github.com/Tantelyy/madis-back/blob/main/deploy/README.md)**,
centralisé dans le dépôt backend. Il décrit la configuration commune aux trois
applications et les étapes du premier déploiement.
