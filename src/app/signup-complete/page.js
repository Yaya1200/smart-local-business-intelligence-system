"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#151515]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 md:grid-cols-[1fr_440px] md:px-8">
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f7d68]">
              Account Created
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-[#151515] md:text-7xl">
              Welcome to your business dashboard.
            </h1>
          </div>
          <div className="max-w-3xl text-lg text-[#65605a]">
            <p>Your account for <strong>{email}</strong> has been successfully created and verified.</p>
            <p className="mt-3">You're all set to start tracking your sales, managing inventory, and getting business insights.</p>
          </div>
        </div>

        <div className="rounded-lg border border-[#d8d0c2] bg-white p-6 shadow-xl shadow-black/5">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Ready to get started?</h2>
            <p className="mt-2 text-sm text-[#65605a]">
              Click below to access your business dashboard.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#151515] px-5 font-semibold text-white transition hover:bg-[#2f7d68]"
          >
            <span aria-hidden="true">→</span>
            Go to dashboard
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-md border border-[#d8d0c2] text-sm font-semibold text-[#34302c] transition hover:border-[#2f7d68] hover:text-[#2f7d68]"
          >
            Back to login
          </button>
        </div>
      </section>
    </main>
  );
}
