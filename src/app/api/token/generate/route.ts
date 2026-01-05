// src/app/api/token/generate/route.ts
import { NextResponse } from 'next/server';
import { createToken, getLatestTokenNumberForDoctor, markSMSSent, getDoctorById, getDepartments } from '@/lib/db';
import { Token } from '@/lib/types';
import { sendTokenSMS } from '@/lib/sms-service';
import { calculateETA } from '@/lib/eta-calculator';

export async function POST(request: Request) {
  console.log('[TOKEN GENERATE API] ===== POST REQUEST RECEIVED =====');
  try {
    const { patientPhoneNumber, departmentId, doctorId, scheduledAt } = await request.json();
    console.log('[TOKEN GENERATE API] Request params:', { patientPhoneNumber, departmentId, doctorId, scheduledAt });

    if (!patientPhoneNumber || !departmentId || !doctorId || !scheduledAt) {
      console.log('[TOKEN GENERATE API] Missing required parameters');
      return NextResponse.json(
        { message: 'Patient phone number, department ID, doctor ID, and scheduled time are required' },
        { status: 400 }
      );
    }

    // Generate token number (simple increment for now)
    const latestTokenNum = getLatestTokenNumberForDoctor(doctorId);
    const newTokenNumber = latestTokenNum + 1;
    console.log('[TOKEN GENERATE API] Latest token number:', latestTokenNum, 'New:', newTokenNumber);

    const newToken: Omit<Token, 'id' | 'generatedAt' | 'status'> = {
      patientPhoneNumber,
      departmentId,
      doctorId,
      tokenNumber: newTokenNumber,
      scheduledAt: new Date(scheduledAt),
    };

    console.log('[TOKEN GENERATE API] Calling createToken...');
    const createdToken = createToken(newToken);
    console.log('[TOKEN GENERATE API] Token created:', createdToken);

    // Get doctor and department info for SMS
    const doctor = getDoctorById(doctorId);
    const departments = getDepartments();
    const department = departments.find(d => d.id === departmentId);

    // Calculate ETA
    const eta = calculateETA(doctorId);

    // Send SMS notification with token, room, floor, and ETA
    if (doctor && department) {
      const smsSent = await sendTokenSMS(
        patientPhoneNumber,
        newTokenNumber,
        doctor.name,
        doctor.roomNumber,
        doctor.floorNumber,
        eta.estimatedWaitMinutes
      );

      if (smsSent) {
        markSMSSent(createdToken.id);
      }
    }

    console.log(
      `Token #${newTokenNumber} generated for ${patientPhoneNumber}: ${doctor?.name}, ETA: ${eta.estimatedWaitMinutes} mins`
    );

    return NextResponse.json({
      ...createdToken,
      estimatedWaitMinutes: eta.estimatedWaitMinutes,
      queuePosition: eta.position,
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ message: 'Error generating token' }, { status: 500 });
  }
}
