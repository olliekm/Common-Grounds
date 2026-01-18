'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './matcha.css';

interface Event {
  id: number;
  title: string;
  description: string;
  tags: string[];
  matcha_mode: boolean;
  created_at: string;
  image_link?: string;
}

export default function MatchaMode() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [viewStartTime, setViewStartTime] = useState<Date>(new Date());

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
        return;
      }

      setLoading(true);
      console.log('Fetching personalized events for user:', userId);

      const response = await fetch(`${API_URL}/events?user_id=${userId}&matcha_mode=true&limit=5`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      console.log('Fetched events:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    console.log('Loading more events...');
    setCurrentIndex(0); // Reset to first card
    await fetchEvents(); // Fetch new unseen events
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

      await fetch(`${API_URL}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swipeData)
      });

      console.log(`Swiped ${direction} on event:`, currentEvent.title);
    } catch (error) {
      console.error('Error recording swipe:', error);
    }

    // Move to next card after animation
    setTimeout(() => {
    setSwipeDirection(null);
    setCurrentIndex(prev => Math.min(prev + 1, events.length - 1));
  }, 300);
  };

  const currentEvent = events[currentIndex];
  const hasMoreEvents = currentIndex < events.length - 1;

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#faf9f7'
      }}>
        <div style={{ fontSize: '48px' }}>🍵</div>
      </div>
    );
  }

  const noEventsAvailable = events.length === 0;

  return (
    <div className="matcha-container">

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
            <span className="logo-text">CommonGrounds</span>
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
        <section className="hero-section">
          {/* 3D Avatar */}
          <h1 className="hero-title">
            Time to <span className="hero-accent">unwind.</span>
          </h1>
          <p className="hero-subtitle">
            Swipe right on activities that speak to your soul.
          </p>

          {!noEventsAvailable && hasMoreEvents && (
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

        <section className="swipe-section">
          {noEventsAvailable ? (
            <div className="no-more-cards">
              <div className="completion-icon">🌱</div>
              <h2 className="completion-title">No activities available yet</h2>
              <p className="completion-description">
                We're currently building your personalized collection. Check back soon!
              </p>
              <div className="completion-actions">
                <button className="btn-primary" onClick={loadMoreEvents}>
                  Refresh Events
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
                Great job! Want to see more opportunities?
              </p>
              <div className="completion-actions">
                <button className="btn-primary" onClick={loadMoreEvents}>
                  Load More Activities
                </button>
                <Link href="/analytics">
                  <button className="btn-secondary">View Your Analytics</button>
                </Link>
              </div>
            </div>
          ) : (
            <div className={`swipe-card-container ${swipeDirection ? `swiping-${swipeDirection}` : ''}`}>
              <div className="swipe-card">
                {currentEvent.image_link ? (
                  <div className="card-image">
                    <img 
                      src={currentEvent.image_link} 
                      alt={currentEvent.title}
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                ) : (
                  <div className="card-image card-image-placeholder">
                    <div className="placeholder-content">🍵</div>
                  </div>
                )}

                <div className="card-header-badge">
                  <span className="badge-icon">🍵</span>
                  <span className="badge-text">MATCHA MODE</span>
                </div>

                <div className="card-content">
                  <h2 className="card-title">{currentEvent.title}</h2>
                  <p className="card-description">{currentEvent.description}</p>

                  {currentEvent.tags && currentEvent.tags.length > 0 && (
                    <div className="card-tags">
                      {currentEvent.tags.map((tag, index) => (
                        <span key={index} className="card-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="swipe-indicators">
                  <div className="swipe-indicator swipe-left-indicator">
                    <span className="indicator-text">PASS</span>
                  </div>
                  <div className="swipe-indicator swipe-right-indicator">
                    <span className="indicator-text">INTERESTED</span>
                  </div>
                </div>
              </div>

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

              <div className="keyboard-hints">
                <span className="hint">← Pass</span>
                <span className="hint">→ Interested</span>
              </div>
            </div>
          )}
        </section>
      </main>

      <button className="floating-chat-button">
        <span className="chat-icon">💬</span>
        <span className="chat-tooltip">Let's find something relaxing to do today!</span>
      </button>
    </div>
  );
}