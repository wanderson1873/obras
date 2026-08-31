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

Em desenvolvimento elas vêm do arquivo `.env`, embutidas pelo Vite.

Em produção **não** são embutidas no build: o container gera um `/config.js` a
partir das variáveis de ambiente toda vez que sobe, e o app lê dali. Isso existe
porque o EasyPanel só repassa `GIT_SHA` como build arg — variáveis do painel não
chegam ao `docker build`. O efeito colateral é bom: trocar de projeto Supabase é
só mudar a variável e reiniciar, sem recompilar.

## Deploy no EasyPanel

O repositório tem um `Dockerfile` que constrói o app e serve os arquivos com
nginx. Não há Node em produção.

1. No EasyPanel, crie um **App** apontando para este repositório do GitHub.
2. Build: **Dockerfile**.
3. Em **Ambiente**, defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
   São lidas quando o container sobe, então basta reiniciar o serviço depois de
   mudar — não precisa reconstruir a imagem.
4. Porta do container: **80**.
5. Em **Domínios**, aponte o domínio e ative o HTTPS (Let's Encrypt). Sem
   certificado válido o celular não instala o app.

Se as variáveis estiverem faltando, o app sobe assim mesmo e mostra uma tela
"Configuração ausente" dizendo exatamente o que definir — e o log do container
avisa na partida.

Cada push na branch principal dispara um novo build.

### Depois do deploy

Abra o domínio no celular. No Android aparece o convite "Instalar o Obras no
celular"; no iPhone, use Safari → Compartilhar → Adicionar à Tela de Início.

## Entrar com o Google

O botão já está no app. Para ele funcionar, faltam duas configurações que
dependem das suas contas.

### 1. Google Cloud Console

1. Em [console.cloud.google.com](https://console.cloud.google.com), crie ou
   selecione um projeto.
2. **APIs e Serviços → Tela de consentimento OAuth**: tipo **Externo**, nome do
   app "Obras", seu e-mail em suporte e em contato do desenvolvedor.
3. Ainda na tela de consentimento, clique em **Publicar app**. Isto importa: no
   modo "Teste" o Google expira a sessão a cada 7 dias e você teria que entrar de
   novo toda semana. Como o app só pede nome e e-mail, publicar não exige
   verificação do Google.
4. **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web**:
   - Origens JavaScript autorizadas: `https://obras.derson.cloud`
   - URIs de redirecionamento autorizados:
     `https://pxujwpvjsnsfpbzzwjhv.supabase.co/auth/v1/callback`
5. Copie o **ID do cliente** e a **Chave secreta**.

### 2. Supabase

1. **Authentication → Sign In / Providers → Google**: ative e cole o ID do
   cliente e a chave secreta.
2. **Authentication → URL Configuration**:
   - Site URL: `https://obras.derson.cloud`
   - Redirect URLs: `https://obras.derson.cloud/**` (e
     `http://localhost:5173/**` para desenvolvimento)

Para conferir se ficou de pé, abra no navegador:

```
https://pxujwpvjsnsfpbzzwjhv.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fobras.derson.cloud
```

Enquanto não estiver configurado, isso responde
`Unsupported provider: provider is not enabled`. Depois, leva para a tela de
escolher a conta do Google.

Entrar pelo Google e entrar por e-mail com o mesmo endereço caem na mesma conta,
então as obras são as mesmas nos dois caminhos.

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
