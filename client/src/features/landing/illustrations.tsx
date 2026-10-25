/**
 * Ilustrações da landing.
 *
 * Tudo é SVG inline animado por CSS: nenhuma dependência nova, nítido em
 * qualquer tela e tematizável com a paleta do app. Os objetos têm
 * personalidade (a casa pisca, o cone balança, o celular flutua) sem virar
 * mascote com carinha — quem lê é um empreiteiro decidindo se isso serve para
 * o trabalho dele.
 *
 * As animações param sozinhas em `prefers-reduced-motion`: a regra global do
 * index.css zera a duração. Por isso cada cena precisa dizer a mesma coisa
 * parada — nada de informação que só apareça no meio do movimento.
 */

import type { ReactNode } from "react";

const TINTA = "#27374c";
const LARANJA = "#e86a33";
const APAGADO = "#9aa2ac";
const BORDA = "#e8e2d7";
const PAPEL = "#fbfaf7";
const AREIA = "#f1ece2";

/** Fachada de casa: o desenho que repete em todas as cenas. */
function Casa({ opacidade = 1 }: { opacidade?: number }) {
  return (
    <g opacity={opacidade}>
      <path
        d="M0 18 L16 4 L32 18 L32 40 L0 40 Z"
        fill={AREIA}
        stroke={TINTA}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect
        className="lp-blink"
        x="6"
        y="22"
        width="8"
        height="8"
        rx="1.5"
        fill={LARANJA}
      />
      <rect
        className="lp-blink lp-d2"
        x="18"
        y="22"
        width="8"
        height="8"
        rx="1.5"
        fill={LARANJA}
      />
      <rect
        x="11"
        y="33"
        width="10"
        height="7"
        rx="1.5"
        fill={TINTA}
        opacity="0.18"
      />
    </g>
  );
}

/**
 * Cone de obra: o que dá o cheiro de canteiro na cena.
 *
 * O grupo de fora posiciona, o de dentro anima. A animação define `transform`
 * em CSS, que atropela o atributo `transform` do SVG — juntos no mesmo grupo,
 * o cone perde a posição e volta para o canto do desenho.
 */
function Cone({ x, y, escala }: { x: number; y: number; escala: number }) {
  return (
    <g transform={"translate(" + x + " " + y + ") scale(" + escala + ")"}>
      <g className="lp-sway">
        <path d="M10 0 L19 24 H1 Z" fill={LARANJA} />
        <path d="M6.2 12 H13.8" stroke={PAPEL} strokeWidth="3" />
        <rect
          x="0"
          y="24"
          width="20"
          height="3.4"
          rx="1.7"
          fill={TINTA}
          opacity="0.35"
        />
      </g>
    </g>
  );
}

const MENSAGENS = [
  { y: 18, largura: 120, atraso: "" },
  { y: 72, largura: 96, atraso: "lp-d2" },
  { y: 126, largura: 132, atraso: "lp-d1" },
];

/**
 * Dobra inicial: a conversa bagunçada de um lado, o cartão da obra do outro.
 *
 * É o "por que o app existe" em uma imagem — o antes e o depois que o leitor
 * reconhece do próprio dia.
 */
export function CenaAntesDepois() {
  return (
    <svg
      viewBox="0 0 440 260"
      role="img"
      aria-labelledby="cena-antes-depois-titulo"
      className="w-full"
    >
      <title id="cena-antes-depois-titulo">
        À esquerda, mensagens soltas numa conversa; à direita, a mesma
        informação organizada no cartão de uma obra.
      </title>

      {/* Antes: três mensagens tortas, cada uma com um pedaço da informação. */}
      <g>
        {MENSAGENS.map(mensagem => (
          <g key={mensagem.y} className={"lp-jiggle " + mensagem.atraso}>
            <rect
              x="14"
              y={mensagem.y}
              width={mensagem.largura}
              height="38"
              rx="12"
              fill={PAPEL}
              stroke={BORDA}
              strokeWidth="2"
            />
            <rect
              x="26"
              y={mensagem.y + 11}
              width={mensagem.largura - 40}
              height="4.5"
              rx="2.25"
              fill={APAGADO}
              opacity="0.7"
            />
            <rect
              x="26"
              y={mensagem.y + 22}
              width={mensagem.largura - 62}
              height="4.5"
              rx="2.25"
              fill={APAGADO}
              opacity="0.45"
            />
          </g>
        ))}
        {/* O rabisco de quem está rolando a conversa sem achar o endereço. */}
        <path
          d="M30 180 q16 -10 30 0 q16 10 30 0"
          stroke={APAGADO}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>

      {/* A seta que o olho segue da bagunça para o cartão. */}
      <path
        className="lp-draw"
        d="M176 104 H228"
        stroke={LARANJA}
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M222 96 L232 104 L222 112"
        stroke={LARANJA}
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Depois: o cartão da obra, com o código do portão em destaque. */}
      <g className="lp-float">
        <rect
          x="248"
          y="22"
          width="178"
          height="164"
          rx="22"
          fill={PAPEL}
          stroke={BORDA}
          strokeWidth="2.4"
        />
        <rect x="262" y="36" width="150" height="56" rx="14" fill={AREIA} />
        <g transform="translate(321 44)">
          <Casa />
        </g>
        <rect
          x="262"
          y="102"
          width="92"
          height="6"
          rx="3"
          fill={TINTA}
          opacity="0.75"
        />
        <rect
          x="262"
          y="116"
          width="62"
          height="5"
          rx="2.5"
          fill={APAGADO}
          opacity="0.7"
        />
        <rect
          x="262"
          y="136"
          width="150"
          height="36"
          rx="12"
          fill="#fff0e8"
          stroke="#f3d8c8"
          strokeWidth="1.6"
        />
        <text
          x="276"
          y="159"
          fill="#a74b29"
          fontSize="17"
          fontWeight="700"
          fontFamily="DM Mono, monospace"
          letterSpacing="3"
        >
          4821
        </text>
        <circle className="lp-blink" cx="398" cy="154" r="5" fill={LARANJA} />
      </g>

      {/* Chão de canteiro: o que amarra a cena ao mundo do leitor. */}
      <path
        d="M8 222 H432"
        stroke={TINTA}
        strokeWidth="2.4"
        opacity="0.14"
        strokeLinecap="round"
      />
      <Cone x={196} y={196} escala={1.05} />
      <g transform="translate(60 198) scale(0.75)">
        <Casa />
      </g>
      <Cone x={372} y={200} escala={0.85} />
    </svg>
  );
}

type PassoIcone = "cadastrar" | "abrir" | "marcar";

const ATRASOS = ["", "lp-d2", "lp-d4"];

/** Os três passos do "como funciona", um ícone cada. */
export function IconePasso({ tipo }: { tipo: PassoIcone }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14">
      {tipo === "cadastrar" && (
        <g>
          <rect
            x="8"
            y="10"
            width="48"
            height="44"
            rx="13"
            fill={PAPEL}
            stroke={BORDA}
            strokeWidth="2.4"
          />
          <g transform="translate(16 18)">
            <Casa />
          </g>
          <circle className="lp-pop" cx="46" cy="42" r="11" fill={LARANJA} />
          <path
            className="lp-pop"
            d="M46 36.5 V47.5 M40.5 42 H51.5"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </g>
      )}

      {tipo === "abrir" && (
        <g className="lp-float">
          <rect
            x="18"
            y="6"
            width="28"
            height="52"
            rx="9"
            fill={PAPEL}
            stroke={BORDA}
            strokeWidth="2.4"
          />
          <rect x="24" y="14" width="16" height="16" rx="5" fill={LARANJA} />
          <path
            d="M27 23 L32 18.5 L37 23 L37 28 L27 28 Z"
            fill="#ffffff"
            strokeLinejoin="round"
          />
          <rect
            x="24"
            y="36"
            width="16"
            height="4"
            rx="2"
            fill={APAGADO}
            opacity="0.6"
          />
          <rect
            x="24"
            y="44"
            width="11"
            height="4"
            rx="2"
            fill={APAGADO}
            opacity="0.4"
          />
        </g>
      )}

      {tipo === "marcar" && (
        <g>
          <rect
            x="8"
            y="10"
            width="48"
            height="44"
            rx="13"
            fill={PAPEL}
            stroke={BORDA}
            strokeWidth="2.4"
          />
          {[22, 34, 46].map((y, indice) => (
            <g key={y}>
              <rect
                x="18"
                y={y - 6}
                width="12"
                height="12"
                rx="4"
                fill={AREIA}
                stroke={BORDA}
                strokeWidth="1.6"
              />
              <path
                className={"lp-check " + ATRASOS[indice]}
                d={"M21 " + y + " l3 3 l6 -7"}
                stroke={LARANJA}
                strokeWidth="2.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="34"
                y={y - 2.5}
                width={[14, 10, 12][indice]}
                height="5"
                rx="2.5"
                fill={APAGADO}
                opacity="0.55"
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

type CenaFuncao = "codigo" | "rota" | "obra" | "offline";

/** Moldura de celular que serve de palco para as cenas de funcionalidade. */
function Celular({ children }: { children: ReactNode }) {
  return (
    <g className="lp-float">
      <rect
        x="54"
        y="8"
        width="112"
        height="176"
        rx="24"
        fill={PAPEL}
        stroke={BORDA}
        strokeWidth="2.6"
      />
      <rect x="92" y="16" width="36" height="5" rx="2.5" fill={BORDA} />
      {children}
    </g>
  );
}

const LEGENDAS: Record<CenaFuncao, string> = {
  codigo:
    "O cartão da obra no celular, com o código do portão em destaque ao lado do teclado da entrada.",
  rota: "O celular traçando a rota até o endereço da obra.",
  obra: "Tarefas sendo marcadas e fotos da obra entrando na ficha.",
  offline:
    "Sem sinal de internet, o cartão da obra continua aberto no celular.",
};

/** Uma cena por funcionalidade, sempre dentro do mesmo celular. */
export function CenaFuncionalidade({ tipo }: { tipo: CenaFuncao }) {
  return (
    <svg
      viewBox="42 0 180 196"
      role="img"
      aria-labelledby={"cena-" + tipo + "-titulo"}
      className="h-44 w-full"
    >
      <title id={"cena-" + tipo + "-titulo"}>{LEGENDAS[tipo]}</title>

      {tipo === "codigo" && (
        <>
          <Celular>
            <rect x="66" y="30" width="88" height="40" rx="11" fill={AREIA} />
            <g transform="translate(94 36)">
              <Casa />
            </g>
            <rect
              x="66"
              y="78"
              width="58"
              height="5"
              rx="2.5"
              fill={TINTA}
              opacity="0.7"
            />
            <rect
              x="66"
              y="90"
              width="40"
              height="4.5"
              rx="2.25"
              fill={APAGADO}
              opacity="0.6"
            />
            <rect
              x="66"
              y="106"
              width="88"
              height="34"
              rx="11"
              fill="#fff0e8"
              stroke="#f3d8c8"
              strokeWidth="1.6"
            />
            <text
              x="78"
              y="128"
              fill="#a74b29"
              fontSize="15"
              fontWeight="700"
              fontFamily="DM Mono, monospace"
              letterSpacing="2.5"
            >
              4821
            </text>
            <rect x="66" y="150" width="88" height="8" rx="4" fill={AREIA} />
          </Celular>
          {/* O teclado do portão aceitando o código que estava no cartão. */}
          <g transform="translate(176 62)">
            <g className="lp-jiggle">
              <rect
                x="0"
                y="0"
                width="34"
                height="46"
                rx="9"
                fill={PAPEL}
                stroke={BORDA}
                strokeWidth="2"
              />
              {[0, 1, 2].map(linha =>
                [0, 1, 2].map(coluna => (
                  <circle
                    key={linha + "-" + coluna}
                    className={
                      "lp-fade " +
                      ["", "lp-d1", "lp-d2", "lp-d3"][(linha + coluna) % 4]
                    }
                    cx={9 + coluna * 8}
                    cy={11 + linha * 11}
                    r="2.6"
                    fill={LARANJA}
                  />
                ))
              )}
            </g>
          </g>
        </>
      )}

      {tipo === "rota" && (
        <>
          <Celular>
            <rect x="66" y="30" width="88" height="110" rx="12" fill={AREIA} />
            {/* O caminho se desenha do ponto de partida até a obra. */}
            <path
              className="lp-draw"
              d="M80 128 C 80 104, 112 108, 112 84 C 112 60, 136 62, 140 46"
              stroke={LARANJA}
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="80" cy="128" r="5.5" fill={TINTA} />
            <g transform="translate(132 32)">
              <path
                d="M8 0 C12.4 0 16 3.6 16 8 C16 14 8 22 8 22 C8 22 0 14 0 8 C0 3.6 3.6 0 8 0 Z"
                fill={LARANJA}
              />
              <circle cx="8" cy="8" r="3" fill={PAPEL} />
            </g>
            <rect x="66" y="150" width="88" height="8" rx="4" fill={AREIA} />
          </Celular>
          {/* O botão de rota abrindo o mapa do celular. */}
          <g transform="translate(172 72)">
            <g className="lp-pop">
              <rect x="0" y="0" width="42" height="24" rx="9" fill={TINTA} />
              <path
                d="M11 12 h14 M21 7 l5 5 l-5 5"
                stroke="#ffffff"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </>
      )}

      {tipo === "obra" && (
        <Celular>
          {[38, 62, 86].map((y, indice) => (
            <g key={y}>
              <rect x="66" y={y} width="88" height="18" rx="7" fill={AREIA} />
              <rect
                x="72"
                y={y + 4}
                width="10"
                height="10"
                rx="3.5"
                fill={PAPEL}
                stroke={BORDA}
                strokeWidth="1.5"
              />
              <path
                className={"lp-check " + ATRASOS[indice]}
                d={"M74.5 " + (y + 9) + " l2.5 2.5 l5 -6"}
                stroke={LARANJA}
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="88"
                y={y + 6.5}
                width={[52, 38, 46][indice]}
                height="5"
                rx="2.5"
                fill={APAGADO}
                opacity="0.55"
              />
            </g>
          ))}
          {/* As fotos da obra chegando uma a uma. */}
          {[66, 96, 126].map((x, indice) => (
            <g key={x} className={"lp-pop " + ATRASOS[indice]}>
              <rect
                x={x}
                y="112"
                width="28"
                height="28"
                rx="8"
                fill={AREIA}
                stroke={BORDA}
                strokeWidth="1.6"
              />
              <g transform={"translate(" + (x + 6) + " 118) scale(0.5)"}>
                <Casa opacidade={0.45} />
              </g>
            </g>
          ))}
          <rect x="66" y="150" width="88" height="8" rx="4" fill={AREIA} />
        </Celular>
      )}

      {tipo === "offline" && (
        <>
          <Celular>
            <rect x="66" y="38" width="88" height="40" rx="11" fill={AREIA} />
            <g transform="translate(94 44)">
              <Casa />
            </g>
            <rect
              x="66"
              y="86"
              width="58"
              height="5"
              rx="2.5"
              fill={TINTA}
              opacity="0.7"
            />
            <rect
              x="66"
              y="98"
              width="40"
              height="4.5"
              rx="2.25"
              fill={APAGADO}
              opacity="0.6"
            />
            <rect
              x="66"
              y="114"
              width="88"
              height="26"
              rx="9"
              fill="#fff0e8"
              stroke="#f3d8c8"
              strokeWidth="1.6"
            />
            <text
              x="78"
              y="131"
              fill="#a74b29"
              fontSize="13"
              fontWeight="700"
              fontFamily="DM Mono, monospace"
              letterSpacing="2"
            >
              4821
            </text>
            <rect x="66" y="150" width="88" height="8" rx="4" fill={AREIA} />
          </Celular>
          {/* Sem sinal: as barras apagam, o cartão continua lá. */}
          <g transform="translate(174 50)">
            {[0, 1, 2].map(indice => (
              <rect
                key={indice}
                className={"lp-fade " + ["lp-d2", "lp-d1", ""][indice]}
                x={indice * 10}
                y={18 - indice * 7}
                width="6"
                height={6 + indice * 7}
                rx="2"
                fill={APAGADO}
              />
            ))}
            <path
              d="M-2 26 L30 -4"
              stroke={LARANJA}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>
          <g transform="translate(170 96)">
            <g className="lp-pop">
              <rect x="0" y="0" width="42" height="24" rx="9" fill={TINTA} />
              <path
                d="M12 12 l4 4 l8 -9"
                stroke="#ffffff"
                strokeWidth="2.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </>
      )}
    </svg>
  );
}
