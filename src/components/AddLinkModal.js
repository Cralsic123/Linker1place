import React, { useState } from 'react';
import { createLink } from '../lib/supabase';
import { formatUrl, getLinkType } from '../lib/urlUtils';

export default function AddLinkModal({ folderId, userId, onAdded, onClose }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const detectedType = url ? getLinkType(url) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');

    const formattedUrl = formatUrl(url.trim());
    const type = getLinkType(formattedUrl);

    const { data, error } = await createLink(folderId, userId, {
      url: formattedUrl,
      name: name.trim() || null,
      description: description.trim() || null,
      type,
    });

    if (error) {
      setError(error.message);
    } else {
      onAdded(data);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Add Link</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>URL *</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              required
              autoFocus
              style={styles.input}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
            />
            {detectedType && (
              <div style={styles.typeHint}>
                Detected: {detectedType === 'youtube' ? '▶ YouTube video' : detectedType === 'video' ? '▶ Video' : '🔗 Website link'}
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Give it a name..."
              style={styles.input}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes about this link..."
              style={{ ...styles.input, resize: 'none', height: '80px' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.15s ease',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    animation: 'fadeIn 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: { fontSize: '18px', fontWeight: '700' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dim)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-dim)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  input: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-bright)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'var(--font-mono)',
    transition: 'border-color 0.2s',
  },
  typeHint: {
    fontSize: '12px',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
  },
  error: {
    background: 'rgba(255,101,132,0.1)',
    border: '1px solid rgba(255,101,132,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--accent2)',
    fontSize: '13px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
  cancelBtn: {
    background: 'var(--bg-input)',
    color: 'var(--text-dim)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
  submitBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
};
