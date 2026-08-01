-- Migración para añadir slot_assigned a memorials
ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS slot_assigned TEXT DEFAULT '';
