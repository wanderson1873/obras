-- Tarefas, atualizações, histórico e fotos passam a seguir a visibilidade da
-- obra, e não mais o dono da linha.
--
-- security invoker de propósito: por dentro, o RLS de `works` já responde
-- "esta obra é visível para mim?". Não há recursão porque as políticas de
-- works consultam work_viewers e company_members, nunca as tabelas filhas.
create or replace function private.can_view_work(p_work_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.works w where w.id = p_work_id);
$$;

grant execute on function private.can_view_work(uuid) to authenticated;

-- "Editar tudo": quem enxerga a obra também mexe nas listas dela.
create policy work_tasks_shared_all on public.work_tasks
  for all to authenticated
  using (private.can_view_work(work_id))
  with check (private.can_view_work(work_id));

create policy work_updates_shared_all on public.work_updates
  for all to authenticated
  using (private.can_view_work(work_id))
  with check (private.can_view_work(work_id));

create policy work_history_shared_all on public.work_history
  for all to authenticated
  using (private.can_view_work(work_id))
  with check (private.can_view_work(work_id));

create policy work_photos_shared_all on public.work_photos
  for all to authenticated
  using (private.can_view_work(work_id))
  with check (private.can_view_work(work_id));

-- Storage: o caminho é {user_id}/{work_id}/{photo_id}.jpg. Quem recebeu a obra
-- precisa ler arquivos que estão na pasta de outra pessoa, e quem criou precisa
-- ler a foto que o colega tirou. As duas coisas caem nesta política: a segunda
-- pasta do caminho é a obra, e a obra tem de ser visível.
create policy work_photos_storage_shared_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'work-photos'
    and array_length(storage.foldername(name), 1) >= 2
    -- Regex antes do cast: caminho fora do padrão não pode derrubar a consulta.
    and (storage.foldername(name))[2] ~
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and private.can_view_work(((storage.foldername(name))[2])::uuid)
  );

create policy work_photos_storage_shared_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'work-photos'
    and array_length(storage.foldername(name), 1) >= 2
    and (storage.foldername(name))[2] ~
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and private.can_view_work(((storage.foldername(name))[2])::uuid)
  );
