-- Function to fetch active clerks
-- This function uses SECURITY DEFINER to bypass RLS, allowing the admin dashboard 
-- to fetch all clerks with 'active' or 'approved' status.

CREATE OR REPLACE FUNCTION get_active_clerks()
RETURNS SETOF public.clerk_users
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.clerk_users
  WHERE status IN ('active', 'approved')
  ORDER BY created_at DESC;
$$;
