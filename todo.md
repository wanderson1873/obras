# Correção: configuração em tempo de execução (30 ago 2026)

O primeiro deploy no EasyPanel falhou. O log mostrou que ele constrói com
`docker buildx build ... --build-arg 'GIT_SHA=...'` e nada mais: as variáveis
definidas em Ambiente nunca chegam ao build. Como o Vite embute as variáveis no
bundle na hora de compilar, o app nunca saberia o endereço do Supabase.

- [x] Container gera /config.js a partir do ambiente ao subir (docker-entrypoint.d).
- [x] App lê window.__OBRAS_ENV__ e cai no .env do Vite em desenvolvimento.
- [x] Tirar os build args e o guard do Dockerfile.
- [x] Manter /config.js fora do precache do service worker — a versão do build
      serviria a configuração errada para sempre.
- [x] Cachear /config.js em runtime (stale-while-revalidate) para o app abrir sem sinal.
- [x] nginx serve /config.js com no-cache.
- [x] Tela "Configuração ausente" em vez de login que falha em todo clique.
- [x] Testar o entrypoint com e sem variáveis: gera JavaScript válido nos dois casos.

# Atualização: repositório e deploy (30 ago 2026)

- [x] Publicar o projeto em github.com/wanderson1873/obras.
- [x] Dockerfile de duas etapas: build com Node 24, produção servida por nginx.
- [x] Configurar cache no nginx: sw.js sempre revalidado, assets com hash eternos.
- [x] Falhar o build com mensagem clara se faltarem as variáveis do Supabase.
- [x] Versionar o schema do banco em supabase/migrations.
- [x] README com instruções de ambiente, scripts e deploy no EasyPanel.
- [x] .gitattributes forçando LF (CRLF quebraria o Dockerfile no Linux).
- [x] Remover o pnpm-lock e o patch do wouter, resíduos do Manus.
- [x] Conferir que .env e .claude ficaram fora do commit.

## Pendente
- [ ] Criar o App no EasyPanel apontando para o repositório.
- [ ] Definir VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY como BUILD ARGS.
- [ ] Apontar o domínio e ativar HTTPS — sem isso o celular não instala o app.
- [ ] Criar a conta no app depois que estiver no ar.

# Atualização: PWA instalável (30 ago 2026)

- [x] Gerar os ícones PNG 192, 512, maskable 512 e apple-touch 180.
- [x] Configurar o vite-plugin-pwa com manifesto completo (id, scope, orientação, categorias).
- [x] Service worker com precache do app (15 arquivos) e cache das fontes do Google.
- [x] Nunca cachear chamada de API: dado de obra vem do Supabase ou não vem.
- [x] Avisar sobre versão nova em vez de recarregar sozinho no meio do uso.
- [x] Convite de instalação no Android e instruções passo a passo no iPhone.
- [x] Tags do iOS para abrir em tela cheia (o iPhone ignora o manifesto).

## Pendente
- [ ] Publicar em HTTPS: sem isso o celular não instala nem registra o service worker.

# Atualização: Supabase (30 ago 2026)

## Banco
- [x] Criar o projeto `obras` (us-east-1) na organização Wanderson's O.
- [x] Modelar `works`, `work_tasks`, `work_updates`, `work_history` e `work_photos`.
- [x] Ligar RLS em todas as tabelas, com políticas por `auth.uid()`.
- [x] Criar a função `save_work`, que grava a ficha inteira em uma transação só.
- [x] Criar o bucket privado `work-photos`, com política por pasta do usuário.
- [x] Fechar a função de trigger `touch_updated_at`, que estava exposta em /rest/v1/rpc.
- [x] Verificar o isolamento do RLS e o `save_work` com usuários de teste (removidos depois).

## App
- [x] Login com e-mail e senha; a sessão fica salva no aparelho.
- [x] Trocar o repositório local pelo do Supabase, sem mexer nos componentes.
- [x] Guardar as fotos no Storage e exibir por link assinado de 8 horas.
- [x] Usar o IndexedDB como cache: abre instantâneo e continua legível sem sinal.
- [x] Aviso de "sem conexão" com botão de tentar de novo; sem sinal o app fica só leitura.
- [x] Remover as obras de exemplo — cada conta começa vazia.
- [x] Botão de sair da conta.

## Pendente
- [ ] Criar a conta pelo app (não crio conta nem manuseio senha por você).
- [ ] Decidir se as edições feitas sem sinal devem entrar numa fila para sincronizar depois.
- [ ] Avaliar dar acesso ao patrão (compartilhar obras entre contas).

# Atualização: correções e nova arquitetura (30 ago 2026)

## Correções
- [x] Trocar as fotos que apontavam para o servidor do Manus (erro 500) por imagens válidas.
- [x] Gravar as obras no aparelho (IndexedDB) — antes tudo se perdia ao recarregar.
- [x] Abrir a rota de verdade no Waze / Google Maps / Apple Maps, com opção de copiar o endereço.
- [x] Adicionar foto pela câmera ou galeria, com compressão, remoção e escolha de capa.
- [x] Guardar todas as datas em ISO e tolerar valores vazios ou inválidos na formatação.
- [x] Mostrar a data real de hoje no cabeçalho (era fixa em "25 Ago").
- [x] Datar as atualizações de verdade e exibir "Hoje" / "Ontem" / "27 ago".
- [x] Corrigir a tela de detalhes que quebrava quando não havia nenhuma obra.
- [x] Fazer a galeria da ficha deslizar entre as fotos (os pontos não navegavam).
- [x] Substituir o window.confirm por uma folha de confirmação do próprio app.
- [x] Fechar as folhas no Esc e no toque fora, travando a rolagem do fundo.
- [x] Degradar para modo somente-leitura quando o armazenamento não responde, em vez de travar no carregamento.

## Arquitetura
- [x] Quebrar a página única de 720 linhas em `features/works` (tipos, dados, hook e componentes).
- [x] Criar a interface `WorksRepository` para trocar o armazenamento local pelo Supabase sem mexer na interface.
- [x] Remover os resíduos do Manus (plugins do Vite, proxy de storage, coletor de logs, diálogo e template).
- [x] Atualizar o Node de 20.11 para 24.19 LTS (npm 11.17) e voltar ao Vite 7; limpar as dependências que não eram usadas.
- [x] Adicionar manifesto e ícone para instalar o app na tela inicial do celular.

## Novas ações da interface
- [x] Apagar ficha e reabrir obra concluída.
- [x] Remover tarefas, atualizações e fotos.
- [x] Buscar também por código de acesso e resumo do serviço, com botão de limpar.
- [x] Estados de carregamento e de lista vazia próprios para cada aba.

# Atualização: condições do local

- [x] Incluir disponibilidade de água e energia no modelo de obra e nos dados fictícios.
- [x] Adicionar controles de água e energia no cadastro e na edição.
- [x] Criar a seção Condições do local na tela de detalhes.
- [x] Exibir alertas compactos nos cartões apenas para indisponibilidades.
- [x] Validar compilação e os fluxos atualizados.

# Atualização: criação, início e código

- [x] Mover a ação “Nova ficha” para antes da lista de obras.
- [x] Incluir data de início nos dados fictícios, detalhes e formulário de edição.
- [x] Definir a data de criação como padrão para novas fichas.
- [x] Remover a ação de copiar do código de acesso.
- [x] Validar a compilação e os fluxos atualizados.

# Atualização: duração e validação de ficha

- [x] Calcular e mostrar a duração atual das obras a partir da data de início.
- [x] Tornar o código de acesso opcional e ocultar sua seção quando estiver vazio.
- [x] Substituir a validação genérica por erros diretamente nos campos obrigatórios.
- [x] Remover os estados de erro assim que cada campo for corrigido.
- [x] Validar a compilação e os fluxos atualizados.
