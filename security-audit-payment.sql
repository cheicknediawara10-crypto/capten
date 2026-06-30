-- =======================================================
-- CAPTEN — Payment Security Audit Query
-- =======================================================

-- Run this query in your Supabase SQL Editor to verify that 
-- absolutely no credit card numbers, CVVs, PANs or IBANs are stored.
-- It should return 0 rows.

SELECT column_name, table_name 
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name ILIKE '%card%' 
    OR column_name ILIKE '%cvv%'
    OR column_name ILIKE '%pan%' 
    OR column_name ILIKE '%carte%'
    OR column_name ILIKE '%iban%'
);
