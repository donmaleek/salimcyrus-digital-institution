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

Paystack is available for donations, coaching, books, teachings, courses, and Journal
memberships. Every checkout is initialized by this application using server-owned prices
and the server-only `PAYSTACK_SECRET_KEY`; card and mobile-money details stay on Paystack's
hosted checkout. Return pages verify the transaction directly with Paystack before granting
access. `/api/payments/webhook` separately verifies Paystack's HMAC-SHA512 signature and
provides asynchronous fulfillment where applicable. To activate it, set
`PAYSTACK_SECRET_KEY` and add a webhook in the Paystack dashboard pointing at
`https://<your-domain>/api/payments/webhook` — see `.env.example`.

Mission support at `/support-the-mission` offers two routes:

- Paystack creates a server-side KES checkout through `/api/payments/initiate`; card and
  mobile-money details remain on Paystack's hosted checkout.
- PayPal creates a real order through `/api/payments/paypal-donate`, charged in USD.

M-Pesa Paybill was offered as a third, manually-reviewed route (a buyer-submitted
confirmation code an admin approved) across donations, books, teachings, courses, Journal,
and coaching. It was removed as a live checkout option in favor of Paystack and PayPal
everywhere. The underlying `PaymentClaim` model and admin review flow
(`/dashboard/admin/payment-claims`) are untouched, so any claim submitted before the
removal can still be reviewed and approved; only the submission route and form
(`PaybillClaimForm`) were removed.

### Private alignment sessions

The coaching catalog includes two focused, confidential pathways:

- `/work-with-salim/coaching/identity-life-alignment`
- `/work-with-salim/coaching/single-motherhood-life-alignment`

Their shared editorial content lives in `src/lib/data/alignment-sessions.ts`. Both pages
lead into the existing private-session booking flow and provide WhatsApp as a lower-pressure
way to ask a confidential question before booking. They are coaching and structured
reflection services, not clinical treatment; keep the scope-of-support statement intact
when editing either pathway.

Each pathway has a distinct desktop and mobile hero under `public/images/alignment/`.
Those generated WebP assets are tracked with Git LFS and resolved through the shared
`PageHero` image registry in `src/lib/data/hero-visuals.ts`.

The public contact, booking, newsletter, Ask Salim, and Paystack webhook routes now
feed the native Business CRM. Resend and WhatsApp sending remain disabled until the
official credentials, consent rules, and approved templates are configured.

### Business CRM

Administrators land at `/dashboard/admin/crm`, Salim's executive command center.
It unifies relationships, pipeline, tasks, service, payments, delivery, books,
marketing, community support, reports, and audit history while retaining the site's
existing bookings and content tools.

After applying migrations, initialize the Salim-specific pipelines, seven programs,
fourteen books, integrations, and existing-site relationship history:

```
npm run crm:seed
```

See `docs/crm-operations.md` for permissions, reconciliation, imports, recovery, and
provider activation.

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

## Site suspension (kill switch)

The whole site can be taken offline for every visitor and brought back
without touching any data or redeploying, controlled only by the developer
(the client has no way to see or flip this). On the production server:

```
node scripts/toggle-site.js on       # suspend the whole site
node scripts/toggle-site.js off      # bring it back
node scripts/toggle-site.js status   # check current state, no change
```

Suspended visitors get a 503 page reading "This site can no longer be
reached. Please contact your Contabo server provider or CDN for more
information." (no mention of billing). The developer can still view the live site while
suspended by visiting `https://salimcyrus.com/?bypass=<SUSPENSION_BYPASS_TOKEN>`
once; that sets a long-lived cookie so the token doesn't need to be re-entered.
See `src/middleware.ts` and `src/lib/suspension.ts`.

## Coaching category card images

The 8 coaching category cards on Book Now (Standard, Identity & Life
Alignment, Single Motherhood & Life Alignment, Individual, Couples, Group,
VIP Summit, Parenting Mentorship) each show a small gold-on-navy mark
instead of the initials fallback. The default set is generated from
committed source, not stock photos: each one is a hand-authored SVG in
`scripts/lib/coaching-category-svg.js`, rasterized to WebP with `sharp`
(already a project dependency). Regenerate and re-seed all 8 any time with:

```
node scripts/generate-coaching-category-images.js
```

Safe to re-run; it overwrites the existing files and DB rows in place.

An admin can also replace any individual category's image from
`/dashboard/admin/coaching` (`CoachingOfferManager`) two ways: upload a
file directly, or click "Generate with AI" to call the OpenAI Images API
(gpt-image-1) with an editable, brand-styled prompt. The AI option needs
`OPENAI_API_KEY` set (see `.env.example`); without it, the button returns
a clear "not configured" message rather than failing silently, same
degrade-gracefully pattern as Paystack/PayPal/Resend elsewhere in this
app. Every call costs real money on that key's account, so it's admin-only
and never reachable from a public route.

## Parental Guidance (parenting curriculum platform)

A full paid curriculum under `/parental-guidance`, built entirely on the
existing Academy course infrastructure rather than a parallel system:

- **Courses.** The 12 curriculum modules plus the flagship "Foundations of
  Intentional Parenting" course are ordinary `Course` rows tagged
  `category: "Parental Guidance"`, so they get the existing catalogue,
  checkout (Paystack/PayPal), enrollment, progress tracking, and admin
  `CourseEditor` for free. They ship as **drafts with placeholder prices**;
  an admin must review pricing in `/dashboard/admin/courses` and publish
  each one before it is purchasable.
- **Parent Membership** (`/parental-guidance/membership`) grants access to
  every Parental Guidance course for 30 days per payment. There is no
  recurring/auto-charge billing anywhere in this codebase, so membership is
  structured exactly like the Journal's: each payment appends its own
  30-day row (`ParentMembership`), and access is "does the user have any
  row still in the future" (see `src/services/payments/parent-membership.ts`).
  A member who opens a course they have not separately purchased is
  auto-enrolled with a zero-amount synthetic reference, the same mechanism
  a free course already uses.
- **Lesson resources.** A lesson can carry one downloadable PDF
  (`CourseLesson.resourceLabel`/`resourceFileName`), gated by the same rule
  as the lesson itself (enrollment or an active membership), served from
  `COURSE_RESOURCES_STORAGE_DIR` (see `.env.example`), never `/public`. An
  admin attaches or replaces one from the course edit page once a lesson
  has been saved.
- **Parenting Mentorship** and the **school/organization package** are
  request-only, no fixed price: mentorship reuses the existing coaching
  request-tier pattern (`parenting-mentorship` category in
  `src/lib/data/coaching-offers.ts`), and the school/org request is a CRM
  lead capture at `/api/parental-guidance/school-request`.
- **Standalone resources** (journals/worksheets sold outside a course) can
  reuse the existing `Book` model via `Book.category = "Parenting
  Resource"`, which keeps them out of the public Books catalogue (that
  page defaults to `category: "Book"`) while sharing the same
  purchase/review/download-grant machinery.

Seed the 12 modules and the flagship course (idempotent, safe to re-run):

```
node scripts/seed-parental-guidance.js
```

This also renders each module's real downloadable worksheet as a PDF via
Playwright's Chromium (already a project dependency for e2e tests, so no
new npm package was needed) from `scripts/lib/render-worksheet-pdf.js`,
using the actual curriculum content in
`scripts/lib/parental-guidance-curriculum.js`.

### Guided booking experience

`/book-now` presents one decision at a time: session type, session, then details
and payment. Shared offer links open checkout directly; browser back and type
changes restore the appropriate step. Quote requests open immediately and travel
logistics are collected before checkout. Admin-edited prices and locations stay
visible. After payment, `/book-now/confirm` verifies the receipt and offers time
selection or scheduling help.

Run `bash scripts/check-booking.sh` for the booking gate and content evals. With
a running app and accessible catalog, set `PLAYWRIGHT_BASE_URL` to include browser
checks. The tests intercept all booking writes and provider requests. See
[the guided booking guide](docs/booking/guided-booking.md) for contracts and QA.
