-- Ordem manual das fichas. Menor posição aparece primeiro.
-- A ordenação continua separando em andamento de concluídas; a posição só
-- decide a ordem dentro de cada grupo.
alter table public.works
  add column position integer not null default 0;

-- Fichas que já existem herdam a ordem que estava na tela (mais recente no topo).
with ordenadas as (
  select
    id,
    row_number() over (
      partition by user_id
      order by status, start_date desc, created_at desc
    ) - 1 as nova_posicao
  from public.works
)
update public.works
set position = ordenadas.nova_posicao
from ordenadas
where public.works.id = ordenadas.id;

create index works_user_position_idx on public.works (user_id, status, position);

-- Reordenar move várias linhas de uma vez. Fazer isso em uma chamada só evita
-- deixar a lista pela metade se a conexão cair no meio.
-- security invoker: o RLS continua valendo, então ninguém reordena obra alheia.
create or replace function public.reorder_works(work_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'É preciso estar autenticado para reordenar as obras.';
  end if;

  update public.works
  set position = posicao.indice - 1
  from unnest(work_ids) with ordinality as posicao(id, indice)
  where public.works.id = posicao.id
    and public.works.user_id = v_user_id;
end;
$$;
