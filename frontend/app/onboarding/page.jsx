'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './onboarding.css';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    major: '',
    personalInterests: [],
    professionalInterests: []
  });

  // Your FastAPI backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const personalOptions = [
    'Yoga Flow', 'Book Club', 'Meditation', 'Cooking', 'Hiking',
    'Photography', 'Gardening', 'Art & Crafts', 'Music', 'Travel',
    'Gaming', 'Fitness', 'Reading', 'Writing', 'Volunteering'
  ];

  const professionalOptions = [
    'Design Review', 'Project Alpha', 'Team Standup', 'Coding',
    'Data Analysis', 'Marketing', 'Product Management', 'UX Research',
    'Sales', 'Finance', 'Consulting', 'Teaching', 'Engineering'
  ];

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleInterest = (field, value) => {
    const current = formData[field];
    if (current.includes(value)) {
      updateField(field, current.filter(item => item !== value));
    } else {
      updateField(field, [...current, value]);
    }
  };

  // Generate matcha blurb from personal data
  const generateMatchaBlurb = () => {
    const interests = formData.personalInterests.slice(0, 3).join(', ');
    return `${formData.name} enjoys ${interests.toLowerCase()}. Looking to explore creative hobbies and unwind.`;
  };

  // Generate coffee blurb from professional data
  const generateCoffeeBlurb = () => {
    const { school, major, professionalInterests } = formData;
    const skills = professionalInterests.slice(0, 3).join(', ');
    return `${major} student at ${school}. Interested in ${skills.toLowerCase()}. Seeking mentorship and professional growth opportunities.`;
  };

  // Generate tags from all interests
  const generateTags = () => {
    const allInterests = [
      ...formData.personalInterests,
      ...formData.professionalInterests,
      formData.major,
      formData.school
    ];
    
    return [...new Set(allInterests.filter(tag => tag && tag.trim()))];
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');

    try {
      // Generate blurbs and tags
      const matchaBlurb = generateMatchaBlurb();
      const coffeeBlurb = generateCoffeeBlurb();
      const tags = generateTags();

      // Call your FastAPI backend
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          matcha_blurb: matchaBlurb,
          coffee_blurb: coffeeBlurb,
          tags: tags
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const userData = await response.json();

      // Save user ID and data to localStorage
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('onboardingComplete', 'true');

      // Redirect to main page
      router.push('/');
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to save your profile. Please try again.');
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch(step) {
      case 1: return formData.name.trim().length > 0;
      case 2: return formData.school.trim().length > 0 && formData.major.trim().length > 0;
      case 3: return formData.personalInterests.length > 0;
      case 4: return formData.professionalInterests.length > 0;
      default: return false;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
          <p className="progress-text">Step {step} of 4</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-icon">👋</div>
            <h2 className="step-title">Welcome to Common Grounds!</h2>
            <p className="step-description">Let's start with your name</p>
            
            <div className="form-group">
              <label>What should we call you?</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="text-input"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: School & Major */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-icon icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7a9d8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
                <path d="M22 10v6"/>
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
              </svg>
            </div>
            <h2 className="step-title">Tell us about your studies</h2>
            <p className="step-description">Where are you learning and growing?</p>
            
            <div className="form-group">
              <label>School / University</label>
              <input
                type="text"
                placeholder="e.g., University of Toronto"
                value={formData.school}
                onChange={(e) => updateField('school', e.target.value)}
                className="text-input"
              />
            </div>

            <div className="form-group">
              <label>Major / Field of Study</label>
              <input
                type="text"
                placeholder="e.g., Computer Science"
                value={formData.major}
                onChange={(e) => updateField('major', e.target.value)}
                className="text-input"
              />
            </div>
          </div>
        )}

        {/* Step 3: Personal Interests */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-icon">🍵</div>
            <h2 className="step-title">Personal Bloom</h2>
            <p className="step-description">What brings you peace and joy?</p>
            
            <div className="checklist-container">
              {personalOptions.map((interest) => (
                <label key={interest} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.personalInterests.includes(interest)}
                    onChange={() => toggleInterest('personalInterests', interest)}
                  />
                  <span className="checkbox-label">{interest}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Professional Interests */}
        {step === 4 && (
          <div className="step-content">
            <div className="step-icon">☕</div>
            <h2 className="step-title">Professional Pulse</h2>
            <p className="step-description">What drives your career forward?</p>
            
            <div className="checklist-container">
              {professionalOptions.map((interest) => (
                <label key={interest} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.professionalInterests.includes(interest)}
                    onChange={() => toggleInterest('professionalInterests', interest)}
                  />
                  <span className="checkbox-label">{interest}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="button-group">
          {step > 1 && (
            <button onClick={prevStep} className="btn btn-secondary" disabled={loading}>
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button 
              onClick={nextStep} 
              className="btn btn-primary"
              disabled={!canProceed()}
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleFinish} 
              className="btn btn-primary btn-finish"
              disabled={!canProceed() || loading}
            >
              {loading ? 'Saving...' : 'Get Started ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}