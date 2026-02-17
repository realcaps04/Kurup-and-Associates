-- 1. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.interim_orders;
DROP POLICY IF EXISTS "Enable read access for public" ON public.interim_orders;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.interim_orders;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.interim_orders;
DROP POLICY IF EXISTS "Allow public read access" ON public.interim_orders;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.interim_orders;

-- 2. Enable RLS (Status Quo)
ALTER TABLE public.interim_orders ENABLE ROW LEVEL SECURITY;

-- 3. CRITICAL FIX: Allow PUBLIC (anon) access for ALL operations
-- This is required because your Clerk login uses localStorage and NOT Supabase Auth,
-- so Supabase sees these users as 'anon'.
CREATE POLICY "Allow public full access" ON public.interim_orders
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
