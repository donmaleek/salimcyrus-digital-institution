# Guided session booking

## Outcome

Clients can reach the session choices by selecting one visible category, and
reach payment by selecting one session. Only one decision step is shown at a
time. The old mobile page placed its first booking action about 5,100px down.
The redesign removes that required scroll and moves focus to each next step.

## Design review

The page is a booking task, rather than an editorial landing page. Use a short
navy introduction, a light workspace, readable 16px body text, 48px controls,
plain headings and a three-step progress indicator. Type selection uses compact
text choices. Show the selected category's full-width image below its text in a
supporting summary, not eight image panels above the booking actions.

Flow: session type -> session -> details/payment (or a request for quoted tiers).
Offer cards show duration, live price, fit, and one named booking button. A back
button and editable summary let a client correct their selection. Show payment
before scheduling explicitly, because the existing backend assigns times after
verified payment. Keep help and the already-paid route easy to find.

## Contracts and risks

- Admin prices and durations stay authoritative. No catalog or backend change.
- Offer deep links take precedence over category links. Browser back and reload
  restore the chosen step; unknown links fall back safely.
- Travel logistics must be submitted before paid checkout. Quote-only tiers
  open the request form in one selection, never paid checkout.
- Category changes must clear stale offer/request selections.
- Focus and scroll must move to the next decision, including mobile.
- Existing shared marketing heroes remain unchanged. Booking is exempt because
  a 780px marketing hero hides the task on a phone.

## Verification

Deterministic gate tests cover URL restoration, category/offer boundaries,
rendered step contracts, and checkout errors. Playwright exercises selection,
back/edit controls, quote and travel forms, deep links, keyboard navigation,
payment request contracts and mobile overflow. Provider calls are intercepted;
no real charges or CRM submissions are made during QA. Content and usability
evals enforce the flow contract and UI checks. Browser screenshots document
before/after using the production catalog through a read-only connection.

Measure booking ease using the browser checks: type choices in the first mobile
screen, session selection in two decisions, and checkout in the viewport after
selection. Actual conversion improvement requires client usage after deploy.

## Repeatable regression workflow

```bash
bash scripts/check-booking.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 bash scripts/check-booking.sh
```

The deterministic and content gates must all pass. Before shipping, all booking
browser checks must pass at 390px, 768px and 1440px. Native form validation blocks
invalid Paystack emails; PayPal does not require that email input. Tests mock
checkout redirects, quote requests and travel submissions, so there are no real
payments or CRM writes. Confirmation tests also mock availability and writes.

## Failure promoted into a regression

Global `html { scroll-behavior: smooth }` makes `scrollIntoView({ behavior:
'auto' })` animate instead of moving immediately. A client can be left looking
at the previous step while focus has already moved. Use explicit `instant`
scrolling when transitioning this booking task, while focusing its heading with
`preventScroll`. Scroll its decision container so the back control stays visible.
The responsive browser tests assert heading and back-control positions, so this
failure is now covered by the repeatable workflow.

The review also checks that admin-edited venue details remain visible in both
session cards and payment summaries, and that leaving a pending checkout cannot
redirect a client to a session they have since changed.
