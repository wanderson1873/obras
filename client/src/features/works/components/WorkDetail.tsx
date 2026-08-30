/** Ficha aberta: chegar, entrar e retomar o serviço sem procurar conversa. */

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  CalendarDays,
  Check,
  CheckCircle2,
  DoorOpen,
  Droplets,
  Edit3,
  History,
  House,
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  formatDuration,
  formatLongDate,
  formatRelativeDay,
  formatShortDate,
} from "@/lib/dates";
import type { Work } from "@/features/works/types";
import { usePhotoPicker } from "./usePhotoPicker";

type DetailActions = {
  onBack: () => void;
  onNavigate: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onAddTask: (label: string) => void;
  onAddUpdate: (text: string) => void;
  onRemoveUpdate: (updateId: string) => void;
  onAddPhotos: (files: Blob[]) => Promise<void> | void;
  onRemovePhoto: (index: number) => void;
  onSetCover: (index: number) => void;
};

export function WorkDetail({
  work,
  ...actions
}: { work: Work } & DetailActions) {
  const [newTask, setNewTask] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const doneCount = work.tasks.filter(task => task.done).length;
  const picker = usePhotoPicker(actions.onAddPhotos);

  return (
    <div className="app-enter min-h-screen pb-12">
      {picker.input}

      <Gallery work={work} onBack={actions.onBack} onEdit={actions.onEdit} />

      <div className="relative -mt-5 rounded-t-[28px] bg-[#fbfaf7] px-4 pb-2 pt-6 sm:px-5">
        <header className="mb-5">
          <p className="font-mono-field text-[10px] font-medium uppercase tracking-[0.16em] text-[#e86a33]">
            {work.status === "active"
              ? "Em andamento"
              : `Concluída${work.completedAt ? ` · ${formatShortDate(work.completedAt)}` : ""}`}
          </p>
          <h1 className="mt-1 text-[29px] font-bold leading-tight tracking-[-0.055em] text-[#27374c]">
            {work.street}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#697588]">
            <MapPin size={15} /> {work.city}
            {work.zip && ` · ${work.zip}`}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 font-mono-field text-[10px] font-medium uppercase tracking-[0.08em] text-[#8a929d]">
            <CalendarDays size={13} /> Iniciada em{" "}
            {formatLongDate(work.startDate)}
            <span className="text-[#b0a59a]">·</span>{" "}
            {formatDuration(work.startDate)}
          </p>
        </header>

        <button
          onClick={actions.onNavigate}
          className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98]"
        >
          <Navigation size={17} className="text-[#ffb28e]" /> Abrir navegação{" "}
          <ArrowUpRight size={16} className="opacity-70" />
        </button>

        {work.code && (
          <section className="mb-7 rounded-[22px] border border-[#f0ded4] bg-[#fff8f4] p-4">
            <p className="mb-2 flex items-center gap-2 font-mono-field text-[10px] font-medium uppercase tracking-[0.13em] text-[#a75a3b]">
              <DoorOpen size={14} /> Código de acesso
            </p>
            <div className="font-mono-field text-[32px] font-medium leading-none tracking-[0.18em] text-[#27374c]">
              {work.code}
            </div>
          </section>
        )}

        <section className="mb-7">
          <SectionHeading
            icon={<House size={16} />}
            label="Condições do local"
          />
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#eae4da] bg-white">
            <AvailabilityRow
              icon={<Droplets size={17} />}
              label="Água"
              available={work.waterAvailable}
            />
            <AvailabilityRow
              icon={<Zap size={17} />}
              label="Energia elétrica"
              available={work.powerAvailable}
              last
            />
          </div>
        </section>

        <section className="mb-7">
          <SectionHeading icon={<House size={16} />} label="Trabalho" />
          <div className="mt-3 rounded-2xl bg-[#f3f0e9] px-4 py-3.5">
            <p className="text-[14px] font-bold text-[#3e4b5d]">
              {work.service}
            </p>
            {work.description && (
              <p className="mt-2 text-[14px] leading-6 text-[#637084]">
                {work.description}
              </p>
            )}
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeading icon={<CheckCircle2 size={16} />} label="Tarefas" />
            <span className="font-mono-field text-[10px] text-[#7d8794]">
              {doneCount}/{work.tasks.length}
            </span>
          </div>

          {work.tasks.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[#eae4da] bg-white">
              {work.tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-3 px-3.5 py-3 ${index < work.tasks.length - 1 ? "border-b border-[#f1ece3]" : ""}`}
                >
                  <button
                    onClick={() => actions.onToggleTask(task.id)}
                    aria-label={
                      task.done
                        ? `Desmarcar ${task.label}`
                        : `Concluir ${task.label}`
                    }
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition active:scale-90 ${task.done ? "border-[#599875] bg-[#599875] text-white" : "border-[#cfd3d4] bg-white"}`}
                  >
                    {task.done && <Check size={13} strokeWidth={3} />}
                  </button>
                  <span
                    className={`flex-1 text-[14px] font-medium ${task.done ? "text-[#a0a6ad] line-through" : "text-[#435064]"}`}
                  >
                    {task.label}
                  </span>
                  <button
                    onClick={() => actions.onRemoveTask(task.id)}
                    aria-label={`Remover ${task.label}`}
                    className="p-1 opacity-60 transition hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={15} className="text-[#b5a29a]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <InlineComposer
            value={newTask}
            onChange={setNewTask}
            onSubmit={() => {
              actions.onAddTask(newTask);
              setNewTask("");
            }}
            placeholder="Adicionar tarefa"
            action={<Plus size={19} />}
          />
        </section>

        <section className="mb-7">
          <SectionHeading icon={<Edit3 size={16} />} label="Observações" />
          <p className="mt-3 rounded-2xl bg-[#f3f0e9] px-4 py-3.5 text-[14px] leading-6 text-[#637084]">
            {work.observations || "Nenhuma observação adicionada."}
          </p>
        </section>

        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeading icon={<Camera size={16} />} label="Fotos" />
            <button
              onClick={picker.open}
              disabled={picker.busy}
              className="flex items-center gap-1 text-xs font-bold text-[#a7502b] disabled:opacity-60"
            >
              {picker.busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ImagePlus size={15} />
              )}{" "}
              Adicionar
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {work.photos.map((photo, index) => (
              <figure key={photo.id} className="group relative shrink-0">
                <img
                  src={photo.url}
                  alt={`Registro ${index + 1} de ${work.street}`}
                  loading="lazy"
                  className="h-20 w-28 rounded-xl object-cover"
                />
                {index === 0 && (
                  <figcaption className="absolute bottom-1 left-1 rounded bg-[#27374c]/80 px-1.5 py-0.5 font-mono-field text-[8px] uppercase tracking-[0.1em] text-white">
                    Capa
                  </figcaption>
                )}
                <div className="absolute right-1 top-1 flex gap-1">
                  {index !== 0 && (
                    <button
                      onClick={() => actions.onSetCover(index)}
                      aria-label="Usar como capa"
                      className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[#5d6878] shadow-sm transition active:scale-90"
                    >
                      <Star size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => actions.onRemovePhoto(index)}
                    aria-label={`Remover foto ${index + 1}`}
                    className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[#a8503a] shadow-sm transition active:scale-90"
                  >
                    <X size={12} />
                  </button>
                </div>
              </figure>
            ))}

            <button
              onClick={picker.open}
              disabled={picker.busy}
              aria-label="Adicionar foto"
              className="grid h-20 w-24 shrink-0 place-items-center rounded-xl border border-dashed border-[#cfc7bc] bg-[#f8f5ef] text-[#9a948b] disabled:opacity-60"
            >
              {picker.busy ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ImagePlus size={20} />
              )}
            </button>
          </div>
        </section>

        <section className="mb-7">
          <SectionHeading icon={<History size={16} />} label="Atualizações" />
          <div className="mt-3">
            {work.updates.map((update, index) => (
              <div
                key={update.id}
                className="group relative flex gap-3 pb-5 last:pb-0"
              >
                <div className="flex w-[52px] shrink-0 flex-col items-center">
                  <span className="font-mono-field text-[10px] text-[#7d8794]">
                    {formatRelativeDay(update.date)}
                  </span>
                  {index < work.updates.length - 1 && (
                    <span className="mt-2 h-full border-l border-dashed border-[#cbd0d5]" />
                  )}
                </div>
                <div className="-mt-0.5 flex flex-1 items-start gap-2 rounded-xl bg-[#f3f0e9] px-3.5 py-2.5">
                  <p className="flex-1 text-[13px] leading-5 text-[#546174]">
                    {update.text}
                  </p>
                  <button
                    onClick={() => actions.onRemoveUpdate(update.id)}
                    aria-label="Remover atualização"
                    className="shrink-0 p-0.5 opacity-60 transition hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={14} className="text-[#b5a29a]" />
                  </button>
                </div>
              </div>
            ))}
            {!work.updates.length && (
              <p className="rounded-2xl bg-[#f3f0e9] px-4 py-3.5 text-[13px] text-[#78828f]">
                Nenhuma atualização registrada.
              </p>
            )}
          </div>

          <InlineComposer
            value={newUpdate}
            onChange={setNewUpdate}
            onSubmit={() => {
              actions.onAddUpdate(newUpdate);
              setNewUpdate("");
            }}
            placeholder="Nova atualização"
            action="Registrar"
          />
        </section>

        {work.history.length > 0 && (
          <section className="mb-8">
            <SectionHeading
              icon={<History size={16} />}
              label="Trabalhos anteriores neste endereço"
            />
            <div className="mt-3 overflow-hidden rounded-2xl border border-[#eae4da] bg-white">
              {work.history.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${index < work.history.length - 1 ? "border-b border-[#f1ece3]" : ""}`}
                >
                  <span className="font-mono-field text-[10px] text-[#7d8794]">
                    {formatShortDate(entry.date)}
                  </span>
                  <span className="flex-1 text-right text-[13px] font-semibold text-[#536174]">
                    {entry.title}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-2">
          {work.status === "active" ? (
            <button
              onClick={actions.onComplete}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#b8ddc5] bg-[#f2faf4] text-sm font-bold text-[#3d7e58] transition active:scale-[0.98]"
            >
              <CheckCircle2 size={17} /> Marcar como concluída
            </button>
          ) : (
            <button
              onClick={actions.onReopen}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#dfd7ca] bg-white text-sm font-bold text-[#4d5b6e] transition active:scale-[0.98]"
            >
              <RotateCcw size={16} /> Reabrir obra
            </button>
          )}

          <button
            onClick={actions.onDelete}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-[13px] font-bold text-[#a8503a] transition active:scale-[0.98]"
          >
            <Trash2 size={15} /> Apagar ficha
          </button>
        </div>
      </div>
    </div>
  );
}

function Gallery({
  work,
  onBack,
  onEdit,
}: {
  work: Work;
  onBack: () => void;
  onEdit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="relative h-[274px] overflow-hidden bg-[#e6e1d6]">
      {work.photos.length > 0 ? (
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {work.photos.map((photo, position) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={`Foto ${position + 1} de ${work.street}`}
              className="h-full w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#a49c90]">
          <House size={34} strokeWidth={1.6} />
          <span className="font-mono-field text-[10px] uppercase tracking-[0.14em]">
            Sem foto da fachada
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#172334]/45 via-transparent to-[#172334]/25" />

      <button
        onClick={onBack}
        className="absolute left-4 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/92 text-[#27374c] shadow-sm transition active:scale-95"
        aria-label="Voltar para a lista"
      >
        <ArrowLeft size={19} />
      </button>
      <button
        onClick={onEdit}
        className="absolute right-4 top-5 flex h-10 items-center gap-1.5 rounded-full bg-white/92 px-3 text-xs font-bold text-[#27374c] shadow-sm transition active:scale-95"
      >
        <Edit3 size={14} /> Editar
      </button>

      {work.photos.length > 1 && (
        <div className="pointer-events-none absolute bottom-4 left-5 flex items-center gap-2">
          <div className="flex gap-1.5">
            {work.photos.map((_, position) => (
              <span
                key={position}
                className={`h-1.5 rounded-full transition-all ${position === index ? "w-5 bg-white" : "w-1.5 bg-white/70"}`}
              />
            ))}
          </div>
          <span className="font-mono-field text-[10px] text-white/90">
            {index + 1}/{work.photos.length}
          </span>
        </div>
      )}
    </div>
  );
}

function InlineComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  action,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  action: React.ReactNode;
}) {
  const isIcon = typeof action !== "string";
  return (
    <div className="mt-2 flex gap-2">
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        onKeyDown={event => {
          if (event.key === "Enter") onSubmit();
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 min-w-0 flex-1 rounded-xl border border-[#e8e2d7] bg-white px-3 text-sm outline-none focus:border-[#e86a33]"
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        aria-label={placeholder}
        className={
          isIcon
            ? "grid h-11 w-11 place-items-center rounded-xl bg-[#f3eee5] text-[#27374c] transition active:scale-95 disabled:opacity-50"
            : "h-11 rounded-xl bg-[#e86a33] px-3 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50"
        }
      >
        {action}
      </button>
    </div>
  );
}

function SectionHeading({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-[14px] font-bold tracking-[-0.01em] text-[#364559]">
      <span className="text-[#e86a33]">{icon}</span>
      {label}
    </h2>
  );
}

function AvailabilityRow({
  icon,
  label,
  available,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  available: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${last ? "" : "border-b border-[#f1ece3]"}`}
    >
      <span className={available ? "text-[#4c8c66]" : "text-[#b65734]"}>
        {icon}
      </span>
      <span className="flex-1 text-[14px] font-semibold text-[#47556a]">
        {label}
      </span>
      <span
        className={`rounded-full px-2.5 py-1 font-mono-field text-[9px] font-medium uppercase tracking-[0.08em] ${available ? "bg-[#edf8f0] text-[#43825c]" : "bg-[#fff0e8] text-[#a74b29]"}`}
      >
        {available ? "Disponível" : "Indisponível"}
      </span>
    </div>
  );
}
