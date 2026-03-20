const MODELS = [
  { id: 'openai', label: 'GPT-5 Mini', tag: 'fast' },
  { id: 'openai-fast', label: 'GPT-5 Nano', tag: 'fastest' },
  { id: 'openai-reasoning', label: 'o4-mini', tag: 'reasoning' },
  { id: 'mistral', label: 'Mistral', tag: '' },
  { id: 'mistral-roblox', label: 'Mistral Roblox', tag: '' },
  { id: 'claude-hybridspace', label: 'Claude', tag: 'powerful' },
  { id: 'deepseek', label: 'DeepSeek', tag: '' },
  { id: 'deepseek-reasoning', label: 'DeepSeek R1', tag: 'reasoning' },
  { id: 'qwen-coder', label: 'Qwen Coder', tag: 'code' },
  { id: 'llama', label: 'Llama', tag: '' },
  { id: 'gemini', label: 'Gemini', tag: '' },
  { id: 'gemini-thinking', label: 'Gemini Thinking', tag: 'reasoning' },
]

export { MODELS }

export default function Sidebar({
  conversations, activeId, onSelect, onNew, onDelete,
  selectedModel, onModelChange, tokenInfo, onEditToken,
  sidebarOpen, onToggleSidebar, models, modelsLoading,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40,
            '@media(maxWidth:768px)': { display: 'block' },
          }}
        />
      )}

      <aside style={{
        width: sidebarOpen ? '260px' : '0',
        minWidth: sidebarOpen ? '260px' : '0',
        overflow: 'hidden',
        background: 'var(--bg-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        height: '100%',
        flexShrink: 0,
      }}>
        <div style={{ width: '260px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.2rem' }}>🌸</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                PolliChat
              </span>
            </div>
            <button
              onClick={onNew}
              style={{
                width: '100%', background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                borderRadius: '8px', color: 'var(--accent)', padding: '8px 12px',
                fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                transition: 'background 0.15s',
                fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
            >
              + New Chat
            </button>
          </div>

          {/* Model selector */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Model
            </div>
            <select
              value={selectedModel}
              onChange={e => onModelChange(e.target.value)}
              disabled={modelsLoading}
              style={{
                width: '100%', background: 'var(--bg-0)', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text-primary)', padding: '7px 10px',
                fontSize: '0.78rem', outline: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Chat history */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
              History
            </div>
            {conversations.length === 0 && (
              <div style={{ padding: '8px', color: 'var(--text-dim)', fontSize: '0.75rem', textAlign: 'center', marginTop: '20px' }}>
                No conversations yet
              </div>
            )}
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                  background: activeId === conv.id ? 'var(--bg-3)' : 'transparent',
                  border: `1px solid ${activeId === conv.id ? 'var(--border-bright)' : 'transparent'}`,
                  marginBottom: '3px', transition: 'all 0.15s', group: true,
                }}
                onMouseEnter={e => { if (activeId !== conv.id) e.currentTarget.style.background = 'var(--bg-2)' }}
                onMouseLeave={e => { if (activeId !== conv.id) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '0.75rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: activeId === conv.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {conv.title || 'New conversation'}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-dim)',
                    fontSize: '0.75rem', padding: '1px 4px', borderRadius: '3px',
                    opacity: 0, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.color = 'var(--danger)'; e.target.style.opacity = 1 }}
                  onMouseLeave={e => { e.target.style.color = 'var(--text-dim)'; e.target.style.opacity = 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Token status */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={onEditToken}
              disabled={modelsLoading}
              style={{
                width: '100%', background: 'var(--bg-0)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '9px 12px', display: 'flex', alignItems: 'center',
                gap: '8px', cursor: 'pointer', transition: 'border-color 0.15s',
                fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '0.8rem' }}>{tokenInfo.token ? '🔑' : '👤'}</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: tokenInfo.token ? 'var(--accent)' : 'var(--text-dim)', fontWeight: 600 }}>
                  {tokenInfo.token ? 'BYOK Active' : 'Anonymous'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                  {tokenInfo.token ? 'Token saved · click to edit' : 'Click to add token'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
