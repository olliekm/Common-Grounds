'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './analytics.css';

interface AnalyticsData {
  person: {
    id: number;
    name: string;
    matcha_blurb: string;
    coffee_blurb: string;
  };
  coffee: {
    total_swipes: number;
    likes: number;
    dislikes: number;
    like_rate: number;
    avg_time_spent: number;
    total_time_spent: number;
    hesitation_score: number;
  };
  matcha: {
    total_swipes: number;
    likes: number;
    dislikes: number;
    like_rate: number;
    avg_time_spent: number;
    total_time_spent: number;
    hesitation_score: number;
  };
  total_swipes: number;
  overall_like_rate: number;
  tags: {
    [key: string]: number;
  };
  ai_insights: string[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'all' | 'matcha' | 'coffee'>('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No user ID found');
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
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const getCurrentModeData = () => {
    if (!analyticsData) return null;
    
    if (selectedMode === 'matcha') return analyticsData.matcha;
    if (selectedMode === 'coffee') return analyticsData.coffee;
    
    // For 'all', combine the data
    return {
      total_swipes: analyticsData.total_swipes,
      likes: analyticsData.matcha.likes + analyticsData.coffee.likes,
      dislikes: analyticsData.matcha.dislikes + analyticsData.coffee.dislikes,
      like_rate: analyticsData.overall_like_rate,
      avg_time_spent: (analyticsData.matcha.avg_time_spent + analyticsData.coffee.avg_time_spent) / 2,
      total_time_spent: analyticsData.matcha.total_time_spent + analyticsData.coffee.total_time_spent,
      hesitation_score: (analyticsData.matcha.hesitation_score + analyticsData.coffee.hesitation_score) / 2,
    };
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
        <div style={{ fontSize: '48px' }}>📊</div>
      </div>
    );
  }

  const modeData = getCurrentModeData();

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
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
      <main className="analytics-main">
        {/* Page Title */}
        <div className="page-header">
          <h1 className="page-title">Your Analytics</h1>
          <p className="page-subtitle">
            {analyticsData?.person.name}'s activity insights
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mode-selector">
          <button 
            className={`mode-btn ${selectedMode === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedMode('all')}
          >
            <span className="mode-icon">📊</span>
            All Modes
          </button>
          <button 
            className={`mode-btn mode-matcha ${selectedMode === 'matcha' ? 'active' : ''}`}
            onClick={() => setSelectedMode('matcha')}
          >
            <span className="mode-icon">🍵</span>
            Matcha
          </button>
          <button 
            className={`mode-btn mode-coffee ${selectedMode === 'coffee' ? 'active' : ''}`}
            onClick={() => setSelectedMode('coffee')}
          >
            <span className="mode-icon">☕</span>
            Coffee
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Total Interactions */}
          <div className="stat-card">
            <div className="stat-icon">🔢</div>
            <div className="stat-content">
              <h3 className="stat-label">Total Interactions</h3>
              <p className="stat-value">{modeData?.total_swipes || 0}</p>
              <p className="stat-description">
                {selectedMode === 'all' 
                  ? `${analyticsData?.matcha.total_swipes || 0} matcha · ${analyticsData?.coffee.total_swipes || 0} coffee`
                  : 'Total swipes made'}
              </p>
            </div>
          </div>

          {/* Avg Time per Interaction */}
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3 className="stat-label">Avg Time per Interaction</h3>
              <p className="stat-value">{formatTime(modeData?.avg_time_spent || 0)}</p>
              <p className="stat-description">Time spent per card</p>
            </div>
          </div>

          {/* Total Time */}
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3 className="stat-label">Total Time</h3>
              <p className="stat-value">{formatTime(modeData?.total_time_spent || 0)}</p>
              <p className="stat-description">Time spent exploring</p>
            </div>
          </div>

          {/* Swipe Right */}
          <div className="stat-card stat-positive">
            <div className="stat-icon">👍</div>
            <div className="stat-content">
              <h3 className="stat-label">Swipe Right</h3>
              <p className="stat-value">{modeData?.likes || 0}</p>
              <p className="stat-description">Opportunities you liked</p>
            </div>
          </div>

          {/* Swipe Left */}
          <div className="stat-card stat-negative">
            <div className="stat-icon">👎</div>
            <div className="stat-content">
              <h3 className="stat-label">Swipe Left</h3>
              <p className="stat-value">{modeData?.dislikes || 0}</p>
              <p className="stat-description">Opportunities you passed</p>
            </div>
          </div>

          {/* Like Rate */}
          <div className="stat-card stat-accent">
            <div className="stat-icon">💚</div>
            <div className="stat-content">
              <h3 className="stat-label">Like Rate</h3>
              <p className="stat-value">{Math.round((modeData?.like_rate || 0) * 100)}%</p>
              <p className="stat-description">
                {(modeData?.like_rate || 0) > 0.7 
                  ? 'You love exploring!' 
                  : (modeData?.like_rate || 0) > 0.4 
                    ? 'Balanced preferences' 
                    : 'Selective explorer'}
              </p>
            </div>
          </div>

          {/* Hesitation Score */}
          <div className="stat-card">
            <div className="stat-icon">🤔</div>
            <div className="stat-content">
              <h3 className="stat-label">Hesitation Score</h3>
              <p className="stat-value">{Math.round((modeData?.hesitation_score || 0) * 100)}</p>
              <p className="stat-description">
                {(modeData?.hesitation_score || 0) > 0.7 
                  ? 'You take your time' 
                  : (modeData?.hesitation_score || 0) > 0.4 
                    ? 'Thoughtful decisions' 
                    : 'Quick decision maker'}
              </p>
            </div>
          </div>

          {/* Session Frequency - Placeholder */}
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3 className="stat-label">Session Frequency</h3>
              <p className="stat-value">Daily</p>
              <p className="stat-description">Active user</p>
            </div>
          </div>
        </div>

        {/* Mode Breakdown */}
        {selectedMode === 'all' && analyticsData && (
          <div className="mode-breakdown">
            <h2 className="section-title">Mode Breakdown</h2>
            <div className="breakdown-grid">
              <div className="breakdown-card breakdown-matcha">
                <div className="breakdown-header">
                  <span className="breakdown-icon">🍵</span>
                  <h3>Matcha Mode</h3>
                </div>
                <div className="breakdown-stats">
                  <div className="breakdown-stat">
                    <span className="breakdown-label">Interactions</span>
                    <span className="breakdown-value">{analyticsData.matcha.total_swipes}</span>
                  </div>
                  <div className="breakdown-stat">
                    <span className="breakdown-label">Like Rate</span>
                    <span className="breakdown-value">{Math.round(analyticsData.matcha.like_rate * 100)}%</span>
                  </div>
                  <div className="breakdown-stat">
                    <span className="breakdown-label">Avg Time</span>
                    <span className="breakdown-value">{formatTime(analyticsData.matcha.avg_time_spent)}</span>
                  </div>
                </div>
              </div>

              <div className="breakdown-card breakdown-coffee">
                <div className="breakdown-header">
                  <span className="breakdown-icon">☕</span>
                  <h3>Coffee Mode</h3>
                </div>
                <div className="breakdown-stats">
                  <div className="breakdown-stat">
                    <span className="breakdown-label">Interactions</span>
                    <span className="breakdown-value">{analyticsData.coffee.total_swipes}</span>
                  </div>
                  <div className="breakdown-stat">
                    <span className="breakdown-label">Like Rate</span>
                    <span className="breakdown-value">{Math.round(analyticsData.coffee.like_rate * 100)}%</span>
                  </div>
                  <div className="breakdown-stat">
                    <span className="breakdown-label">Avg Time</span>
                    <span className="breakdown-value">{formatTime(analyticsData.coffee.avg_time_spent)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Tags */}
        {analyticsData?.tags && Object.keys(analyticsData.tags).length > 0 && (
          <div className="tags-section">
            <h2 className="section-title">Your Top Interests</h2>
            <div className="tags-cloud">
              {Object.entries(analyticsData.tags)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([tag, count]) => (
                  <div key={tag} className="tag-item">
                    <span className="tag-name">{tag}</span>
                    <span className="tag-count">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {analyticsData?.ai_insights && analyticsData.ai_insights.length > 0 && (
          <div className="insights-section">
            <h2 className="section-title">AI Insights</h2>
            <div className="insights-grid">
              {analyticsData.ai_insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-icon">✨</div>
                  <p className="insight-text">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!modeData || modeData.total_swipes === 0) && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">No data yet</h3>
            <p className="empty-description">
              Start exploring opportunities to see your analytics!
            </p>
            <Link href="/matcha" className="empty-button">
              Explore Matcha Mode
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}