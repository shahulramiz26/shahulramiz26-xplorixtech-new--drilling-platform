'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ── SCROLL REVEAL ──────────────────────────────────────────────────────────
type AnimType = 'flipX'|'flipY'|'zoomDeep'|'slideLeft'|'slideRight'|'riseUp'|'dropDown'|'spinIn'|'unfold'
const animDefs: Record<AnimType,{from:string;to:string}> = {
  flipX:     { from:'perspective(1200px) rotateX(-22deg) translateY(70px) scale(0.93)',   to:'perspective(1200px) rotateX(0deg) translateY(0) scale(1)' },
  flipY:     { from:'perspective(1200px) rotateY(-30deg) translateX(-60px) scale(0.9)',   to:'perspective(1200px) rotateY(0deg) translateX(0) scale(1)' },
  zoomDeep:  { from:'perspective(1200px) translateZ(-280px) scale(0.72)',                  to:'perspective(1200px) translateZ(0) scale(1)' },
  slideLeft: { from:'perspective(1200px) rotateY(-18deg) translateX(-100px) scale(0.92)', to:'perspective(1200px) rotateY(0deg) translateX(0) scale(1)' },
  slideRight:{ from:'perspective(1200px) rotateY(18deg) translateX(100px) scale(0.92)',   to:'perspective(1200px) rotateY(0deg) translateX(0) scale(1)' },
  riseUp:    { from:'perspective(1200px) rotateX(16deg) translateY(90px) scale(0.9)',     to:'perspective(1200px) rotateX(0deg) translateY(0) scale(1)' },
  dropDown:  { from:'perspective(1200px) rotateX(-16deg) translateY(-90px) scale(0.9)',   to:'perspective(1200px) rotateX(0deg) translateY(0) scale(1)' },
  spinIn:    { from:'perspective(1200px) rotateZ(-7deg) translateY(60px) scale(0.9)',     to:'perspective(1200px) rotateZ(0deg) translateY(0) scale(1)' },
  unfold:    { from:'perspective(1200px) rotateX(-38deg) scaleY(0.62) translateY(40px)',  to:'perspective(1200px) rotateX(0deg) scaleY(1) translateY(0)' },
}
function SR({ children, anim='riseUp', delay=0, style={}, className='' }:{ children:React.ReactNode; anim?:AnimType; delay?:number; style?:React.CSSProperties; className?:string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(()=>{
    const o = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setTimeout(()=>setVis(true),delay) },{ threshold:0.1, rootMargin:'0px 0px -50px 0px' })
    if(ref.current) o.observe(ref.current)
    return ()=>o.disconnect()
  },[delay])
  const a = animDefs[anim]
  return (
    <div ref={ref} className={className} style={{ transform:vis?a.to:a.from, opacity:vis?1:0, transition:`transform 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, opacity 720ms ease ${delay}ms`, willChange:'transform,opacity', ...style }}>
      {children}
    </div>
  )
}

// ── TILT CARD ──────────────────────────────────────────────────────────────
function TiltCard({ children, style, className='' }:{ children:React.ReactNode; style?:React.CSSProperties; className?:string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className={className}
      onMouseMove={e=>{ if(!ref.current) return; const r=ref.current.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5; ref.current.style.transform=`perspective(1000px) rotateY(${x*10}deg) rotateX(${-y*10}deg) scale(1.02)` }}
      onMouseLeave={()=>{ if(ref.current) ref.current.style.transform='perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)' }}
      style={{ transition:'transform 0.12s ease', transformStyle:'preserve-3d', ...style }}>
      {children}
    </div>
  )
}

// ── XPLORIX LOGO ──────────────────────────────────────────────────────────
function XLogo({ size=40 }:{ size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="50,50 5,5 5,95"    fill="#1a1a1a"/>
      <polygon points="50,50 5,5 30,5"    fill="#2a2a2a"/>
      <polygon points="50,50 5,95 30,95"  fill="#2a2a2a"/>
      <polygon points="50,50 95,5 95,95"  fill="#F97316"/>
      <polygon points="50,50 95,5 70,5"   fill="#EA580C"/>
      <polygon points="50,50 95,95 70,95" fill="#EA580C"/>
    </svg>
  )
}

// ── TAG ────────────────────────────────────────────────────────────────────
function Tag({ children }:{ children:React.ReactNode }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:100, border:'1px solid rgba(249,115,22,0.25)', background:'rgba(249,115,22,0.05)', fontSize:10, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase' as const, marginBottom:20 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'#F97316', display:'inline-block', animation:'xplPulse 1.5s infinite' }}/>{children}
    </div>
  )
}

// ── AI TICKER ─────────────────────────────────────────────────────────────
function AITicker() {
  const items = [
    { text:'⚠ RIG-003 hydraulic anomaly detected — inspect within 48hrs', color:'#F59E0B' },
    { text:'📈 Pilbara Site ROP +23% above industry average this week',     color:'#10B981' },
    { text:'💰 NQ SR-08 bits on RIG-004 could cut bit cost/m by 22%',      color:'#60A5FA' },
    { text:'🚨 Fuel consumption 31% above 30-day baseline on Site B',       color:'#EF4444' },
    { text:'✅ RIG-007 achieved 97.4% core recovery — best shift this month',color:'#10B981' },
    { text:'🔧 Hydraulic oil change due on RIG-002 in 14 operating hours',  color:'#60A5FA' },
  ]
  return (
    <div style={{ background:'#0D1117', borderTop:'1px solid #1E293B', borderBottom:'1px solid #1E293B', padding:'11px 0', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 18px', borderRight:'1px solid #1E293B', flexShrink:0, background:'#0D1117', zIndex:2 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#F97316', display:'inline-block', animation:'xplPulse 1.5s infinite' }}/>
          <span style={{ fontSize:10, fontWeight:800, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase', whiteSpace:'nowrap' }}>AI Live</span>
        </div>
        <div style={{ overflow:'hidden', flex:1 }}>
          <div style={{ display:'flex', gap:48, animation:'tickerScroll 40s linear infinite', width:'max-content' }}>
            {[...items,...items].map((item,i)=>(
              <span key={i} style={{ fontSize:12, fontWeight:500, color:item.color, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8 }}>
                {item.text}<span style={{ width:4, height:4, borderRadius:'50%', background:'#1E293B', display:'inline-block' }}/>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ECOSYSTEM DIAGRAM ──────────────────────────────────────────────────────
function EcosystemDiagram() {
  const [activeNode, setActiveNode] = useState<string|null>(null)
  const nodes: Record<string,{icon:string;title:string;color:string;desc:string;feats:string[]}> = {
    ops:     {icon:'⚡',title:'Operations Dashboard', color:'#F97316',desc:'Live ROP trending, meters drilled, downtime analysis and bit performance.',feats:['Live ROP & downtime alerts','Meters drilled vs target','Bit performance & cost/m','Formation comparison']},
    maint:   {icon:'🔧',title:'Maintenance Dashboard',color:'#3B82F6',desc:'Component health and predictive maintenance — know what will fail before it fails.',feats:['Component failure analysis','MTBF by rig','Oil consumption trend','Maintenance cost tracking']},
    driller: {icon:'👷',title:'Driller & Crew',       color:'#10B981',desc:'Individual driller leaderboard handling 70+ drillers with search, sort and medals.',feats:['70+ driller leaderboard','ROP vs downtime scatter','Crew hours & utilisation','Performance radar']},
    consm:   {icon:'📦',title:'Consumables',          color:'#8B5CF6',desc:'Full resource tracking — fuel, water, additives, accessories.',feats:['Fluid consumption breakdown','Accessories by cost rank','Inventory alerts','Supplier performance']},
    hsc:     {icon:'🛡',title:'HSC & Safety',          color:'#EF4444',desc:'Incident tracking, PPE compliance, near-misses and training.',feats:['Incident type & severity','PPE compliance per item','Near-miss resolution','Safety training progress']},
    finance: {icon:'💰',title:'Finance & Costing',    color:'#F59E0B',desc:'Full cost visibility per project, per rig, per meter.',feats:['Cost per meter live tracking','Master pricing data','Hole-by-hole breakdown','Multi-currency support']},
    logs:    {icon:'📋',title:'Digital Drill Logs',   color:'#60A5FA',desc:'Supervisor shift log replacing all paper.',feats:['10h/12h shift toggle','Downtime tracking','Bit usage per hole','Incidents & attachments']},
    reports: {icon:'📄',title:'Performance Reports',  color:'#EC4899',desc:'Verified 4-page PDF certificates for any driller or supervisor.',feats:['4-page PDF certificate','Career lifetime stats','Industry comparison','XPLORIX verified badge']},
    inv:     {icon:'🗄',title:'Inventory',             color:'#10B981',desc:'Per-site stock with POs, auto-deduction and low-stock alerts.',feats:['Excel import/export','Per-site stock levels','Purchase orders','Auto stock deduction']},
    rigs:    {icon:'🔩',title:'Projects & Rigs',       color:'#8B5CF6',desc:'Manage all projects and rigs across every site.',feats:['Multi-project management','Rig activation','Site assignment','Unlimited rigs']},
    users:   {icon:'👥',title:'User Management',       color:'#06B6D4',desc:'Create and manage logins for all roles.',feats:['3 role types','Company isolation','Login credentials','Activity tracking']},
    notif:   {icon:'🔔',title:'Alerts',                color:'#F59E0B',desc:'Real-time alerts for low stock, AI anomalies and approvals.',feats:['Low stock alerts','AI anomaly alerts','Maintenance reminders','PO delivery tracking']},
    currency:{icon:'💱',title:'Multi-Currency',        color:'#EC4899',desc:'Switch currencies in real-time across the platform.',feats:['USD · INR · AUD','EUR · SAR','Live conversion','Finance integration']},
    ai:      {icon:'🧠',title:'AI Insights Engine',   color:'#F97316',desc:'Monitors every data point, detects patterns, predicts failures.',feats:['Predictive failure detection','ROP optimisation tips','Cost/m opportunities','Daily summaries']},
  }
  const active = activeNode ? nodes[activeNode] : null
  return (
    <div style={{ position:'relative', width:'100%' }}>
      <svg viewBox="0 0 360 360" width="100%" style={{ display:'block' }}>
        <defs><style>{`
          @keyframes pr1{0%{r:30;opacity:.5}100%{r:52;opacity:0}}
          @keyframes pr2{0%{r:30;opacity:.3}100%{r:58;opacity:0}}
          @keyframes eod{from{stroke-dashoffset:0}to{stroke-dashoffset:-80}}
          @keyframes eaidot{0%,100%{opacity:1}50%{opacity:.3}}
          .epr1{animation:pr1 2s ease-out infinite}.epr2{animation:pr2 2s ease-out infinite .8s}
          .eod1{animation:eod 6s linear infinite}.eod2{animation:eod 10s linear infinite}
          .eaidot{animation:eaidot 1.5s ease-in-out infinite}
        `}</style></defs>
        <circle cx="180" cy="180" r="72" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="4 4"/>
        <circle cx="180" cy="180" r="128" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="2 6"/>
        <circle r="2.5" fill="#F97316" opacity="0.5" className="eod1"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#er1"/></animateMotion></circle>
        <circle r="2" fill="#3B82F6" opacity="0.4" className="eod2"><animateMotion dur="13s" repeatCount="indefinite"><mpath href="#er2"/></animateMotion></circle>
        <path id="er1" d="M252 180 A72 72 0 1 1 251.99 180" fill="none"/>
        <path id="er2" d="M308 180 A128 128 0 1 1 307.99 180" fill="none"/>
        <g stroke="#1E293B" strokeWidth="0.75" opacity="0.7">
          <line x1="180" y1="180" x2="180" y2="108"/><line x1="180" y1="180" x2="242" y2="142"/>
          <line x1="180" y1="180" x2="242" y2="218"/><line x1="180" y1="180" x2="180" y2="252"/>
          <line x1="180" y1="180" x2="118" y2="218"/><line x1="180" y1="180" x2="118" y2="142"/>
        </g>
        <g stroke="#1E293B" strokeWidth="0.5" opacity="0.4">
          <line x1="180" y1="108" x2="180" y2="52"/><line x1="242" y1="142" x2="288" y2="112"/>
          <line x1="242" y1="218" x2="288" y2="248"/><line x1="180" y1="252" x2="180" y2="308"/>
          <line x1="118" y1="218" x2="72" y2="248"/><line x1="118" y1="142" x2="72" y2="112"/>
          <line x1="308" y1="180" x2="244" y2="180"/><line x1="52" y1="180" x2="116" y2="180"/>
        </g>
        {/* Center X logo */}
        <circle cx="180" cy="180" r="36" fill="#080B10" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5"/>
        <circle className="epr1" cx="180" cy="180" r="30" fill="none" stroke="rgba(249,115,22,0.25)" strokeWidth="1"/>
        <circle className="epr2" cx="180" cy="180" r="30" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="1"/>
        <polygon points="180,180 158,158 158,202" fill="#2a2a2a"/>
        <polygon points="180,180 158,158 168,158" fill="#3a3a3a"/>
        <polygon points="180,180 158,202 168,202" fill="#3a3a3a"/>
        <polygon points="180,180 202,158 202,202" fill="#F97316"/>
        <polygon points="180,180 202,158 192,158" fill="#EA580C"/>
        <polygon points="180,180 202,202 192,202" fill="#EA580C"/>
        {/* Inner ring */}
        {([
          {id:'ops',cx:180,cy:108,color:'#F97316'},{id:'maint',cx:242,cy:142,color:'#3B82F6'},
          {id:'driller',cx:242,cy:218,color:'#10B981'},{id:'consm',cx:180,cy:252,color:'#8B5CF6'},
          {id:'hsc',cx:118,cy:218,color:'#EF4444'},{id:'finance',cx:118,cy:142,color:'#F59E0B'},
        ]).map(n=>(
          <g key={n.id} onClick={()=>setActiveNode(activeNode===n.id?null:n.id)} style={{ cursor:'pointer' }}>
            <circle cx={n.cx} cy={n.cy} r="24" fill="#0D1117" stroke={activeNode===n.id?n.color:'#1E293B'} strokeWidth={activeNode===n.id?2:1}/>
            <text x={n.cx} y={n.cy-4} textAnchor="middle" fontSize="13" fill={n.color}>{nodes[n.id].icon}</text>
            <text x={n.cx} y={n.cy+10} textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="Inter,sans-serif">{nodes[n.id].title.split(' ')[0]}</text>
          </g>
        ))}
        {/* Outer ring */}
        {([
          {id:'logs',x:158,y:34,color:'#60A5FA',label:'Drill Logs',glow:false},
          {id:'reports',x:265,y:96,color:'#EC4899',label:'Reports',glow:false},
          {id:'inv',x:290,y:165,color:'#10B981',label:'Inventory',glow:false},
          {id:'rigs',x:265,y:234,color:'#8B5CF6',label:'Projects',glow:false},
          {id:'users',x:158,y:296,color:'#06B6D4',label:'Users',glow:false},
          {id:'notif',x:29,y:234,color:'#F59E0B',label:'Alerts',glow:false},
          {id:'currency',x:28,y:165,color:'#EC4899',label:'Currency',glow:false},
          {id:'ai',x:29,y:96,color:'#F97316',label:'AI Insights',glow:true},
        ]).map(n=>(
          <g key={n.id} onClick={()=>setActiveNode(activeNode===n.id?null:n.id)} style={{ cursor:'pointer' }}>
            <rect x={n.x} y={n.y} width="44" height="30" rx="7" fill="#0D1117"
              stroke={activeNode===n.id?n.color:n.glow?'rgba(249,115,22,0.4)':'#1E293B'}
              strokeWidth={activeNode===n.id?2:n.glow?1.2:0.75}/>
            <text x={n.x+22} y={n.y+12} textAnchor="middle" fontSize="11" fill={n.color}>{nodes[n.id].icon}</text>
            <text x={n.x+22} y={n.y+24} textAnchor="middle" fontSize="6.5" fill={n.glow?n.color:'#64748B'} fontFamily="Inter,sans-serif" fontWeight={n.glow?700:400}>{n.label}</text>
          </g>
        ))}
        <circle className="eaidot" cx="29" cy="96" r="3" fill="#F97316" opacity="0.8"/>
      </svg>
      {active && (
        <div style={{ marginTop:8, background:'rgba(13,17,23,0.97)', border:`1px solid ${active.color}40`, borderRadius:13, padding:'12px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
            <span style={{ fontSize:16 }}>{active.icon}</span>
            <span style={{ fontSize:12, fontWeight:700, color:active.color }}>{active.title}</span>
          </div>
          <p style={{ fontSize:11, color:'#94A3B8', lineHeight:1.6, marginBottom:8 }}>{active.desc}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
            {active.feats.map((f,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#94A3B8' }}>
                <span style={{ width:3, height:3, borderRadius:'50%', background:active.color, display:'inline-block', flexShrink:0 }}/>{f}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:8 }}>
        {[{c:'#F97316',l:'Dashboards'},{c:'#10B981',l:'Management'},{c:'#F97316',l:'AI Powered'}].map((l,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#64748B' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:l.c }}/>{l.l}
          </div>
        ))}
      </div>
      <div style={{ textAlign:'center', fontSize:10, color:'#334155', marginTop:3 }}>Click any module to explore</div>
    </div>
  )
}

// ── FEATURES FLY-IN SECTION ────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {icon:'⚡',color:'#F97316',title:'Operations Dashboard',   desc:'Live ROP trending, downtime analysis and bit performance across all rigs in real time.',stat:'+23%',sl:'ROP Improvement',  pts:['Live ROP & alerts','Meters vs target','Downtime by reason','Bit cost/meter'],kv:['9.8','92%'],kl:['Avg ROP','Efficiency'],  bars:[35,48,42,60,52,68,58,75,65,82,72,88,78,92,85,95]},
    {icon:'🔧',color:'#3B82F6',title:'Maintenance Dashboard',  desc:'Predictive component health tracking. Fix failures before they cause costly downtime.',  stat:'-35%',sl:'Downtime Reduced', pts:['Component failure','MTBF by rig','Oil consumption','Maintenance cost'],kv:['4.2','87%'],kl:['MTBF(days)','Uptime'],      bars:[80,65,72,58,75,62,68,55,72,60,65,52,70,58,75,80]},
    {icon:'👷',color:'#10B981',title:'Driller & Crew',         desc:'70+ driller leaderboard with search, sort, pagination and performance medals.',          stat:'+18%',sl:'Productivity',     pts:['70+ leaderboard','Shift comparison','Crew utilisation','Certificates'],kv:['#1','94%'],kl:['Top Rank','PPE Comp.'],   bars:[60,72,65,80,70,85,75,88,80,90,85,88,82,92,88,95]},
    {icon:'🛡',color:'#EF4444',title:'HSC & Safety',           desc:'Track incidents, PPE compliance, near-misses and safety training completion.',           stat:'98%', sl:'Safety Score',    pts:['Incident tracking','PPE compliance','Near-miss','Training'],           kv:['186','100%'],kl:['Safe Days','PPE Comp.'], bars:[90,88,92,86,94,90,96,92,95,90,97,94,96,92,98,95]},
    {icon:'💰',color:'#F59E0B',title:'Finance & Costing',      desc:'Full cost visibility per project, per rig, per meter tracked in real time.',             stat:'-18%',sl:'Cost Savings',     pts:['Cost per meter','Master pricing','Budget vs actual','Multi-currency'],kv:['$8.2','-18%'],kl:['Cost/m','Savings'], bars:[72,65,68,60,64,58,62,55,60,52,55,48,52,45,50,44]},
    {icon:'🗄',color:'#8B5CF6',title:'Inventory Management',   desc:'Per-site stock with purchase orders and auto-deduction from drill logs.',                 stat:'99%', sl:'Stock Accuracy',   pts:['Parts catalogue','Per-site stock','Purchase orders','Auto deduction'],kv:['247','99%'],kl:['Parts','Accuracy'],    bars:[85,88,82,90,86,92,88,94,90,96,92,94,90,96,94,98]},
    {icon:'📄',color:'#EC4899',title:'Performance Reports',    desc:'Official verified 4-page PDF certificates for drillers and supervisors.',                 stat:'100%',sl:'Verified',         pts:['4-page PDF','Lifetime stats','Industry compare','QR verified'],        kv:['4pg','100%'],kl:['Pages','Verified'],      bars:[95,92,96,90,94,92,96,94,98,95,96,94,98,96,100,98]},
    {icon:'📊',color:'#60A5FA',title:'Performance Dashboard',  desc:'Meter-by-meter hole analytics. Track every drill hole across every formation.',          stat:'360°',sl:'Full Visibility',  pts:['Hole analytics','Meter tracking','Formation compare','Bit life'],       kv:['9.8','97%'],kl:['Avg ROP','Core Rec.'],   bars:[40,52,48,62,55,70,63,76,68,80,73,84,78,86,80,88]},
    {icon:'📋',color:'#A78BFA',title:'Digital Logging',        desc:'Replace paper completely. Structured digital shift logs on any device, even offline.',    stat:'100%',sl:'Paper Gone',       pts:['10h/12h shift','Auto-calculate','Downtime log','Offline ready'],        kv:['<5m','100%'],kl:['Per Log','Paper Gone'], bars:[88,90,86,92,88,94,90,96,92,95,94,96,93,97,95,98]},
  ]

  const enterAnims = ['flyL','flyR','flyT','flyB','flyTL','flyTR','flyBL','flyBR','flyDeep']
  const exitAnims  = ['exitL','exitR','exitT','exitB','exitDeep','exitL','exitR','exitT','exitB']

  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [images, setImages] = useState<Record<number,string>>({})
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRef  = useRef<HTMLDivElement>(null)
  const progRef  = useRef<number>(0)
  const curRef   = useRef<number>(0)
  const pausedRef= useRef<boolean>(false)

  useEffect(() => { curRef.current = current }, [current])
  useEffect(() => { pausedRef.current = paused }, [paused])

  const goTo = (next: number, exitIdx?: number) => {
    const N = features.length
    const ni = ((next % N) + N) % N
    const ei = exitIdx !== undefined ? exitIdx : curRef.current % exitAnims.length
    const card = cardRef.current
    if (card) {
      card.style.animation = `${exitAnims[ei]} 0.45s cubic-bezier(0.4,0,1,1) forwards`
      setTimeout(() => {
        setCurrent(ni)
        progRef.current = 0
        setProgress(0)
        if (card) card.style.animation = `${enterAnims[ni % enterAnims.length]} 0.7s cubic-bezier(0.16,1,0.3,1) forwards`
      }, 460)
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return
      progRef.current += 0.35
      setProgress(progRef.current)
      if (progRef.current >= 100) { progRef.current = 0; goTo(curRef.current + 1) }
    }, 20)
    return () => clearInterval(id)
  }, [])

  const f = features[current]

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setImages(prev => ({ ...prev, [current]: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ position:'relative', zIndex:2 }}>
      <style>{`
        @keyframes flyL{0%{transform:translate(-700px,0) translateZ(-400px) rotateY(50deg) scale(0.3);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotateY(0) scale(1);opacity:1}}
        @keyframes flyR{0%{transform:translate(700px,0) translateZ(-400px) rotateY(-50deg) scale(0.3);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotateY(0) scale(1);opacity:1}}
        @keyframes flyT{0%{transform:translate(0,-600px) translateZ(-300px) rotateX(50deg) scale(0.3);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotateX(0) scale(1);opacity:1}}
        @keyframes flyB{0%{transform:translate(0,600px) translateZ(-300px) rotateX(-50deg) scale(0.3);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotateX(0) scale(1);opacity:1}}
        @keyframes flyTL{0%{transform:translate(-500px,-500px) translateZ(-500px) rotate(-25deg) scale(0.2);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotate(0) scale(1);opacity:1}}
        @keyframes flyTR{0%{transform:translate(500px,-500px) translateZ(-500px) rotate(25deg) scale(0.2);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotate(0) scale(1);opacity:1}}
        @keyframes flyBL{0%{transform:translate(-500px,500px) translateZ(-500px) rotate(25deg) scale(0.2);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotate(0) scale(1);opacity:1}}
        @keyframes flyBR{0%{transform:translate(500px,500px) translateZ(-500px) rotate(-25deg) scale(0.2);opacity:0}100%{transform:translate(-50%,-50%) translateZ(0) rotate(0) scale(1);opacity:1}}
        @keyframes flyDeep{0%{transform:translate(-50%,-50%) translateZ(-1400px) scale(0.05);opacity:0}60%{opacity:1}100%{transform:translate(-50%,-50%) translateZ(0) scale(1);opacity:1}}
        @keyframes exitL{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-700px,-50%) scale(0.2);opacity:0}}
        @keyframes exitR{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(600px,-50%) scale(0.2);opacity:0}}
        @keyframes exitT{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-600px) scale(0.2);opacity:0}}
        @keyframes exitB{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,600px) scale(0.2);opacity:0}}
        @keyframes exitDeep{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) translateZ(-1400px) scale(0.05);opacity:0}}
        @keyframes trailFade{0%{opacity:0.7;transform:scale(1)}100%{opacity:0;transform:scale(0.1)}}
      `}</style>

      {/* Progress */}
      <div style={{ height:2, background:'rgba(255,255,255,0.05)', borderRadius:1, overflow:'hidden', marginBottom:10 }}>
        <div style={{ height:'100%', width:`${Math.min(progress,100)}%`, background:'linear-gradient(90deg,#F97316,#F59E0B)', borderRadius:1, transition:'width 0.05s linear' }}/>
      </div>

      {/* Feature name */}
      <div style={{ textAlign:'center', fontSize:13, fontWeight:700, color:f.color, letterSpacing:'0.04em', marginBottom:12, height:20 }}>
        {f.icon} {f.title}
      </div>

      {/* Stage */}
      <div ref={stageRef} style={{ position:'relative', height:460, perspective:1400, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {/* Arrows */}
        {[{side:'left',onClick:()=>{goTo(current-1,(current+3)%exitAnims.length);setPaused(true)}},
          {side:'right',onClick:()=>{goTo(current+1);setPaused(true)}}].map((a,i)=>(
          <div key={i} onClick={a.onClick} style={{ position:'absolute', [a.side]:8, top:'50%', transform:'translateY(-50%)', width:38, height:38, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#F8FAFC', fontSize:16, zIndex:20, transition:'all 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.4)';(e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.08)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)';(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'}}>
            {a.side==='left'?'‹':'›'}
          </div>
        ))}

        {/* Card */}
        <div ref={cardRef} style={{ position:'absolute', left:'50%', top:'50%', width:300, borderRadius:18, background:'rgba(13,17,23,0.98)', border:`1px solid ${f.color}35`, boxShadow:`0 0 50px ${f.color}15, 0 24px 60px rgba(0,0,0,0.7)`, overflow:'hidden', animation:`${enterAnims[current % enterAnims.length]} 0.7s cubic-bezier(0.16,1,0.3,1) forwards`, cursor:'pointer' }}
          onClick={()=>{ if(!paused) return; goTo((current+1)%features.length); }}>

          {/* Top accent line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${f.color},transparent)`, zIndex:2 }}/>

          {/* IMAGE AREA */}
          <div style={{ width:'100%', height:160, position:'relative', overflow:'hidden', background:`linear-gradient(135deg,${f.color}08,rgba(8,11,16,0.95))`, borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
            {images[current] ? (
              <img src={images[current]} alt={f.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            ) : (
              /* Mock dashboard */
              <div style={{ padding:12, height:'100%', display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2 }}>
                  {['#EF4444','#F59E0B','#10B981'].map((c,i)=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:c }}/>)}
                  <span style={{ fontSize:8, color:'#64748B', marginLeft:6, fontFamily:'inherit' }}>XPLORIX › {f.title}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                  {f.kv.map((v,i)=>(
                    <div key={i} style={{ background:`${f.color}10`, border:`1px solid ${f.color}20`, borderRadius:6, padding:'6px 8px' }}>
                      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, fontWeight:700, color:f.color }}>{v}</div>
                      <div style={{ fontSize:8, color:'#64748B', marginTop:1 }}>{f.kl[i]}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:36, flex:1 }}>
                  {f.bars.map((h,i)=>(
                    <div key={i} style={{ flex:1, height:`${h}%`, borderRadius:'2px 2px 0 0', background:i>=12?f.color:`${f.color}35` }}/>
                  ))}
                </div>
              </div>
            )}
            {/* Upload button */}
            <label style={{ position:'absolute', bottom:8, right:8, display:'flex', alignItems:'center', gap:4, padding:'3px 8px', background:'rgba(8,11,16,0.75)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, cursor:'pointer', zIndex:3, fontSize:9, color:'rgba(255,255,255,0.4)' }}
              onClick={e=>e.stopPropagation()}>
              + Screenshot
              <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleImg}/>
            </label>
          </div>

          {/* Content */}
          <div style={{ padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'3px 10px', borderRadius:20, background:`${f.color}12`, border:`1px solid ${f.color}25`, fontSize:10, fontWeight:700, color:f.color }}>
                {f.icon} {f.title}
              </div>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:7, background:`${f.color}12`, border:`1px solid ${f.color}25`, color:f.color }}>{f.stat}</div>
            </div>
            <div style={{ fontSize:11, color:'#94A3B8', lineHeight:1.5, marginBottom:10 }}>{f.desc}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              {f.pts.map((p,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#94A3B8' }}>
                  <span style={{ color:f.color, fontSize:10, flexShrink:0 }}>✓</span>{p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:12 }}>
        {features.map((_,i)=>(
          <div key={i} onClick={()=>{goTo(i);setPaused(true)}} style={{ width:i===current?22:6, height:6, borderRadius:3, background:i===current?f.color:'rgba(255,255,255,0.15)', cursor:'pointer', transition:'all 0.25s' }}/>
        ))}
      </div>
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number|null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [typeIndex, setTypeIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const typingWords = ['Reimagined.','Simplified.','Optimized.','Digitized.']

  useEffect(()=>{
    const word = typingWords[typeIndex]
    let t: ReturnType<typeof setTimeout>
    if (!isDeleting) {
      if (displayText.length < word.length) t = setTimeout(()=>setDisplayText(word.slice(0,displayText.length+1)),80)
      else t = setTimeout(()=>setIsDeleting(true),2000)
    } else {
      if (displayText.length > 0) t = setTimeout(()=>setDisplayText(displayText.slice(0,-1)),40)
      else { setIsDeleting(false); setTypeIndex((typeIndex+1)%typingWords.length) }
    }
    return ()=>clearTimeout(t)
  },[displayText,isDeleting,typeIndex])

  useEffect(()=>{
    const h = ()=>setScrolled(window.scrollY>40)
    window.addEventListener('scroll',h)
    return ()=>window.removeEventListener('scroll',h)
  },[])

  const navLinks = [
    {label:'About',href:'#about'},{label:'Platform',href:'#features'},
    {label:'How it Works',href:'#how'},{label:'AI Insights',href:'#ai'},
    {label:'Industries',href:'#industries'},{label:'Contact',href:'#contact'},
  ]

  const howItWorks = [
    {step:'01',icon:'🔐',color:'#F97316',side:'left', title:'Register & Get Instant Access',  desc:'Create your company account and get Admin and Supervisor logins in minutes. Full platform access from day one — no contracts, no IT setup.',badges:[{t:'⏱ 5 min setup',c:'o'},{t:'✓ 15-day trial',c:'g'}],feats:['Admin + Supervisor + Driller roles','15-day trial, no credit card']},
    {step:'02',icon:'⚙️',color:'#3B82F6',side:'right',title:'Build Your Master Data',          desc:'Create Project, Rig and Bit IDs. Upload Costing and Inventory master data via CSV files — operation structure ready instantly.',badges:[{t:'📁 CSV upload',c:'b'},{t:'⚡ Instant sync',c:'o'}], feats:['Project, Rig & Bit configuration','Inventory catalogue bulk import']},
    {step:'03',icon:'📋',color:'#10B981',side:'left', title:'Go Live on Day One',              desc:'Supervisors log daily drill shifts immediately. Every meter, bit and downtime captured digitally. Full tracking from your very first log.',badges:[{t:'✓ Zero training',c:'g'},{t:'📋 Replaces paper',c:'o'}],feats:['Digital shift log on any device','Auto cost & productivity calc']},
    {step:'04',icon:'🧠',color:'#8B5CF6',side:'right',title:'Unlock Full Intelligence',        desc:'The moment your first log is submitted, XPLORIX AI activates. Advanced analytics, predictive insights, performance reports — all automatic.',badges:[{t:'🧠 AI live',c:'p'},{t:'📊 9 dashboards',c:'o'}],feats:['AI predicts failures automatically','9 analytics dashboards live']},
  ]

  const aiInsights = [
    {type:'warning',icon:'⚠️',rig:'RIG-003',title:'Hydraulic Anomaly',       desc:'Pressure fluctuation matches pre-failure. Inspect within 48hrs.',         time:'2 min ago', badge:'Predictive Alert',color:'#F59E0B'},
    {type:'success',icon:'📈',rig:'RIG-001',title:'ROP Optimisation Found',   desc:'Drilling at 72 bar improves ROP by 14% in medium formation.',             time:'15 min ago',badge:'Performance Tip', color:'#10B981'},
    {type:'info',   icon:'💰',rig:'All Rigs',title:'Cost Per Meter Opportunity',desc:'NQ SR-08 bits on RIG-004 could reduce bit cost/m by 22%.',              time:'1 hr ago',  badge:'Cost Insight',    color:'#3B82F6'},
    {type:'danger', icon:'🚨',rig:'Site B',  title:'Fuel Spike Detected',      desc:'31% above 30-day baseline. Possible compressor inefficiency.',           time:'3 hrs ago', badge:'Anomaly',          color:'#EF4444'},
  ]

  const plans = [
    {name:'Standard Plan', icon:'🏗',billing:'Monthly Billing',           highlight:false,badge:'',             coreLabel:'CORE FEATURES',               feats:['Advanced digital logging','Fleet performance dashboard','Usage analytics & reporting','Unlimited supervisor logins','AI Insights for analysis','Secure cloud data storage','Standard onboarding support','Email support (business hours)']},
    {name:'Growth Plan',   icon:'📈',billing:'Half-Yearly — 8% Savings',  highlight:true, badge:'★ MOST POPULAR',coreLabel:'EVERYTHING IN STANDARD, PLUS:', feats:['24/7 Priority Support','On-site Training for Teams','Advanced performance analytics','Trend forecasting & insights','Faster data refresh rates','Detailed downloadable reports','Priority feature updates']},
    {name:'Enterprise Plan',icon:'💎',billing:'Annual — 16% Savings',     highlight:false,badge:'💎 BEST VALUE', coreLabel:'EVERYTHING IN GROWTH, PLUS:',  feats:['Dedicated Account Manager','On-Site Training & Implementation','Custom Feature Development','Enterprise-grade analytics','API integrations','Branding options','Highest system priority','Advanced security & compliance']},
  ]

  const faqs = [
    {q:'How long to set up XPLORIX?',        a:'Most companies are fully operational within 24-48 hours. Our onboarding team guides you through every step.'},
    {q:'Do drillers need training?',          a:'The drill log forms are intuitive — most drillers are comfortable after one shift. We provide video walkthroughs and live support.'},
    {q:'Can XPLORIX work offline?',           a:'Yes. The drilling log works offline and automatically syncs when connectivity is restored. Perfect for remote sites.'},
    {q:'How is our data kept secure?',        a:'All data is encrypted in transit and at rest. Each company has completely isolated data. We follow enterprise security standards.'},
    {q:'Can I export data to Excel or PDF?',  a:'All reports, dashboards and drill logs can be exported. Drillers can also download performance certificates directly.'},
    {q:'Multiple projects and sites?',        a:'Yes. XPLORIX is built for multi-site, multi-project operations with unlimited projects and rigs.'},
    {q:'What drilling types are supported?',  a:'Diamond Core, RC, Blast Hole, Geotechnical and other exploration drilling types.'},
    {q:'How does pricing work?',              a:'Pricing is customised based on fleet size and features. Contact our team — most companies find XPLORIX pays for itself within the first month.'},
  ]

  const bs = (c:string) => {
    const map:Record<string,string[]> = {
      o:['rgba(249,115,22,0.08)','rgba(249,115,22,0.2)','#F97316'],
      g:['rgba(16,185,129,0.08)','rgba(16,185,129,0.2)','#10B981'],
      b:['rgba(59,130,246,0.08)','rgba(59,130,246,0.2)','#60A5FA'],
      p:['rgba(139,92,246,0.08)','rgba(139,92,246,0.2)','#A78BFA'],
      n:['rgba(255,255,255,0.04)','#1E293B','#64748B'],
    }
    const [bg,border,color] = map[c]||map.n
    return {background:bg,border:`1px solid ${border}`,color,fontSize:10,fontWeight:600 as const,padding:'3px 9px',borderRadius:6}
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#080B10', color:'#F8FAFC', overflowX:'hidden', maxWidth:'100vw' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#080B10;}::-webkit-scrollbar-thumb{background:linear-gradient(#F97316,#3B82F6);border-radius:2px;}
        @keyframes xplPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}
        @keyframes xplFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .syne{font-family:'Syne',sans-serif!important;}
        .mono{font-family:'JetBrains Mono',monospace!important;}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:700;font-size:15px;font-family:'DM Sans',sans-serif;box-shadow:0 4px 30px rgba(249,115,22,0.35);transition:all 0.3s;text-decoration:none;}
        .btn-primary:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(249,115,22,0.5);}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#F8FAFC;font-weight:600;font-size:15px;font-family:'DM Sans',sans-serif;transition:all 0.3s;text-decoration:none;}
        .btn-ghost:hover{background:rgba(255,255,255,0.08);transform:translateY(-2px);}
        .nav-link{color:#94A3B8;text-decoration:none;font-size:14px;font-weight:500;transition:all 0.2s;position:relative;}
        .nav-link:hover{color:#F8FAFC;}
        @media(max-width:768px){
          .hero-grid,.about-grid,.ai-grid,.contact-grid{grid-template-columns:1fr!important;}
          .hero-right{display:none!important;}
          .ind-grid,.plans-grid{grid-template-columns:1fr!important;}
          .footer-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:900,padding:'14px 60px',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all 0.3s',background:scrolled?'rgba(8,11,16,0.97)':'rgba(8,11,16,0.6)',backdropFilter:'blur(24px)',borderBottom:scrolled?'1px solid rgba(249,115,22,0.1)':'1px solid transparent' }}>
        <a href="/" style={{ display:'flex',alignItems:'center',gap:12,textDecoration:'none' }}>
          <XLogo size={36}/>
          <div>
            <div className="syne" style={{ fontSize:15,fontWeight:700,color:'#F8FAFC',letterSpacing:'0.06em' }}>XPLORIX</div>
            <div style={{ fontSize:7,color:'#64748B',letterSpacing:'0.2em',textTransform:'uppercase' }}>Drilling Intelligence</div>
          </div>
        </a>
        <div style={{ display:'flex',gap:28 }}>
          {navLinks.map(n=><a key={n.href} href={n.href} className="nav-link">{n.label}</a>)}
        </div>
        <div style={{ display:'flex',gap:12,alignItems:'center' }}>
          <Link href="/auth/login" className="nav-link">Sign in</Link>
          <a href="#contact" className="btn-primary" style={{ padding:'9px 20px',fontSize:13,borderRadius:10 }}>Schedule Demo</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh',display:'flex',alignItems:'center',padding:'120px 60px 60px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(249,115,22,0.08) 0%,transparent 60%),#080B10' }}/>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(30,41,59,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(30,41,59,0.1) 1px,transparent 1px)',backgroundSize:'60px 60px',WebkitMaskImage:'radial-gradient(ellipse 100% 80% at 50% 0%,black 0%,transparent 70%)' }}/>
        <div className="hero-grid" style={{ position:'relative',zIndex:2,width:'100%',maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }}>
          <div>
            <SR anim="dropDown">
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:100,border:'1px solid rgba(249,115,22,0.3)',background:'rgba(249,115,22,0.06)',fontSize:11,fontWeight:700,color:'#F97316',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:28 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'#F97316',display:'inline-block',animation:'xplPulse 1.5s infinite' }}/>
                Live · AI Drilling Intelligence V3.0
              </div>
            </SR>
            <SR anim="slideLeft" delay={100}>
              <h1 className="syne" style={{ fontSize:'clamp(44px,5.5vw,72px)',lineHeight:1.0,fontWeight:900,marginBottom:8,letterSpacing:'-0.02em' }}>
                Drilling Intelligence<br/>
                <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>{displayText}</span>
                <span style={{ borderRight:'3px solid #F97316',marginLeft:2,animation:'xplPulse 1s infinite' }}/>
              </h1>
            </SR>
            <SR anim="riseUp" delay={200}>
              <p style={{ fontSize:16,lineHeight:1.8,color:'#94A3B8',maxWidth:500,marginBottom:32,marginTop:14 }}>
                AI-powered performance intelligence for exploration drilling — real-time analytics, digital logging, and smarter decisions. Built for the toughest operations on earth.
              </p>
            </SR>
            <SR anim="riseUp" delay={300}>
              <div style={{ display:'flex',gap:12,flexWrap:'wrap',marginBottom:32 }}>
                <a href="#contact" className="btn-primary">Schedule Demo →</a>
                <a href="#features" className="btn-ghost">▷ Explore Platform</a>
              </div>
            </SR>
            <SR anim="riseUp" delay={400}>
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ display:'flex' }}>
                  {['#F97316','#3B82F6','#10B981','#8B5CF6','#F59E0B'].map((c,i)=>(
                    <div key={i} style={{ width:30,height:30,borderRadius:'50%',background:c,border:'2px solid #080B10',marginLeft:i===0?0:-7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',boxShadow:`0 0 10px ${c}50` }}>
                      {['JW','PN','AA','MK','RT'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex',gap:1,marginBottom:1 }}>{[1,2,3,4,5].map(i=><span key={i} style={{ color:'#F59E0B',fontSize:11 }}>★</span>)}</div>
                  <div style={{ fontSize:11,color:'#64748B' }}><span style={{ color:'#F8FAFC',fontWeight:600 }}>30+ companies</span> trust XPLORIX</div>
                </div>
              </div>
            </SR>
          </div>
          <div className="hero-right" style={{ animation:'xplFloat 6s ease-in-out infinite' }}>
            <EcosystemDiagram/>
          </div>
        </div>
      </section>

      {/* ── AI TICKER ── */}
      <SR anim="slideLeft"><AITicker/></SR>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding:'80px 5vw' }}>
        <SR anim="flipX">
          <div className="about-grid" style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:80,alignItems:'center' }}>
            <div>
              <Tag>About Xplorix</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,lineHeight:1.1,marginBottom:18,letterSpacing:'-0.02em' }}>
                Performance intelligence for <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>exploration drilling.</span>
              </h2>
              <p style={{ fontSize:13,color:'#94A3B8',lineHeight:1.8,marginBottom:14 }}>
                Xplorix is built for drilling contractors who are tired of managing operations on spreadsheets, paper logs and WhatsApp groups.
              </p>
              <p style={{ fontSize:13,color:'#94A3B8',lineHeight:1.8,marginBottom:28 }}>
                We replace your entire paper-based workflow with a single intelligent platform — real-time visibility, AI-powered insights, and data-driven decisions across every rig and site.
              </p>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                {['Real-time visibility','AI-powered','Zero paperwork','Multi-site ready','Mobile first'].map(pill=>(
                  <span key={pill} style={{ padding:'5px 12px',borderRadius:20,background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',color:'#F97316',fontSize:11,fontWeight:600 }}>{pill}</span>
                ))}
              </div>
            </div>
            <TiltCard style={{ borderRadius:18,overflow:'hidden',border:'1px solid #1E293B',boxShadow:'0 40px 80px rgba(0,0,0,0.4)',background:'#0D1117',position:'relative' }}>
              <video src="/videos/1st vedio.mp4" autoPlay muted loop playsInline style={{ width:'100%',display:'block' }}/>
              <div style={{ position:'absolute',top:10,left:10,display:'flex',alignItems:'center',gap:6,padding:'4px 9px',background:'rgba(8,11,16,0.85)',borderRadius:7,border:'1px solid #1E293B',backdropFilter:'blur(10px)' }}>
                <span style={{ width:5,height:5,borderRadius:'50%',background:'#EF4444',display:'inline-block',animation:'xplPulse 1.5s infinite' }}/>
                <span style={{ fontSize:9,fontWeight:700,color:'#F8FAFC' }}>LIVE DEMO</span>
              </div>
            </TiltCard>
          </div>
        </SR>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background:'#0D1117',padding:'70px 5vw',borderTop:'1px solid rgba(249,115,22,0.06)' }}>
        <SR anim="zoomDeep">
          <div style={{ maxWidth:1200,margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:44 }}>
              <Tag>How It Works</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,letterSpacing:'-0.02em' }}>
                From signup to full <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>intelligence</span> in 30 min.
              </h2>
              <p style={{ fontSize:13,color:'#64748B',marginTop:8 }}>Four steps — no IT team, no spreadsheets, no paper.</p>
            </div>
            <div style={{ position:'relative',maxWidth:840,margin:'0 auto' }}>
              <div style={{ position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'linear-gradient(180deg,transparent,rgba(249,115,22,0.3) 5%,rgba(249,115,22,0.3) 95%,transparent)',transform:'translateX(-50%)',zIndex:0 }}/>
              {howItWorks.map((step,i)=>(
                <SR key={i} anim={step.side==='left'?'slideLeft':'slideRight'} delay={i*100}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 52px 1fr',marginBottom:28,position:'relative',zIndex:1 }}>
                    {step.side==='left' ? (
                      <TiltCard>
                        <div style={{ padding:'16px 20px',background:'rgba(255,255,255,0.02)',border:'1px solid #1E293B',borderRadius:14,position:'relative',overflow:'hidden',marginRight:22 }}>
                          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${step.color},transparent)` }}/>
                          <div style={{ fontSize:9,fontWeight:700,color:step.color,letterSpacing:'0.18em',textTransform:'uppercase' as const,marginBottom:4 }}>STEP {step.step}</div>
                          <div className="syne" style={{ fontSize:13,fontWeight:700,color:'#F8FAFC',marginBottom:5,lineHeight:1.2 }}>{step.title}</div>
                          <div style={{ fontSize:12,color:'#94A3B8',lineHeight:1.6,marginBottom:8 }}>{step.desc}</div>
                          <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:7 }}>
                            {step.badges.map((b,bi)=><span key={bi} style={bs(b.c)}>{b.t}</span>)}
                          </div>
                          {step.feats.map((f,fi)=>(
                            <div key={fi} style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#64748B',marginBottom:3 }}>
                              <span style={{ width:3,height:3,borderRadius:'50%',background:step.color,display:'inline-block',flexShrink:0 }}/>{f}
                            </div>
                          ))}
                        </div>
                      </TiltCard>
                    ) : <div/>}
                    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',position:'relative' }}>
                      <div style={{ width:44,height:44,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:`2px solid ${step.color}`,background:`${step.color}12`,position:'relative',zIndex:2,marginTop:8,boxShadow:`0 0 20px ${step.color}35` }}>{step.icon}</div>
                      <div style={{ position:'absolute',top:-8,fontSize:60,fontWeight:900,fontFamily:'Syne,sans-serif',color:`${step.color}06`,lineHeight:1,pointerEvents:'none' }}>{step.step}</div>
                    </div>
                    {step.side==='right' ? (
                      <TiltCard>
                        <div style={{ padding:'16px 20px',background:'rgba(255,255,255,0.02)',border:'1px solid #1E293B',borderRadius:14,position:'relative',overflow:'hidden',marginLeft:22 }}>
                          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${step.color},transparent)` }}/>
                          <div style={{ fontSize:9,fontWeight:700,color:step.color,letterSpacing:'0.18em',textTransform:'uppercase' as const,marginBottom:4 }}>STEP {step.step}</div>
                          <div className="syne" style={{ fontSize:13,fontWeight:700,color:'#F8FAFC',marginBottom:5,lineHeight:1.2 }}>{step.title}</div>
                          <div style={{ fontSize:12,color:'#94A3B8',lineHeight:1.6,marginBottom:8 }}>{step.desc}</div>
                          <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:7 }}>
                            {step.badges.map((b,bi)=><span key={bi} style={bs(b.c)}>{b.t}</span>)}
                          </div>
                          {step.feats.map((f,fi)=>(
                            <div key={fi} style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#64748B',marginBottom:3 }}>
                              <span style={{ width:3,height:3,borderRadius:'50%',background:step.color,display:'inline-block',flexShrink:0 }}/>{f}
                            </div>
                          ))}
                        </div>
                      </TiltCard>
                    ) : <div/>}
                  </div>
                </SR>
              ))}
            </div>
            <div style={{ textAlign:'center',marginTop:20 }}>
              <a href="#contact" className="btn-primary" style={{ fontSize:13,padding:'10px 22px' }}>Start Your Free Trial →</a>
            </div>
          </div>
        </SR>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'80px 5vw' }}>
        <SR anim="unfold">
          <div style={{ maxWidth:900,margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:32 }}>
              <Tag>Platform</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,letterSpacing:'-0.02em' }}>
                Everything your operation needs — <span style={{ background:'linear-gradient(135deg,#3B82F6,#60A5FA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>one platform.</span>
              </h2>
              <p style={{ fontSize:14,color:'#64748B',marginTop:10,marginBottom:8 }}>Click any card to pause · Use arrows or dots to navigate · Upload real screenshots with "+ Screenshot"</p>
            </div>
            <FeaturesSection/>
          </div>
        </SR>
      </section>

      {/* ── AI INSIGHTS ── */}
      <section id="ai" style={{ background:'#0D1117',padding:'80px 5vw',borderTop:'1px solid rgba(249,115,22,0.06)' }}>
        <SR anim="slideRight">
          <div className="ai-grid" style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center' }}>
            <div>
              <Tag>AI-Powered Insights</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,lineHeight:1.1,marginBottom:16,letterSpacing:'-0.02em' }}>
                Intelligence that <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>acts</span> before you <span style={{ background:'linear-gradient(135deg,#3B82F6,#60A5FA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>ask.</span>
              </h2>
              <p style={{ fontSize:13,color:'#94A3B8',lineHeight:1.7,marginBottom:24 }}>
                XPLORIX AI monitors every data point from every rig, every shift — detecting anomalies, predicting failures and delivering daily recommendations automatically.
              </p>
              {[
                {icon:'🔮',title:'Predictive Failure Detection',     desc:'Identifies equipment failure patterns before they cause downtime'},
                {icon:'💡',title:'Daily Performance Recommendations', desc:'Automated shift summaries with specific actionable improvements'},
                {icon:'💰',title:'Cost Optimisation Engine',         desc:'Continuously finds cost-per-meter savings across rigs and formations'},
              ].map((f,i)=>(
                <TiltCard key={i}>
                  <div style={{ display:'flex',gap:12,padding:'12px 14px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:11,marginBottom:8 }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.25)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)'}>
                    <span style={{ fontSize:20,flexShrink:0 }}>{f.icon}</span>
                    <div>
                      <div className="syne" style={{ fontSize:13,fontWeight:700,color:'#F8FAFC',marginBottom:3 }}>{f.title}</div>
                      <div style={{ fontSize:11,color:'#94A3B8',lineHeight:1.5 }}>{f.desc}</div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <div style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4 }}>Live AI Insights Feed</div>
              {aiInsights.map((insight,i)=>(
                <TiltCard key={i}>
                  <div style={{ padding:14,borderRadius:14,background:`${insight.color}08`,border:`1px solid ${insight.color}25` }}>
                    <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:7 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                        <span style={{ fontSize:14 }}>{insight.icon}</span>
                        <div>
                          <div className="syne" style={{ fontSize:12,fontWeight:700,color:'#F8FAFC' }}>{insight.title}</div>
                          <div style={{ fontSize:10,color:'#64748B' }}>{insight.rig} · {insight.time}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:5,background:`${insight.color}20`,color:insight.color,border:`1px solid ${insight.color}30`,whiteSpace:'nowrap',flexShrink:0,marginLeft:8 }}>{insight.badge}</span>
                    </div>
                    <p style={{ fontSize:11,color:'#94A3B8',lineHeight:1.6 }}>{insight.desc}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </SR>
      </section>

      {/* ── INDUSTRIES ── */}
      <section id="industries" style={{ padding:'80px 5vw' }}>
        <SR anim="dropDown">
          <div style={{ maxWidth:1200,margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:52 }}>
              <h2 className="syne" style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,letterSpacing:'-0.02em' }}>
                Built for the toughest <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>operations on earth.</span>
              </h2>
            </div>
            <div className="ind-grid" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16 }}>
              {[
                {icon:'⛏',title:'Mining',               desc:'End-to-end visibility for surface & underground mining.',    color:'#F97316'},
                {icon:'🔩',title:'Exploration Drilling', desc:'Built for diamond core & RC operations in remote environments.',color:'#3B82F6'},
                {icon:'🏔',title:'Geotechnical',         desc:'Track investigation programs at scale with full visibility.',  color:'#10B981'},
                {icon:'💥',title:'Blast Hole Drilling',  desc:'Productivity intelligence for high-volume production.',        color:'#8B5CF6'},
              ].map((ind,i)=>(
                <SR key={i} anim="riseUp" delay={i*100}>
                  <TiltCard style={{ background:'rgba(13,17,23,0.8)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:'22px 18px',cursor:'pointer',height:'100%',transition:'border-color 0.3s' }}
                    className="glow-card">
                    <div style={{ width:42,height:42,borderRadius:11,background:`${ind.color}15`,border:`1px solid ${ind.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:12,boxShadow:`0 4px 16px ${ind.color}20` }}>{ind.icon}</div>
                    <h3 className="syne" style={{ fontSize:14,fontWeight:700,color:'#F8FAFC',marginBottom:7 }}>{ind.title}</h3>
                    <p style={{ fontSize:12,color:'#94A3B8',lineHeight:1.6,marginBottom:12 }}>{ind.desc}</p>
                    <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:9,color:'#64748B',fontWeight:700,letterSpacing:'0.08em' }}>
                      <div style={{ width:14,height:2,background:`linear-gradient(90deg,${ind.color},transparent)`,borderRadius:1 }}/>LIVE DEPLOYMENTS
                    </div>
                  </TiltCard>
                </SR>
              ))}
            </div>
          </div>
        </SR>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background:'#0D1117',padding:'80px 5vw',borderTop:'1px solid rgba(249,115,22,0.06)' }}>
        <SR anim="flipY">
          <div style={{ maxWidth:1200,margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:44 }}>
              <Tag>Pricing</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,marginBottom:10,letterSpacing:'-0.02em' }}>
                XPLORIX <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Plans</span>
              </h2>
              <p style={{ fontSize:14,color:'#64748B' }}>Powerful insights. Smarter operations. Maximum uptime.</p>
            </div>
            <div className="plans-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginBottom:24 }}>
              {plans.map((plan,i)=>(
                <SR key={i} anim="riseUp" delay={i*100}>
                  <TiltCard style={{ background:plan.highlight?'rgba(249,115,22,0.04)':'rgba(8,11,16,0.8)',border:plan.highlight?'2px solid rgba(249,115,22,0.4)':'1px solid rgba(255,255,255,0.06)',borderRadius:17,padding:26,position:'relative',height:'100%',display:'flex',flexDirection:'column' }}>
                    {plan.badge && <div style={{ position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(30,41,59,0.9)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 14px',borderRadius:20,whiteSpace:'nowrap' }}>{plan.badge}</div>}
                    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                      <div style={{ width:42,height:42,borderRadius:11,background:plan.highlight?'rgba(249,115,22,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${plan.highlight?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>{plan.icon}</div>
                      <div>
                        <div className="syne" style={{ fontSize:15,fontWeight:800,color:'#F8FAFC' }}>{plan.name}</div>
                        <div style={{ fontSize:10,color:plan.highlight?'#F97316':'#64748B',marginTop:1 }}>{plan.billing}</div>
                      </div>
                    </div>
                    <div style={{ padding:'10px 12px',background:'rgba(249,115,22,0.05)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:9,marginBottom:14,textAlign:'center' }}>
                      <div style={{ fontSize:12,fontWeight:700,color:'#F97316' }}>Contact Us for Pricing</div>
                      <div style={{ fontSize:10,color:'#64748B',marginTop:1 }}>Tailored to your fleet size</div>
                    </div>
                    <div style={{ fontSize:9,fontWeight:700,color:plan.highlight?'#F97316':'#64748B',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:9 }}>{plan.coreLabel}</div>
                    <div style={{ flex:1,display:'flex',flexDirection:'column',gap:5 }}>
                      {plan.feats.map((f,fi)=>(
                        <div key={fi} style={{ display:'flex',alignItems:'flex-start',gap:6,fontSize:11,color:'#94A3B8',lineHeight:1.4 }}>
                          <span style={{ color:plan.highlight?'#F97316':'#10B981',fontSize:11,flexShrink:0,marginTop:1 }}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                    <a href="#contact" style={{ display:'block',textAlign:'center',marginTop:18,padding:'9px',borderRadius:9,background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(255,255,255,0.04)',border:plan.highlight?'none':'1px solid rgba(255,255,255,0.08)',color:plan.highlight?'#fff':'#94A3B8',fontSize:12,fontWeight:700,textDecoration:'none',transition:'all 0.2s' }}>
                      Get Started →
                    </a>
                  </TiltCard>
                </SR>
              ))}
            </div>
            <div style={{ padding:'18px 24px',background:'rgba(249,115,22,0.04)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
              <div>
                <div className="syne" style={{ fontSize:14,fontWeight:700,color:'#F8FAFC' }}>Get a personalised quote for your operation</div>
                <div style={{ fontSize:11,color:'#64748B',marginTop:2 }}>Most companies find XPLORIX pays for itself within the first month</div>
              </div>
              <a href="#contact" className="btn-primary" style={{ fontSize:13,padding:'9px 20px' }}>Contact Us for Pricing →</a>
            </div>
          </div>
        </SR>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding:'80px 5vw' }}>
        <SR anim="spinIn">
          <div style={{ maxWidth:760,margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:40 }}>
              <Tag>FAQ</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(26px,2.8vw,38px)',fontWeight:800,letterSpacing:'-0.02em' }}>
                Common <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>questions answered.</span>
              </h2>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
              {faqs.map((faq,i)=>(
                <SR key={i} anim="slideLeft" delay={i*50}>
                  <div style={{ background:'rgba(13,17,23,0.8)',border:`1px solid ${activeFaq===i?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.06)'}`,borderRadius:12,overflow:'hidden',transition:'border-color 0.2s' }}>
                    <button onClick={()=>setActiveFaq(activeFaq===i?null:i)}
                      style={{ width:'100%',padding:'15px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',color:'#F8FAFC',fontSize:13,fontWeight:600,textAlign:'left',gap:12,fontFamily:'DM Sans,sans-serif' }}>
                      <span>{faq.q}</span>
                      <span style={{ color:activeFaq===i?'#F97316':'#64748B',fontSize:18,flexShrink:0,transition:'transform 0.3s',transform:activeFaq===i?'rotate(45deg)':'none' }}>+</span>
                    </button>
                    {activeFaq===i && <div style={{ padding:'0 18px 14px',fontSize:13,color:'#94A3B8',lineHeight:1.7 }}>{faq.a}</div>}
                  </div>
                </SR>
              ))}
            </div>
          </div>
        </SR>
      </section>

      {/* ── CTA + CONTACT ── */}
      <section id="contact" style={{ padding:'80px 5vw',background:'radial-gradient(ellipse 80% 60% at 50% 100%,rgba(249,115,22,0.06) 0%,transparent 60%),#080B10',borderTop:'1px solid rgba(249,115,22,0.06)' }}>
        <SR anim="riseUp">
          <div className="contact-grid" style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:72,alignItems:'start' }}>
            <div>
              <Tag>Get Started</Tag>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 16px',borderRadius:9,background:'rgba(249,115,22,0.06)',border:'1px solid rgba(249,115,22,0.2)',marginBottom:16 }}>
                <span style={{ fontSize:16 }}>⛏</span>
                <span className="syne" style={{ fontSize:13,fontWeight:700,color:'#F97316',fontStyle:'italic' }}>"Built by drillers, for drillers."</span>
              </div>
              <h2 className="syne" style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,lineHeight:1.1,marginBottom:14,letterSpacing:'-0.02em' }}>
                Transform your drilling with <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>AI.</span>
              </h2>
              <p style={{ fontSize:14,color:'#94A3B8',lineHeight:1.7,marginBottom:28 }}>
                Book a personalised 15-minute walkthrough. We'll show you how teams cut downtime, boost productivity and digitise drill logs in under 30 days.
              </p>
              {[
                {icon:'🌍',title:'Deployed across 30+ countries',  sub:'Global infrastructure, local support teams'},
                {icon:'⚡',title:'Live in under 30 minutes',        sub:'No IT team needed — just your login'},
                {icon:'🛡',title:'Enterprise security & SSO',       sub:'SOC 2 compliant, end-to-end encrypted'},
                {icon:'🤖',title:'AI insights from day one',        sub:'No training — insights start immediately'},
              ].map((pt,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
                  <div style={{ width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>{pt.icon}</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:'#F8FAFC' }}>{pt.title}</div>
                    <div style={{ fontSize:11,color:'#64748B',marginTop:1 }}>{pt.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <TiltCard>
              <div style={{ background:'rgba(13,17,23,0.9)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:28,position:'relative',overflow:'hidden' }}>
                <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#F97316,#F59E0B,#3B82F6)' }}/>
                <div className="syne" style={{ fontSize:15,fontWeight:700,color:'#F8FAFC',marginBottom:20 }}>Book a Free Demo</div>
                {[
                  [{label:'Name',ph:'Jane Doe',type:'text'},{label:'Company',ph:'Acme Drilling Co.',type:'text'}],
                  [{label:'Email',ph:'jane@acme.com',type:'email'},{label:'Phone',ph:'+1 555 000 1234',type:'tel'}],
                ].map((row,ri)=>(
                  <div key={ri} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                    {row.map((f,fi)=>(
                      <div key={fi} style={{ marginBottom:10 }}>
                        <label style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:5 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.ph} style={{ width:'100%',padding:'10px 12px',borderRadius:9,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none' }}
                          onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.08)'}}
                          onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';e.target.style.boxShadow=''}}/>
                      </div>
                    ))}
                  </div>
                ))}
                {[
                  {label:'Country',opts:['Australia','United States','India','Canada','Saudi Arabia','South Africa','United Kingdom','Other']},
                  {label:'Role',   opts:['Operations Manager','Drilling Supervisor','Project Manager','CEO / Director','IT / Admin','Other']},
                ].map((f,i)=>(
                  <div key={i} style={{ marginBottom:10 }}>
                    <label style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:5 }}>{f.label}</label>
                    <select style={{ width:'100%',padding:'10px 12px',borderRadius:9,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(13,17,23,0.9)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none',cursor:'pointer',appearance:'none' as const }}
                      onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.5)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)'}}>
                      {f.opts.map(o=><option key={o} style={{ background:'#0D1117' }}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:5 }}>Message</label>
                  <textarea placeholder="Tell us about your fleet size..." rows={3}
                    style={{ width:'100%',padding:'10px 12px',borderRadius:9,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none',resize:'vertical' as const }}
                    onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.5)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)'}}/>
                </div>
                <div style={{ display:'flex',gap:9 }}>
                  <button className="btn-ghost" style={{ flex:1,justifyContent:'center',padding:'10px',fontSize:13 }}>Contact Sales</button>
                  <button className="btn-primary" style={{ flex:1,justifyContent:'center',padding:'10px',fontSize:13 }}>Book Demo →</button>
                </div>
                <p style={{ fontSize:10,color:'#64748B',textAlign:'center',marginTop:10 }}>By submitting, you agree to our terms & privacy policy.</p>
              </div>
            </TiltCard>
          </div>
        </SR>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0D1117',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'48px 5vw 24px' }}>
        <div className="footer-grid" style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:36,marginBottom:36 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:11,marginBottom:12 }}>
              <XLogo size={32}/>
              <div>
                <div className="syne" style={{ fontSize:14,fontWeight:800,color:'#F8FAFC' }}>XPLORIX</div>
                <div style={{ fontSize:8,color:'#64748B',letterSpacing:'0.15em',textTransform:'uppercase' }}>Drilling Intelligence</div>
              </div>
            </div>
            <p style={{ fontSize:12,color:'#64748B',lineHeight:1.7,maxWidth:220,marginBottom:14 }}>The world's most advanced drilling intelligence platform. Built for exploration drilling contractors who demand more.</p>
            <div style={{ display:'flex',gap:7 }}>
              {['L','T','Y'].map((s,i)=>(
                <div key={i} style={{ width:30,height:30,borderRadius:7,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#64748B',cursor:'pointer',transition:'all 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.4)';(e.currentTarget as HTMLElement).style.color='#F97316'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.color='#64748B'}}>{s}</div>
              ))}
            </div>
          </div>
          {[
            {title:'Product',    items:['Operations Dashboard','Maintenance Dashboard','Driller Performance','AI Insights','Inventory Management','Finance & Costing']},
            {title:'Company',    items:['About Us','Careers','Blog','Press','Partners','Contact Us']},
            {title:'Industries', items:['Mining','Exploration Drilling','Geotechnical','Blast Hole Drilling','RC Drilling','Diamond Core']},
          ].map((col,i)=>(
            <div key={i}>
              <div className="syne" style={{ fontSize:10,fontWeight:700,color:'#F8FAFC',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12 }}>{col.title}</div>
              {col.items.map(l=>(
                <div key={l} style={{ fontSize:12,color:'#64748B',marginBottom:7,cursor:'pointer',transition:'color 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:18,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:9 }}>
          <p style={{ fontSize:12,color:'#64748B' }}>© 2026 Xplorix. All rights reserved. Built with ❤️ for the drilling industry.</p>
          <div style={{ display:'flex',gap:18 }}>
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(l=>(
              <span key={l} style={{ fontSize:11,color:'#64748B',cursor:'pointer',transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

