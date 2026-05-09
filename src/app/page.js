"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { businessApi, hasSupabase } from "@/lib/businessStore";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  LayoutDashboard, 
  LineChart, 
  Store 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (mode === "signup" && !businessName.trim()) {
      setError("A business name is required to initialize your workspace.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setError("Security requirement: Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "signup") {
        await businessApi.requestSignupOtp({ email });
        const params = new URLSearchParams({
          email: email,
          businessName: businessName,
          businessType: businessType,
          password: password,
        });
        router.push(`/verify-email?${params.toString()}`);
        return;
      } else {
        await businessApi.login({ email, password });
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-purple-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(126,34,206,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.16),_transparent_25%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white to-transparent" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center gap-10 lg:pr-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600 shadow-sm shadow-purple-100">
              <Zap size={16} />
              <span>Smarter business operations</span>
            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
              The local business dashboard built for speed, clarity, and growth.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Seamlessly track sales, inventory, and performance in one polished workspace. Designed to make daily operations easier and more profitable for small shops.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: <CheckCircle2 className="text-purple-600" />, title: "Real-time insights", label: "Instant business visibility" },
              { icon: <ShieldCheck className="text-blue-600" />, title: "Secure access", label: "Protected by modern auth" },
              { icon: <Store className="text-indigo-600" />, title: "Stock management", label: "Keep inventory in sync" }
            ].map((item, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-xl shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Designed for owners</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Simple setup, instant results.</p>
            </div>
            <div className="flex flex-col justify-end gap-1">
              <p className="text-sm text-slate-600">Built to help your team work faster and keep every metric under control.</p>
              <p className="text-sm font-semibold text-slate-900">Trusted by local shops and cafes.</p>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-[520px] lg:justify-self-end">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-purple-200/70 via-transparent to-transparent opacity-60 blur-2xl" />
          <div className="relative rounded-[2rem] border border-slate-200 bg-white/95 p-1 shadow-2xl shadow-purple-100">
            <div className="rounded-[1.8rem] bg-white p-8 shadow-sm">
              <div className="mb-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">Welcome back</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">Sign in or set up your workspace.</h2>
                <p className="mt-2 text-sm text-slate-500">Secure login, friendly onboarding, and a quick path to your dashboard.</p>
              </div>

              <div className="mb-6 flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    mode === "login" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); }}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    mode === "signup" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                    placeholder="name@business.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                    placeholder="••••••••"
                  />
                </div>

                {mode === "signup" && (
                  <div className="grid gap-5">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="business-name">
                        Business name
                      </label>
                      <input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                        placeholder="Titan Coffee Co."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="business-type">
                        Business type
                      </label>
                      <input
                        id="business-type"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                        placeholder="e.g. Retail, Food & Beverage"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-200/30 transition hover:bg-purple-700 disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>{mode === "signup" ? "Create account" : "Sign in"}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <Link
              href="/dashboard"
              className="block rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-center transition hover:border-purple-300 hover:bg-white"
            >
              <p className="font-semibold text-slate-900">Launch the demo dashboard</p>
              <p className="mt-1 text-sm text-slate-500">No sign up needed—preview the workflow instantly.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}