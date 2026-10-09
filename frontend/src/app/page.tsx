"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import JobCard from "@/components/JobCard";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vacancies", debounced, page],
    queryFn: () => api.vacancies(debounced, page),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <Hero
        eyebrow="Dicoding Jobs"
        title={
          <>
            Temukan lowongan yang
            <br />
            cocok untuk kamu
          </>
        }
      />
      <section className="mx-auto max-w-[730px] px-6 pt-[42px] pb-20 xl:px-0">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
          <h2 className="heading-h4">
            {debounced ? "Hasil Pencarian" : "Daftar Pekerjaan Terbaru"}
          </h2>
          <label className="flex w-full items-center gap-2.5 rounded border border-line bg-white px-6 py-3 sm:w-[346px]">
            <Icon name="search" size={20} />
            <input
              type="search"
              aria-label="Cari pekerjaan"
              placeholder="Pekerjaan apa yang sedang kamu cari?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-small w-full bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </label>
        </div>

        {isLoading && <p className="text-muted">Memuat...</p>}
        {isError && <p className="text-danger">Gagal memuat lowongan.</p>}
        {data && data.data.length === 0 && <p className="text-muted">Tidak ada lowongan yang cocok.</p>}

        <div className="flex flex-col gap-6">
          {data?.data.map((v) => <JobCard key={v.id} vacancy={v} />)}
        </div>

        {data && data.meta.last_page > 1 && (
          <div className="text-small mt-8 flex items-center justify-center gap-4">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-[2px] border border-line bg-surface px-3 py-1.5 text-text2 disabled:opacity-40">Sebelumnya</button>
            <span>{page} / {data.meta.last_page}</span>
            <button disabled={page >= data.meta.last_page} onClick={() => setPage(page + 1)} className="rounded-[2px] border border-line bg-surface px-3 py-1.5 text-text2 disabled:opacity-40">Berikutnya</button>
          </div>
        )}
      </section>
    </>
  );
}
