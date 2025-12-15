-- Create agent_settings table
CREATE TABLE public.agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  instance_id TEXT,
  instance_name TEXT,
  qr_code TEXT,
  connection_status TEXT DEFAULT 'disconnected',
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own agent settings"
ON public.agent_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent settings"
ON public.agent_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent settings"
ON public.agent_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent settings"
ON public.agent_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_agent_settings_updated_at
BEFORE UPDATE ON public.agent_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();