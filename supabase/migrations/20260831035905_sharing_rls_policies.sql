-- Políticas do compartilhamento.
--
-- Tudo aqui é aditivo: as políticas antigas (dono vê o que é dele) continuam
-- valendo. O Postgres soma as políticas com OR, então o app atual segue
-- funcionando enquanto a interface nova não chega.

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_invites enable row level security;
alter table public.work_viewers enable row level security;

-- Empresa: quem é membro enxerga; só administrador altera.
create policy companies_select on public.companies
  for select to authenticated using (private.is_company_member(id));
create policy companies_insert on public.companies
  for insert to authenticated with check ((select auth.uid()) = created_by);
create policy companies_update on public.companies
  for update to authenticated using (private.is_company_admin(id))
  with check (private.is_company_admin(id));

-- Membros: todo mundo da empresa vê a lista (precisa dela para escolher com
-- quem compartilhar). Só administrador mexe em quem entra e sai.
create policy company_members_select on public.company_members
  for select to authenticated using (private.is_company_member(company_id));
create policy company_members_insert on public.company_members
  for insert to authenticated
  with check (
    private.is_company_admin(company_id)
    -- Quem cria a empresa precisa poder se inserir como primeiro membro,
    -- quando ainda não existe administrador nenhum.
    or exists (
      select 1 from public.companies c
      where c.id = company_id
        and c.created_by = (select auth.uid())
        and (select auth.uid()) = user_id
    )
  );
create policy company_members_update on public.company_members
  for update to authenticated using (private.is_company_admin(company_id))
  with check (private.is_company_admin(company_id));
create policy company_members_delete on public.company_members
  for delete to authenticated
  using (
    private.is_company_admin(company_id)
    -- Qualquer um pode sair da empresa por conta própria.
    or (select auth.uid()) = user_id
  );

-- Convites: administrador gerencia; o convidado enxerga o que é para o e-mail dele.
create policy company_invites_select on public.company_invites
  for select to authenticated
  using (
    private.is_company_admin(company_id)
    or lower(email) = lower((select auth.jwt() ->> 'email'))
  );
create policy company_invites_insert on public.company_invites
  for insert to authenticated with check (private.is_company_admin(company_id));
create policy company_invites_delete on public.company_invites
  for delete to authenticated using (private.is_company_admin(company_id));

-- Destinatários do compartilhamento: o dono da obra gerencia; cada pessoa
-- enxerga que a obra foi compartilhada com ela.
create policy work_viewers_select on public.work_viewers
  for select to authenticated
  using ((select auth.uid()) = owner_id or (select auth.uid()) = user_id);
create policy work_viewers_insert on public.work_viewers
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy work_viewers_delete on public.work_viewers
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- Obras compartilhadas: ver e editar. Apagar e mudar o compartilhamento
-- continuam só com quem criou — as políticas antigas cuidam disso.
create policy works_select_shared on public.works
  for select to authenticated
  using (
    (share_scope = 'company' and private.is_company_member(company_id))
    or (
      share_scope = 'selected'
      and exists (
        select 1 from public.work_viewers v
        where v.work_id = works.id and v.user_id = (select auth.uid())
      )
    )
  );
