-- Add is_active column to barbers table
ALTER TABLE public.barbers 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;