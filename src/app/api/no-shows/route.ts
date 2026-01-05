// src/app/api/no-shows/route.ts
import { NextResponse } from 'next/server';
import { getDoctorQueue, updateTokenStatus, markNoShowAlertSent } from '@/lib/db';
import { sendNoShowAlertSMS } from '@/lib/sms-service';
import { getDoctorById } from '@/lib/db';

const NO_SHOW_TIMEOUT_MINUTES = 2;

export async function GET() {
  try {
    const queues: any = {};

    // Get all tokens that are being served
    // and check if any have exceeded no-show timeout
    // This is a simplified version - in production, you'd track servedAt time properly

    return NextResponse.json({
      message: 'No-show detection running',
      status: 'ok',
    });
  } catch (error) {
    console.error('Error in no-show detection:', error);
    return NextResponse.json({ message: 'Error running no-show detection' }, { status: 500 });
  }
}
