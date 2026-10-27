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
```sh
docker compose up --build          # build servita da nginx → http://localhost:8080
docker compose --profile dev up    # Vite con hot reload → http://localhost:5173
```
In entrambi i casi il backend è raggiunto su `host.docker.internal:3000` (variabile `BACKEND_URL`).
