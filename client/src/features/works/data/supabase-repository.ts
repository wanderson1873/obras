/**
 * Implementação do repositório sobre o Supabase.
 *
 * A leitura traz a ficha inteira em uma consulta com as tabelas filhas; a
 * escrita passa pela função save_work, que grava tudo em uma transação só.
 * As fotos ficam em um bucket privado e são exibidas por link assinado.
 */

import { supabase } from "@/lib/supabase";
import type { Photo, Translation, Work } from "@/features/works/types";
import type { WorksRepository } from "./repository";

const BUCKET = "work-photos";

/** Um dia de trabalho: evita a foto sumir com o app aberto na obra. */
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 8;

type WorkRow = {
  id: string;
  user_id: string;
  company_id: string | null;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  code: string;
  service: string;
  description: string;
  observations: string;
  water_available: boolean;
  power_available: boolean;
  start_date: string;
  status: "active" | "completed";
  completed_at: string | null;
  position: number;
  source_lang: "pt" | "en" | "es" | null;
  work_tasks: { id: string; label: string; done: boolean; position: number }[];
  work_updates: {
    id: string;
    entry_date: string;
    text: string;
    system_key: string | null;
  }[];
  work_history: { id: string; entry_date: string; title: string }[];
  work_photos: { id: string; storage_path: string; position: number }[];
};

const SELECT_WORK = `
  id, user_id, company_id,
  street, unit, city, state, zip, code, service, description, observations,
  water_available, power_available, start_date, status, completed_at, position, source_lang,
  work_tasks (id, label, done, position),
  work_updates (id, entry_date, text, system_key),
  work_history (id, entry_date, title),
  work_photos (id, storage_path, position)
`;

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user.id;
  if (!userId) throw new Error("Sessão expirada. Entre novamente.");
  return userId;
}

/**
 * O bucket é privado, então cada foto precisa de um link assinado para
 * aparecer na tela. Pedimos todos de uma vez para não fazer uma chamada por foto.
 */
async function signPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  const signed = new Map<string, string>();
  if (!paths.length) return signed;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.warn("Não foi possível assinar os links das fotos.", error);
    return signed;
  }

  data.forEach(entry => {
    if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
  });
  return signed;
}

type LinhaTraducao = {
  work_id: string;
  entity_id: string;
  field: string;
  translated: string;
};

/** Agrupa as traduções por obra, no formato que a tela consome. */
function agruparTraducoes(linhas: LinhaTraducao[]) {
  const porObra = new Map<string, Translation>();
  for (const linha of linhas) {
    let atual = porObra.get(linha.work_id);
    if (!atual) {
      atual = { tasks: {}, updates: {} };
      porObra.set(linha.work_id, atual);
    }
    if (linha.field === "service") atual.service = linha.translated;
    else if (linha.field === "description")
      atual.description = linha.translated;
    else if (linha.field === "observations")
      atual.observations = linha.translated;
    else if (linha.field === "label")
      atual.tasks[linha.entity_id] = linha.translated;
    else if (linha.field === "text")
      atual.updates[linha.entity_id] = linha.translated;
  }
  return porObra;
}

function toWork(
  row: WorkRow,
  signedUrls: Map<string, string>,
  translation: Translation | null
): Work {
  return {
    id: row.id,
    ownerId: row.user_id,
    companyId: row.company_id,
    street: row.street,
    unit: row.unit,
    city: row.city,
    state: row.state,
    zip: row.zip,
    code: row.code,
    service: row.service,
    description: row.description,
    observations: row.observations,
    waterAvailable: row.water_available,
    powerAvailable: row.power_available,
    startDate: row.start_date,
    status: row.status,
    position: row.position,
    sourceLang: row.source_lang,
    translation,
    completedAt: row.completed_at ?? undefined,
    photos: [...row.work_photos]
      .sort((a, b) => a.position - b.position)
      .map(photo => ({
        id: photo.id,
        path: photo.storage_path,
        url: signedUrls.get(photo.storage_path) ?? "",
      })),
    tasks: [...row.work_tasks]
      .sort((a, b) => a.position - b.position)
      .map(task => ({ id: task.id, label: task.label, done: task.done })),
    updates: [...row.work_updates]
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
      .map(update => ({
        id: update.id,
        date: update.entry_date,
        text: update.text,
        systemKey: update.system_key ?? undefined,
      })),
    history: [...row.work_history]
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
      .map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        title: entry.title,
      })),
  };
}

function toPayload(work: Work) {
  return {
    id: work.id,
    street: work.street,
    unit: work.unit,
    city: work.city,
    state: work.state,
    zip: work.zip,
    code: work.code,
    service: work.service,
    description: work.description,
    observations: work.observations,
    water_available: work.waterAvailable,
    power_available: work.powerAvailable,
    start_date: work.startDate,
    status: work.status,
    position: work.position,
    company_id: work.companyId,
    // O banco exige completed_at nulo enquanto a obra está em andamento.
    completed_at:
      work.status === "completed" ? (work.completedAt ?? null) : null,
    tasks: work.tasks.map((task, position) => ({
      id: task.id,
      label: task.label,
      done: task.done,
      position,
    })),
    updates: work.updates.map(update => ({
      id: update.id,
      entry_date: update.date,
      text: update.text,
      system_key: update.systemKey ?? null,
    })),
    history: work.history.map(entry => ({
      id: entry.id,
      entry_date: entry.date,
      title: entry.title,
    })),
    photos: work.photos.map((photo, position) => ({
      id: photo.id,
      storage_path: photo.path,
      position,
    })),
  };
}

export const supabaseWorksRepository: WorksRepository = {
  async list(language) {
    const { data, error } = await supabase
      .from("works")
      .select(SELECT_WORK)
      .order("position", { ascending: true });

    if (error) throw error;

    const rows = (data ?? []) as unknown as WorkRow[];
    const paths = rows.flatMap(row =>
      row.work_photos.map(photo => photo.storage_path)
    );
    const [signedUrls, { data: linhas }] = await Promise.all([
      signPhotoUrls(paths),
      supabase
        .from("content_translations")
        .select("work_id, entity_id, field, translated")
        .eq("lang", language),
    ]);

    const traducoes = agruparTraducoes((linhas ?? []) as LinhaTraducao[]);

    return rows.map(row =>
      toWork(row, signedUrls, traducoes.get(row.id) ?? null)
    );
  },

  async save(work) {
    const { error } = await supabase.rpc("save_work", {
      payload: toPayload(work),
    });
    if (error) throw error;
  },

  /** Dispara a tradução do conteúdo. Falhar aqui não pode derrubar o salvamento. */
  async requestTranslation(workId) {
    const { error } = await supabase.functions.invoke("translate-work", {
      body: { work_id: workId },
    });
    if (error) throw error;
  },

  async setCompany(workId, companyId) {
    const { error } = await supabase.rpc("set_work_company", {
      p_work_id: workId,
      p_company_id: companyId,
    });
    if (error) throw error;
  },

  async reorder(orderedIds) {
    const { error } = await supabase.rpc("reorder_works", {
      work_ids: orderedIds,
    });
    if (error) throw error;
  },

  async remove(id) {
    // As tabelas filhas caem por cascade; as fotos saem do Storage à parte.
    const { data: photos } = await supabase
      .from("work_photos")
      .select("storage_path")
      .eq("work_id", id);

    const { error } = await supabase.from("works").delete().eq("id", id);
    if (error) throw error;

    const paths = (photos ?? []).map(photo => photo.storage_path);
    if (paths.length) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove(paths);
      // Uma foto órfã no bucket não quebra o app; não vale desfazer a exclusão.
      if (storageError)
        console.warn("Fotos não removidas do Storage.", storageError);
    }
  },

  async uploadPhoto(workId, file) {
    const userId = await currentUserId();
    const photoId = crypto.randomUUID();
    // A política do bucket confere a primeira pasta do caminho.
    const path = `${userId}/${workId}/${photoId}.jpg`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) throw error;

    const signedUrls = await signPhotoUrls([path]);
    return { id: photoId, path, url: signedUrls.get(path) ?? "" };
  },

  async deletePhoto(photo) {
    const { error } = await supabase.storage.from(BUCKET).remove([photo.path]);
    if (error) throw error;
  },
};
