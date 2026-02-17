-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.interim_orders;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON public.interim_orders;
DROP POLICY IF EXISTS "Allow public read access" ON public.interim_orders;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.interim_orders;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.interim_orders;
DROP POLICY IF EXISTS "Enable read access for public" ON public.interim_orders;


-- 2. Ensure RLS is enabled
ALTER TABLE public.interim_orders ENABLE ROW LEVEL SECURITY;

-- 3. Create a single, comprehensive policy for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON public.interim_orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Create a read-only policy for public/anon users (optional, but good for view-only)
CREATE POLICY "Enable read access for public" ON public.interim_orders
    FOR SELECT
    TO public
    USING (true);
