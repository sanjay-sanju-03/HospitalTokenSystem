// src/app/display/page.tsx
'use client';

import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

interface QueueStatus {
  doctorId: string;
  doctorName: string;
  departmentName: string;
  roomNumber: string;
  floorNumber: string;
  nowServing: { tokenNumber: number } | null;
  nextInLine: { tokenNumber: number } | null;
  waitingCount: number;
  estimatedWaitTime: string;
}

let socket: Socket | undefined;

export default function WaitingRoomDisplayPage() {
  const [queueStatuses, setQueueStatuses] = useState<QueueStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch initial data and refresh on demand
  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/queues');
      const data = await response.json();
      console.log('[DISPLAY PAGE] Queue data fetched:', data);
      if (response.ok) {
        setQueueStatuses(data);
        console.log('[DISPLAY PAGE] Queue statuses updated:', data.length, 'doctors');
      } else {
        setError(data.message || 'Failed to fetch queue data.');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('An unexpected error occurred while fetching queue data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData(); // Fetch initial data

    // Auto-refresh every 5 seconds for real-time updates
    const refreshInterval = setInterval(fetchQueueData, 5000);

    // Initialize Socket.IO client
    // Connect to the separate Socket.IO server running on port 3001
    socket = io(`http://localhost:3001`, {
      path: '/api/socketio', // Match the path configured in socket-server.ts
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server from display');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server from display');
    });

    // Listen for queue updates
    socket.on('tokenStatusChanged', (updatedToken) => {
      console.log('Received tokenStatusChanged:', updatedToken);
      // For simplicity, trigger a full re-fetch of queue data on any token change
      // In a more optimized app, you'd update only the relevant doctor's data
      fetchQueueData();
    });

    socket.on('refreshQueue', () => {
      console.log('Received refreshQueue event, refetching data...');
      fetchQueueData();
    });

    return () => {
      clearInterval(refreshInterval);
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

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
      className="min-vh-100 p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1d29 0%, #0f3460 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(78, 205, 196, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'float 10s ease-in-out infinite 1s'
      }} />

      <div className="container-lg" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div 
          className="text-center mb-5"
          style={{
            animation: 'slideUp 0.8s ease-out'
          }}
        >
          <h1 className="display-3 fw-bold mb-2" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none'
          }}>
            🏥 Hospital Waiting Room Display
          </h1>
          <p className="lead opacity-75">Real-time queue status for all departments</p>
        </div>

        {queueStatuses.length === 0 ? (
          <div 
            className="text-center py-5"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '2px dashed rgba(102, 126, 234, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <p className="lead opacity-75">📭 No queue information available at the moment.</p>
          </div>
        ) : (
          <div className="row g-4">
            {queueStatuses.map((qs, idx) => (
              <div className="col-lg-4 col-md-6" key={qs.doctorId}>
                <div
                  className="card h-100 border-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    animation: `slideUp 0.6s ease-out ${0.1 + idx * 0.1}s both`,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.2)';
                  }}
                >
                  <div className="card-body">
                    {/* Doctor Name */}
                    <h3 className="card-title fw-bold mb-1" style={{
                      fontSize: '1.5rem',
                      color: '#667eea'
                    }}>
                      👨‍⚕️ Dr. {qs.doctorName}
                    </h3>
                    
                    {/* Department & Location */}
                    <p className="text-muted small mb-3" style={{ opacity: 0.8 }}>
                      {qs.departmentName} • Room {qs.roomNumber}, Floor {qs.floorNumber}
                    </p>

                    <div className="divider" style={{
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent)',
                      marginBottom: '1.5rem'
                    }} />

                    {/* Now Serving - Large Display */}
                    <div className="mb-4" style={{
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, rgba(0, 210, 106, 0.2) 0%, rgba(74, 222, 128, 0.2) 100%)',
                      borderRadius: '12px',
                      border: '2px solid rgba(0, 210, 106, 0.3)',
                      textAlign: 'center',
                      animation: qs.nowServing ? 'pulse 2s ease-in-out infinite' : 'none'
                    }}>
                      <small className="d-block mb-2 text-uppercase fw-bold opacity-75">Now Serving</small>
                      <div style={{
                        fontSize: '3.5rem',
                        fontWeight: 'bold',
                        color: '#00d26a',
                        textShadow: '0 0 10px rgba(0, 210, 106, 0.5)',
                        minHeight: '4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {qs.nowServing ? `#${qs.nowServing.tokenNumber}` : '—'}
                      </div>
                    </div>

                    {/* Next in Line */}
                    <div className="mb-4" style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(68, 165, 162, 0.2) 100%)',
                      borderRadius: '12px',
                      border: '1px solid rgba(78, 205, 196, 0.3)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <small className="fw-bold opacity-75">Next in Line</small>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: '#4ecdc4'
                        }}>
                          {qs.nextInLine ? `#${qs.nextInLine.tokenNumber}` : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Queue Stats */}
                    <div className="row g-2">
                      <div className="col-6">
                        <div style={{
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <small className="d-block opacity-75 mb-1">Waiting</small>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#45b7d1'
                          }}>
                            {qs.waitingCount}
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div style={{
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <small className="d-block opacity-75 mb-1">Est. Wait</small>
                          <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: '#ffa500'
                          }}>
                            {qs.estimatedWaitTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 210, 106, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(0, 210, 106, 0);
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
