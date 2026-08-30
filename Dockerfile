# Build do app e imagem final servida por nginx.
# O EasyPanel constrói a partir deste arquivo a cada push no GitHub.

# ---------- Etapa 1: build ----------
FROM node:24-alpine AS build

WORKDIR /app

# Copiar só os manifests primeiro aproveita o cache do Docker:
# mudar código não refaz o npm ci.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# O Vite grava estas variáveis dentro do bundle na hora do build, não em tempo
# de execução. Por isso elas precisam existir AQUI, como build args.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# Falhar agora, com mensagem clara, é melhor do que publicar um app que só
# quebra quando o usuário tenta entrar.
RUN if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then       echo "ERRO: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY nas variaveis do EasyPanel.";       exit 1;     fi

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build:client

# ---------- Etapa 2: servir ----------
# O app é só arquivos estáticos: não precisa de Node em produção.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/public /usr/share/nginx/html

EXPOSE 80
