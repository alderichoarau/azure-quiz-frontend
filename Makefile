.DEFAULT_GOAL := help
.PHONY: help install run build test coverage lint format check audit a11y

help: ## Show this list of targets
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm ci

run: ## Run the dev server (http://localhost:4200) -- needs the backend running separately
	npm start

build: ## Production build (dist/)
	npm run build:prod

test: ## Run the test suite
	npm test

coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Lint the codebase
	npm run lint

format: ## Auto-format with Prettier
	npm run format

check: ## Lint + format check (same as CI's checks)
	npm run check

audit: ## npm audit (high severity and above)
	npm run security:audit

a11y: ## Run the axe-core accessibility check
	npm run a11y
