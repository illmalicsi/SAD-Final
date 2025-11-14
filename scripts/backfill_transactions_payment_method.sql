-- Backfill transactions.payment_method from description/notes
-- Run this on a backup or read-only replica first. Make a DB backup before running.

-- Approach: Use pattern matching on description and common keywords.
-- This updates only rows where payment_method IS NULL and a reasonable inference can be made.

-- Example keywords covered: gcash, g-cash, credit, debit, visa, mastercard, amex, bank, transfer, bank_transfer, paypal, cash

START TRANSACTION;

-- 1) GCash
UPDATE transactions
SET payment_method = 'gcash'
WHERE payment_method IS NULL
  AND (LOWER(description) LIKE '%gcash%'
       OR LOWER(description) LIKE '%g-cash%'
       OR LOWER(description) LIKE '%g cash%'
       OR LOWER(description) LIKE '%payment via gcash%'
       OR LOWER(description) LIKE '%via gcash%');

-- 2) Bank transfer / bank_transfer
UPDATE transactions
SET payment_method = 'bank_transfer'
WHERE payment_method IS NULL
  AND (LOWER(description) LIKE '%bank transfer%'
       OR LOWER(description) LIKE '%bank_transfer%'
       OR LOWER(description) LIKE '%bank transfer%'
       OR LOWER(description) LIKE '%banked%'
       OR LOWER(description) LIKE '%bdo%'
       OR LOWER(description) LIKE '%bank%');

-- 3) Card / credit / debit
UPDATE transactions
SET payment_method = 'card'
WHERE payment_method IS NULL
  AND (LOWER(description) LIKE '%credit%'
       OR LOWER(description) LIKE '%debit%'
       OR LOWER(description) LIKE '%visa%'
       OR LOWER(description) LIKE '%mastercard%'
       OR LOWER(description) LIKE '%amex%'
       OR LOWER(description) LIKE '%card%'
       OR LOWER(description) LIKE '%charged%');

-- 4) Paypal / online
UPDATE transactions
SET payment_method = 'online'
WHERE payment_method IS NULL
  AND (LOWER(description) LIKE '%paypal%'
       OR LOWER(description) LIKE '%stripe%'
       OR LOWER(description) LIKE '%online payment%'
       OR LOWER(description) LIKE '%gcash%paypal%');

-- 5) Default to cash only where description contains 'cash' or keywords like 'paid in cash'
UPDATE transactions
SET payment_method = 'cash'
WHERE payment_method IS NULL
  AND (LOWER(description) LIKE '%cash%'
       OR LOWER(description) LIKE '%paid in cash%'
       OR LOWER(description) LIKE '%payment received: cash%');

-- 6) No-change rows left with NULL payment_method will remain NULL for manual review.

COMMIT;

-- After running: verify with
-- SELECT payment_method, COUNT(*) FROM transactions GROUP BY payment_method;

-- If you prefer we can run a more conservative pass that only sets payment_method when an unambiguous token is found.
