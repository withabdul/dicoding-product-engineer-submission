"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Hero from "@/components/Hero";
import VacancyForm from "@/components/VacancyForm";

export default function EditVacancyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Owner fetch via my-vacancies so the salary is included even when hidden publicly.
  const { data, isLoading } = useQuery({
    queryKey: ["my-vacancies"],
    queryFn: api.myVacancies,
    enabled: !!user,
  });
  const vacancy = data?.find((v) => String(v.id) === id);

  if (!user || isLoading) return null;
  if (!vacancy) return <p className="p-10 text-red-600">Lowongan tidak ditemukan.</p>;

  return (
    <>
      <Hero tracking="-0.88px" title="Edit lowongan pekerjaan" />
      <VacancyForm
        submitLabel="Simpan perubahan"
        initial={{ ...vacancy, active_until: vacancy.active_until.slice(0, 10) }}
        onSubmit={async (v) => {
          await api.updateVacancy(id, v);
          qc.invalidateQueries({ queryKey: ["vacancies"] });
          qc.invalidateQueries({ queryKey: ["vacancy", id] });
          qc.invalidateQueries({ queryKey: ["my-vacancies"] });
        }}
      />
    </>
  );
}
