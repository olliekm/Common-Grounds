'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './my_events.css';

type Mode = 'matcha' | 'coffee';

interface Event {
  id: number;
  title: string;
  description: string;
  tags: string[];
  matcha_mode: boolean;
  created_at: string;
}

export default function MyEvents() {
  const [mode, setMode] = useState<Mode>('matcha');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/events`);
      // const data = await response.json();
      // setEvents(data);

      // Mock data for demonstration
      const mockEvents: Event[] = [
        {
          id: 1,
          title: 'Sunday Morning Pottery',
          description: 'Join us for a relaxing pottery session where we\'ll create beautiful ceramic pieces together. Perfect for beginners!',
          tags: ['Art & Crafts', 'Ceramics', 'Creative'],
          matcha_mode: true,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Garden Book Club',
          description: 'Monthly gathering to discuss our favorite books in a peaceful garden setting. This month: literary fiction.',
          tags: ['Reading', 'Book Club', 'Nature'],
          matcha_mode: true,
          created_at: '2024-01-16T14:00:00Z'
        },
        {
          id: 3,
          title: 'Sunrise Yoga Flow',
          description: 'Start your day with energizing yoga flows and meditation. All levels welcome. Bring your own mat!',
          tags: ['Yoga', 'Meditation', 'Fitness'],
          matcha_mode: true,
          created_at: '2024-01-17T06:00:00Z'
        },
        {
          id: 4,
          title: 'Tech Career Workshop',
          description: 'Learn from industry professionals about breaking into tech, building your portfolio, and acing interviews.',
          tags: ['Career Development', 'Networking', 'Tech'],
          matcha_mode: false,
          created_at: '2024-01-18T18:00:00Z'
        },
        {
          id: 5,
          title: 'UX Research Meetup',
          description: 'Connect with fellow UX researchers, share case studies, and discuss latest trends in user research methodologies.',
          tags: ['UX Research', 'Design', 'Networking'],
          matcha_mode: false,
          created_at: '2024-01-19T19:00:00Z'
        }
      ];

      setEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    mode === 'matcha' ? event.matcha_mode : !event.matcha_mode
  );

  const cardsPerView = 3;
  const maxIndex = Math.max(0, filteredEvents.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const toggleMode = () => {
    setMode(mode === 'matcha' ? 'coffee' : 'matcha');
    setCurrentIndex(0); // Reset carousel when switching modes
  };

  const getEventIcon = (index: number) => {
    const icons = mode === 'matcha' 
      ? ['🏺', '📚', '🧘', '🎨', '🌿', '🎭', '📸', '🎵']
      : ['💼', '📊', '🎯', '💻', '🚀', '📈', '🎓', '🤝'];
    return icons[index % icons.length];
  };

  if (loading) {
    return (
      <div className={`my-events-container mode-${mode}`}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '48px'
        }}>
          {mode === 'matcha' ? '🍵' : '☕'}
        </div>
      </div>
    );
  }

  return (
    <div className={`my-events-container mode-${mode}`}>
      {/* Header */}
      <header className="my-events-header">
        <Link href="/" className="home-button">
          <span className="home-icon">🏠</span>
          Home
        </Link>
        <h1 className="header-title">My Events</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="my-events-main">
        {/* Hero Section */}
        <section className="events-hero">
          <div className="hero-icon-container">
            {mode === 'matcha' ? '🍵' : '☕'}
          </div>
          <h1 className="events-title">
            Your {mode === 'matcha' ? 'Matcha' : 'Coffee'} Events
          </h1>
          <p className="events-subtitle">
            {mode === 'matcha' 
              ? 'All your personal and creative gatherings in one place'
              : 'Your professional development journey, organized'
            }
          </p>
        </section>

        {/* Mode Toggle */}
        <section className="mode-toggle-section">
          <div className="mode-switch-wrapper">
            <div 
              className={`mode-label mode-label-matcha ${mode === 'matcha' ? 'active' : ''}`}
              onClick={toggleMode}
            >
              🍵 Matcha
            </div>
            <div 
              className={`mode-label mode-label-coffee ${mode === 'coffee' ? 'active' : ''}`}
              onClick={toggleMode}
            >
              ☕ Coffee
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        {filteredEvents.length > 0 ? (
          <section className="carousel-section">
            <div className="carousel-container">
              <button 
                className="carousel-control carousel-control-prev"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                ←
              </button>

              <div className="carousel-track" style={{
                transform: `translateX(-${currentIndex * (100 / cardsPerView + 2.67)}%)`
              }}>
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="event-card">
                    <div className="event-image">
                      <span>{getEventIcon(index)}</span>
                    </div>
                    <div className="event-content">
                      <span className="event-mode-badge">
                        {event.matcha_mode ? '🍵 Matcha' : '☕ Coffee'}
                      </span>
                      <h3 className="event-title">{event.title}</h3>
                      <p className="event-description">{event.description}</p>
                      <div className="event-tags">
                        {event.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="event-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="carousel-control carousel-control-next"
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
              >
                →
              </button>
            </div>

            {/* Carousel Indicators */}
            {filteredEvents.length > cardsPerView && (
              <div className="carousel-indicators">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <div
                    key={index}
                    className={`indicator-dot ${currentIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="empty-state">
            <div className="empty-icon">{mode === 'matcha' ? '🍵' : '☕'}</div>
            <h2 className="empty-title">No events yet</h2>
            <p className="empty-description">
              Start brewing some {mode === 'matcha' ? 'matcha' : 'coffee'} moments!
            </p>
            <Link href="/create_event" className="create-event-button">
              <span>✨</span>
              Create Your First Event
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}