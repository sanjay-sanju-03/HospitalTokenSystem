// src/app/kiosk/otp-verification/page.tsx (refactored with Keypad component)
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Keypad from '../components/Keypad';

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone');

  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/kiosk/phone-number-input');
    }
  }, [phoneNumber, router]);

  const handleDigitClick = (digit: string) => {
    if (otp.length < 6) {
      setOtp((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setOtp((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setOtp('');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setError('');

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otpCode: otp }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        router.push(`/kiosk/department-selection?phone=${phoneNumber}`);
      } else {
        setError(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('An unexpected error occurred.');
    }
  };

  if (!phoneNumber) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0d6efd 0%, #45b7d1 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '250px',
        height: '250px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '500px' }}>
        {/* Header */}
        <div 
          className="text-center mb-5"
          style={{ animation: 'slideUp 0.6s ease-out' }}
        >
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            display: 'inline-block',
            animation: 'bounce 0.8s ease-in-out infinite'
          }}>
            🔐
          </div>
          <h1 
            className="fw-bold"
            style={{
              fontSize: '2.5rem',
              color: 'white',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              marginBottom: '1rem'
            }}
          >
            Verify OTP
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}>
            Enter the 6-digit code sent to<br />
            <strong style={{ fontSize: '1.2rem', color: 'white' }}>+91 {phoneNumber}</strong>
          </p>
        </div>

        {/* OTP Input Card */}
        <div
          className="card border-0"
          style={{
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'slideUp 0.6s ease-out 0.1s both',
            background: 'white'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.15) 0%, rgba(69, 183, 209, 0.15) 100%)',
            padding: '2rem 1.5rem',
            borderBottom: '2px solid rgba(13, 110, 253, 0.2)'
          }}>
            {/* OTP Input Display */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: '50px',
                    height: '60px',
                    border: '2px solid #0d6efd',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: '#0d6efd',
                    background: otp[idx] ? 'rgba(13, 110, 253, 0.1)' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {otp[idx] || ''}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="alert alert-danger text-center mb-0"
                style={{
                  borderRadius: '8px',
                  border: '2px solid #ff3838',
                  background: 'rgba(255, 56, 56, 0.1)',
                  color: '#ff3838',
                  padding: '0.75rem',
                  animation: 'slideUp 0.3s ease-out'
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="card-body p-4">
            <Keypad
              onDigitClick={handleDigitClick}
              onBackspace={handleBackspace}
              onClear={handleClear}
            />

            {/* Verify Button */}
            <button
              className="btn btn-lg fw-bold w-100 mt-4"
              style={{
                background: otp.length === 6
                  ? 'linear-gradient(135deg, #00d26a 0%, #4ade80 100%)'
                  : 'linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: otp.length === 6 ? '0 4px 12px rgba(0, 210, 106, 0.3)' : 'none',
                transition: 'all 0.3s ease',
                cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                opacity: otp.length === 6 ? 1 : 0.6
              }}
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6}
              onMouseEnter={(e) => {
                if (otp.length === 6) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 210, 106, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (otp.length === 6) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 210, 106, 0.3)';
                }
              }}
            >
              {otp.length === 6 ? '✓ Verify OTP' : `${6 - otp.length} more digits`}
            </button>

            {/* Resend Link */}
            <p style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              color: '#666',
              fontSize: '0.95rem'
            }}>
              Didn't receive code? <a href="#" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>Resend</a>
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div 
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem'
          }}
        >
          <div style={{
            width: '120px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            margin: '0 auto 0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              background: 'white',
              borderRadius: '2px',
              transition: 'width 0.2s ease'
            }} />
          </div>
          <small>Step 2 of 3</small>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}