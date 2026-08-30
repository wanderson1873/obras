/**
 * Cliente Supabase do app.
 *
 * A chave publicável é pública de propósito — ela só identifica o projeto.
 * Quem impede um usuário de ler as obras de outro é o RLS no banco.
 */

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && publishableKey);

if (!supabaseConfigured) {
  console.error(
    "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env."
  );
}

export const supabase = createClient(
  url ?? "http://localhost",
  publishableKey ?? "sem-chave",
  {
    auth: {
      // Mantém a sessão no aparelho: o login é feito uma vez só.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
