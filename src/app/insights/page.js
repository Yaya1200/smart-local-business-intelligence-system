"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useBusinessData } from "@/lib/useBusinessData";
import { logout } from "@/lib/businessStore";
import {
  LayoutDashboard, Package, TrendingUp, BarChart3,
  LogOut, Plus, Search, Bell, Target, Zap
} from 'lucide-react';

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, href }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default function InsightsPage() {
  const { dashboard, loading } = useBusinessData();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const trends = useMemo(() => {
    const totals = {};
    dashboard?.allTransactions.forEach((transaction) => {
      if (!totals[transaction.product_name]) {
        totals[transaction.product_name] = { quantity: 0, revenue: 0 };
      }
      totals[transaction.product_name].quantity += Number(transaction.quantity);
      totals[transaction.product_name].revenue += Number(transaction.total);
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [dashboard?.allTransactions]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-[#0f0f12] text-white flex flex-col">
          <div className="p-6 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">B</div>
            <span className="text-xl font-bold tracking-tight">Business BI</span>
          </div>
        </aside>
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading insights...</p>
          </div>
        </main>
      </div>
    );
  }

  const lowPerforming = dashboard?.products.filter(
    (product) => !trends.some((trend) => trend.name.toLowerCase() === product.name.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f0f12] text-white flex flex-col">
        <div className="p-6 flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">B</div>
          <span className="text-xl font-bold tracking-tight">Business BI</span>
        </div>

        <nav className="flex-1">
          <p className="px-6 text-[10px] uppercase text-gray-500 font-bold mb-2">Main</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          <SidebarItem icon={Plus} label="Transaction" href="/transaction" />
          <SidebarItem icon={Package} label="Inventory" href="/inventory" />
          <SidebarItem icon={BarChart3} label="Insights" active href="/insights" />

          <p className="px-6 text-[10px] uppercase text-gray-500 font-bold mt-8 mb-2">General</p>
          <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-gray-400 hover:text-white">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </div>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-purple-900 to-black rounded-xl border border-white/10">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center mb-3">⭐</div>
          <p className="text-sm font-bold">Pro Features</p>
          <p className="text-[10px] text-gray-400 mt-1">Advanced analytics and reporting.</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Business Insights</h1>
            <p className="text-gray-500 mt-1">AI-powered analytics and recommendations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search insights..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-purple-500/20"
              />
            </div>
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
              <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                B
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

          {/* PERFORMANCE TRENDS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Performance Trends</h2>
                <p className="text-gray-500 text-sm">Your best-selling products</p>
              </div>
            </div>

            <div className="space-y-4">
              {trends.length ? (
                trends.slice(0, 5).map((trend, index) => (
                  <div key={trend.name} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{trend.name}</p>
                        <p className="text-sm text-gray-500">{trend.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{money.format(trend.revenue)}</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, (trend.quantity / trends[0]?.quantity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No sales data yet</p>
                  <p className="text-sm text-gray-400 mt-1">Trends will appear after transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Recommendations</h2>
                <p className="text-gray-500 text-sm">Smart insights for your business</p>
              </div>
            </div>

            <div className="space-y-4">
              {dashboard?.insights.length ? (
                dashboard.insights.map((insight) => (
                  <div key={insight.id} className="p-4 rounded-xl border border-purple-100 bg-purple-50">
                    <div className="flex items-start gap-3">
                      <Target size={20} className="text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">{insight.type}</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Zap size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No insights yet</p>
                  <p className="text-sm text-gray-400 mt-1">AI recommendations will appear after sales</p>
                </div>
              )}
            </div>
          </div>

          {/* LOW PERFORMERS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Low Performers</h2>
                <p className="text-gray-500 text-sm">Products that need attention</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {lowPerforming?.length ? (
                lowPerforming.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-200 bg-orange-50">
                    <Package size={20} className="text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-700">{product.name}</p>
                      <p className="text-sm text-orange-600">{product.stock} in stock</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target size={32} className="text-green-600" />
                  </div>
                  <p className="text-gray-500 font-medium">All products performing well!</p>
                  <p className="text-sm text-gray-400 mt-1">No low performers detected</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
