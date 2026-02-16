-- Function to fetch all support tickets for the Admin Dashboard
-- Uses SECURITY DEFINER to bypass RLS restrictions

CREATE OR REPLACE FUNCTION get_all_support_tickets()
RETURNS SETOF public.support_requests
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.support_requests
  ORDER BY created_at DESC;
$$;
