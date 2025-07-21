import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const url = new URL('/api/courses', process.env.API_BASE_URL!);
    
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-cache",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch courses' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return fallback data
    return NextResponse.json([
      { id: "default", name: "Default Course" }
    ]);
  }
}
