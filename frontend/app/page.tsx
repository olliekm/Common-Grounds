'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

export default function CommonGrounds() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Your FastAPI backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  /*
  useEffect(() => {
    loadUserData();
  }, [router]);

  const loadUserData = async () => {
    // Check if user has completed onboarding
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      // No user ID found, redirect to onboarding
      router.push('/onboarding');
      return;
    }

    try {
      // Fetch user data from FastAPI backend
      const response = await fetch(`${API_URL}/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('User not found');
      }

      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user:', err);
      // If user not found in backend, redirect to onboarding
      localStorage.removeItem('userId');
      localStorage.removeItem('onboardingComplete');
      router.push('/onboarding');
    }
  };

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
  */

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <h1>Common Grounds</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Hero Section */}
        <div className="hero">
          <p className="subtitle">
            Ready to brew some balance today{userData?.name ? `, ${userData.name}` : ''}?
          </p>
          
          <div className="cups-container">
            <div className="cup cup-matcha"></div>
            <div className="cup cup-coffee"></div>
          </div>

          <h2 className="title">
            Welcome to your <span className="title-accent">cozy corner.</span>
          </h2>
          
          <p className="description">
            Discover your blend.
          </p>
        </div>

        {/* Cards */}
        <div className="cards-grid">
          {/* Personal Bloom Card */}
          <div 
            className={`card card-personal ${hoveredCard === 'personal' ? 'card-hover' : ''}`}
            onMouseEnter={() => setHoveredCard('personal')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push('/matcha')}
          >
            <div className="card-header">
              <div className="card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7a9d8f" strokeWidth="2">
                  <path d="M12 2a9 9 0 0 0-9 9c0 5.25 9 13 9 13s9-7.75 9-13a9 9 0 0 0-9-9z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
              </div>
              <div className="card-icon-secondary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7a9d8f" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
            </div>

            <h3 className="card-title">Personal Bloom</h3>
            
            <p className="card-description">
              {userData?.matcha_blurb || 'Tend to your personal garden of wellbeing.'}
            </p>

            <div className="tags">
              {userData?.tags && userData.tags.length > 0 ? (
                userData.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))
              ) : (
                <>
                  <span className="tag">Yoga Flow</span>
                  <span className="tag">Book Club</span>
                  <span className="tag">Meditation</span>
                </>
              )}
            </div>

            <button className="button button-matcha">
              Enter Matcha Mode <span>✨</span>
            </button>
          </div>

          {/* Professional Pulse Card */}
          <div 
            className={`card card-professional ${hoveredCard === 'professional' ? 'card-hover' : ''}`}
            onMouseEnter={() => setHoveredCard('professional')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push('/coffee')}
          >
            <div className="card-header">
              <div className="card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b6f5c" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="card-icon-secondary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b6f5c" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="12" cy="12" r="1"/>
                </svg>
              </div>
            </div>

            <h3 className="card-title">Professional Pulse</h3>
            
            <p className="card-description">
              {userData?.coffee_blurb || 'Brew your dreamsElevate your career.'}
            </p>

            <div className="tags">
              {userData?.tags && userData.tags.length > 0 ? (
                userData.tags.slice(3, 6).map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))
              ) : (
                <>
                  <span className="tag">Design Review</span>
                  <span className="tag">Project Alpha</span>
                  <span className="tag">Team Standup</span>
                </>
              )}
            </div>

            <button className="button button-coffee">
              Enter Coffee Mode <span>⚡</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <div className="search-icon">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Look up a hobby or project..."
              className="search-input"
            />
            <button className="search-button">Quick Search</button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#">How it works</a>
          <a href="#">Community</a>
          <a href="#">Privacy</a>
        </div>
        <p className="footer-text">
          © 2024 Common Grounds • Made with love & caffeine (and matcha!)
        </p>
      </footer>
    </div>
  );
}