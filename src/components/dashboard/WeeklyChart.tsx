'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyMethodSales } from '@/lib/queries/dashboard';

interface WeeklyChartProps {
  data: DailyMethodSales[];
}

/**
 * Stacked bar chart showing sales by payment method for last 7 days
 */
export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((day) => ({
    name: new Date(day.date).toLocaleDateString('en-ET', { weekday: 'short' }),
    Cash: day.cash,
    Telebirr: day.telebirr,
    CBE: day.cbe,
    Dashen: day.dashen,
  }));

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('en-ET')} Br`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Weekly Sales by Method</h3>
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '0.875rem' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: any) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '1.5rem', fontSize: '0.875rem' }}
              iconType="square"
            />
            <Bar dataKey="Cash" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Telebirr" stackId="a" fill="#a855f7" radius={[8, 8, 0, 0]} />
            <Bar dataKey="CBE" stackId="a" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Dashen" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
