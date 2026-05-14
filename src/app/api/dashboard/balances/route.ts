import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getBalanceByPaymentMethod } from '@/lib/queries/dashboard';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing businessId' },
        { status: 400 }
      );
    }

    const balances = await getBalanceByPaymentMethod(businessId);
    return NextResponse.json(balances);
  } catch (error) {
    console.error('Balances API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}
