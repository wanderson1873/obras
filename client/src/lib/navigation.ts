/** Links de rota reais para os apps de navegação. Todos aceitam endereço em texto, sem precisar de geocodificação. */

import type { Work } from "@/features/works/types";

export type NavigationApp = {
  id: "waze" | "google" | "apple";
  name: string;
  /** Cor da marca, usada no ícone do seletor. */
  color: string;
  buildUrl: (address: string) => string;
};

export function fullAddress(
  work: Pick<Work, "street" | "unit" | "city" | "state" | "zip">
) {
  // O apartamento entra junto da rua: é assim que os apps de mapa entendem.
  const rua = [work.street, work.unit]
    .map(p => p?.trim())
    .filter(Boolean)
    .join(" ");
  const regiao = [work.city, work.state]
    .map(p => p?.trim())
    .filter(Boolean)
    .join(", ");
  return [rua, regiao, work.zip?.trim()].filter(Boolean).join(", ");
}

const APPS: NavigationApp[] = [
  {
    id: "waze",
    name: "Waze",
    color: "bg-[#33ccff]",
    buildUrl: address =>
      `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`,
  },
  {
    id: "google",
    name: "Google Maps",
    color: "bg-[#4285f4]",
    buildUrl: address =>
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
  },
  {
    id: "apple",
    name: "Apple Maps",
    color: "bg-[#3e9cf5]",
    buildUrl: address =>
      `https://maps.apple.com/?daddr=${encodeURIComponent(address)}&dirflg=d`,
  },
];

function isApplePlatform() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
}

/** Apple Maps só faz sentido em iOS/macOS; fora disso ele vai para o fim da lista. */
export function navigationApps(): NavigationApp[] {
  if (isApplePlatform()) {
    const apple = APPS.filter(app => app.id === "apple");
    return [...apple, ...APPS.filter(app => app.id !== "apple")];
  }
  return APPS.filter(app => app.id !== "apple");
}

/** O app foi instalado na tela inicial, em vez de aberto numa aba do navegador. */
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)").matches === true ||
    // iOS antes do display-mode.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function openRoute(app: NavigationApp, address: string) {
  const url = app.buildUrl(address);

  if (isStandalone()) {
    /*
     * Instalado, window.open abre uma janela dentro do próprio app. O Waze
     * assume o link e sai na frente, mas a janela vazia fica para trás — a
     * tela branca com um x no topo. Trocando a própria página pelo link, quem
     * atende é o sistema: o Waze abre e nada sobra por cima.
     */
    window.location.href = url;
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
