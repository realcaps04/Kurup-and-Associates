-- Ensure the columns exist (in case the previous migration wasn't run)
ALTER TABLE public.support_requests
ADD COLUMN IF NOT EXISTS admin_response TEXT,
ADD COLUMN IF NOT EXISTS admin_responded_at TIMESTAMPTZ;

-- Create a secure function for admins to reply to tickets
-- This function uses SECURITY DEFINER to bypass RLS policies
CREATE OR REPLACE FUNCTION admin_reply_to_ticket(
    ticket_id BIGINT,
    response_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_record JSONB;
BEGIN
    UPDATE public.support_requests
    SET 
        admin_response = response_text,
        admin_responded_at = NOW(),
        -- Optional: auto-update status to In Progress if it's currently Open
        status = CASE 
            WHEN status = 'Open' THEN 'In Progress' 
            ELSE status 
        END
    WHERE id = ticket_id
    RETURNING to_jsonb(support_requests.*) INTO updated_record;

    IF updated_record IS NULL THEN
        RAISE EXCEPTION 'Ticket not found or update failed';
    END IF;

    RETURN updated_record;
END;
$$;
