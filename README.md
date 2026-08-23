# Salim Cyrus - Digital Institution

Monorepo for SalimCyrus.com: a Next.js 14 frontend backed by a Strapi headless CMS,
implementing the coaching / academy / knowledge centre / Halisi Hub Connect
architecture described in the website & digital institution strategy.

## Structure

- `src/` - Next.js 14 App Router frontend
- `prisma/` - database schema and migrations (SQLite for local dev)
- `cms/` - Strapi headless CMS
- `infrastructure/` - Docker, Kubernetes, Terraform
- `tests/` - unit, integration, e2e

## Getting started

### Frontend

```
npm install
cp .env.example .env.local   # fill in real values
```

Then create `.env` (Prisma reads its own file, separate from `.env.local`) with an
**absolute** path to avoid a known Prisma quirk where the CLI and the Next.js runtime
resolve relative SQLite paths differently:

```
DATABASE_URL="file:/absolute/path/to/this/project/prisma/dev.db"
```

```
npm run db:migrate   # creates prisma/dev.db and applies migrations
npm run dev
```

Registration, login, sessions, the newsletter signup, and coaching bookings are backed
by this database out of the box — no external services required for local dev. Swap
`DATABASE_URL` for a real Postgres/MySQL connection string (and `provider` in
`prisma/schema.prisma`) before deploying to production; SQLite is dev-only.

The following still require real credentials before they're live (see `src/lib/api/*.ts`
for the integration points): Paystack/Pesapal (payments — the public Paystack checkout
links used across the site work today without any setup), Resend (email), Cal.com
(scheduling), and the Strapi CMS below.

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
