/**
 * Instalação do app na tela inicial.
 *
 * No Android/Chrome o navegador avisa quando a instalação é possível
 * (`beforeinstallprompt`) e nós guardamos esse evento para disparar no
 * momento certo. O iPhone não tem esse evento: lá só dá para ensinar o
 * caminho do menu Compartilhar.
 */

import { useCallback, useEffect, useState } from "react";

const DISMISSED_KEY = "obras:install-dismissed";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const iosStandalone =
    (window.navigator as { standalone?: boolean }).standalone === true;
  return (
    window.matchMedia("(display-mode: standalone)").matches || iosStandalone
  );
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPad recente se identifica como Mac; o toque é o que o denuncia.
  const iPadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOs;
}

function readDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(isStandaloneDisplay);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Sem isso o Chrome mostra o próprio banner na hora que quiser.
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Abrir já instalado (ou instalar em outra aba) também some com o convite.
    const standalone = window.matchMedia("(display-mode: standalone)");
    const onDisplayChange = () => setInstalled(isStandaloneDisplay());
    standalone.addEventListener("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      standalone.removeEventListener("change", onDisplayChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return "unavailable" as const;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // O evento só serve uma vez.
    setPromptEvent(null);
    return outcome;
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* modo privado: o convite volta na próxima abertura, tudo bem */
    }
  }, []);

  const ios = isIosDevice();

  return {
    /** Já está rodando como app instalado. */
    installed,
    /** iPhone/iPad: não há prompt, apenas instruções. */
    ios,
    /** O navegador confirmou que dá para instalar agora. */
    canInstall: Boolean(promptEvent),
    dismissed,
    install,
    dismiss,
  };
}
