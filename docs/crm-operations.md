# Business CRM operations

## Daily control loop

1. Open **Command Center** and clear critical Needs Attention signals.
2. Assign unowned records and give every active relationship a next action.
3. Reconcile unmatched payments before treating revenue totals as complete.
4. Review today's delivery, cases, and overdue commitments.
5. Record completion evidence instead of deleting tasks.

## Roles

- `owner`: all CRM, finance, configuration, export, and audit access.
- `administrator`: CRM and system administration.
- `sales`: relationships, opportunities, tasks, and client cases.
- `finance`: operational transactions, reconciliation, refunds, and finance exports.
- `delivery`: bookings, programs, participants, cases, and tasks.
- `marketing`: audience, campaigns, content, and consent-aware outreach.
- `community`: community relationships, partners, donations, and impact work.
- `analyst`: read-only reports and approved exports.

`isAdmin` remains a compatibility switch. Existing admins are treated as owners until
their `crmRole` is explicitly assigned. Authorization is enforced on the server.

## Initial rollout

1. Apply `20260825143000_add_business_crm` with `npx prisma migrate deploy`.
2. Run `npm run crm:seed` once. It is idempotent for pipelines, stages, products,
   programs, integrations, contacts, and Paystack references.
3. Compare migrated contact, booking, subscriber, Ask Salim, and payment counts.
4. Resolve duplicates and unmatched payments before enabling outbound automation.
5. Assign roles, owners, and next actions, then declare the CRM the operating record.

## Payment reconciliation

Paystack webhook records are verified and idempotent. PayPal and M-Pesa records must
enter through verified callbacks or a controlled finance import. A payment remains in
`unmatched` until linked to a relationship and business purpose or intentionally
accepted as an exception. CRM values are operational collections, never accounting
profit.

## Imports

Prepare CSV exports from active spreadsheets, payment statements, email, and the
official WhatsApp Business account. Preserve a source column and external reference.
Preview mappings, reject malformed rows, resolve duplicates, then import in batches.
Never import private journal contents into general CRM timelines.

## Outbound channels

Email and WhatsApp remain off until provider credentials are stored as deployment
secrets, WhatsApp templates are approved, and consent/suppression data has passed a
manual audit. Every outbound message must retain provider status and opt-out evidence.

## Backup and recovery

- Back up Postgres before migrations and historical imports.
- Restore application records and CRM records from the same database snapshot.
- Do not edit inventory or financial history directly; create an adjustment record.
- Use immutable audit events to investigate changes. Soft-deleted contacts remain
  recoverable until the configured retention period ends.

## Verification

Run `npm test`, `npm run eval:crm`, `npm run lint`, and `npm run build`. After provider
credentials are configured, verify webhook signatures and callback handling in each
provider sandbox before activating production delivery.
