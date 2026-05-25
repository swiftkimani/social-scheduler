"use client";

import { useState } from 'react';

// Adjust the backend URL if your API runs on a different host/port
const BACKEND_API = 'http://localhost:8080/api/post';

export default function PostForm() {
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState({ twitter: false, linkedin: false });
  const [scheduledAt, setScheduledAt] = useState('');
  const [status, setStatus] = useState(null);

  const togglePlatform = (name) => {
    setPlatforms((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    const selectedPlatforms = Object.entries(platforms)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);

    if (!content.trim() || selectedPlatforms.length === 0) {
      setStatus('Please provide content and select at least one platform.');
      return;
    }

    const payload = {
      content,
      platforms: selectedPlatforms,
      scheduledFor: scheduledAt || null,
    };

    try {
      const resp = await fetch(BACKEND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (resp.ok) {
        setStatus('✅ Post scheduled! ID: ' + (data.id || 'unknown'));
        // Reset form
        setContent('');
        setPlatforms({ twitter: false, linkedin: false });
        setScheduledAt('');
      } else {
        setStatus('❌ Error: ' + (data.message || resp.statusText));
      }
    } catch (err) {
      setStatus('❌ Network error: ' + err.message);
    }
  };

  return (
    <section className="post-form">
      <h2 className="form-title">Create New Post</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field-label">
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Write your post…"
            required
            className="textarea"
          />
        </label>

        <fieldset className="platform-fieldset">
          <legend>Select Platforms</legend>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={platforms.twitter}
              onChange={() => togglePlatform('twitter')}
            />
            Twitter (X)
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={platforms.linkedin}
              onChange={() => togglePlatform('linkedin')}
            />
            LinkedIn
          </label>
        </fieldset>

        <label className="field-label">
          Schedule (optional)
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="datetime-input"
          />
        </label>

        <button type="submit" className="submit-btn">
          Schedule Post
        </button>
      </form>
      {status && <p className="status-msg">{status}</p>}
    </section>
  );
}
