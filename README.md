# ChainCheck118-frontend
Certificazione tramite blockchain delle checklist di mezzi di soccorso

## Sviluppo
Avviare prima il backend (repo `ChainCheck118-backend`, vedi il suo README) su `localhost:3000`, poi:

```sh
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Il frontend chiama sempre `/api/...`: il proxy di Vite (in Docker: nginx) inoltra al backend
togliendo il prefisso, quindi `/api/auth/login` → `POST /auth/login`. Il backend non ha CORS,
per cui non va chiamato direttamente dal browser.

Utenti creati dal seed del backend (password `password123`):

| Username       | Ruolo        | Home          |
| -------------- | ------------ | ------------- |
| `soccorritore` | SOCCORRITORE | `/checklist`  |
| `ispettore`    | ISPETTORE    | `/ispezione`  |
| `operatore`    | OPERATORE    | `/centrale`   |

Con `VITE_USE_MOCKS=true` l'app funziona senza backend, con gli stessi utenti simulati.

## Docker
```
docker/
  web/     Dockerfile (target dev | build | runtime), entrypoint.dev.sh, nginx.conf
docker-compose.dev.yml   sviluppo: sorgenti montati, hot reload
docker-compose.yml       immagine di produzione (nginx)
```

### Sviluppo
```sh
docker compose -f docker-compose.dev.yml up --build -d    # Vite con HMR → http://localhost:5173
```
- Log: `docker compose -f docker-compose.dev.yml logs -f web`
- Lint / typecheck: `docker compose -f docker-compose.dev.yml exec web npm run lint` (o `typecheck`)
- Nuove dipendenze: dopo `npm install <pkg>` basta `docker compose -f docker-compose.dev.yml restart web`

### Produzione
```sh
docker compose up --build -d     # build servita da nginx → http://localhost:8080
```
In entrambi i casi il backend è raggiunto su `host.docker.internal:3000` (variabile `BACKEND_URL`).
