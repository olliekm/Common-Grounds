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
    professionalInterests: [],
    matchaBlurb: '',
    coffeeBlurb: ''
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

  const totalSteps = 6;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
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
      const tags = generateTags();

      // Call your FastAPI backend
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          matcha_blurb: formData.matchaBlurb,
          coffee_blurb: formData.coffeeBlurb,
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
      case 5: return formData.matchaBlurb.trim().length > 0;
      case 6: return formData.coffeeBlurb.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
          </div>
          <p className="progress-text">Step {step} of {totalSteps}</p>
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

        {/* Step 5: Matcha Blurb */}
        {step === 5 && (
          <div className="step-content">
            <div className="step-icon">🍵</div>
            <h2 className="step-title">Your Matcha Vibe</h2>
            <p className="step-description">Tell us about your personal side - hobbies, passions, what helps you unwind</p>

            <div className="form-group">
              <label>Write a short blurb about yourself for personal/hobby events</label>
              <textarea
                placeholder="e.g., I love weekend hikes, trying new coffee shops, and getting lost in a good book. Looking to meet people who enjoy creative activities and outdoor adventures."
                value={formData.matchaBlurb}
                onChange={(e) => updateField('matchaBlurb', e.target.value)}
                className="text-input textarea-input"
                rows={4}
              />
              <p className="input-hint">This helps us match you with personal and hobby events</p>
            </div>
          </div>
        )}

        {/* Step 6: Coffee Blurb */}
        {step === 6 && (
          <div className="step-content">
            <div className="step-icon">☕</div>
            <h2 className="step-title">Your Coffee Pitch</h2>
            <p className="step-description">Share your professional goals and what you're looking to achieve</p>

            <div className="form-group">
              <label>Write a short blurb about your professional interests</label>
              <textarea
                placeholder="e.g., CS student passionate about AI/ML and product development. Looking to connect with mentors in tech and find internship opportunities in startups."
                value={formData.coffeeBlurb}
                onChange={(e) => updateField('coffeeBlurb', e.target.value)}
                className="text-input textarea-input"
                rows={4}
              />
              <p className="input-hint">This helps us match you with professional and career events</p>
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

          {step < totalSteps ? (
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