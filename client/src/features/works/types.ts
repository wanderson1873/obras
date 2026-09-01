/** Modelo de dados de uma obra. Datas são sempre ISO (YYYY-MM-DD), como no Postgres. */

export type WorkStatus = "active" | "completed";

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
  /**
   * Preenchido quando a linha foi escrita pelo próprio app. Nesse caso o texto
   * sai do dicionário da interface, não do tradutor automático.
   */
  systemKey?: string;
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

/** O que o tradutor devolveu para o idioma de quem está lendo. */
export type Translation = {
  service?: string;
  description?: string;
  observations?: string;
  /** id da tarefa -> rótulo traduzido */
  tasks: Record<string, string>;
  /** id da atualização -> texto traduzido */
  updates: Record<string, string>;
};

export type Work = {
  id: string;
  /** Quem criou. Só essa pessoa apaga a ficha e muda a organização dela. */
  ownerId: string;
  /**
   * Nulo = ficha privada, só de quem criou. Preenchido = todo mundo dessa
   * organização vê, edita e conclui.
   */
  companyId: string | null;
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
  /** Idioma em que a ficha foi escrita. Nulo enquanto não foi traduzida. */
  sourceLang: "pt" | "en" | "es" | null;
  /** Nulo quando não há tradução para o idioma atual — a tela mostra o original. */
  translation: Translation | null;
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

/**
 * Texto no idioma de quem lê, caindo no original quando não há tradução.
 * `original` força o texto como foi escrito.
 */
export function workText(
  work: Work,
  field: "service" | "description" | "observations",
  original = false
) {
  if (original) return work[field];
  return work.translation?.[field] ?? work[field];
}

export function taskLabel(work: Work, task: Task, original = false) {
  if (original) return task.label;
  return work.translation?.tasks[task.id] ?? task.label;
}

export function updateText(work: Work, update: Update, original = false) {
  if (original) return update.text;
  return work.translation?.updates[update.id] ?? update.text;
}
