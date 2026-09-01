-- Apelido: o nome curto pelo qual uma pessoa é encontrada e convidada.
-- Substitui o e-mail como identificador entre colegas — ninguém precisa saber
-- o e-mail do outro para trabalhar junto.

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Começa com letra, aceita letras, números, ponto e sublinhado.
  constraint nickname_formato check (nickname ~ '^[a-zA-Z][a-zA-Z0-9._]{2,19}$')
);

-- Único sem diferenciar maiúsculas: "Dhiego" e "dhiego" são a mesma pessoa.
create unique index profiles_nickname_unico on public.profiles (lower(nickname));

-- Quem já tem conta ganha apelido a partir do e-mail, higienizado para caber
-- na regra. Colisão ganha sufixo numérico.
insert into public.profiles (user_id, nickname)
select
  u.id,
  case
    when exists (
      select 1 from public.profiles p
      where lower(p.nickname) = lower(base.apelido)
    )
    then base.apelido || substr(replace(u.id::text, '-', ''), 1, 4)
    else base.apelido
  end
from auth.users u
cross join lateral (
  select
    coalesce(
      nullif(
        regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9._]', '', 'g'),
        ''
      ),
      'user'
    ) as apelido
) base
on conflict (user_id) do nothing;

-- Apelido que não começa com letra ou ficou curto demais recebe um prefixo.
update public.profiles
set nickname = 'user' || substr(replace(user_id::text, '-', ''), 1, 6)
where nickname !~ '^[a-zA-Z][a-zA-Z0-9._]{2,19}$';

alter table public.profiles enable row level security;

-- Enxerga o próprio perfil e o de quem divide alguma organização com você.
-- Não existe listagem geral: quem não é colega não descobre apelido nenhum.
create or replace function private.shares_company_with(p_other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members meu
    join public.company_members outro on outro.company_id = meu.company_id
    where meu.user_id = (select auth.uid())
      and outro.user_id = p_other
  );
$$;

grant execute on function private.shares_company_with(uuid) to authenticated;

create policy profiles_select on public.profiles
  for select to authenticated
  using (user_id = (select auth.uid()) or private.shares_company_with(user_id));

create policy profiles_insert on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy profiles_update on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Todo mundo que cria conta ganha um perfil, para nunca existir pessoa sem apelido.
create or replace function public.create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_apelido text;
begin
  v_base := coalesce(
    nullif(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9._]', '', 'g'), ''),
    'user'
  );
  if v_base !~ '^[a-zA-Z]' then
    v_base := 'user' || v_base;
  end if;
  v_base := substr(v_base, 1, 14);
  if length(v_base) < 3 then
    v_base := v_base || 'obra';
  end if;

  v_apelido := v_base;
  if exists (select 1 from public.profiles p where lower(p.nickname) = lower(v_apelido)) then
    v_apelido := v_base || substr(replace(new.id::text, '-', ''), 1, 5);
  end if;

  insert into public.profiles (user_id, nickname)
  values (new.id, v_apelido)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute function public.create_profile_on_signup();
