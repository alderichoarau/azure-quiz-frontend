# azure-quiz-frontend

Angular application to review Microsoft certifications (AZ-900, AZ-104 in progress): review by
module or mock exam, accessible from a simple link (no account). Consumes the REST API of
[azure-quiz-backend](../azure-quiz-backend).

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular_Material-22-757575?logo=materialdesign&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.9-F7B93E?logo=prettier&logoColor=black)

## Last analysis
[![CI · Build all](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/build-all.yml/badge.svg)](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/build-all.yml)
[![GitHub - Sonar Cloud Analysis](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/sonar.yml/badge.svg)](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/sonar.yml)
[![Deploy · Static Web Apps](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/swa-deploy.yml/badge.svg)](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/swa-deploy.yml)
[![Deploy · AKS](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/aks-deploy.yml/badge.svg)](https://github.com/alderichoarau/azure-quiz-frontend/actions/workflows/aks-deploy.yml)
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

## Deployment

Two independent tracks, both `workflow_dispatch` with a `nonprod`/`prod` choice — pick whichever this
learner's infrastructure uses (see
[azure-infra-terraform](https://github.com/alderichoarau/azure-infra-terraform)), not both against the same
secrets.

### Static Web Apps

`.github/workflows/swa-deploy.yml` builds the Angular app and deploys it to the Azure Static Web App
provisioned by the infra repo. `public/staticwebapp.config.json` handles the SPA fallback (all non-file
routes redirect to `index.html`) — it is copied as-is into the build output folder (`public/` = output root).

### AKS

`.github/workflows/aks-deploy.yml` builds the Docker image, pushes it to ACR, and `helm upgrade`s it onto the
shared AKS cluster instead. Its Ingress gets a real Let's Encrypt cert (see the infra repo's
`scripts/setup-cert-manager.sh`) rather than a self-signed one.

### Releasing

Run `release-prepare.yml` (`workflow_dispatch`, input `tag_name`, e.g. `v1.1.0`) — it bumps `package.json` and
opens a PR. Squash-merging it yourself when ready (`release-push.yml`) tags the release, creates the GitHub
release, and deploys the tag to **nonprod** on both tracks above.

## Structure

- `src/app/core` — models, services (`QuizApiService`/`AdminApiService` for REST calls,
  `QuizSessionStore` for signal-based quiz session state, `AdminKeyStore` for the admin gate — see
  "Content administration"), interceptors (`apiKeyInterceptor`, `adminKeyInterceptor`)
- `src/app/features` — pages: `certifications` (home), `modules` (a certification's modules +
  starting a mock exam), `quiz` (question-by-question flow), `results` (final score), `admin`
  (certification/module/question authoring, editing, deletion — see below)
- `src/app/shared` — reused across `quiz` and `admin`: `QuestionImage` (fetches an image content
  block's bytes via `HttpClient` so `X-Api-Key` is attached — a plain `<img src>` would 401 in
  prod), `InlineMarkdownPipe` (renders the small `**bold**`-only subset admins can use in question
  text/explanations)

## Content administration

`/admin` (not linked from the main nav — reachable by URL only) lets you author certifications,
modules, and questions (text + ordered images, single/multiple choice) without touching SQL or
redeploying. Gated by an admin key prompt kept in `sessionStorage` only, sent as `X-Admin-Key` on
`/api/admin/**` requests by `adminKeyInterceptor` — unlike the public API key
(`environment.apiKey`), this one is never built into the JS bundle; a 401/403 response clears the
stored key and drops the shell back to the prompt. See the backend README's "Content authoring"
section for the server side (soft-delete semantics, the image-upload flow, the bulk-import
script used for AZ-104's non-exam content).

## Out of scope for this repo

- Provisioning the Azure infrastructure (Static Web App, App Service, database, AKS, etc...).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). License: see [LICENSE](LICENSE).
