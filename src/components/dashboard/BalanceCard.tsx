'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceCardProps {
  label: string;
  amount: number;
  icon: React.ReactNode;
  color: string; // Tailwind color class like 'bg-green-50', 'text-green-600'
  textColor: string; // Text color like 'text-green-600'
  borderColor: string; // Border color like 'border-green-200'
}

/**
 * Individual balance card for a payment method
 */
export function BalanceCard({
  label,
  amount,
  icon,
  color,
  textColor,
  borderColor,
}: BalanceCardProps) {
  const formattedAmount = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div className={`${color} rounded-2xl border ${borderColor} p-6 shadow-sm transition hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${textColor} text-2xl`}>{icon}</div>
        <span className={`text-xs font-medium uppercase tracking-wider ${textColor}`}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className={`text-2xl font-bold ${textColor}`}>{formattedAmount}</h3>
        <div className="flex items-center gap-1">
          {amount >= 0 ? (
            <TrendingUp size={16} className={`${textColor}`} />
          ) : (
            <TrendingDown size={16} className="text-red-600" />
          )}
        </div>
      </div>
    </div>
  );
}
