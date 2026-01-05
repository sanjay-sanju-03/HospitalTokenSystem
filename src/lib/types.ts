// src/lib/types.ts

export interface Department {
  id: string;
  name: string;
}

export interface Doctor {
  id: string;
  departmentId: string;
  name: string;
  roomNumber: string;
  floorNumber: string;
  username: string;
  password?: string; // Password should be handled securely, but included for this prototype
  workingHoursStart: number; // e.g., 9 for 9:00 AM
  workingHoursEnd: number;   // e.g., 17 for 5:00 PM
}

export interface Token {
  id: string;
  patientPhoneNumber: string;
  departmentId: string;
  doctorId: string;
  tokenNumber: number; // e.g., 1, 2, 3... for a given day/doctor
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  scheduledAt: Date;
  generatedAt: Date;
  servedAt?: Date; // Optional, when the patient started being served
  completedAt?: Date; // Optional, when the consultation was completed
}

export interface OTP {
  phoneNumber: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
}
