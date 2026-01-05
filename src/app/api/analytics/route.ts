// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { getClinicAnalytics, getDailyMetrics, getAverageNPS } from '@/lib/db';

export async function GET() {
  try {
    const analytics = getClinicAnalytics();
    const dailyMetrics = getDailyMetrics(undefined, 7);
    const nps = getAverageNPS();

    return NextResponse.json({
      overview: {
        ...analytics,
        npsScore: nps,
      },
      dailyMetrics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ message: 'Error fetching analytics' }, { status: 500 });
  }
}
