// src/app/kiosk/phone-number-input/page.tsx (refactored with Keypad component)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Keypad from '../components/Keypad';

export default function PhoneNumberInputPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDigitClick = (digit: string) => {
    if (phoneNumber.length < 10) {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };
  
  const handleClear = () => {
    setPhoneNumber('');
  }

  const handleGenerateOtp = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');

    try {
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('OTP Generated:', data.otp);
        router.push(`/kiosk/otp-verification?phone=${phoneNumber}`);
      } else {
        setError(data.message || 'Failed to generate OTP.');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-4"
      style={{
        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a5a2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background animation */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '5%',
        width: '300px',
        height: '300px',
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
            📱
          </div>
          <h1 
            className="fw-bold"
            style={{
              fontSize: '2.5rem',
              color: 'white',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              marginBottom: '0.5rem'
            }}
          >
            Enter Your Phone Number
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
            We'll send you a verification code
          </p>
        </div>

        {/* Phone Input Card */}
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
            background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(68, 165, 162, 0.15) 100%)',
            padding: '2rem 1.5rem',
            borderBottom: '2px solid rgba(78, 205, 196, 0.2)'
          }}>
            {/* Display Phone Number */}
            <input
              type="text"
              className="form-control text-center"
              value={phoneNumber}
              readOnly
              placeholder="0 0 0 0 0 0 0 0 0 0"
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#4ecdc4',
                border: '2px solid #4ecdc4',
                borderRadius: '8px',
                padding: '1rem',
                background: 'white',
                letterSpacing: '8px',
                textAlign: 'center'
              }}
            />

            {/* Error Message */}
            {error && (
              <div 
                className="alert alert-danger text-center mt-3 mb-0"
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

            {/* Submit Button */}
            <button
              className="btn btn-lg fw-bold w-100 mt-4"
              style={{
                background: phoneNumber.length === 10 
                  ? 'linear-gradient(135deg, #00d26a 0%, #4ade80 100%)'
                  : 'linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: phoneNumber.length === 10 ? '0 4px 12px rgba(0, 210, 106, 0.3)' : 'none',
                transition: 'all 0.3s ease',
                cursor: phoneNumber.length === 10 ? 'pointer' : 'not-allowed',
                opacity: phoneNumber.length === 10 ? 1 : 0.6
              }}
              onClick={handleGenerateOtp}
              disabled={phoneNumber.length !== 10}
              onMouseEnter={(e) => {
                if (phoneNumber.length === 10) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 210, 106, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (phoneNumber.length === 10) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 210, 106, 0.3)';
                }
              }}
            >
              {phoneNumber.length === 10 ? '✓ Generate OTP' : `${10 - phoneNumber.length} more digits needed`}
            </button>
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
            width: '100px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            margin: '0 auto 0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(phoneNumber.length / 10) * 100}%`,
              height: '100%',
              background: 'white',
              borderRadius: '2px',
              transition: 'width 0.2s ease'
            }} />
          </div>
          <small>Step 1 of 3</small>
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