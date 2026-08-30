-- Bucket privado das fotos de fachada. O caminho é sempre
-- {user_id}/{work_id}/{photo_id}.jpg, e a política confere a primeira pasta.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work-photos',
  'work-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy work_photos_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'work-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy work_photos_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'work-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy work_photos_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'work-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'work-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy work_photos_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'work-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
