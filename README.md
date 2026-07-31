# azure-quiz-frontend

Angular application to review Microsoft certifications (AZ-900 to start, AZ-104 next): review by
module or mock exam, accessible from a simple link (no account). Consumes the REST API of
[azure-quiz-backend](../azure-quiz-backend).

## Last analysis
[![GitHub - Build all](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/build-all.yml/badge.svg)](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/build-all.yml)
[![GitHub - Sonar Cloud Analysis](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/sonar.yml/badge.svg)](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/sonar.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=alderichoarau_azure-quiz-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=alderichoarau_azure-quiz-frontend)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=alderichoarau_azure-quiz-frontend&metric=bugs)](https://sonarcloud.io/summary/new_code?id=alderichoarau_azure-quiz-frontend)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=alderichoarau_azure-quiz-frontend&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=alderichoarau_azure-quiz-frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=alderichoarau_azure-quiz-frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=alderichoarau_azure-quiz-frontend)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=alderichoarau_azure-quiz-frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=alderichoarau_azure-quiz-frontend)


## Stack

- Angular 22 (standalone components, signals), Angular Material, ngx-translate (fr/en)
- Vitest (Angular CLI 22 native test runner)
- ESLint (`angular-eslint`) + Prettier, husky + lint-staged on pre-commit

## Run locally

Prerequisites: Node 22+, and the backend (`azure-quiz-backend`) running on `http://localhost:8080`.

```bash
npm install
npm start   # http://localhost:4200, targets the API on localhost:8080 (see src/environments/environment.development.ts)
```

## Tests and quality

```bash
npm test           # Vitest
npm run test:coverage
npm run lint
npm run format:check
```

## Production build

```bash
npm run build:prod
```

Static output in `dist/azure-quiz-frontend/browser` (that's the folder to point to as
`output_location` when deploying to Azure Static Web Apps).

Before building for a real deployment, update `src/environments/environment.ts` with the deployed
backend API URL (`apiBaseUrl`).

## Deployment (Azure Static Web Apps)

- `public/staticwebapp.config.json` handles the SPA fallback (all non-file routes redirect to
  `index.html`) — it is copied as-is into the build output folder (`public/` = output root).
- The CI/CD deployment workflow to Azure Static Web Apps will be added once the infrastructure is
  provisioned.

Piste AKS: `.github/workflows/aks-deploy.yml` builds the Docker image and `helm upgrade`s it onto the shared
AKS cluster instead. Its Ingress gets a real Let's Encrypt cert (see the infra repo's
`scripts/setup-cert-manager.sh`) rather than a self-signed one.

**Releasing**: run `release-prepare.yml` (`workflow_dispatch`, input `tag_name`, e.g. `v1.1.0`) — it bumps
`package.json` and opens an auto-merging PR. Merging it (`release-push.yml`) tags the release, creates the
GitHub release, and deploys the tag to **nonprod** on both tracks (AKS + Static Web App).

## Structure

- `src/app/core` — models, services (`QuizApiService` for REST calls, `QuizSessionStore` for
  signal-based quiz session state)
- `src/app/features` — pages: `certifications` (home), `modules` (a certification's modules +
  starting a mock exam), `quiz` (question-by-question flow), `results` (final score)

## Out of scope for this repo

- Provisioning the Azure infrastructure (Static Web App, App Service, database).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). License: see [LICENSE](LICENSE).
