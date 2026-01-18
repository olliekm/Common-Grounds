'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './brew_event.css';

type Mode = 'matcha' | 'coffee';

interface FormData {
  title: string;
  description: string;
  tags: string[];
}

export default function BrewEvent() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<Mode>('matcha');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    tags: []
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const matchaTags = [
    'Yoga', 'Meditation', 'Book Club', 'Cooking', 'Hiking',
    'Photography', 'Gardening', 'Art & Crafts', 'Music', 'Dance',
    'Gaming', 'Fitness', 'Reading', 'Writing', 'Volunteering',
    'Painting', 'Ceramics', 'Knitting', 'Board Games', 'Nature Walks'
  ];

  const coffeeTags = [
    'Networking', 'Workshop', 'Career Development', 'Coding',
    'Data Analysis', 'Marketing', 'Product Management', 'UX Research',
    'Design Review', 'Consulting', 'Teaching', 'Engineering',
    'Public Speaking', 'Leadership', 'Entrepreneurship', 'Sales',
    'Finance', 'Project Management', 'Mentorship', 'Panel Discussion'
  ];

  const currentTags = mode === 'matcha' ? matchaTags : coffeeTags;

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleTag = (tag: string) => {
    const current = formData.tags;
    if (current.includes(tag)) {
      setFormData({ ...formData, tags: current.filter(item => item !== tag) });
    } else {
      setFormData({ ...formData, tags: [...current, tag] });
    }
  };

  const toggleMode = () => {
    setMode(mode === 'matcha' ? 'coffee' : 'matcha');
    // Reset tags when switching modes
    setFormData({ ...formData, tags: [] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setImageFile(null);
  };

  const canProceed = () => {
    switch(step) {
      case 1: return true; // Mode selection always allows proceeding
      case 2: return formData.title.trim().length > 0;
      case 3: return imageFile !== null;
      case 4: return formData.description.trim().length > 0 && formData.tags.length > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare JSON data in the required format
      const submitData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        matcha_mode: mode === 'matcha'
      };

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      router.push('/');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create your event. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={`brew-event-container mode-${mode}`}>
      <div className="brew-event-card">
        {/* Header */}
        <div className="brew-header">
          <div className="brew-icon-container">
            {mode === 'matcha' ? '🍵' : '☕'}
          </div>
          <h1 className="brew-main-title">Brew an Event</h1>
          <p className="brew-main-subtitle">Share an experience with your community</p>
        </div>

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

        {/* Step 1: Mode Selection */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-icon">{mode === 'matcha' ? '🍵' : '☕'}</div>
            <h2 className="step-title">What type of event?</h2>
            <p className="step-description">Choose the vibe for your gathering</p>
            
            <div className="mode-toggle-container">
              <label className="mode-toggle-label">Select Event Mode</label>
              
              <div className="mode-switch-wrapper">
                <span className={`mode-label mode-label-matcha ${mode === 'matcha' ? 'active' : ''}`}>
                  🍵 Matcha
                </span>
                <div className="toggle-switch" onClick={toggleMode}>
                  <div className="toggle-slider"></div>
                </div>
                <span className={`mode-label mode-label-coffee ${mode === 'coffee' ? 'active' : ''}`}>
                  ☕ Coffee
                </span>
              </div>

              <div className="mode-explanation">
                {mode === 'matcha' ? (
                  <p>
                    <strong>Matcha Mode</strong> is for fun, relaxing, and creative activities. 
                    Think hobby meetups, social gatherings, and personal growth experiences.
                  </p>
                ) : (
                  <p>
                    <strong>Coffee Mode</strong> is for professional development and networking. 
                    Perfect for workshops, career events, and skill-building sessions.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Title */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-icon">✨</div>
            <h2 className="step-title">Name your event</h2>
            <p className="step-description">Make it catchy and inviting!</p>
            
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                placeholder={mode === 'matcha' ? 'e.g., Sunday Morning Pottery Class' : 'e.g., Tech Career Growth Workshop'}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="text-input"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 3: Image Upload */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-icon">📸</div>
            <h2 className="step-title">Add a visual</h2>
            <p className="step-description">A picture is worth a thousand words</p>
            
            <div className="form-group">
              <label>Event Image</label>
              <div className="file-upload-container">
                <label htmlFor="image-upload" className="file-upload-wrapper">
                  <div className="file-upload-icon">🖼️</div>
                  <div className="file-upload-text">
                    {imageFile ? 'Change image' : 'Click to upload image'}
                  </div>
                  <div className="file-upload-subtext">
                    PNG, JPG up to 10MB
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                
                {imageFile && (
                  <div className="file-preview">
                    <span className="file-preview-name">{imageFile.name}</span>
                    <button onClick={removeFile} className="file-remove-btn" type="button">
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Description & Tags */}
        {step === 4 && (
          <div className="step-content">
            <div className="step-icon">📝</div>
            <h2 className="step-title">Tell us more</h2>
            <p className="step-description">What should attendees expect?</p>
            
            <div className="form-group">
              <label>Event Description</label>
              <textarea
                placeholder={mode === 'matcha' ? 'Describe the vibe, what participants will do, and what to bring...' : 'Outline the learning objectives, key topics, and what attendees will gain...'}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="textarea-input"
              />
            </div>

            <div className="form-group">
              <label>Tags ({formData.tags.length} selected)</label>
              <div className="checklist-container">
                {currentTags.map((tag) => (
                  <label key={tag} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    <span className="checkbox-label">{tag}</span>
                  </label>
                ))}
              </div>
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
              onClick={handleSubmit} 
              className="btn btn-primary"
              disabled={!canProceed() || loading}
            >
              {loading ? 'Creating...' : `Brew Event ${mode === 'matcha' ? '🍵' : '☕'}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}