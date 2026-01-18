'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';

interface UserData {
  name: string;
  [key: string]: any;
}

export default function CommonGrounds() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    loadUserData();
  }, [router]);

  const loadUserData = async () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (!userId) {
      router.push('/onboarding');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`);

      if (response.status === 404) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('onboardingComplete');
        router.push('/onboarding');
        return;
      }

      if (!response.ok) {
        console.error('Server error, using cached data');
        setUserData({ name: userName || 'User' });
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (err) {
      console.error('Network error, using cached data:', err);
      setUserData({ name: userName || 'User' });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <h1>CommonGrounds</h1>
        </div>

        <div className="header-right">
          <Link href="/brew_event" className="create-event-btn">
            Create Event
          </Link>
          <Link href="/profile" className="avatar-link">
            <div className="user-avatar-header">
              <span className="avatar-initial">{userData?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="cups-container">
            <div className="cup cup-matcha"></div>
            <div className="cup cup-coffee"></div>
      </div>

      {/* Main Content */}
      <main className="main">
        {/* Hero Section */}
        <div className="hero">
          <p className="subtitle">Ready to brew some balance today?</p>

          <h2 className="title">
            Welcome to your <span className="title-accent">cozy corner.</span>
          </h2>

          <p className="description">
            Find your perfect blend.
          </p>
        </div>

        {/* Cards */}
        <div className="cards-grid">
          {/* Matcha card */}
          <div
            className={`card card-personal ${hoveredCard === 'personal' ? 'card-hover' : ''}`}
            onMouseEnter={() => setHoveredCard('personal')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ position: 'relative' }}
          >
            <img 
              src="/matcha-cup.png" 
              alt="Matcha cup" 
              style={{
                position: 'absolute',
                top: '-40px',
                left: '-60px',
                width: '120px',
                height: 'auto',
                zIndex: 10,
                objectFit: 'contain'
              }}
            />
            <div className="card-badge">Personal</div>

            <h3 className="card-title">Matcha Mode</h3>

            <p className="card-description">
              Nurture your soul. Tend to your personal garden of wellbeing.
            </p>

            <div className="tags">
              <span className="tag">Yoga Flow</span>
              <span className="tag">Book Club</span>
              <span className="tag">Meditation</span>
            </div>

            <Link href="/matcha" className="button button-matcha">
              Enter Matcha Mode
            </Link>
          </div>

          {/* Coffee Card */}
          <div
            className={`card card-professional ${hoveredCard === 'professional' ? 'card-hover' : ''}`}
            onMouseEnter={() => setHoveredCard('professional')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ position: 'relative' }}
          >
            <img 
              src="/coffee-cup.png" 
              alt="Coffee cup" 
              style={{
                position: 'absolute',
                top: '-60px',
                right: '-40px',
                width: '120px',
                height: 'auto',
                zIndex: 10,
                objectFit: 'contain'
              }}
            />
            <div className="card-badge">Professional</div>

            <h3 className="card-title">Coffee Mode</h3>

            <p className="card-description">
              Let's brew success. Network, learn, and grow your career.
            </p>

            <div className="tags">
              <span className="tag">Networking</span>
              <span className="tag">Workshops</span>
              <span className="tag">Mentorship</span>
            </div>

            <Link href="/coffee" className="button button-coffee">
              Enter Coffee Mode
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="footer">
        <p className="footer-text">
          Common Grounds
        </p>
      </footer> */}
    </div>
  );
}