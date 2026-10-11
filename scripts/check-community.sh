#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npx jest tests/community-page.test.tsx --runInBand --moduleNameMapper='{"^@/(.*)$":"<rootDir>/src/$1"}'
node tests/evals/community-classic.eval.js
node tests/evals/halisi-hub-connect-content.eval.js
node tests/evals/page-hero-uniformity.eval.js
