-- O Postgres concede EXECUTE a PUBLIC por padrão, então revogar só de `anon`
-- não adiantou: ele continuava herdando de PUBLIC.
--
-- claim_invites permanece security definer de propósito: o convidado precisa
-- virar membro sem ter permissão de escrever em company_members. É seguro
-- porque a função só age sobre convites cujo e-mail é o do próprio token de
-- quem chamou — ela não aceita nenhum parâmetro.
revoke execute on function public.claim_invites() from public, anon;
grant execute on function public.claim_invites() to authenticated;
