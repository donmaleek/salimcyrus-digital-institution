# Booking Process QA

- Date: 2026-08-25
- Target: http://localhost:3001/book-now
- Tier: Exhaustive
- Framework: Next.js 14
- Baseline health score: 64/100
- Final health score: 96/100

## ISSUE-001: Unverified visitors can create paid bookings

- Severity: High
- Category: Functional / Data integrity
- Status: Fixed and verified
- Reproduction:
  1. Open `/book-now/confirm` without signing in or returning from Paystack.
  2. Enter any name and email, leave the payment reference absent, and submit.
  3. The API returns HTTP 201 and creates a booking plus CRM work.
- Expected: A paid booking is accepted only after a valid, successful, unused payment is matched to the selected offer and payer.
- Actual: No payment evidence is requested or checked.
- Evidence: `screenshots/issue-unverified-before.png`, `screenshots/issue-unverified-after.png`
- Verification: Bogus reference returns HTTP 422 and creates no booking or CRM task. Regression suite covers successful, unavailable-slot, malformed, and unpaid paths.

## ISSUE-002: Guest success message promises an unavailable dashboard record

- Severity: Medium
- Category: Content / UX
- Status: Fixed and verified
- Reproduction: Complete ISSUE-001 as a guest.
- Expected: Give a truthful confirmation number and explain what happens next.
- Actual: The page claims the record will appear under My Bookings, even when no user account is associated.
- Evidence: `screenshots/issue-unverified-after.png`
- Verification: Guest confirmation promises only email updates. A dashboard link is rendered only when the paid booking belongs to the signed-in account.

## ISSUE-003: Paystack retries duplicate timeline and audit evidence

- Severity: High
- Category: Data integrity / Integration
- Status: Fixed and verified
- Reproduction: Deliver the same valid `charge.success` event more than once.
- Expected: One booking, transaction, payment activity, and audit event per Paystack reference.
- Actual before fix: Booking and transaction upserts were idempotent, but activity and audit rows were recreated on every delivery.
- Verification: Replay regression confirms money state updates while activity and audit creation remain at zero for an existing transaction.

## ISSUE-004: Mixed-case payer email can break account linking

- Severity: Medium
- Category: Identity / UX
- Status: Fixed and verified
- Reproduction: Pay with an email whose casing differs from the stored account email.
- Expected: Email identity matching is normalized and case-insensitive.
- Actual before fix: The webhook used exact-case `findUnique` matching.
- Verification: Regression asserts normalized case-insensitive lookup and correct `userId` linkage.

## ISSUE-005: Administrators can create past or overlapping availability

- Severity: High
- Category: Scheduling integrity
- Status: Fixed and verified
- Reproduction: POST a past time or a time intersecting an existing slot to `/api/admin/availability`.
- Expected: Only future, non-overlapping inventory is created.
- Actual before fix: Any valid ISO timestamp and duration was accepted.
- Verification: Five availability regressions cover minimum lead time, boundary adjacency, overlap, and creation suppression.

## ISSUE-006: Slot confirmation and deletion contain race windows

- Severity: High
- Category: Concurrency / Data integrity
- Status: Fixed and verified
- Reproduction: Confirm the same slot concurrently, or book a slot while an administrator removes it.
- Expected: Exactly one operation claims the slot and failed operations leave no false audit evidence.
- Actual before fix: Confirmation read then updated `isBooked`; deletion read then deleted by id.
- Verification: Conditional `updateMany` and `deleteMany` operations execute inside transactions. Regression checks zero-count conflict behavior.

## ISSUE-007: Availability API failure is presented as an empty calendar

- Severity: Medium
- Category: Resilience / Content
- Status: Fixed and verified
- Reproduction: Return a non-2xx response from `/api/booking/available-slots`.
- Expected: Explain that availability could not load and preserve a contact-to-schedule fallback.
- Actual before fix: Every failure silently became an empty slot array.
- Verification: Browser regression returns HTTP 503 and confirms the visible error and scheduling fallback.

## Verification summary

- 12 unit and regression suites passed, 64 tests total.
- 7 focused browser checks passed after browser test locator correction.
- TypeScript passed with no errors.
- Invalid payment was rejected by the live API with HTTP 422.
- Local schema migration `20260825190000_harden_booking_confirmation` applied successfully.
- The marked QA booking, task, activity, and contact created during reproduction were removed; zero marked bookings remain.
