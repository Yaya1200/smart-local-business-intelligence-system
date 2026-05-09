"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { businessApi, logout } from "@/lib/businessStore";
import { useBusinessData } from "@/lib/useBusinessData";
import {
  LayoutDashboard, Package, TrendingUp, BarChart3,
  LogOut, Plus, Search, Bell, Minus, Plus as PlusIcon
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

export default function InventoryPage() {
  const router = useRouter();
  const { user, dashboard, loading, refresh } = useBusinessData();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const addProduct = async (event) => {
    event.preventDefault();
    setError("");

    if (!user || !name.trim() || Number(price) < 0 || Number(stock) < 0) {
      setError("Enter product name, price, and stock.");
      return;
    }

    try {
      setSaving(true);
      await businessApi.addProduct(user.id, { name, price, stock });
      setName("");
      setPrice("");
      setStock("");
      await refresh();
    } catch (err) {
      setError(err.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const updateStock = async (productId, nextStock) => {
    if (!user) return;
    await businessApi.updateStock(user.id, productId, nextStock);
    await refresh();
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
            <p className="mt-4 text-gray-500">Loading inventory...</p>
          </div>
        </main>
      </div>
    );
  }

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
          <SidebarItem icon={Package} label="Inventory" active href="/inventory" />
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
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-gray-500 mt-1">Manage your products and stock levels</p>
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

        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">

          {/* ADD PRODUCT FORM */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={addProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">Product Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Coffee Beans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="price">Price ($)</label>
                <input
                  id="price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="4.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="stock">Initial Stock</label>
                <input
                  id="stock"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  type="number"
                  min="0"
                  placeholder="50"
                />
              </div>

              {error ? <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div> : null}

              <button
                disabled={saving}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <PlusIcon size={18} />
                {saving ? "Adding..." : "Add Product"}
              </button>
            </form>
          </div>

          {/* CURRENT STOCK */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Current Stock</h2>
            <div className="space-y-4">
              {dashboard?.products.length ? (
                dashboard.products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{money.format(Number(product.price))} each</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${Number(product.stock) <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {Number(product.stock) <= 5 ? "Low Stock" : "In Stock"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateStock(product.id, Math.max(0, Number(product.stock) - 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          aria-label={`Decrease ${product.name} stock`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold">{product.stock}</span>
                        <button
                          type="button"
                          onClick={() => updateStock(product.id, Number(product.stock) + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          aria-label={`Increase ${product.name} stock`}
                        >
                          <PlusIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No products added yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first product to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
