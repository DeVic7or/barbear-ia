-- Create clients table
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  birthday date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view clients"
  ON public.clients
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON public.clients
  FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete clients"
  ON public.clients
  FOR DELETE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add client_id to appointments table
ALTER TABLE public.appointments
  ADD COLUMN client_id uuid REFERENCES public.clients(id);

-- Create index for better performance
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);