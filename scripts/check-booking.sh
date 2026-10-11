#!/usr/bin/env bash
# Repeatable booking regression gate. Browser tests intercept all write requests.
set -euo pipefail
cd "$(dirname "$0")/.."
npx jest src/components/payments/CoachingCategoryPicker src/components/payments/CoachingCheckoutForm tests/regressions/booking-confirmation.test.js tests/regressions/booking-availability.test.js --runInBand
for evaluation in \
  tests/evals/book-now-content.eval.js \
  tests/evals/book-now-senior-usability.eval.js \
  tests/evals/coaching-catalog.eval.js \
  tests/evals/coaching-payments.eval.js \
  tests/evals/booking-integrity.eval.js \
  src/components/payments/CoachingCheckoutForm/checkout.eval.cjs; do
  node "$evaluation"
done
if [[ -n "${PLAYWRIGHT_BASE_URL:-}" ]]; then
  npx playwright test tests/e2e/book-now.spec.js tests/e2e/book-now-senior-usability.spec.js tests/e2e/booking-confirmation-regression.spec.js --workers=1
else
  printf '%s\n' 'Browser checks: run with PLAYWRIGHT_BASE_URL pointing to a running app with its catalog available.'
fi
