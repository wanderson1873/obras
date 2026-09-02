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
import { OrganizationSheet } from "@/features/works/components/OrganizationSheet";
import { useCompanies } from "@/features/company/useCompanies";
import { useActivity } from "@/features/activity/useActivity";
import { ActivitySheet } from "@/features/activity/ActivitySheet";
import { useT } from "@/i18n/I18nContext";
import { CompanySheet } from "@/features/company/CompanySheet";
import type { Work, WorkStatus } from "@/features/works/types";

type FormState = { kind: "new" } | { kind: "edit"; workId: string };
type Confirmation = { kind: "complete" | "delete"; workId: string };

export default function Home() {
  const t = useT();
  const { companies } = useCompanies();
  const works = useWorks();
  const activity = useActivity();
  const [tab, setTab] = useState<WorkStatus>("active");
  const [query, setQuery] = useState("");
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [navigationWorkId, setNavigationWorkId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [sharingWorkId, setSharingWorkId] = useState<string | null>(null);
  /**
   * Baldes marcados no filtro: ids de organização mais "private".
   * Lista vazia significa "mostrar tudo" — é o estado inicial.
   */
  const [buckets, setBuckets] = useState<string[]>([]);
  const [showTeam, setShowTeam] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const byId = (id: string | null) =>
    id ? (works.works.find(work => work.id === id) ?? null) : null;

  const filteredWorks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return works.works.filter(work => {
      if (work.status !== tab) return false;
      if (buckets.length > 0) {
        const balde = work.companyId ?? "private";
        if (!buckets.includes(balde)) return false;
      }
      if (!normalized) return true;
      return `${work.street} ${work.city} ${work.zip} ${work.code} ${work.service}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [works.works, query, tab, buckets]);

  const openWork = byId(openWorkId);
  const navigationWork = byId(navigationWorkId);
  const editingWork =
    formState?.kind === "edit" ? byId(formState.workId) : undefined;
  const confirmationWork = byId(confirmation?.workId ?? null);
  const sharingWork = byId(sharingWorkId);
  const nomeDaOrganizacao = (companyId: string | null) =>
    companies.find(c => c.id === companyId)?.name;

  function handleSave(
    input: Parameters<typeof works.createWork>[0],
    firstTask?: string,
    companyId?: string | null
  ) {
    if (formState?.kind === "edit" && editingWork) {
      works.editWork(editingWork.id, input);
      setFormState(null);
      const mudouDeLugar =
        companyId !== undefined && companyId !== editingWork.companyId;
      if (mudouDeLugar) {
        // O aviso de mudança de organização já diz tudo; dois seria demais.
        void works.setCompany(
          editingWork.id,
          companyId ?? null,
          nomeDaOrganizacao(companyId ?? null)
        );
      } else {
        toast.success(t("toast.workUpdated"));
      }
      return;
    }
    const destino = companyId ?? null;
    const created = works.createWork(input, firstTask, destino);
    void activity.refresh();
    setFormState(null);
    setTab("active");
    setQuery("");
    setOpenWorkId(created.id);
    toast.success(t("toast.workCreated"), {
      // Onde a ficha foi parar decide quem a enxerga: vale dizer em voz alta.
      description: destino
        ? t("org.belongsTo", { org: nomeDaOrganizacao(destino) ?? "" })
        : t("org.private"),
    });
  }

  function handleConfirm() {
    if (!confirmation || !confirmationWork) return;
    if (confirmation.kind === "complete") {
      works.completeWork(confirmationWork.id);
      setTab("completed");
      setOpenWorkId(null);
      toast.success(t("toast.workCompleted"), {
        description: t("toast.workCompletedHint"),
      });
    } else {
      void works.removeWork(confirmationWork.id);
      setOpenWorkId(null);
      toast.success(t("toast.workDeleted"));
    }
    setConfirmation(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#27374c] selection:bg-[#f8d1bd]">
      <main className="relative mx-auto min-h-screen w-full max-w-[540px] border-x border-[#e8e2d7] bg-[#fbfaf7] shadow-[0_0_70px_rgba(39,55,76,0.08)]">
        {organizing ? (
          <ReorderList
            works={filteredWorks}
            label={
              tab === "active"
                ? t("reorder.groupActive")
                : t("reorder.groupDone")
            }
            onSave={works.reorderWorks}
            onCancel={() => setOrganizing(false)}
          />
        ) : openWork ? (
          <WorkDetail
            key={openWork.id}
            work={openWork}
            isMine={openWork.ownerId === works.myId}
            companyName={nomeDaOrganizacao(openWork.companyId)}
            onChangeOrganization={() => setSharingWorkId(openWork.id)}
            onBack={() => setOpenWorkId(null)}
            onNavigate={() => setNavigationWorkId(openWork.id)}
            onEdit={() => setFormState({ kind: "edit", workId: openWork.id })}
            onComplete={() =>
              setConfirmation({ kind: "complete", workId: openWork.id })
            }
            onReopen={() => {
              works.reopenWork(openWork.id);
              setTab("active");
              toast.success(t("toast.workReopened"));
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
            myId={works.myId}
            companies={companies}
            buckets={buckets}
            onOpenActivity={() => {
              setShowActivity(true);
              // Abrir já é ter visto: o contador zera aqui, a lista continua.
              void activity.markSeen();
            }}
            unseenActivity={activity.unseenCount}
            onToggleBucket={balde =>
              setBuckets(atuais =>
                atuais.includes(balde)
                  ? atuais.filter(item => item !== balde)
                  : [...atuais, balde]
              )
            }
          />
        )}
      </main>

      {formState && (
        <WorkFormSheet
          key={formState.kind === "edit" ? formState.workId : "new"}
          work={editingWork ?? undefined}
          companies={companies}
          canChangeOrganization={
            !editingWork || editingWork.ownerId === works.myId
          }
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showAccount && (
        <AccountSheet
          onClose={() => setShowAccount(false)}
          onOpenTeam={() => {
            setShowAccount(false);
            setShowTeam(true);
          }}
        />
      )}

      {showTeam && <CompanySheet onClose={() => setShowTeam(false)} />}

      {showActivity && (
        <ActivitySheet
          items={activity.items}
          onOpenWork={workId => {
            setShowActivity(false);
            setTab("active");
            setOpenWorkId(workId);
          }}
          onClose={() => setShowActivity(false)}
        />
      )}

      {sharingWork && (
        <OrganizationSheet
          work={sharingWork}
          companies={companies}
          onClose={() => setSharingWorkId(null)}
          onSave={companyId =>
            works.setCompany(
              sharingWork.id,
              companyId,
              nomeDaOrganizacao(companyId)
            )
          }
        />
      )}

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
              ? t("confirm.completeTitle")
              : t("confirm.deleteTitle")
          }
          message={
            confirmation.kind === "complete"
              ? t("confirm.completeBody", { street: confirmationWork.street })
              : t("confirm.deleteBody", { street: confirmationWork.street })
          }
          confirmLabel={
            confirmation.kind === "complete"
              ? t("confirm.complete")
              : t("confirm.delete")
          }
          tone={confirmation.kind === "delete" ? "danger" : "neutral"}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}
