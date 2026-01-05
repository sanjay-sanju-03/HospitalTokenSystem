// src/app/api/doctors/[doctorId]/status/route.ts
import { NextResponse } from 'next/server';
import { updateDoctorStatus, getDoctorStatus } from '@/lib/db';

interface Context {
  params: Promise<{ doctorId: string }>;
}

export async function GET(request: Request, context: Context) {
  try {
    const { doctorId } = await context.params;
    const status = getDoctorStatus(doctorId);

    if (!status) {
      return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ doctorId, status });
  } catch (error) {
    console.error('Error fetching doctor status:', error);
    return NextResponse.json({ message: 'Error fetching status' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { doctorId } = await context.params;
    const { status } = await request.json();

    if (!['idle', 'consulting', 'break', 'offline'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    updateDoctorStatus(doctorId, status);
    return NextResponse.json({ message: `Doctor status updated to ${status}` });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    return NextResponse.json({ message: 'Error updating status' }, { status: 500 });
  }
}
