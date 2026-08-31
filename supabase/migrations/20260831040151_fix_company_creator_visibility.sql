-- Ao criar a empresa, o INSERT ... RETURNING precisa ler a linha recém-criada,
-- e a linha de membro ainda não existe nesse instante. Sem incluir quem criou,
-- a própria criação da empresa é barrada pelo RLS.
drop policy companies_select on public.companies;

create policy companies_select on public.companies
  for select to authenticated
  using (private.is_company_member(id) or created_by = (select auth.uid()));
