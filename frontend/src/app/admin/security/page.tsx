"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminSecurityPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(() => Boolean(getFirebaseAuth()));
  const [error, setError] = useState(() => (getFirebaseAuth() ? "" : "Firebase Authentication is not configured."));

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email || "Email not available");
        setError("");
      } else {
        setError("No active administrator session detected.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#17202A]">Admin Account & Security</h1>
        <p className="mt-1 text-sm text-[#5B6770]">Review your signed-in account and manage its password securely through Firebase Authentication.</p>
      </div>
      <section className="rounded-2xl border border-[#E8E2D2] bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#0C5A70]" />
          <h2 className="font-bold text-[#17202A]">Administrator session</h2>
        </div>
        <p className="mt-3 text-sm text-[#5B6770]">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : error || email}</p>
        <Link href="/admin/forgot-password" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0C5A70] px-5 py-2.5 text-xs font-bold text-white">
          <KeyRound className="h-4 w-4" /> Send password reset email
        </Link>
      </section>
      <section className="rounded-2xl border border-[#E8E2D2] bg-white p-6 text-sm text-[#5B6770]">
        <h2 className="font-bold text-[#17202A]">Where to find your admin email</h2>
        <p className="mt-2">The email shown above is the account currently signed in. The authorized account list is in your Firebase project under Firebase Console → Build → Authentication → Users. Admin access is granted separately to explicitly provisioned users.</p>
      </section>
    </div>
  );
}
