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
    <button onClick={handleCopy} title="Copy" style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:small?'4px':'6px', color:copied?'var(--accent)':'var(--text-dim)', padding:small?'2px 8px':'4px 10px', fontSize:'0.7rem', cursor:'pointer', fontFamily:'var(--font-mono)', transition:'all 0.15s', letterSpacing:'0.04em', flexShrink:0 }} onMouseEnter={e=>{if(!copied){e.target.style.color='var(--text-secondary)';e.target.style.borderColor='var(--border-bright)'}}} onMouseLeave={e=>{if(!copied){e.target.style.color='var(--text-dim)';e.target.style.borderColor='var(--border)'}}}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}

const CodeBlock = ({ language, code }) => (
  <div style={{ position:'relative', borderRadius:'8px', overflow:'hidden', margin:'0.75em 0' }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0a0d14', padding:'6px 12px', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:'0.7rem', color:'var(--text-dim)', letterSpacing:'0.06em' }}>{language || 'code'}</span>
      <CopyBtn text={code} small />
    </div>
    <SyntaxHighlighter style={vscDarkPlus} language={language || 'text'} PreTag="div" customStyle={{ margin:0, padding:'14px 16px', background:'var(--code-bg)', fontSize:'0.82rem', lineHeight:1.6 }}>
      {code}
    </SyntaxHighlighter>
  </div>
)

function ThinkingBox({ content, isStreaming }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom:'10px', border:'1px solid #1a2a3a', borderRadius:'8px', overflow:'hidden', background:'#080d14' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', textAlign:'left' }}>
        <span style={{ fontSize:'0.75rem', animation: isStreaming ? 'pulse-glow 1s ease infinite' : 'none' }}>🧠</span>
        <span style={{ fontSize:'0.72rem', color:'#5a8a7a', fontWeight:600, letterSpacing:'0.05em', flex:1 }}>
          {isStreaming ? 'Thinking…' : 'Thought process'}
        </span>
        {isStreaming && (
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00d9a6', display:'inline-block', animation:'blink 0.8s step-start infinite' }} />
        )}
        <span style={{ fontSize:'0.7rem', color:'var(--text-dim)', transition:'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:'10px 14px', borderTop:'1px solid #1a2a3a', fontSize:'0.75rem', color:'#5a7a6a', lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:'300px', overflowY:'auto' }}>
          {content}
          {isStreaming && <span style={{ display:'inline-block', width:'6px', height:'11px', background:'#00d9a6', marginLeft:'2px', verticalAlign:'text-bottom', animation:'blink 0.8s step-start infinite', borderRadius:'1px' }} />}
        </div>
      )}
    </div>
  )
}

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display:'flex', flexDirection:isUser?'row-reverse':'row', gap:'12px', padding:'6px 0', animation:'fadeIn 0.2s ease', alignItems:'flex-start' }}>
      <div style={{ width:'30px', height:'30px', borderRadius:'6px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', marginTop:'2px', background:isUser?'var(--user-bubble)':'var(--bg-2)', border:`1px solid ${isUser?'var(--user-border)':'var(--border)'}`, color:isUser?'#5ba3f5':'var(--accent)' }}>
        {isUser ? '>' : '🌸'}
      </div>
      <div style={{ maxWidth:'min(680px, calc(100% - 50px))', background:isUser?'var(--user-bubble)':'var(--bg-2)', border:`1px solid ${isUser?'var(--user-border)':'var(--border)'}`, borderRadius:isUser?'12px 4px 12px 12px':'4px 12px 12px 12px', padding:'12px 16px', position:'relative' }}>
        {isUser ? (
          <div style={{ color:'var(--text-primary)', whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'0.88rem' }}>{message.content}</div>
        ) : (
          <>
            {message.thinking && (
              <ThinkingBox content={message.thinking} isStreaming={isStreaming && !message.content} />
            )}
            <div className="md-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const code = String(children).replace(/\n$/, '')
                  if (!inline && match) return <CodeBlock language={match[1]} code={code} />
                  if (!inline && code.includes('\n')) return <CodeBlock language="" code={code} />
                  return <code className={className} {...props}>{children}</code>
                },
                pre({ children }) { return <>{children}</> },
              }}>
                {message.content}
              </ReactMarkdown>
            </div>
            {isStreaming && (
              <span style={{ display:'inline-block', width:'8px', height:'14px', background:'var(--accent)', marginLeft:'2px', verticalAlign:'text-bottom', animation:'blink 0.8s step-start infinite', borderRadius:'1px' }} />
            )}
            {!isStreaming && message.content && (
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'8px', paddingTop:'8px', borderTop:'1px solid var(--border)' }}>
                <CopyBtn text={message.content} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
