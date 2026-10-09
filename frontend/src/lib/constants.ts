import type { Experience, JobType } from "./types";

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Kontrak" },
  { value: "intern", label: "Intern" },
];

export const EXPERIENCES: { value: Experience; label: string }[] = [
  { value: "lt_1", label: "Kurang dari 1 tahun" },
  { value: "1_3", label: "1-3 tahun" },
  { value: "4_5", label: "4-5 tahun" },
  { value: "6_10", label: "6-10 tahun" },
  { value: "gt_10", label: "Lebih dari 10 tahun" },
];

export const jobTypeLabel = (v: JobType) =>
  JOB_TYPES.find((t) => t.value === v)?.label ?? v;
export const experienceLabel = (v: Experience) =>
  EXPERIENCES.find((e) => e.value === v)?.label ?? v;

export const DESCRIPTION_TEMPLATE = `<h2>Deskripsi Pekerjaan</h2><p>Sebagai [Posisi Lowongan], Anda akan berpartisipasi dalam proses pembangunan aplikasi yang sedang dibangun dalam perusahaan [Nama Perusahaan]. Anda juga diharapkan mampu bekerja dalam tim.</p><h2>Tanggung Jawab</h2><ul><li>Membuat atau memodifikasi program yang sudah ada.</li><li>Bertanggung jawab dalam mengelola program.</li></ul>`;
