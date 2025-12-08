import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/pages-content`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        pagesContent: data.pagesContent || data
      });
    }

    // Return defaults if fetch fails
    return NextResponse.json({
      success: true,
      pagesContent: null
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      pagesContent: null
    });
  }
}

