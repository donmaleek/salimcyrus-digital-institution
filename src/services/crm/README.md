# Salim Cyrus CRM service

This directory owns CRM contracts, permissions, normalization, analytics, and workflow rules. The Next.js admin is the presentation layer; Prisma is the persistence adapter.

## Invariants

- Active relationships have an owner and a visible next-action state.
- Money is stored in minor currency units. CRM revenue is never labelled accounting profit.
- Contact matching uses normalized email and phone values while retaining the entered values.
- Protected actions are checked server-side; navigation visibility is not authorization.
- Every mutation writes a `CrmAuditEvent` in the same database transaction.
- Provider webhooks are idempotent by external reference.

## Operations

Run `npm run db:migrate` in development or `npx prisma migrate deploy` during deployment, then `npx prisma generate`. Seed Salim's book/program catalog with `npm run crm:seed`.
