/** Tela inicial: busca, abas de status e a pilha de fichas. */

import type { Company } from "@/features/company/types";
import {
  ArrowUpDown,
  Building2,
  Lock,
  CloudOff,
  House,
  UserRound,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { todayIso } from "@/lib/dates";
import { useT } from "@/i18n/I18nContext";
import { useDates } from "@/i18n/useDates";
import type { Work, WorkStatus } from "@/features/works/types";
import { InstallBanner } from "@/features/pwa/InstallBanner";
import { WorkCard } from "./WorkCard";

export function WorkList({
  works,
  activeCount,
  completedCount,
  tab,
  query,
  loading,
  offline,
  onTab,
  onQuery,
  onOpen,
  onNavigate,
  onNew,
  onRefresh,
  onAccount,
  onOrganize,
  myId,
  companies,
  buckets,
  onToggleBucket,
}: {
  works: Work[];
  activeCount: number;
  completedCount: number;
  tab: WorkStatus;
  query: string;
  loading: boolean;
  offline: boolean;
  onTab: (tab: WorkStatus) => void;
  onQuery: (query: string) => void;
  onOpen: (work: Work) => void;
  onNavigate: (work: Work) => void;
  onNew: () => void;
  onRefresh: () => void;
  onAccount: () => void;
  onOrganize: () => void;
  /** Id de quem está usando o app, para marcar as obras de outra pessoa. */
  myId: string;
  companies: Company[];
  /** Ids das organizações marcadas, mais "private" para as fichas privadas. */
  buckets: string[];
  onToggleBucket: (bucket: string) => void;
}) {
  const t = useT();
  const d = useDates();
  return (
    <div className="app-enter min-h-screen px-4 pb-16 pt-7 sm:px-5">
      <header className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#e86a33] shadow-[0_7px_15px_rgba(232,106,51,0.25)]"
            aria-hidden="true"
          >
            <House size={22} strokeWidth={2.4} className="text-white" />
          </div>
          <h1 className="text-[25px] font-bold leading-none tracking-[-0.04em] text-[#27374c]">
            Obras
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono-field text-[9px] uppercase tracking-[0.15em] text-[#8b9098]">
              {t("common.today")}
            </p>
            <p className="text-sm font-semibold text-[#3b4658]">
              {d.dayMonth(todayIso())}
            </p>
          </div>
          <button
            onClick={onAccount}
            aria-label={t("list.myAccount")}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#f0ece4] text-[#5d6878] transition active:scale-90"
          >
            <UserRound size={16} />
          </button>
        </div>
      </header>

      {offline && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e8dcc9] bg-[#fdf7ea] px-3.5 py-3">
          <CloudOff size={18} className="shrink-0 text-[#a97b26]" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[#7c5a17]">
              {t("list.offlineTitle")}
            </p>
            <p className="text-[12px] leading-4 text-[#8a7442]">
              {t("list.offlineBody")}
            </p>
          </div>
          <button
            onClick={onRefresh}
            aria-label={t("list.retry")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#7c5a17] shadow-sm transition active:scale-90"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      )}

      <InstallBanner />

      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7e8794]"
          size={18}
        />
        <input
          aria-label={t("list.searchLabel")}
          value={query}
          onChange={event => onQuery(event.target.value)}
          placeholder={t("list.search")}
          className="h-12 w-full rounded-2xl border border-[#e7e1d7] bg-[#f3f0e9] pl-11 pr-11 text-[15px] font-medium outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-[#f8d1bd]/50"
        />
        {query && (
          <button
            onClick={() => onQuery("")}
            aria-label={t("list.clearSearch")}
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-[#e3ded4] text-[#5d6878] transition active:scale-90"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {companies.length > 0 && (
        <div className="mb-5" role="group" aria-label={t("filter.label")}>
          <p className="mb-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.15em] text-[#8b9098]">
            {t("filter.title")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <BucketChip
              icon={<Lock size={12} />}
              label={t("org.private")}
              active={buckets.includes("private")}
              onClick={() => onToggleBucket("private")}
            />
            {companies.map(empresa => (
              <BucketChip
                key={empresa.id}
                icon={<Building2 size={12} />}
                label={empresa.name}
                active={buckets.includes(empresa.id)}
                onClick={() => onToggleBucket(empresa.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div
        className="mb-6 grid grid-cols-2 rounded-2xl bg-[#eeeae1] p-1"
        role="tablist"
        aria-label={t("list.tabsLabel")}
      >
        <StatusTab
          label={t("list.tabActive")}
          count={activeCount}
          active={tab === "active"}
          onClick={() => onTab("active")}
        />
        <StatusTab
          label={t("list.tabDone")}
          count={completedCount}
          active={tab === "completed"}
          onClick={() => onTab("completed")}
        />
      </div>

      <button
        onClick={onNew}
        className="mb-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d8d0c4] bg-[#f8f5ef] text-[13px] font-bold text-[#4f5d70] transition hover:border-[#e6ab8e] hover:bg-[#fff8f4] active:scale-[0.98]"
      >
        <Plus size={16} className="text-[#e86a33]" /> {t("list.newWork")}
      </button>

      <section aria-labelledby="works-heading">
        <div className="mb-3 flex items-end justify-between px-1">
          <div>
            <p className="field-rule w-max pb-1 font-mono-field text-[9px] font-medium uppercase tracking-[0.15em] text-[#8b9098]">
              {tab === "active" ? t("list.inField") : t("list.closed")}
            </p>
            <h2
              id="works-heading"
              className="mt-1 text-lg font-bold tracking-[-0.025em]"
            >
              {loading
                ? t("common.loading")
                : works.length === 1
                  ? t("list.countOne", { count: works.length })
                  : t("list.countMany", { count: works.length })}
            </h2>
          </div>
          {!loading && works.length > 1 && (
            <button
              onClick={onOrganize}
              className="flex h-8 items-center gap-1.5 rounded-full bg-[#f3f0e9] px-3 text-[12px] font-bold text-[#4f5c6e] transition active:scale-95"
            >
              <ArrowUpDown size={14} className="text-[#e86a33]" />{" "}
              {t("list.organize")}
            </button>
          )}
          {tab === "active" && !loading && works.length === 1 && (
            <span className="rounded-full bg-[#f8d1bd] px-2.5 py-1 font-mono-field text-[9px] font-medium tracking-[0.09em] text-[#944120]">
              {t("list.inFieldChip")}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {loading && [0, 1, 2].map(key => <CardSkeleton key={key} />)}

          {!loading &&
            works.map((work, index) => (
              <WorkCard
                key={work.id}
                work={work}
                index={index}
                isMine={work.ownerId === myId}
                companyName={companies.find(c => c.id === work.companyId)?.name}
                onOpen={() => onOpen(work)}
                onNavigate={() => onNavigate(work)}
              />
            ))}

          {!loading && !works.length && (
            <EmptyState searching={Boolean(query)} tab={tab} onNew={onNew} />
          )}
        </div>
      </section>
    </div>
  );
}

/** Marcador do filtro: privadas ou uma organização. */
function BucketChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition active:scale-95 ${
        active
          ? "border-[#e86a33] bg-[#fff1e9] text-[#a7502b]"
          : "border-[#e4ded3] bg-white text-[#8a929d]"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatusTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-bold transition ${active ? "bg-[#fbfaf7] text-[#27374c] shadow-sm" : "text-[#727b87]"}`}
    >
      {label}{" "}
      <span
        className={`font-mono-field text-[10px] ${active ? "text-[#e86a33]" : "text-[#9097a0]"}`}
      >
        {String(count).padStart(2, "0")}
      </span>
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[25px] border border-[#e9e3d8] bg-[#fffefa]">
      <div className="h-[153px] animate-pulse bg-[#ebe6dc]" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-2/3 animate-pulse rounded-md bg-[#ebe6dc]" />
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-[#efeae1]" />
        <div className="h-12 w-full animate-pulse rounded-2xl bg-[#f1ece3]" />
      </div>
    </div>
  );
}

function EmptyState({
  searching,
  tab,
  onNew,
}: {
  searching: boolean;
  tab: WorkStatus;
  onNew: () => void;
}) {
  const t = useT();
  if (searching) {
    return (
      <div className="rounded-3xl border border-dashed border-[#d7d0c4] px-6 py-14 text-center">
        <Search className="mx-auto mb-3 text-[#9da3ab]" size={24} />
        <p className="font-semibold">{t("list.emptySearch")}</p>
        <p className="mt-1 text-sm text-[#737d8d]">
          {t("list.emptySearchHint")}
        </p>
      </div>
    );
  }

  if (tab === "completed") {
    return (
      <div className="rounded-3xl border border-dashed border-[#d7d0c4] px-6 py-14 text-center">
        <p className="font-semibold">{t("list.emptyDone")}</p>
        <p className="mt-1 text-sm text-[#737d8d]">{t("list.emptyDoneHint")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-[#d7d0c4] px-6 py-12 text-center">
      <House className="mx-auto mb-3 text-[#c0a795]" size={26} />
      <p className="font-semibold">{t("list.emptyActive")}</p>
      <p className="mx-auto mt-1 max-w-[280px] text-sm text-[#737d8d]">
        {t("list.emptyActiveHint")}
      </p>
      <button
        onClick={onNew}
        className="mx-auto mt-4 flex h-11 items-center gap-2 rounded-xl bg-[#27374c] px-4 text-sm font-bold text-white transition active:scale-[0.98]"
      >
        <Plus size={16} className="text-[#ffb28e]" /> {t("list.newWork")}
      </button>
    </div>
  );
}
