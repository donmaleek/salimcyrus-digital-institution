# Salim Cyrus - Digital Institution

SalimCyrus.com: a self-contained Next.js 14 app implementing the coaching / academy /
knowledge centre / Halisi Hub Connect architecture described in the website & digital
institution strategy. All content (books, programs, coaching offers, journal, knowledge
centre) lives in the app's own TypeScript data files under `src/lib/data/` — there is no
runtime dependency on the `cms/` folder below or any other external content service.
Auth, bookings, scheduling, and the newsletter are all backed by the app's own
PostgreSQL database. The only outside service the site needs to fully operate is
Paystack, for actually taking payment — see the Booking & Payments section below.

## Structure

- `src/` - Next.js 14 App Router frontend — the whole live app
- `prisma/` - database schema and migrations (PostgreSQL)
- `cms/` - an optional, currently-unused Strapi instance scaffolded for a possible
  future content-editing workflow. Nothing in `src/` reads from it; it is not required
  to run the site.
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

Registration, login, sessions, the newsletter signup, coaching bookings, and scheduling
are all backed by this database out of the box — no external services required for
local dev. Before deploying to production, swap `DATABASE_URL` for a real hosted
Postgres connection string (Neon, Supabase, RDS, Railway, etc.) — the schema and
migrations are already plain PostgreSQL, so nothing else needs to change.

### Booking & scheduling (self-hosted, no Cal.com)

Availability is managed entirely in-app — no external calendar tool:

1. Promote an account to admin: `npm run admin:promote you@example.com` (they must
   already be registered).
2. Sign in and go to **My Account → Availability (Admin)** in the dashboard
   (`/dashboard/admin/availability`) to add or remove open time slots.
3. Customers pick a real open slot at `/book-now/confirm`, which calls
   `/api/booking/available-slots` (read) and `/api/booking/confirm` (book). Booking a
   slot is done inside a database transaction, so two people can never claim the same
   slot.

### Payments

The public Paystack checkout links used across the site already work today with zero
setup. Paystack is the one external service this project intentionally keeps — running
your own payment processor isn't realistic — but confirming _that a payment happened_
is fully self-hosted: `/api/payments/webhook` verifies Paystack's signature
(HMAC-SHA512) itself and turns a successful charge into a `Booking` row, linked to the
buyer's account if their email matches a registered user. To activate it, set
`PAYSTACK_SECRET_KEY` and add a webhook in the Paystack dashboard pointing at
`https://<your-domain>/api/payments/webhook` — see `.env.example`. Until that's
configured, customers can still self-report a completed payment at `/book-now/confirm`.

Mission support at `/support-the-mission` offers three routes:

- Paystack creates a server-side KES checkout through `/api/payments/initiate`; card and
  mobile-money details remain on Paystack's hosted checkout.
- M-Pesa Paybill displays the verified Paybill and account values with copy controls.
- PayPal displays the confirmed recipient email. Replace this instruction with a tested
  PayPal Business payment link when one has been created in the account dashboard.

Pesapal and Resend remain unimplemented. Contact forms open the visitor's own email
client instead of calling an email API.

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
