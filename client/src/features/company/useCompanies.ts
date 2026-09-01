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
import type {
  Company,
  CompanyInvite,
  CompanyMember,
  MemberRole,
} from "./types";

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
      // Convite pendente vira participação assim que a pessoa entra no app.
      const { error: erroConvites } = await supabase.rpc("claim_invites");
      if (erroConvites)
        console.warn("Falha ao aceitar convites pendentes.", erroConvites);

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

      const [{ data: todosMembros }, { data: convites }] = await Promise.all([
        supabase
          .from("company_members")
          .select("company_id, user_id, role, display_name")
          .in("company_id", ids)
          .order("created_at"),
        // O RLS devolve só os convites das organizações onde a pessoa é administradora.
        supabase
          .from("company_invites")
          .select("id, company_id, email, role, created_at")
          .in("company_id", ids)
          .is("accepted_at", null)
          .order("created_at"),
      ]);

      setCompanies(
        comEmpresa.map(linha => ({
          id: linha.companies!.id,
          name: linha.companies!.name,
          myRole: linha.role,
          members: (todosMembros ?? [])
            .filter(m => m.company_id === linha.companies!.id)
            .map(toMember),
          pendingInvites: (convites ?? [])
            .filter(c => c.company_id === linha.companies!.id)
            .map((c): CompanyInvite => ({
              id: c.id,
              email: c.email,
              role: c.role as MemberRole,
              createdAt: c.created_at,
            })),
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

  const invite = useCallback(
    async (companyId: string, email: string, role: MemberRole) => {
      const { error } = await supabase.from("company_invites").insert({
        company_id: companyId,
        email: email.trim().toLowerCase(),
        role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) {
        // Chave única no par (organização, e-mail): convite repetido cai aqui.
        if (error.code === "23505") throw new Error(t("team.inviteDuplicate"));
        throw error;
      }
      await load();
    },
    [load, t]
  );

  const cancelInvite = useCallback(
    async (inviteId: string) => {
      const { error } = await supabase
        .from("company_invites")
        .delete()
        .eq("id", inviteId);
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
    invite,
    cancelInvite,
    removeMember,
    leave,
  };
}
