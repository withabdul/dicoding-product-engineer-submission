"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Hero from "@/components/Hero";
import VacancyForm from "@/components/VacancyForm";

export default function NewVacancyPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (!user) return null;

  return (
    <>
      <Hero
        tracking="-0.88px"
        pillClass="ml-3 -translate-y-[3px]"
        title="Buat lowongan pekerjaan"
        subtitle={
          <>
            Dicoding Jobs menghubungkan industri dengan talenta yang tepat.
            <br />
            Mencari tim baru tidak harus melelahkan dan boros biaya.
          </>
        }
      />
      <VacancyForm
        submitLabel="Buat lowongan"
        onSubmit={async (v) => {
          await api.createVacancy(v);
          qc.invalidateQueries({ queryKey: ["vacancies"] });
          qc.invalidateQueries({ queryKey: ["my-vacancies"] });
        }}
      />
    </>
  );
}
