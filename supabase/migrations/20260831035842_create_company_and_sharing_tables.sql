-- Empresa, membros e convites.
--
-- Modelo: toda obra é privada de quem criou. Quem criou escolhe compartilhar
-- com pessoas específicas ou com a empresa inteira. Não existe "vê tudo":
-- ser administrador serve apenas para gerenciar quem entra na empresa.

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  -- Nome curto para aparecer na lista de com quem compartilhar.
  display_name text not null default '',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (company_id, email)
);

create index company_members_user_idx on public.company_members (user_id);
create index company_invites_email_idx on public.company_invites (lower(email)) where accepted_at is null;

-- Compartilhamento das obras.
alter table public.works
  add column company_id uuid references public.companies (id) on delete set null,
  add column share_scope text not null default 'private'
    check (share_scope in ('private', 'selected', 'company'));

-- Quem enxerga a obra quando o escopo é "selected".
-- owner_id repete o criador para a política não precisar consultar works,
-- o que criaria recursão entre as duas tabelas.
create table public.work_viewers (
  work_id uuid not null references public.works (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (work_id, user_id)
);

create index work_viewers_user_idx on public.work_viewers (user_id);

-- Funções auxiliares usadas dentro das políticas.
--
-- Ficam num schema próprio, fora do `public`, para não virarem endpoint em
-- /rest/v1/rpc. Precisam ser security definer: consultar company_members de
-- dentro da política da própria company_members causaria recursão infinita.
create schema if not exists private;

create or replace function private.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = p_company_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_company_admin(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = p_company_id
      and m.user_id = (select auth.uid())
      and m.role = 'admin'
  );
$$;

revoke all on schema private from anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_company_member(uuid) to authenticated;
grant execute on function private.is_company_admin(uuid) to authenticated;
