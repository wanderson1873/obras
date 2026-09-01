/**
 * Organizações de que a pessoa participa.
 *
 * Uma pessoa pode criar várias e ser convidada para várias outras. Quem não
 * participa de nenhuma segue usando o app como caderno de uma pessoa só.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useT } from "@/i18n/I18nContext";
import type { Company, CompanyMember, MemberRole } from "./types";

type LinhaMembro = {
  company_id: string;
  user_id: string;
  role: MemberRole;
  display_name: string;
  companies: { id: string; name: string } | null;
};

function toMember(row: {
  user_id: string;
  role: MemberRole;
  display_name: string;
}): CompanyMember {
  return {
    userId: row.user_id,
    role: row.role,
    displayName: row.display_name.trim() || "—",
  };
}

export function useCompanies() {
  const t = useT();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: minhas, error } = await supabase
        .from("company_members")
        .select("company_id, user_id, role, display_name, companies (id, name)")
        .order("created_at");
      if (error) throw error;

      const linhas = (minhas ?? []) as unknown as LinhaMembro[];
      const comEmpresa = linhas.filter(l => l.companies);
      if (comEmpresa.length === 0) {
        setCompanies([]);
        return;
      }

      const ids = comEmpresa.map(l => l.companies!.id);

      const [{ data: todosMembros }, { data: links }] = await Promise.all([
        supabase
          .from("company_members")
          .select("company_id, user_id, role, display_name")
          .in("company_id", ids)
          .order("created_at"),
        // O RLS devolve só os links das organizações onde a pessoa é administradora.
        supabase
          .from("company_invite_links")
          .select("company_id, token, expires_at")
          .in("company_id", ids)
          .is("revoked_at", null)
          .gt("expires_at", new Date().toISOString()),
      ]);

      setCompanies(
        comEmpresa.map(linha => ({
          id: linha.companies!.id,
          name: linha.companies!.name,
          myRole: linha.role,
          members: (todosMembros ?? [])
            .filter(m => m.company_id === linha.companies!.id)
            .map(toMember),
          inviteLink: (() => {
            const link = (links ?? []).find(
              l => l.company_id === linha.companies!.id
            );
            return link
              ? { token: link.token, expiresAt: link.expires_at }
              : null;
          })(),
        }))
      );
    } catch (caught) {
      console.error("Falha ao carregar as organizações.", caught);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createCompany = useCallback(
    async (name: string) => {
      const { error } = await supabase.rpc("create_company", {
        company_name: name,
      });
      if (error) throw error;
      await load();
    },
    [load]
  );

  /** Adiciona alguém que já tem conta, pelo apelido. */
  const addByNickname = useCallback(
    async (companyId: string, nickname: string) => {
      const { data, error } = await supabase.rpc("add_member_by_nickname", {
        p_company_id: companyId,
        p_nickname: nickname.trim(),
      });
      if (error) throw new Error(error.message);
      await load();
      const linha = Array.isArray(data) ? data[0] : data;
      return {
        nickname: linha?.nickname ?? nickname,
        alreadyMember: Boolean(linha?.already_member),
      };
    },
    [load]
  );

  /** Gera um link novo, invalidando o anterior da mesma organização. */
  const createInviteLink = useCallback(
    async (companyId: string) => {
      const { error } = await supabase.rpc("create_invite_link", {
        p_company_id: companyId,
      });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const revokeInviteLink = useCallback(
    async (companyId: string) => {
      const { error } = await supabase.rpc("revoke_invite_link", {
        p_company_id: companyId,
      });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const removeMember = useCallback(
    async (companyId: string, userId: string) => {
      const { error } = await supabase
        .from("company_members")
        .delete()
        .eq("company_id", companyId)
        .eq("user_id", userId);
      if (error) throw error;
      await load();
      toast.success(t("team.removed"), { description: t("team.removedHint") });
    },
    [load, t]
  );

  /** Sair por conta própria. As fichas que a pessoa criou continuam dela. */
  const leave = useCallback(
    async (companyId: string) => {
      const meuId = (await supabase.auth.getUser()).data.user?.id;
      if (!meuId) return;
      const { error } = await supabase
        .from("company_members")
        .delete()
        .eq("company_id", companyId)
        .eq("user_id", meuId);
      if (error) throw error;
      await load();
    },
    [load]
  );

  return {
    companies,
    loading,
    refresh: load,
    createCompany,
    addByNickname,
    createInviteLink,
    revokeInviteLink,
    removeMember,
    leave,
  };
}
