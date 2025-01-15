import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://fakestoreapi.com/products', {
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
