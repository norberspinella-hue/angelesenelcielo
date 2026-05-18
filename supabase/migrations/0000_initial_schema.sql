-- 1. Enums
create type plan_type as enum ('recuerdo_inicial', 'estrella_anual', 'recuerdo_eterno');
create type payment_status as enum ('draft', 'pending', 'paid', 'failed');
create type publication_status as enum ('draft', 'published', 'archived', 'expired');
create type species_type as enum ('perro', 'gato', 'conejo', 'pajaro', 'caballo', 'otro');
create type visibility_type as enum ('public', 'private');
create type slot_status as enum ('available', 'reserved_pending_payment', 'occupied', 'blocked_admin', 'sponsor_private');
create type comment_status as enum ('visible', 'pending_moderation', 'reported', 'hidden');
create type reaction_type as enum ('huellita', 'estrella', 'corazon', 'luz');
create type email_type as enum (
  'confirmation', 'draft_recovery', 'anniversary',
  'expiration_warning_30d', 'expiration_warning_7d', 'expiration_warning_0d',
  'post_expiration_conversion', 'deletion_token', 'moderation_alert'
);

-- 2. Tablas
create table memorials (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  email           text not null,
  pet_name        text not null,
  species         species_type not null,
  photo_url       text not null,
  death_date      date not null,
  dedication      text,
  story_answers   jsonb not null default '{}'::jsonb,
  generated_story text,
  plan_type       plan_type not null,
  price_paid      numeric(8,2) not null,
  currency        text not null default 'EUR',
  slots_count     int not null check (slots_count in (1, 4, 9)),
  profile_slug    text unique not null,
  visibility      visibility_type not null default 'public',
  reactions_count int not null default 0,
  comments_count  int not null default 0,
  payment_status      payment_status not null default 'draft',
  publication_status  publication_status not null default 'draft',
  expires_at      timestamptz,
  stripe_session_id        text,
  stripe_payment_intent_id text,
  deletion_token  uuid default gen_random_uuid(),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes  text,
  rights_confirmed_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table mural_slots (
  id              uuid primary key default gen_random_uuid(),
  x               int not null check (x >= 0 and x < 1000),
  y               int not null check (y >= 0 and y < 1000),
  status          slot_status not null default 'available',
  memorial_id     uuid references memorials(id) on delete set null,
  reserved_until  timestamptz,
  plan_type       plan_type,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(x, y)
);

create table memorial_comments (
  id           uuid primary key default gen_random_uuid(),
  memorial_id  uuid not null references memorials(id) on delete cascade,
  author_name  text not null,
  author_email text,
  message      text not null,
  status       comment_status not null default 'visible',
  ip_hash      text,
  created_at   timestamptz not null default now()
);

create table memorial_reactions (
  id           uuid primary key default gen_random_uuid(),
  memorial_id  uuid not null references memorials(id) on delete cascade,
  type         reaction_type not null,
  user_id      uuid references auth.users(id) on delete set null,
  ip_hash      text,
  created_at   timestamptz not null default now(),
  unique (memorial_id, type, ip_hash)
);

create table analytics_events (
  id           uuid primary key default gen_random_uuid(),
  event_name   text not null,
  memorial_id  uuid references memorials(id) on delete set null,
  metadata     jsonb,
  session_id   text,
  ip_hash      text,
  created_at   timestamptz not null default now()
);

create table email_logs (
  id           uuid primary key default gen_random_uuid(),
  memorial_id  uuid references memorials(id) on delete set null,
  to_email     text not null,
  type         email_type not null,
  resend_id    text,
  status       text not null,
  sent_at      timestamptz not null default now()
);

-- 3. Índices
create index idx_memorials_slug         on memorials(profile_slug);
create index idx_memorials_email        on memorials(email);
create index idx_memorials_pub_status   on memorials(publication_status);
create index idx_memorials_expires_at   on memorials(expires_at) where expires_at is not null;

create index idx_slots_status        on mural_slots(status);
create index idx_slots_coords        on mural_slots(x, y);
create index idx_slots_memorial      on mural_slots(memorial_id);
create index idx_slots_reserved      on mural_slots(reserved_until) where status = 'reserved_pending_payment';

create index idx_comments_memorial on memorial_comments(memorial_id);
create index idx_comments_status   on memorial_comments(status);
create index idx_reactions_memorial on memorial_reactions(memorial_id);
create index idx_events_name        on analytics_events(event_name);
create index idx_events_created     on analytics_events(created_at desc);

-- 4. RLS
alter table memorials enable row level security;
alter table mural_slots enable row level security;
alter table memorial_comments enable row level security;
alter table memorial_reactions enable row level security;

create policy "public_reads_published" on memorials for select
  using (publication_status = 'published' and visibility = 'public' and moderation_status = 'approved');
create policy "owner_reads_own" on memorials for select
  using (auth.uid() = user_id);

create policy "public_reads_slots" on mural_slots for select using (true);
create policy "public_reads_visible_comments" on memorial_comments for select using (status = 'visible');
create policy "public_reads_reactions" on memorial_reactions for select using (true);

-- 5. Funciones
create or replace function is_block_available(
  start_x int, start_y int, block_size int
) returns boolean language plpgsql stable as $$
declare occupied_count int;
begin
  if start_x < 0 or start_y < 0 or
     start_x + block_size > 1000 or
     start_y + block_size > 1000 then return false; end if;

  select count(*) into occupied_count
  from mural_slots
  where x >= start_x and x < start_x + block_size
    and y >= start_y and y < start_y + block_size
    and status != 'available';

  return occupied_count = 0;
end;
$$;

create or replace function find_nearest_available_block(
  target_x int, target_y int, block_size int, max_radius int default 50
) returns table(x int, y int) language plpgsql stable as $$
declare r int := 0; dx int; dy int;
begin
  while r <= max_radius loop
    for dx in -r..r loop
      for dy in -r..r loop
        if abs(dx) = r or abs(dy) = r then
          if is_block_available(target_x + dx, target_y + dy, block_size) then
            x := target_x + dx; y := target_y + dy;
            return next; return;
          end if;
        end if;
      end loop;
    end loop;
    r := r + 1;
  end loop;
  return;
end;
$$;
