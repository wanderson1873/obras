/**
 * Perfil: o apelido pelo qual os colegas encontram a pessoa.
 *
 * O banco cria um apelido sozinho quando a conta nasce, então nunca existe
 * alguém sem apelido — mas dá para trocar por um melhor.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { useT } from "@/i18n/I18nContext";

/** Mesma regra do banco, conferida aqui para o erro chegar antes da viagem. */
const FORMATO = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

export function isNicknameValid(nickname: string) {
  return FORMATO.test(nickname.trim());
}

export function useProfile() {
  const t = useT();
  const { session } = useAuth();
  const meuId = session?.user.id;
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!meuId) return;
    try {
      /*
       * Filtrar pelo meu id é obrigatório, não enfeite: quem participa de uma
       * organização também enxerga o perfil dos colegas, então sem isso a
       * consulta volta com várias linhas e o apelido some da tela.
       */
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("user_id", meuId)
        .maybeSingle();
      if (error) throw error;
      setNickname(data?.nickname ?? null);
    } catch (caught) {
      console.error("Falha ao carregar o perfil.", caught);
    } finally {
      setLoading(false);
    }
  }, [meuId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (novo: string) => {
      const limpo = novo.trim();
      if (!isNicknameValid(limpo))
        throw new Error(t("account.nicknameInvalid"));

      if (!meuId) throw new Error(t("account.expired"));

      const { error } = await supabase.from("profiles").upsert({
        user_id: meuId,
        nickname: limpo,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        // Índice único no apelido em minúsculas.
        if (error.code === "23505") throw new Error(t("account.nicknameTaken"));
        // A mesma regra existe como constraint no banco.
        if (error.code === "23514")
          throw new Error(t("account.nicknameInvalid"));
        throw error;
      }
      setNickname(limpo);
    },
    [t, meuId]
  );

  return { nickname, loading, save, refresh: load };
}
