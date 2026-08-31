# Em andamento: tradução do conteúdo escrito (1 set 2026)

## Servidor (pronto e testado)
- [x] Chave do Google Translate conferida: traduz e detecta o idioma de origem.
- [x] Tabela content_translations, com leitura liberada só para quem enxerga a obra.
- [x] Função translate-work: lê a obra com o token de quem chamou (o RLS impede
      mandar traduzir obra alheia) e grava com a chave de serviço.
- [x] Endereço, cidade e código ficam fora do tradutor de propósito.
- [x] Atualizações escritas pelo app ganham system_key e ficam fora do tradutor —
      "Ficha criada." estava virando "Character sheet created.".
- [x] Testado com obra real: "Lixar todos os andares" -> "Sand all the floors" /
      "Lija todos los pisos", e as três tarefas junto.

## Interface (ainda não feita)
- [ ] Chamar a tradução depois de salvar a ficha.
- [ ] Mostrar o texto no idioma de quem lê, caindo no original quando não houver.
- [ ] Botão "ver original" na ficha.
- [ ] Mostrar atualizações do app pelo dicionário, via system_key.

# Atualização: interface em três idiomas (31 ago 2026)

- [x] Português, inglês e espanhol, detectados pelo idioma do aparelho.
- [x] Troca manual em Conta > Idioma, com opção de voltar ao automático.
- [x] Dicionário com o português como referência: esquecer uma chave em outro
      idioma vira erro de compilação, não texto faltando na tela.
- [x] Datas no idioma certo, inclusive a ordem (Aug 31 x 31 ago) e as frases
      de duração ("1 dia de obra" / "1 day on the job" / "1 día de obra").
- [x] Conferido na tela nos três idiomas.

## Pendente: traduzir o que vocês escrevem
As tarefas, descrições e observações continuam no idioma de quem escreveu.
Isso precisa de um serviço de tradução — ver conversa.

# Em andamento: compartilhamento entre a equipe (31 ago 2026)

Modelo escolhido: toda obra é privada de quem criou. Quem criou decide
compartilhar com pessoas específicas ou com a empresa inteira. Não existe
"vê tudo" — o Dhiego não enxerga as obras que eu ou o Espano criamos, a menos
que a gente compartilhe. Ser administrador serve só para gerenciar quem entra.
Quem recebe uma obra pode editar tudo nela, mas não apagar nem mudar quem vê.

## Banco (pronto e testado)
- [x] Tabelas companies, company_members, company_invites e work_viewers.
- [x] Colunas company_id e share_scope em works.
- [x] Políticas de leitura e escrita para obras compartilhadas.
- [x] Tabelas filhas e Storage seguindo a visibilidade da obra, não o dono.
- [x] Gatilho impedindo quem recebeu a obra de mudar dono, empresa ou
      compartilhamento.
- [x] Funções create_company, claim_invites e set_work_sharing.
- [x] Tudo aditivo: nada removido nem renomeado, então o app em produção
      continuou funcionando durante a mudança.
- [x] Testado com quatro usuários fictícios: cada um enxerga exatamente o que
      deveria, e quem está fora da empresa não vê nada.
- [x] Testado que quem recebe edita o conteúdo mas é barrado ao tentar mudar o
      compartilhamento, roubar a obra ou apagá-la.

## Interface (pronta)
- [x] Criar a empresa e convidar por e-mail, em Conta > Equipe.
- [x] Lista de membros, com remover e cancelar convite (só administrador).
- [x] Folha "Quem enxerga" na ficha aberta, só para quem criou.
- [x] Selo no card: compartilhada comigo, toda a equipe, ou com N pessoas.
- [x] Apagar ficha some para quem apenas recebeu a obra.
- [x] Convite pendente é aceito sozinho quando a pessoa entra.

## Pendências fora do código
- [ ] Dhiego e Espano precisam criar conta no app.
- [ ] Ligar "Leaked Password Protection" no Supabase (é só um botão).

# Atualização: entrar com o Google (31 ago 2026)

- [x] Botão "Entrar com o Google" na tela de entrada, com o logotipo da marca.
- [x] `signInWithGoogle` no contexto de autenticação, voltando para a origem atual
      (funciona igual em produção e no localhost).
- [x] Ler o motivo do erro que o Google devolve na URL — sem isso o usuário só
      veria a tela de entrada de novo, sem entender por quê.
- [x] Documentar no README o que configurar no Google Cloud e no Supabase.
- [x] Confirmado que a URL montada pelo app está certa: o Supabase responde
      "provider is not enabled", ou seja, falta só habilitar no painel.

## Pendente (depende das suas contas)
- [ ] Criar as credenciais OAuth no Google Cloud e PUBLICAR a tela de
      consentimento — em modo "Teste" a sessão expira a cada 7 dias.
- [ ] Habilitar o Google no Supabase e ajustar Site URL / Redirect URLs.

# Atualização: conta, 404 e condições do local (30 ago 2026)

## Correção do 404 após o login
- [x] Caminho desconhecido volta para a tela do app em vez de um 404 sem saída.
      O app tem uma tela só; um 404 ali é sempre um beco.
- [x] `detectSessionInUrl: true` — estava desligado, então o token que volta no
      link de confirmação de e-mail era ignorado. Também é o que faz o link de
      recuperação de senha funcionar.
- [x] Remover a página NotFound (estava em inglês e fora do visual do app).

## Conta
- [x] Botão de conta no cabeçalho, no lugar do "sair" solto.
- [x] Mostrar e-mail cadastrado e data de criação da conta.
- [x] Alterar senha, exigindo a senha atual — o celular fica sempre logado, e sem
      isso quem pegasse o aparelho destrancado tomaria a conta.
- [x] "Esqueci minha senha" na tela de entrada.

## Condições do local
- [x] Mostrar também quando TEM água e energia, em verde, e não só as faltas.

## Pendente
- [ ] Login por telefone: depende de contratar um provedor de SMS no Supabase.

# Atualização: código em destaque no card (30 ago 2026)

- [x] Trocar endereço e código de lugar: o código vira o destaque do card e o
      endereço vai para a faixa cinza, junto do botão Rota.
- [x] A faixa do endereço aparece em toda ficha — endereço sempre existe.
- [x] Sem código, o destaque mostra "sem código" e a estrutura do card não muda,
      para o olho não reaprender onde procurar a cada ficha.
- [x] Endereço longo quebra em duas linhas em vez de cortar o complemento.
- [x] Conferido em quatro casos: com código, sem código, endereço longo e concluída.

# Atualização: ordem manual das fichas (30 ago 2026)

- [x] Coluna `position` em `works`, com as fichas existentes herdando a ordem da tela.
- [x] Função `reorder_works(uuid[])`: grava a lista inteira em uma chamada, sem
      deixar a ordem pela metade se a conexão cair.
- [x] `save_work` preserva a posição quando o app não manda o campo — marcar
      uma tarefa não pode mover a obra de lugar.
- [x] Modo organizar: linhas compactas com ↑, ↓ e "ir para o topo".
- [x] Ficha nova entra no topo da lista.
- [x] Concluídas continuam depois das em andamento, independentemente da posição.
- [x] Ordem aplicada na tela na hora e desfeita se a gravação falhar.

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
