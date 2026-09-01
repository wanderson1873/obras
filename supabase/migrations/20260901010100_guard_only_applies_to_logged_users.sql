-- O gatilho protege a ficha de quem está usando o app. Em migração e em
-- rotina do servidor não existe usuário logado, e a versão anterior lia isso
-- como "não é o dono" e barrava a própria manutenção do banco.
--
-- Não há perda de segurança: a chave de serviço já ignora o RLS de qualquer
-- forma; quem passa por aqui com auth.uid() nulo não veio pelo app.
create or replace function public.guard_work_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    return new;
  end if;

  if v_user_id is distinct from old.user_id then
    if new.user_id is distinct from old.user_id then
      raise exception 'Só quem criou a obra pode transferi-la.';
    end if;
    if new.company_id is distinct from old.company_id then
      raise exception 'Só quem criou a obra pode mudar a organização dela.';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.guard_work_ownership() from anon, authenticated, public;
