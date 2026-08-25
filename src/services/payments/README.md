# Payments service

Owns server-side payment initialization contracts. Card and mobile-money details remain on provider-hosted checkout pages and never pass through this application.

`initializePaystackDonation` creates a KES Paystack transaction using the server-only `PAYSTACK_SECRET_KEY`. Successful charges continue through the existing verified webhook at `/api/payments/webhook`.

PayPal currently uses the confirmed recipient email as an instruction because a PayPal Business payment link or API credentials have not been supplied. M-Pesa Paybill payments are manual and require the donor to retain the confirmation message for reconciliation.
