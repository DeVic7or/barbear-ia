-- Add a profiles table to track first login
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_login_shown BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create trial subscription and profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, first_login_shown)
  VALUES (NEW.id, false);
  
  -- Create trial subscription (7 days free trial)
  INSERT INTO public.subscriptions (
    user_id,
    plan_name,
    plan_price,
    status,
    payment_method,
    payment_date,
    next_payment_date,
    transaction_id
  )
  VALUES (
    NEW.id,
    'Trial Gratuito',
    0,
    'active',
    'trial',
    NOW(),
    NOW() + INTERVAL '7 days',
    'TRIAL-' || NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create trial subscription when a user signs up
CREATE TRIGGER on_auth_user_created_trial
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_trial();

-- Create index for performance
CREATE INDEX idx_profiles_id ON public.profiles(id);