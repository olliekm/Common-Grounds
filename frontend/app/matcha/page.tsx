'use client';

import { useState, useEffect } from 'react';
import FloatingAvatar from '@/components/FloatingAvatar';
import Link from 'next/link';
import './matcha.css';

interface Event {
  id: number;
  title: string;
  description: string;
  tags: string[];
  matcha_mode: boolean;
  created_at: string;
}

export default function MatchaMode() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [viewStartTime, setViewStartTime] = useState<Date>(new Date());
  const [debugInfo, setDebugInfo] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Reset view start time when card changes
    setViewStartTime(new Date());
  }, [currentIndex]);

  const fetchEvents = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No user ID found');
        setDebugInfo('ERROR: No user ID in localStorage');
        return;
      }

      console.log('=== FETCHING EVENTS DEBUG ===');
      console.log('User ID:', userId);
      console.log('API URL:', API_URL);

      const url = `${API_URL}/events?user_id=${userId}&matcha_mode=true&limit=5`;
      console.log('Full URL:', url);

      setDebugInfo(`Fetching from: ${url}`);

      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setDebugInfo(`ERROR: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', data?.length);

      if (data && data.length > 0) {
        console.log('First event:', data[0]);
      }

      setDebugInfo(`SUCCESS: Received ${data?.length || 0} events`);
      setEvents(data || []);
    } catch (error) {
      console.error('=== ERROR FETCHING EVENTS ===');
      console.error('Error:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      setDebugInfo(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= events.length) return;

    const currentEvent = events[currentIndex];
    const userId = localStorage.getItem('userId');

    if (!userId) return;

    // Animate the swipe
    setSwipeDirection(direction);

    // Record the swipe
    try {
      const swipeData = {
        user_id: parseInt(userId),
        event_id: currentEvent.id,
        direction: direction,
        view_start: viewStartTime.toISOString(),
        view_end: new Date().toISOString(),
        matcha_mode: true
      };

      console.log('Recording swipe:', swipeData);

      const response = await fetch(`${API_URL}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swipeData)
      });

      if (!response.ok) {
        throw new Error('Failed to record swipe');
      }

      console.log(`Swiped ${direction} on event:`, currentEvent.title);
    } catch (error) {
      console.error('Error recording swipe:', error);
    }

    // Move to next card after animation
    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex(currentIndex + 1);
    }, 300);
  };

  const currentEvent = events[currentIndex];
  const hasMoreEvents = currentIndex < events.length;

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#faf9f7'
      }}>
        <div style={{ fontSize: '48px' }}>🍵</div>
        <div style={{ fontSize: '14px', color: '#666' }}>{debugInfo}</div>
      </div>
    );
  }

  // Check if there are no events at all
  const noEventsAvailable = events.length === 0;

  return (
    <div className="matcha-container">
      {/* Floating 3D Avatar */}
      <FloatingAvatar mode="matcha" />

      {/* Header */}
      <header className="matcha-header">
        <div className="header-left">
          <Link href="/" className="logo-container">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <span className="logo-text">Common Grounds</span>
          </Link>
        </div>
      
        <div className="header-right">
          <Link href="/profile">
            <div className="avatar"></div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="matcha-main">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            Time to <span className="hero-accent">unwind.</span>
          </h1>
          <p className="hero-subtitle">
            Swipe right on activities that speak to your soul.
          </p>

          {/* Debug Info */}
          <div style={{ 
            textAlign: 'center', 
            margin: '10px auto',
            padding: '10px',
            background: '#fff3cd',
            borderRadius: '8px',
            maxWidth: '600px',
            fontSize: '12px',
            color: '#856404'
          }}>
            <strong>Debug:</strong> {debugInfo}
          </div>

          {/* Progress Indicator - Only show if there are events */}
          {!noEventsAvailable && (
            <div className="swipe-progress">
              <span className="progress-text">{currentIndex + 1} / {events.length}</span>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${((currentIndex + 1) / Math.max(events.length, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </section>

        {/* Swipe Card Section */}
        <section className="swipe-section">
          {noEventsAvailable ? (
            <div className="no-more-cards">
              <div className="completion-icon">🌱</div>
              <h2 className="completion-title">No activities available</h2>
              <p className="completion-description">
                {debugInfo}
              </p>
              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '13px',
                textAlign: 'left',
                maxWidth: '500px',
                margin: '20px auto'
              }}>
                <strong>Troubleshooting:</strong>
                <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Check browser console (F12) for detailed logs</li>
                  <li>Verify FastAPI server is running on {API_URL}</li>
                  <li>Confirm events exist in Supabase with matcha_mode=true</li>
                  <li>Check if /events endpoint has fallback logic</li>
                </ol>
              </div>
              <div className="completion-actions">
                <button className="btn-primary" onClick={() => window.location.reload()}>
                  Retry
                </button>
                <Link href="/">
                  <button className="btn-secondary">Back to Home</button>
                </Link>
              </div>
            </div>
          ) : !hasMoreEvents ? (
            <div className="no-more-cards">
              <div className="completion-icon">✨</div>
              <h2 className="completion-title">You've explored all activities!</h2>
              <p className="completion-description">
                Great job exploring your interests. Check back later for more opportunities.
              </p>
              <div className="completion-actions">
                <Link href="/analytics">
                  <button className="btn-primary">View Your Analytics</button>
                </Link>
                <Link href="/">
                  <button className="btn-secondary">Back to Home</button>
                </Link>
              </div>
            </div>
          ) : (
            <div className={`swipe-card-container ${swipeDirection ? `swiping-${swipeDirection}` : ''}`}>
              <div className="swipe-card">
                {/* Card Header with Category */}
                <div className="card-header-badge">
                  <span className="badge-icon">🍵</span>
                  <span className="badge-text">MATCHA MODE</span>
                </div>

                {/* Card Content */}
                <div className="card-content">
                  <h2 className="card-title">{currentEvent.title}</h2>
                  <p className="card-description">{currentEvent.description}</p>

                  {/* Tags */}
                  {currentEvent.tags && currentEvent.tags.length > 0 && (
                    <div className="card-tags">
                      {currentEvent.tags.map((tag, index) => (
                        <span key={index} className="card-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swipe Indicators */}
                <div className="swipe-indicators">
                  <div className="swipe-indicator swipe-left-indicator">
                    <span className="indicator-text">PASS</span>
                  </div>
                  <div className="swipe-indicator swipe-right-indicator">
                    <span className="indicator-text">INTERESTED</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="swipe-actions">
                <button 
                  className="swipe-button swipe-button-left"
                  onClick={() => handleSwipe('left')}
                  aria-label="Pass"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>

                <button 
                  className="swipe-button swipe-button-right"
                  onClick={() => handleSwipe('right')}
                  aria-label="Like"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </div>

              {/* Keyboard Hints */}
              <div className="keyboard-hints">
                <span className="hint">← Pass</span>
                <span className="hint">→ Interested</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Chat Button */}
      <button className="floating-chat-button">
        <span className="chat-icon">💬</span>
        <span className="chat-tooltip">Let's find something relaxing to do today!</span>
      </button>
    </div>
  );
}