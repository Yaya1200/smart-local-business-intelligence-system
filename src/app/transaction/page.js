"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { businessApi, logout } from "@/lib/businessStore";
import { useBusinessData } from "@/lib/useBusinessData";
import {
  LayoutDashboard, Package, BarChart3,
  LogOut, Plus, Search, Bell, ShoppingCart, DollarSign
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

export default function AddTransactionPage() {
  const router = useRouter();
  const { user, dashboard, loading } = useBusinessData();
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const selectedProduct = useMemo(
    () =>
      dashboard?.products.find(
        (product) => product.name.toLowerCase() === productName.trim().toLowerCase(),
      ),
    [dashboard?.products, productName],
  );

  const total = Number(quantity || 0) * Number(price || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Login with a business name first.");
      return;
    }

    if (!productName.trim() || Number(quantity) <= 0 || Number(price) < 0) {
      setError("Enter product name, quantity, and price.");
      return;
    }

    try {
      setSubmitting(true);
      await businessApi.addTransaction(user.id, { 
        productName, 
        quantity: Number(quantity), 
        price: Number(price) 
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not save transaction.");
    } finally {
      setSubmitting(false);
    }
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
            <p className="mt-4 text-gray-500">Loading transaction form...</p>
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
          <SidebarItem icon={Plus} label="Transaction" active href="/transaction" />
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
            <h1 className="text-2xl font-bold">Record Transaction</h1>
            <p className="text-gray-500 mt-1">Add a new sale to your business records</p>
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
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-white font-bold bg-purple-600">
                {user?.business_name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TRANSACTION FORM */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">New Transaction</h2>
                <p className="text-gray-500 text-sm">Record a sale for your business</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="product-name">
                  Product Name
                </label>
                <input
                  id="product-name"
                  list="products"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Select or type product name"
                />
                <datalist id="products">
                  {dashboard?.products.map((product) => (
                    <option key={product.id} value={product.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="quantity">
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="price">
                    Price per Unit ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="4.99"
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                   Current stock: {selectedProduct.stock}. This sale will update inventory automatically.
                </div>
              )}

              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

              <div className="flex gap-3">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <DollarSign size={18} />
                  {submitting ? "Saving..." : "Save transaction"}
                </button>
              </div>
            </form>
          </div>

          {/* SIDEBAR PREVIEW */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Sale Preview</h2>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Product</dt>
                  <dd className="font-semibold">{productName || "Not selected"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Quantity</dt>
                  <dd className="font-semibold">{quantity || 0}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-4">
                  <dt className="text-gray-500 font-medium">Total Amount</dt>
                  <dd className="text-2xl font-bold text-purple-600">{money.format(total)}</dd>
                </div>
              </dl>
            </div>

            {dashboard?.transactions?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Sales</h3>
                <div className="space-y-4">
                  {dashboard.transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{transaction.product_name}</p>
                        <p className="text-xs text-gray-400">{new Date(transaction.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-bold">{money.format(Number(transaction.total))}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}