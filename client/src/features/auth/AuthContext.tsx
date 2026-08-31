/**
 * Sessão do usuário.
 *
 * O Supabase guarda a sessão no aparelho e renova o token sozinho, então o
 * login acontece uma vez e o app abre direto nas obras nas próximas vezes.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthValue = {
  session: Session | null;
  /** true enquanto ainda não sabemos se existe uma sessão salva. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Manda o navegador para o Google e volta autenticado. */
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ needsConfirmation: boolean }>;
  /** Troca a senha, confirmando antes que quem pediu sabe a senha atual. */
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  /** Envia o e-mail de recuperação para quem esqueceu a senha. */
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setSession(data.session);
      })
      .catch(error => console.error("Falha ao ler a sessão salva.", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cobre renovação de token, logout e login feito em outra aba.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      loading,

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      },

      async signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            // Volta para a origem atual: funciona igual em produção e no
            // localhost, sem precisar de configuração por ambiente.
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      },

      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // Sem sessão na resposta significa que o projeto exige confirmar o e-mail.
        return { needsConfirmation: !data.session };
      },

      async updatePassword(currentPassword, newPassword) {
        const email = session?.user.email;
        if (!email) throw new Error("Sessão expirada. Entre novamente.");

        // O celular fica sempre logado. Sem conferir a senha atual, quem
        // pegasse o aparelho destrancado trocaria a senha e tomaria a conta.
        const { error: wrongPassword } = await supabase.auth.signInWithPassword(
          {
            email,
            password: currentPassword,
          }
        );
        if (wrongPassword) throw new Error("Senha atual incorreta.");

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
      },

      async sendPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: window.location.origin,
          }
        );
        if (error) throw error;
      },

      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth precisa estar dentro de AuthProvider.");
  return value;
}
