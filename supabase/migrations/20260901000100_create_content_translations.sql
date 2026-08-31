-- Traduções do que as pessoas escrevem.
--
-- Traduzimos ao salvar, não ao ler: assim a leitura é instantânea, funciona
-- sem sinal na obra e o custo é fixo por ficha em vez de por visualização.
--
-- Endereço, cidade e código NUNCA entram aqui. Nome de rua e senha de porta
-- têm de chegar idênticos ao que foi escrito.

alter table public.works
  add column source_lang text check (source_lang in ('pt', 'en', 'es'));

create table public.content_translations (
  -- Repetido para a política poder perguntar "esta obra é visível para mim?"
  -- sem precisar descobrir a que obra a tarefa pertence.
  work_id uuid not null references public.works (id) on delete cascade,
  -- Id da obra, da tarefa ou da atualização.
  entity_id uuid not null,
  field text not null check (field in ('service', 'description', 'observations', 'label', 'text')),
  lang text not null check (lang in ('pt', 'en', 'es')),
  translated text not null,
  updated_at timestamptz not null default now(),
  primary key (entity_id, field, lang)
);

create index content_translations_work_lang_idx
  on public.content_translations (work_id, lang);

alter table public.content_translations enable row level security;

-- Só leitura para quem usa o app: quem escreve é a função de tradução,
-- que roda no servidor com a chave de serviço.
create policy content_translations_select on public.content_translations
  for select to authenticated
  using (private.can_view_work(work_id));
