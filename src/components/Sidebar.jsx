import { useState, useEffect } from 'react'

const TEXT_GROUPS = {
  'OpenAI': ['openai', 'openai-fast', 'openai-large', 'openai-audio', 'openai-seraphyn'],
  'Anthropic': ['claude-fast', 'claude', 'claude-large', 'claude-airforce'],
  'Google': ['gemini-fast', 'gemini', 'gemini-large', 'gemini-search'],
  'DeepSeek / xAI / Moonshot': ['deepseek', 'grok', 'kimi'],
  'Mistral / Qwen / Others': ['mistral', 'qwen-coder', 'glm', 'minimax', 'nova-fast', 'step-3.5-flash'],
  'Perplexity': ['perplexity-fast', 'perplexity-reasoning'],
  'Agents': ['nomnom', 'polly'],
}
const IMAGE_GROUPS = {
  'OpenAI': ['gptimage', 'gptimage-large'],
  'FLUX': ['flux', 'flux-2-dev', 'klein', 'kontext'],
  'Google / Gemini': ['nanobanana', 'nanobanana-2', 'nanobanana-pro', 'imagen-4'],
  'Others': ['zimage', 'seedream5', 'grok-imagine', 'dirtberry', 'dirtberry-pro', 'p-image', 'p-image-edit'],
}
const VIDEO_GROUPS = { 'Video Generation': ['veo', 'seedance', 'seedance-pro', 'wan', 'grok-video', 'ltx-2', 'p-video'] }
const AUDIO_GROUPS = { 'Text to Speech': ['elevenlabs', 'qwen3-tts'], 'Music Generation': ['elevenmusic', 'suno'], 'Speech to Text': ['whisper', 'scribe'] }
const MODEL_TAGS = {
  'openai':['fast'],'openai-fast':['fastest'],'openai-large':['reasoning','paid'],'openai-audio':['audio'],'openai-seraphyn':[],
  'claude-fast':['fast'],'claude':['paid'],'claude-large':['paid'],'claude-airforce':[],
  'gemini-fast':['fast'],'gemini':['paid'],'gemini-large':['reasoning','paid'],'gemini-search':['search'],
  'deepseek':['reasoning'],'grok':['paid'],'kimi':['reasoning'],
  'mistral':[],'qwen-coder':['code'],'glm':['reasoning'],'minimax':['reasoning'],'nova-fast':['fastest'],'step-3.5-flash':['fast'],
  'perplexity-fast':['search'],'perplexity-reasoning':['reasoning','search'],
  'nomnom':['web'],'polly':['code'],
  'gptimage':[],'gptimage-large':['paid'],'flux':['fast'],'flux-2-dev':[],'klein':[],'kontext':['paid'],
  'nanobanana':['paid'],'nanobanana-2':['paid'],'nanobanana-pro':['paid'],'imagen-4':[],
  'zimage':[],'seedream5':['paid'],'grok-imagine':[],'dirtberry':[],'dirtberry-pro':[],'p-image':['paid'],'p-image-edit':['paid'],
  'veo':['paid'],'seedance':['paid'],'seedance-pro':['paid'],'wan':['paid'],'grok-video':[],'ltx-2':['paid'],'p-video':['paid'],
  'elevenlabs':[],'qwen3-tts':[],'elevenmusic':[],'suno':[],'whisper':['stt'],'scribe':['stt'],
}
const TAG_COLORS = {
  fast:{color:'#68d391',border:'#68d39140',bg:'#68d39110'},fastest:{color:'#68d391',border:'#68d39140',bg:'#68d39110'},
  paid:{color:'#f6ad55',border:'#f6ad5540',bg:'#f6ad5510'},reasoning:{color:'#9f7aea',border:'#9f7aea40',bg:'#9f7aea10'},
  search:{color:'#63b3ed',border:'#63b3ed40',bg:'#63b3ed10'},web:{color:'#63b3ed',border:'#63b3ed40',bg:'#63b3ed10'},
  code:{color:'#fbd38d',border:'#fbd38d40',bg:'#fbd38d10'},audio:{color:'#f687b3',border:'#f687b340',bg:'#f687b310'},
  stt:{color:'#a0aec0',border:'#a0aec040',bg:'#a0aec010'},
}
function Tag({label}){const s=TAG_COLORS[label]||TAG_COLORS.stt;return(<span style={{fontSize:'0.53rem',fontWeight:700,letterSpacing:'0.04em',padding:'2px 5px',borderRadius:'3px',textTransform:'uppercase',border:`1px solid ${s.border}`,background:s.bg,color:s.color,whiteSpace:'nowrap',fontFamily:'var(--font-mono)'}}>{label}</span>)}
function ModelItem({model,selected,onClick}){const tags=MODEL_TAGS[model.name]||[];const[hovered,setHovered]=useState(false);const parts=(model.description||model.name).split(' - ');const title=parts[0];const subtitle=[parts[1],model.context_length?`${(model.context_length/1000).toFixed(0)}K ctx`:``].filter(Boolean).join(' · ');return(<div onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{display:'flex',alignItems:'center',gap:'7px',padding:'7px 8px',borderRadius:'6px',cursor:'pointer',background:selected?'var(--bg-3)':hovered?'var(--bg-2)':'transparent',border:`1px solid ${selected?'var(--border-bright)':hovered?'var(--border)':'transparent'}`,transition:'all 0.12s'}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.75rem',color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</div>{subtitle&&<div style={{fontSize:'0.6rem',color:'var(--text-dim)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:'1px'}}>{subtitle}</div>}</div>{tags.length>0&&(<div style={{display:'flex',gap:'3px',flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end',maxWidth:'95px'}}>{tags.map(t=><Tag key={t} label={t}/>)}</div>)}</div>)}
function GroupedList({models,groups,selectedModel,onSelect}){const modelMap={};models.forEach(m=>{modelMap[m.name]=m});const grouped=new Set(Object.values(groups).flat());const ungrouped=models.filter(m=>!grouped.has(m.name));return(<div style={{overflowY:'auto',maxHeight:'320px'}}>{Object.entries(groups).map(([label,ids])=>{const items=ids.map(id=>modelMap[id]).filter(Boolean);if(!items.length)return null;return(<div key={label}><div style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.1em',color:'var(--text-dim)',textTransform:'uppercase',padding:'8px 8px 4px',borderTop:'1px solid var(--border)'}}>{label}</div>{items.map(m=><ModelItem key={m.name} model={m} selected={selectedModel===m.name} onClick={()=>onSelect(m.name)}/>)}</div>)})} {ungrouped.length>0&&(<div><div style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.1em',color:'var(--text-dim)',textTransform:'uppercase',padding:'8px 8px 4px',borderTop:'1px solid var(--border)'}}>Other</div>{ungrouped.map(m=><ModelItem key={m.name} model={m} selected={selectedModel===m.name} onClick={()=>onSelect(m.name)}/>)}</div>)}</div>)}

export default function Sidebar({conversations,activeId,onSelect,onNew,onDelete,selectedModel,onModelChange,tokenInfo,onEditToken,sidebarOpen,onToggleSidebar}){
  const[mainTab,setMainTab]=useState('text')
  const[imageSubTab,setImageSubTab]=useState('image')
  const[textModels,setTextModels]=useState([])
  const[imageModels,setImageModels]=useState([])
  const[videoModels,setVideoModels]=useState([])
  const[audioModels,setAudioModels]=useState([])
  const[loading,setLoading]=useState(true)
  useEffect(()=>{Promise.all([fetch('https://gen.pollinations.ai/text/models').then(r=>r.json()),fetch('https://gen.pollinations.ai/image/models').then(r=>r.json()),fetch('https://gen.pollinations.ai/audio/models').then(r=>r.json())]).then(([text,image,audio])=>{setTextModels(Array.isArray(text)?text.filter(m=>!m.is_specialized):[]);setImageModels(Array.isArray(image)?image.filter(m=>!m.output_modalities?.includes('video')):[]);setVideoModels(Array.isArray(image)?image.filter(m=>m.output_modalities?.includes('video')):[]);setAudioModels(Array.isArray(audio)?audio:[])}).catch(console.error).finally(()=>setLoading(false))},[])
  const mainTabBtn=(id,label)=>(<button key={id} onClick={()=>setMainTab(id)} style={{flex:1,padding:'5px 0',fontSize:'0.66rem',fontWeight:600,textAlign:'center',borderRadius:'5px',cursor:'pointer',border:mainTab===id?'1px solid var(--border-bright)':'none',background:mainTab===id?'var(--bg-3)':'transparent',color:mainTab===id?'var(--accent)':'var(--text-dim)',fontFamily:'var(--font-mono)',transition:'all 0.15s'}}>{label}</button>)
  const subTabBtn=(id,label)=>(<button key={id} onClick={()=>setImageSubTab(id)} style={{flex:1,padding:'4px 0',fontSize:'0.62rem',fontWeight:600,textAlign:'center',borderRadius:'5px',cursor:'pointer',border:`1px solid ${imageSubTab===id?'var(--border-bright)':'var(--border)'}`,background:imageSubTab===id?'var(--bg-2)':'transparent',color:imageSubTab===id?'var(--text-secondary)':'var(--text-dim)',fontFamily:'var(--font-mono)',transition:'all 0.15s'}}>{label}</button>)
  const countMap={text:`${textModels.length} text models`,image:imageSubTab==='image'?`${imageModels.length} image models`:`${videoModels.length} video models`,audio:`${audioModels.length} audio models`}
  return(<aside style={{width:sidebarOpen?'270px':'0',minWidth:sidebarOpen?'270px':'0',overflow:'hidden',background:'var(--bg-1)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',transition:'width 0.25s ease, min-width 0.25s ease',height:'100%',flexShrink:0}}><div style={{width:'270px',height:'100%',display:'flex',flexDirection:'column'}}>
    <div style={{padding:'16px 16px 14px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}><span style={{fontSize:'1.2rem'}}>🌸</span><span style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1rem',color:'var(--text-primary)'}}>PolliChatter</span></div>
      <button onClick={onNew} style={{width:'100%',background:'var(--accent-dim)',border:'1px solid var(--accent)',borderRadius:'8px',color:'var(--accent)',padding:'8px 12px',fontSize:'0.78rem',fontWeight:600,letterSpacing:'0.05em',display:'flex',alignItems:'center',gap:'6px',justifyContent:'center',transition:'background 0.15s',fontFamily:'var(--font-mono)',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='var(--accent-glow)'} onMouseLeave={e=>e.currentTarget.style.background='var(--accent-dim)'}>+ New Chat</button>
    </div>
    <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
      <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',color:'var(--accent)',textTransform:'uppercase',marginBottom:'10px',display:'flex',alignItems:'center',gap:'6px'}}><span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--accent)',display:'inline-block'}}/>Model</div>
      <div style={{display:'flex',gap:'3px',marginBottom:'10px',background:'var(--bg-0)',border:'1px solid var(--border)',borderRadius:'8px',padding:'3px'}}>{mainTabBtn('text','💬 Text')}{mainTabBtn('image','🖼️ Image')}{mainTabBtn('audio','🎵 Audio')}</div>
      {mainTab==='image'&&(<div style={{display:'flex',gap:'3px',marginBottom:'8px'}}>{subTabBtn('image','🖼️ Images')}{subTabBtn('video','🎬 Video')}</div>)}
      {loading?(<div style={{fontSize:'0.72rem',color:'var(--text-dim)',padding:'12px 4px'}}>Loading models…</div>):(<>{mainTab==='text'&&<GroupedList models={textModels} groups={TEXT_GROUPS} selectedModel={selectedModel} onSelect={onModelChange}/>}{mainTab==='image'&&imageSubTab==='image'&&<GroupedList models={imageModels} groups={IMAGE_GROUPS} selectedModel={selectedModel} onSelect={onModelChange}/>}{mainTab==='image'&&imageSubTab==='video'&&<GroupedList models={videoModels} groups={VIDEO_GROUPS} selectedModel={selectedModel} onSelect={onModelChange}/>}{mainTab==='audio'&&<GroupedList models={audioModels} groups={AUDIO_GROUPS} selectedModel={selectedModel} onSelect={onModelChange}/>}</>)}
      <div style={{fontSize:'0.63rem',color:'var(--text-dim)',marginTop:'8px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'4px',height:'4px',borderRadius:'50%',background:'var(--accent)',display:'inline-block'}}/>{loading?'Fetching models…':`${countMap[mainTab]} · live from API`}</div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'10px 8px'}}>
      <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',color:'var(--text-dim)',textTransform:'uppercase',padding:'4px 8px 8px'}}>History</div>
      {conversations.length===0&&(<div style={{padding:'8px',color:'var(--text-dim)',fontSize:'0.75rem',textAlign:'center',marginTop:'20px'}}>No conversations yet</div>)}
      {conversations.map(conv=>(<div key={conv.id} onClick={()=>onSelect(conv.id)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 10px',borderRadius:'8px',cursor:'pointer',background:activeId===conv.id?'var(--bg-3)':'transparent',border:`1px solid ${activeId===conv.id?'var(--border-bright)':'transparent'}`,marginBottom:'3px',transition:'all 0.15s'}} onMouseEnter={e=>{if(activeId!==conv.id)e.currentTarget.style.background='var(--bg-2)'}} onMouseLeave={e=>{if(activeId!==conv.id)e.currentTarget.style.background='transparent'}}><span style={{fontSize:'0.75rem',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:activeId===conv.id?'var(--text-primary)':'var(--text-secondary)'}}>{conv.title||'New conversation'}</span><button onClick={e=>{e.stopPropagation();onDelete(conv.id)}} style={{background:'none',border:'none',color:'var(--text-dim)',fontSize:'0.75rem',padding:'1px 4px',cursor:'pointer',opacity:0,transition:'opacity 0.15s'}} onMouseEnter={e=>{e.target.style.color='var(--danger)';e.target.style.opacity=1}} onMouseLeave={e=>{e.target.style.color='var(--text-dim)';e.target.style.opacity=0}}>×</button></div>))}
    </div>
    <div style={{padding:'12px 14px',borderTop:'1px solid var(--border)',flexShrink:0}}>
      <button onClick={onEditToken} style={{width:'100%',background:'var(--bg-0)',border:'1px solid var(--border)',borderRadius:'8px',padding:'9px 12px',display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',transition:'border-color 0.15s',fontFamily:'var(--font-mono)'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-bright)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}><span style={{fontSize:'0.8rem'}}>{tokenInfo.token?'🔑':'👤'}</span><div style={{textAlign:'left',flex:1}}><div style={{fontSize:'0.7rem',color:tokenInfo.token?'var(--accent)':'var(--text-dim)',fontWeight:600}}>{tokenInfo.token?'BYOK Active':'Anonymous'}</div><div style={{fontSize:'0.65rem',color:'var(--text-dim)'}}>{tokenInfo.token?'Token saved · click to edit':'Click to add token'}</div></div></button>
    </div>
  </div></aside>)
}
