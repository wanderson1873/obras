/** Criação e edição de ficha. Só endereço, cidade e resumo são obrigatórios. */

import { useState, type ReactNode } from "react";
import { Check, Droplets, Zap } from "lucide-react";
import { todayIso } from "@/lib/dates";
import type { Work, WorkInput } from "@/features/works/types";
import { BottomSheet } from "./BottomSheet";

type RequiredField = "street" | "city" | "service";

function emptyForm(): WorkInput {
  return {
    street: "",
    city: "",
    zip: "",
    code: "",
    service: "",
    description: "",
    observations: "",
    waterAvailable: true,
    powerAvailable: true,
    startDate: todayIso(),
  };
}

function formFromWork(work?: Work): WorkInput {
  if (!work) return emptyForm();
  const {
    street,
    city,
    zip,
    code,
    service,
    description,
    observations,
    waterAvailable,
    powerAvailable,
    startDate,
  } = work;
  return {
    street,
    city,
    zip,
    code,
    service,
    description,
    observations,
    waterAvailable,
    powerAvailable,
    startDate,
  };
}

export function WorkFormSheet({
  work,
  onClose,
  onSave,
}: {
  work?: Work;
  onClose: () => void;
  onSave: (form: WorkInput, firstTask?: string) => void;
}) {
  const [form, setForm] = useState<WorkInput>(() => formFromWork(work));
  const [includeChecklist, setIncludeChecklist] = useState(false);
  const [firstTask, setFirstTask] = useState("");
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>(
    {}
  );

  const set = <K extends keyof WorkInput>(key: K, value: WorkInput[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const setRequired = (key: RequiredField, value: string) => {
    set(key, value);
    if (value.trim()) setErrors(current => ({ ...current, [key]: undefined }));
  };

  const submit = () => {
    const next: Partial<Record<RequiredField, string>> = {};
    if (!form.street.trim()) next.street = "Este campo é obrigatório.";
    if (!form.city.trim()) next.city = "Este campo é obrigatório.";
    if (!form.service.trim()) next.service = "Este campo é obrigatório.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave(form, includeChecklist ? firstTask : undefined);
  };

  return (
    <BottomSheet
      label={work ? "Editar obra" : "Nova obra"}
      eyebrow={work ? "Ajustar dados" : "Caderno de campo"}
      title={work ? "Editar ficha" : "Nova ficha"}
      onClose={onClose}
      centerOnDesktop
    >
      <div className="space-y-4">
        <Field
          label="Endereço"
          required
          value={form.street}
          error={errors.street}
          placeholder="Ex.: 187 Park Ave"
          onChange={value => setRequired("street", value)}
        />

        <div className="grid grid-cols-[1fr_92px] gap-3">
          <Field
            label="Cidade / Estado"
            required
            value={form.city}
            error={errors.city}
            placeholder="Woonsocket, RI"
            onChange={value => setRequired("city", value)}
          />
          <Field
            label="CEP"
            value={form.zip}
            placeholder="02895"
            onChange={value => set("zip", value)}
          />
        </div>

        <Field
          label="Código de acesso (opcional)"
          value={form.code}
          placeholder="Ex.: 2486"
          mono
          onChange={value => set("code", value)}
        />

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
            Data de início
          </span>
          <input
            type="date"
            value={form.startDate}
            onChange={event => set("startDate", event.target.value)}
            className="h-11 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm text-[#455367] outline-none focus:border-[#e86a33]"
          />
        </label>

        <section className="rounded-2xl bg-[#f3f0e9] p-3">
          <p className="mb-3 font-mono-field text-[10px] font-medium uppercase tracking-[0.13em] text-[#657185]">
            Condições do local
          </p>
          <div className="space-y-2">
            <ConditionToggle
              label="Água disponível"
              icon={<Droplets size={16} />}
              available={form.waterAvailable}
              onChange={value => set("waterAvailable", value)}
            />
            <ConditionToggle
              label="Energia elétrica disponível"
              icon={<Zap size={16} />}
              available={form.powerAvailable}
              onChange={value => set("powerAvailable", value)}
            />
          </div>
        </section>

        <Field
          label="Resumo do trabalho"
          required
          value={form.service}
          error={errors.service}
          placeholder="Pintura interna · 2º andar"
          onChange={value => setRequired("service", value)}
        />
        <Field
          label="Descrição"
          value={form.description}
          placeholder="O que precisa ser feito?"
          area
          onChange={value => set("description", value)}
        />
        <Field
          label="Observações"
          value={form.observations}
          placeholder="Informações úteis para a visita"
          area
          onChange={value => set("observations", value)}
        />

        {!work && (
          <>
            <div className="flex items-center justify-between rounded-2xl bg-[#f3f0e9] px-3.5 py-3">
              <span>
                <strong className="block text-sm">Checklist</strong>
                <span className="text-xs text-[#778090]">
                  Opcional para esta obra
                </span>
              </span>
              <button
                onClick={() => setIncludeChecklist(value => !value)}
                className={`relative h-6 w-11 rounded-full transition ${includeChecklist ? "bg-[#e86a33]" : "bg-[#cfd2d5]"}`}
                aria-pressed={includeChecklist}
                aria-label="Adicionar primeira tarefa"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${includeChecklist ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
            {includeChecklist && (
              <div className="rounded-2xl border border-[#e7e1d7] p-3">
                <p className="mb-2 text-xs font-bold text-[#526073]">
                  Primeira tarefa
                </p>
                <input
                  value={firstTask}
                  onChange={event => setFirstTask(event.target.value)}
                  placeholder="Ex.: Preparar paredes"
                  className="h-10 w-full rounded-lg bg-[#f8f5ef] px-3 text-sm outline-none focus:ring-2 focus:ring-[#f8d1bd]"
                />
              </div>
            )}
          </>
        )}

        <button
          onClick={submit}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98]"
        >
          <Check size={17} /> {work ? "Salvar alterações" : "Criar ficha"}
        </button>

        {!work && (
          <p className="pb-1 text-center text-xs text-[#8a929d]">
            As fotos são adicionadas dentro da ficha criada.
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  area = false,
  mono = false,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  area?: boolean;
  mono?: boolean;
  required?: boolean;
  error?: string;
}) {
  const base = error
    ? "border-[#c45d4b] bg-[#fff8f6] focus:border-[#c45d4b] focus:ring-2 focus:ring-[#f3c4bb]"
    : "border-[#e4ded3] bg-white focus:border-[#e86a33]";

  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
        {label}
        {required && <span className="ml-1 text-[#bf493b]">*</span>}
      </span>
      {area ? (
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          aria-invalid={Boolean(error)}
          className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition ${base}`}
        />
      ) : (
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`h-11 w-full rounded-xl border px-3 text-sm outline-none transition ${base} ${mono ? "font-mono-field tracking-[0.1em]" : ""}`}
        />
      )}
      {error && (
        <span className="mt-1.5 block text-[11px] font-medium text-[#b34d3f]">
          {error}
        </span>
      )}
    </label>
  );
}

function ConditionToggle({
  label,
  icon,
  available,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  available: boolean;
  onChange: (available: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e1d7] bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#435166]">
        <span className="text-[#e86a33]">{icon}</span>
        {label}
      </div>
      <div className="grid grid-cols-2 rounded-xl bg-[#f3f0e9] p-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-8 rounded-lg text-[12px] font-bold transition ${available ? "bg-white text-[#3f8059] shadow-sm" : "text-[#87909b]"}`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-8 rounded-lg text-[12px] font-bold transition ${!available ? "bg-[#fff0e8] text-[#a74b29] shadow-sm" : "text-[#87909b]"}`}
        >
          Não
        </button>
      </div>
    </div>
  );
}
