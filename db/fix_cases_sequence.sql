-- Fix for 409 Conflict Error (Duplicate Key Violation)
-- This error happens when rows were manually inserted with hardcoded IDs (e.g., from a seed file),
-- but the auto-increment sequence was not updated to reflect the new maximum ID.
-- Run this script in the Supabase SQL Editor to sync the sequence.

SELECT setval(
    pg_get_serial_sequence('public.cases', 'id'), 
    COALESCE((SELECT MAX(id) FROM public.cases) + 1, 1), 
    false
);
