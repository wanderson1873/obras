/**
 * Gera a imagem que o WhatsApp, o LinkedIn e o Google mostram quando alguém
 * compartilha obras.derson.cloud.
 *
 *   npm run og
 *
 * O PNG vai versionado em client/public/og.png — este script existe para
 * poder refazer a imagem quando a ilustração da landing mudar, em vez de
 * reexportar à mão e esquecer como ela foi feita.
 *
 * É a mesma cena da dobra inicial, parada: o cartão da obra com o código do
 * portão em destaque. Sem animação, porque PNG não anima.
 */

import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const LARGURA = 1200;
const ALTURA = 630;

const TINTA = "#27374c";
const LARANJA = "#e86a33";
const APAGADO = "#9aa2ac";
const BORDA = "#e8e2d7";
const PAPEL = "#fbfaf7";
const AREIA = "#f1ece2";
const FUNDO = "#f7f5f0";

/** Fachada de casa, igual à das cenas da landing. */
function casa(x, y, escala) {
  return `
    <g transform="translate(${x} ${y}) scale(${escala})">
      <path d="M0 18 L16 4 L32 18 L32 40 L0 40 Z" fill="${AREIA}" stroke="${TINTA}" stroke-width="2.2" stroke-linejoin="round" />
      <rect x="6" y="22" width="8" height="8" rx="1.5" fill="${LARANJA}" />
      <rect x="18" y="22" width="8" height="8" rx="1.5" fill="${LARANJA}" />
      <rect x="11" y="33" width="10" height="7" rx="1.5" fill="${TINTA}" opacity="0.18" />
    </g>`;
}

/** Cone de obra. */
function cone(x, y, escala) {
  return `
    <g transform="translate(${x} ${y}) scale(${escala})">
      <path d="M10 0 L19 24 H1 Z" fill="${LARANJA}" />
      <path d="M6.2 12 H13.8" stroke="${PAPEL}" stroke-width="3" />
      <rect x="0" y="24" width="20" height="3.4" rx="1.7" fill="${TINTA}" opacity="0.35" />
    </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}">
  <rect width="${LARGURA}" height="${ALTURA}" fill="${FUNDO}" />

  <!-- Marca -->
  <rect x="72" y="88" width="76" height="76" rx="24" fill="${LARANJA}" />
  <path d="M94 134 L110 118 L126 134 L126 150 L94 150 Z" fill="#ffffff" />
  <path d="M94 134 L110 118 L126 134" stroke="#ffffff" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round" />
  <text x="168" y="146" fill="${TINTA}" font-family="DM Sans, Segoe UI, Arial, sans-serif" font-size="62" font-weight="700" letter-spacing="-3">Obras</text>

  <!-- A frase que explica o app em uma linha -->
  <text x="72" y="276" fill="${TINTA}" font-family="DM Sans, Segoe UI, Arial, sans-serif" font-size="54" font-weight="700" letter-spacing="-2.4">Cada obra em</text>
  <text x="72" y="340" fill="${TINTA}" font-family="DM Sans, Segoe UI, Arial, sans-serif" font-size="54" font-weight="700" letter-spacing="-2.4">um cartão só.</text>
  <text x="72" y="404" fill="#647084" font-family="DM Sans, Segoe UI, Arial, sans-serif" font-size="27">Endereço, código do portão e tarefas —</text>
  <text x="72" y="444" fill="#647084" font-family="DM Sans, Segoe UI, Arial, sans-serif" font-size="27">no bolso, mesmo sem sinal.</text>
  <text x="72" y="528" fill="#a7502b" font-family="DM Mono, Consolas, monospace" font-size="24" letter-spacing="2">obras.derson.cloud</text>

  <!-- O cartão da obra, o mesmo da dobra inicial -->
  <g transform="translate(700 104)">
    <rect x="0" y="0" width="400" height="368" rx="44" fill="${PAPEL}" stroke="${BORDA}" stroke-width="4" />
    <rect x="30" y="30" width="340" height="130" rx="30" fill="${AREIA}" />
    ${casa(170, 48, 2)}
    <rect x="30" y="184" width="208" height="14" rx="7" fill="${TINTA}" opacity="0.75" />
    <rect x="30" y="214" width="140" height="12" rx="6" fill="${APAGADO}" opacity="0.7" />
    <rect x="30" y="252" width="340" height="82" rx="26" fill="#fff0e8" stroke="#f3d8c8" stroke-width="3" />
    <text x="62" y="305" fill="#a74b29" font-family="DM Mono, Consolas, monospace" font-size="40" font-weight="700" letter-spacing="7">4821</text>
    <circle cx="332" cy="293" r="11" fill="${LARANJA}" />
  </g>

  <!-- Chão de canteiro -->
  <path d="M72 568 H1128" stroke="${TINTA}" stroke-width="5" opacity="0.12" stroke-linecap="round" />
  ${cone(620, 516, 2)}
  ${casa(860, 490, 1.9)}
  ${cone(1060, 524, 1.7)}
</svg>`;

const destino = path.resolve(
  import.meta.dirname,
  "..",
  "client",
  "public",
  "og.png"
);

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: LARGURA },
  // A imagem é gerada aqui e versionada; as fontes do sistema bastam.
  font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
})
  .render()
  .asPng();

await mkdir(path.dirname(destino), { recursive: true });
await writeFile(destino, png);

console.log(
  `og.png gerado: ${destino} (${LARGURA}x${ALTURA}, ${(png.length / 1024).toFixed(1)} kB)`
);
