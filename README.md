# Obras — Caderno de Campo

App mobile para quem trabalha em obra: endereço, código de entrada da portaria,
o que precisa ser feito e o estado do serviço, tudo em uma ficha só — sem
precisar caçar a informação na conversa do WhatsApp.

Instalável na tela inicial do celular (PWA), com login próprio e dados no
Supabase.

## O que ele faz

- Lista de fichas com foto de fachada, endereço, cidade e **código de entrada** em destaque.
- Botão de rota que abre o Waze, o Google Maps ou o Apple Maps de verdade.
- Condições do local (água e energia), tarefas, observações, fotos e histórico de atualizações.
- Abas de obras em andamento e concluídas, com busca por rua, cidade, código ou serviço.
- Funciona sem sinal em modo somente leitura, usando o que ficou salvo no aparelho.

## Rodando na sua máquina

Requer **Node 20.19+** (testado no 24 LTS).

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev
```

O app sobe em `http://localhost:5173`. O `--host` já está ligado, então dá para
abrir pelo IP da máquina no celular na mesma rede.

> O botão de instalar e o modo offline **só funcionam em HTTPS** (ou em
> `localhost`). Pelo IP da rede local o navegador trata a página como insegura e
> não registra o service worker.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build do app + do servidor Node |
| `npm run build:client` | Só o app (é o que o Docker usa) |
| `npm run preview` | Serve o build de produção localmente |
| `npm run check` | Checagem de tipos |
| `npm run format` | Prettier |

## Variáveis de ambiente

| Variável | Onde achar |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → publishable key |

As duas são **públicas por natureza** — elas vão dentro do JavaScript que roda no
navegador de qualquer visitante. Quem protege os dados é o RLS no banco, não o
sigilo da chave. Nunca coloque aqui a `service_role`.

Como o Vite grava essas variáveis dentro do bundle **na hora do build**, elas
precisam existir no momento em que a imagem é construída — não adianta só
definir no container em execução.

## Deploy no EasyPanel

O repositório tem um `Dockerfile` que constrói o app e serve os arquivos com
nginx. Não há Node em produção.

1. No EasyPanel, crie um **App** apontando para este repositório do GitHub.
2. Build: **Dockerfile**.
3. Em **Environment**, defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
   Garanta que o EasyPanel as repasse como **build args** — o build falha de
   propósito, com mensagem clara, se elas estiverem faltando.
4. Porta do container: **80**.
5. Em **Domains**, aponte o domínio e ative o HTTPS (Let's Encrypt). Sem
   certificado válido o celular não instala o app.

Cada push na branch principal dispara um novo build.

### Depois do deploy

Abra o domínio no celular. No Android aparece o convite "Instalar o Obras no
celular"; no iPhone, use Safari → Compartilhar → Adicionar à Tela de Início.

## Banco de dados

O schema está versionado em `supabase/migrations/`. Para recriar em um projeto
Supabase novo, rode os arquivos em ordem no SQL Editor.

Estrutura: `works` com as filhas `work_tasks`, `work_updates`, `work_history` e
`work_photos`. Todas com RLS por `auth.uid()`. A função `save_work(jsonb)` grava
a ficha inteira em uma transação. As fotos ficam no bucket privado
`work-photos`, no caminho `{user_id}/{work_id}/{photo_id}.jpg`, e aparecem na
tela por link assinado.

## Como o código está organizado

```
client/src/
  features/
    auth/        sessão e tela de login
    pwa/         service worker e convite de instalação
    works/       o app em si
      components/  telas e folhas
      data/        repositório (Supabase) e cache local
      types.ts     modelo de dados
      useWorks.ts  estado das obras
  lib/           datas, fotos, rotas de navegação, cliente Supabase
supabase/migrations/   schema do banco
```

`features/works/data/repository.ts` é a interface de persistência. Trocar o
Supabase por outro backend significa escrever outra implementação dela — as
telas não mudam.
