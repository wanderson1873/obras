/* Caderno de Campo: uma coluna mobile, fotos de fachada e informações de acesso sempre acima de detalhes secundários. */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmSheet } from "@/features/works/components/ConfirmSheet";
import { NavigationSheet } from "@/features/works/components/NavigationSheet";
import { ReorderList } from "@/features/works/components/ReorderList";
import { WorkDetail } from "@/features/works/components/WorkDetail";
import { WorkFormSheet } from "@/features/works/components/WorkFormSheet";
import { WorkList } from "@/features/works/components/WorkList";
import { useWorks } from "@/features/works/useWorks";
import { AccountSheet } from "@/features/auth/AccountSheet";
import type { Work, WorkStatus } from "@/features/works/types";

type FormState = { kind: "new" } | { kind: "edit"; workId: string };
type Confirmation = { kind: "complete" | "delete"; workId: string };

export default function Home() {
  const works = useWorks();
  const [tab, setTab] = useState<WorkStatus>("active");
  const [query, setQuery] = useState("");
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [navigationWorkId, setNavigationWorkId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const byId = (id: string | null) =>
    id ? (works.works.find(work => work.id === id) ?? null) : null;

  const filteredWorks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return works.works.filter(work => {
      if (work.status !== tab) return false;
      if (!normalized) return true;
      return `${work.street} ${work.city} ${work.zip} ${work.code} ${work.service}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [works.works, query, tab]);

  const openWork = byId(openWorkId);
  const navigationWork = byId(navigationWorkId);
  const editingWork =
    formState?.kind === "edit" ? byId(formState.workId) : undefined;
  const confirmationWork = byId(confirmation?.workId ?? null);

  function handleSave(
    input: Parameters<typeof works.createWork>[0],
    firstTask?: string
  ) {
    if (formState?.kind === "edit" && editingWork) {
      works.editWork(editingWork.id, input);
      setFormState(null);
      toast.success("Ficha atualizada");
      return;
    }
    const created = works.createWork(input, firstTask);
    setFormState(null);
    setTab("active");
    setQuery("");
    setOpenWorkId(created.id);
    toast.success("Ficha criada");
  }

  function handleConfirm() {
    if (!confirmation || !confirmationWork) return;
    if (confirmation.kind === "complete") {
      works.completeWork(confirmationWork.id);
      setTab("completed");
      setOpenWorkId(null);
      toast.success("Obra concluída", {
        description: "Ela foi movida para Concluídos.",
      });
    } else {
      void works.removeWork(confirmationWork.id);
      setOpenWorkId(null);
      toast.success("Ficha apagada");
    }
    setConfirmation(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#27374c] selection:bg-[#f8d1bd]">
      <main className="relative mx-auto min-h-screen w-full max-w-[540px] border-x border-[#e8e2d7] bg-[#fbfaf7] shadow-[0_0_70px_rgba(39,55,76,0.08)]">
        {organizing ? (
          <ReorderList
            works={filteredWorks}
            label={tab === "active" ? "em andamento" : "concluídos"}
            onSave={works.reorderWorks}
            onCancel={() => setOrganizing(false)}
          />
        ) : openWork ? (
          <WorkDetail
            key={openWork.id}
            work={openWork}
            onBack={() => setOpenWorkId(null)}
            onNavigate={() => setNavigationWorkId(openWork.id)}
            onEdit={() => setFormState({ kind: "edit", workId: openWork.id })}
            onComplete={() =>
              setConfirmation({ kind: "complete", workId: openWork.id })
            }
            onReopen={() => {
              works.reopenWork(openWork.id);
              setTab("active");
              toast.success("Obra reaberta");
            }}
            onDelete={() =>
              setConfirmation({ kind: "delete", workId: openWork.id })
            }
            onToggleTask={taskId => works.toggleTask(openWork.id, taskId)}
            onRemoveTask={taskId => works.removeTask(openWork.id, taskId)}
            onAddTask={label => works.addTask(openWork.id, label)}
            onAddUpdate={text => works.addUpdate(openWork.id, text)}
            onRemoveUpdate={updateId =>
              works.removeUpdate(openWork.id, updateId)
            }
            onAddPhotos={files => works.addPhotos(openWork.id, files)}
            onRemovePhoto={index => works.removePhoto(openWork.id, index)}
            onSetCover={index => works.setCoverPhoto(openWork.id, index)}
          />
        ) : (
          <WorkList
            works={filteredWorks}
            activeCount={
              works.works.filter(work => work.status === "active").length
            }
            completedCount={
              works.works.filter(work => work.status === "completed").length
            }
            tab={tab}
            query={query}
            loading={works.loading}
            offline={works.offline}
            onTab={setTab}
            onQuery={setQuery}
            onOpen={(work: Work) => setOpenWorkId(work.id)}
            onNavigate={(work: Work) => setNavigationWorkId(work.id)}
            onNew={() => setFormState({ kind: "new" })}
            onRefresh={() => {
              void works.refresh();
            }}
            onAccount={() => setShowAccount(true)}
            onOrganize={() => setOrganizing(true)}
          />
        )}
      </main>

      {formState && (
        <WorkFormSheet
          key={formState.kind === "edit" ? formState.workId : "new"}
          work={editingWork ?? undefined}
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showAccount && <AccountSheet onClose={() => setShowAccount(false)} />}

      {navigationWork && (
        <NavigationSheet
          work={navigationWork}
          onClose={() => setNavigationWorkId(null)}
        />
      )}

      {confirmation && confirmationWork && (
        <ConfirmSheet
          title={
            confirmation.kind === "complete"
              ? "Concluir esta obra?"
              : "Apagar esta ficha?"
          }
          message={
            confirmation.kind === "complete"
              ? `${confirmationWork.street} será movida para Concluídos. Você pode reabrir depois.`
              : `${confirmationWork.street} será apagada com fotos, tarefas e atualizações. Isso não pode ser desfeito.`
          }
          confirmLabel={
            confirmation.kind === "complete" ? "Concluir" : "Apagar"
          }
          tone={confirmation.kind === "delete" ? "danger" : "neutral"}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}
