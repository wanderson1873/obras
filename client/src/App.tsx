import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { House, TriangleAlert } from "lucide-react";
import { supabaseConfigured } from "@/lib/supabase";
import { I18nProvider, useT } from "./i18n/I18nContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { SignInScreen } from "./features/auth/SignInScreen";
import { useAppUpdate } from "./features/pwa/useAppUpdate";
import { JoinScreen, takeInviteToken } from "./features/company/JoinScreen";
import { ProfileSetupScreen } from "./features/auth/ProfileSetupScreen";
import { useProfile } from "./features/auth/useProfile";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/*
        O app tem uma tela só. Qualquer outro caminho — inclusive o que sobra
        de um link de confirmação de e-mail — volta para ela, em vez de deixar
        o usuário parado num 404 sem saída.
      */}
      <Route>
        <Redirect to="/" replace />
      </Route>
    </Switch>
  );
}

/** Enquanto o Supabase confere a sessão salva, evita piscar a tela de login. */
function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0]">
      <div className="grid h-14 w-14 animate-pulse place-items-center rounded-[18px] bg-[#e86a33]">
        <House size={28} strokeWidth={2.4} className="text-white" />
      </div>
    </div>
  );
}

/**
 * Sem as variáveis do Supabase o app não tem o que mostrar. Dizer isso na tela
 * é melhor do que uma tela de login que falha em todo clique.
 */
function MissingConfigScreen() {
  const t = useT();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 text-[#27374c]">
      <div className="w-full max-w-[420px] rounded-[28px] border border-[#e8e2d7] bg-[#fbfaf7] p-6 shadow-[0_18px_50px_rgba(39,55,76,0.1)]">
        <span
          className="mb-4 grid h-11 w-11 place-items-center rounded-[14px] bg-[#fff0e8] text-[#a74b29]"
          aria-hidden="true"
        >
          <TriangleAlert size={21} />
        </span>
        <h1 className="text-[21px] font-bold tracking-[-0.035em]">
          {t("config.title")}
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#647084]">
          {t("config.body")}
        </p>
        <ul className="mt-3 space-y-1.5 rounded-xl bg-[#f3f0e9] px-3.5 py-3 font-mono-field text-[12px] text-[#4f5c6e]">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_PUBLISHABLE_KEY</li>
        </ul>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { session, loading } = useAuth();
  const [local, navegar] = useLocation();
  useAppUpdate();

  // O caminho do convite responde antes da barreira de login: quem chega sem
  // conta precisa poder criar uma e cair dentro da organização em seguida.
  const doConvite = local.match(/^\/entrar\/([A-Za-z0-9]+)$/);
  if (doConvite) {
    return (
      <JoinScreen
        token={doConvite[1]}
        onDone={() => navegar("/", { replace: true })}
      />
    );
  }

  if (loading) return <Splash />;
  if (!session) return <SignInScreen />;
  return <PendingInvite />;
}

/**
 * Quem entrou ou criou a conta vindo de um link volta para cá com o token
 * guardado na aba. Redireciona uma vez para concluir a entrada.
 */
function PendingInvite() {
  const [, navegar] = useLocation();
  const [conferido, setConferido] = useState(false);

  useEffect(() => {
    const token = takeInviteToken();
    if (token) navegar(`/entrar/${token}`, { replace: true });
    else setConferido(true);
  }, [navegar]);

  if (!conferido) return <Splash />;
  return <ProfileGate />;
}

/**
 * Cadastro antes do app, uma vez só.
 *
 * O apelido é como os colegas encontram a pessoa para adicioná-la a uma
 * organização, então pedir isso na entrada evita alguém trabalhando sem que
 * ninguém consiga achá-la. Se a consulta falhar — sem internet, por exemplo —
 * o app abre assim mesmo: ficar preso numa tela de cadastro por falta de rede
 * seria pior do que um cadastro incompleto.
 */
function ProfileGate() {
  const { profile, complete, loading, failed, save } = useProfile();

  if (loading) return <Splash />;
  if (!complete && !failed && profile) {
    return <ProfileSetupScreen initial={profile} onSave={save} />;
  }
  return <Router />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            {supabaseConfigured ? (
              <AuthProvider>
                <AuthenticatedApp />
              </AuthProvider>
            ) : (
              <MissingConfigScreen />
            )}
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
