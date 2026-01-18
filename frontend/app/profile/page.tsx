'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './profile.css';

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Mock data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Mock data
    const mockUser = {
      id: 1,
      name: localStorage.getItem('userName') || 'Jane Doe',
      school: 'University of Toronto',
      major: 'Computer Science',
      matcha_blurb: 'Jane enjoys yoga, reading, and photography. Looking to explore creative hobbies and unwind.',
      coffee_blurb: 'Computer Science student at University of Toronto. Interested in machine learning, UX research, and data analysis. Seeking mentorship and professional growth opportunities.',
      tags: ['Yoga', 'Reading', 'Photography', 'Machine Learning', 'UX Research', 'Data Analysis', 'Computer Science', 'University of Toronto'],
      created_at: '2024-01-15T10:30:00Z'
    };

    setUserData(mockUser);
    setLoading(false);

    // TODO: replace with real API call
    // const userId = localStorage.getItem('userId');
    // const response = await fetch(`${API_URL}/users/${userId}`);
    // const data = await response.json();
    // setUserData(data);
    // setLoading(false);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">☕</div>
      </div>
    );
  }

  const personalTags = userData?.tags?.slice(0, 4) || [];
  const professionalTags = userData?.tags?.slice(4, 8) || [];

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
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

        <div className="header-right">
          <button className="icon-button">
            <span>🔔</span>
          </button>
          <div className="user-avatar-header">
            <span>{userData?.name?.charAt(0) || 'U'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        {/* Profile Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-large">
            <span className="avatar-initial">{userData?.name?.charAt(0) || 'U'}</span>
          </div>
          
          <h1 className="profile-name">{userData?.name}</h1>
          
          <div className="profile-school">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a9d8f" strokeWidth="2">
              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
              <path d="M22 10v6"/>
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
            </svg>
            <span>{userData?.major} @ {userData?.school}</span>
          </div>

          <div className="profile-actions">
            <button className="btn-edit" onClick={() => setEditing(!editing)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="profile-grid">
          {/* Matcha Section */}
          <div className="profile-section matcha-section">
            <div className="section-header">
              <div className="section-icon matcha-icon">
                <span>🍵</span>
              </div>
              <div className="section-title-wrapper">
                <h2 className="section-title">Personal Bloom</h2>
                <p className="section-subtitle">Matcha Mode</p>
              </div>
            </div>

            <div className="section-content">
              <div className="blurb-container">
                <p className="blurb-text">{userData?.matcha_blurb}</p>
              </div>

              <div className="tags-container">
                <h3 className="tags-title">Personal Interests</h3>
                <div className="tags-list">
                  {personalTags.map((tag, index) => (
                    <span key={index} className="tag tag-matcha">{tag}</span>
                  ))}
                </div>
              </div>

              <Link href="/matcha" style={{ textDecoration: 'none' }}>
                <button className="section-button matcha-button">
                  Explore Matcha Mode
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          {/* Coffee Section */}
          <div className="profile-section coffee-section">
            <div className="section-header">
              <div className="section-icon coffee-icon">
                <span>☕</span>
              </div>
              <div className="section-title-wrapper">
                <h2 className="section-title">Professional Pulse</h2>
                <p className="section-subtitle">Coffee Mode</p>
              </div>
            </div>

            <div className="section-content">
              <div className="blurb-container">
                <p className="blurb-text">{userData?.coffee_blurb}</p>
              </div>

              <div className="tags-container">
                <h3 className="tags-title">Professional Skills</h3>
                <div className="tags-list">
                  {professionalTags.map((tag, index) => (
                    <span key={index} className="tag tag-coffee">{tag}</span>
                  ))}
                </div>
              </div>

              <Link href="/coffee" style={{ textDecoration: 'none' }}>
                <button className="section-button coffee-button">
                  Explore Coffee Mode
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2 className="stats-title">Your Activity</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🍵</div>
              <div className="stat-value">12</div>
              <div className="stat-label">Matcha Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">☕</div>
              <div className="stat-value">8</div>
              <div className="stat-label">Coffee Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">5</div>
              <div className="stat-label">Saved Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">7</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}