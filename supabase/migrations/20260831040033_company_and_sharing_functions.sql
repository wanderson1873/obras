-- Criar a empresa: grava a empresa, coloca quem criou como administrador e
-- traz para dentro dela as obras que a pessoa já tinha. Tudo numa transação,
-- para não sobrar empresa sem dono se a conexão cair no meio.
create or replace function public.create_company(company_name text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_id uuid;
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado.';
  end if;
  if coalesce(trim(company_name), '') = '' then
    raise exception 'A empresa precisa de um nome.';
  end if;

  insert into public.companies (name, created_by)
  values (trim(company_name), v_user_id)
  returning id into v_company_id;

  insert into public.company_members (company_id, user_id, role, display_name)
  values (
    v_company_id,
    v_user_id,
    'admin',
    coalesce(nullif(trim(split_part((select auth.jwt() ->> 'email'), '@', 1)), ''), 'Eu')
  );

  -- As obras que já existiam continuam privadas; só passam a pertencer à
  -- empresa, o que habilita compartilhá-las depois.
  update public.works
  set company_id = v_company_id
  where user_id = v_user_id and company_id is null;

  return v_company_id;
end;
$$;

-- Aceitar convites pendentes para o e-mail de quem acabou de entrar.
-- security definer: o convite foi escrito pelo administrador e o convidado
-- precisa poder virar membro sem ter permissão de escrever em company_members.
create or replace function public.claim_invites()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_email text := lower((select auth.jwt() ->> 'email'));
  v_count integer := 0;
begin
  if v_user_id is null or v_email is null then
    return 0;
  end if;

  with aceitos as (
    update public.company_invites i
    set accepted_at = now()
    where lower(i.email) = v_email
      and i.accepted_at is null
    returning i.company_id, i.role
  ),
  inseridos as (
    insert into public.company_members (company_id, user_id, role, display_name)
    select a.company_id, v_user_id, a.role, split_part(v_email, '@', 1)
    from aceitos a
    on conflict (company_id, user_id) do nothing
    returning 1
  )
  select count(*) into v_count from inseridos;

  return v_count;
end;
$$;

-- Definir com quem a obra é compartilhada. Só quem criou pode chamar.
create or replace function public.set_work_sharing(
  p_work_id uuid,
  p_scope text,
  p_user_ids uuid[] default '{}'
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_owner uuid;
  v_company uuid;
begin
  select w.user_id, w.company_id into v_owner, v_company
  from public.works w where w.id = p_work_id;

  if v_owner is null then
    raise exception 'Obra não encontrada.';
  end if;
  if v_owner is distinct from v_user_id then
    raise exception 'Só quem criou a obra pode mudar quem enxerga.';
  end if;
  if p_scope not in ('private', 'selected', 'company') then
    raise exception 'Compartilhamento inválido.';
  end if;
  if p_scope = 'company' and v_company is null then
    raise exception 'Esta obra não está ligada a nenhuma empresa.';
  end if;

  update public.works set share_scope = p_scope where id = p_work_id;

  delete from public.work_viewers where work_id = p_work_id;

  if p_scope = 'selected' then
    -- Só entra quem é da mesma empresa: compartilhar não pode virar porta de
    -- entrada para alguém de fora.
    insert into public.work_viewers (work_id, user_id, owner_id)
    select p_work_id, m.user_id, v_user_id
    from public.company_members m
    where m.company_id = v_company
      and m.user_id = any (p_user_ids)
      and m.user_id <> v_user_id;
  end if;
end;
$$;
