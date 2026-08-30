#!/bin/sh
# Gera a configuracao do app a partir das variaveis de ambiente do container.
#
# O Vite normalmente grava essas variaveis dentro do bundle na hora do build,
# mas o EasyPanel so passa GIT_SHA como build arg. Entao o app le a
# configuracao deste arquivo, escrito aqui, quando o container sobe.
set -e

CONFIG_FILE=/usr/share/nginx/html/config.js

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
  echo "[obras] AVISO: VITE_SUPABASE_URL e/ou VITE_SUPABASE_PUBLISHABLE_KEY nao definidas."
  echo "[obras] Defina as duas em Ambiente, no painel, e reinicie o servico."
  echo "[obras] O app vai subir mostrando uma tela de configuracao ausente."
fi

cat > "$CONFIG_FILE" <<EOF
window.__OBRAS_ENV__ = {
  SUPABASE_URL: "${VITE_SUPABASE_URL}",
  SUPABASE_PUBLISHABLE_KEY: "${VITE_SUPABASE_PUBLISHABLE_KEY}"
};
EOF

echo "[obras] config.js gerado para ${VITE_SUPABASE_URL:-<vazio>}"
