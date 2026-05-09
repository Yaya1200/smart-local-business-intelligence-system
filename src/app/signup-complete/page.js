"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, LayoutDashboard, Package, TrendingUp, ArrowRight } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-purple-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(126,34,206,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.16),_transparent_25%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white to-transparent" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center gap-10 lg:pr-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600 shadow-sm shadow-purple-100">
              <CheckCircle2 size={16} />
              <span>Account Created</span>
            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
              Welcome to your business dashboard.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Your account for <strong>{email}</strong> has been successfully created and verified. You're all set to start tracking your sales, managing inventory, and getting business insights.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: <LayoutDashboard className="text-purple-600" />, title: "Dashboard ready", label: "Your workspace is set up" },
              { icon: <Package className="text-blue-600" />, title: "Sample inventory", label: "Pre-loaded with starter products" },
              { icon: <TrendingUp className="text-indigo-600" />, title: "Track everything", label: "Sales, stock, and insights" }
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
        </div>

        <div className="relative w-full max-w-[520px] lg:justify-self-end">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-purple-200/70 via-transparent to-transparent opacity-60 blur-2xl" />
          <div className="relative rounded-[2rem] border border-slate-200 bg-white/95 p-1 shadow-2xl shadow-purple-100">
            <div className="rounded-[1.8rem] bg-white p-8 shadow-sm">
              <div className="mb-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">Ready to get started?</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">Your business dashboard awaits.</h2>
                <p className="mt-2 text-sm text-slate-500">Click below to access your personalized workspace and start managing your business.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 font-semibold text-white transition hover:bg-purple-700 focus:ring-4 focus:ring-purple-500/20"
                >
                  <ArrowRight size={18} />
                  Go to dashboard
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:border-purple-300 hover:text-purple-600 focus:ring-4 focus:ring-purple-500/10"
                >
                  Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
