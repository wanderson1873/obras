/**
 * Avisos do que os colegas mexeram nas fichas da organização.
 *
 * O que é "novo" sai de uma marca só por pessoa — a hora em que ela abriu a
 * lista pela última vez. Mais barato do que guardar lido/não lido por aviso, e
 * numa equipe de três pessoas dá no mesmo.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthContext";

export type ActivityKind = "created" | "updated" | "completed" | "reopened";

export type Activity = {
  id: string;
  workId: string | null;
  actorId: string;
  actorName: string;
  workStreet: string;
  kind: ActivityKind;
  createdAt: string;
  /** Chegou depois da última vez que a pessoa abriu a lista. */
  unseen: boolean;
};

/** Quantos avisos carregar. Passado distante não ajuda quem está indo à obra. */
const LIMITE = 40;

export function useActivity() {
  const { session } = useAuth();
  const meuId = session?.user.id;
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!meuId) return;
    try {
      const [{ data: avisos, error }, { data: marca }] = await Promise.all([
        supabase
          .from("work_activity")
          .select(
            "id, work_id, actor_id, actor_name, work_street, kind, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(LIMITE),
        supabase
          .from("activity_reads")
          .select("last_seen_at")
          .eq("user_id", meuId)
          .maybeSingle(),
      ]);
      if (error) throw error;

      /*
       * Quem nunca abriu a lista ainda não viu nada, então tudo conta como
       * novo. O limite de avisos carregados já segura o tamanho disso.
       */
      const visto = marca?.last_seen_at ?? null;

      setItems(
        (avisos ?? []).map(linha => ({
          id: linha.id,
          workId: linha.work_id,
          actorId: linha.actor_id,
          actorName: linha.actor_name,
          workStreet: linha.work_street,
          kind: linha.kind as ActivityKind,
          createdAt: linha.created_at,
          // O que eu mesmo fiz nunca é novidade para mim.
          unseen:
            linha.actor_id !== meuId &&
            (visto === null || linha.created_at > visto),
        }))
      );
    } catch (caught) {
      console.error("Falha ao carregar os avisos.", caught);
    } finally {
      setLoading(false);
    }
  }, [meuId]);

  useEffect(() => {
    void load();
  }, [load]);

  /*
   * O app fica aberto no bolso o dia inteiro. Recarregar quando ele volta ao
   * primeiro plano é o que faz o aviso aparecer sem ninguém puxar nada.
   */
  useEffect(() => {
    const aoVoltar = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", aoVoltar);
    return () => {
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
    };
  }, [load]);

  const unseenCount = items.filter(item => item.unseen).length;

  /** Marca tudo como visto. Some o contador, a lista continua. */
  const markSeen = useCallback(async () => {
    if (!meuId || unseenCount === 0) return;
    setItems(atuais => atuais.map(item => ({ ...item, unseen: false })));
    const { error } = await supabase.from("activity_reads").upsert({
      user_id: meuId,
      last_seen_at: new Date().toISOString(),
    });
    if (error) console.error("Falha ao marcar os avisos como vistos.", error);
  }, [meuId, unseenCount]);

  return { items, loading, unseenCount, markSeen, refresh: load };
}
