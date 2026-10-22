#!/usr/bin/env bash
set -e

echo "=== 1. Running Unit Tests in backend/reporting/ ==="
node --test --experimental-strip-types backend/reporting/calculate.test.ts

echo "=== 2. Running Unit Tests in src/lib/pcf/ ==="
node --test --experimental-strip-types src/lib/pcf/calculate.test.ts

echo "=== 3. Running Unit Tests in src/mocks/ (TideCloak Mock & Leak Prevention) ==="
node --test --experimental-strip-types src/mocks/fixtures.test.ts

echo "=== 4. Running TypeScript Typecheck ==="
npx tsc --noEmit

echo "=== All tests and type checks passed successfully! ==="
