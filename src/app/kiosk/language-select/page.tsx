// src/app/kiosk/language-select/page.tsx (with animation)
'use client';

import { useRouter } from 'next/navigation';

export default function LanguageSelectPage() {
  const router = useRouter();

  const handleLanguageSelect = (lang: string) => {
    console.log(`Language selected: ${lang}`);
    router.push('/kiosk/phone-number-input');
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '250px',
        height: '250px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite 1s'
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          fontSize: '5rem',
          marginBottom: '1.5rem',
          animation: 'bounce 0.8s ease-in-out infinite',
          display: 'inline-block'
        }}>
          🌍
        </div>

        {/* Title */}
        <h1 
          className="fw-bold mb-3"
          style={{
            fontSize: '3rem',
            color: 'white',
            textShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            animation: 'slideUp 0.6s ease-out'
          }}
        >
          Welcome to FlowKiosk
        </h1>

        {/* Subtitle */}
        <p 
          className="lead mb-5"
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.3rem',
            animation: 'slideUp 0.6s ease-out 0.1s both'
          }}
        >
          Select your preferred language
        </p>

        {/* Language Button */}
        <div style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>
          <button
            className="btn btn-lg fw-bold"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              color: '#667eea',
              border: 'none',
              borderRadius: '12px',
              padding: '1.2rem 3rem',
              fontSize: '1.5rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              minWidth: '300px'
            }}
            onClick={() => handleLanguageSelect('en')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
            }}
          >
            English 🇬🇧
          </button>
        </div>

        {/* Hint */}
        <p 
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '3rem',
            fontSize: '0.95rem',
            animation: 'pulse 2s ease-in-out infinite 0.5s'
          }}
        >
          ✨ Tap to continue
        </p>
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
        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
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