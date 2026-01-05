// src/app/kiosk/doctor-selection/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Doctor } from '@/lib/types'; // Assuming Doctor interface is defined

export default function DoctorSelectionPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  const patientPhoneNumber = searchParams.get('phone');

  useEffect(() => {
    if (!departmentId || !patientPhoneNumber) {
      router.replace('/kiosk/department-selection'); // Redirect if IDs are missing
      return;
    }

    async function fetchDoctors() {
      try {
        const response = await fetch(`/api/doctors?departmentId=${departmentId}`);
        const data = await response.json();
        if (response.ok) {
          setDoctors(data);
        } else {
          setError(data.message || 'Failed to fetch doctors.');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('An unexpected error occurred while fetching doctors.');
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [departmentId, patientPhoneNumber, router]);

  const handleDoctorSelect = (doctorId: string) => {
    // Navigate to the time slot selection page, passing all necessary info
    router.push(
      `/kiosk/time-slot-selection?departmentId=${departmentId}&doctorId=${doctorId}&phone=${patientPhoneNumber}`
    );
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

  return (
    <div 
      className="min-vh-100 p-4 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: 'linear-gradient(135deg, #45b7d1 0%, #2196F3 100%)',
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
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: '250px',
        height: '250px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite 1s'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '800px' }}>
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
            👨‍⚕️
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
            Select Your Doctor
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
            Choose a doctor available for consultation
          </p>
        </div>

        {/* Doctors Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {doctors.length === 0 ? (
            <div 
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white'
              }}
            >
              <p className="lead">No doctors available in this department at the moment.</p>
            </div>
          ) : (
            doctors.map((doctor, idx) => (
              <button
                key={doctor.id}
                onClick={() => handleDoctorSelect(doctor.id)}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  animation: `slideUp 0.6s ease-out ${0.1 + idx * 0.1}s both`,
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.75rem',
                  display: 'inline-block',
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, #45b7d1 0%, #2196F3 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  👨‍⚕️
                </div>
                <h5 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#2196F3',
                  margin: '1rem 0 0.5rem 0'
                }}>
                  Dr. {doctor.name}
                </h5>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  margin: 0
                }}>
                  Room {doctor.roomNumber} • Floor {doctor.floorNumber}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Progress Indicator */}
        <div 
          style={{
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
              width: '80%',
              height: '100%',
              background: 'white',
              borderRadius: '2px',
              transition: 'width 0.2s ease'
            }} />
          </div>
          <small>Step 4 of 5</small>
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
