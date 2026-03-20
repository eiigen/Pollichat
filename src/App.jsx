import { useState, useEffect, useRef, useCallback } from 'react'

const MODELS_URL = 'https://gen.pollinations.ai/v1/models'
import ChatMessage from './components/ChatMessage.jsx'
import Sidebar from './components/Sidebar.jsx'
import ApiKeyModal from './components/ApiKeyModal.jsx'

const TEXT_API = 'https://gen.pollinations.ai/v1/chat/completions'
const DEFAULT_MODEL = 'openai'
const SYSTEM_PROMPT = `You are a helpful, concise AI assistant. You communicate clearly and use markdown formatting when it helps readability — code blocks for code, tables for comparisons, headers for structure. Be direct and helpful.`

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

function newConversation() {
  return { id: genId(), title: '', messages: [], model: DEFAULT_MODEL, createdAt: Date.now() }
}

function loadStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export default function App() {
  const [showModal, setShowModal] = useState(false)
  const [tokenInfo, setTokenInfo] = useState(() => loadStorage('pollinations_token', { token: '', referrer: '' }))
  const [conversations, setConversations] = useState(() => loadStorage('pollinations_chats', []))
  const [activeId, setActiveId] = useState(null)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMsg, setStreamingMsg] = useState(null)
  const [models, setModels] = useState([{ id: DEFAULT_MODEL, label: DEFAULT_MODEL }])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  // Fetch models on mount
  useEffect(() => {
    fetch(MODELS_URL)
      .then(r => r.json())
      .then(data => {
        if (data?.data?.length) {
          setModels(data.data.map(m => ({ id: m.id, label: m.id })))
        }
      })
      .catch(() => {})
      .finally(() => setModelsLoading(false))
  }, [])

  // On first load: show modal if no token info exists yet
  useEffect(() => {
    const hasVisited = localStorage.getItem('pollinations_visited')
    if (!hasVisited) setShowModal(true)
    localStorage.setItem('pollinations_visited', '1')
  }, [])

  // Active conversation
  const activeConv = conversations.find(c => c.id === activeId) || null

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages, streamingMsg])

  // Save conversations
  useEffect(() => {
    saveStorage('pollinations_chats', conversations)
  }, [conversations])

  const handleSaveToken = ({ token, referrer }) => {
    const info = { token, referrer }
    setTokenInfo(info)
    saveStorage('pollinations_token', info)
    setShowModal(false)
    if (!activeId) createNewChat()
  }

  const createNewChat = useCallback(() => {
    const conv = newConversation()
    conv.model = selectedModel
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
  }, [selectedModel])

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const updateConversation = (id, updater) => {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c))
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    // Ensure active conversation
    let convId = activeId
    if (!convId) {
      const conv = newConversation()
      conv.model = selectedModel
      setConversations(prev => [conv, ...prev])
      setActiveId(conv.id)
      convId = conv.id
    }

    const userMsg = { role: 'user', content: text, id: genId() }
    const title = text.slice(0, 40) + (text.length > 40 ? '…' : '')

    // Optimistic update
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c
      return {
        ...c,
        title: c.title || title,
        messages: [...c.messages, userMsg],
        model: selectedModel,
      }
    }))
    setInput('')
    setError(null)
    setIsLoading(true)
    setStreamingMsg({ role: 'assistant', content: '', id: genId() })

    const conv = conversations.find(c => c.id === convId)
    const history = [...(conv?.messages || []), userMsg]

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (tokenInfo.token) headers['Authorization'] = `Bearer ${tokenInfo.token}`

      const body = {
        model: selectedModel,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(m => ({ role: m.role, content: m.content })),
        ],
      }
      if (tokenInfo.referrer) body.referrer = tokenInfo.referrer

      abortRef.current = new AbortController()
      const resp = await fetch(TEXT_API, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (!resp.ok) {
        const errText = await resp.text()
        throw new Error(`API error ${resp.status}: ${errText.slice(0, 200)}`)
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              setStreamingMsg(prev => ({ ...prev, content: fullContent }))
            }
          } catch {}
        }
      }

      // Save assistant message
      const assistantMsg = { role: 'assistant', content: fullContent, id: genId() }
      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c
        return { ...c, messages: [...c.messages, assistantMsg] }
      }))
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
      setStreamingMsg(null)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const exportChat = () => {
    if (!activeConv) return
    const text = activeConv.messages
      .map(m => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join('\n\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${activeConv.title?.slice(0, 20) || 'export'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const messages = activeConv?.messages || []
  const allMessages = streamingMsg ? [...messages, streamingMsg] : messages

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-0)' }}>
      {/* Modals */}
      {showModal && (
        <ApiKeyModal
          onSave={handleSaveToken}
          existingToken={tokenInfo.token}
          existingReferrer={tokenInfo.referrer}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={id => setActiveId(id)}
        onNew={createNewChat}
        onDelete={deleteConversation}
        selectedModel={selectedModel}
        onModelChange={model => { setSelectedModel(model); if (activeConv) updateConversation(activeId, c => ({ ...c, model })) }}
        tokenInfo={tokenInfo}
        onEditToken={() => setShowModal(true)}
        models={models}
        modelsLoading={modelsLoading}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 20px', height: '52px', flexShrink: 0,
          borderBottom: '1px solid var(--border)', background: 'var(--bg-1)',
        }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
              color: 'var(--text-secondary)', padding: '5px 9px', fontSize: '0.85rem',
              transition: 'all 0.15s', fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--border-bright)'; e.target.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}
            title="Toggle sidebar"
          >
            ☰
          </button>

          <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeConv?.title || (
              <span style={{ color: 'var(--text-dim)' }}>PolliChatter · Powered by Pollinations.ai</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isLoading && (
              <div style={{
                width: '16px', height: '16px', border: '2px solid var(--border)',
                borderTop: '2px solid var(--accent)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
            )}
            {activeConv?.messages?.length > 0 && (
              <button
                onClick={exportChat}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                  color: 'var(--text-dim)', padding: '4px 10px', fontSize: '0.72rem',
                  letterSpacing: '0.05em', transition: 'all 0.15s', fontFamily: 'var(--font-mono)',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--border-bright)'; e.target.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-dim)' }}
              >
                ↓ export
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            {allMessages.length === 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: 'calc(100vh - 200px)',
                color: 'var(--text-dim)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌸</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  PolliChatter
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '360px' }}>
                  Start a conversation. Powered by Pollinations.ai — free, open-source generative AI.
                  <br /><br />
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Shift+Enter</span> for new line,{' '}
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Enter</span> to send.
                </div>
                <div style={{ marginTop: '28px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['Explain quantum entanglement', 'Write a Python web scraper', 'Plan a 7-day trip to Japan', 'What is the meaning of life?'].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      style={{
                        background: 'var(--bg-2)', border: '1px solid var(--border)',
                        borderRadius: '8px', color: 'var(--text-secondary)', padding: '8px 14px',
                        fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s',
                        fontFamily: 'var(--font-mono)',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
                      onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {allMessages.map((msg, i) => (
              <ChatMessage
                key={msg.id || i}
                message={msg}
                isStreaming={isLoading && i === allMessages.length - 1 && msg.role === 'assistant'}
              />
            ))}

            {error && (
              <div style={{
                background: '#1a0a0a', border: '1px solid var(--danger)', borderRadius: '8px',
                padding: '12px 16px', color: 'var(--danger)', fontSize: '0.8rem',
                marginTop: '8px', animation: 'fadeIn 0.2s ease',
              }}>
                <strong>Error:</strong> {error}
                <br />
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  If rate-limited, add a token from auth.pollinations.ai for higher limits.
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div style={{
          padding: '16px 20px 20px', borderTop: '1px solid var(--border)',
          background: 'var(--bg-1)', flexShrink: 0,
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'flex-end',
              background: 'var(--bg-0)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '10px 14px',
              transition: 'border-color 0.2s',
              boxShadow: isLoading ? '0 0 0 1px var(--accent-dim)' : 'none',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                }}
                onKeyDown={handleKey}
                placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                disabled={isLoading}
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: '1.6',
                  resize: 'none', minHeight: '24px', maxHeight: '200px',
                  fontFamily: 'var(--font-mono)', overflowY: 'auto',
                  opacity: isLoading ? 0.6 : 1,
                }}
              />

              {isLoading ? (
                <button
                  onClick={handleStop}
                  style={{
                    background: 'var(--bg-2)', border: '1px solid var(--danger)',
                    borderRadius: '8px', color: 'var(--danger)', padding: '8px 14px',
                    fontSize: '0.78rem', fontWeight: 600, flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ◼ stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    background: input.trim() ? 'var(--accent)' : 'var(--bg-2)',
                    border: `1px solid ${input.trim() ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px', color: input.trim() ? '#000' : 'var(--text-dim)',
                    padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700,
                    flexShrink: 0, transition: 'all 0.15s',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  send ↵
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>
                {tokenInfo.token ? '🔑 BYOK token active' : '👤 Anonymous mode'}{' '}
                · {activeConv?.model || selectedModel}
              </span>
              <a href="https://pollinations.ai" target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
                Powered by Pollinations.ai 🌸
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
