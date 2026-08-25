# Booking Service

The booking service joins Paystack payment ingestion, customer confirmation, availability, CRM follow-up, and the customer dashboard.

## Lifecycle

1. A customer chooses a coaching offer and pays through its Paystack checkout link.
2. The signed `charge.success` webhook creates one booking with status `paid` and one successful CRM transaction.
3. The customer opens `/book-now/confirm` and supplies the payment email and Paystack reference.
4. The confirmation API verifies the existing booking, successful transaction, payer email, and selected offer.
5. If a slot is selected, the API atomically claims a future open slot.
6. The same paid booking is updated to `confirmed`. A second booking is never created.
7. The CRM receives one confirmation activity and one owned scheduling or preparation task.

## Status meanings

- `paid`: Paystack verified the payment, but the customer has not completed scheduling.
- `confirmed`: Customer details are confirmed. A chosen slot is reserved, or the team has a scheduling task.
- `pending`: Legacy or manually reviewed record. New paid coaching confirmations do not use this status.

## Integrity rules

- Only signed Paystack events create paid booking records.
- Confirmation requires the payment reference and normalized payer email.
- A recognized Paystack offer must match the selected coaching offer.
- An unmatched Paystack offer can be classified once during confirmation.
- A payment reference confirms at most one booking.
- A slot must be open and in the future when it is claimed.
- Availability slots cannot overlap, including slots with different start times.
- Paystack retries update existing money state without duplicating activity or audit evidence.
- Signed-in account linking occurs only when the account and payer emails match case-insensitively.

## Operations

Apply migrations before restarting the app:

```bash
npm run db:migrate
```

The admin Availability workspace writes audit events for opening and removing slots. Booked slots cannot be removed. Failed public availability requests display a scheduling fallback instead of claiming the calendar is empty.

When a payment is visible as `paid`, ask the customer to use `/book-now/confirm`. If verification fails, check the Paystack reference, payer email, transaction status, and offer before changing any record.
