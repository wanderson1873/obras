/** Modelo de dados de uma obra. Datas são sempre ISO (YYYY-MM-DD), como no Postgres. */

export type WorkStatus = "active" | "completed";

/** Quem enxerga a obra além de quem a criou. */
export type ShareScope = "private" | "selected" | "company";

export type Task = {
  id: string;
  label: string;
  done: boolean;
};

export type Update = {
  id: string;
  /** ISO YYYY-MM-DD */
  date: string;
  text: string;
};

export type HistoryEntry = {
  id: string;
  /** ISO YYYY-MM-DD */
  date: string;
  title: string;
};

/**
 * Foto de fachada. `path` é o caminho no bucket privado do Storage e é o que
 * fica salvo; `url` é um link assinado temporário, só para exibir na tela.
 */
export type Photo = {
  id: string;
  path: string;
  url: string;
};

export type Work = {
  id: string;
  /** Quem criou. Só essa pessoa apaga a obra e muda o compartilhamento. */
  ownerId: string;
  companyId: string | null;
  shareScope: ShareScope;
  /** Ids de quem recebeu a obra. Só vem preenchido para quem criou. */
  sharedWith: string[];
  street: string;
  city: string;
  zip: string;
  /** Código do portão / lockbox. Opcional. */
  code: string;
  service: string;
  description: string;
  observations: string;
  waterAvailable: boolean;
  powerAvailable: boolean;
  /** ISO YYYY-MM-DD */
  startDate: string;
  status: WorkStatus;
  /** Ordem manual dentro do grupo (em andamento / concluídas). Menor vem primeiro. */
  position: number;
  /** ISO YYYY-MM-DD, presente apenas quando status === "completed" */
  completedAt?: string;
  /** A primeira foto é a capa da ficha. */
  photos: Photo[];
  tasks: Task[];
  updates: Update[];
  history: HistoryEntry[];
};

/** Campos editáveis pelo formulário de criação/edição. */
export type WorkInput = Pick<
  Work,
  | "street"
  | "city"
  | "zip"
  | "code"
  | "service"
  | "description"
  | "observations"
  | "waterAvailable"
  | "powerAvailable"
  | "startDate"
>;
