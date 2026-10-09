"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "isomorphic-dompurify";
import { api } from "@/lib/api";
import { experienceLabel, jobTypeLabel } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import CompanyLogo from "@/components/CompanyLogo";
import Icon from "@/components/Icon";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: v, isLoading, isError } = useQuery({
    queryKey: ["vacancy", id],
    queryFn: () => api.vacancy(id),
  });

  if (isLoading) return <p className="p-10 text-muted">Memuat...</p>;
  if (isError || !v) return <p className="p-10 text-danger">Lowongan tidak ditemukan.</p>;

  const info = "text-xs12 flex items-center gap-1";
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto flex max-w-[1110px] gap-4 px-6 pt-8 pb-[34px] xl:px-0">
          <CompanyLogo size={96} />
          <div className="flex flex-col justify-center gap-2 pb-2">
            <h1 className="heading-h4">{v.title}</h1>
            <p className="text-small text-muted">Sektor Bisnis: {v.company.sector}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className={info}>
                <Icon name="building" />
                <span className="text-accent underline">{v.company.name}</span>
              </span>
              <span className={info}>
                <Icon name="location" />
                {v.location}
                {v.is_remote && " (Remote)"}
              </span>
              <span className={info}>
                <Icon name="users" />
                {v.company.size} Karyawan
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-[730px] px-6 pt-8 pb-16 xl:px-0">
        <span className="text-small inline-block rounded-[32px] border border-accent-line bg-accent-soft px-4 py-2 leading-[14px] font-semibold text-accent">
          {jobTypeLabel(v.job_type)}
        </span>
        <div
          className="rich mt-[30px]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(v.description) }}
        />

        <section className="mt-8">
          <h2 className="heading-h5 mb-2">Informasi Tambahan</h2>
          <dl className="text-body grid grid-cols-[329px_1fr] gap-y-6">
            <div>
              <dt className="font-semibold">Pengalaman bekerja</dt>
              <dd className="mt-2">{experienceLabel(v.min_experience)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Kandidat yang dibutuhkan</dt>
              <dd className="mt-2 whitespace-pre">{v.candidates_needed}  kandidat</dd>
            </div>
            {v.salary_min != null && (
              <div>
                <dt className="font-semibold">Gaji per bulan</dt>
                <dd className="mt-2">
                  {formatRupiah(v.salary_min)}
                  {v.salary_max != null && ` - ${formatRupiah(v.salary_max)}`}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </article>
    </>
  );
}
