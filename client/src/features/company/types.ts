/** Empresa, membros e convites. */

export type MemberRole = "admin" | "member";

export type CompanyMember = {
  userId: string;
  role: MemberRole;
  /** Nome curto que aparece na lista de com quem compartilhar. */
  displayName: string;
};

export type CompanyInvite = {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string;
  /** Papel de quem está usando o app agora. */
  myRole: MemberRole;
  members: CompanyMember[];
  /** Convites ainda não aceitos. Só o administrador enxerga. */
  pendingInvites: CompanyInvite[];
};
