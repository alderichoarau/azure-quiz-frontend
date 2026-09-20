# Changelog

All notable changes to azure-quiz-frontend are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
generated from the commit history between each tagged release.

## [2.3.0] - 2026-09-19

### Added

- Fix a11y issue
- Update icon not showed
- Update offline message
- Add spinner and message when backend is not available

## [2.2.0] - 2026-09-18

- No user-facing changes (internal/chore only).

## [2.1.0] - 2026-09-18

### Added

- Improve composite workflow
- Add Dependabot substitute for alderichoarau/gha-actions

### Fixed

- Accessibility issue
- Release-push.yml deploys to prod on merge, not nonprod — release process is the prod gate

## [2.0.0] - 2026-09-16

### Fixed

- Possibility to give access path for dast and a11y
- Allow release-push.yml to deploy an existing tag to prod via workflow_dispatch

## [1.8.0] - 2026-09-16

### Added

- Red color for delete button
- Update test coverage
- Add stats for a person
- Refactor environment in workflow

## [1.7.0] - 2026-09-13

### Changed

- Update README.md

## [1.6.0] - 2026-08-28

### Added

- Apply last angular 22 best practices and use ndoe 26
- Add AZ-104 examn test and add screen in order to import exam

## [1.5.0] - 2026-08-06

### Changed

- Bump lint-staged from 17.2.0 to 17.3.0 in the minor-patch group

## [1.4.0] - 2026-08-06

### Changed

- Update README.md

## [1.3.0] - 2026-07-31

### Added

- Add some unit test

### Fixed

- Enable coverage on sonar
- --kubelogin-version pinned
- Fix bug while deploying on AKS

## [1.2.0] - 2026-07-31

- No user-facing changes (internal/chore only).

## [1.1.0] - 2026-07-31

### Added

- Show app version in header
- Enable Let's Encrypt TLS on AKS ingress via cert-manager
- Rename workflow
- Add config for aks
- Use nvmrc file
- Secure api exchange and add deployment woflow

### Changed

- Update README.md
- Rename workflow ands update README.md

### Fixed

- Chown nginx runtime dirs for non-root UID 101
- Fix bug during deployment
