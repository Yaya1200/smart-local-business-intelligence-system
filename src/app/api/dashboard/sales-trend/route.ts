import { NextRequest, NextResponse } from 'next/server';
import { getTodayVsYesterdaySales } from '@/lib/queries/dashboard';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing businessId' },
        { status: 400 }
      );
    }

    const salesTrend = await getTodayVsYesterdaySales(businessId);
    return NextResponse.json(salesTrend);
  } catch (error) {
    console.error('Sales trend API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales trend' },
      { status: 500 }
    );
  }
}
