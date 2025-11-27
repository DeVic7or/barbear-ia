-- Create barbers table
CREATE TABLE public.barbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read barbers
CREATE POLICY "Anyone can view barbers" 
ON public.barbers 
FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert barbers
CREATE POLICY "Authenticated users can insert barbers" 
ON public.barbers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update barbers
CREATE POLICY "Authenticated users can update barbers" 
ON public.barbers 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy to allow authenticated users to delete barbers
CREATE POLICY "Authenticated users can delete barbers" 
ON public.barbers 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_barbers_updated_at
BEFORE UPDATE ON public.barbers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();