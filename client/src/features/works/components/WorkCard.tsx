/** Ficha da lista: foto de fachada, endereço, código de entrada e rota em um toque. */

import {
  CalendarDays,
  CheckCircle2,
  Droplets,
  House,
  KeyRound,
  MapPin,
  Navigation,
  Zap,
} from "lucide-react";
import { formatDuration, formatShortDate } from "@/lib/dates";
import type { Work } from "@/features/works/types";

export function WorkCard({
  work,
  index,
  onOpen,
  onNavigate,
}: {
  work: Work;
  index: number;
  onOpen: () => void;
  onNavigate: () => void;
}) {
  const cover = work.photos[0]?.url;
  const hasWarning = !work.waterAvailable || !work.powerAvailable;

  return (
    <article
      onClick={onOpen}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Abrir ficha de ${work.street}`}
      className="card-grain group relative overflow-hidden rounded-[25px] border border-[#e9e3d8] bg-[#fffefa] text-left shadow-[0_7px_22px_rgba(39,55,76,0.07)] outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-[#f8d1bd] active:scale-[0.99]"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      {work.status === "active" && (
        <span className="absolute bottom-0 left-0 top-0 z-[1] w-1 bg-[#e86a33]" />
      )}

      <div className="relative h-[153px] overflow-hidden bg-[#e6e1d6]">
        {cover ? (
          <img
            src={cover}
            alt={`Fachada de ${work.street}`}
            loading="lazy"
            className="document-photo h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#a49c90]">
            <House size={26} strokeWidth={1.8} />
            <span className="font-mono-field text-[9px] uppercase tracking-[0.14em]">
              Sem foto da fachada
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#142030]/45 to-transparent" />
        {work.status === "active" ? (
          <div className="absolute left-4 top-4 rounded-md bg-[#27374c]/85 px-2 py-1 font-mono-field text-[9px] font-medium tracking-[0.12em] text-white">
            FICHA {String(index + 1).padStart(2, "0")}
          </div>
        ) : (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#f5f2eb]/95 px-2.5 py-1.5 font-mono-field text-[10px] font-medium uppercase tracking-[0.09em] text-[#526071]">
            <CheckCircle2 size={13} className="text-[#52936c]" /> Concluída
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[23px] font-bold leading-tight tracking-[-0.045em] text-[#27374c]">
              {work.street}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-[#637084]">
              <MapPin size={13} /> {work.city}
            </p>
            <p className="mt-1 flex items-center gap-1 font-mono-field text-[9px] font-medium uppercase tracking-[0.06em] text-[#8a929d]">
              <CalendarDays size={12} /> {formatShortDate(work.startDate)}
              <span className="text-[#b0a59a]">·</span>{" "}
              {formatDuration(work.startDate)}
            </p>
          </div>
          {work.status === "completed" && work.completedAt && (
            <span className="whitespace-nowrap font-mono-field text-[10px] text-[#7e8794]">
              {formatShortDate(work.completedAt)}
            </span>
          )}
        </div>

        {work.code ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#f3f0e9] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <KeyRound size={15} className="text-[#e86a33]" />
              <div>
                <span className="block font-mono-field text-[8px] font-medium uppercase tracking-[0.12em] text-[#788293]">
                  Entrada
                </span>
                <span className="font-mono-field text-[17px] font-medium tracking-[0.13em] text-[#27374c]">
                  {work.code}
                </span>
              </div>
            </div>
            <RouteButton work={work} onNavigate={onNavigate} />
          </div>
        ) : (
          <div className="mt-3">
            <RouteButton work={work} onNavigate={onNavigate} compact />
          </div>
        )}

        <p className="field-rule mt-3 line-clamp-1 pb-2 text-[13px] font-semibold text-[#5e6979]">
          {work.service}
        </p>

        {hasWarning && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {!work.waterAvailable && (
              <WarningChip icon={<Droplets size={12} />} label="Sem água" />
            )}
            {!work.powerAvailable && (
              <WarningChip icon={<Zap size={12} />} label="Sem energia" />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function RouteButton({
  work,
  onNavigate,
  compact = false,
}: {
  work: Work;
  onNavigate: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={event => {
        event.stopPropagation();
        onNavigate();
      }}
      aria-label={`Abrir rota para ${work.street}`}
      className={
        compact
          ? "flex h-9 items-center gap-1.5 rounded-xl bg-[#f3f0e9] px-3 text-[12px] font-bold text-[#33465e] transition active:scale-[0.96]"
          : "flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#33465e] shadow-sm transition active:scale-[0.96]"
      }
    >
      <Navigation size={14} className="text-[#e86a33]" /> Rota
    </button>
  );
}

function WarningChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0e8] px-2 py-1 font-mono-field text-[9px] font-medium uppercase tracking-[0.06em] text-[#a74b29]">
      {icon} {label}
    </span>
  );
}
