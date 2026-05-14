'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { TotalBalanceHero } from '@/components/dashboard/TotalBalanceHero';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { SalesTrend } from '@/components/dashboard/SalesTrend';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { DollarSign, Wallet, CreditCard } from 'lucide-react';

interface DashboardClientWrapperProps {
  businessId: string;
  businessName: string;
}

/**
 * Client component that handles real-time updates and renders the dashboard
 */
export default function DashboardClientWrapper({
  businessId,
  businessName,
}: DashboardClientWrapperProps) {
  const {
    balances,
    todayVsYesterday,
    weeklyData,
    isLoading,
    error,
    lastUpdated,
  } = useDashboard(businessId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Loading balance dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-900">Error loading dashboard</h2>
          <p className="mt-2 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!balances || !todayVsYesterday) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{businessName}</h1>
          <p className="mt-2 text-gray-600">Unified Balance Dashboard</p>
        </div>

        {/* Total Balance Hero */}
        <div className="mb-8">
          <TotalBalanceHero
            totalBalance={balances.total}
            lastUpdated={lastUpdated}
            isUpdating={false}
          />
        </div>

        {/* Payment Method Balances */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Balance by Payment Method</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <BalanceCard
              label="Cash"
              amount={balances.cash}
              icon={<DollarSign size={24} />}
              color="bg-green-50"
              textColor="text-green-600"
              borderColor="border-green-200"
            />
            <BalanceCard
              label="Telebirr"
              amount={balances.telebirr}
              icon={<Wallet size={24} />}
              color="bg-purple-50"
              textColor="text-purple-600"
              borderColor="border-purple-200"
            />
            <BalanceCard
              label="CBE"
              amount={balances.cbe}
              icon={<CreditCard size={24} />}
              color="bg-blue-50"
              textColor="text-blue-600"
              borderColor="border-blue-200"
            />
            <BalanceCard
              label="Dashen"
              amount={balances.dashen}
              icon={<Wallet size={24} />}
              color="bg-amber-50"
              textColor="text-amber-600"
              borderColor="border-amber-200"
            />
          </div>
        </div>

        {/* Sales Trend & Weekly Chart */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            {todayVsYesterday && (
              <SalesTrend
                today={todayVsYesterday.today}
                yesterday={todayVsYesterday.yesterday}
                percentageChange={todayVsYesterday.percentageChange}
                isPositive={todayVsYesterday.isPositive}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <WeeklyChart data={weeklyData} />
          </div>
        </div>
      </div>
    </div>
  );
}
