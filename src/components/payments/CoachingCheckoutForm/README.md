# Coaching checkout

The booking wizard passes the live catalog offer name and KES/USD prices. Paystack uses a native email form; invalid email prevents submission. PayPal is outside that form and requires no email entry. Buttons show totals and disable during processing. Successful checkout redirects to the provider; payment verification and session scheduling remain on the existing confirmation route.

`checkout.ts` preserves the two API payload contracts and rejects network failures, invalid JSON, error responses, missing URLs, and non-HTTPS destinations. The UI clears processing in `finally` and exposes retry and contact help. Provider URLs are accepted from the first-party server response, not visitor input.

Gate: `npx jest src/components/payments/CoachingCheckoutForm/checkout.test.ts --runInBand`.

Browser eval: invalid Paystack email must issue no request; PayPal works with a blank receipt input; malformed checkout response shows an alert and re-enables both buttons; prices match the selected offer; payment instructions clearly place scheduling after payment.

Static eval: `node src/components/payments/CoachingCheckoutForm/checkout.eval.cjs`.
