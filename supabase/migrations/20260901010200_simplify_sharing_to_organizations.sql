-- Modelo novo, mais simples: a ficha é privada quando não tem organização e é
-- da organização quando tem. Todo mundo da organização vê, edita e conclui;
-- apagar continua só com quem criou.
--
-- Com isso, share_scope e work_viewers deixam de existir: a presença de
-- company_id já diz tudo, e estado redundante é estado que um dia diverge.

-- As fichas que estavam privadas tinham company_id preenchido pelo backfill
-- de quando a empresa foi criada. Sem isto elas virariam da organização
-- silenciosamente ao trocarmos a regra.
update public.works
set company_id = null
where share_scope = 'private';

-- O que estava compartilhado com pessoas soltas passa a ser da organização,
-- que é o mais próximo do que a pessoa quis.
update public.works
set share_scope = 'company'
where share_scope = 'selected' and company_id is not null;

update public.works
set company_id = null
where share_scope = 'selected';

drop policy works_select_shared on public.works;
drop policy works_update_shared on public.works;

drop table public.work_viewers;

drop function if exists public.set_work_sharing(uuid, text, uuid[]);

alter table public.works drop column share_scope;

-- Ver e editar: quem criou (política antiga, por user_id) ou quem é da
-- organização da ficha.
create policy works_select_org on public.works
  for select to authenticated
  using (company_id is not null and private.is_company_member(company_id));

create policy works_update_org on public.works
  for update to authenticated
  using (company_id is not null and private.is_company_member(company_id))
  with check (company_id is not null and private.is_company_member(company_id));

-- Trocar a organização da ficha (ou torná-la privada). Só quem criou.
create or replace function public.set_work_company(
  p_work_id uuid,
  p_company_id uuid default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_owner uuid;
begin
  select w.user_id into v_owner from public.works w where w.id = p_work_id;

  if v_owner is null then
    raise exception 'Obra não encontrada.';
  end if;
  if v_owner is distinct from v_user_id then
    raise exception 'Só quem criou a obra pode mudar a organização dela.';
  end if;

  -- Ninguém joga uma ficha para dentro de organização de que não participa.
  if p_company_id is not null and not private.is_company_member(p_company_id) then
    raise exception 'Você não participa dessa organização.';
  end if;

  update public.works set company_id = p_company_id where id = p_work_id;
end;
$$;
