'use client';

import { useState } from 'react';
import Link from 'next/link';
import './coffee.css';

export default function CoffeePage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Design', 'Development', 'Marketing', 'Content', 'Business'];

  const opportunities = [
    {
      id: 1,
      title: 'UX Designer for Mobile App',
      company: 'TechStart Inc.',
      type: 'Remote',
      duration: '3 months',
      budget: '$5,000 - $8,000',
      tags: ['UI/UX', 'Figma', 'Mobile'],
      posted: '2 days ago',
      applicants: 12
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'Digital Solutions',
      type: 'Hybrid',
      duration: '6 months',
      budget: '$10,000 - $15,000',
      tags: ['React', 'Node.js', 'MongoDB'],
      posted: '1 day ago',
      applicants: 8
    },
    {
      id: 3,
      title: 'Content Writer - Tech Blog',
      company: 'Innovation Media',
      type: 'Remote',
      duration: '2 months',
      budget: '$3,000 - $5,000',
      tags: ['Writing', 'SEO', 'Tech'],
      posted: '3 days ago',
      applicants: 15
    },
    {
      id: 4,
      title: 'Brand Identity Designer',
      company: 'Creative Studio',
      type: 'On-site',
      duration: '4 months',
      budget: '$6,000 - $9,000',
      tags: ['Branding', 'Illustrator', 'Logo'],
      posted: '5 days ago',
      applicants: 20
    }
  ];

  const networkingHubs = [
    { name: 'Design Collective', members: '2.3k', active: true },
    { name: 'Tech Innovators', members: '1.8k', active: false },
    { name: 'Marketing Pros', members: '3.1k', active: true },
    { name: 'Startup Founders', members: '1.5k', active: false }
  ];

  return (
    <div className="coffee-page">
    {/* Header */}
    <header className="header">
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
    </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Find Your Next Opportunity</h1>
          <p className="hero-subtitle">Connect with professionals and discover exciting projects</p>
          
          <div className="search-bar">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search for projects, skills, or companies..."
              className="search-input"
            />
            <button className="search-button">Search</button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        <div className="main-layout">
          {/* Left Column */}
          <aside className="sidebar-left">
            <div className="card">
              <h3 className="card-title">Profile Insights</h3>
              <div className="insight-item">
                <div className="insight-label">Profile Views</div>
                <div className="insight-value">247</div>
                <div className="insight-change positive">+12% this week</div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Connections</div>
                <div className="insight-value">156</div>
                <div className="insight-change positive">+8 new</div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Opportunities</div>
                <div className="insight-value">23</div>
                <div className="insight-change">Active matches</div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Networking Hubs</h3>
              {networkingHubs.map((hub, index) => (
                <div key={index} className="hub-item">
                  <div className="hub-info">
                    <div className="hub-name">{hub.name}</div>
                    <div className="hub-members">{hub.members} members</div>
                  </div>
                  {hub.active && <span className="hub-badge">Active</span>}
                </div>
              ))}
            </div>
          </aside>

          {/* Center Column */}
          <main className="main-content">
            {/* Filters */}
            <div className="filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                  onClick={() => setActiveFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Opportunities Grid */}
            <div className="opportunities-grid">
              {opportunities.map((opp) => (
                <div key={opp.id} className="opportunity-card">
                  <div className="card-header">
                    <h3 className="opportunity-title">{opp.title}</h3>
                    <button className="bookmark-btn">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M14 2H4c-.6 0-1 .4-1 1v13l6-3 6 3V3c0-.6-.4-1-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="opportunity-company">{opp.company}</div>
                  
                  <div className="opportunity-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10z" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      {opp.duration}
                    </span>
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      {opp.type}
                    </span>
                  </div>

                  <div className="opportunity-budget">{opp.budget}</div>

                  <div className="opportunity-tags">
                    {opp.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="opportunity-footer">
                    <span className="posted-time">{opp.posted}</span>
                    <span className="applicants">{opp.applicants} applicants</span>
                  </div>

                  <button className="btn-apply">Apply Now</button>
                </div>
              ))}
            </div>
          </main>

          {/* Right Column */}
          <aside className="sidebar-right">
            <div className="card">
              <h3 className="card-title">Recommended for You</h3>
              <div className="recommended-item">
                <div className="recommended-avatar">MS</div>
                <div className="recommended-info">
                  <div className="recommended-name">Maria Santos</div>
                  <div className="recommended-role">Senior UX Designer</div>
                </div>
                <button className="btn-connect">Connect</button>
              </div>
              <div className="recommended-item">
                <div className="recommended-avatar">TK</div>
                <div className="recommended-info">
                  <div className="recommended-name">Tom Kim</div>
                  <div className="recommended-role">Full Stack Developer</div>
                </div>
                <button className="btn-connect">Connect</button>
              </div>
              <div className="recommended-item">
                <div className="recommended-avatar">AL</div>
                <div className="recommended-info">
                  <div className="recommended-name">Anna Lee</div>
                  <div className="recommended-role">Marketing Strategist</div>
                </div>
                <button className="btn-connect">Connect</button>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Trending Skills</h3>
              <div className="trending-skills">
                <span className="skill-tag">React.js</span>
                <span className="skill-tag">UI/UX Design</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">SEO</span>
                <span className="skill-tag">Figma</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">Content Writing</span>
                <span className="skill-tag">Branding</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}