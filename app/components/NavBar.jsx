"use client";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/80 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-white">
          Expense Tracker
        </Link>
        <nav className="flex gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition"
          >
            Home
          </Link>
          <Link
            href="/analytics"
            className="px-3 py-1.5 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition"
          >
            Analytics
          </Link>
        </nav>
      </div>
    </header>
  );
}
