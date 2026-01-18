'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './analytics.css';

interface AnalyticsData {
  coffee: {
    total_swipes: number;
    likes: number;
    dislikes: number;
    like_rate: number;
    avg_time_spent: number;
    total_time_spent: number;
  };
  matcha: {
    total_swipes: number;
    likes: number;
    dislikes: number;
    like_rate: number;
    avg_time_spent: number;
    total_time_spent: number;
  };
  total_swipes: number;
  overall_like_rate: number;
  tags: string[];
  ai_insights: string;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // TODO: Replace with actual API call
      // ============================================
      // BACKEND IMPORT NOTE:
      // This should call: GET /dashboard or GET /users/{userId}/dashboard
      // Expected response format matches the Dashboard model:
      // {
      //   "coffee": {
      //     "total_swipes": number,
      //     "likes": number,
      //     "dislikes": number,
      //     "like_rate": number,
      //     "avg_time_spent": number,
      //     "total_time_spent": number
      //   },
      //   "matcha": {
      //     "total_swipes": number,
      //     "likes": number,
      //     "dislikes": number,
      //     "like_rate": number,
      //     "avg_time_spent": number,
      //     "total_time_spent": number
      //   },
      //   "total_swipes": number,
      //   "overall_like_rate": number,
      //   "tags": string[],
      //   "ai_insights": string
      // }
      // ============================================
      
      // const userId = localStorage.getItem('userId');
      // const response = await fetch(`${API_URL}/dashboard`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}` // if you use auth
      //   }
      // });
      // const analyticsData = await response.json();
      // setData(analyticsData);

      // Mock data for demonstration
      setTimeout(() => {
        const mockData: AnalyticsData = {
          coffee: {
            total_swipes: 28,
            likes: 24,
            dislikes: 4,
            like_rate: 85.7,
            avg_time_spent: 12.5,
            total_time_spent: 350
          },
          matcha: {
            total_swipes: 47,
            likes: 41,
            dislikes: 6,
            like_rate: 87.2,
            avg_time_spent: 15.3,
            total_time_spent: 719
          },
          total_swipes: 75,
          overall_like_rate: 86.7,
          tags: ['Yoga', 'Networking', 'Book Club', 'UX Research', 'Hiking'],
          ai_insights: "You're showing a strong preference for personal growth activities! Your matcha engagement is 68% higher than coffee events, suggesting you value work-life balance. Consider exploring more creative workshops to maintain this healthy rhythm. Your high like rate of 87% indicates you're great at finding events that truly resonate with your interests!"
        };
        setData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="loading-spinner">📊</div>
          <p className="loading-text">Brewing your insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="loading-spinner">❌</div>
          <p className="loading-text">Unable to load analytics</p>
        </div>
      </div>
    );
  }

  const totalSwipes = data.matcha.total_swipes + data.coffee.total_swipes;
  const maxHeight = 220;
  const matchaHeight = totalSwipes > 0 ? (data.matcha.total_swipes / Math.max(data.matcha.total_swipes, data.coffee.total_swipes)) * maxHeight : 0;
  const coffeeHeight = totalSwipes > 0 ? (data.coffee.total_swipes / Math.max(data.matcha.total_swipes, data.coffee.total_swipes)) * maxHeight : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
        <Link href="/" className="home-button">
          <span className="home-icon">🏠</span>
          Home
        </Link>
        <h1 className="header-title">Analytics</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="analytics-main">
        {/* Hero Section */}
        <section className="analytics-hero">
          <div className="hero-icon-container">📊</div>
          <h1 className="analytics-title">Your Journey</h1>
          <p className="analytics-subtitle">
            Insights into your Common Grounds experience
          </p>
          <p className="date-range">
            All time data • Last updated today
          </p>
        </section>

        {/* Overall Stats */}
        <section className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>📊</span>
              Overall Stats
            </h2>
            <p className="section-subtitle">Your complete Common Grounds journey</p>
          </div>

          <div className="stats-grid-small">
            <div className="stat-card overall">
              <span className="stat-icon">🎯</span>
              <div className="stat-label">Total Swipes</div>
              <div className="stat-value">{data.total_swipes}</div>
              <div className="stat-change positive">
                <span>↑</span>
                All interactions
              </div>
            </div>

            <div className="stat-card rate">
              <span className="stat-icon">💚</span>
              <div className="stat-label">Overall Like Rate</div>
              <div className="stat-value">{data.overall_like_rate.toFixed(1)}%</div>
              <div className="stat-change positive">
                <span>↑</span>
                Great taste!
              </div>
            </div>

            <div className="stat-card overall">
              <span className="stat-icon">🏷️</span>
              <div className="stat-label">Active Tags</div>
              <div className="stat-value">{data.tags.length}</div>
              <div className="stat-change neutral">
                <span>—</span>
                Interests tracked
              </div>
            </div>
          </div>
        </section>

        {/* Matcha Mode Stats */}
        <section className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>🍵</span>
              Matcha Mode
            </h2>
            <p className="section-subtitle">Your personal and creative activities</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card matcha">
              <span className="stat-icon">👆</span>
              <div className="stat-label">Total Swipes</div>
              <div className="stat-value">{data.matcha.total_swipes}</div>
              <div className="stat-change positive">
                <span>↑</span>
                Personal moments
              </div>
            </div>

            <div className="stat-card matcha">
              <span className="stat-icon">💚</span>
              <div className="stat-label">Likes</div>
              <div className="stat-value">{data.matcha.likes}</div>
              <div className="stat-change positive">
                <span>↑</span>
                Right swipes
              </div>
            </div>

            <div className="stat-card rejection">
              <span className="stat-icon">👎</span>
              <div className="stat-label">Dislikes</div>
              <div className="stat-value">{data.matcha.dislikes}</div>
              <div className="stat-change neutral">
                <span>—</span>
                Left swipes
              </div>
            </div>

            <div className="stat-card rate">
              <span className="stat-icon">📈</span>
              <div className="stat-label">Like Rate</div>
              <div className="stat-value">{data.matcha.like_rate.toFixed(1)}%</div>
              <div className="stat-change positive">
                <span>↑</span>
                Approval rate
              </div>
            </div>

            <div className="stat-card time">
              <span className="stat-icon">⏱️</span>
              <div className="stat-label">Avg Time/Swipe</div>
              <div className="stat-value">{data.matcha.avg_time_spent.toFixed(1)}s</div>
              <div className="stat-change neutral">
                <span>—</span>
                Per interaction
              </div>
            </div>

            <div className="stat-card time">
              <span className="stat-icon">🕐</span>
              <div className="stat-label">Total Time</div>
              <div className="stat-value">{formatTime(data.matcha.total_time_spent)}</div>
              <div className="stat-change neutral">
                <span>—</span>
                Time invested
              </div>
            </div>
          </div>
        </section>

        {/* Coffee Mode Stats */}
        <section className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>☕</span>
              Coffee Mode
            </h2>
            <p className="section-subtitle">Your professional development journey</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card coffee">
              <span className="stat-icon">👆</span>
              <div className="stat-label">Total Swipes</div>
              <div className="stat-value">{data.coffee.total_swipes}</div>
              <div className="stat-change positive">
                <span>↑</span>
                Professional growth
              </div>
            </div>

            <div className="stat-card coffee">
              <span className="stat-icon">💚</span>
              <div className="stat-label">Likes</div>
              <div className="stat-value">{data.coffee.likes}</div>
              <div className="stat-change positive">
                <span>↑</span>
                Right swipes
              </div>
            </div>

            <div className="stat-card rejection">
              <span className="stat-icon">👎</span>
              <div className="stat-label">Dislikes</div>
              <div className="stat-value">{data.coffee.dislikes}</div>
              <div className="stat-change neutral">
                <span>—</span>
                Left swipes
              </div>
            </div>

            <div className="stat-card rate">
              <span className="stat-icon">📈</span>
              <div className="stat-label">Like Rate</div>
              <div className="stat-value">{data.coffee.like_rate.toFixed(1)}%</div>
              <div className="stat-change positive">
                <span>↑</span>
                Approval rate
              </div>
            </div>

            <div className="stat-card time">
              <span className="stat-icon">⏱️</span>
              <div className="stat-label">Avg Time/Swipe</div>
              <div className="stat-value">{data.coffee.avg_time_spent.toFixed(1)}s</div>
              <div className="stat-change neutral">
                <span>—</span>
                Per interaction
              </div>
            </div>

            <div className="stat-card time">
              <span className="stat-icon">🕐</span>
              <div className="stat-label">Total Time</div>
              <div className="stat-value">{formatTime(data.coffee.total_time_spent)}</div>
              <div className="stat-change neutral">
                <span>—</span>
                Time invested
              </div>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Matcha vs Coffee Preferences</h2>
            <p className="chart-subtitle">
              Your balance between personal and professional activities
            </p>
          </div>

          <div className="chart-container">
            {/* Matcha Bar */}
            <div className="chart-bar-group">
              <div 
                className="chart-bar matcha" 
                style={{ height: `${matchaHeight}px` }}
              >
                <span className="chart-value">{data.matcha.total_swipes}</span>
              </div>
              <div className="chart-label">
                <span className="chart-icon">🍵</span>
                Matcha
              </div>
            </div>

            {/* Coffee Bar */}
            <div className="chart-bar-group">
              <div 
                className="chart-bar coffee" 
                style={{ height: `${coffeeHeight}px` }}
              >
                <span className="chart-value">{data.coffee.total_swipes}</span>
              </div>
              <div className="chart-label">
                <span className="chart-icon">☕</span>
                Coffee
              </div>
            </div>
          </div>
        </section>

        {/* AI Insight Section */}
        <section className="insight-section">
          <div className="insight-header">
            <div className="insight-icon">🤖</div>
            <div className="insight-title-wrapper">
              <h2>Personalized AI Insight</h2>
              <p>Based on your activity patterns</p>
            </div>
          </div>

          <div className="insight-content">
            {data.ai_insights.split('. ').map((sentence, index) => {
              // Highlight percentages and numbers
              const highlighted = sentence.replace(
                /(\d+%|\d+)/g, 
                '<span class="insight-highlight">$1</span>'
              );
              return (
                <span key={index}>
                  <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                  {index < data.ai_insights.split('. ').length - 1 ? '. ' : ''}
                </span>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}