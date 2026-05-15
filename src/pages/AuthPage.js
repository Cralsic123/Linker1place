import React, { useState } from 'react';
import { signIn, signUp } from '../lib/supabase';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setSuccess('Check your email to confirm your account!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.grid} />
      <div style={styles.glow} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⬡</div>
          <div style={styles.logoText}>LinkVault</div>
        </div>
        <p style={styles.tagline}>
          {mode === 'signin' ? 'Welcome back. Your knowledge awaits.' : 'Create your knowledge hub.'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="shuvam@example.com"
              required
              style={styles.input}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => !loading && (e.target.style.background = 'var(--accent-bright)')}
            onMouseLeave={e => e.target.style.background = 'var(--accent)'}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={styles.toggle}>
          <span style={styles.toggleText}>
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
            style={styles.toggleBtn}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.4,
  },
  glow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: '20px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    animation: 'fadeIn 0.4s ease',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  logoIcon: {
    fontSize: '28px',
    color: 'var(--accent)',
    lineHeight: 1,
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: 'var(--text)',
  },
  tagline: {
    color: 'var(--text-dim)',
    marginBottom: '32px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' },
  input: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    fontFamily: 'var(--font-mono)',
  },
  error: {
    background: 'rgba(255,101,132,0.1)',
    border: '1px solid rgba(255,101,132,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--accent2)',
    fontSize: '13px',
  },
  successMsg: {
    background: 'rgba(67,233,123,0.1)',
    border: '1px solid rgba(67,233,123,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--accent3)',
    fontSize: '13px',
  },
  btn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '13px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.03em',
    transition: 'background 0.2s',
    marginTop: '4px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  toggleText: { color: 'var(--text-dimmer)', fontSize: '13px' },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-bright)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
};
