// src/app/api/doctor-queue/[doctorId]/route.ts
import { NextResponse } from 'next/server';
import { getDoctorQueue } from '@/lib/db';

interface Context {
  params: Promise<{ doctorId: string }>;
}

export async function GET(request: Request, context: Context) {
  try {
    const { doctorId } = await context.params;

    if (!doctorId) {
      return NextResponse.json({ message: 'Doctor ID is required' }, { status: 400 });
    }

    const doctorQueue = getDoctorQueue(doctorId);
    const waitingTokens = doctorQueue.filter(t => t.status === 'waiting');

    return NextResponse.json({ doctorId, waitingTokens });
  } catch (error) {
    console.error(`Error fetching doctor queue:`, error);
    return NextResponse.json({ message: 'Error fetching doctor queue' }, { status: 500 });
  }
}
