-- Add new enum values for gerente and barbeiro
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gerente';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'barbeiro';