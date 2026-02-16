/*
  Table: public.clerk_users
  Description: Stores profile and management information for clerical staff.
  Linkage: Linked to Supabase Auth via 'id' (UUID).
*/

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.clerk_users (
  -- Primary Key linked to Supabase Auth
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Mandatory Login/Identity Fields
  email TEXT NOT NULL,
  password TEXT, -- SECURITY WARNING: Supabase Auth securely handles passwords. Only store here if strictly required (e.g., temporary initial password).
  employee_id TEXT UNIQUE NOT NULL, -- Unique ID for the clerk
  
  -- Profile Fields
  full_name TEXT NOT NULL,
  phone_number TEXT,
  department TEXT,
  designation TEXT DEFAULT 'Clerk',
  avatar_url TEXT,
  
  -- Account Status & Role
  status TEXT DEFAULT 'application_submitted' CHECK (status IN ('active', 'inactive', 'suspended', 'application_submitted', 'approved')),
  role TEXT DEFAULT 'clerk', -- Useful if you have different clerk levels (e.g., 'head_clerk')
  
  -- Timestamps
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.clerk_users ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Allow clerks to view their own profile
CREATE POLICY "Clerks can view own profile"
ON public.clerk_users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow clerks to update their own profile (e.g., phone number, avatar)
CREATE POLICY "Clerks can update own profile"
ON public.clerk_users
FOR UPDATE
USING (auth.uid() = id);

-- Secure RPC Function to check application status
CREATE OR REPLACE FUNCTION public.get_application_status(email_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_status TEXT;
BEGIN
  SELECT status INTO account_status
  FROM public.clerk_users
  WHERE email = email_input;
  
  RETURN account_status;
END;
$$;

-- Policy: Allow Admins to view all (Placeholder - assumes an 'admins' table or role check)
-- CREATE POLICY "Admins can view all clerks"
-- ON public.clerk_users
-- FOR SELECT
-- USING (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE public.clerk_users ADD COLUMN password TEXT;
