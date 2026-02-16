-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated view all cases" ON public.cases;
DROP POLICY IF EXISTS "Allow authenticated insert cases" ON public.cases;
DROP POLICY IF EXISTS "Allow authenticated update cases" ON public.cases;
DROP POLICY IF EXISTS "Allow authenticated delete cases" ON public.cases;

-- Create new public policies (allowing anon access since Auth is custom)
CREATE POLICY "Allow public view all cases" ON public.cases
FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert cases" ON public.cases
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update cases" ON public.cases
FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public delete cases" ON public.cases
FOR DELETE TO public USING (true);
