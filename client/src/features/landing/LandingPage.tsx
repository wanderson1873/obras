/**
 * Landing do visitante.
 *
 * Quem abre obras.derson.cloud sem conta via só uma tela de login e ia embora
 * sem saber o que o app faz. Esta página responde isso em três segundos, pela
 * ilustração antes do texto: a conversa bagunçada de um lado, o cartão da obra
 * do outro.
 *
 * Texto curto é regra, não estilo: a ilustração explica, o texto só rotula.
 * Quem já tem sessão nunca vê esta tela, e o app instalado também não — o
 * App.tsx manda os dois direto para dentro.
 */

import { useState } from "react";
import {
  Download,
  House,
  MoreVertical,
  Share,
  SquarePlus,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useT } from "@/i18n/I18nContext";
import { LanguagePicker } from "@/i18n/LanguagePicker";
import type { TranslationKey } from "@/i18n/translations";
import { usePwaInstall } from "@/features/pwa/usePwaInstall";
import {
  CenaAntesDepois,
  CenaFuncionalidade,
  IconePasso,
} from "./illustrations";

type Props = {
  /** Abre a tela de entrada em modo de criar conta. */
  onCreateAccount: () => void;
  /** Abre a tela de entrada em modo de entrar. */
  onSignIn: () => void;
};

const PASSOS = [
  {
    tipo: "cadastrar",
    titulo: "landing.step1.title",
    texto: "landing.step1.body",
  },
  { tipo: "abrir", titulo: "landing.step2.title", texto: "landing.step2.body" },
  {
    tipo: "marcar",
    titulo: "landing.step3.title",
    texto: "landing.step3.body",
  },
] as const;

const FUNCIONALIDADES = [
  {
    tipo: "codigo",
    titulo: "landing.feat1.title",
    texto: "landing.feat1.body",
  },
  { tipo: "rota", titulo: "landing.feat2.title", texto: "landing.feat2.body" },
  { tipo: "obra", titulo: "landing.feat3.title", texto: "landing.feat3.body" },
  {
    tipo: "offline",
    titulo: "landing.feat4.title",
    texto: "landing.feat4.body",
  },
] as const;

const PASSOS_ANDROID: { icone: typeof MoreVertical; texto: TranslationKey }[] =
  [
    { icone: MoreVertical, texto: "landing.android.step1" },
    { icone: Download, texto: "landing.android.step2" },
    { icone: House, texto: "landing.android.step3" },
  ];

const PASSOS_IPHONE: { icone: typeof Share; texto: TranslationKey }[] = [
  { icone: Share, texto: "pwa.iosStep1" },
  { icone: SquarePlus, texto: "pwa.iosStep2" },
  { icone: House, texto: "landing.ios.step3" },
];

/** Título de seção, no mesmo desenho em todas elas. */
function TituloSecao({
  sobrescrito,
  titulo,
}: {
  sobrescrito: string;
  titulo: string;
}) {
  return (
    <header className="mb-8 text-center">
      <span className="font-mono-field text-[10px] uppercase tracking-[0.18em] text-[#a7502b]">
        {sobrescrito}
      </span>
      <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#27374c] sm:text-[28px]">
        {titulo}
      </h2>
    </header>
  );
}

export function LandingPage({ onCreateAccount, onSignIn }: Props) {
  const t = useT();
  const { ios, canInstall, install } = usePwaInstall();
  // Abre já na aba do aparelho de quem está lendo: a pessoa não precisa saber
  // que sistema tem para achar o caminho certo.
  const [aba, setAba] = useState<"android" | "ios">(ios ? "ios" : "android");

  const passosDaAba = aba === "ios" ? PASSOS_IPHONE : PASSOS_ANDROID;

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#27374c]">
      {/* Barra de topo: a saída para quem já tem conta fica sempre à mão. */}
      <header className="mx-auto flex max-w-[1080px] items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#e86a33] shadow-[0_7px_15px_rgba(232,106,51,0.25)]"
            aria-hidden="true"
          >
            <House size={20} strokeWidth={2.4} className="text-white" />
          </span>
          <span className="text-[21px] font-bold leading-none tracking-[-0.045em]">
            Obras
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quem chega com o celular noutro idioma precisa poder trocar aqui:
              o seletor de Conta fica atrás do login. */}
          <LanguagePicker />
          <button
            onClick={onSignIn}
            className="h-10 rounded-xl px-3.5 text-[13px] font-bold text-[#526073] transition active:scale-95"
          >
            {t("auth.signIn")}
          </button>
        </div>
      </header>

      <main>
        {/* 1. Dobra inicial: a cena explica antes de qualquer frase. */}
        <section className="mx-auto max-w-[1080px] px-4 pb-16 pt-4 sm:pt-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="lp-rise text-center lg:text-left">
              <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.05em] sm:text-[42px]">
                {t("landing.hero.title")}
              </h1>
              <p className="mx-auto mt-4 max-w-[420px] text-[15px] leading-7 text-[#647084] lg:mx-0">
                {t("landing.hero.body")}
              </p>
              <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <button
                  onClick={onCreateAccount}
                  className="flex min-h-[52px] items-center justify-center rounded-2xl bg-[#27374c] px-6 text-sm font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98]"
                >
                  {t("landing.hero.cta")}
                </button>
                <button
                  onClick={onSignIn}
                  className="flex min-h-[52px] items-center justify-center rounded-2xl border border-[#e0d9cd] bg-[#fbfaf7] px-6 text-sm font-bold text-[#526073] transition active:scale-[0.98]"
                >
                  {t("auth.signIn")}
                </button>
              </div>
            </div>

            <div className="lp-rise lp-d1">
              <div className="mb-3 flex items-center justify-between px-1 font-mono-field text-[10px] uppercase tracking-[0.16em] text-[#9aa2ac]">
                <span>{t("landing.before")}</span>
                <span className="text-[#a7502b]">{t("landing.after")}</span>
              </div>
              <CenaAntesDepois />
            </div>
          </div>
        </section>

        {/* 2. Como funciona, em três passos. */}
        <section className="border-y border-[#e8e2d7] bg-[#fbfaf7] py-16">
          <div className="mx-auto max-w-[1080px] px-4">
            <TituloSecao
              sobrescrito={t("landing.how.eyebrow")}
              titulo={t("landing.how.title")}
            />
            <ol className="grid gap-8 sm:grid-cols-3">
              {PASSOS.map((passo, indice) => (
                <li key={passo.tipo} className="text-center">
                  <div className="mx-auto flex items-center justify-center gap-2">
                    <span className="font-mono-field text-[13px] font-medium text-[#c2b8a7]">
                      {indice + 1}
                    </span>
                    <IconePasso tipo={passo.tipo} />
                  </div>
                  <h3 className="mt-3 text-[16px] font-bold tracking-[-0.03em]">
                    {t(passo.titulo)}
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-[240px] text-[13.5px] leading-6 text-[#647084]">
                    {t(passo.texto)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. Uma cena animada por funcionalidade. */}
        <section className="py-16">
          <div className="mx-auto max-w-[1080px] px-4">
            <TituloSecao
              sobrescrito={t("landing.feat.eyebrow")}
              titulo={t("landing.feat.title")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              {FUNCIONALIDADES.map(funcao => (
                <article
                  key={funcao.tipo}
                  className="rounded-[28px] border border-[#e8e2d7] bg-[#fbfaf7] p-5 shadow-[0_14px_40px_rgba(39,55,76,0.06)]"
                >
                  <CenaFuncionalidade tipo={funcao.tipo} />
                  <h3 className="mt-3 text-[17px] font-bold tracking-[-0.035em]">
                    {t(funcao.titulo)}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-[#647084]">
                    {t(funcao.texto)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Equipe e 5. privacidade: curtas, só respondem a dúvida que vem a seguir. */}
        <section className="border-y border-[#e8e2d7] bg-[#fbfaf7] py-12">
          <div className="mx-auto grid max-w-[1080px] gap-5 px-4 sm:grid-cols-2">
            {[
              {
                Icone: Users,
                titulo: "landing.team.title",
                texto: "landing.team.body",
              },
              {
                Icone: ShieldCheck,
                titulo: "landing.privacy.title",
                texto: "landing.privacy.body",
              },
            ].map(item => (
              <div key={item.titulo} className="flex items-start gap-3.5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#fff0e8] text-[#a74b29]"
                  aria-hidden="true"
                >
                  <item.Icone size={20} />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold tracking-[-0.03em]">
                    {t(item.titulo as TranslationKey)}
                  </h3>
                  <p className="mt-1 text-[13.5px] leading-6 text-[#647084]">
                    {t(item.texto as TranslationKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Instalar no celular, com a aba do aparelho já aberta. */}
        <section className="py-16">
          <div className="mx-auto max-w-[620px] px-4">
            <TituloSecao
              sobrescrito={t("landing.install.eyebrow")}
              titulo={t("landing.install.title")}
            />

            <div
              role="tablist"
              aria-label={t("landing.install.title")}
              className="mx-auto mb-6 flex w-full max-w-[280px] rounded-2xl border border-[#e8e2d7] bg-[#fbfaf7] p-1"
            >
              {(["android", "ios"] as const).map(opcao => (
                <button
                  key={opcao}
                  role="tab"
                  aria-selected={aba === opcao}
                  onClick={() => setAba(opcao)}
                  className={
                    "h-10 flex-1 rounded-xl text-[13px] font-bold transition " +
                    (aba === opcao
                      ? "bg-[#27374c] text-white"
                      : "text-[#6d7889]")
                  }
                >
                  {opcao === "android" ? "Android" : "iPhone"}
                </button>
              ))}
            </div>

            <ol className="space-y-3">
              {passosDaAba.map((passo, indice) => (
                <li
                  key={passo.texto}
                  className="flex items-center gap-3.5 rounded-2xl border border-[#e8e2d7] bg-[#fbfaf7] px-4 py-3.5"
                >
                  <span className="font-mono-field text-[13px] font-medium text-[#c2b8a7]">
                    {indice + 1}
                  </span>
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-[#a74b29]"
                    aria-hidden="true"
                  >
                    <passo.icone size={18} />
                  </span>
                  <p className="text-[13.5px] leading-6 text-[#4f5c6e]">
                    {t(passo.texto)}
                  </p>
                </li>
              ))}
            </ol>

            {/* No Android o navegador deixa instalar de verdade; quando deixa,
                o botão vale mais do que os três passos acima. */}
            {aba === "android" && canInstall && (
              <button
                onClick={() => void install()}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#e86a33] text-sm font-bold text-white shadow-[0_8px_18px_rgba(232,106,51,0.25)] transition active:scale-[0.98]"
              >
                <Download size={17} />
                {t("pwa.install")}
              </button>
            )}
          </div>
        </section>

        {/* Fechamento: o mesmo pedido da dobra inicial, para quem rolou até aqui. */}
        <section className="border-t border-[#e8e2d7] bg-[#fbfaf7] py-14">
          <div className="mx-auto max-w-[520px] px-4 text-center">
            <h2 className="text-[24px] font-bold leading-tight tracking-[-0.04em] sm:text-[28px]">
              {t("landing.final.title")}
            </h2>
            <button
              onClick={onCreateAccount}
              className="mx-auto mt-6 flex min-h-[52px] w-full max-w-[280px] items-center justify-center rounded-2xl bg-[#27374c] px-6 text-sm font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98]"
            >
              {t("landing.hero.cta")}
            </button>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1080px] px-4 py-10 text-center">
        <p className="text-[13px] font-semibold text-[#6d7889]">
          {t("landing.footer.by")}
        </p>
        <nav className="mt-2.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-semibold text-[#a7502b]">
          <a
            href="https://derson.cloud"
            target="_blank"
            rel="noreferrer noopener"
          >
            derson.cloud
          </a>
          <a
            href="https://wa.me/17816664150"
            target="_blank"
            rel="noreferrer noopener"
          >
            WhatsApp
          </a>
          <a href="mailto:wanderson1873@gmail.com">E-mail</a>
        </nav>
      </footer>
    </div>
  );
}
