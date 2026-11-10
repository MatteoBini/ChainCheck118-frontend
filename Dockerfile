# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

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

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
