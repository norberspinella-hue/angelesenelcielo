-- Create storage bucket 'pet-photos' if not exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-photos',
  'pet-photos',
  true,
  5242880, -- 5MB
  '{image/*}'
)
on conflict (id) do nothing;

-- Enable RLS and setup policies for public access on storage.objects
create policy "Allow public upload to pet-photos"
on storage.objects for insert
to public
with check (bucket_id = 'pet-photos');

create policy "Allow public read from pet-photos"
on storage.objects for select
to public
using (bucket_id = 'pet-photos');
