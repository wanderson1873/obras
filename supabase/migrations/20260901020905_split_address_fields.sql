-- Endereço em campos separados, para o autocompletar preencher cada um e para
-- a rota montar o endereço certo.
--
-- Antes, cidade e estado viviam juntos num campo só ("Woonsocket, RI"), o que
-- só funcionava porque era digitado à mão.

alter table public.works
  add column unit text not null default '',
  add column state text not null default '';

-- Separa o que já existe: tudo depois da última vírgula é o estado.
update public.works
set
  state = trim(split_part(city, ',', 2)),
  city = trim(split_part(city, ',', 1))
where city like '%,%';

comment on column public.works.street is 'Número e rua: "20 Eastern Ave".';
comment on column public.works.unit is 'Apartamento, suíte ou unidade. Opcional.';
comment on column public.works.state is 'Sigla do estado: "RI".';
