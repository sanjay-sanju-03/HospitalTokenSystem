// src/lib/otp-store.ts
import { OTP } from './types';

// In-memory store for OTPs. In a real application, this would be a cache like Redis.
const otpStore = new Map<string, OTP>(); // Key: phoneNumber, Value: OTP object

const OTP_EXPIRATION_MINUTES = 5; // OTP valid for 5 minutes

export const generateOtp = (phoneNumber: string): string => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  const otp: OTP = {
    phoneNumber,
    code: otpCode,
    createdAt,
    expiresAt,
  };
  otpStore.set(phoneNumber, otp);

  // In a real application, this is where you'd send the OTP via an SMS service.
  // For this prototype, we'll log it to the console.
  console.log(`Generated OTP for ${phoneNumber}: ${otpCode}. Expires at: ${expiresAt.toLocaleTimeString()}`);

  return otpCode;
};

export const verifyOtp = (phoneNumber: string, code: string): boolean => {
  const storedOtp = otpStore.get(phoneNumber);

  if (!storedOtp) {
    return false; // No OTP generated for this number
  }

  if (storedOtp.expiresAt < new Date()) {
    otpStore.delete(phoneNumber); // OTP expired
    return false;
  }

  if (storedOtp.code === code) {
    otpStore.delete(phoneNumber); // OTP successfully used, remove it
    return true;
  }

  return false;
};
