/**
 * Perfil: nome, sobrenome, apelido e telefone.
 *
 * O banco cria um apelido sozinho quando a conta nasce, para nunca existir
 * alguém sem apelido. O resto é a pessoa quem preenche, na tela de cadastro
 * que aparece logo depois de criar a conta.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useT } from "@/i18n/I18nContext";
import { useAuth } from "./AuthContext";

/** Mesma regra do banco, conferida aqui para o erro chegar antes da viagem. */
const FORMATO = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

export function isNicknameValid(nickname: string) {
  return FORMATO.test(nickname.trim());
}

export type Profile = {
  firstName: string;
  lastName: string;
  nickname: string;
  /** Opcional: vazio é um valor legítimo, não um campo por preencher. */
  phone: string;
};

const VAZIO: Profile = {
  firstName: "",
  lastName: "",
  nickname: "",
  phone: "",
};

/** O cadastro está completo quando dá para chamar a pessoa pelo nome. */
export function isProfileComplete(profile: Profile | null) {
  return Boolean(
    profile && profile.firstName.trim() && profile.nickname.trim()
  );
}

export function useProfile() {
  const t = useT();
  const { session } = useAuth();
  const meuId = session?.user.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!meuId) return;
    setFailed(false);
    try {
      /*
       * Filtrar pelo meu id é obrigatório, não enfeite: quem participa de uma
       * organização também enxerga o perfil dos colegas, então sem isso a
       * consulta volta com várias linhas e o cadastro some da tela.
       */
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, nickname, phone")
        .eq("user_id", meuId)
        .maybeSingle();
      if (error) throw error;

      setProfile(
        data
          ? {
              firstName: data.first_name ?? "",
              lastName: data.last_name ?? "",
              nickname: data.nickname ?? "",
              phone: data.phone ?? "",
            }
          : VAZIO
      );
    } catch (caught) {
      console.error("Falha ao carregar o perfil.", caught);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [meuId]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Grava o cadastro. Serve tanto para o primeiro preenchimento quanto para
   * qualquer alteração depois — é a mesma linha, com a mesma checagem.
   */
  const save = useCallback(
    async (mudanca: Partial<Profile>) => {
      if (!meuId) throw new Error(t("account.expired"));

      const proximo: Profile = { ...(profile ?? VAZIO), ...mudanca };
      const nome = proximo.firstName.trim();
      const sobrenome = proximo.lastName.trim();
      const apelido = proximo.nickname.trim();
      const telefone = proximo.phone.trim();

      if (!nome) throw new Error(t("profile.firstNameRequired"));
      if (!isNicknameValid(apelido))
        throw new Error(t("account.nicknameInvalid"));

      const { error } = await supabase.from("profiles").upsert({
        user_id: meuId,
        first_name: nome,
        last_name: sobrenome,
        nickname: apelido,
        phone: telefone,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        // Índice único no apelido em minúsculas.
        if (error.code === "23505") throw new Error(t("account.nicknameTaken"));
        // As mesmas regras existem como constraint no banco.
        if (error.code === "23514")
          throw new Error(t("account.nicknameInvalid"));
        throw error;
      }

      setProfile({
        firstName: nome,
        lastName: sobrenome,
        nickname: apelido,
        phone: telefone,
      });
    },
    [meuId, profile, t]
  );

  /**
   * Apaga o telefone. É o único campo que pode ficar em branco — nome e
   * apelido a pessoa é quem troca, mas some do cadastro não somem: sem eles
   * os colegas não teriam como reconhecê-la nem adicioná-la.
   */
  const clearPhone = useCallback(() => save({ phone: "" }), [save]);

  return {
    profile,
    /** Atalho para o que quase todo mundo quer ler. */
    nickname: profile?.nickname ?? null,
    complete: isProfileComplete(profile),
    loading,
    failed,
    save,
    clearPhone,
    refresh: load,
  };
}
