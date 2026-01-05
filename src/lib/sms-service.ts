// SMS Service for FlowKiosk
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

let client: ReturnType<typeof twilio> | null = null;

// Initialize Twilio client only if credentials exist
if (accountSid && authToken && fromNumber) {
  client = twilio(accountSid, authToken);
}

export interface SMSOptions {
  phoneNumber: string;
  message: string;
}

export const sendSMS = async ({ phoneNumber, message }: SMSOptions): Promise<boolean> => {
  // For development/demo, just log the SMS
  if (!client) {
    console.log(`[SMS Demo Mode] To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    return true;
  }

  try {
    await client.messages.create({
      from: fromNumber,
      to: phoneNumber,
      body: message,
    });
    console.log(`SMS sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

export const sendTokenSMS = async (
  phoneNumber: string,
  tokenNumber: number,
  doctorName: string,
  roomNumber: string,
  floorNumber: string,
  estimatedWaitMinutes: number
): Promise<boolean> => {
  const message = `FlowKiosk Token #${tokenNumber} for ${doctorName}\nRoom: ${roomNumber}, Floor: ${floorNumber}\nEst. wait: ${estimatedWaitMinutes} mins`;
  return sendSMS({ phoneNumber, message });
};

export const sendETAUpdateSMS = async (
  phoneNumber: string,
  estimatedWaitMinutes: number,
  position: number
): Promise<boolean> => {
  const message = `Update: You're #${position} in queue. Est. wait: ${estimatedWaitMinutes} mins`;
  return sendSMS({ phoneNumber, message });
};

export const sendNoShowAlertSMS = async (phoneNumber: string, doctorName: string): Promise<boolean> => {
  const message = `Reminder: Your appointment with ${doctorName} is now. Please report to reception.`;
  return sendSMS({ phoneNumber, message });
};

export const sendCompletionSMS = async (phoneNumber: string): Promise<boolean> => {
  const message = `Your consultation is complete. Thank you for visiting FlowKiosk clinic.`;
  return sendSMS({ phoneNumber, message });
};
