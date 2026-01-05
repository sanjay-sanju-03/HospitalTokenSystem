// src/app/api/otp/verify/route.ts
import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otpCode } = await request.json();

    if (!phoneNumber || !otpCode) {
      return NextResponse.json({ message: 'Phone number and OTP code are required' }, { status: 400 });
    }

    const isValid = verifyOtp(phoneNumber, otpCode);

    if (isValid) {
      return NextResponse.json({ message: 'OTP verified successfully', valid: true });
    } else {
      return NextResponse.json({ message: 'Invalid or expired OTP', valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ message: 'Error verifying OTP' }, { status: 500 });
  }
}
