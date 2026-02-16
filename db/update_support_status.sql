-- Function to update the status of a support ticket
-- Uses SECURITY DEFINER to bypass RLS for admins

CREATE OR REPLACE FUNCTION update_support_status(ticket_id BIGINT, new_status TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.support_requests
  SET status = new_status,
      updated_at = NOW()
  WHERE id = ticket_id;
END;
$$;
