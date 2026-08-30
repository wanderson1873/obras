-- touch_updated_at só é chamada pelo trigger; não precisa ficar exposta
-- como endpoint em /rest/v1/rpc.
revoke execute on function public.touch_updated_at() from anon, authenticated, public;
