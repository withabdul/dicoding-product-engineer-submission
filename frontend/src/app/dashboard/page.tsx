"use client";

/* eslint-disable @next/next/no-img-element -- static logo art */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import Icon from "@/components/Icon";

export default function DashboardPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-vacancies"],
    queryFn: api.myVacancies,
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: api.deleteVacancy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-vacancies"] });
      qc.invalidateQueries({ queryKey: ["vacancies"] });
    },
  });

  if (!user) return null;

  const date = "text-small flex items-center gap-1 text-muted";
  const btn = "text-body flex items-center gap-2 rounded-[2px] px-3 py-1.5 leading-6";

  return (
    <div className="flex min-h-[757px]">
      <aside className="hidden w-[419px] shrink-0 border-r border-line lg:block">
        <div className="ml-[167px] w-[252px]">
          <div className="relative h-[92px]">
            <p className="absolute top-[14px] left-0 p-4 text-[24px] leading-8 font-medium text-text2">Jobs</p>
            <img src="/assets/sidebar-art.png" alt="" className="absolute inset-y-0 left-[44.44%] w-[33.33%] object-cover" />
          </div>
          <div className="flex items-center gap-2 bg-fill p-4">
            <Icon name="job" size={24} />
            <span className="text-body">Lowongan Saya</span>
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1 px-6 pt-6 lg:pr-[167px]">
        <div className="mb-[30px] flex items-start justify-between">
          <h1 className="heading-h4">Lowongan Saya</h1>
          <Link href="/dashboard/new" className={`${btn} mt-2 bg-brand text-white`}>
            <Icon name="plus" />
            Buat lowongan
          </Link>
        </div>

        {isLoading && <p className="text-muted">Memuat...</p>}
        {data?.length === 0 && <p className="text-muted">Belum ada lowongan.</p>}

        <div className="flex flex-col gap-6 pb-16">
          {data?.map((v) => (
            <div key={v.id} className="flex gap-4 rounded-lg border border-line bg-white p-4">
              <div className="grid size-16 shrink-0 place-items-center rounded bg-brand ring-1 ring-[#d4d4d8] ring-inset">
                <img src="/assets/logo-mark.svg" alt="" width={32} height={32} />
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h3 className="heading-h6 text-text2">{v.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className={date}>
                      <Icon name="upload" />
                      Dibuat: {formatDate(v.created_at)}
                    </span>
                    <span className={date}>
                      <Icon name="clock" />
                      Aktif hingga: {formatDate(v.active_until)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/dashboard/${v.id}/edit`} className={`${btn} border border-line bg-surface text-text2`}>
                    <Icon name="edit" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus lowongan "${v.title}"?`)) remove.mutate(v.id);
                    }}
                    className={`${btn} bg-danger-soft text-danger`}
                  >
                    <Icon name="trash" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
