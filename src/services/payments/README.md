# Payments service

Owns server-side payment initialization contracts. Card and mobile-money details remain on provider-hosted checkout pages and never pass through this application.

All priced site offerings support first-party Paystack checkout using the server-only `PAYSTACK_SECRET_KEY`: donations, coaching, books, teachings, courses, and one-month Journal memberships. The browser receives only Paystack's hosted authorization URL. Prices and product metadata are derived on the server, never accepted from the browser.

Successful charges are verified in two independent paths:

- Return-page verification calls Paystack's transaction API before granting the buyer access or pre-filling a booking.
- `/api/payments/webhook` verifies Paystack's HMAC-SHA512 signature and provides asynchronous fulfillment for donations, coaching, books, teachings, and Journal memberships.

Payment records use provider/reference uniqueness so retries and duplicate webhooks do not grant the same payment twice. Course access is verified and granted on its authenticated return page, matching its PayPal flow.

PayPal uses server-side order creation and capture when its credentials are configured. M-Pesa Paybill payments are manual and require the buyer to submit the confirmation code for reconciliation.
