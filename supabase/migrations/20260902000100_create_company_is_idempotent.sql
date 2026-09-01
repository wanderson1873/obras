-- Criar organização duas vezes por engano.
--
-- Dois toques seguidos no botão disparavam duas chamadas antes do primeiro
-- terminar, e nasciam duas organizações iguais. Agora a segunda chamada
-- encontra a primeira e devolve ela mesma: repetir vira uma operação só.
--
-- Aproveito para tirar daqui a varredura que jogava todas as fichas privadas
-- da pessoa para dentro da organização recém-criada. Isso vinha do modelo
-- antigo de compartilhamento e hoje contradiz o app: ficha privada é privada,
-- e quem quiser criar dentro da organização escolhe isso no formulário. Da
-- forma como estava, criar uma organização abria o código de porta de todas as
-- fichas antigas para os colegas, sem avisar ninguém.
create or replace function public.create_company(company_name text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_nome text := trim(company_name);
  v_company_id uuid;
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado.';
  end if;
  if coalesce(v_nome, '') = '' then
    raise exception 'A empresa precisa de um nome.';
  end if;

  -- Já existe uma com esse nome, criada por mim? Então é ela.
  select c.id into v_company_id
  from public.companies c
  where c.created_by = v_user_id and lower(c.name) = lower(v_nome)
  limit 1;

  if v_company_id is not null then
    return v_company_id;
  end if;

  insert into public.companies (name, created_by)
  values (v_nome, v_user_id)
  returning id into v_company_id;

  insert into public.company_members (company_id, user_id, role, display_name)
  values (
    v_company_id,
    v_user_id,
    'admin',
    coalesce(nullif(trim(split_part((select auth.jwt() ->> 'email'), '@', 1)), ''), 'Eu')
  );

  return v_company_id;
end;
$$;
