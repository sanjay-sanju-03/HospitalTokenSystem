// src/app/api/feedback/route.ts
import { NextResponse } from 'next/server';
import { recordPatientFeedback } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { tokenId, patientPhoneNumber, npsScore, waitTimeRating, staffRating, comments } = await request.json();

    if (!tokenId || !patientPhoneNumber) {
      return NextResponse.json(
        { message: 'Token ID and patient phone number are required' },
        { status: 400 }
      );
    }

    recordPatientFeedback(tokenId, patientPhoneNumber, npsScore, waitTimeRating, staffRating, comments);

    return NextResponse.json({ message: 'Feedback recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error recording feedback:', error);
    return NextResponse.json({ message: 'Error recording feedback' }, { status: 500 });
  }
}
