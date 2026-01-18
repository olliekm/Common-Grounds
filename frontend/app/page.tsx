'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';

export default function CommonGrounds() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Your FastAPI backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
        
        <div className="header-right">
          <Link href="/profile">
          <div className="avatar"></div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Hero Section */}
        <div className="hero">
          <p className="subtitle">Ready to brew some balance today?</p>
          
          <div className="cups-container">
            <div className="cup cup-matcha"></div>
            <div className="cup cup-coffee"></div>
          </div>

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
          >
            <div className="card-header">
              <div className="card-icon">
                <svg 
                  width="28"           
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#7a9d8f"    
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
            </div>

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
          >
            <div className="card-header">
              <div className="card-icon">
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#B9967C" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
            </div>

            <h3 className="card-title">Coffee Mode</h3>
            
            <p className="card-description">
              Let's brew success.
            </p>

            <div className="tags">
              <span className="tag">Design Review</span>
              <span className="tag">Project Alpha</span>
              <span className="tag">Team Standup</span>
            </div>

            <Link href="/coffee" className="button button-coffee">
              Enter Coffee Mode
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
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