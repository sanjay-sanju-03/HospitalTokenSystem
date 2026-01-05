// src/app/staff/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { Doctor, Token } from '@/lib/types';

interface QueueStatus {
  doctorId: string;
  doctorName: string;
  departmentName: string;
  roomNumber: string;
  floorNumber: string;
  nowServing: Token | null;
  nextInLine: Token | null;
  waitingCount: number;
  allWaitingTokens: Token[]; // Add this to manage the full waiting list
}

let socket: Socket | undefined;

export default function StaffDashboardPage() {
  const [queueStatuses, setQueueStatuses] = useState<QueueStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/queues');
      const data = await response.json();
      console.log('[STAFF DASHBOARD] Queue data fetched:', data);
      if (response.ok) {
        // Enhance with full waiting tokens for staff actions
        const enhancedQueueStatuses = await Promise.all(data.map(async (qs: any) => {
          const doctorQueueResponse = await fetch(`/api/doctor-queue/${qs.doctorId}`);
          const doctorQueueData = await doctorQueueResponse.json();
          console.log(`[STAFF DASHBOARD] Doctor ${qs.doctorId} queue:`, doctorQueueData);
          return { ...qs, allWaitingTokens: doctorQueueData.waitingTokens || [] };
        }));
        setQueueStatuses(enhancedQueueStatuses);
        console.log('[STAFF DASHBOARD] Queue statuses updated');
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

  // Auto-refresh every 5 seconds for real-time updates
  useEffect(() => {
    const refreshInterval = setInterval(fetchQueueData, 5000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    // Basic authentication check (for prototype)
    // In a real app, this would be a more robust check (e.g., JWT token)
    // if (!localStorage.getItem('staffLoggedIn')) {
    //   router.replace('/staff/login');
    //   return;
    // }

    fetchQueueData(); // Fetch initial data

    socket = io(`http://localhost:3001`, {
      path: '/api/socketio',
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server from staff dashboard');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server from staff dashboard');
    });

    socket.on('tokenStatusChanged', () => {
      console.log('Received tokenStatusChanged, refetching queue for display consistency');
      fetchQueueData(); // Refetch to ensure dashboard reflects latest state
    });

    socket.on('refreshQueue', () => {
      console.log('Received refreshQueue event, refetching data...');
      fetchQueueData();
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleCallNext = async (doctorId: string, currentServingTokenId: string | null) => {
    setError('');
    try {
      // Mark current serving as completed if exists
      if (currentServingTokenId) {
        await fetch(`/api/token/${currentServingTokenId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed', completedAt: new Date().toISOString() }),
        });
      }

      // Find the next waiting token
      const currentQueue = queueStatuses.find(qs => qs.doctorId === doctorId);
      const nextToken = currentQueue?.allWaitingTokens.find(t => t.status === 'waiting');

      if (nextToken) {
        await fetch(`/api/token/${nextToken.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'serving', servedAt: new Date().toISOString() }),
        });
        socket?.emit('queueUpdateTrigger', { doctorId }); // Notify displays
      } else {
        // If no one is waiting, simply clear the 'now serving' if there was one
        if (currentServingTokenId) {
          socket?.emit('queueUpdateTrigger', { doctorId }); // Notify displays
        } else {
          alert('No patients in the queue to call.');
          return;
        }
      }
      fetchQueueData(); // Refresh dashboard
    } catch (err) {
      console.error('Error calling next patient:', err);
      setError('Failed to call next patient.');
    }
  };

  const handleMarkCompleted = async (tokenId: string, doctorId: string) => {
    setError('');
    try {
      await fetch(`/api/token/${tokenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', completedAt: new Date().toISOString() }),
      });
      socket?.emit('queueUpdateTrigger', { doctorId }); // Notify displays
      fetchQueueData(); // Refresh dashboard
    } catch (err) {
      console.error('Error marking token as completed:', err);
      setError('Failed to mark token as completed.');
    }
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
      className="min-vh-100 p-4"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      }}
    >
      {/* Background accent */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '0%',
          right: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }} />
      </div>

      <div className="container-lg" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div 
          className="mb-5"
          style={{
            animation: 'slideUp 0.6s ease-out'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '3rem',
            borderRadius: '16px',
            color: 'white',
            boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
            textAlign: 'center'
          }}>
            <h1 className="display-4 fw-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              👨‍💼 Staff Dashboard
            </h1>
            <p className="lead mb-0 opacity-90">Manage patient queues across all departments</p>
          </div>
        </div>

        {queueStatuses.length === 0 ? (
          <div 
            className="text-center py-5"
            style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              animation: 'slideUp 0.6s ease-out 0.1s both'
            }}
          >
            <p className="lead opacity-75">📭 No doctor queue information available.</p>
          </div>
        ) : (
          <div className="row g-4 mb-5">
            {queueStatuses.map((qs, idx) => (
              <div className="col-lg-6 col-md-12" key={qs.doctorId}>
                <div
                  className="card h-100 border-0"
                  style={{
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    animation: `slideUp 0.6s ease-out ${0.1 + idx * 0.1}s both`,
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '1.5rem',
                    color: 'white'
                  }}>
                    <h3 className="card-title fw-bold mb-1" style={{ fontSize: '1.3rem' }}>
                      👨‍⚕️ {qs.doctorName}
                    </h3>
                    <p className="small mb-0 opacity-90">
                      {qs.departmentName} • Room {qs.roomNumber}, Floor {qs.floorNumber}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="card-body p-4">
                    {/* Currently Serving */}
                    <div className="mb-4" style={{
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, rgba(0, 210, 106, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)',
                      borderRadius: '12px',
                      border: '2px solid rgba(0, 210, 106, 0.3)'
                    }}>
                      <small className="fw-bold text-uppercase opacity-75 d-block mb-2">
                        Currently Serving
                      </small>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#00d26a',
                        marginBottom: '0.5rem',
                        minHeight: '2.5rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {qs.nowServing ? `#${qs.nowServing.tokenNumber}` : '—'}
                      </div>
                      {qs.nowServing && (
                        <button
                          className="btn btn-sm fw-bold"
                          style={{
                            background: 'linear-gradient(135deg, #ffa500 0%, #ff9500 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleMarkCompleted(qs.nowServing!.id, qs.doctorId)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 165, 0, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          ✓ Mark Completed
                        </button>
                      )}
                    </div>

                    {/* Queue Stats Row */}
                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div style={{
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(68, 165, 162, 0.1) 100%)',
                          borderRadius: '12px',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          textAlign: 'center'
                        }}>
                          <small className="fw-bold text-uppercase opacity-75 d-block mb-2">
                            Next in Line
                          </small>
                          <div style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: '#4ecdc4'
                          }}>
                            {qs.nextInLine ? `#${qs.nextInLine.tokenNumber}` : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div style={{
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)',
                          borderRadius: '12px',
                          border: '1px solid rgba(69, 183, 209, 0.3)',
                          textAlign: 'center'
                        }}>
                          <small className="fw-bold text-uppercase opacity-75 d-block mb-2">
                            Waiting
                          </small>
                          <div style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: '#45b7d1'
                          }}>
                            {qs.waitingCount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Call Next Button */}
                    <button
                      className="btn btn-lg fw-bold w-100"
                      style={{
                        background: 'linear-gradient(135deg, #00d26a 0%, #4ade80 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(0, 210, 106, 0.3)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleCallNext(qs.doctorId, qs.nowServing?.id || null)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 210, 106, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 210, 106, 0.3)';
                      }}
                    >
                      🔔 Call Next Patient
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-5 pb-5">
          <button 
            className="btn btn-lg fw-bold"
            style={{
              background: 'linear-gradient(135deg, #0d6efd 0%, #45b7d1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/analytics')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(13, 110, 253, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.3)';
            }}
          >
            📊 Analytics
          </button>
          <button 
            className="btn btn-lg fw-bold"
            style={{
              background: 'linear-gradient(135deg, #ff3838 0%, #ff6b6b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              boxShadow: '0 4px 12px rgba(255, 56, 56, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/staff/login')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 56, 56, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 56, 56, 0.3)';
            }}
          >
            🚪 Logout
          </button>
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
