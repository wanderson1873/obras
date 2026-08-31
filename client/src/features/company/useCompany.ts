/**
 * Empresa a que a pessoa pertence: membros, convites e papel.
 *
 * Quem não está em nenhuma empresa simplesmente não tem compartilhamento —
 * o app segue funcionando como caderno de uma pessoa só.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type {
  Company,
  CompanyInvite,
  CompanyMember,
  MemberRole,
} from "./types";

type MemberRow = {
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
    displayName: row.display_name.trim() || "Sem nome",
  };
}

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      // Convites pendentes viram participação assim que a pessoa entra.
      const { error: claimError } = await supabase.rpc("claim_invites");
      if (claimError)
        console.warn("Falha ao aceitar convites pendentes.", claimError);

      const { data: minhas, error } = await supabase
        .from("company_members")
        .select("user_id, role, display_name, companies (id, name)")
        .order("created_at")
        .limit(1);
      if (error) throw error;

      const linha = (minhas ?? [])[0] as unknown as MemberRow | undefined;
      if (!linha?.companies) {
        setCompany(null);
        return;
      }

      const [{ data: membros }, { data: convites }] = await Promise.all([
        supabase
          .from("company_members")
          .select("user_id, role, display_name")
          .eq("company_id", linha.companies.id)
          .order("created_at"),
        // O RLS devolve lista vazia para quem não é administrador.
        supabase
          .from("company_invites")
          .select("id, email, role, created_at")
          .eq("company_id", linha.companies.id)
          .is("accepted_at", null)
          .order("created_at"),
      ]);

      setCompany({
        id: linha.companies.id,
        name: linha.companies.name,
        myRole: linha.role,
        members: (membros ?? []).map(toMember),
        pendingInvites: (convites ?? []).map((c): CompanyInvite => ({
          id: c.id,
          email: c.email,
          role: c.role as MemberRole,
          createdAt: c.created_at,
        })),
      });
    } catch (caught) {
      console.error("Falha ao carregar a empresa.", caught);
      setCompany(null);
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
    async (email: string, role: MemberRole) => {
      if (!company) throw new Error("Crie a empresa antes de convidar alguém.");
      const { error } = await supabase.from("company_invites").insert({
        company_id: company.id,
        email: email.trim().toLowerCase(),
        role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) {
        // Chave única no par (empresa, e-mail): convite repetido cai aqui.
        if (error.code === "23505")
          throw new Error("Esse e-mail já foi convidado.");
        throw error;
      }
      await load();
    },
    [company, load]
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
    async (userId: string) => {
      if (!company) return;
      const { error } = await supabase
        .from("company_members")
        .delete()
        .eq("company_id", company.id)
        .eq("user_id", userId);
      if (error) throw error;
      await load();
      toast.success("Pessoa removida da equipe", {
        description: "As obras que ela criou continuam com ela.",
      });
    },
    [company, load]
  );

  return {
    company,
    loading,
    refresh: load,
    createCompany,
    invite,
    cancelInvite,
    removeMember,
  };
}
