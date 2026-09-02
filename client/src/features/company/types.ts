/** Empresa, membros e convites. */

export type MemberRole = "admin" | "member";

export type CompanyMember = {
  userId: string;
  role: MemberRole;
  /** Nome curto que aparece na lista de com quem compartilhar. */
  displayName: string;
};

/** Link de convite válido da organização. Nulo quando não há nenhum ativo. */
export type InviteLink = {
  token: string;
  expiresAt: string;
};

export type Company = {
  id: string;
  name: string;
  /** Quem criou. Essa pessoa não sai da organização — só apaga. */
  createdBy: string;
  /** Papel de quem está usando o app agora. */
  myRole: MemberRole;
  members: CompanyMember[];
  /** Link de convite ativo. Só o administrador enxerga. */
  inviteLink: InviteLink | null;
};
