import 'server-only';
import Database from 'better-sqlite3';
import { Department, Doctor, Token } from './types';

const db = new Database('hospital.db');

function initializeDatabase() {
  // Only initialize if tables don't exist
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='departments'"
  ).get();
  
  if (tableExists) {
    console.log('Database already initialized, skipping initialization');
    return;
  }

  console.log('Initializing database for the first time...');

  db.exec(`
    CREATE TABLE departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE doctors (
      id TEXT PRIMARY KEY,
      departmentId TEXT NOT NULL,
      name TEXT NOT NULL,
      roomNumber TEXT NOT NULL,
      floorNumber TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      workingHoursStart INTEGER NOT NULL,
      workingHoursEnd INTEGER NOT NULL,
      status TEXT DEFAULT 'idle',
      FOREIGN KEY (departmentId) REFERENCES departments(id)
    );

    CREATE TABLE tokens (
      id TEXT PRIMARY KEY,
      patientPhoneNumber TEXT NOT NULL,
      departmentId TEXT NOT NULL,
      doctorId TEXT NOT NULL,
      tokenNumber INTEGER NOT NULL,
      status TEXT NOT NULL,
      priority INTEGER DEFAULT 0,
      scheduledAt TEXT NOT NULL,
      generatedAt TEXT NOT NULL,
      servedAt TEXT,
      completedAt TEXT,
      noShowAlertSent INTEGER DEFAULT 0,
      smsSent INTEGER DEFAULT 0,
      FOREIGN KEY (departmentId) REFERENCES departments(id),
      FOREIGN KEY (doctorId) REFERENCES doctors(id)
    );

    CREATE TABLE consultation_metrics (
      id TEXT PRIMARY KEY,
      tokenId TEXT NOT NULL,
      doctorId TEXT NOT NULL,
      departmentId TEXT NOT NULL,
      waitTimeMinutes INTEGER NOT NULL,
      consultationTimeMinutes INTEGER NOT NULL,
      patientPhoneNumber TEXT NOT NULL,
      date TEXT NOT NULL,
      hour INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tokenId) REFERENCES tokens(id),
      FOREIGN KEY (doctorId) REFERENCES doctors(id)
    );

    CREATE TABLE patient_feedback (
      id TEXT PRIMARY KEY,
      tokenId TEXT NOT NULL,
      patientPhoneNumber TEXT NOT NULL,
      npsScore INTEGER,
      waitTimeRating INTEGER,
      staffRating INTEGER,
      comments TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tokenId) REFERENCES tokens(id)
    );

    CREATE INDEX idx_tokens_doctor ON tokens(doctorId);
    CREATE INDEX idx_tokens_status ON tokens(status);
    CREATE INDEX idx_tokens_date ON tokens(generatedAt);
    CREATE INDEX idx_metrics_doctor ON consultation_metrics(doctorId);
    CREATE INDEX idx_metrics_date ON consultation_metrics(date);
  `);

  const departmentsToSeed = [
    { id: 'dept-cardio', name: 'Cardiology' },
    { id: 'dept-peds', name: 'Pediatrics' },
    { id: 'dept-neuro', name: 'Neurology' },
    { id: 'dept-ortho', name: 'Orthopedics' },
    { id: 'dept-derma', name: 'Dermatology' },
  ];

  const insertDepartment = db.prepare('INSERT OR IGNORE INTO departments (id, name) VALUES (?, ?)');
  db.transaction(() => {
    departmentsToSeed.forEach(dept => insertDepartment.run(dept.id, dept.name));
  })();
  console.log('Departments seeded.');

  const doctorsToSeed = [
    { id: 'doc-smith', name: 'Dr. Smith', departmentId: 'dept-cardio', roomNumber: '101', floorNumber: '1' },
    { id: 'doc-jones', name: 'Dr. Jones', departmentId: 'dept-cardio', roomNumber: '102', floorNumber: '1' },
    { id: 'doc-davis', name: 'Dr. Davis', departmentId: 'dept-peds', roomNumber: '201', floorNumber: '2' },
    { id: 'doc-miller', name: 'Dr. Miller', departmentId: 'dept-peds', roomNumber: '202', floorNumber: '2' },
    { id: 'doc-wilson', name: 'Dr. Wilson', departmentId: 'dept-neuro', roomNumber: '301', floorNumber: '3' },
    { id: 'doc-brown', name: 'Dr. Brown', departmentId: 'dept-ortho', roomNumber: '401', floorNumber: '4' },
    { id: 'doc-taylor', name: 'Dr. Taylor', departmentId: 'dept-ortho', roomNumber: '402', floorNumber: '4' },
    { id: 'doc-moore', name: 'Dr. Moore', departmentId: 'dept-derma', roomNumber: '501', floorNumber: '5' },
  ];

  const insertDoctor = db.prepare('INSERT OR IGNORE INTO doctors (id, departmentId, name, roomNumber, floorNumber, username, password, workingHoursStart, workingHoursEnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  db.transaction(() => {
    doctorsToSeed.forEach(doc => {
      const username = doc.name.replace('Dr. ', '').toLowerCase();
      const password = Math.random().toString(36).slice(-8);
      // Working hours adjusted for IST: 3:30 AM - 11:30 AM UTC = 9 AM - 5 PM IST
      const startHour = 3;
      const startMinute = 30; // Will use 3.5 as integer 3, adjust in slots API
      const endHour = 11;
      const endMinute = 30;  // Will use 11.5 as integer 11, adjust in slots API
      insertDoctor.run(doc.id, doc.departmentId, doc.name, doc.roomNumber, doc.floorNumber, username, password, startHour, endHour);
    });
  })();
  console.log('Doctors seeded with credentials and working hours (9 AM - 5 PM IST / 3:30 AM - 11:30 AM UTC)');
}

initializeDatabase();

export const getDepartments = (): Department[] => {
  return db.prepare('SELECT * FROM departments').all() as Department[];
};

export const getDoctorById = (id: string): Doctor | undefined => {
  return db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as Doctor | undefined;
};

export const getDoctorsByDepartment = (departmentId: string): Doctor[] => {
  return db.prepare('SELECT * FROM doctors WHERE departmentId = ?').all(departmentId) as Doctor[];
};

export const createToken = (token: Omit<Token, 'id' | 'generatedAt' | 'status'>): Token => {
  const generatedAt = new Date().toISOString();
  const scheduledAt = new Date(token.scheduledAt).toISOString();
  const status = 'waiting';
  const id = `token-${Date.now()}`;

  console.log(`[DB] Creating token with ID: ${id}`);
  console.log(`[DB] Token data:`, { id, ...token, status, scheduledAt, generatedAt });

  const stmt = db.prepare(`
    INSERT INTO tokens (id, patientPhoneNumber, departmentId, doctorId, tokenNumber, status, scheduledAt, generatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const result = stmt.run(id, token.patientPhoneNumber, token.departmentId, token.doctorId, token.tokenNumber, status, scheduledAt, generatedAt);
    console.log(`[DB] Insert result:`, result);
    console.log(`[DB] Changes made: ${result.changes}`);
  } catch (err) {
    console.error(`[DB] Error inserting token:`, err);
    throw err;
  }

  const savedToken: Token = { ...token, id, generatedAt: new Date(generatedAt), status };
  console.log(`[DB] Returning token:`, savedToken);
  return savedToken;
};

export const getTokenById = (id: string): Token | undefined => {
  console.log(`[DB] getTokenById called with ID: ${id}`);
  const result = db.prepare('SELECT * FROM tokens WHERE id = ?').get(id) as Token | undefined;
  console.log(`[DB] Query result:`, result);
  return result;
};

export const updateTokenStatus = (id: string, status: Token['status'], servedAt?: Date, completedAt?: Date): void => {
  let query = 'UPDATE tokens SET status = ?';
  const params: (string | Date | undefined)[] = [status];

  if (servedAt) {
    query += ', servedAt = ?';
    params.push(servedAt.toISOString());
  }
  if (completedAt) {
    query += ', completedAt = ?';
    params.push(completedAt.toISOString());
  }
  query += ' WHERE id = ?';
  params.push(id);

  db.prepare(query).run(...params);
};

export const getDoctorQueue = (doctorId: string): Token[] => {
  return db.prepare('SELECT * FROM tokens WHERE doctorId = ? AND status IN (?, ?) ORDER BY generatedAt ASC')
           .all(doctorId, 'waiting', 'serving') as Token[];
};

export const getLatestTokenNumberForDoctor = (doctorId: string): number => {
  const result = db.prepare('SELECT MAX(tokenNumber) as maxToken FROM tokens WHERE doctorId = ?').get(doctorId) as { maxToken: number } | undefined;
  return result?.maxToken || 0;
};

export const getTokensForDoctorByDay = (doctorId: string, date: Date): Token[] => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return db.prepare('SELECT * FROM tokens WHERE doctorId = ? AND scheduledAt >= ? AND scheduledAt <= ?')
           .all(doctorId, startOfDay.toISOString(), endOfDay.toISOString()) as Token[];
};

// ==================== FlowKiosk Features ====================

// 1. ETA & Analytics Functions
export const recordConsultationMetric = (
  tokenId: string,
  doctorId: string,
  departmentId: string,
  patientPhoneNumber: string,
  waitTimeMinutes: number,
  consultationTimeMinutes: number
): void => {
  const id = `metric-${Date.now()}`;
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const hour = now.getHours();

  db.prepare(`
    INSERT INTO consultation_metrics (id, tokenId, doctorId, departmentId, waitTimeMinutes, consultationTimeMinutes, patientPhoneNumber, date, hour, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tokenId, doctorId, departmentId, waitTimeMinutes, consultationTimeMinutes, patientPhoneNumber, date, hour, now.toISOString());
};

export const getAverageWaitTime = (doctorId?: string): number => {
  let query = 'SELECT AVG(waitTimeMinutes) as avg FROM consultation_metrics';
  const params: any[] = [];

  if (doctorId) {
    query += ' WHERE doctorId = ?';
    params.push(doctorId);
  }

  const result = db.prepare(query).get(...params) as { avg: number | null } | undefined;
  return Math.round(result?.avg || 0);
};

export const getAverageConsultationTime = (doctorId?: string): number => {
  let query = 'SELECT AVG(consultationTimeMinutes) as avg FROM consultation_metrics';
  const params: any[] = [];

  if (doctorId) {
    query += ' WHERE doctorId = ?';
    params.push(doctorId);
  }

  const result = db.prepare(query).get(...params) as { avg: number | null } | undefined;
  return Math.round(result?.avg || 0);
};

export const getDailyMetrics = (doctorId?: string, days: number = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateStr = startDate.toISOString().split('T')[0];

  let query = `
    SELECT 
      date, 
      COUNT(*) as consultations,
      AVG(waitTimeMinutes) as avgWait,
      AVG(consultationTimeMinutes) as avgConsult,
      MAX(waitTimeMinutes) as maxWait
    FROM consultation_metrics
    WHERE date >= ?
  `;
  const params: any[] = [dateStr];

  if (doctorId) {
    query += ' AND doctorId = ?';
    params.push(doctorId);
  }

  query += ' GROUP BY date ORDER BY date DESC';

  return db.prepare(query).all(...params);
};

// 2. Doctor Status Functions
export const updateDoctorStatus = (doctorId: string, status: 'idle' | 'consulting' | 'break' | 'offline'): void => {
  db.prepare('UPDATE doctors SET status = ? WHERE id = ?').run(status, doctorId);
};

export const getDoctorStatus = (doctorId: string): string | undefined => {
  const result = db.prepare('SELECT status FROM doctors WHERE id = ?').get(doctorId) as { status: string } | undefined;
  return result?.status;
};

// 3. Priority Queue Functions
export const setPriorityToken = (tokenId: string, priority: number): void => {
  db.prepare('UPDATE tokens SET priority = ? WHERE id = ?').run(priority, tokenId);
};

export const getHighPriorityTokens = (doctorId: string) => {
  return db.prepare(`
    SELECT * FROM tokens 
    WHERE doctorId = ? AND status = 'waiting' AND priority > 0
    ORDER BY priority DESC, generatedAt ASC
  `).all(doctorId) as Token[];
};

// 4. SMS Tracking Functions
export const markSMSSent = (tokenId: string): void => {
  db.prepare('UPDATE tokens SET smsSent = 1 WHERE id = ?').run(tokenId);
};

export const markNoShowAlertSent = (tokenId: string): void => {
  db.prepare('UPDATE tokens SET noShowAlertSent = 1 WHERE id = ?').run(tokenId);
};

// 5. Patient Feedback Functions
export const recordPatientFeedback = (
  tokenId: string,
  patientPhoneNumber: string,
  npsScore?: number,
  waitTimeRating?: number,
  staffRating?: number,
  comments?: string
): void => {
  const id = `feedback-${Date.now()}`;
  db.prepare(`
    INSERT INTO patient_feedback (id, tokenId, patientPhoneNumber, npsScore, waitTimeRating, staffRating, comments, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tokenId, patientPhoneNumber, npsScore || null, waitTimeRating || null, staffRating || null, comments || null, new Date().toISOString());
};

export const getAverageNPS = (): number => {
  const result = db.prepare('SELECT AVG(npsScore) as avg FROM patient_feedback WHERE npsScore IS NOT NULL').get() as { avg: number | null } | undefined;
  return Math.round(result?.avg || 0);
};

export const getClinicAnalytics = () => {
  const totalConsultations = (db.prepare('SELECT COUNT(*) as count FROM consultation_metrics').get() as { count: number }).count;
  const avgWait = getAverageWaitTime();
  const avgConsult = getAverageConsultationTime();
  const nps = getAverageNPS();
  const completedToday = (db.prepare(`
    SELECT COUNT(*) as count FROM tokens 
    WHERE status = 'completed' AND completedAt >= date('now')
  `).get() as { count: number }).count;

  return {
    totalConsultations,
    avgWaitTime: avgWait,
    avgConsultationTime: avgConsult,
    npsScore: nps,
    completedToday,
  };
};