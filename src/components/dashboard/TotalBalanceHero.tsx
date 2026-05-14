'use client';

import React, { useEffect, useState } from 'react';

interface TotalBalanceHeroProps {
  totalBalance: number;
  lastUpdated: Date | null;
  isUpdating?: boolean;
}

/**
 * Large display of total balance across all payment methods
 * Shows last updated time and pulses when updated
 */
export function TotalBalanceHero({
  totalBalance,
  lastUpdated,
  isUpdating = false,
}: TotalBalanceHeroProps) {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  const formattedBalance = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(totalBalance);

  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Loading...';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins === 0) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    return lastUpdated.toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 p-8 text-white shadow-lg transition-all ${
        showPulse ? 'animate-pulse' : ''
      }`}
    >
      <p className="text-sm font-medium uppercase tracking-wider opacity-90">
        Total Balance
      </p>
      <h1 className="mt-2 text-5xl font-bold tracking-tight">{formattedBalance}</h1>
      <p className="mt-4 text-sm opacity-75">Last updated: {getLastUpdatedText()}</p>
    </div>
  );
}
