// src/app/api/queues/route.ts
import { NextResponse } from 'next/server';
import { getDepartments, getDoctorsByDepartment, getDoctorQueue } from '@/lib/db';
import { Department, Doctor, Token } from '@/lib/types';

export async function GET() {
  try {
    const departments = getDepartments();
    const allDoctors: Doctor[] = [];
    departments.forEach(dept => {
      allDoctors.push(...getDoctorsByDepartment(dept.id));
    });

    const queueStatus: {
      doctorId: string;
      doctorName: string;
      departmentName: string;
      roomNumber: string;
      floorNumber: string;
      nowServing: Token | null;
      nextInLine: Token | null;
      waitingCount: number;
      estimatedWaitTime: string; // e.g., "15 min"
    }[] = [];

    const AVERAGE_CONSULTATION_TIME_MIN = 15; // Placeholder

    allDoctors.forEach(doctor => {
      const doctorQueue = getDoctorQueue(doctor.id); // Get all waiting/serving tokens
      const servingToken = doctorQueue.find(t => t.status === 'serving');
      const waitingTokens = doctorQueue.filter(t => t.status === 'waiting');

      const nowServing = servingToken || null;
      const nextInLine = waitingTokens.length > 0 ? waitingTokens[0] : null;
      const waitingCount = waitingTokens.length;

      const department = departments.find(d => d.id === doctor.departmentId);
      const departmentName = department ? department.name : 'Unknown Department';

      const estimatedWaitTime = nowServing
        ? `${(waitingCount + 1) * AVERAGE_CONSULTATION_TIME_MIN} min`
        : waitingCount > 0
        ? `${waitingCount * AVERAGE_CONSULTATION_TIME_MIN} min`
        : 'No wait';


      queueStatus.push({
        doctorId: doctor.id,
        doctorName: doctor.name,
        departmentName: departmentName,
        roomNumber: doctor.roomNumber,
        floorNumber: doctor.floorNumber,
        nowServing,
        nextInLine,
        waitingCount,
        estimatedWaitTime,
      });
    });

    return NextResponse.json(queueStatus);
  } catch (error) {
    console.error('Error fetching queues:', error);
    return NextResponse.json({ message: 'Error fetching queues' }, { status: 500 });
  }
}
