-- O app salva a ficha inteira de uma vez. Esta função faz isso em uma única
-- transação, para a obra nunca ficar salva sem as tarefas ou com metade das fotos.
-- security invoker: o RLS continua valendo dentro da função.

create or replace function public.save_work(payload jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_work_id uuid := (payload ->> 'id')::uuid;
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado para salvar uma obra.';
  end if;

  insert into public.works (
    id, user_id, street, city, zip, code, service, description, observations,
    water_available, power_available, start_date, status, completed_at
  )
  values (
    v_work_id,
    v_user_id,
    payload ->> 'street',
    payload ->> 'city',
    coalesce(payload ->> 'zip', ''),
    coalesce(payload ->> 'code', ''),
    payload ->> 'service',
    coalesce(payload ->> 'description', ''),
    coalesce(payload ->> 'observations', ''),
    coalesce((payload ->> 'water_available')::boolean, true),
    coalesce((payload ->> 'power_available')::boolean, true),
    (payload ->> 'start_date')::date,
    coalesce(payload ->> 'status', 'active'),
    nullif(payload ->> 'completed_at', '')::date
  )
  on conflict (id) do update set
    street           = excluded.street,
    city             = excluded.city,
    zip              = excluded.zip,
    code             = excluded.code,
    service          = excluded.service,
    description      = excluded.description,
    observations     = excluded.observations,
    water_available  = excluded.water_available,
    power_available  = excluded.power_available,
    start_date       = excluded.start_date,
    status           = excluded.status,
    completed_at     = excluded.completed_at;

  -- Substitui as listas filhas: o app sempre envia o estado completo da ficha.
  delete from public.work_tasks   where work_tasks.work_id   = v_work_id;
  delete from public.work_updates where work_updates.work_id = v_work_id;
  delete from public.work_history where work_history.work_id = v_work_id;
  delete from public.work_photos  where work_photos.work_id  = v_work_id;

  insert into public.work_tasks (id, work_id, user_id, label, done, position)
  select item.id, v_work_id, v_user_id, item.label, item.done, item.position
  from jsonb_to_recordset(coalesce(payload -> 'tasks', '[]'::jsonb))
    as item(id uuid, label text, done boolean, position integer);

  insert into public.work_updates (id, work_id, user_id, entry_date, text)
  select item.id, v_work_id, v_user_id, item.entry_date, item.text
  from jsonb_to_recordset(coalesce(payload -> 'updates', '[]'::jsonb))
    as item(id uuid, entry_date date, text text);

  insert into public.work_history (id, work_id, user_id, entry_date, title)
  select item.id, v_work_id, v_user_id, item.entry_date, item.title
  from jsonb_to_recordset(coalesce(payload -> 'history', '[]'::jsonb))
    as item(id uuid, entry_date date, title text);

  insert into public.work_photos (id, work_id, user_id, storage_path, position)
  select item.id, v_work_id, v_user_id, item.storage_path, item.position
  from jsonb_to_recordset(coalesce(payload -> 'photos', '[]'::jsonb))
    as item(id uuid, storage_path text, position integer);
end;
$$;
