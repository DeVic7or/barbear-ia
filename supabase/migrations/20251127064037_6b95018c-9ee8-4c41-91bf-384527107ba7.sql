-- Create user availability table
CREATE TABLE public.user_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

-- Users can view their own availability
CREATE POLICY "Users can view their own availability"
ON public.user_availability
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own availability
CREATE POLICY "Users can insert their own availability"
ON public.user_availability
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own availability
CREATE POLICY "Users can update their own availability"
ON public.user_availability
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own availability
CREATE POLICY "Users can delete their own availability"
ON public.user_availability
FOR DELETE
USING (auth.uid() = user_id);

-- Public can view all availabilities (for booking purposes)
CREATE POLICY "Public can view all availabilities"
ON public.user_availability
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_user_availability_updated_at
BEFORE UPDATE ON public.user_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.user_availability REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_availability;