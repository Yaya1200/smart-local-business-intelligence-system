import { NextRequest, NextResponse } from 'next/server';
import { getLast7DaysSalesByMethod } from '@/lib/queries/dashboard';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing businessId' },
        { status: 400 }
      );
    }

    const weeklyData = await getLast7DaysSalesByMethod(businessId);
    return NextResponse.json(weeklyData);
  } catch (error) {
    console.error('Weekly chart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly data' },
      { status: 500 }
    );
  }
}
