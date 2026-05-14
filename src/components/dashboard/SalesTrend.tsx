'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SalesTrendProps {
  today: number;
  yesterday: number;
  percentageChange: number;
  isPositive: boolean;
}

/**
 * Shows today's sales vs yesterday with percentage change
 */
export function SalesTrend({
  today,
  yesterday,
  percentageChange,
  isPositive,
}: SalesTrendProps) {
  const formattedToday = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(today);

  const formattedYesterday = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(yesterday);

  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const changeBgColor = isPositive ? 'bg-emerald-50' : 'bg-rose-50';
  const changeIcon = isPositive ? (
    <TrendingUp size={16} className="text-emerald-600" />
  ) : (
    <TrendingDown size={16} className="text-rose-600" />
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formattedToday}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Yesterday</p>
            <p className="mt-1 text-lg text-gray-700">{formattedYesterday}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 rounded-xl ${changeBgColor} px-4 py-3`}>
          {changeIcon}
          <span className={`font-semibold ${changeColor}`}>
            {isPositive ? '+' : '-'}{Math.abs(percentageChange)}%
          </span>
          <span className="text-sm text-gray-600">vs yesterday</span>
        </div>
      </div>
    </div>
  );
}
