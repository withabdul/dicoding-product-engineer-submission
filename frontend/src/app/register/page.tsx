"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, type RegisterInput } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const FIELDS: { key: keyof RegisterInput; label: string; type?: string }[] = [
  { key: "name", label: "Nama Anda" },
  { key: "email", label: "Email", type: "email" },
  { key: "password", label: "Kata sandi", type: "password" },
  { key: "password_confirmation", label: "Ulangi kata sandi", type: "password" },
  { key: "company_name", label: "Nama perusahaan" },
  { key: "company_sector", label: "Sektor bisnis" },
  { key: "company_size", label: "Jumlah karyawan (contoh: 50-100)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState<RegisterInput>({
    name: "", email: "", password: "", password_confirmation: "",
    company_name: "", company_sector: "", company_size: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage("");
    try {
      const { token, user } = await api.register(form);
      signIn(token, user);
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.errors);
        setMessage(e.message);
      }
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 px-6 py-16">
      <h1 className="text-2xl font-bold">Daftar sebagai Recruiter</h1>
      {message && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label htmlFor={f.key} className="mb-1 block text-sm font-medium">{f.label}</label>
          <input
            id={f.key}
            type={f.type ?? "text"}
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
          {errors[f.key] && <p className="mt-1 text-xs text-red-600">{errors[f.key][0]}</p>}
        </div>
      ))}
      <button className="w-full rounded bg-brand py-2.5 text-sm text-white">Daftar</button>
      <p className="text-sm text-gray-600">
        Sudah punya akun? <Link href="/login" className="text-accent underline">Masuk</Link>
      </p>
    </form>
  );
}
