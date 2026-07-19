-- Migración para añadir breed, birth_date y location a memorials
ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS breed TEXT DEFAULT '';

ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE public.memorials 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
