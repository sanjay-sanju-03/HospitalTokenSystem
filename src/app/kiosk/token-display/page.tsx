// src/app/kiosk/token-display/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Token, Doctor, Department } from '@/lib/types'; // Assuming these are defined

interface TokenDetails extends Token {
  doctorName?: string;
  departmentName?: string;
  roomNumber?: string;
  floorNumber?: string;
  estimatedWaitMinutes?: number;
  queuePosition?: number;
  phoneNumber?: string;
}

export default function TokenDisplayPage() {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('tokenId');

  useEffect(() => {
    if (!tokenId) {
      setError('No token ID provided.');
      setLoading(false);
      return;
    }

    async function fetchTokenDetails() {
      try {
        const tokenResponse = await fetch(`/api/token/${tokenId}`);
        
        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          setError(errorData.message || 'Failed to fetch token details.');
          setLoading(false);
          return;
        }

        const tokenData: Token = await tokenResponse.json();

        // Fetch doctor details
        const doctorResponse = await fetch(`/api/doctors?departmentId=${tokenData.departmentId}`);
        const doctorsData: Doctor[] = await doctorResponse.json();
        const doctor = doctorsData.find(d => d.id === tokenData.doctorId);

        // Fetch department details (optional, but good for display)
        const departmentResponse = await fetch('/api/departments');
        const departmentsData: Department[] = await departmentResponse.json();
        const department = departmentsData.find(d => d.id === tokenData.departmentId);


        setTokenDetails({
          ...tokenData,
          doctorName: doctor?.name,
          departmentName: department?.name,
          roomNumber: doctor?.roomNumber,
          floorNumber: doctor?.floorNumber,
        });

      } catch (err) {
        console.error('API Error:', err);
        setError('An unexpected error occurred while fetching token details.');
      } finally {
        setLoading(false);
      }
    }
    fetchTokenDetails();
  }, [tokenId]);

  const handleDone = () => {
    router.replace('/'); // Go back to the welcome screen
  };

  const handleFeedback = () => {
    const phoneNumber = tokenDetails?.patientPhoneNumber || '';
    router.push(`/feedback?tokenId=${tokenId}&phone=${encodeURIComponent(phoneNumber)}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  if (!tokenDetails) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <p className="text-center">Token details not found.</p>
      </div>
    );
  }

  return (
    <div 
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-4"
      style={{
        background: 'linear-gradient(135deg, #00d26a 0%, #4ade80 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background circles */}
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
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '5%',
        width: '250px',
        height: '250px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite 1s'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '700px' }}>
        {/* Success Icon */}
        <div 
          style={{
            fontSize: '5rem',
            textAlign: 'center',
            marginBottom: '1rem',
            animation: 'bounce 0.8s ease-in-out infinite'
          }}
        >
          ✅
        </div>

        {/* Card */}
        <div
          className="card border-0"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            borderRadius: '20px',
            overflow: 'hidden',
            animation: 'slideUp 0.6s ease-out',
            background: 'white'
          }}
        >
          {/* Token Number Display */}
          <div style={{
            background: 'linear-gradient(135deg, #00d26a 0%, #4ade80 100%)',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              YOUR TOKEN NUMBER
            </p>
            <h1 
              className="display-1 fw-bold"
              style={{
                fontSize: '4rem',
                margin: 0,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              #{tokenDetails.tokenNumber}
            </h1>
          </div>

          {/* Details */}
          <div className="card-body p-4">
            {/* Doctor & Location */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(0, 210, 106, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '2px solid rgba(0, 210, 106, 0.2)'
            }}>
              <h5 style={{ color: '#00d26a', fontWeight: 'bold', marginBottom: '1rem' }}>
                👨‍⚕️ Consultation Details
              </h5>
              <div style={{ display: 'grid', gap: '0.75rem', color: '#333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Doctor:</strong>
                  <span style={{ fontSize: '1.1rem', color: '#00d26a' }}>Dr. {tokenDetails.doctorName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Department:</strong>
                  <span style={{ fontSize: '1.1rem', color: '#00d26a' }}>{tokenDetails.departmentName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Location:</strong>
                  <span style={{ fontSize: '1.1rem', color: '#00d26a' }}>
                    Room {tokenDetails.roomNumber}, Floor {tokenDetails.floorNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Wait Time */}
            {tokenDetails.estimatedWaitMinutes !== undefined && (
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.1) 0%, rgba(45, 156, 219, 0.1) 100%)',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid rgba(69, 183, 209, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  ⏱️ Estimated Wait Time
                </p>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.8rem',
                  color: '#2d9cdb',
                  fontWeight: 'bold'
                }}>
                  {tokenDetails.estimatedWaitMinutes} minutes
                </h3>
              </div>
            )}

            {/* Phone Number Confirmation */}
            <div style={{
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              📱 Confirmation sent to <strong>{tokenDetails.patientPhoneNumber}</strong>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: '1fr 1fr'
            }}>
              <button
                onClick={handleDone}
                style={{
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                ← Back Home
              </button>
              <button
                onClick={handleFeedback}
                style={{
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 107, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
                }}
              >
                💬 Share Feedback
              </button>
            </div>

            {/* Instructions */}
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#333'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                <strong>📋 Please carry this token number with you</strong><br />
                <small>You can also check your status on the waiting room display</small>
              </p>
            </div>
          </div>
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
            transform: translateY(-20px);
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
