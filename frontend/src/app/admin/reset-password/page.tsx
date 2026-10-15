"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { confirmPasswordReset } from "firebase/auth";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Firebase Authentication is not configured.");
      }
      if (!oobCode) {
        throw new Error("Invalid or missing password reset code in URL. Please request a new link.");
      }
      await confirmPasswordReset(auth, oobCode, password);
      setSaved(true);
      setPassword("");
      setConfirmation("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "The recovery link is invalid or expired. Request a new link and try again.";
      setError(msg);
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
        <h1 className="text-2xl font-extrabold text-[#17202A]">Set a new password</h1>
        {saved ? (
          <div className="mt-6 space-y-4">
            <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Your password was updated.</p>
            <Link href="/admin/login" className="inline-block rounded-full bg-[#0C5A70] px-5 py-3 text-sm font-bold text-white">Return to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs font-bold text-[#17202A]">New password
              <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#E8E2D2] bg-[#FBF9F4] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0C5A70]" />
            </label>
            <label className="block text-xs font-bold text-[#17202A]">Confirm new password
              <input type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-[#E8E2D2] bg-[#FBF9F4] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0C5A70]" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0C5A70] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save new password
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C5A70]" />
        </div>
      }
    >
      <ResetPasswordFormContent />
    </React.Suspense>
  );
}
