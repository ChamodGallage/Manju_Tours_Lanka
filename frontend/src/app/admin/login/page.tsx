"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect") || "/admin";
  const redirectPath = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
    ? requestedRedirect
    : "/admin";
  const setupNotice = searchParams.get("notice");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (failedAttempts >= 5) {
      setErrorMessage("Too many failed login attempts. Please wait 1 minute before trying again.");
      setLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error(
          "Firebase Authentication is not configured. Please add the 6 NEXT_PUBLIC_FIREBASE_* keys to .env.local."
        );
      }
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (userCredential?.user) {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: unknown) {
      setFailedAttempts((prev) => prev + 1);
      let msg = "Failed to sign in.";
      if (err instanceof Error) {
        if (
          err.message.includes("auth/invalid-credential") ||
          err.message.includes("auth/wrong-password") ||
          err.message.includes("auth/user-not-found")
        ) {
          msg = "Invalid administrator email or password.";
        } else if (err.message.includes("auth/too-many-requests")) {
          msg = "Too many failed attempts. Access to this account has been temporarily disabled. Please try again later.";
        } else {
          msg = err.message;
        }
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Back to Public Site */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0C5A70] hover:text-[#083B4A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Manju Tours Lanka Website</span>
        </Link>

        {/* Logo */}
        <div className="relative w-20 h-20 mx-auto mb-4 bg-white rounded-3xl p-2 shadow-sm border border-[#E8E2D2]">
          <Image
            src="/images/logo.png"
            alt="Manju Tours Lanka"
            width={80}
            height={80}
            className="w-full h-full object-contain"
          />
        </div>

        <h2 className="text-2xl font-extrabold text-[#17202A] tracking-tight">
          Admin Portal Login
        </h2>
        <p className="mt-1 text-xs text-[#5B6770]">
          Manage website photography, tours, and destination media
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-[#E8E2D2] sm:px-10">
          {(setupNotice === "setup_required" || !isFirebaseConfigured()) && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Firebase Setup Notice:</strong>
                Please ensure <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_API_KEY</code> and project credentials are configured in your <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code>.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5B6770] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="your-admin-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4] text-[#17202A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5B6770] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4] text-[#17202A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-full text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In as Administrator</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E2D2] text-center">
            <Link href="/admin/forgot-password" className="text-xs font-bold text-[#0C5A70] hover:underline">
              Forgot password?
            </Link>
            <p className="text-[11px] text-[#5B6770]">
              Only explicitly provisioned administrator accounts can access this panel. There is no public admin signup form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C5A70]" />
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
