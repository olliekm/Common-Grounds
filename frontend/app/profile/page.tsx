'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './profile.css';

interface UserData {
  id: number;
  name: string;
  matcha_blurb: string;
  coffee_blurb: string;
  tags: string[];
  created_at: string;
  embeddings?: any;
  seen?: number[];
}

interface AnalyticsData {
  matcha: {
    total_swipes: number;
  };
  coffee: {
    total_swipes: number;
  };
}

interface Event {
  id: number;
  title: string;
  description: string;
  tags: string[];
  matcha_mode: boolean;
  created_at: string;
  creator_id: number;
  image_link?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    loadUserData();
    loadAnalytics();
    loadCreatedEvents();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No user ID found');
        router.push('/onboarding');
        return;
      }

      const response = await fetch(`${API_URL}/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log('User data:', data);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If user not found, redirect to onboarding
      router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_URL}/users/${userId}/analytics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      console.log('Analytics data:', data);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default values if analytics fetch fails
      setAnalyticsData({
        matcha: { total_swipes: 0 },
        coffee: { total_swipes: 0 }
      });
    }
  };

  const loadCreatedEvents = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_URL}/users/${userId}/created-events`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch created events');
      }

      const data = await response.json();
      console.log('Created events:', data);
      setCreatedEvents(data);
    } catch (error) {
      console.error('Error fetching created events:', error);
      setCreatedEvents([]);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">☕</div>
      </div>
    );
  }

  // Split tags into personal and professional (first half vs second half)
  const allTags = userData?.tags || [];
  const midPoint = Math.ceil(allTags.length / 2);
  const personalTags = allTags.slice(0, midPoint);
  const professionalTags = allTags.slice(midPoint);

  // Calculate saved items (from seen array)
  const savedItemsCount = userData?.seen?.length || 0;

  // Calculate streak (placeholder - would need actual logic based on created_at and activity)
  const calculateDayStreak = () => {
    if (!userData?.created_at) return 0;
    const createdDate = new Date(userData.created_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 30); // Cap at 30 days for now
  };

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
          <span className="logo-text">CommonGrounds</span>
        </Link>

        <div className="header-right">
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
            <span>Member since {new Date(userData?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="profile-actions">
            <Link href="/my_events" style={{ textDecoration: 'none' }}>
              <button className="btn-edit" onClick={() => setEditing(!editing)}>
                View Liked Events
              </button>
            </Link>
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
              <div className="stat-value">{analyticsData?.matcha?.total_swipes || 0}</div>
              <div className="stat-label">Matcha Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">☕</div>
              <div className="stat-value">{analyticsData?.coffee?.total_swipes || 0}</div>
              <div className="stat-label">Coffee Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{savedItemsCount}</div>
              <div className="stat-label">Viewed Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{calculateDayStreak()}</div>
              <div className="stat-label">Days Active</div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/analytics" style={{ textDecoration: 'none' }}>
              <button className="section-button" style={{ 
                background: 'linear-gradient(135deg, #6f4e37, #a67c52)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}>
                View Detailed Analytics
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Your Created Events Section */}
        <div className="created-events-section">
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            marginTop: '40px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #88B68C 0%, #6d5647 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Your Created Events
          </h2>

          {createdEvents && createdEvents.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {createdEvents.map((event) => (
                <div key={event.id} style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid #f0f0f0'
                }} className="event-card-hover">
                  {/* Event Image */}
                  <div style={{
                    width: '100%',
                    height: '180px',
                    background: event.image_link ? 'transparent' : (event.matcha_mode ? '#88B68C' : '#B9967C'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '60px',
                    overflow: 'hidden'
                  }}>
                    {event.image_link ? (
                      <img 
                        src={event.image_link} 
                        alt={event.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span>{event.matcha_mode ? '🍵' : '☕'}</span>
                    )}
                  </div>

                  {/* Event Content */}
                  <div style={{ padding: '16px' }}>
                    {/* Mode Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: event.matcha_mode ? '#E8F5E9' : '#FFF3E0',
                      marginBottom: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: event.matcha_mode ? '#2E7D32' : '#E65100'
                    }}>
                      <span>{event.matcha_mode ? '🍵' : '☕'}</span>
                      {event.matcha_mode ? 'Matcha' : 'Coffee'}
                    </div>

                    {/* Event Title */}
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      margin: '0 0 8px 0',
                      color: '#333'
                    }}>
                      {event.title}
                    </h3>

                    {/* Event Description */}
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {event.description}
                    </p>

                    {/* Tags */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '12px'
                    }}>
                      {event.tags && event.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          background: event.matcha_mode ? '#C8E6C9' : '#FFE0B2',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: event.matcha_mode ? '#1B5E20' : '#BF360C',
                          fontWeight: '500'
                        }}>
                          {tag}
                        </span>
                      ))}
                      {event.tags && event.tags.length > 2 && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          background: '#F5F5F5',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#999',
                          fontWeight: '500'
                        }}>
                          +{event.tags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Creation Date */}
                    <p style={{
                      fontSize: '12px',
                      color: '#999',
                      margin: '0',
                      marginTop: '8px'
                    }}>
                      Created {new Date(event.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: 'linear-gradient(135deg, rgba(136, 182, 140, 0.1) 0%, rgba(107, 86, 71, 0.1) 100%)',
              borderRadius: '16px',
              marginBottom: '40px'
            }}>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '24px'
              }}>
                You haven't created any events yet. Start brewing your first event!
              </p>
              <Link href="/brew_event" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #88B68C, #6d5647)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}>
                  🌱 Brew an Event
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}