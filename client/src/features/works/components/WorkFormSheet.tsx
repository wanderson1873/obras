/** Criação e edição de ficha. Só endereço, cidade e resumo são obrigatórios. */

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Building2, Check, Droplets, Lock, Zap } from "lucide-react";
import { todayIso } from "@/lib/dates";
import { useT } from "@/i18n/I18nContext";
import type { Company } from "@/features/company/types";
import type { Work, WorkInput } from "@/features/works/types";
import { BottomSheet } from "./BottomSheet";
import { AddressSearch, type AddressParts } from "./AddressSearch";

type RequiredField = "street" | "city" | "service";

function emptyForm(): WorkInput {
  return {
    street: "",
    unit: "",
    city: "",
    state: "",
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
    unit,
    city,
    state,
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
    unit,
    city,
    state,
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
  companies,
  canChangeOrganization = true,
  onClose,
  onSave,
}: {
  work?: Work;
  companies: Company[];
  /** Mover a ficha muda quem a enxerga: só quem criou decide isso. */
  canChangeOrganization?: boolean;
  onClose: () => void;
  onSave: (
    form: WorkInput,
    firstTask?: string,
    companyId?: string | null
  ) => void;
}) {
  const t = useT();
  const [form, setForm] = useState<WorkInput>(() => formFromWork(work));
  /**
   * Onde a ficha fica. Nova nasce privada — a escolha que não surpreende
   * ninguém, já que abrir para a organização muda quem enxerga o código da
   * porta. Editando, começa de onde a ficha está hoje.
   */
  const [destino, setDestino] = useState<string | null>(
    work?.companyId ?? null
  );
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

  /** Preenche os campos com o endereço escolhido na busca. */
  const preencherEndereco = (endereco: AddressParts) => {
    setForm(atual => ({
      ...atual,
      street: endereco.street || atual.street,
      // O apartamento raramente vem do Google; não apaga o que foi digitado.
      unit: endereco.unit || atual.unit,
      city: endereco.city || atual.city,
      state: endereco.state || atual.state,
      zip: endereco.zip || atual.zip,
    }));
    setErrors({});
    toast.success(t("form.addressPicked"), { description: endereco.formatted });
  };

  const submit = () => {
    const next: Partial<Record<RequiredField, string>> = {};
    if (!form.street.trim()) next.street = t("common.required");
    if (!form.city.trim()) next.city = t("common.required");
    if (!form.service.trim()) next.service = t("common.required");
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave(form, includeChecklist ? firstTask : undefined, destino);
  };

  return (
    <BottomSheet
      label={work ? t("form.editTitle") : t("form.newTitle")}
      eyebrow={work ? t("form.editEyebrow") : t("form.newEyebrow")}
      title={work ? t("form.editTitle") : t("form.newTitle")}
      onClose={onClose}
      centerOnDesktop
    >
      <div className="space-y-4">
        <AddressSearch onPick={preencherEndereco} />

        <div className="grid grid-cols-[1fr_110px] gap-3">
          <Field
            label={t("form.street")}
            required
            value={form.street}
            error={errors.street}
            placeholder={t("form.streetPlaceholder")}
            onChange={value => setRequired("street", value)}
          />
          <Field
            label={t("form.unit")}
            value={form.unit}
            placeholder={t("form.unitPlaceholder")}
            onChange={value => set("unit", value)}
          />
        </div>

        <div className="grid grid-cols-[1fr_70px_92px] gap-3">
          <Field
            label={t("form.city")}
            required
            value={form.city}
            error={errors.city}
            placeholder={t("form.cityPlaceholder")}
            onChange={value => setRequired("city", value)}
          />
          <Field
            label={t("form.state")}
            value={form.state}
            placeholder={t("form.statePlaceholder")}
            onChange={value => set("state", value)}
          />
          <Field
            label={t("form.zip")}
            value={form.zip}
            placeholder={t("form.zipPlaceholder")}
            onChange={value => set("zip", value)}
          />
        </div>

        <Field
          label={t("form.code")}
          value={form.code}
          placeholder={t("form.codePlaceholder")}
          mono
          onChange={value => set("code", value)}
        />

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
            {t("form.startDate")}
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
            {t("form.conditions")}
          </p>
          <div className="space-y-2">
            <ConditionToggle
              label={t("form.waterAvailable")}
              icon={<Droplets size={16} />}
              available={form.waterAvailable}
              onChange={value => set("waterAvailable", value)}
            />
            <ConditionToggle
              label={t("form.powerAvailable")}
              icon={<Zap size={16} />}
              available={form.powerAvailable}
              onChange={value => set("powerAvailable", value)}
            />
          </div>
        </section>

        <Field
          label={t("form.service")}
          required
          value={form.service}
          error={errors.service}
          placeholder={t("form.servicePlaceholder")}
          onChange={value => setRequired("service", value)}
        />
        <Field
          label={t("form.description")}
          value={form.description}
          placeholder={t("form.descriptionPlaceholder")}
          area
          onChange={value => set("description", value)}
        />
        <Field
          label={t("form.notes")}
          value={form.observations}
          placeholder={t("form.notesPlaceholder")}
          area
          onChange={value => set("observations", value)}
        />

        {!work && (
          <>
            <div className="flex items-center justify-between rounded-2xl bg-[#f3f0e9] px-3.5 py-3">
              <span>
                <strong className="block text-sm">{t("form.checklist")}</strong>
                <span className="text-xs text-[#778090]">
                  {t("form.checklistHint")}
                </span>
              </span>
              <button
                onClick={() => setIncludeChecklist(value => !value)}
                className={`relative h-6 w-11 rounded-full transition ${includeChecklist ? "bg-[#e86a33]" : "bg-[#cfd2d5]"}`}
                aria-pressed={includeChecklist}
                aria-label={t("form.firstTask")}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${includeChecklist ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
            {includeChecklist && (
              <div className="rounded-2xl border border-[#e7e1d7] p-3">
                <p className="mb-2 text-xs font-bold text-[#526073]">
                  {t("form.firstTask")}
                </p>
                <input
                  value={firstTask}
                  onChange={event => setFirstTask(event.target.value)}
                  placeholder={t("form.firstTaskPlaceholder")}
                  className="h-10 w-full rounded-lg bg-[#f8f5ef] px-3 text-sm outline-none focus:ring-2 focus:ring-[#f8d1bd]"
                />
              </div>
            )}
          </>
        )}

        {canChangeOrganization && (
          <section className="rounded-2xl bg-[#f3f0e9] p-3">
            <p className="mb-3 font-mono-field text-[10px] font-medium uppercase tracking-[0.13em] text-[#657185]">
              {t("form.destination")}
            </p>
            <div className="space-y-2">
              <Destino
                icon={<Lock size={15} />}
                title={t("org.private")}
                description={t("org.privateHint")}
                active={destino === null}
                onClick={() => setDestino(null)}
              />
              {companies.map(empresa => (
                <Destino
                  key={empresa.id}
                  icon={<Building2 size={15} />}
                  title={empresa.name}
                  description={t("org.belongsToHint")}
                  active={destino === empresa.id}
                  onClick={() => setDestino(empresa.id)}
                />
              ))}
            </div>
            {companies.length === 0 && (
              <p className="mt-2.5 text-[11px] leading-4 text-[#78828f]">
                {t("form.destinationNoOrgs")}
              </p>
            )}
          </section>
        )}

        <button
          onClick={submit}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98]"
        >
          <Check size={17} /> {work ? t("form.saveChanges") : t("form.create")}
        </button>

        {!work && (
          <p className="pb-1 text-center text-xs text-[#8a929d]">
            {t("form.photoHint")}
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
  const t = useT();
  const yesLabel = t("form.yes");
  const noLabel = t("form.no");
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
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-8 rounded-lg text-[12px] font-bold transition ${!available ? "bg-[#fff0e8] text-[#a74b29] shadow-sm" : "text-[#87909b]"}`}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}

/** Uma escolha de onde a ficha vai ficar. */
function Destino({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
        active ? "border-[#e86a33] bg-[#fff8f4]" : "border-[#e7e1d7] bg-white"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
          active ? "bg-[#e86a33] text-white" : "bg-[#f3f0e9] text-[#5d6878]"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-[#354357]">
          {title}
        </span>
        <span className="block text-[11px] leading-4 text-[#78828f]">
          {description}
        </span>
      </span>
    </button>
  );
}
