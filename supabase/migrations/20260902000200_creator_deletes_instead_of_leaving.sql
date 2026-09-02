-- Quem cria a organização não sai dela.
--
-- Sair deixaria a organização sem dono: ninguém para convidar, revogar link ou
-- remover quem quer que seja, e as fichas continuariam abertas para o grupo.
-- Para quem criou, o caminho é apagar a organização.

-- Ninguém remove quem criou: nem ela mesma, nem outro administrador.
drop policy if exists company_members_delete on public.company_members;
create policy company_members_delete on public.company_members
  for delete to authenticated
  using (
    (
      private.is_company_admin(company_id)
      or (select auth.uid()) = user_id
    )
    and not exists (
      select 1 from public.companies c
      where c.id = company_id and c.created_by = user_id
    )
  );

-- Apagar é privilégio de quem criou.
drop policy if exists companies_delete on public.companies;
create policy companies_delete on public.companies
  for delete to authenticated
  using (created_by = (select auth.uid()));

-- A exclusão passa por uma função para o erro ser uma frase, e não uma
-- operação que não faz nada quando a política barra.
--
-- As fichas não se perdem: works.company_id é "on delete set null", então cada
-- uma volta a ser privada de quem a criou. Membros e links de convite caem
-- junto com a organização.
create or replace function public.delete_company(p_company_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_criador uuid;
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado.';
  end if;

  select c.created_by into v_criador
  from public.companies c
  where c.id = p_company_id;

  if v_criador is null then
    raise exception 'Organização não encontrada.';
  end if;

  if v_criador <> v_user_id then
    raise exception 'Só quem criou a organização pode apagá-la.';
  end if;

  delete from public.companies where id = p_company_id;
end;
$$;

revoke execute on function public.delete_company(uuid) from public, anon;
grant execute on function public.delete_company(uuid) to authenticated;
