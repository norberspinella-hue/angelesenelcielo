-- Creación de la tabla de certificados para Ángeles en el Cielo

create table if not exists certificates (
  id uuid default gen_random_uuid() primary key,
  order_id text not null unique,          -- "AEC-F0001", "AEC-000126"
  user_email text not null,
  pet_name text not null,
  plan text not null,                     -- 'fundador' | 'eterno' | 'estrella' | 'inicial'
  founder_number integer,                 -- solo para plan fundador
  slot_code text,                         -- código del espacio en el mural
  pet_photo_url text not null,            -- URL foto en Supabase Storage
  profile_url text,                       -- URL perfil público /angeles-en-el-cielo/[slug]
  upload_token text not null unique,      -- token único para link de subida
  status text default 'pending',          -- 'pending' | 'uploaded' | 'delivered'
  certificate_pdf_url text,               -- URL PDF final en Supabase Storage
  certificate_png_url text,               -- URL PNG final en Supabase Storage
  created_at timestamptz default now(),
  uploaded_at timestamptz,
  delivered_at timestamptz
);

-- Habilitar RLS (Row Level Security)
alter table certificates enable row level security;

-- Al no crear políticas select/insert/update para public, por defecto solo el service_role (backend) puede operar la tabla.
