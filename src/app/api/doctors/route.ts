// src/app/api/doctors/route.ts
import { NextResponse } from 'next/server';
import { getDoctorsByDepartment } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    if (!departmentId) {
      return NextResponse.json({ message: 'Department ID is required' }, { status: 400 });
    }

    const doctors = getDoctorsByDepartment(departmentId);
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ message: 'Error fetching doctors' }, { status: 500 });
  }
}
