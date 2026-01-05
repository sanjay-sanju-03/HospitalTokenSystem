// src/app/api/token/[id]/route.ts
import { NextResponse } from 'next/server';
import { getTokenById, updateTokenStatus } from '@/lib/db';
import { Token } from '@/lib/types';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: Context) {
  try {
    const { id } = await context.params;

    console.log(`[TOKEN API] Fetching token with ID: ${id}`);
    const token = getTokenById(id);
    console.log(`[TOKEN API] Token found:`, token);

    if (!token) {
      console.log(`[TOKEN API] Token not found for ID: ${id}`);
      return NextResponse.json({ message: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json(token);
  } catch (error) {
    console.error(`Error fetching token:`, error);
    return NextResponse.json({ message: 'Error fetching token' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { status, servedAt, completedAt } = await request.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    // Optional: Add validation for allowed status transitions

    updateTokenStatus(id, status as Token['status'], servedAt ? new Date(servedAt) : undefined, completedAt ? new Date(completedAt) : undefined);

    return NextResponse.json({ message: `Token ${id} status updated to ${status}` });
  } catch (error) {
    console.error(`Error updating token:`, error);
    return NextResponse.json({ message: 'Error updating token' }, { status: 500 });
  }
}
