-- 1. Reset: Drop existing objects to ensure clean state
DROP TABLE IF EXISTS public.admins CASCADE;
DROP FUNCTION IF EXISTS public.admin_login;
DROP FUNCTION IF EXISTS public.get_pending_requests;
DROP FUNCTION IF EXISTS public.update_clerk_status;
DROP FUNCTION IF EXISTS public.is_admin;

-- 2. Create Admins table with password column
CREATE TABLE public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- Plain text for this demo (hash in production!)
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read for login check (RPC handles logic, but this avoids RLS blocking the check if not using security definer properly)
-- Ideally, we'd lock this down and ONLY use the RPC.
CREATE POLICY "Allow public read for login" ON public.admins FOR SELECT USING (true);


-- 4. RPC: Admin Login
CREATE OR REPLACE FUNCTION public.admin_login(email_input TEXT, password_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE email = email_input AND password = password_input
  );
END;
$$;

-- 5. RPC: Get Pending Requests (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_pending_requests()
RETURNS SETOF public.clerk_users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM public.clerk_users 
  WHERE status = 'application_submitted' 
  ORDER BY created_at DESC;
END;
$$;

-- 6. RPC: Update Clerk Status (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_clerk_status(user_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.clerk_users 
  SET status = new_status 
  WHERE id = user_id;
END;
$$;

-- 7. Seed Initial Admin (Uncommented for immediate use)
INSERT INTO public.admins (email, password, full_name) VALUES ('admin@gmail.com', 'admink345', 'System Admin');
