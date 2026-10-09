"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { DESCRIPTION_TEMPLATE, EXPERIENCES, JOB_TYPES } from "@/lib/constants";
import type { VacancyInput } from "@/lib/types";
import Icon from "./Icon";
import RichTextEditor from "./RichTextEditor";

const EMPTY: VacancyInput = {
  title: "",
  position: "",
  job_type: "full_time",
  candidates_needed: 1,
  active_until: "",
  location: "",
  is_remote: false,
  description: DESCRIPTION_TEMPLATE,
  min_experience: "lt_1",
  show_salary: false,
  salary_min: null,
  salary_max: null,
};

const control = "text-body h-12 w-full rounded-[2px] border border-line bg-white px-4 text-ink placeholder:text-muted";
const hint = "text-small text-muted";

const Required = () => <span className="text-required"> *</span>;

export default function VacancyForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: VacancyInput;
  onSubmit: (v: VacancyInput) => Promise<unknown>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<VacancyInput>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: options } = useQuery({ queryKey: ["options"], queryFn: api.options });

  const set = <K extends keyof VacancyInput>(k: K, v: VacancyInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const err = (k: string) =>
    errors[k] && <p className="text-small text-required">{errors[k][0]}</p>;
  const num = (s: string) => (s === "" ? null : Number(s));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage("");
    try {
      await onSubmit(form);
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.errors);
        setMessage(e.message);
      }
    } finally {
      setSaving(false);
    }
  }

  const radio = (name: string, label: string, checked: boolean, onChange: () => void) => (
    <label key={label} className="text-body flex h-6 cursor-pointer items-center gap-2.5 leading-6 text-text2">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="size-5 accent-brand" />
      {label}
    </label>
  );

  const select = (id: string, value: string, placeholder: string, items: string[] | undefined, onChange: (v: string) => void) => (
    <div className="relative">
      <select id={id} className={`${control} appearance-none pr-12 ${value ? "" : "text-muted"}`} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {items?.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
      <span className="pointer-events-none absolute top-3 right-4"><Icon name="chevron" size={24} /></span>
    </div>
  );

  const salary = (label: string, value: number | null | undefined, placeholder: string, onChange: (v: number | null) => void) => (
    <div className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-[2px] border border-line">
      <span className="text-body grid h-full w-[74px] shrink-0 place-items-center bg-fill">Rp</span>
      <input aria-label={label} type="number" min={0} className="text-body h-full min-w-0 flex-1 px-2.5 placeholder:text-muted" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange(num(e.target.value))} />
    </div>
  );

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-[600px] flex-col gap-8 px-6 pt-10 pb-16 xl:px-0">
      {message && <p className="text-small rounded-[2px] bg-danger-soft p-3 text-danger">{message}</p>}

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-body">Judul lowongan<Required /></label>
        <input id="title" className={control} placeholder="Masukkan judul lowongan" value={form.title} onChange={(e) => set("title", e.target.value)} />
        <p className={hint}>Contoh: Android Native Developer</p>
        {err("title")}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="position" className="text-body">Posisi<Required /></label>
        {select("position", form.position, "Pilih posisi yang dicari", options?.positions, (v) => set("position", v))}
        {err("position")}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-body mb-2">Tipe pekerjaan<Required /></legend>
        <div className="flex flex-col gap-3">
          {JOB_TYPES.map((t) => radio("job_type", t.label, form.job_type === t.value, () => set("job_type", t.value)))}
        </div>
        {err("job_type")}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="candidates" className="text-body">Kandidat yang dibutuhkan<Required /></label>
        <input id="candidates" type="number" min={1} className={control} placeholder="Masukkan jumlah kandidat yang dibutuhkan" value={form.candidates_needed || ""} onChange={(e) => set("candidates_needed", Number(e.target.value))} />
        {err("candidates_needed")}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="active_until" className="text-body">Aktif hingga<Required /></label>
        <input id="active_until" type="date" className={control} value={form.active_until} onChange={(e) => set("active_until", e.target.value)} />
        {err("active_until")}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="location" className="text-body">Lokasi<Required /></label>
        {select("location", form.location, "Pilih lokasi", options?.locations, (v) => set("location", v))}
        <label className="text-body flex items-center gap-2 text-text2">
          <input type="checkbox" checked={form.is_remote} onChange={(e) => set("is_remote", e.target.checked)} className="m-[3px] size-[18px] accent-brand" />
          Bisa remote
        </label>
        {err("location")}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-body">Deskripsi<Required /></span>
        <RichTextEditor value={form.description} onChange={(h) => set("description", h)} />
        <p className={hint}>Anda bisa mengubah templat yang telah disediakan di atas.</p>
        {err("description")}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-body">Rentang gaji per bulan<Required /></span>
        <div className="flex items-center gap-6">
          {salary("Gaji minimum", form.salary_min, "Minimum", (v) => set("salary_min", v))}
          <span className="text-body">-</span>
          {salary("Gaji maksimum", form.salary_max, "Maksimum (opsional)", (v) => set("salary_max", v))}
        </div>
        <p className={hint}>Anda tidak perlu mengisi kolom &quot;Maksimum&quot; jika yang dimasukkan adalah gaji pokok.</p>
        {err("salary_min")}
        {err("salary_max")}
        <div className="mt-0 flex flex-col gap-2">
          <label className="text-body flex cursor-pointer items-center gap-2 py-0.5 text-muted">
            <button
              type="button"
              role="switch"
              aria-checked={form.show_salary}
              aria-label="Tampilkan gaji"
              onClick={() => set("show_salary", !form.show_salary)}
              className={`relative h-5 w-10 shrink-0 rounded-full transition-colors ${form.show_salary ? "bg-brand" : "bg-[#d4d4d8]"}`}
            >
              <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${form.show_salary ? "left-[22px]" : "left-0.5"}`} />
            </button>
            Tampilkan gaji
          </label>
          <p className={hint}>Gaji akan ditampilkan di lowongan pekerjaan dan dapat dilihat oleh kandidat.</p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-body mb-2">Minimum pengalaman bekerja<Required /></legend>
        <div className="flex flex-col gap-3">
          {EXPERIENCES.map((x) => radio("min_experience", x.label, form.min_experience === x.value, () => set("min_experience", x.value)))}
        </div>
        {err("min_experience")}
      </fieldset>

      <div className="mt-2.5 flex gap-[18px]">
        <button disabled={saving} className="text-body h-10 rounded-[2px] bg-brand px-6 text-white disabled:opacity-60">
          {saving ? "Menyimpan..." : submitLabel}
        </button>
        <button type="button" onClick={() => router.push("/dashboard")} className="text-body rounded-[2px] border border-line bg-surface px-5 py-2 leading-6 text-text2">
          Batal
        </button>
      </div>
    </form>
  );
}
