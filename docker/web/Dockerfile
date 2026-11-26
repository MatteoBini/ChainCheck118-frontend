# syntax=docker/dockerfile:1
# Frontend ChainCheck118. Build context: root del repo.
#
#   target dev      → usato da docker-compose.dev.yml (sorgenti montati, Vite con HMR)
#   target build    → build statica di Vite
#   target runtime  → nginx che serve la build, usato da docker-compose.yml

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund \
 && sha256sum package-lock.json > node_modules/.deps-hash

FROM base AS dev
ENV NODE_ENV=development
COPY docker/web/entrypoint.dev.sh /usr/local/bin/entrypoint.dev.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.dev.sh && chmod +x /usr/local/bin/entrypoint.dev.sh
# I sorgenti arrivano dal bind mount di docker-compose.dev.yml.
EXPOSE 5173
ENTRYPOINT ["entrypoint.dev.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS build
COPY . .
# Le VITE_* sono incorporate nel bundle in fase di build.
ARG VITE_API_URL=/api
ARG VITE_USE_MOCKS=false
ENV VITE_API_URL=$VITE_API_URL \
    VITE_USE_MOCKS=$VITE_USE_MOCKS
RUN npm run build

FROM nginx:1.27-alpine AS runtime
# Sostituito in nginx.conf all'avvio del container.
ENV BACKEND_URL=http://backend:3000
COPY docker/web/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
