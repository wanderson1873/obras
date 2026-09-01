-- Convite por link: um endereço que se manda pelo WhatsApp. Quem abre entra
-- na organização; quem ainda não tem conta cria uma e entra em seguida.
--
-- Vale 7 dias e pode ser revogado. Link que dá acesso a códigos de porta não
-- pode ficar valendo para sempre.

create table public.company_invite_links (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  token text not null unique,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index company_invite_links_company_idx on public.company_invite_links (company_id);

alter table public.company_invite_links enable row level security;

-- Só administrador da organização enxerga e mexe nos links dela.
create policy invite_links_select on public.company_invite_links
  for select to authenticated using (private.is_company_admin(company_id));
create policy invite_links_insert on public.company_invite_links
  for insert to authenticated with check (private.is_company_admin(company_id));
create policy invite_links_update on public.company_invite_links
  for update to authenticated using (private.is_company_admin(company_id))
  with check (private.is_company_admin(company_id));

-- Gera um link novo e invalida o anterior da mesma organização: existe sempre
-- um link válido por organização, e gerar outro fecha o antigo.
--
-- O token sai de dois gen_random_uuid: gen_random_bytes vem do pgcrypto, que
-- no Supabase fica no schema extensions e não está no search_path vazio destas
-- funções. Dois uuid dão 32 bytes de aleatoriedade, entropia de sobra.
create or replace function public.create_invite_link(p_company_id uuid)
returns table (token text, expires_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token text;
begin
  if not private.is_company_admin(p_company_id) then
    raise exception 'Só administrador da organização pode gerar convite.';
  end if;

  update public.company_invite_links
  set revoked_at = now()
  where company_id = p_company_id and revoked_at is null;

  v_token :=
    replace(gen_random_uuid()::text, '-', '') ||
    replace(gen_random_uuid()::text, '-', '');

  insert into public.company_invite_links (company_id, token, created_by, expires_at)
  values (p_company_id, v_token, (select auth.uid()), now() + interval '7 days');

  return query
  select l.token, l.expires_at
  from public.company_invite_links l
  where l.token = v_token;
end;
$$;

create or replace function public.revoke_invite_link(p_company_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not private.is_company_admin(p_company_id) then
    raise exception 'Só administrador da organização pode revogar convite.';
  end if;

  update public.company_invite_links
  set revoked_at = now()
  where company_id = p_company_id and revoked_at is null;
end;
$$;

-- Entrar pelo link.
-- security definer: quem chega pelo link ainda não é membro e, portanto, não
-- tem permissão para se inserir em company_members. A função só aceita token
-- válido, não revogado e dentro do prazo.
create or replace function public.join_company_by_token(p_token text)
returns table (company_id uuid, company_name text, already_member boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_link record;
  v_ja boolean;
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado para entrar pelo convite.';
  end if;

  select l.company_id, c.name into v_link
  from public.company_invite_links l
  join public.companies c on c.id = l.company_id
  where l.token = p_token
    and l.revoked_at is null
    and l.expires_at > now();

  if v_link is null then
    raise exception 'Convite inválido ou vencido.';
  end if;

  select exists (
    select 1 from public.company_members m
    where m.company_id = v_link.company_id and m.user_id = v_user_id
  ) into v_ja;

  if not v_ja then
    insert into public.company_members (company_id, user_id, role, display_name)
    values (
      v_link.company_id,
      v_user_id,
      'member',
      coalesce((select p.nickname from public.profiles p where p.user_id = v_user_id), '')
    );
  end if;

  return query select v_link.company_id, v_link.name, v_ja;
end;
$$;

revoke execute on function public.join_company_by_token(text) from public, anon;
grant execute on function public.join_company_by_token(text) to authenticated;

-- Adicionar pelo apelido.
-- security definer porque insere a linha de outra pessoa; a checagem de quem
-- pode fazer isso está logo no começo.
create or replace function public.add_member_by_nickname(p_company_id uuid, p_nickname text)
returns table (user_id uuid, nickname text, already_member boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alvo record;
  v_ja boolean;
begin
  if not private.is_company_admin(p_company_id) then
    raise exception 'Só administrador da organização pode adicionar pessoas.';
  end if;

  select p.user_id, p.nickname into v_alvo
  from public.profiles p
  where lower(p.nickname) = lower(trim(p_nickname));

  if v_alvo is null then
    raise exception 'Não existe ninguém com esse apelido.';
  end if;

  select exists (
    select 1 from public.company_members m
    where m.company_id = p_company_id and m.user_id = v_alvo.user_id
  ) into v_ja;

  if not v_ja then
    insert into public.company_members (company_id, user_id, role, display_name)
    values (p_company_id, v_alvo.user_id, 'member', v_alvo.nickname);
  end if;

  return query select v_alvo.user_id, v_alvo.nickname, v_ja;
end;
$$;

revoke execute on function public.add_member_by_nickname(uuid, text) from public, anon;
grant execute on function public.add_member_by_nickname(uuid, text) to authenticated;

-- O convite por e-mail sai de cena. Uma porta de entrada a menos para manter,
-- e o link já cobre quem ainda não tem conta.
drop function if exists public.claim_invites();
drop table if exists public.company_invites;
