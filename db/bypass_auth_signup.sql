-- 1. Remove the link to Supabase Auth (auth.users) so we can create profiles without Auth users
ALTER TABLE public.clerk_users 
DROP CONSTRAINT IF EXISTS clerk_users_id_fkey;

-- 2. Allow anonymous users to insert into the clerk_users table (for the signup form)
DROP POLICY IF EXISTS "Allow anonymous signup" ON public.clerk_users;

CREATE POLICY "Allow anonymous signup" 
ON public.clerk_users 
FOR INSERT 
TO anon
WITH CHECK (true);

-- 3. (Optional) If you haven't already, add the password column
-- ALTER TABLE public.clerk_users ADD COLUMN IF NOT EXISTS password TEXT;
