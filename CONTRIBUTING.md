# Contributing to azure-quiz-frontend

Thanks for your interest in this project! This repository is proprietary (see [LICENSE](LICENSE)),
but external contributions are welcome as pull requests.

By submitting a contribution, you agree that it will be incorporated into the project under the
same terms as the rest of the code (copyright retained by the repository maintainer).

## Before you start

For non-trivial changes (new feature, architecture change), please open an issue first to discuss
it before investing time in an implementation.

## Setting up the environment

Prerequisites: Node 22+, and the backend [azure-quiz-backend](../azure-quiz-backend) running on
`http://localhost:8080`.

```bash
npm install
npm start
```

## Before opening a pull request

```bash
npm test          # unit tests (Vitest)
npm run lint      # ESLint
npm run format:check   # Prettier
```

These checks also run on pre-commit (husky + lint-staged) and will be re-checked in CI.

## Conventions

- Commits: clear, concise, imperative messages (e.g. `fix: correct score calculation`).
- Code: follows the repo's ESLint/Prettier config, no extra rule to memorize.
- One pull request = one topic. Prefer several focused PRs over one catch-all PR.

## Pull requests

1. Fork or branch from `main`.
2. Develop and verify locally (see above).
3. Open the PR with a clear description of the problem solved and the approach chosen.
4. A maintainer reviews and merges once CI passes.