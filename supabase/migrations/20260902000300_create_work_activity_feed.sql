-- Aviso de que alguém mexeu numa ficha da organização.
--
-- Numa equipe, quem chega na obra precisa saber que o código da porta mudou
-- ontem à noite. O aviso nasce no banco, não no app: assim vale para qualquer
-- caminho que altere a ficha, hoje e amanhã.

create table public.work_activity (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  -- A ficha pode ser apagada depois; o aviso continua fazendo sentido.
  work_id uuid references public.works (id) on delete set null,
  actor_id uuid not null references auth.users (id) on delete cascade,
  -- Cópias do nome e do endereço no momento do aviso: apelido muda, ficha some,
  -- e mesmo assim a linha continua legível.
  actor_name text not null default '',
  work_street text not null default '',
  kind text not null check (kind in ('created', 'updated', 'completed', 'reopened')),
  created_at timestamptz not null default now()
);

create index work_activity_company_idx
  on public.work_activity (company_id, created_at desc);

alter table public.work_activity enable row level security;

-- Só leitura, e só de quem participa da organização. Ninguém escreve à mão:
-- quem grava é o gatilho, que roda como dono da função.
create policy work_activity_select on public.work_activity
  for select to authenticated using (private.is_company_member(company_id));

-- Até onde cada pessoa já viu. Uma marca por pessoa é o bastante para saber o
-- que é novo, e não cria uma linha por aviso por pessoa.
create table public.activity_reads (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

alter table public.activity_reads enable row level security;

create policy activity_reads_select on public.activity_reads
  for select to authenticated using (user_id = (select auth.uid()));
create policy activity_reads_insert on public.activity_reads
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy activity_reads_update on public.activity_reads
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.record_work_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_kind text;
  v_nome text;
begin
  -- Ficha privada não tem para quem avisar.
  if new.company_id is null then
    return new;
  end if;
  -- Migração ou script: sem pessoa por trás, sem aviso.
  if v_actor is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    v_kind := 'created';
  elsif new.status is distinct from old.status then
    v_kind := case when new.status = 'completed' then 'completed' else 'reopened' end;
  elsif new.position is distinct from old.position then
    -- Reordenar a lista não é notícia para ninguém.
    return new;
  else
    v_kind := 'updated';
  end if;

  -- Mexeu de novo na mesma ficha logo em seguida? É a mesma edição continuando.
  update public.work_activity
  set created_at = now(), work_street = new.street
  where work_id = new.id
    and actor_id = v_actor
    and kind = v_kind
    and created_at > now() - interval '10 minutes';
  if found then
    return new;
  end if;

  select p.nickname into v_nome
  from public.profiles p
  where p.user_id = v_actor;

  insert into public.work_activity
    (company_id, work_id, actor_id, actor_name, work_street, kind)
  values
    (new.company_id, new.id, v_actor, coalesce(v_nome, ''), new.street, v_kind);

  return new;
end;
$$;

create trigger record_activity_after_work_change
after insert or update on public.works
for each row execute function public.record_work_activity();

revoke execute on function public.record_work_activity() from public, anon, authenticated;
