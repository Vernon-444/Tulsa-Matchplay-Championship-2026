"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border-2 border-[#EBAD21] bg-[#162B49]/90 p-6 shadow-xl">
        <h2 className="text-center text-lg font-semibold text-[#F8F1E0]">
          Admin · Log in
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F8F1E0]/90">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-lg border border-[#EBAD21]/50 bg-[#162B49] px-3 py-2 text-[#F8F1E0] placeholder-[#F8F1E0]/50 focus:border-[#EBAD21] focus:outline-none focus:ring-1 focus:ring-[#EBAD21]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F8F1E0]/90">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded-lg border border-[#EBAD21]/50 bg-[#162B49] px-3 py-2 text-[#F8F1E0] placeholder-[#F8F1E0]/50 focus:border-[#EBAD21] focus:outline-none focus:ring-1 focus:ring-[#EBAD21]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[#C6202E]/20 px-3 py-2 text-sm text-[#F8F1E0]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border-2 border-[#EBAD21] bg-[#EBAD21] py-2.5 text-sm font-medium text-[#162B49] transition-colors hover:bg-[#EBAD21]/90 disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Log in"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-4 block w-full rounded-lg border-2 border-[#EBAD21]/60 py-2 text-center text-sm font-medium text-[#F8F1E0] transition-colors hover:bg-[#EBAD21]/20"
        >
          Back to bracket
        </Link>
      </div>
    </div>
  );
}
