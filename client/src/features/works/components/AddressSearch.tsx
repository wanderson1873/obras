/**
 * Busca de endereço com sugestões enquanto se digita.
 *
 * A chave do Google fica no servidor, então quem consulta é uma função do
 * Supabase. Se ela não estiver disponível, o campo some e o formulário segue
 * funcionando na digitação à mão — endereço errado por falta de sugestão é
 * pior do que sugestão nenhuma.
 */

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useT } from "@/i18n/I18nContext";

export type AddressParts = {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  /** Endereço inteiro numa linha, só para confirmar o que foi escolhido. */
  formatted: string;
};

type Sugestao = { placeId: string; principal: string; secundario: string };

/** Espera a pessoa parar de digitar: uma consulta por tecla seria desperdício. */
const ESPERA_MS = 350;

export function AddressSearch({
  onPick,
}: {
  onPick: (address: AddressParts) => void;
}) {
  const t = useT();
  const [texto, setTexto] = useState("");
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [indisponivel, setIndisponivel] = useState(false);
  const [buscouAlgo, setBuscouAlgo] = useState(false);

  /**
   * O Google cobra a sessão inteira como uma consulta só. O token nasce quando
   * a pessoa começa a digitar e morre quando ela escolhe um endereço.
   */
  const sessao = useRef(crypto.randomUUID());

  useEffect(() => {
    const consulta = texto.trim();
    if (consulta.length < 3) {
      setSugestoes([]);
      setBuscouAlgo(false);
      return;
    }

    let cancelado = false;
    const relogio = setTimeout(async () => {
      setBuscando(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "address-lookup",
          {
            body: {
              action: "suggest",
              query: consulta,
              sessionToken: sessao.current,
            },
          }
        );
        if (cancelado) return;
        if (error) throw error;
        setSugestoes(data?.suggestions ?? []);
        setBuscouAlgo(true);
      } catch (erro) {
        if (cancelado) return;
        console.warn("Busca de endereço indisponível.", erro);
        setIndisponivel(true);
        setSugestoes([]);
      } finally {
        if (!cancelado) setBuscando(false);
      }
    }, ESPERA_MS);

    return () => {
      cancelado = true;
      clearTimeout(relogio);
    };
  }, [texto]);

  async function escolher(sugestao: Sugestao) {
    setBuscando(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "address-lookup",
        {
          body: {
            action: "details",
            placeId: sugestao.placeId,
            sessionToken: sessao.current,
          },
        }
      );
      if (error) throw error;
      if (data?.address) onPick(data.address);
      setTexto("");
      setSugestoes([]);
      setBuscouAlgo(false);
      // Endereço escolhido encerra a sessão de cobrança; a próxima começa outra.
      sessao.current = crypto.randomUUID();
    } catch (erro) {
      console.warn("Não foi possível ler o endereço escolhido.", erro);
      setIndisponivel(true);
    } finally {
      setBuscando(false);
    }
  }

  // Sem o serviço, o campo de busca só atrapalharia.
  if (indisponivel) return null;

  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
          {t("form.addressSearch")}
        </span>
        <span className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7e8794]"
            size={16}
          />
          <input
            value={texto}
            onChange={event => setTexto(event.target.value)}
            placeholder={t("form.addressSearchPlaceholder")}
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-[#e4ded3] bg-white pl-9 pr-9 text-sm outline-none transition focus:border-[#e86a33]"
          />
          {buscando && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#b3bac3]"
              size={16}
            />
          )}
        </span>
      </label>

      {sugestoes.length > 0 && (
        <ul className="mt-1.5 overflow-hidden rounded-xl border border-[#eae4da] bg-white">
          {sugestoes.map((sugestao, index) => (
            <li key={sugestao.placeId}>
              <button
                type="button"
                onClick={() => void escolher(sugestao)}
                className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition active:bg-[#f8f5ef] ${index < sugestoes.length - 1 ? "border-b border-[#f1ece3]" : ""}`}
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#e86a33]" />
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-[#354357]">
                    {sugestao.principal}
                  </span>
                  <span className="block truncate text-[11px] text-[#8a929d]">
                    {sugestao.secundario}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {buscouAlgo && !buscando && sugestoes.length === 0 && (
        <p className="mt-1.5 text-[11px] leading-4 text-[#8a929d]">
          {t("form.noSuggestions")}
        </p>
      )}
    </div>
  );
}
