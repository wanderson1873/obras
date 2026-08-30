-- Fichas de obra. Cada linha pertence a um usuário; o RLS garante que ninguém
-- leia ou escreva as obras de outra pessoa. As tabelas filhas repetem user_id
-- para que a política seja uma comparação direta, sem subconsulta por linha.

create table public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  street text not null,
  city text not null,
  zip text not null default '',
  code text not null default '',
  service text not null,
  description text not null default '',
  observations text not null default '',
  water_available boolean not null default true,
  power_available boolean not null default true,
  start_date date not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completed_at_matches_status check (
    (status = 'completed') or (completed_at is null)
  )
);

create table public.work_tasks (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.work_updates (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table public.work_history (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  title text not null
);

-- Fotos ficam no Storage; aqui guardamos só o caminho e a ordem.
-- A posição 0 é a capa da ficha.
create table public.work_photos (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index works_user_status_idx on public.works (user_id, status, start_date desc);
create index work_tasks_work_idx on public.work_tasks (work_id, position);
create index work_updates_work_idx on public.work_updates (work_id, entry_date desc);
create index work_history_work_idx on public.work_history (work_id, entry_date desc);
create index work_photos_work_idx on public.work_photos (work_id, position);

-- updated_at serve para a sincronização saber o que mudou.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger works_touch_updated_at
before update on public.works
for each row execute function public.touch_updated_at();

alter table public.works enable row level security;
alter table public.work_tasks enable row level security;
alter table public.work_updates enable row level security;
alter table public.work_history enable row level security;
alter table public.work_photos enable row level security;

create policy works_select on public.works
  for select to authenticated using ((select auth.uid()) = user_id);
create policy works_insert on public.works
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy works_update on public.works
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy works_delete on public.works
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy work_tasks_select on public.work_tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy work_tasks_insert on public.work_tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy work_tasks_update on public.work_tasks
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy work_tasks_delete on public.work_tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy work_updates_select on public.work_updates
  for select to authenticated using ((select auth.uid()) = user_id);
create policy work_updates_insert on public.work_updates
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy work_updates_update on public.work_updates
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy work_updates_delete on public.work_updates
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy work_history_select on public.work_history
  for select to authenticated using ((select auth.uid()) = user_id);
create policy work_history_insert on public.work_history
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy work_history_update on public.work_history
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy work_history_delete on public.work_history
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy work_photos_select on public.work_photos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy work_photos_insert on public.work_photos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy work_photos_update on public.work_photos
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy work_photos_delete on public.work_photos
  for delete to authenticated using ((select auth.uid()) = user_id);
