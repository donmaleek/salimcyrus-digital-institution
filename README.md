# Salim Cyrus - Digital Institution

Monorepo for SalimCyrus.com: a Next.js 14 frontend backed by a Strapi headless CMS,
implementing the coaching / academy / knowledge centre / Halisi Hub Connect
architecture described in the website & digital institution strategy.

## Structure

- `src/` - Next.js 14 App Router frontend
- `prisma/` - database schema and migrations (PostgreSQL)
- `cms/` - Strapi headless CMS
- `infrastructure/` - Docker, Kubernetes, Terraform
- `tests/` - unit, integration, e2e

## Getting started

### Database (PostgreSQL)

Local dev runs a real, disposable PostgreSQL 18 instance in user space — no
system service, no sudo:

```
mkdir -p ~/pgdata-salimcyrus
/usr/lib/postgresql/18/bin/initdb -D ~/pgdata-salimcyrus -U $(whoami) --auth=trust
mkdir -p ~/pgdata-salimcyrus/sockets
/usr/lib/postgresql/18/bin/pg_ctl -D ~/pgdata-salimcyrus \
  -o "-p 5433 -k $HOME/pgdata-salimcyrus/sockets" \
  -l ~/pgdata-salimcyrus/logfile start
/usr/lib/postgresql/18/bin/createdb -h 127.0.0.1 -p 5433 -U $(whoami) salimcyrus
```

Stop it later with `pg_ctl -D ~/pgdata-salimcyrus stop`.

### Frontend

```
npm install
cp .env.example .env.local   # fill in real values
```

Then create `.env` (Prisma reads its own file, separate from `.env.local`):

```
DATABASE_URL="postgresql://<user>:<password>@127.0.0.1:5433/salimcyrus?schema=public"
```

```
npm run db:migrate   # applies migrations
npm run dev
```

Registration, login, sessions, the newsletter signup, and coaching bookings are backed
by this database out of the box — no external services required for local dev. Before
deploying to production, swap `DATABASE_URL` for a real hosted Postgres connection
string (Neon, Supabase, RDS, Railway, etc.) — the schema and migrations are already
plain PostgreSQL, so nothing else needs to change.

Paystack payment confirmation is wired for real: `/api/payments/webhook` verifies the
Paystack signature (HMAC-SHA512) and turns a successful charge into a `Booking` row,
linked to the buyer's account if their email matches a registered user. To activate it,
set `PAYSTACK_SECRET_KEY` and add a webhook in the Paystack dashboard pointing at
`https://<your-domain>/api/payments/webhook` — see `.env.example`. The public Paystack
checkout links used across the site already work today with no setup at all; the
webhook just makes purchases show up automatically in the buyer's dashboard instead of
requiring manual coordination.

The following still require real credentials before they're live (see `src/lib/api/*.ts`
for the integration points): Pesapal (an alternate payment processor), Resend (email),
Cal.com (scheduling), and the Strapi CMS below.

### CMS

```
cd cms
npm install
cp .env.example .env               # fill in real values
npm run develop
```

## Database

```
npm run db:migrate   # create/apply migrations (dev)
npm run db:studio    # browse data in Prisma Studio
```
