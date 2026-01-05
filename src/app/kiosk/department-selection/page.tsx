// src/app/kiosk/department-selection/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Department } from '@/lib/types';

export default function DepartmentSelectionPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  useEffect(() => {
    if (!phone) {
      // If phone number is missing, redirect back to the start of the flow
      router.replace('/kiosk/phone-number-input');
      return;
    }
    async function fetchDepartments() {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        if (response.ok) {
          setDepartments(data);
        } else {
          setError(data.message || 'Failed to fetch departments.');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('An unexpected error occurred while fetching departments.');
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, [phone, router]);

  const handleDepartmentSelect = (departmentId: string) => {
    router.push(`/kiosk/doctor-selection?departmentId=${departmentId}&phone=${phone}`);
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
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
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

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '700px' }}>
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
            🏥
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
            Select Department
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
            Choose the department you want to visit
          </p>
        </div>

        {/* Departments Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {departments.length === 0 ? (
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
              <p className="lead">No departments available at the moment.</p>
            </div>
          ) : (
            departments.map((dept, idx) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentSelect(dept.id)}
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
                  fontSize: '2.5rem',
                  marginBottom: '0.75rem'
                }}>
                  🩺
                </div>
                <h5 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#ff6b6b',
                  margin: 0
                }}>
                  {dept.name}
                </h5>
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
              width: '66.66%',
              height: '100%',
              background: 'white',
              borderRadius: '2px',
              transition: 'width 0.2s ease'
            }} />
          </div>
          <small>Step 3 of 5</small>
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
