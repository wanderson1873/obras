/**
 * Service worker: deixa o app abrir sem internet e avisa quando há versão nova.
 *
 * Escolhemos avisar em vez de recarregar sozinho — recarregar a tela enquanto
 * o usuário lê o código de entrada na obra seria péssimo.
 */

import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useT } from "@/i18n/I18nContext";

export function useAppUpdate() {
  const t = useT();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("Falha ao registrar o service worker.", error);
    },
  });

  useEffect(() => {
    if (!needRefresh) return;

    toast(t("pwa.newVersion"), {
      description: t("pwa.newVersionHint"),
      duration: Infinity,
      action: {
        label: t("pwa.update"),
        onClick: () => void updateServiceWorker(true),
      },
      onDismiss: () => setNeedRefresh(false),
    });
  }, [needRefresh, setNeedRefresh, updateServiceWorker, t]);
}
