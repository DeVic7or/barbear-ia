-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view barbers" ON public.barbers;
DROP POLICY IF EXISTS "Authenticated users can insert barbers" ON public.barbers;
DROP POLICY IF EXISTS "Authenticated users can update barbers" ON public.barbers;
DROP POLICY IF EXISTS "Authenticated users can delete barbers" ON public.barbers;

-- Create new policies that allow public access for now
CREATE POLICY "Public can view barbers" 
ON public.barbers 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert barbers" 
ON public.barbers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update barbers" 
ON public.barbers 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete barbers" 
ON public.barbers 
FOR DELETE 
USING (true);