'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type {
  BalanceByMethod,
  TodayVsYesterdaySales,
  DailyMethodSales,
} from '@/lib/queries/dashboard';

interface UseDashboardReturn {
  balances: BalanceByMethod | null;
  todayVsYesterday: TodayVsYesterdaySales | null;
  weeklyData: DailyMethodSales[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Client-side hook for dashboard data with real-time updates
 * Fetches initial data and subscribes to transaction changes via Supabase Realtime
 */
export function useDashboard(businessId: string | null): UseDashboardReturn {
  const [balances, setBalances] = useState<BalanceByMethod | null>(null);
  const [todayVsYesterday, setTodayVsYesterday] = useState<TodayVsYesterdaySales | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyMethodSales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const [balancesRes, salesRes, weeklyRes] = await Promise.all([
        fetch('/api/dashboard/balances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId }),
        }),
        fetch('/api/dashboard/sales-trend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId }),
        }),
        fetch('/api/dashboard/weekly-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId }),
        }),
      ]);

      if (!balancesRes.ok || !salesRes.ok || !weeklyRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const balancesData = (await balancesRes.json()) as BalanceByMethod;
      const salesData = (await salesRes.json()) as TodayVsYesterdaySales;
      const weeklyChartData = (await weeklyRes.json()) as DailyMethodSales[];

      setBalances(balancesData);
      setTodayVsYesterday(salesData);
      setWeeklyData(weeklyChartData);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!businessId) return;

    const subscription = supabase
      .channel(`transactions:business_id=eq.${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transactions',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log('Real-time transaction update:', payload);
          // Re-fetch data when a transaction changes
          fetchDashboardData();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Dashboard subscribed to real-time updates');
        }
        if (status === 'CLOSED') {
          console.log('Dashboard subscription closed');
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [businessId, supabase, fetchDashboardData]);

  return {
    balances,
    todayVsYesterday,
    weeklyData,
    isLoading,
    error,
    lastUpdated,
  };
}
