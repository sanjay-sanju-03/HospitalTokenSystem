'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Metric {
  date: string;
  consultations: number;
  avgWait: number;
  avgConsult: number;
  maxWait: number;
}

interface Analytics {
  overview: {
    totalConsultations: number;
    avgWaitTime: number;
    avgConsultationTime: number;
    npsScore: number;
    completedToday: number;
  };
  dailyMetrics: Metric[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      console.log('[ANALYTICS PAGE] Data fetched:', data);
      if (response.ok) {
        setAnalytics(data);
        console.log('[ANALYTICS PAGE] Analytics updated');
      } else {
        setError(data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
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

  if (!analytics) {
    return null;
  }

  return (
    <div 
      className="min-vh-100 p-4"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      }}
    >
      <div className="container-lg">
        {/* Header */}
        <div className="mb-5" style={{
          animation: 'slideUp 0.6s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '3rem',
            borderRadius: '16px',
            color: 'white',
            boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
          }}>
            <h1 className="display-4 fw-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              📊 FlowKiosk Analytics Dashboard
            </h1>
            <p className="lead mb-0 opacity-90">Real-time performance metrics and insights</p>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="row mb-5">
          {/* Completed Today */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div
              className="card border-0 h-100"
              style={{
                background: 'linear-gradient(135deg, #00d26a 0%, #4ade80 100%)',
                boxShadow: '0 8px 24px rgba(0, 210, 106, 0.25)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                animation: 'slideUp 0.6s ease-out 0.1s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 210, 106, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 210, 106, 0.25)';
              }}
            >
              <div className="card-body text-white">
                <div style={{ opacity: 0.9, marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>✅</span>
                </div>
                <p className="card-subtitle mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Completed Today</p>
                <h2 className="card-title fw-bold" style={{ fontSize: '2.5rem' }}>{analytics.overview.completedToday}</h2>
                <small className="opacity-75">patients served</small>
              </div>
            </div>
          </div>

          {/* Avg Wait Time */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div
              className="card border-0 h-100"
              style={{
                background: 'linear-gradient(135deg, #0d6efd 0%, #45b7d1 100%)',
                boxShadow: '0 8px 24px rgba(13, 110, 253, 0.25)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                animation: 'slideUp 0.6s ease-out 0.2s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(13, 110, 253, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 110, 253, 0.25)';
              }}
            >
              <div className="card-body text-white">
                <div style={{ opacity: 0.9, marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>⏱️</span>
                </div>
                <p className="card-subtitle mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg Wait Time</p>
                <h2 className="card-title fw-bold" style={{ fontSize: '2.5rem' }}>{analytics.overview.avgWaitTime}</h2>
                <small className="opacity-75">minutes</small>
              </div>
            </div>
          </div>

          {/* Avg Consult Time */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div
              className="card border-0 h-100"
              style={{
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a5a2 100%)',
                boxShadow: '0 8px 24px rgba(78, 205, 196, 0.25)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                animation: 'slideUp 0.6s ease-out 0.3s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(78, 205, 196, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(78, 205, 196, 0.25)';
              }}
            >
              <div className="card-body text-white">
                <div style={{ opacity: 0.9, marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>👨‍⚕️</span>
                </div>
                <p className="card-subtitle mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg Consult Time</p>
                <h2 className="card-title fw-bold" style={{ fontSize: '2.5rem' }}>{analytics.overview.avgConsultationTime}</h2>
                <small className="opacity-75">minutes</small>
              </div>
            </div>
          </div>

          {/* NPS Score */}
          <div className="col-md-6 col-lg-3 mb-4">
            <div
              className="card border-0 h-100"
              style={{
                background: 'linear-gradient(135deg, #ffa500 0%, #ff9500 100%)',
                boxShadow: '0 8px 24px rgba(255, 165, 0, 0.25)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                animation: 'slideUp 0.6s ease-out 0.4s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(255, 165, 0, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 165, 0, 0.25)';
              }}
            >
              <div className="card-body text-white">
                <div style={{ opacity: 0.9, marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>😊</span>
                </div>
                <p className="card-subtitle mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Patient NPS Score</p>
                <h2 className="card-title fw-bold" style={{ fontSize: '2.5rem' }}>{analytics.overview.npsScore}</h2>
                <small className="opacity-75">out of 10</small>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Metrics Table */}
        <div 
          className="card border-0 mb-5"
          style={{
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            animation: 'slideUp 0.6s ease-out 0.2s both'
          }}
        >
          <div 
            className="card-header text-white py-3"
            style={{
              background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
              borderBottom: 'none'
            }}
          >
            <h5 className="mb-0 fw-bold">📈 Last 7 Days Performance</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                    <th className="py-3 px-4 fw-bold">Date</th>
                    <th className="text-end py-3 px-4 fw-bold">Consultations</th>
                    <th className="text-end py-3 px-4 fw-bold">Avg Wait</th>
                    <th className="text-end py-3 px-4 fw-bold">Avg Consult</th>
                    <th className="text-end py-3 px-4 fw-bold">Max Wait</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.dailyMetrics.map((metric, idx) => (
                    <tr 
                      key={metric.date}
                      style={{
                        borderBottom: '1px solid #e9ecef',
                        transition: 'background-color 0.2s ease',
                        animation: `slideUp 0.6s ease-out ${0.3 + idx * 0.05}s both`
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f3ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="py-3 px-4 fw-bold">{new Date(metric.date).toLocaleDateString()}</td>
                      <td className="text-end py-3 px-4">{metric.consultations}</td>
                      <td className="text-end py-3 px-4">
                        <span 
                          className="badge fw-bold"
                          style={{
                            background: metric.avgWait > 20 ? 'linear-gradient(135deg, #ff3838 0%, #ff6b6b 100%)' : 
                                       metric.avgWait > 10 ? 'linear-gradient(135deg, #ffa500 0%, #ff9500 100%)' : 
                                       'linear-gradient(135deg, #00d26a 0%, #4ade80 100%)',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.85rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {Math.round(metric.avgWait)} min
                        </span>
                      </td>
                      <td className="text-end py-3 px-4">{Math.round(metric.avgConsult)} min</td>
                      <td className="text-end py-3 px-4">
                        <span style={{ color: '#ff3838', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {Math.round(metric.maxWait)} min
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div 
          className="card border-0 mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 210, 106, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            border: '2px solid rgba(0, 210, 106, 0.3)',
            animation: 'slideUp 0.6s ease-out 0.3s both'
          }}
        >
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4" style={{ color: '#00d26a' }}>
              ✨ Key Insights & Recommendations
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #00d26a 0%, #4ade80 100%)',
                    borderRadius: '4px'
                  }} />
                  <p className="mb-3">
                    <strong>👥 Total Consultations:</strong><br />
                    <span style={{ fontSize: '1.3rem', color: '#00d26a', fontWeight: 'bold' }}>
                      {analytics.overview.totalConsultations}
                    </span> patients served
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #0d6efd 0%, #45b7d1 100%)',
                    borderRadius: '4px'
                  }} />
                  <p className="mb-3">
                    <strong>⚡ Efficiency:</strong><br />
                    Average wait is <span style={{ color: '#0d6efd', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {analytics.overview.avgWaitTime} min
                    </span>
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #ffa500 0%, #ff9500 100%)',
                    borderRadius: '4px'
                  }} />
                  <p className="mb-3">
                    <strong>😊 Patient Satisfaction:</strong><br />
                    NPS Score is <span style={{ color: '#ffa500', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {analytics.overview.npsScore}/10
                    </span>
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #4ecdc4 0%, #44a5a2 100%)',
                    borderRadius: '4px'
                  }} />
                  <p className="mb-0">
                    <strong>📊 Throughput:</strong><br />
                    <span style={{ color: '#4ecdc4', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {analytics.overview.completedToday}
                    </span> patients completed today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="d-flex justify-content-center mb-5">
          <button 
            onClick={() => router.push('/staff/dashboard')} 
            className="btn btn-lg fw-bold"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 2rem',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
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
            ← Back to Staff Dashboard
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
      `}</style>
    </div>
  );
}
