# Hospital Token Management System

A modern web-based token queue management system for hospitals built with Next.js, React, and SQLite.

## 📋 Overview

The Hospital Token System is a comprehensive digital queue management solution designed to streamline patient registration, appointment scheduling, and real-time queue monitoring in healthcare facilities.

### Key Features

✅ **Kiosk Interface** - Self-service patient token generation with multi-language support  
✅ **Real-time Queue Display** - Live waiting room monitoring  
✅ **Staff Dashboard** - Queue management and patient call system  
✅ **Analytics Dashboard** - Consultation metrics and performance insights  
✅ **OTP Verification** - Secure patient authentication  
✅ **Time Slot Scheduling** - Doctor availability management (9 AM - 5 PM IST)  
✅ **SMS Notifications** - Token and appointment reminders  
✅ **Modern UI** - Gradient designs, animations, and responsive layouts  
✅ **Database Persistence** - SQLite with persistent token storage  
✅ **5-Second Auto-Refresh** - Real-time data updates across all dashboards  

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands

```bash
npm run dev              # Start development server (http://localhost:3000)
npm run dev:with-socket  # Start with WebSocket support
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Dependencies

See [requirements.txt](requirements.txt) for a complete list of all dependencies, their versions, and purposes.

**Quick Summary:**
- **Framework**: Next.js 16.1.1 + React 19.2.3
- **Database**: SQLite (better-sqlite3)
- **Styling**: Bootstrap 5.3.8
- **Real-time**: Socket.io 4.8.3
- **SMS**: Twilio 5.11.1
- **Type Safety**: TypeScript 5

### Test Credentials
Doctors are auto-seeded with random passwords. Check server logs for passwords.
- Departments: Cardiology, Neurology, Orthopedics, Pediatrics, General


## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 16.1.1 with App Router
- **UI**: React 19 + Bootstrap 5.3.8
- **Database**: SQLite (better-sqlite3)
- **Language**: TypeScript
- **Build Tool**: Turbopack

### Project Structure
```
src/
├── app/api/          # REST API endpoints
├── app/kiosk/        # Patient self-service flows
├── app/staff/        # Staff management
├── app/display/      # Public display screen
├── app/analytics/    # Analytics dashboard
└── lib/              # Core utilities (db, types, OTP, SMS, ETA)
```

## 🔧 Key Features Explained

### Token Generation
- Unique ID format: `token-${Date.now()}`
- Automatic queue positioning
- ETA based on queue length

### Time Slots
- 15-minute intervals
- **Hours**: 9 AM - 5 PM IST (3:30 AM - 11:30 AM UTC)
- Smart fallback to next day if all today's slots are full

### OTP System
- 6-digit codes, 5-minute expiration
- SMS in demo mode (prints to console)
- Case-insensitive verification

### Real-time Updates
- 5-second auto-refresh on all dashboards
- Polling strategy (reliable)
- Synchronized across devices

## 🔧 Recent Bug Fixes

### ✅ Database Persistence (FIXED - Jan 6, 2026)
**Problem**: Tokens weren't persisting after creation  
**Root Cause**: `initializeDatabase()` was dropping tables on every request  
**Solution**: Added one-time initialization check  
**Status**: ✅ Verified working

## 📊 API Endpoints

### Token Management
- `POST /api/token/generate` - Create token
- `GET /api/token/[id]` - Get token details

### Queue Management  
- `GET /api/queues` - All queues
- `GET /api/doctor-queue/[doctorId]` - Doctor's queue

### Scheduling
- `GET /api/slots/[doctorId]` - Time slots
- `GET /api/doctors` - All doctors
- `GET /api/departments` - All departments

### OTP
- `POST /api/otp/generate` - Generate OTP
- `POST /api/otp/verify` - Verify OTP

### Analytics
- `GET /api/analytics` - System metrics

## 🎨 UI Highlights

- Modern gradient backgrounds
- Smooth animations (slideUp, bounce, pulse)
- Touch-friendly for kiosk displays
- Fully responsive (desktop, tablet, mobile)

## 🚀 Status

- ✅ **Production Ready** - All features tested and working
- ✅ **Database Persistence** - Tokens persist correctly
- ✅ **Real-time Updates** - 5-second refresh working
- ✅ **Modern UI** - Polished with animations

## 📝 Environment Variables (Optional)

For SMS integration, create `.env.local`:
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

Without these, SMS runs in demo mode.

## 🔐 Security

- OTP-based authentication (5-min expiration)
- Staff login credentials
- Secure token generation
- No sensitive data in logs

## 🚀 Production Deployment

Ready for Vercel, Docker, AWS, Azure, or GCP.

```bash
npm run build
npm run start
```

## 📄 License

Built for healthcare management. Use responsibly.

---

**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Last Updated**: Jan 10, 2026
