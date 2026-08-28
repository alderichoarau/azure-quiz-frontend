# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────────────────────────────────────
# Multi-stage build for the AKS track (piste "AKS", see helm/ and
# .github/workflows/aks-deploy.yml). swa-deploy.yml (Static Web Apps track)
# never uses this image.
#
# API_BASE_URL/API_KEY are baked in at build time via the same sed-into-
# environment.ts substitution swa-deploy.yml already does ("Inject prod
# environment values" step) -- Angular bundles environment.ts into the JS at
# build time either way, so there's no "runtime env var" option here without
# a bigger restructure (e.g. a config.json fetched at startup). Consequence:
# a URL/key change means a rebuild + redeploy, not just a new `helm upgrade
# --set`, same constraint that already exists for the Static Web App track.
# ──────────────────────────────────────────────────────────────────────────────

# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# generate-version.mjs runs as npm's "postinstall" hook (package.json) --
# needs to exist before `npm ci` fires it, so it's copied in ahead of the
# rest of the source instead of waiting for the COPY . . below. Rarely
# changes, so this barely dents the npm ci layer's cache hit rate.
COPY scripts/generate-version.mjs ./scripts/generate-version.mjs
RUN npm ci

COPY . .

# Re-run now that the full source (including whatever version.ts happens to
# be committed) is in place -- the postinstall run above executed inside a
# tree that only had package.json, and this COPY just overwrote its output
# with git's copy again. Cheap and idempotent; guarantees the image ships the
# version.ts matching package.json's actual version, not a possibly-stale
# committed one.
RUN node scripts/generate-version.mjs

ARG API_BASE_URL
ARG API_KEY
RUN test -n "$API_BASE_URL" && test -n "$API_KEY" || (echo "API_BASE_URL and API_KEY build args are required" && exit 1)
RUN sed -i "s#https://REPLACE_WITH_PROD_API_URL/api#${API_BASE_URL}#" src/environments/environment.ts \
 && sed -i "s/__BACKEND_API_KEY__/${API_KEY}/" src/environments/environment.ts

RUN npm run build:prod

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:1.31-alpine

# Pulls in patched Alpine packages (e.g. libssl3/libcrypto3) that landed
# upstream after this base image tag was last published -- trivy's image
# scan (container.yml) flags these otherwise. --no-cache skips storing the
# package index, keeping the layer small.
RUN apk update && apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/azure-quiz-frontend/browser /usr/share/nginx/html

# The Helm chart runs this container as non-root (securityContext.runAsUser:
# 101, deployment.yaml) -- nginx's master process normally creates
# /var/cache/nginx/*'s subdirectories and the pidfile itself while still
# root, before dropping privileges to the "nginx" user for workers only.
# Forced non-root from the start, it never has the rights to create them
# ("mkdir() /var/cache/nginx/client_temp failed (13: Permission denied)" at
# boot -- hit live). Pre-create and chown them here, at build time, while
# we're still root.
#
# /var/run is a symlink to /run on Alpine -- chowning the symlink path alone
# doesn't reliably propagate to files later created inside the real target
# directory ("open() /run/nginx.pid failed (13: Permission denied)" at boot,
# hit live even after chowning /var/run). Touch and chown the pidfile itself,
# at its real /run path, so nginx only has to overwrite an already-owned file
# instead of creating a new one in a directory it doesn't own.
RUN mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
 && chown -R 101:101 /var/cache/nginx /etc/nginx/conf.d /usr/share/nginx/html \
 && touch /run/nginx.pid \
 && chown 101:101 /run/nginx.pid

USER 101
EXPOSE 80
