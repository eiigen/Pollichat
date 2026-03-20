import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

function CopyBtn({ text, small }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: small ? '4px' : '6px',
        color: copied ? 'var(--accent)' : 'var(--text-dim)',
        padding: small ? '2px 8px' : '4px 10px',
        fontSize: '0.7rem',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        transition: 'all 0.15s',
        letterSpacing: '0.04em',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!copied) { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border-bright)' } }}
      onMouseLeave={e => { if (!copied) { e.target.style.color = 'var(--text-dim)'; e.target.style.borderColor = 'var(--border)' } }}
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}

const CodeBlock = ({ language, code }) => (
  <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', margin: '0.75em 0' }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#0a0d14', padding: '6px 12px',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
        {language || 'code'}
      </span>
      <CopyBtn text={code} small />
    </div>
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={language || 'text'}
      PreTag="div"
      customStyle={{
        margin: 0, padding: '14px 16px', background: 'var(--code-bg)',
        fontSize: '0.82rem', lineHeight: 1.6,
      }}
    >
      {code}
    </SyntaxHighlighter>
  </div>
)

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '12px',
      padding: '6px 0',
      animation: 'fadeIn 0.2s ease',
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '6px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', marginTop: '2px',
        background: isUser ? 'var(--user-bubble)' : 'var(--bg-2)',
        border: `1px solid ${isUser ? 'var(--user-border)' : 'var(--border)'}`,
        color: isUser ? '#5ba3f5' : 'var(--accent)',
      }}>
        {isUser ? '>' : '🌸'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: 'min(680px, calc(100% - 50px))',
        background: isUser ? 'var(--user-bubble)' : 'var(--bg-2)',
        border: `1px solid ${isUser ? 'var(--user-border)' : 'var(--border)'}`,
        borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
        padding: '12px 16px',
        position: 'relative',
      }}>
        {isUser ? (
          <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.88rem' }}>
            {message.content}
          </div>
        ) : (
          <>
            <div className="md-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const code = String(children).replace(/\n$/, '')
                    if (!inline && match) {
                      return <CodeBlock language={match[1]} code={code} />
                    }
                    if (!inline && code.includes('\n')) {
                      return <CodeBlock language="" code={code} />
                    }
                    return <code className={className} {...props}>{children}</code>
                  },
                  pre({ children }) { return <>{children}</> },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            {isStreaming && (
              <span style={{
                display: 'inline-block', width: '8px', height: '14px',
                background: 'var(--accent)', marginLeft: '2px', verticalAlign: 'text-bottom',
                animation: 'blink 0.8s step-start infinite',
                borderRadius: '1px',
              }} />
            )}
            {!isStreaming && message.content && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <CopyBtn text={message.content} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
