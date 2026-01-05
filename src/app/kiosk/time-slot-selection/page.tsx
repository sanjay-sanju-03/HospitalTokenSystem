// src/app/kiosk/time-slot-selection/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TimeSlotSelectionPage() {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const departmentId = searchParams.get('departmentId');
  const doctorId = searchParams.get('doctorId');
  const patientPhoneNumber = searchParams.get('phone');

  useEffect(() => {
    if (!doctorId || !departmentId || !patientPhoneNumber) {
      router.replace('/kiosk/department-selection'); // Go back if params are missing
      return;
    }

    async function fetchSlots() {
      try {
        const response = await fetch(`/api/slots/${doctorId}`);
        const data = await response.json();
        console.log(`[FRONTEND] Response status:`, response.status);
        console.log(`[FRONTEND] Response ok:`, response.ok);
        console.log(`[FRONTEND] Data type:`, typeof data);
        console.log(`[FRONTEND] Data is array:`, Array.isArray(data));
        console.log(`[FRONTEND] Data length:`, data?.length);
        console.log(`[FRONTEND] Full data:`, data);
        
        if (response.ok && Array.isArray(data)) {
          console.log(`[FRONTEND] Setting slots with ${data.length} items`);
          setSlots(data);
        } else {
          const errorMsg = (typeof data === 'object' && data.message) ? data.message : 'Failed to fetch time slots.';
          console.log(`[FRONTEND] Error: ${errorMsg}`);
          setError(errorMsg);
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('An unexpected error occurred while fetching time slots.');
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [doctorId, departmentId, patientPhoneNumber, router]);

  const handleSlotSelect = async (slot: string) => {
    setError('');
    setSelectedSlot(slot);
    console.log('[TIME SLOT PAGE] handleSlotSelect called with slot:', slot);
    try {
      console.log('[TIME SLOT PAGE] About to call /api/token/generate with:', {
        patientPhoneNumber,
        departmentId,
        doctorId,
        scheduledAt: slot,
      });
      const response = await fetch('/api/token/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientPhoneNumber,
          departmentId,
          doctorId,
          scheduledAt: slot,
        }),
      });

      console.log('[TIME SLOT PAGE] Response received:', response.status, response.ok);
      const data = await response.json();
      console.log('[TIME SLOT PAGE] Response data:', data);

      if (response.ok) {
        console.log('[TIME SLOT PAGE] Success! Redirecting to token display with ID:', data.id);
        router.push(`/kiosk/token-display?tokenId=${data.id}`);
      } else {
        console.log('[TIME SLOT PAGE] Error response:', data);
        setError(data.message || 'Failed to generate token.');
        setSelectedSlot(null);
      }
    } catch (err) {
      console.error('[TIME SLOT PAGE] API Error:', err);
      setError('An unexpected error occurred while generating token.');
      setSelectedSlot(null);
    }
  };
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error && !selectedSlot) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  return (
    <div 
      className="min-vh-100 p-4 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
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

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px' }}>
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
            🕐
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
            Choose Your Slot
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
            Select a convenient time for your appointment
          </p>
        </div>

        {/* Time Slots Grid */}
        <div 
          className="card border-0"
          style={{
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'slideUp 0.6s ease-out 0.1s both'
          }}
        >
          <div style={{
            padding: '2rem',
            background: 'white'
          }}>
            {slots.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#666'
              }}>
                <p className="lead mb-0">No available time slots.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '1rem'
              }}>
                {slots.map((slot, idx) => (
                  <button
                    key={slot}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={selectedSlot !== null}
                    style={{
                      padding: '1.2rem 1rem',
                      border: '2px solid #764ba2',
                      borderRadius: '12px',
                      background: selectedSlot === slot ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'white',
                      color: selectedSlot === slot ? 'white' : '#764ba2',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                      cursor: selectedSlot === null ? 'pointer' : 'not-allowed',
                      animation: `slideUp 0.6s ease-out ${0.1 + idx * 0.05}s both`,
                      position: 'relative',
                      opacity: selectedSlot && selectedSlot !== slot ? 0.4 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSlot === null) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(118, 75, 162, 0.3)';
                        if (selectedSlot !== slot) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)';
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSlot === null) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        if (selectedSlot !== slot) {
                          e.currentTarget.style.background = 'white';
                        }
                      }
                    }}
                  >
                    {selectedSlot === slot && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        fontSize: '1rem'
                      }}>
                        ✓
                      </div>
                    )}
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            )}
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
              width: '90%',
              height: '100%',
              background: 'white',
              borderRadius: '2px',
              transition: 'width 0.2s ease'
            }} />
          </div>
          <small>Step 5 of 5</small>
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
