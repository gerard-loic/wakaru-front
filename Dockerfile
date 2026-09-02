# syntax=docker/dockerfile:1

# ---- Étape 1 : build du code source -> code compilé (dist/) ----
FROM node:22-alpine AS build
WORKDIR /app

# pnpm via corepack, version alignée sur .mise.toml
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

# Dépendances (couche mise en cache tant que ces 2 fichiers ne changent pas)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Le reste du code source, puis compilation
COPY . .
RUN pnpm build

# ---- Étape 2 : image finale = nginx + code compilé, rien d'autre ----
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
# nginx:alpine lance déjà nginx en foreground (CMD par défaut de l'image de base)
