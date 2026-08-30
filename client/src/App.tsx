import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { House, TriangleAlert } from "lucide-react";
import { supabaseConfigured } from "@/lib/supabase";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { SignInScreen } from "./features/auth/SignInScreen";
import { useAppUpdate } from "./features/pwa/useAppUpdate";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
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
          Configuração ausente
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#647084]">
          O app subiu, mas não sabe a qual banco se conectar. Defina estas duas
          variáveis em Ambiente, no painel, e reinicie o serviço:
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
  useAppUpdate();
  if (loading) return <Splash />;
  if (!session) return <SignInScreen />;
  return <Router />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
