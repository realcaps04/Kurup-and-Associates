-- Add admin_response column to support_requests table for storing admin replies
ALTER TABLE public.support_requests
ADD COLUMN IF NOT EXISTS admin_response TEXT,
ADD COLUMN IF NOT EXISTS admin_responded_at TIMESTAMPTZ;

-- Ensure RLS allows updates to this column (assuming existing update policy covers it if not specific to columns)
-- If there are no specific update policies yet, let's create one for admins/authenticated users to update.
-- The existing `cases.sql` had broad update policies, let's check `support_requests.sql` again.
-- It only had SELECT and INSERT policies. We need an UDPATE policy.

CREATE POLICY "Allow authenticated update support requests" ON public.support_requests
FOR UPDATE TO authenticated USING (true);
