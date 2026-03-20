import { useState } from 'react'

const STYLES = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    background: 'var(--bg-1)', border: '1px solid var(--border-bright)',
    borderRadius: '16px', padding: '40px', maxWidth: '520px', width: '100%',
    boxShadow: '0 0 60px rgba(0,217,166,0.1), 0 25px 50px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.25s ease',
  },
  logo: {
    fontSize: '2.5rem', textAlign: 'center', marginBottom: '8px',
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800,
    color: 'var(--text-primary)', textAlign: 'center', marginBottom: '6px',
  },
  subtitle: {
    color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center',
    marginBottom: '32px', lineHeight: 1.5,
  },
  section: { marginBottom: '20px' },
  label: {
    display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em',
    color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px',
  },
  input: {
    width: '100%', background: 'var(--bg-0)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)',
    fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'var(--font-mono)',
  },
  hint: {
    fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px', lineHeight: 1.5,
  },
  link: { color: 'var(--accent)', textDecoration: 'underline' },
  tiers: {
    background: 'var(--bg-0)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '12px 14px', marginTop: '14px',
    fontSize: '0.75rem', color: 'var(--text-secondary)',
  },
  tierRow: {
    display: 'flex', justifyContent: 'space-between', padding: '4px 0',
    borderBottom: '1px solid var(--border)',
  },
  tierName: { color: 'var(--accent)', fontWeight: 600 },
  btnRow: { display: 'flex', gap: '10px', marginTop: '28px' },
  btnPrimary: {
    flex: 1, background: 'var(--accent)', color: '#000', border: 'none',
    borderRadius: '8px', padding: '12px', fontWeight: 700, fontSize: '0.85rem',
    letterSpacing: '0.05em', transition: 'opacity 0.2s, transform 0.1s',
    fontFamily: 'var(--font-mono)',
  },
  btnSecondary: {
    flex: 1, background: 'transparent', color: 'var(--text-secondary)',
    border: '1px solid var(--border)', borderRadius: '8px', padding: '12px',
    fontWeight: 500, fontSize: '0.85rem', transition: 'border-color 0.2s, color 0.2s',
    fontFamily: 'var(--font-mono)',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '10px',
    color: 'var(--text-dim)', fontSize: '0.72rem', margin: '18px 0',
  },
  line: { flex: 1, height: '1px', background: 'var(--border)' },
}

export default function ApiKeyModal({ onSave, existingToken, existingReferrer }) {
  const [token, setToken] = useState(existingToken || '')
  const [referrer, setReferrer] = useState(existingReferrer || '')
  const [focused, setFocused] = useState(null)

  const focusStyle = (field) => focused === field
    ? { ...STYLES.input, borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-dim)' }
    : STYLES.input

  const handleSave = () => {
    onSave({ token: token.trim(), referrer: referrer.trim() })
  }

  const handleAnon = () => {
    onSave({ token: '', referrer: '' })
  }

  return (
    <div style={STYLES.overlay}>
      <div style={STYLES.modal}>
        <div style={STYLES.logo}>🌸</div>
        <div style={STYLES.title}>PolliChat</div>
        <div style={STYLES.subtitle}>
          AI terminal powered by Pollinations.ai<br />
          Add your token for higher rate limits, or go anonymous.
        </div>

        {/* Token input */}
        <div style={STYLES.section}>
          <label style={STYLES.label}>Pollinations Token (BYOK)</label>
          <input
            style={focusStyle('token')}
            type="password"
            placeholder="Paste your token from auth.pollinations.ai..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onFocus={() => setFocused('token')}
            onBlur={() => setFocused(null)}
          />
          <div style={STYLES.hint}>
            Get your free token at{' '}
            <a href="https://auth.pollinations.ai" target="_blank" rel="noreferrer" style={STYLES.link}>
              auth.pollinations.ai
            </a>{' '}
            · Stored only in your browser's localStorage.
          </div>
        </div>

        {/* Referrer input */}
        <div style={STYLES.section}>
          <label style={STYLES.label}>Referrer Domain (optional)</label>
          <input
            style={focusStyle('referrer')}
            type="text"
            placeholder="e.g. myapp.vercel.app"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            onFocus={() => setFocused('referrer')}
            onBlur={() => setFocused(null)}
          />
          <div style={STYLES.hint}>
            Alternative to token — register your domain at auth.pollinations.ai to use as referrer.
          </div>
        </div>

        {/* Tier table */}
        <div style={STYLES.tiers}>
          <div style={{ ...STYLES.tierRow, fontWeight: 700, color: 'var(--text-secondary)' }}>
            <span>Tier</span><span>Rate Limit</span><span>Access</span>
          </div>
          {[
            ['Anonymous', '1 req / 15s', 'No signup'],
            ['Seed 🌱', '1 req / 5s', 'Free token'],
            ['Flower 🌸', '1 req / 3s', 'Paid'],
            ['Nectar 🍯', 'Unlimited', 'Enterprise'],
          ].map(([name, rate, access]) => (
            <div key={name} style={{ ...STYLES.tierRow, borderBottom: 'none', paddingTop: '5px' }}>
              <span style={STYLES.tierName}>{name}</span>
              <span>{rate}</span>
              <span style={{ color: 'var(--text-dim)' }}>{access}</span>
            </div>
          ))}
        </div>

        <div style={STYLES.divider}>
          <div style={STYLES.line} />
          <span>continue</span>
          <div style={STYLES.line} />
        </div>

        <div style={STYLES.btnRow}>
          <button
            style={STYLES.btnSecondary}
            onClick={handleAnon}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--border-bright)'; e.target.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}
          >
            Go Anonymous
          </button>
          <button
            style={STYLES.btnPrimary}
            onClick={handleSave}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            {token ? 'Save Token →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
