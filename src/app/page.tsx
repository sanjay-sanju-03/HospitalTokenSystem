'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const handleTap = () => {
      document.getElementById('welcome-container')?.classList.add('fade-out');
      setTimeout(() => {
        router.push('/kiosk/language-select');
      }, 300);
    };

    document.addEventListener('click', handleTap);
    document.addEventListener('touchstart', handleTap);

    return () => {
      document.removeEventListener('click', handleTap);
      document.removeEventListener('touchstart', handleTap);
    };
  }, [router]);

  return (
    <div
      id="welcome-container"
      className="d-flex justify-content-center align-items-center vh-100 fade-in"
      style={{
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-50px',
          left: '-50px',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          bottom: '-30px',
          right: '-30px',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Content */}
      <div className="text-center z-3" style={{ position: 'relative' }}>
        <div
          style={{
            fontSize: '4rem',
            marginBottom: '2rem',
            animation: 'bounce 0.6s ease-in-out',
          }}
        >
          🏥
        </div>
        <h1
          className="display-3 mb-4 slide-up"
          style={{
            color: 'white',
            fontWeight: '800',
            textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          FlowKiosk
        </h1>
        <p className="h5 mb-4 slide-up" style={{ color: 'rgba(255, 255, 255, 0.95)', animation: 'slideUp 0.6s ease-in-out 0.1s both' }}>
          Smart Clinic Queue Management
        </p>
        <p
          className="lead slide-up"
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            marginTop: '3rem',
            fontWeight: '500',
            animation: 'slideUp 0.6s ease-in-out 0.2s both',
          }}
        >
          ✨ Tap Anywhere to Start ✨
        </p>
        <div className="mt-5" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ margin: '0 auto' }}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
