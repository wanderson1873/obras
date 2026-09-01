-- create_profile_on_signup só é chamada pelo gatilho. O Postgres concede
-- EXECUTE a PUBLIC por padrão, então ela estava aparecendo como endpoint em
-- /rest/v1/rpc — inofensiva na prática (função de gatilho recusa chamada
-- direta), mas é superfície exposta sem motivo.
revoke execute on function public.create_profile_on_signup() from public, anon, authenticated;
