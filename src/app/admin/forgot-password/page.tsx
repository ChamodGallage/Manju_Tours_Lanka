"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch {
      setError("Password reset could not be started. Check the Supabase configuration and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EFE6] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#E8E2D2] bg-white p-8 shadow-xl">
        <Link href="/admin/login" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#0C5A70]">
          <ArrowLeft className="h-4 w-4" /> Back to admin login
        </Link>
        <h1 className="text-2xl font-extrabold text-[#17202A]">Reset your password</h1>
        <p className="mt-2 text-sm text-[#5B6770]">Enter your administrator email and Supabase will send a recovery link.</p>
        {sent ? (
          <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            If that account is eligible, a password reset email has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs font-bold text-[#17202A]">
              Admin email
              <span className="relative mt-2 block">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#5B6770]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E2D2] bg-[#FBF9F4] py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0C5A70]"
                />
              </span>
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0C5A70] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send recovery link
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
