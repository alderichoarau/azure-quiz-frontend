# azure-quiz-frontend

Application Angular pour réviser les certifications Microsoft (AZ-900 pour commencer, AZ-104 ensuite) : révision par module ou
examen blanc, accessible depuis un simple lien (pas de compte). Consomme l'API REST de
[azure-quiz-backend](../azure-quiz-backend).

## Stack

- Angular 22 (standalone components, signals), Angular Material, ngx-translate (fr/en)
- Vitest (test runner natif Angular CLI 22)
- ESLint (`angular-eslint`) + Prettier, husky + lint-staged en pre-commit

## Lancer en local

Prérequis : Node 22+, et le backend (`azure-quiz-backend`) démarré sur `http://localhost:8080`.

```bash
npm install
npm start   # http://localhost:4200, cible l'API sur localhost:8080 (voir src/environments/environment.development.ts)
```

## Tests et qualité

```bash
npm test           # Vitest
npm run test:coverage
npm run lint
npm run format:check
```

## Build de production

```bash
npm run build:prod
```

Sortie statique dans `dist/azure-quiz-frontend/browser` (c'est ce dossier qu'il faut pointer comme
`output_location` lors du déploiement sur Azure Static Web Apps).

Avant de builder pour un déploiement réel, mettre à jour `src/environments/environment.ts` avec l'URL de l'API
backend déployée (`apiBaseUrl`).

## Déploiement (Azure Static Web Apps)

- `public/staticwebapp.config.json` gère le fallback SPA (toutes les routes non-fichier redirigent vers
  `index.html`) — il est copié tel quel dans le dossier de build (`public/` = racine de sortie).
- Le workflow de déploiement CI/CD vers Azure Static Web Apps sera ajouté une fois l'infrastructure provisionnée.

## Structure

- `src/app/core` — modèles, services (`QuizApiService` pour les appels REST, `QuizSessionStore` pour l'état de
  session de quiz basé sur des signals)
- `src/app/features` — pages : `certifications` (accueil), `modules` (modules d'une certification + démarrage
  examen blanc), `quiz` (déroulé question par question), `results` (score final)

## Hors scope de ce repo

- Provisioning de l'infrastructure Azure (Static Web App, App Service, base de données).
- Workflow de déploiement CI/CD vers Azure.
