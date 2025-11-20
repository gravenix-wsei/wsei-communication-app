# WSEI Communicator Server

This server provides simple JWT-based authentication and stores users in MongoDB.

Quick start (development):

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start services with Docker Compose:

```bash
docker compose up -d
```

3. After MongoDB is up, run the manual DB initialization (one-time, idempotent):

```bash
docker compose run --rm server npm run init-db
```

4. The server runs on port `3000` by default. Endpoints:

- `POST /api/auth/register` -> body: `{ email, password, passwordConfirm, nickname? }`
- `POST /api/auth/login` -> body: `{ email, password }`

Notes:
- The `init-db` script ensures the unique index on `email` and is safe to re-run.
- For production, set `JWT_SECRET` to a strong secret and use proper secret management.
