import { NextResponse } from 'next/server';
import { coingeckoFetcher } from '@/lib/coingecko.actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawIds = searchParams.get('ids');

  if (!rawIds) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  const idList = rawIds.split(',').map((id: string) => id.trim()).filter(Boolean);
  if (idList.length === 0) {
    return NextResponse.json({ error: 'Invalid ids parameter' }, { status: 400 });
  }
  if (idList.length > 50) {
    return NextResponse.json({ error: 'Too many ids' }, { status: 400 });
  }

  const ids = idList.join(',');

  try {
    const data = await coingeckoFetcher('/simple/price', { ids, vs_currencies: 'usd' }, 60);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prices proxy:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
