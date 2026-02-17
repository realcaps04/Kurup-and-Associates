-- Allow delete access to support_requests

-- Enable RLS (already done, but safe to repeat)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for DELETE for both 'authenticated' and 'anon' roles
-- matching the existing SELECT/INSERT policies
CREATE POLICY "Allow public delete support requests" 
ON public.support_requests FOR DELETE 
TO authenticated, anon 
USING (true);

-- Ensure permissions are granted
GRANT DELETE ON public.support_requests TO anon;
GRANT DELETE ON public.support_requests TO authenticated;
