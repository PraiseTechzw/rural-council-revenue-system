# api-server

Node.js + Express + TypeScript API for the Rural Council Revenue Collection and Tracking System.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL (Neon)
- Drizzle ORM
- Zod

## Environment Variables

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `LOG_LEVEL`
- `CORS_ORIGIN`
- `BCRYPT_SALT_ROUNDS`
- `SEED_ADMIN_PASSWORD`
- `SEED_FINANCE_PASSWORD`
- `SEED_COLLECTOR_PASSWORD`

## Scripts

- pnpm dev
- pnpm build
- pnpm start
- pnpm db:generate
- pnpm db:migrate
- pnpm db:push
- pnpm db:studio
- pnpm db:seed

## Sample Requests

Health check:

```bash
curl http://localhost:4000/api/v1/health
```

Login:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"admin@ruralcouncil.local","password":"Admin@12345"}'
```

Create payment:

```bash
curl -X POST http://localhost:4000/api/v1/payments \
	-H 'Content-Type: application/json' \
	-H 'Authorization: Bearer <access-token>' \
	-d '{
		"payerId":"<payer-id>",
		"collectorId":"<collector-id>",
		"revenueSourceId":"<revenue-source-id>",
		"wardId":"<ward-id>",
		"amount":25,
		"currency":"USD",
		"paymentMethod":"cash",
		"paymentDate":"2026-04-04",
		"notes":"Monthly shop rental"
	}'
```
