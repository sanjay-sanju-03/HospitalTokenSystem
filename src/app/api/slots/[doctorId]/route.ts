// src/app/api/slots/[doctorId]/route.ts
import { NextResponse } from 'next/server';
import { getTokensForDoctorByDay, getDoctorById } from '@/lib/db';
import { Token } from '@/lib/types';

interface Context {
  params: Promise<{ doctorId: string }>;
}

const SLOT_DURATION_MINUTES = 15;

// Helper to generate time slots for a day based on a doctor's schedule
const generateTimeSlots = (date: Date, startHour: number, endHour: number): Date[] => {
  const slots: Date[] = [];
  
  // Create start time: date at startHour + 30 minutes in UTC (for IST adjustment)
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(startHour, 30, 0, 0);
  
  // Create end time: date at endHour + 30 minutes in UTC (for IST adjustment)
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(endHour, 30, 0, 0);

  let currentTime = new Date(startOfDay);

  while (currentTime < endOfDay) {
    slots.push(new Date(currentTime));
    currentTime.setUTCMinutes(currentTime.getUTCMinutes() + SLOT_DURATION_MINUTES);
  }

  return slots;
};

export async function GET(request: Request, context: Context) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const { doctorId } = await context.params;

    console.log(`[SLOTS API] Fetching slots for doctor: ${doctorId}`);

    if (!doctorId || doctorId === "slots") {
      return NextResponse.json({ message: 'Doctor ID is required' }, { status: 400 });
    }

    const doctor = getDoctorById(doctorId);
    console.log(`[SLOTS API] Doctor found:`, doctor);
    
    if (!doctor) {
      return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Get today's date in UTC (not local timezone)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    console.log(`[SLOTS API] Current time: ${now.toISOString()} (${now.toLocaleString()})`);
    console.log(`[SLOTS API] Today UTC midnight: ${today.toISOString()} (${today.toLocaleString()})`);
    
    // Use doctor's working hours, or fallback to 9 AM - 5 PM
    const startHour = doctor.workingHoursStart || 9;
    const endHour = doctor.workingHoursEnd || 17;
    
    console.log(`[SLOTS API] Working hours: ${startHour}:00 - ${endHour}:00 UTC`);
    
    // First, try to get slots for today
    let slotsDate = new Date(today);
    let allSlots = generateTimeSlots(slotsDate, startHour, endHour);
    
    console.log(`[SLOTS API] All slots for today: ${allSlots.length} slots generated`);
    if (allSlots.length > 0) {
      console.log(`[SLOTS API] First slot: ${allSlots[0].toISOString()}, Last slot: ${allSlots[allSlots.length - 1].toISOString()}`);
    }

    const bookedTokens = getTokensForDoctorByDay(doctorId, slotsDate);
    console.log(`[SLOTS API] Booked tokens: ${bookedTokens.length}`);
    
    const bookedTimes = new Set(
      bookedTokens.map(token => new Date(token.scheduledAt).getTime())
    );

    const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot.getTime()));
    console.log(`[SLOTS API] Available slots after removing booked: ${availableSlots.length}`);
    
    const futureSlots = availableSlots.filter(slot => slot > now);
    console.log(`[SLOTS API] Future slots (after time filter): ${futureSlots.length}`);
    if (futureSlots.length > 0) {
      console.log(`[SLOTS API] First future slot: ${futureSlots[0].toISOString()}`);
    }

    // If we have future slots today, return them
    if (futureSlots.length > 0) {
      console.log(`[SLOTS API] Returning ${futureSlots.length} future slots for today`);
      return NextResponse.json(futureSlots);
    }

    // If no future slots today, show tomorrow's full schedule
    console.log(`[SLOTS API] No future slots today, showing tomorrow's schedule`);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowSlots = generateTimeSlots(tomorrow, startHour, endHour);
    
    console.log(`[SLOTS API] Tomorrow slots generated: ${tomorrowSlots.length}`);
    if (tomorrowSlots.length > 0) {
      console.log(`[SLOTS API] First tomorrow slot: ${tomorrowSlots[0].toISOString()}`);
    }
    
    // For tomorrow, we can show all slots since they're all in the future
    return NextResponse.json(tomorrowSlots);
  } catch (error) {
    console.error(`Error fetching time slots:`, error);
    return NextResponse.json({ message: 'Error fetching time slots' }, { status: 500 });
  }
}
