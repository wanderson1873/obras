/**
 * Cliente Supabase do app.
 *
 * A configuração vem de dois lugares, nesta ordem:
 *
 * 1. `window.__OBRAS_ENV__`, escrito pelo container em `/config.js` quando ele
 *    sobe. É o caminho de produção — o EasyPanel não repassa variáveis para o
 *    build da imagem, só para o container em execução.
 * 2. As variáveis do arquivo `.env`, embutidas pelo Vite. É o caminho de
 *    desenvolvimento local.
 *
 * A chave publicável é pública de propósito: ela só identifica o projeto. Quem
 * impede um usuário de ler as obras de outro é o RLS no banco.
 */

import { createClient } from "@supabase/supabase-js";

const runtime =
  typeof window === "undefined" ? undefined : window.__OBRAS_ENV__;

const url = runtime?.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "";
const publishableKey =
  runtime?.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const supabaseConfigured = Boolean(url && publishableKey);

if (!supabaseConfigured) {
  console.error(
    "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY " +
      "(no .env em desenvolvimento, ou em Ambiente no painel em produção)."
  );
}

// Valores de fallback só existem para o createClient não explodir na importação;
// a interface mostra a tela de configuração ausente antes de qualquer chamada.
export const supabase = createClient(
  url || "http://localhost",
  publishableKey || "sem-chave",
  {
    auth: {
      // Mantém a sessão no aparelho: o login é feito uma vez só.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
