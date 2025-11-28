-- Add payment_method column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN payment_method TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.appointments.payment_method IS 'Payment method used: pix, credit_card, etc.';