#!/usr/bin/env bash
set -e

echo "=== 1. Running Unit Tests in backend/reporting/ (Member 2) ==="
node --test --experimental-strip-types backend/reporting/calculate.test.ts

echo "=== 2. Running Unit Tests in src/lib/pcf/ (Member 2) ==="
node --test --experimental-strip-types src/lib/pcf/calculate.test.ts

echo "=== 3. Running Unit Tests in src/mocks/ (TideCloak Mock & Leak Prevention - Member 3) ==="
node --test --experimental-strip-types src/mocks/fixtures.test.ts

echo "=== 4. Running Unit Tests for Buyer Workspace (Member 4) ==="
node --import tsx --test src/components/Buyer/BuyerWorkspace.test.cjs

echo "=== 5. Running Backend & Tide Integration Tests (Member 1) ==="
node --import tsx --test tests/*.test.ts

echo "=== 6. Running TypeScript Typecheck (Whole Project) ==="
npx tsc --noEmit

echo "=== ALL 49+ TESTS AND TYPECHECKS PASSED ACROSS MEMBERS 1, 2, 3, 4! ==="
