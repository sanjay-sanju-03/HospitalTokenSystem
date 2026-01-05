// ETA Calculation Utility
import { getDoctorQueue, getAverageConsultationTime } from './db';
import { Token } from './types';

export interface ETAData {
  position: number;
  estimatedWaitMinutes: number;
  queueLength: number;
}

const AVERAGE_CONSULTATION_TIME_MIN = 15; // Fallback default

export const calculateETA = (doctorId: string): ETAData => {
  const queue = getDoctorQueue(doctorId);
  const waitingTokens = queue.filter(t => t.status === 'waiting');
  const servingToken = queue.find(t => t.status === 'serving');

  // Get average consultation time for this doctor
  const avgConsultTime = getAverageConsultationTime(doctorId) || AVERAGE_CONSULTATION_TIME_MIN;

  // Calculate wait time
  let estimatedWaitMinutes = 0;
  if (servingToken) {
    // If someone is being served, patient waits for that + their slot
    estimatedWaitMinutes = Math.ceil(avgConsultTime / 2); // Remaining time for current patient
    estimatedWaitMinutes += waitingTokens.length * avgConsultTime;
  } else if (waitingTokens.length > 0) {
    // If no one is being served, wait is number of people ahead * avg time
    estimatedWaitMinutes = waitingTokens.length * avgConsultTime;
  }

  return {
    position: waitingTokens.length + 1,
    estimatedWaitMinutes,
    queueLength: waitingTokens.length,
  };
};

export const getPatientPosition = (doctorId: string, tokenId: string): number => {
  const queue = getDoctorQueue(doctorId);
  const waitingTokens = queue.filter(t => t.status === 'waiting');
  const position = waitingTokens.findIndex(t => t.id === tokenId);
  return position >= 0 ? position + 1 : -1;
};

export const estimateTimeToConsult = (doctorId: string, tokenId: string): number => {
  const queue = getDoctorQueue(doctorId);
  const waitingTokens = queue.filter(t => t.status === 'waiting');
  const tokenIndex = waitingTokens.findIndex(t => t.id === tokenId);

  if (tokenIndex < 0) return -1; // Token not found or not waiting

  const avgConsultTime = getAverageConsultationTime(doctorId) || AVERAGE_CONSULTATION_TIME_MIN;
  const servingToken = queue.find(t => t.status === 'serving');

  let waitMinutes = tokenIndex * avgConsultTime;
  if (servingToken) {
    waitMinutes += Math.ceil(avgConsultTime / 2); // Remaining time for current patient
  }

  return waitMinutes;
};
