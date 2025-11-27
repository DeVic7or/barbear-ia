-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aguardando',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointment_services table (additional services)
CREATE TABLE public.appointment_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointment_products table
CREATE TABLE public.appointment_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services (public read access)
CREATE POLICY "Public can view services"
ON public.services FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert services"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
ON public.services FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete services"
ON public.services FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for products (public read access)
CREATE POLICY "Public can view products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for appointments (public access for now)
CREATE POLICY "Public can view appointments"
ON public.appointments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete appointments"
ON public.appointments FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for appointment_services
CREATE POLICY "Public can view appointment_services"
ON public.appointment_services FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert appointment_services"
ON public.appointment_services FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete appointment_services"
ON public.appointment_services FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for appointment_products
CREATE POLICY "Public can view appointment_products"
ON public.appointment_products FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert appointment_products"
ON public.appointment_products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete appointment_products"
ON public.appointment_products FOR DELETE
TO authenticated
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial services data
INSERT INTO public.services (name, description, price, duration_minutes) VALUES
  ('Corte', 'Corte de cabelo masculino', 35, 30),
  ('Barba', 'Barba completa', 25, 20),
  ('Corte + Barba', 'Pacote completo', 50, 45),
  ('Degradê', 'Corte degradê', 40, 35),
  ('Corte Feminino', 'Corte feminino', 45, 40),
  ('Pigmentação', 'Pigmentação de barba', 30, 25);

-- Insert initial products data
INSERT INTO public.products (name, description, price, stock_quantity, category) VALUES
  ('Pomada', 'Pomada modeladora', 25, 50, 'Finalizadores'),
  ('Shampoo', 'Shampoo para barba', 30, 40, 'Higiene'),
  ('Cera', 'Cera modeladora', 20, 35, 'Finalizadores'),
  ('Gel', 'Gel fixador', 15, 60, 'Finalizadores'),
  ('Óleo para Barba', 'Óleo hidratante', 35, 25, 'Tratamento'),
  ('Balm', 'Balm pós-barba', 28, 30, 'Tratamento');