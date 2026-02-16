-- Allow anonymous access to support_requests (for manual Clerk login)

-- 1. Enable RLS (already done, but safe to repeat)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated view all support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Allow authenticated insert support requests" ON public.support_requests;

-- 3. Create permissive policies for both 'authenticated' and 'anon' roles
-- For SELECT: Allow everyone to read (or restrict based on user_email if possible, but simplest is open for now to fix 401)
CREATE POLICY "Allow public view support requests" 
ON public.support_requests FOR SELECT 
TO authenticated, anon 
USING (true);

-- For INSERT: Allow everyone to insert
CREATE POLICY "Allow public insert support requests" 
ON public.support_requests FOR INSERT 
TO authenticated, anon 
WITH CHECK (true);

-- 4. Grant table permissions to anon role (critical for 401/42501 when no token is present)
GRANT ALL ON public.support_requests TO anon;
GRANT ALL ON public.support_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE support_requests_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE support_requests_id_seq TO authenticated;
