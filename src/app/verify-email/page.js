"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { businessApi, hasSupabase } from "@/lib/businessStore";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const businessNameParam = searchParams.get("businessName");
    const businessTypeParam = searchParams.get("businessType");
    const passwordParam = searchParams.get("password");

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setStatusMessage("Enter the verification code sent to your email.");
    }
    if (businessNameParam) setBusinessName(decodeURIComponent(businessNameParam));
    if (businessTypeParam) setBusinessType(decodeURIComponent(businessTypeParam));
    if (passwordParam) setPassword(decodeURIComponent(passwordParam));
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !otp.trim()) {
      setError("Enter your email and verification code.");
      return;
    }

    try {
      setSubmitting(true);
      await businessApi.verifySignupOtp({ email, code: otp });
      if (businessName && password) {
        await businessApi.signUp({ businessName, businessType, email, password });
      }
      router.push("/signup-complete?email=" + encodeURIComponent(email));
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#151515]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 md:grid-cols-[1fr_440px] md:px-8">
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f7d68]">
              Email Verification
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-[#151515] md:text-7xl">
              Verify your email to complete signup.
            </h1>
          </div>
          <div className="max-w-3xl text-lg text-[#65605a]">
            <p>We sent a verification code to <strong>{email}</strong>.</p>
            <p className="mt-3">Enter the code below to verify your email and complete your account setup.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#d8d0c2] bg-white p-6 shadow-xl shadow-black/5"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Verify your email</h2>
            <p className="mt-2 text-sm text-[#65605a]">
              {hasSupabase ? "Emails sent via Supabase Auth." : "Demo verification code shown in console."}
            </p>
          </div>

          <label className="block text-sm font-medium text-[#34302c]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="mt-2 h-12 w-full rounded-md border border-[#cfc6b7] bg-[#f5f3f0] px-4 outline-none text-[#65605a]"
          />

          <label className="mt-5 block text-sm font-medium text-[#34302c]" htmlFor="otp">
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            autoComplete="off"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-[#cfc6b7] bg-[#fffdf8] px-4 outline-none transition focus:border-[#2f7d68] focus:ring-4 focus:ring-[#2f7d68]/15"
            placeholder="Enter 6-digit code"
          />

          {statusMessage ? <p className="mt-4 text-sm font-medium text-[#2f7d68]">{statusMessage}</p> : null}
          {error ? <p className="mt-4 text-sm font-medium text-[#b42318]">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#151515] px-5 font-semibold text-white transition hover:bg-[#2f7d68] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true">✓</span>
            {submitting ? "Verifying..." : "Verify code"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-md border border-[#d8d0c2] text-sm font-semibold text-[#34302c] transition hover:border-[#2f7d68] hover:text-[#2f7d68]"
          >
            Back to login
          </button>
        </form>
      </section>
    </main>
  );
}
