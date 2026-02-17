-- Allow authenticated AND anon users to read clerk profiles to see names
-- This is necessary because the app supports a manual 'clerk login' flow that might not establish a full Supabase Auth session (acting as anon).

-- Drop existing restrictive policy if it conflicts (though we are adding a broader one)
DROP POLICY IF EXISTS "Allow authenticated read all clerks" ON public.clerk_users;

CREATE POLICY "Allow read all clerks"
ON public.clerk_users
FOR SELECT
TO authenticated, anon
USING (true);
