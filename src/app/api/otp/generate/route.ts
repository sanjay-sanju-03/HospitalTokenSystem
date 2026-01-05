// src/app/api/otp/generate/route.ts
import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    const otpCode = generateOtp(phoneNumber);
    return NextResponse.json({ message: 'OTP generated successfully', otp: otpCode }); // In a real app, don't return OTP
  } catch (error) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ message: 'Error generating OTP' }, { status: 500 });
  }
}
