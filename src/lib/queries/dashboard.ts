import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type PaymentMethod = 'cash' | 'telebirr' | 'cbe' | 'dashen';

export interface BalanceByMethod {
  cash: number;
  telebirr: number;
  cbe: number;
  dashen: number;
  total: number;
}

export interface TodayVsYesterdaySales {
  today: number;
  yesterday: number;
  percentageChange: number;
  isPositive: boolean;
}

export interface DailyMethodSales {
  date: string;
  cash: number;
  telebirr: number;
  cbe: number;
  dashen: number;
  total: number;
}

/**
 * Get balance for each payment method and total balance
 * Balance = SUM(sales) - SUM(expenses) per payment method
 */
export async function getBalanceByPaymentMethod(
  businessId: string
): Promise<BalanceByMethod> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Handle cookie setting errors silently
          }
        },
      },
    }
  );

  const methods: PaymentMethod[] = ['cash', 'telebirr', 'cbe', 'dashen'];
  const balances: BalanceByMethod = {
    cash: 0,
    telebirr: 0,
    cbe: 0,
    dashen: 0,
    total: 0,
  };

  for (const method of methods) {
    // Get sales for this method
    const { data: salesData, error: salesError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('business_id', businessId)
      .eq('payment_method', method)
      .eq('type', 'sale');

    if (salesError) {
      console.error(`Error fetching sales for ${method}:`, salesError);
      continue;
    }

    // Get expenses for this method
    const { data: expensesData, error: expensesError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('business_id', businessId)
      .eq('payment_method', method)
      .eq('type', 'expense');

    if (expensesError) {
      console.error(`Error fetching expenses for ${method}:`, expensesError);
      continue;
    }

    const salesSum = (salesData || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const expensesSum = (expensesData || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);
    balances[method] = salesSum - expensesSum;
  }

  balances.total = balances.cash + balances.telebirr + balances.cbe + balances.dashen;
  return balances;
}

/**
 * Compare today's total sales with yesterday's total sales
 */
export async function getTodayVsYesterdaySales(
  businessId: string
): Promise<TodayVsYesterdaySales> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Handle cookie setting errors silently
          }
        },
      },
    }
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStart = today.toISOString();
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const yesterdayStart = yesterday.toISOString();
  const yesterdayEnd = today.toISOString();

  // Get today's sales
  const { data: todaySalesData, error: todayError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('business_id', businessId)
    .eq('type', 'sale')
    .gte('created_at', todayStart)
    .lt('created_at', todayEnd.toISOString());

  if (todayError) {
    console.error('Error fetching today sales:', todayError);
  }

  // Get yesterday's sales
  const { data: yesterdaySalesData, error: yesterdayError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('business_id', businessId)
    .eq('type', 'sale')
    .gte('created_at', yesterdayStart)
    .lt('created_at', yesterdayEnd);

  if (yesterdayError) {
    console.error('Error fetching yesterday sales:', yesterdayError);
  }

  const todayTotal = (todaySalesData || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const yesterdayTotal = (yesterdaySalesData || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const percentageChange = yesterdayTotal === 0 
    ? 0 
    : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

  return {
    today: todayTotal,
    yesterday: yesterdayTotal,
    percentageChange: Math.round(percentageChange * 10) / 10,
    isPositive: todayTotal >= yesterdayTotal,
  };
}

/**
 * Get sales by payment method for the last 7 days
 */
export async function getLast7DaysSalesByMethod(
  businessId: string
): Promise<DailyMethodSales[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Handle cookie setting errors silently
          }
        },
      },
    }
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, payment_method, type, created_at')
    .eq('business_id', businessId)
    .eq('type', 'sale')
    .gte('created_at', sevenDaysAgo.toISOString())
    .lte('created_at', today.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching 7-day sales:', error);
    return [];
  }

  // Initialize last 7 days with zeros
  const dailyData: Record<string, DailyMethodSales> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyData[dateStr] = {
      date: dateStr,
      cash: 0,
      telebirr: 0,
      cbe: 0,
      dashen: 0,
      total: 0,
    };
  }

  // Aggregate transactions by date and method
  (transactions || []).forEach((tx) => {
    const dateStr = tx.created_at.split('T')[0];
    if (dailyData[dateStr]) {
      const method = tx.payment_method as PaymentMethod;
      if (method in dailyData[dateStr]) {
        dailyData[dateStr][method] += tx.amount || 0;
      }
    }
  });

  // Calculate totals and convert to array
  return Object.values(dailyData).map((day) => ({
    ...day,
    total: day.cash + day.telebirr + day.cbe + day.dashen,
  }));
}
