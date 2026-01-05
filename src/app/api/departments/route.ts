// src/app/api/departments/route.ts
import { NextResponse } from 'next/server';
import { getDepartments } from '@/lib/db';

export async function GET() {
  try {
    const departments = getDepartments();
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ message: 'Error fetching departments' }, { status: 500 });
  }
}
