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
  const rua = [work.street, work.unit].map(p => p?.trim()).filter(Boolean).join(" ");
  const regiao = [work.city, work.state].map(p => p?.trim()).filter(Boolean).join(", ");
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

export function openRoute(app: NavigationApp, address: string) {
  window.open(app.buildUrl(address), "_blank", "noopener,noreferrer");
}
