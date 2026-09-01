/**
 * Estado das obras.
 *
 * O Supabase é a fonte da verdade. O cache local serve para o app abrir já
 * mostrando as fichas e para continuar legível sem sinal — mas, sem conexão,
 * o app fica somente leitura em vez de fingir que salvou.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { todayIso } from "@/lib/dates";
import { readCachedWorks, writeCachedWorks } from "./data/cache";
import { supabaseWorksRepository } from "./data/supabase-repository";
import type { WorksRepository } from "./data/repository";
import { useAuth } from "@/features/auth/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import type { Photo, Work, WorkInput } from "./types";

const repository: WorksRepository = supabaseWorksRepository;

function newId() {
  return crypto.randomUUID();
}

/**
 * Em andamento primeiro; dentro de cada grupo vale a ordem manual escolhida
 * pelo usuário. A data só desempata quando duas fichas têm a mesma posição.
 */
function sortWorks(works: Work[]) {
  return [...works].sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    if (a.position !== b.position) return a.position - b.position;
    return b.startDate.localeCompare(a.startDate);
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useWorks() {
  const { session } = useAuth();
  const { t, language } = useI18n();
  const myId = session?.user.id ?? "";
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  /** true quando o Supabase não respondeu e a tela está vindo do cache. */
  const [offline, setOffline] = useState(false);

  const worksRef = useRef<Work[]>([]);
  worksRef.current = works;

  const refresh = useCallback(async () => {
    try {
      const remote = await repository.list(language);
      setWorks(sortWorks(remote));
      setOffline(false);
      void writeCachedWorks(remote);
      return true;
    } catch (error) {
      console.error("Falha ao carregar as obras do Supabase.", error);
      setOffline(true);
      return false;
    }
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = await readCachedWorks();
      // Mostra o cache na hora; a resposta do servidor substitui em seguida.
      if (!cancelled && cached.length) setWorks(sortWorks(cached));

      const ok = await refresh();
      if (cancelled) return;

      if (!ok) {
        toast.error(t("toast.offline"), {
          description: cached.length
            ? t("toast.offlineCached")
            : t("toast.offlineEmpty"),
        });
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  /**
   * Atualiza a tela na hora e grava em seguida. Se a gravação falhar,
   * devolve a lista ao estado anterior — nada de mostrar salvo o que não foi.
   */
  const persist = useCallback(async (next: Work) => {
    const previous = worksRef.current;
    setWorks(current => {
      const exists = current.some(work => work.id === next.id);
      return sortWorks(
        exists
          ? current.map(work => (work.id === next.id ? next : work))
          : [next, ...current]
      );
    });

    try {
      await repository.save(next);
      void writeCachedWorks(worksRef.current);
      // Tradução é um extra: se falhar, a ficha continua salva no original.
      void repository.requestTranslation(next.id).catch(erro => {
        console.warn("Não foi possível traduzir o conteúdo da obra.", erro);
      });
      return true;
    } catch (error) {
      console.error("Falha ao salvar a obra.", error);
      setWorks(previous);
      toast.error(t("toast.saveFailed"), {
        description: errorMessage(error, t("toast.saveUndone")),
      });
      return false;
    }
  }, []);

  const updateWork = useCallback(
    (workId: string, change: (work: Work) => Work) => {
      const current = worksRef.current.find(work => work.id === workId);
      if (!current) return;
      void persist(change(current));
    },
    [persist]
  );

  const createWork = useCallback(
    (
      input: WorkInput,
      firstTask?: string,
      companyId: string | null = null
    ): Work => {
      // A ficha nova entra no topo: acabou de ser criada, é o que interessa agora.
      const menorPosicao = worksRef.current.reduce(
        (menor, item) => Math.min(menor, item.position),
        0
      );
      const work: Work = {
        ...input,
        id: newId(),
        ownerId: myId,
        // Onde a ficha nasce é escolhido no formulário; sem organização, privada.
        companyId,
        sourceLang: null,
        translation: null,
        status: "active",
        position: menorPosicao - 1,
        photos: [],
        tasks: firstTask?.trim()
          ? [{ id: newId(), label: firstTask.trim(), done: false }]
          : [],
        updates: [
          {
            id: newId(),
            date: todayIso(),
            text: t("work.createdEntry"),
            systemKey: "work.createdEntry",
          },
        ],
        history: [],
      };
      void persist(work);
      return work;
    },
    [persist, myId]
  );

  const editWork = useCallback(
    (workId: string, input: WorkInput) =>
      updateWork(workId, work => ({ ...work, ...input })),
    [updateWork]
  );

  /**
   * Grava a ordem escolhida no modo organizar. A tela já mostra a lista nova
   * enquanto salva; se falhar, volta ao que estava e avisa.
   */
  const reorderWorks = useCallback(async (orderedIds: string[]) => {
    const previous = worksRef.current;
    const posicaoPorId = new Map(orderedIds.map((id, indice) => [id, indice]));

    setWorks(current =>
      sortWorks(
        current.map(work =>
          posicaoPorId.has(work.id)
            ? { ...work, position: posicaoPorId.get(work.id)! }
            : work
        )
      )
    );

    try {
      await repository.reorder(orderedIds);
      void writeCachedWorks(worksRef.current);
      return true;
    } catch (error) {
      console.error("Falha ao gravar a ordem das obras.", error);
      setWorks(previous);
      toast.error(t("reorder.failed"), {
        description: errorMessage(error, t("reorder.failedHint")),
      });
      return false;
    }
  }, []);

  /** Mover a ficha entre privada e organização. Só quem criou consegue. */
  const setCompany = useCallback(
    async (workId: string, companyId: string | null, companyName?: string) => {
      const previous = worksRef.current;
      setWorks(current =>
        current.map(work =>
          work.id === workId ? { ...work, companyId } : work
        )
      );
      try {
        await repository.setCompany(workId, companyId);
        void writeCachedWorks(worksRef.current);
        toast.success(
          companyId && companyName
            ? t("org.moved", { org: companyName })
            : t("org.movedPrivate")
        );
        return true;
      } catch (error) {
        console.error("Falha ao mudar a organização da obra.", error);
        setWorks(previous);
        toast.error(t("org.failed"), {
          description: errorMessage(error, t("toast.saveUndone")),
        });
        return false;
      }
    },
    [t]
  );

  const removeWork = useCallback(async (workId: string) => {
    const previous = worksRef.current;
    setWorks(current => current.filter(work => work.id !== workId));
    try {
      await repository.remove(workId);
      void writeCachedWorks(worksRef.current);
    } catch (error) {
      console.error("Falha ao apagar a obra.", error);
      setWorks(previous);
      toast.error(t("toast.deleteFailed"), {
        description: errorMessage(error, t("toast.tryAgain")),
      });
    }
  }, []);

  const completeWork = useCallback(
    (workId: string) =>
      updateWork(workId, work => ({
        ...work,
        status: "completed",
        completedAt: todayIso(),
        updates: [
          {
            id: newId(),
            date: todayIso(),
            text: t("work.completedEntry"),
            systemKey: "work.completedEntry",
          },
          ...work.updates,
        ],
      })),
    [updateWork]
  );

  const reopenWork = useCallback(
    (workId: string) =>
      updateWork(workId, work => ({
        ...work,
        status: "active",
        completedAt: undefined,
        updates: [
          {
            id: newId(),
            date: todayIso(),
            text: t("work.reopenedEntry"),
            systemKey: "work.reopenedEntry",
          },
          ...work.updates,
        ],
      })),
    [updateWork]
  );

  const addTask = useCallback(
    (workId: string, label: string) => {
      if (!label.trim()) return;
      updateWork(workId, work => ({
        ...work,
        tasks: [
          ...work.tasks,
          { id: newId(), label: label.trim(), done: false },
        ],
      }));
    },
    [updateWork]
  );

  const toggleTask = useCallback(
    (workId: string, taskId: string) =>
      updateWork(workId, work => ({
        ...work,
        tasks: work.tasks.map(task =>
          task.id === taskId ? { ...task, done: !task.done } : task
        ),
      })),
    [updateWork]
  );

  const removeTask = useCallback(
    (workId: string, taskId: string) =>
      updateWork(workId, work => ({
        ...work,
        tasks: work.tasks.filter(task => task.id !== taskId),
      })),
    [updateWork]
  );

  const addUpdate = useCallback(
    (workId: string, text: string) => {
      if (!text.trim()) return;
      updateWork(workId, work => ({
        ...work,
        updates: [
          { id: newId(), date: todayIso(), text: text.trim() },
          ...work.updates,
        ],
      }));
    },
    [updateWork]
  );

  const removeUpdate = useCallback(
    (workId: string, updateId: string) =>
      updateWork(workId, work => ({
        ...work,
        updates: work.updates.filter(item => item.id !== updateId),
      })),
    [updateWork]
  );

  /** Envia as fotos ao Storage antes de gravar a ficha, para não salvar caminho inexistente. */
  const addPhotos = useCallback(
    async (workId: string, files: Blob[]) => {
      if (!files.length) return;
      const current = worksRef.current.find(work => work.id === workId);
      if (!current) return;

      const uploaded: Photo[] = [];
      try {
        for (const file of files) {
          uploaded.push(await repository.uploadPhoto(workId, file));
        }
      } catch (error) {
        console.error("Falha ao enviar a foto.", error);
        // Limpa o que já subiu para não deixar arquivo solto no bucket.
        await Promise.all(
          uploaded.map(photo => repository.deletePhoto(photo).catch(() => {}))
        );
        toast.error(t("toast.photoFailed"), {
          description: errorMessage(error, t("toast.photoFailedHint")),
        });
        return;
      }

      const saved = await persist({
        ...current,
        photos: [...current.photos, ...uploaded],
      });
      if (!saved) {
        await Promise.all(
          uploaded.map(photo => repository.deletePhoto(photo).catch(() => {}))
        );
        return;
      }
      toast.success(
        uploaded.length === 1
          ? t("toast.photoAdded")
          : t("toast.photosAdded", { count: uploaded.length })
      );
    },
    [persist]
  );

  const removePhoto = useCallback(
    async (workId: string, index: number) => {
      const current = worksRef.current.find(work => work.id === workId);
      const photo = current?.photos[index];
      if (!current || !photo) return;

      // Grava a ficha primeiro: se der erro, o arquivo continua íntegro.
      const saved = await persist({
        ...current,
        photos: current.photos.filter((_, position) => position !== index),
      });
      if (!saved) return;

      try {
        await repository.deletePhoto(photo);
      } catch (error) {
        console.warn("Foto removida da ficha, mas não do Storage.", error);
      }
    },
    [persist]
  );

  const setCoverPhoto = useCallback(
    (workId: string, index: number) =>
      updateWork(workId, work => {
        const cover = work.photos[index];
        if (!cover) return work;
        return {
          ...work,
          photos: [
            cover,
            ...work.photos.filter((_, position) => position !== index),
          ],
        };
      }),
    [updateWork]
  );

  return {
    works,
    loading,
    offline,
    refresh,
    createWork,
    editWork,
    removeWork,
    reorderWorks,
    setCompany,
    myId,
    completeWork,
    reopenWork,
    addTask,
    toggleTask,
    removeTask,
    addUpdate,
    removeUpdate,
    addPhotos,
    removePhoto,
    setCoverPhoto,
  };
}
