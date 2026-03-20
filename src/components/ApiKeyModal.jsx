import { useState } from 'react'

const STYLES = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' },
  modal: { background:'var(--bg-1)', border:'1px solid var(--border-bright)', borderRadius:'16px', padding:'40px', maxWidth:'500px', width:'100%', boxShadow:'0 0 60px rgba(0,217,166,0.1), 0 25px 50px rgba(0,0,0,0.5)', animation:'fadeIn 0.25s ease' },
  logo: { fontSize:'2.5rem', textAlign:'center', marginBottom:'8px' },
  title: { fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:800, color:'var(--text-primary)', textAlign:'center', marginBottom:'6px' },
  subtitle: { color:'var(--text-secondary)', fontSize:'0.8rem', textAlign:'center', marginBottom:'32px', lineHeight:1.5 },
  label: { display:'block', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.08em', color:'var(--accent)', textTransform:'uppercase', marginBottom:'8px' },
  input: { width:'100%', background:'var(--bg-0)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px 14px', color:'var(--text-primary)', fontSize:'0.85rem', outline:'none', transition:'border-color 0.2s', fontFamily:'var(--font-mono)' },
  hint: { fontSize:'0.72rem', color:'var(--text-dim)', marginTop:'6px', lineHeight:1.5 },
  link: { color:'var(--accent)', textDecoration:'underline' },
  tiers: { background:'var(--bg-0)', border:'1px solid var(--border)', borderRadius:'8px', padding:'12px 14px', marginTop:'14px', fontSize:'0.75rem', color:'var(--text-secondary)' },
  tierRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid var(--border)' },
  tierName: { color:'var(--accent)', fontWeight:600 },
  btn: { width:'100%', background:'var(--accent)', color:'#000', border:'none', borderRadius:'8px', padding:'13px', fontWeight:700, fontSize:'0.85rem', letterSpacing:'0.05em', marginTop:'24px', cursor:'pointer', fontFamily:'var(--font-mono)', transition:'opacity 0.2s' },
}

export default function ApiKeyModal({ onSave, existingToken }) {
  const [token, setToken] = useState(existingToken || '')
  const [focused, setFocused] = useState(false)

  const inputStyle = focused
    ? { ...STYLES.input, borderColor:'var(--accent)', boxShadow:'0 0 0 3px var(--accent-dim)' }
    : STYLES.input

  return (
    <div style={STYLES.overlay}>
      <div style={STYLES.modal}>
        <div style={STYLES.logo}>🌸</div>
        <div style={STYLES.title}>PolliChatter</div>
        <div style={STYLES.subtitle}>
          A minimal interface for Pollinations.ai<br />
          A token is required to use this app.
        </div>

        <label style={STYLES.label}>Pollinations Token</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="Paste your token from enter.pollinations.ai..."
          value={token}
          onChange={e => setToken(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div style={STYLES.hint}>
          Get your token at{' '}
          <a href="https://enter.pollinations.ai" target="_blank" rel="noreferrer" style={STYLES.link}>
            enter.pollinations.ai
          </a>
          {' '}· Stored only in your browser's localStorage.
        </div>

        <div style={STYLES.tiers}>
          <div style={{ ...STYLES.tierRow, fontWeight:700, color:'var(--text-secondary)', fontSize:'0.7rem' }}>
            <span>Tier</span><span>Pollen</span><span>To Unlock</span>
          </div>
          {[
            ['🍄 Spore', '0.01 / hour', 'Verify account'],
            ['🌱 Seed',  '0.15 / hour', '8+ dev points'],
            ['🌸 Flower','10 / day',    'Publish an app'],
            ['🍯 Nectar','20 / day',    'Coming soon 🔮'],
          ].map(([name, pollen, unlock]) => (
            <div key={name} style={{ ...STYLES.tierRow, borderBottom:'none', paddingTop:'5px' }}>
              <span style={STYLES.tierName}>{name}</span>
              <span>{pollen}</span>
              <span style={{ color:'var(--text-dim)', fontSize:'0.7rem' }}>{unlock}</span>
            </div>
          ))}
          <div style={{ marginTop:'10px', fontSize:'0.68rem', color:'var(--text-dim)', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
            🔮 We're in beta — pollen values and tier rules may evolve.
          </div>
        </div>

        <button
          style={{ ...STYLES.btn, opacity: token.trim() ? 1 : 0.4, cursor: token.trim() ? 'pointer' : 'not-allowed' }}
          onClick={() => token.trim() && onSave({ token: token.trim(), referrer: '' })}
          onMouseEnter={e => { if(token.trim()) e.target.style.opacity = '0.85' }}
          onMouseLeave={e => e.target.style.opacity = token.trim() ? '1' : '0.4'}
        >
          Save Token →
        </button>
      </div>
    </div>
  )
}
