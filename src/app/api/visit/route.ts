import { NextResponse } from 'next/server';
import { getVisitCount } from '@/lib/visit-count';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const count = await getVisitCount();
  return NextResponse.json({ count });
}
