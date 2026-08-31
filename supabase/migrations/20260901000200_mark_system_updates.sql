-- Algumas atualizações são escritas pelo próprio app ("Ficha criada.").
-- Mandá-las para o tradutor é pagar para traduzir mal um texto que já existe
-- traduzido no dicionário da interface — "ficha" virou "character sheet".
--
-- Com a chave marcada aqui, o app mostra o texto do dicionário no idioma de
-- quem está lendo, e a função de tradução ignora essas linhas.
alter table public.work_updates
  add column system_key text;

update public.work_updates
set system_key = case text
  when 'Ficha criada.' then 'work.createdEntry'
  when 'Obra criada.' then 'work.createdEntry'
  when 'Obra marcada como concluída.' then 'work.completedEntry'
  when 'Obra reaberta.' then 'work.reopenedEntry'
end
where text in (
  'Ficha criada.',
  'Obra criada.',
  'Obra marcada como concluída.',
  'Obra reaberta.'
);

delete from public.content_translations ct
using public.work_updates u
where ct.entity_id = u.id
  and ct.field = 'text'
  and u.system_key is not null;
