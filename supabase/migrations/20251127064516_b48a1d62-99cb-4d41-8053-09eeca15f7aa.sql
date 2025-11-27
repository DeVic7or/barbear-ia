-- Create user breaks/intervals table
CREATE TABLE public.user_breaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_availability_id UUID NOT NULL REFERENCES public.user_availability(id) ON DELETE CASCADE,
  break_start_time TIME NOT NULL,
  break_end_time TIME NOT NULL,
  break_name TEXT NOT NULL DEFAULT 'Intervalo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_breaks ENABLE ROW LEVEL SECURITY;

-- Users can manage their own breaks
CREATE POLICY "Users can view their own breaks"
ON public.user_breaks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_availability
    WHERE user_availability.id = user_breaks.user_availability_id
    AND user_availability.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own breaks"
ON public.user_breaks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_availability
    WHERE user_availability.id = user_breaks.user_availability_id
    AND user_availability.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own breaks"
ON public.user_breaks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_availability
    WHERE user_availability.id = user_breaks.user_availability_id
    AND user_availability.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own breaks"
ON public.user_breaks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_availability
    WHERE user_availability.id = user_breaks.user_availability_id
    AND user_availability.user_id = auth.uid()
  )
);

-- Public can view all breaks (for booking validation)
CREATE POLICY "Public can view all breaks"
ON public.user_breaks
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_user_breaks_updated_at
BEFORE UPDATE ON public.user_breaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.user_breaks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_breaks;