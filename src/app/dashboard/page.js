"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBusinessData } from "@/lib/useBusinessData";
import { logout } from "@/lib/businessStore";
import {
  LayoutDashboard, Package, TrendingUp, BarChart3,
  LogOut, Plus, Search, Bell
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

const StatCard = ({ title, amount, change, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
    <div className={`w-full h-1 rounded-full mb-4 ${color}`} />
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{amount}</h3>
    <p className="text-green-500 text-xs mt-2 flex items-center gap-1">
      <TrendingUp size={14} /> {change} <span className="text-gray-400">from last month</span>
    </p>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const { user, dashboard, loading, error } = useBusinessData();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
            <p className="mt-4 text-gray-500">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
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
            <h1 className="text-3xl font-semibold mb-4">Start with a business name</h1>
            <Link className="inline-flex rounded-md bg-[#151515] px-5 py-3 font-semibold text-white" href="/">
              Go to login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const lowStock = dashboard.products.filter((product) => Number(product.stock) <= 5);

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
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active href="/dashboard" />
          <SidebarItem icon={Plus} label="Transaction" href="/transaction" />
          <SidebarItem icon={Package} label="Inventory" href="/inventory" />
          <SidebarItem icon={BarChart3} label="Insights" href="/insights" />

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
            <h1 className="text-2xl font-bold">Welcome, {user?.business_name || 'Business'} 👋</h1>
            <p className="text-gray-500 mt-1">{user.business_type}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-purple-500/20"
              />
            </div>
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
              <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                {user?.business_name?.charAt(0).toUpperCase() || 'B'}
              </div>
            </div>
          </div>
        </header>

        {error ? <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div> : null}

        {/* TOP STATS */}
        <div className="flex gap-6 mb-8">
          <StatCard title="Sales Today" amount={money.format(dashboard.totalSalesToday)} change="+12.5%" color="bg-purple-500" />
          <StatCard title="Transactions" amount={dashboard.transactionCount} change="+8.1%" color="bg-green-400" />
          <StatCard title="Best Product" amount={dashboard.bestSellingProduct} change="+15.3%" color="bg-cyan-400" />
          <StatCard title="Est. Profit" amount={money.format(dashboard.estimatedProfit)} change="+2.4%" color="bg-orange-400" />
        </div>

        {/* GRIDS */}
        <div className="grid grid-cols-3 gap-6">

          {/* STOCK OVERVIEW */}
          <div className="col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold">Stock Overview</h2>
              <Link href="/inventory" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Manage Stock
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.products.length ? (
                    dashboard.products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-4 font-medium">{product.name}</td>
                        <td className="py-4">{money.format(Number(product.price))}</td>
                        <td className="py-4">{product.stock}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] ${Number(product.stock) <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {Number(product.stock) <= 5 ? "Low Stock" : "Ready"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-8 text-center text-gray-400" colSpan="4">
                        Add products or record a sale to start tracking stock.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold mb-4">AI Insights</h2>
            <div className="space-y-3">
              {dashboard.insights.length ? (
                dashboard.insights.slice(0, 4).map((insight) => (
                  <div key={insight.id} className="rounded-lg bg-purple-50 border border-purple-100 p-4">
                    <p className="text-purple-600 text-xs font-semibold uppercase tracking-wider">{insight.type}</p>
                    <p className="text-gray-700 text-sm mt-2">{insight.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
                  <p className="text-gray-500 text-sm">Record a sale to generate the first recommendation.</p>
                </div>
              )}
            </div>
          </div>

          {/* LOW STOCK ALERTS */}
          <div className="col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold mb-4">Low Stock Alerts</h2>
            <div className="space-y-3">
              {lowStock.length ? (
                lowStock.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 border border-red-100">
                    <span className="font-semibold text-red-700">{product.name}</span>
                    <span className="text-red-600">{product.stock} left</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">All tracked products have enough stock.</p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/transaction" className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                + Record Sale
              </Link>
              <Link href="/inventory" className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Add Product
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
