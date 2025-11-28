-- Add appointment_type column to appointments table
ALTER TABLE appointments 
ADD COLUMN appointment_type TEXT NOT NULL DEFAULT 'Virtual' 
CHECK (appointment_type IN ('Presencial', 'Virtual'));