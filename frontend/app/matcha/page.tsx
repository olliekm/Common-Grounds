'use client';

import { useState } from 'react';
import FloatingAvatar from '@/components/FloatingAvatar';
import Link from 'next/link';
import './matcha.css';

export default function MatchaMode() {
  const [searchQuery, setSearchQuery] = useState('');

  const activities = [
    {
      id: 1,
      category: 'HANDMADE',
      title: 'Ceramic Studio',
      description: 'Create something beautiful with your own two hands.',
      image: '/images/pottery.jpg',
      color: '#e8d5c4'
    },
    {
      id: 2,
      category: 'SOCIAL',
      title: 'Garden Reading',
      description: 'Quiet afternoons shared with tea and book lovers.',
      image: '/images/reading.jpg',
      color: '#d4e5d8'
    },
    {
      id: 3,
      category: 'NATURE',
      title: 'Botanical Hill',
      description: 'Explore local trails and wildflowers.',
      image: '/images/hiking.jpg',
      color: '#c8dfe0'
    }
  ];

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
          <div className="avatar"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="matcha-main">
        {/* Hero Section */}
        <section className="hero-section">
          {/* 3D Avatar */}
          <FloatingAvatar mode="matcha" />

          <h1 className="hero-title">
            Time to <span className="hero-accent">unwind.</span>
          </h1>
          <p className="hero-subtitle">
            Step away from work and discover your creative side.
          </p>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search-icon lucide-search">
              <path d="m21 21-4.34-4.34"/>
              <circle cx="11" cy="11" r="8"/>
              </svg>
              <input
                type="text"
                placeholder="Find a hobby or relaxing activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-button">Explore</button>
            </div>
          </div>
        </section>

        {/* Activities Grid */}
        <section className="activities-section">
          <div className="activities-grid">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div 
                  className="activity-image"
                  style={{ backgroundColor: activity.color }}
                >
                  {/* Placeholder for actual images */}
                  <div className="image-placeholder">
                    {activity.title === 'Ceramic Studio' && '🏺'}
                    {activity.title === 'Garden Reading' && '📚'}
                    {activity.title === 'Botanical Hill' && '🌲'}
                  </div>
                </div>
                <div className="activity-content">
                  <span className="activity-category">{activity.category}</span>
                  <h3 className="activity-title">{activity.title}</h3>
                  <p className="activity-description">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendation Section */}
        <section className="recommendation-section">
          <div className="recommendation-card">
            <div className="recommendation-image">
              <div className="image-placeholder-large">✏️</div>
            </div>
            <div className="recommendation-content">
              <span className="recommendation-tag">RECOMMENDED FOR YOU</span>
              <h2 className="recommendation-title">Sun-Drenched Sketching</h2>
              <p className="recommendation-description">
                Join a community of amateur artists this Sunday for a peaceful morning 
                of sketching in the park. No skills required!
              </p>
              <div className="recommendation-buttons">
                <button className="btn-primary">Sign me up</button>
                <button className="btn-secondary">View details</button>
              </div>
            </div>
          </div>
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