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

# Sem variáveis do Supabase aqui de propósito. O EasyPanel só repassa GIT_SHA
# como build arg, então a configuração é lida quando o container sobe, não
# gravada dentro do bundle. Veja docker-entrypoint.d/10-obras-config.sh.
RUN npm run build:client

# ---------- Etapa 2: servir ----------
# O app é só arquivos estáticos: não precisa de Node em produção.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/public /usr/share/nginx/html

# A imagem do nginx roda tudo que estiver em /docker-entrypoint.d antes de
# iniciar o servidor — desde que o arquivo seja executável.
COPY docker-entrypoint.d/10-obras-config.sh /docker-entrypoint.d/10-obras-config.sh
RUN chmod +x /docker-entrypoint.d/10-obras-config.sh

EXPOSE 80
