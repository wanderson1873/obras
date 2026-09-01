/**
 * Perfil: o apelido pelo qual os colegas encontram a pessoa.
 *
 * O banco cria um apelido sozinho quando a conta nasce, então nunca existe
 * alguém sem apelido — mas dá para trocar por um melhor.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useT } from "@/i18n/I18nContext";

/** Mesma regra do banco, conferida aqui para o erro chegar antes da viagem. */
const FORMATO = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

export function isNicknameValid(nickname: string) {
  return FORMATO.test(nickname.trim());
}

export function useProfile() {
  const t = useT();
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname")
        .maybeSingle();
      if (error) throw error;
      setNickname(data?.nickname ?? null);
    } catch (caught) {
      console.error("Falha ao carregar o perfil.", caught);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (novo: string) => {
      const limpo = novo.trim();
      if (!isNicknameValid(limpo))
        throw new Error(t("account.nicknameInvalid"));

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error(t("account.expired"));

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: userId,
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
    [t]
  );

  return { nickname, loading, save, refresh: load };
}
