import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { House } from "lucide-react";
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
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
