"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { token, user } = await api.login(email, password);
      signIn(token, user);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Terjadi kesalahan");
    }
  }

  const input = "w-full rounded border border-line px-3 py-2 text-sm";
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 px-6 py-16">
      <h1 className="text-2xl font-bold">Masuk sebagai Recruiter</h1>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Kata sandi</label>
        <input id="password" type="password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="w-full rounded bg-brand py-2.5 text-sm text-white">Masuk</button>
      <p className="text-sm text-gray-600">
        Belum punya akun? <Link href="/register" className="text-accent underline">Daftar</Link>
      </p>
    </form>
  );
}
