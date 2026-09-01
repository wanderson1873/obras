/**
 * Contrato de persistência das obras.
 *
 * A implementação em uso é a do Supabase. O cache local (IndexedDB) fica ao
 * lado dela, para o app abrir instantaneamente e ainda mostrar endereço e
 * código quando o celular estiver sem sinal na obra.
 */

import type { Photo, Work } from "@/features/works/types";

export interface WorksRepository {
  /** `language` decide em que idioma o conteúdo volta. */
  list(language: "pt" | "en" | "es"): Promise<Work[]>;
  /** Cria ou atualiza a ficha inteira, em uma transação só. */
  save(work: Work): Promise<void>;
  remove(id: string): Promise<void>;
  /** Grava a ordem manual da lista inteira em uma chamada só. */
  reorder(orderedIds: string[]): Promise<void>;
  /** Move a ficha para uma organização, ou para privada com null. Só quem criou. */
  setCompany(workId: string, companyId: string | null): Promise<void>;
  /** Manda traduzir o conteúdo escrito da obra para os outros idiomas. */
  requestTranslation(workId: string): Promise<void>;
  /** Envia a foto já comprimida para o Storage e devolve o registro pronto. */
  uploadPhoto(workId: string, file: Blob): Promise<Photo>;
  deletePhoto(photo: Photo): Promise<void>;
}
