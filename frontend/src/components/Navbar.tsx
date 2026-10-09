"use client";

/* eslint-disable @next/next/no-img-element -- small static SVG */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const item = (href: string, label: string, active: boolean) => (
    <Link href={href} className="text-body relative h-8 px-2 leading-6">
      {label}
      {active && (
        <span className="absolute top-7 left-1/2 h-1 w-5 -translate-x-1/2 rounded-[1px] bg-ink" />
      )}
    </Link>
  );

  return (
    <header className="border-b border-line bg-white">
      <nav className="flex h-[69px] items-start gap-8 px-6 pt-[23px] lg:px-[60px]">
        <Link href="/" className="-mt-1 flex h-8 w-[81px] shrink-0 items-center gap-0.5 text-brand">
          <img src="/assets/favicon.svg" alt="" width={28} height={28} className="ml-0.5" />
          <span className="text-[20.5px] font-medium tracking-[-0.39px]">Jobs</span>
        </Link>
        {item("/", "Lowongan Kerja", pathname === "/")}
        {item("/dashboard", "Dashboard", pathname === "/dashboard")}
        <div className="text-small -mt-1 ml-auto flex h-8 items-center gap-4">
          {loading ? null : user ? (
            <>
              <span className="text-muted">{user.company.name}</span>
              <button onClick={signOut} className="rounded-[2px] border border-line bg-surface px-3 py-1 text-text2">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Masuk</Link>
              <Link href="/register" className="rounded-[2px] bg-brand px-3 py-1 text-white">
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
