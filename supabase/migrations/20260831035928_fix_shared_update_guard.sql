-- A política de UPDATE não consegue comparar o valor antigo com o novo:
-- WITH CHECK só enxerga a linha depois da alteração. Quem faz esse tipo de
-- guarda no Postgres é um gatilho.

create policy works_update_shared on public.works
  for update to authenticated
  using (
    (share_scope = 'company' and private.is_company_member(company_id))
    or (
      share_scope = 'selected'
      and exists (
        select 1 from public.work_viewers v
        where v.work_id = works.id and v.user_id = (select auth.uid())
      )
    )
  )
  with check (
    -- Depois de salvar, a obra tem de continuar visível para quem editou.
    (share_scope = 'company' and private.is_company_member(company_id))
    or (
      share_scope = 'selected'
      and exists (
        select 1 from public.work_viewers v
        where v.work_id = works.id and v.user_id = (select auth.uid())
      )
    )
    or user_id = (select auth.uid())
  );

-- Quem recebeu a obra edita o conteúdo, mas não muda de dono, nem o
-- compartilhamento, nem tira a obra da empresa.
create or replace function public.guard_work_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is distinct from old.user_id then
    if new.user_id is distinct from old.user_id then
      raise exception 'Só quem criou a obra pode transferi-la.';
    end if;
    if new.share_scope is distinct from old.share_scope then
      raise exception 'Só quem criou a obra pode mudar quem enxerga.';
    end if;
    if new.company_id is distinct from old.company_id then
      raise exception 'Só quem criou a obra pode mudar a empresa dela.';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_work_ownership() from anon, authenticated, public;

create trigger works_guard_ownership
before update on public.works
for each row execute function public.guard_work_ownership();
