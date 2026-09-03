-- Cadastro da pessoa: nome, sobrenome e telefone.
--
-- O apelido já existia, criado sozinho a partir do e-mail. Agora quem chega
-- passa por uma tela de cadastro e escolhe o próprio, junto com o nome.
--
-- Nada disso é obrigatório no banco: contas antigas continuam válidas com os
-- campos vazios, e é o app que pede o preenchimento. Uma restrição "not null"
-- aqui derrubaria quem já está usando o app.
alter table public.profiles
  add column first_name text not null default '',
  add column last_name text not null default '',
  add column phone text not null default '';

comment on column public.profiles.first_name is 'Nome. Vazio significa cadastro ainda não preenchido.';
comment on column public.profiles.last_name is 'Sobrenome.';
comment on column public.profiles.phone is 'Telefone. Opcional — vazio é um valor legítimo.';

-- Nome com pinta de nome: nada de campo com 200 caracteres de lixo.
alter table public.profiles
  add constraint first_name_tamanho check (char_length(first_name) <= 60),
  add constraint last_name_tamanho check (char_length(last_name) <= 60),
  add constraint phone_tamanho check (char_length(phone) <= 30);

-- Colegas passam a ver o nome de quem divide a organização, não só o apelido.
-- A política de leitura já limita isso a quem participa da mesma organização.
