import { NextResponse } from 'next/server';
import { coingeckoFetcher } from '@/lib/coingecko.actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  try {
    const data = await coingeckoFetcher('/simple/price', { ids, vs_currencies: 'usd' }, 60);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prices proxy:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
