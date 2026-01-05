'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FeedbackPage() {
  const [npsScore, setNpsScore] = useState(0);
  const [waitTimeRating, setWaitTimeRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('tokenId');
  const phoneNumber = searchParams.get('phone');

  const handleSubmit = async () => {
    if (!tokenId || !phoneNumber) {
      setError('Missing token or phone information');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          patientPhoneNumber: phoneNumber,
          npsScore: npsScore || null,
          waitTimeRating: waitTimeRating || null,
          staffRating: staffRating || null,
          comments: comments || null,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => router.push('/'), 3000);
      } else {
        setError('Failed to submit feedback');
      }
    } catch (err) {
      setError('Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <h1 className="display-4 text-success mb-4">✓ Thank You!</h1>
          <p className="lead mb-4">Your feedback helps us improve.</p>
          <p className="text-muted">Returning to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light p-4">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="card-body">
          <h1 className="card-title text-center mb-4 display-6">Patient Feedback</h1>
          <p className="text-center text-muted mb-4">Help us improve your experience</p>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* NPS Score */}
          <div className="mb-4">
            <label className="form-label fw-bold">How likely are you to recommend us? (0-10)</label>
            <div className="d-flex gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  className={`btn ${npsScore === score ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setNpsScore(score)}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Wait Time Rating */}
          <div className="mb-4">
            <label className="form-label fw-bold">How would you rate the wait time?</label>
            <div className="btn-group w-100" role="group">
              {[
                { value: 1, label: 'Very Long' },
                { value: 2, label: 'Long' },
                { value: 3, label: 'Acceptable' },
                { value: 4, label: 'Good' },
                { value: 5, label: 'Excellent' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  className={`btn ${waitTimeRating === value ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setWaitTimeRating(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Rating */}
          <div className="mb-4">
            <label className="form-label fw-bold">How would you rate the staff?</label>
            <div className="btn-group w-100" role="group">
              {[
                { value: 1, label: 'Poor' },
                { value: 2, label: 'Fair' },
                { value: 3, label: 'Good' },
                { value: 4, label: 'Very Good' },
                { value: 5, label: 'Excellent' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  className={`btn ${staffRating === value ? 'btn-info' : 'btn-outline-info'}`}
                  onClick={() => setStaffRating(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mb-4">
            <label className="form-label fw-bold">Additional Comments (Optional)</label>
            <textarea
              className="form-control"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your thoughts..."
            />
          </div>

          {/* Submit Button */}
          <button
            className="btn btn-primary btn-lg w-100"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
