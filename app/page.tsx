'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ── SCROLL REVEAL ─────────────────────────────────────────────────────────
type AnimType = 'flipX'|'flipY'|'zoomDeep'|'slideLeft'|'slideRight'|'riseUp'|'dropDown'|'spinIn'|'unfold'
const animDefs: Record<AnimType,{from:string;to:string}> = {
  flipX:     {from:'perspective(1000px) rotateX(-18deg) translateY(60px) scale(0.95)',to:'perspective(1000px) rotateX(0deg) translateY(0) scale(1)'},
  flipY:     {from:'perspective(1000px) rotateY(-25deg) translateX(-50px) scale(0.93)',to:'perspective(1000px) rotateY(0deg) translateX(0) scale(1)'},
  zoomDeep:  {from:'perspective(1000px) translateZ(-200px) scale(0.78)',to:'perspective(1000px) translateZ(0) scale(1)'},
  slideLeft: {from:'perspective(1000px) rotateY(-15deg) translateX(-80px) scale(0.94)',to:'perspective(1000px) rotateY(0deg) translateX(0) scale(1)'},
  slideRight:{from:'perspective(1000px) rotateY(15deg) translateX(80px) scale(0.94)',to:'perspective(1000px) rotateY(0deg) translateX(0) scale(1)'},
  riseUp:    {from:'perspective(1000px) rotateX(14deg) translateY(70px) scale(0.93)',to:'perspective(1000px) rotateX(0deg) translateY(0) scale(1)'},
  dropDown:  {from:'perspective(1000px) rotateX(-14deg) translateY(-70px) scale(0.93)',to:'perspective(1000px) rotateX(0deg) translateY(0) scale(1)'},
  spinIn:    {from:'perspective(1000px) rotateZ(-6deg) translateY(50px) scale(0.92)',to:'perspective(1000px) rotateZ(0deg) translateY(0) scale(1)'},
  unfold:    {from:'perspective(1000px) rotateX(-32deg) scaleY(0.65) translateY(30px)',to:'perspective(1000px) rotateX(0deg) scaleY(1) translateY(0)'},
}
function SR({children,anim='riseUp',delay=0,style={},className=''}:{children:React.ReactNode;anim?:AnimType;delay?:number;style?:React.CSSProperties;className?:string}) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(()=>{
    const o = new IntersectionObserver(([e])=>{if(e.isIntersecting) setTimeout(()=>setVis(true),delay)},{threshold:0.08,rootMargin:'0px 0px -40px 0px'})
    if(ref.current) o.observe(ref.current)
    return ()=>o.disconnect()
  },[delay])
  const a = animDefs[anim]
  return (
    <div ref={ref} className={className} style={{transform:vis?a.to:a.from,opacity:vis?1:0,transition:`transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, opacity 650ms ease ${delay}ms`,willChange:'transform,opacity',...style}}>
      {children}
    </div>
  )
}

// ── TILT CARD ─────────────────────────────────────────────────────────────
function TiltCard({children,style,className='',onMouseEnter,onMouseLeave}:{children:React.ReactNode;style?:React.CSSProperties;className?:string;onMouseEnter?:(e:React.MouseEvent<HTMLDivElement>)=>void;onMouseLeave?:(e:React.MouseEvent<HTMLDivElement>)=>void}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className={className}
      onMouseMove={e=>{if(!ref.current) return;const r=ref.current.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;ref.current.style.transform=`perspective(800px) rotateY(${x*8}deg) rotateX(${-y*8}deg) scale(1.02)`}}
      onMouseLeave={e=>{if(ref.current) ref.current.style.transform='perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';onMouseLeave?.(e)}}
      onMouseEnter={onMouseEnter}
      style={{transition:'transform 0.15s ease',transformStyle:'preserve-3d',...style}}>
      {children}
    </div>
  )
}

// ── LOGO ──────────────────────────────────────────────────────────────────
function XLogo({size=40}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="50,50 5,5 5,95" fill="#1a1a1a"/>
      <polygon points="50,50 5,5 30,5" fill="#2a2a2a"/>
      <polygon points="50,50 5,95 30,95" fill="#2a2a2a"/>
      <polygon points="50,50 95,5 95,95" fill="#F97316"/>
      <polygon points="50,50 95,5 70,5" fill="#EA580C"/>
      <polygon points="50,50 95,95 70,95" fill="#EA580C"/>
    </svg>
  )
}

// ── TAG ───────────────────────────────────────────────────────────────────
function Tag({children}:{children:React.ReactNode}) {
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:100,border:'1px solid rgba(249,115,22,0.25)',background:'rgba(249,115,22,0.05)',fontSize:10,fontWeight:700,color:'#F97316',letterSpacing:'0.15em',textTransform:'uppercase' as const,marginBottom:20}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:'#F97316',display:'inline-block',animation:'xplPulse 1.5s infinite'}}/>{children}
    </div>
  )
}

// ── AI TICKER ─────────────────────────────────────────────────────────────
function AITicker() {
  const items = [
    {text:'⚠ RIG-003 hydraulic anomaly detected — inspect within 48hrs',color:'#F59E0B'},
    {text:'📈 Pilbara Site ROP +23% above industry average this week',color:'#10B981'},
    {text:'💰 NQ SR-08 bits on RIG-004 could cut bit cost/m by 22%',color:'#60A5FA'},
    {text:'🚨 Fuel consumption 31% above 30-day baseline on Site B',color:'#EF4444'},
    {text:'✅ RIG-007 achieved 97.4% core recovery — best shift this month',color:'#10B981'},
    {text:'🔧 Hydraulic oil change due on RIG-002 in 14 operating hours',color:'#60A5FA'},
  ]
  return (
    <div style={{background:'#0D1117',borderTop:'1px solid #1E293B',borderBottom:'1px solid #1E293B',padding:'11px 0',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'0 20px',borderRight:'1px solid #1E293B',flexShrink:0,background:'#0D1117',zIndex:2}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#F97316',display:'inline-block',animation:'xplPulse 1.5s infinite'}}/>
          <span style={{fontSize:10,fontWeight:800,color:'#F97316',letterSpacing:'0.15em',textTransform:'uppercase',whiteSpace:'nowrap'}}>AI Live</span>
        </div>
        <div style={{overflow:'hidden',flex:1}}>
          <div style={{display:'flex',gap:48,animation:'tickerScroll 40s linear infinite',width:'max-content'}}>
            {[...items,...items].map((item,i)=>(
              <span key={i} style={{fontSize:12,fontWeight:500,color:item.color,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:8}}>
                {item.text}<span style={{width:4,height:4,borderRadius:'50%',background:'#1E293B',display:'inline-block'}}/>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ECOSYSTEM DIAGRAM ─────────────────────────────────────────────────────
function EcosystemDiagram() {
  const [activeNode, setActiveNode] = useState<string|null>(null)
  const nodes: Record<string,{icon:string;title:string;color:string;desc:string;feats:string[]}> = {
    ops:     {icon:'⚡',title:'Operations Dashboard',color:'#F97316',desc:'Live ROP trending, meters drilled, downtime analysis and bit performance.',feats:['Live ROP & downtime alerts','Meters drilled vs target','Bit performance & cost/m','Formation comparison']},
    maint:   {icon:'🔧',title:'Maintenance Dashboard',color:'#3B82F6',desc:'Component health and predictive maintenance.',feats:['Component failure analysis','MTBF by rig','Oil consumption trend','Maintenance cost tracking']},
    driller: {icon:'👷',title:'Driller & Crew',color:'#10B981',desc:'Individual driller leaderboard — 70+ drillers with search, sort and medals.',feats:['70+ driller leaderboard','ROP vs downtime scatter','Crew hours & utilisation','Performance radar']},
    consm:   {icon:'📦',title:'Consumables',color:'#8B5CF6',desc:'Full resource tracking — fuel, water, additives, accessories.',feats:['Fluid consumption breakdown','Accessories by cost rank','Inventory alerts','Supplier performance']},
    hsc:     {icon:'🛡',title:'HSC & Safety',color:'#EF4444',desc:'Incident tracking, PPE compliance, near-misses and training.',feats:['Incident type & severity','PPE compliance per item','Near-miss resolution','Safety training progress']},
    finance: {icon:'💰',title:'Finance & Costing',color:'#F59E0B',desc:'Full cost visibility per project, per rig, per meter.',feats:['Cost per meter live tracking','Master pricing data','Hole-by-hole breakdown','Multi-currency support']},
    logs:    {icon:'📋',title:'Digital Drill Logs',color:'#60A5FA',desc:'Supervisor shift log replacing all paper.',feats:['10h/12h shift toggle','Downtime tracking','Bit usage per hole','Incidents & attachments']},
    reports: {icon:'📄',title:'Performance Reports',color:'#EC4899',desc:'Verified 4-page PDF certificates for any driller or supervisor.',feats:['4-page PDF certificate','Career lifetime stats','Industry comparison','XPLORIX verified badge']},
    inv:     {icon:'🗄',title:'Inventory',color:'#10B981',desc:'Per-site stock with POs, auto-deduction and low-stock alerts.',feats:['Excel import/export','Per-site stock levels','Purchase orders','Auto stock deduction']},
    rigs:    {icon:'🔩',title:'Projects & Rigs',color:'#8B5CF6',desc:'Manage all projects and rigs across every site.',feats:['Multi-project management','Rig activation','Site assignment','Unlimited rigs']},
    users:   {icon:'👥',title:'User Management',color:'#06B6D4',desc:'Create and manage logins for all roles.',feats:['3 role types','Company isolation','Login credentials','Activity tracking']},
    notif:   {icon:'🔔',title:'Alerts',color:'#F59E0B',desc:'Real-time alerts for low stock, AI anomalies and approvals.',feats:['Low stock alerts','AI anomaly alerts','Maintenance reminders','PO delivery tracking']},
    currency:{icon:'💱',title:'Multi-Currency',color:'#EC4899',desc:'Switch currencies in real-time across the platform.',feats:['USD · INR · AUD','EUR · SAR','Live conversion','Finance integration']},
    ai:      {icon:'🧠',title:'AI Insights Engine',color:'#F97316',desc:'Monitors every data point, detects patterns, predicts failures.',feats:['Predictive failure detection','ROP optimisation tips','Cost/m opportunities','Daily summaries']},
  }
  const active = activeNode ? nodes[activeNode] : null
  return (
    <div style={{position:'relative',width:'100%',maxWidth:420,margin:'0 auto'}}>
      <svg viewBox="0 0 360 360" width="100%" style={{display:'block'}}>
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
        <circle cx="180" cy="180" r="36" fill="#080B10" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5"/>
        <circle className="epr1" cx="180" cy="180" r="30" fill="none" stroke="rgba(249,115,22,0.25)" strokeWidth="1"/>
        <circle className="epr2" cx="180" cy="180" r="30" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="1"/>
        <polygon points="180,180 158,158 158,202" fill="#2a2a2a"/>
        <polygon points="180,180 158,158 168,158" fill="#3a3a3a"/>
        <polygon points="180,180 158,202 168,202" fill="#3a3a3a"/>
        <polygon points="180,180 202,158 202,202" fill="#F97316"/>
        <polygon points="180,180 202,158 192,158" fill="#EA580C"/>
        <polygon points="180,180 202,202 192,202" fill="#EA580C"/>
        {([
          {id:'ops',cx:180,cy:108,color:'#F97316'},{id:'maint',cx:242,cy:142,color:'#3B82F6'},
          {id:'driller',cx:242,cy:218,color:'#10B981'},{id:'consm',cx:180,cy:252,color:'#8B5CF6'},
          {id:'hsc',cx:118,cy:218,color:'#EF4444'},{id:'finance',cx:118,cy:142,color:'#F59E0B'},
        ]).map(n=>(
          <g key={n.id} onClick={()=>setActiveNode(activeNode===n.id?null:n.id)} style={{cursor:'pointer'}}>
            <circle cx={n.cx} cy={n.cy} r="24" fill="#0D1117" stroke={activeNode===n.id?n.color:'#1E293B'} strokeWidth={activeNode===n.id?2:1}/>
            <text x={n.cx} y={n.cy-4} textAnchor="middle" fontSize="13" fill={n.color}>{nodes[n.id].icon}</text>
            <text x={n.cx} y={n.cy+10} textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="Inter,sans-serif">{nodes[n.id].title.split(' ')[0]}</text>
          </g>
        ))}
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
          <g key={n.id} onClick={()=>setActiveNode(activeNode===n.id?null:n.id)} style={{cursor:'pointer'}}>
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
        <div style={{marginTop:8,background:'rgba(13,17,23,0.97)',border:`1px solid ${active.color}40`,borderRadius:12,padding:'12px 14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span style={{fontSize:16}}>{active.icon}</span>
            <span style={{fontSize:12,fontWeight:700,color:active.color}}>{active.title}</span>
          </div>
          <p style={{fontSize:11,color:'#94A3B8',lineHeight:1.6,marginBottom:8}}>{active.desc}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3}}>
            {active.feats.map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#94A3B8'}}>
                <span style={{width:3,height:3,borderRadius:'50%',background:active.color,display:'inline-block',flexShrink:0}}/>{f}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginTop:10}}>
        {[{c:'#F97316',l:'Dashboards'},{c:'#10B981',l:'Management'},{c:'#F97316',l:'AI Powered'}].map((l,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#64748B'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:l.c}}/>{l.l}
          </div>
        ))}
      </div>
      <div style={{textAlign:'center',fontSize:10,color:'#334155',marginTop:3}}>Click any module to explore</div>
    </div>
  )
}

// ── FEATURES — MODULE CAROUSEL ────────────────────────────────────────────
const CAROUSEL_MODULES = [
  {
    id:'ops',icon:'⚡',label:'Operations',color:'#F97316',
    kpi1:{val:'14.2',label:'Avg ROP (m/hr)'},kpi2:{val:'92%',label:'Efficiency'},
    delta:'+18%',deltaPos:true,
    title:'Operations Dashboard',
    desc:'Live ROP trending, downtime analysis and bit performance across all rigs. Updates the moment a supervisor submits a shift log.',
    feats:['Live ROP & downtime alerts','Metres drilled vs target','Bit performance & cost/m','Formation comparison'],
    bars:[40,55,48,62,58,70,65],
  },
  {
    id:'driller',icon:'👷',label:'Driller Perf',color:'#10B981',
    kpi1:{val:'32',label:'Active Drillers'},kpi2:{val:'96%',label:'On-time Logs'},
    delta:'+12%',deltaPos:true,
    title:'Driller Performance',
    desc:'Every metre attributed to the driller who drilled it. Ranked performance tables, efficiency trends and individual time-series records.',
    feats:['Per-driller ROP ranking','Core recovery rate','Shift score & trends','Performance radar'],
    bars:[50,45,60,55,65,70,68],
  },
  {
    id:'consm',icon:'📦',label:'Consumables',color:'#8B5CF6',
    kpi1:{val:'450 L',label:'Fuel/shift'},kpi2:{val:'10 kL',label:'Water/shift'},
    delta:'-8%',deltaPos:false,
    title:'Consumables & Fluids',
    desc:'Fuel, water, drilling fluid and additives aggregated across all projects in real time.',
    feats:['Fuel burn by rig','Water & fluid usage','Additives tracking','Consumption forecast'],
    bars:[70,65,72,68,60,58,55],
  },
  {
    id:'maint',icon:'🔧',label:'Maintenance',color:'#3B82F6',
    kpi1:{val:'4.2d',label:'MTBF'},kpi2:{val:'87%',label:'Uptime'},
    delta:'-35%',deltaPos:false,
    title:'Maintenance Intelligence',
    desc:'Component failure attribution, maintenance cost trends and per-rig service history.',
    feats:['Component failure analysis','MTBF by rig','Oil consumption trend','Maintenance cost tracking'],
    bars:[60,55,50,65,58,62,48],
  },
  {
    id:'hsc',icon:'🛡',label:'HSC & Safety',color:'#EF4444',
    kpi1:{val:'186',label:'Safe Days'},kpi2:{val:'100%',label:'PPE Comp.'},
    delta:'+22%',deltaPos:true,
    title:'Health, Safety & Compliance',
    desc:'Timestamped incident logging, PPE compliance, safety score dashboard and compliance documentation.',
    feats:['Incident tracking','PPE compliance','Near-miss resolution','Training progress'],
    bars:[45,50,55,48,60,65,70],
  },
  {
    id:'inv',icon:'🗄',label:'Inventory',color:'#06B6D4',
    kpi1:{val:'94%',label:'In Stock'},kpi2:{val:'12',label:'Reorders'},
    delta:'+9%',deltaPos:true,
    title:'Inventory & Procurement',
    desc:'AI-driven stock-out prediction, supplier performance scoring and PO lifecycle tracking.',
    feats:['Bit lifecycle tracking','Spare parts management','Lead time monitoring','Auto stock deduction'],
    bars:[55,60,58,65,70,68,72],
  },
  {
    id:'finance',icon:'💰',label:'Finance',color:'#F59E0B',
    kpi1:{val:'₹4.2L',label:'Cost/rig'},kpi2:{val:'+14%',label:'Margin'},
    delta:'+14%',deltaPos:true,
    title:'Finance & Invoicing',
    desc:'Contract-rate invoicing with automated GST, TDS and retention deductions from approved drill logs.',
    feats:['Cost per metre live','Project P&L tracking','Burn rate analysis','Auto invoice generation'],
    bars:[48,52,60,65,62,70,75],
  },
]

function FeaturesSection() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  const goTo = (idx:number) => {
    if(idx===active) return
    setVisible(false)
    setTimeout(()=>{setActive(idx);setVisible(true)},260)
  }
  const prev = ()=>{setAutoPlay(false);goTo((active-1+CAROUSEL_MODULES.length)%CAROUSEL_MODULES.length)}
  const next = ()=>{setAutoPlay(false);goTo((active+1)%CAROUSEL_MODULES.length)}

  useEffect(()=>{
    if(!autoPlay) return
    timerRef.current = setInterval(()=>{
      setVisible(false)
      setTimeout(()=>{setActive(a=>(a+1)%CAROUSEL_MODULES.length);setVisible(true)},260)
    },4000)
    return ()=>{if(timerRef.current) clearInterval(timerRef.current)}
  },[autoPlay])

  const mod = CAROUSEL_MODULES[active]
  const rgb = (hex:string)=>`${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`
  const r = rgb(mod.color)

  return (
    <div style={{background:'#080B10',borderTop:'1px solid rgba(249,115,22,0.08)',borderBottom:'1px solid rgba(249,115,22,0.08)',padding:'0 0 60px'}}>

      {/* TAB BAR */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',borderBottom:'1px solid rgba(255,255,255,0.06)',overflowX:'auto',scrollbarWidth:'none' as const}}>
        {CAROUSEL_MODULES.map((m,i)=>{
          const on=i===active
          return (
            <button key={m.id} onClick={()=>{setAutoPlay(false);goTo(i)}}
              style={{display:'flex',alignItems:'center',gap:7,padding:'16px 20px',background:'none',border:'none',cursor:'pointer',borderBottom:on?`2px solid ${m.color}`:'2px solid transparent',color:on?m.color:'rgba(255,255,255,0.4)',fontSize:12,fontWeight:on?700:500,fontFamily:"'Space Grotesk',sans-serif",transition:'all 0.2s',whiteSpace:'nowrap' as const,marginBottom:-1}}>
              <span style={{fontSize:14}}>{m.icon}</span>{m.label}
            </button>
          )
        })}
      </div>

      {/* CARD + ARROWS */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 24px 0',gap:24,minHeight:520}}>

        {/* Left arrow */}
        <button onClick={prev}
          style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s',fontFamily:'inherit'}}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background=`rgba(${r},0.1)`;el.style.borderColor=`rgba(${r},0.3)`;el.style.color=mod.color}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(255,255,255,0.04)';el.style.borderColor='rgba(255,255,255,0.1)';el.style.color='rgba(255,255,255,0.6)'}}>‹</button>

        {/* DASHBOARD CARD */}
        <div style={{width:'100%',maxWidth:440,opacity:visible?1:0,transform:visible?'translateY(0) scale(1)':'translateY(14px) scale(0.97)',transition:'opacity 0.35s ease,transform 0.35s ease'}}>
          <div style={{background:'#0D1117',borderRadius:18,border:`1px solid rgba(${r},0.22)`,overflow:'hidden',boxShadow:`0 0 60px rgba(${r},0.1),0 32px 64px rgba(0,0,0,0.5)`,position:'relative'}}>

            {/* Top accent */}
            <div style={{height:2,background:`linear-gradient(90deg,${mod.color},transparent)`}}/>

            {/* Window chrome */}
            <div style={{height:40,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',padding:'0 14px',gap:7,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex',gap:5}}>
                {['#FF5F57','#FEBC2E','#28C840'].map((dc,i)=>(
                  <div key={i} style={{width:10,height:10,borderRadius:'50%',background:dc}}/>
                ))}
              </div>
              <span style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginLeft:8}}>
                XPLORIX › <span style={{color:'rgba(255,255,255,0.6)'}}>{mod.title}</span>
              </span>
            </div>

            {/* KPI + chart area */}
            <div style={{padding:'14px 16px',background:'#080B10'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                {[mod.kpi1,mod.kpi2].map((kpi,i)=>(
                  <div key={i} style={{background:'#111827',borderRadius:8,border:`1px solid rgba(${r},${i===0?0.28:0.08})`,padding:'10px 12px'}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:28,color:i===0?mod.color:'#F8FAFC',lineHeight:1}}>{kpi.val}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:3}}>{kpi.label}</div>
                  </div>
                ))}
              </div>
              {/* Bar chart */}
              <div style={{background:'#111827',borderRadius:8,border:'1px solid rgba(255,255,255,0.05)',padding:'10px 12px'}}>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',marginBottom:8,letterSpacing:'0.1em',textTransform:'uppercase' as const}}>7-Day Trend</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:4,height:56}}>
                  {mod.bars.map((h,i)=>(
                    <div key={i} style={{flex:1,height:`${h}%`,borderRadius:'3px 3px 0 0',background:i>=4?mod.color:`rgba(${r},0.22)`,transition:'height 0.5s ease'}}/>
                  ))}
                </div>
                <div style={{display:'flex',marginTop:4}}>
                  {['M','T','W','T','F','S','S'].map((d,i)=>(
                    <div key={i} style={{flex:1,textAlign:'center',fontSize:8,color:'rgba(255,255,255,0.25)'}}>{d}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info panel */}
            <div style={{padding:'14px 16px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:6,background:`rgba(${r},0.1)`,border:`1px solid rgba(${r},0.22)`,borderRadius:20,padding:'4px 12px'}}>
                  <span style={{fontSize:13}}>{mod.icon}</span>
                  <span style={{fontSize:12,fontWeight:600,color:mod.color}}>{mod.label}</span>
                </div>
                <div style={{fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:7,background:mod.deltaPos?'rgba(34,197,94,0.1)':'rgba(249,115,22,0.1)',color:mod.deltaPos?'#22C55E':'#F97316',border:`1px solid ${mod.deltaPos?'rgba(34,197,94,0.2)':'rgba(249,115,22,0.2)'}`}}>{mod.delta}</div>
              </div>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.65,marginBottom:10}}>{mod.desc}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                {mod.feats.map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'rgba(255,255,255,0.5)'}}>
                    <span style={{color:mod.color,fontSize:10}}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right arrow */}
        <button onClick={next}
          style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s',fontFamily:'inherit'}}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background=`rgba(${r},0.1)`;el.style.borderColor=`rgba(${r},0.3)`;el.style.color=mod.color}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(255,255,255,0.04)';el.style.borderColor='rgba(255,255,255,0.1)';el.style.color='rgba(255,255,255,0.6)'}}>›</button>
      </div>

      {/* DOT INDICATORS */}
      <div style={{display:'flex',justifyContent:'center',gap:7,marginTop:24}}>
        {CAROUSEL_MODULES.map((_,i)=>(
          <button key={i} onClick={()=>{setAutoPlay(false);goTo(i)}}
            style={{width:i===active?24:7,height:7,borderRadius:4,border:'none',cursor:'pointer',background:i===active?mod.color:'rgba(255,255,255,0.15)',transition:'all 0.3s ease',padding:0}}/>
        ))}
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeFaq,setActiveFaq]=useState<number|null>(null)
  const [scrolled,setScrolled]=useState(false)
  const [typeIndex,setTypeIndex]=useState(0)
  const [displayText,setDisplayText]=useState('')
  const [isDeleting,setIsDeleting]=useState(false)
  const typingWords=['Reimagined.','Simplified.','Optimized.','Digitized.']

  useEffect(()=>{
    const word=typingWords[typeIndex];let t:ReturnType<typeof setTimeout>
    if(!isDeleting){
      if(displayText.length<word.length) t=setTimeout(()=>setDisplayText(word.slice(0,displayText.length+1)),80)
      else t=setTimeout(()=>setIsDeleting(true),2000)
    } else {
      if(displayText.length>0) t=setTimeout(()=>setDisplayText(displayText.slice(0,-1)),40)
      else{setIsDeleting(false);setTypeIndex((typeIndex+1)%typingWords.length)}
    }
    return ()=>clearTimeout(t)
  },[displayText,isDeleting,typeIndex])

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>40)
    window.addEventListener('scroll',h)
    return ()=>window.removeEventListener('scroll',h)
  },[])

  const P='max(20px, calc(50vw - 580px))'

  const howItWorks=[
    {step:'01',icon:'🔐',color:'#F97316',side:'left', title:'Register & Get Instant Access',desc:'Create your company account and get Admin and Supervisor logins in minutes. Full platform access from day one — no contracts, no IT setup.',badges:[{t:'⏱ 5 min setup',c:'o'},{t:'✓ 15-day trial',c:'g'}],feats:['Admin + Supervisor + Driller roles','No credit card required']},
    {step:'02',icon:'⚙️',color:'#3B82F6',side:'right',title:'Build Your Master Data',        desc:'Create Project, Rig and Bit IDs. Upload Costing and Inventory master data via CSV files — operation structure ready instantly.',          badges:[{t:'📁 CSV upload',c:'b'},{t:'⚡ Instant sync',c:'o'}],feats:['Project, Rig & Bit configuration','Inventory catalogue bulk import']},
    {step:'03',icon:'📋',color:'#10B981',side:'left', title:'Go Live on Day One',            desc:'Supervisors log daily drill shifts immediately. Every meter, bit and downtime captured digitally. Full tracking from your very first log.',   badges:[{t:'✓ Zero training',c:'g'},{t:'📋 Replaces paper',c:'o'}],feats:['Digital shift log on any device','Auto cost & productivity calc']},
    {step:'04',icon:'🧠',color:'#8B5CF6',side:'right',title:'Unlock Full Intelligence',      desc:'The moment your first log is submitted, XPLORIX AI activates. Advanced analytics, predictive insights, performance reports — all automatic.', badges:[{t:'🧠 AI live',c:'p'},{t:'📊 9 dashboards',c:'o'}],feats:['AI predicts failures automatically','9 analytics dashboards live']},
  ]

  const aiInsights=[
    {type:'warning',icon:'⚠️',rig:'RIG-003',title:'Hydraulic Anomaly',        desc:'Pressure fluctuation matches pre-failure. Inspect within 48hrs.',          time:'2 min ago', badge:'Predictive Alert',color:'#F59E0B'},
    {type:'success',icon:'📈',rig:'RIG-001',title:'ROP Optimisation Found',    desc:'Drilling at 72 bar improves ROP by 14% in medium formation.',              time:'15 min ago',badge:'Performance Tip', color:'#10B981'},
    {type:'info',   icon:'💰',rig:'All Rigs',title:'Cost Per Meter Opportunity',desc:'NQ SR-08 bits on RIG-004 could reduce bit cost/m by 22%.',                time:'1 hr ago',  badge:'Cost Insight',    color:'#3B82F6'},
    {type:'danger', icon:'🚨',rig:'Site B',  title:'Fuel Spike Detected',      desc:'31% above 30-day baseline. Possible compressor inefficiency.',             time:'3 hrs ago', badge:'Anomaly',          color:'#EF4444'},
  ]

  const plans=[
    {name:'Standard Plan', icon:'🏗',billing:'Monthly Billing',          highlight:false,badge:'',              coreLabel:'CORE FEATURES',               feats:['Advanced digital logging','Fleet performance dashboard','Usage analytics & reporting','Unlimited supervisor logins','AI Insights for analysis','Secure cloud data storage','Standard onboarding support','Email support (business hours)']},
    {name:'Growth Plan',   icon:'📈',billing:'Half-Yearly — 8% Savings', highlight:true, badge:'★ MOST POPULAR',coreLabel:'EVERYTHING IN STANDARD, PLUS:', feats:['24/7 Priority Support','On-site Training for Teams','Advanced performance analytics','Trend forecasting & insights','Faster data refresh rates','Detailed downloadable reports','Priority feature updates']},
    {name:'Enterprise Plan',icon:'💎',billing:'Annual — 16% Savings',    highlight:false,badge:'💎 BEST VALUE',  coreLabel:'EVERYTHING IN GROWTH, PLUS:',  feats:['Dedicated Account Manager','On-Site Training & Implementation','Custom Feature Development','Enterprise-grade analytics','API integrations','Branding options','Highest system priority','Advanced security & compliance']},
  ]

  const faqs=[
    {q:'How long to set up XPLORIX?',       a:'Most companies are fully operational within 24-48 hours. Our onboarding team guides you through every step.'},
    {q:'Do drillers need training?',         a:'The drill log forms are intuitive — most drillers are comfortable after one shift. We provide video walkthroughs and live support.'},
    {q:'Can XPLORIX work offline?',          a:'Yes. The drilling log works offline and automatically syncs when connectivity is restored. Perfect for remote sites.'},
    {q:'How is our data kept secure?',       a:'All data is encrypted in transit and at rest. Each company has completely isolated data.'},
    {q:'Can I export data to Excel or PDF?', a:'All reports, dashboards and drill logs can be exported. Drillers can also download performance certificates directly.'},
    {q:'Multiple projects and sites?',       a:'Yes. XPLORIX is built for multi-site, multi-project operations with unlimited projects and rigs.'},
    {q:'What drilling types are supported?', a:'Diamond Core, RC, Blast Hole, Geotechnical and other exploration drilling types.'},
    {q:'How does pricing work?',             a:'Pricing is customised based on fleet size and features. Contact our team — most companies find XPLORIX pays for itself within the first month.'},
  ]

  const bs=(c:string)=>{
    const map:Record<string,string[]>={
      o:['rgba(249,115,22,0.08)','rgba(249,115,22,0.2)','#F97316'],
      g:['rgba(16,185,129,0.08)','rgba(16,185,129,0.2)','#10B981'],
      b:['rgba(59,130,246,0.08)','rgba(59,130,246,0.2)','#60A5FA'],
      p:['rgba(139,92,246,0.08)','rgba(139,92,246,0.2)','#A78BFA'],
      n:['rgba(255,255,255,0.04)','#1E293B','#64748B'],
    }
    const [bg,border,color]=map[c]||map.n
    return {background:bg,border:`1px solid ${border}`,color,fontSize:10,fontWeight:600 as const,padding:'3px 9px',borderRadius:6}
  }

  return (
    <div style={{fontFamily:"'Space Grotesk',sans-serif",background:'#080B10',color:'#F8FAFC',overflowX:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#080B10;}::-webkit-scrollbar-thumb{background:linear-gradient(#F97316,#3B82F6);border-radius:2px;}
        @keyframes xplPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}
        @keyframes xplFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes tScroll1{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes tScroll2{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:700;font-size:14px;font-family:'Space Grotesk',sans-serif;box-shadow:0 4px 20px rgba(249,115,22,0.3);transition:all 0.25s;text-decoration:none;}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(249,115,22,0.45);}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;cursor:pointer;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#F8FAFC;font-weight:600;font-size:14px;font-family:'Space Grotesk',sans-serif;transition:all 0.25s;text-decoration:none;}
        .btn-ghost:hover{background:rgba(255,255,255,0.08);transform:translateY(-1px);}
        .nav-link{color:#94A3B8;text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;}
        .nav-link:hover{color:#F8FAFC;}
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important;}
          .hero-right{display:none!important;}
          .about-grid,.ai-grid,.contact-grid{grid-template-columns:1fr!important;}
          .ind-grid,.plans-grid{grid-template-columns:1fr 1fr!important;}
          .footer-grid{grid-template-columns:1fr 1fr!important;}
          .how-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:900,padding:`14px ${P}`,display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all 0.3s',background:scrolled?'rgba(8,11,16,0.97)':'rgba(8,11,16,0.6)',backdropFilter:'blur(20px)',borderBottom:scrolled?'1px solid rgba(249,115,22,0.1)':'1px solid transparent'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <XLogo size={36}/>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:'#F8FAFC',letterSpacing:'0.06em'}}>XPLORIX</div>
            <div style={{fontSize:8,color:'#64748B',letterSpacing:'0.18em',textTransform:'uppercase'}}>Drilling Intelligence</div>
          </div>
        </a>
        <div style={{display:'flex',gap:28}}>
          {[{l:'About',h:'#about'},{l:'How it Works',h:'#how'},{l:'Platform',h:'#features'},{l:'AI Insights',h:'#ai'},{l:'Industries',h:'#industries'},{l:'Contact',h:'#contact'}].map(n=>(
            <a key={n.h} href={n.h} className="nav-link">{n.l}</a>
          ))}
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <Link href="/auth/login" className="nav-link">Sign in</Link>
          <a href="#contact" className="btn-primary" style={{padding:'9px 18px',fontSize:13}}>Schedule Demo</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:`120px ${P} 60px`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 60% at 50% -10%,rgba(249,115,22,0.07) 0%,transparent 60%),#080B10'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(30,41,59,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(30,41,59,0.1) 1px,transparent 1px)',backgroundSize:'60px 60px',WebkitMaskImage:'radial-gradient(ellipse 100% 80% at 50% 0%,black 0%,transparent 70%)'}}/>
        <div className="hero-grid" style={{position:'relative',zIndex:2,width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
          <div>
            <SR anim="dropDown">
              <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:100,border:'1px solid rgba(249,115,22,0.3)',background:'rgba(249,115,22,0.06)',fontSize:11,fontWeight:700,color:'#F97316',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:24}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#F97316',display:'inline-block',animation:'xplPulse 1.5s infinite'}}/>
                Live · AI Drilling Intelligence V3.0
              </div>
            </SR>
            <SR anim="slideLeft" delay={100}>
              <h1 style={{fontSize:'clamp(36px,4.5vw,64px)',lineHeight:1.05,fontWeight:900,marginBottom:8,letterSpacing:'-0.02em',fontFamily:"'Space Grotesk',sans-serif"}}>
                Drilling Intelligence<br/>
                <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{displayText}</span>
                <span style={{borderRight:'3px solid #F97316',marginLeft:2,animation:'xplPulse 1s infinite'}}/>
              </h1>
            </SR>
            <SR anim="riseUp" delay={200}>
              <p style={{fontSize:15,lineHeight:1.7,color:'#94A3B8',maxWidth:480,marginBottom:28,marginTop:12}}>
                AI-powered performance intelligence for exploration drilling — real-time analytics, digital logging, and smarter decisions. Built for the toughest operations on earth.
              </p>
            </SR>
            <SR anim="riseUp" delay={300}>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
                <a href="#contact" className="btn-primary">Schedule Demo →</a>
                <a href="#how" className="btn-ghost">▷ How It Works</a>
              </div>
            </SR>
            <SR anim="riseUp" delay={400}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{display:'flex'}}>
                  {['#F97316','#3B82F6','#10B981','#8B5CF6','#F59E0B'].map((c,i)=>(
                    <div key={i} style={{width:30,height:30,borderRadius:'50%',background:c,border:'2px solid #080B10',marginLeft:i===0?0:-7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>
                      {['JW','PN','AA','MK','RT'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{display:'flex',gap:1,marginBottom:2}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:'#F59E0B',fontSize:11}}>★</span>)}</div>
                  <div style={{fontSize:11,color:'#64748B'}}><span style={{color:'#F8FAFC',fontWeight:600}}>30+ companies</span> trust XPLORIX</div>
                </div>
              </div>
            </SR>
          </div>
          <div className="hero-right" style={{animation:'xplFloat 6s ease-in-out infinite'}}>
            <EcosystemDiagram/>
          </div>
        </div>
      </section>

      {/* AI TICKER */}
      <SR anim="slideLeft"><AITicker/></SR>

      {/* ABOUT */}
      <section id="about" style={{padding:`80px ${P}`}}>
        <SR anim="flipX">
          <div className="about-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center'}}>
            <div>
              <Tag>About Xplorix</Tag>
              <h2 style={{fontSize:'clamp(24px,3vw,38px)',fontWeight:800,lineHeight:1.15,marginBottom:16,letterSpacing:'-0.02em',fontFamily:"'Space Grotesk',sans-serif"}}>
                Performance intelligence for <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>exploration drilling.</span>
              </h2>
              <p style={{fontSize:14,color:'#94A3B8',lineHeight:1.8,marginBottom:12}}>
                Xplorix is built for drilling contractors who are tired of managing operations on spreadsheets, paper logs and WhatsApp groups.
              </p>
              <p style={{fontSize:14,color:'#94A3B8',lineHeight:1.8,marginBottom:24}}>
                We replace your entire paper-based workflow with a single intelligent platform — real-time visibility, AI-powered insights, and data-driven decisions across every rig and site.
              </p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {['Real-time visibility','AI-powered','Zero paperwork','Multi-site ready','Mobile first'].map(pill=>(
                  <span key={pill} style={{padding:'5px 12px',borderRadius:20,background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',color:'#F97316',fontSize:11,fontWeight:600}}>{pill}</span>
                ))}
              </div>
            </div>
            <TiltCard style={{borderRadius:16,overflow:'hidden',border:'1px solid #1E293B',boxShadow:'0 32px 64px rgba(0,0,0,0.4)',background:'#0D1117',position:'relative'}}>
              <video src="/videos/1st vedio.mp4" autoPlay muted loop playsInline style={{width:'100%',display:'block'}}/>
              <div style={{position:'absolute',top:10,left:10,display:'flex',alignItems:'center',gap:6,padding:'4px 9px',background:'rgba(8,11,16,0.85)',borderRadius:7,border:'1px solid #1E293B',backdropFilter:'blur(10px)'}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:'#EF4444',display:'inline-block',animation:'xplPulse 1.5s infinite'}}/>
                <span style={{fontSize:9,fontWeight:700,color:'#F8FAFC'}}>LIVE DEMO</span>
              </div>
            </TiltCard>
          </div>
        </SR>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{background:'#0D1117',padding:`70px ${P}`,borderTop:'1px solid rgba(249,115,22,0.06)'}}>
        <SR anim="zoomDeep">
          <div style={{textAlign:'center',marginBottom:40}}>
            <Tag>How It Works</Tag>
            <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif"}}>
              From signup to full <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>intelligence</span> in 30 min.
            </h2>
            <p style={{fontSize:13,color:'#64748B',marginTop:8}}>Four steps — no IT team, no spreadsheets, no paper.</p>
          </div>
          <div style={{position:'relative',maxWidth:720,margin:'0 auto'}}>
            <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'linear-gradient(180deg,transparent,rgba(249,115,22,0.3) 5%,rgba(249,115,22,0.3) 95%,transparent)',transform:'translateX(-50%)',zIndex:0}}/>
            {howItWorks.map((step,i)=>(
              <SR key={i} anim={step.side==='left'?'slideLeft':'slideRight'} delay={i*80}>
                <div className="how-grid" style={{display:'grid',gridTemplateColumns:'1fr 52px 1fr',marginBottom:24,position:'relative',zIndex:1}}>
                  {step.side==='left'?(
                    <TiltCard>
                      <div style={{padding:'16px 18px',background:'rgba(255,255,255,0.02)',border:'1px solid #1E293B',borderRadius:12,position:'relative',overflow:'hidden',marginRight:20}}>
                        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${step.color},transparent)`}}/>
                        <div style={{fontSize:9,fontWeight:700,color:step.color,letterSpacing:'0.18em',textTransform:'uppercase' as const,marginBottom:4}}>STEP {step.step}</div>
                        <div style={{fontSize:14,fontWeight:700,color:'#F8FAFC',marginBottom:6,lineHeight:1.2,fontFamily:"'Space Grotesk',sans-serif"}}>{step.title}</div>
                        <div style={{fontSize:12,color:'#94A3B8',lineHeight:1.6,marginBottom:8}}>{step.desc}</div>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:6}}>
                          {step.badges.map((b,bi)=><span key={bi} style={bs(b.c)}>{b.t}</span>)}
                        </div>
                        {step.feats.map((f,fi)=>(
                          <div key={fi} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#64748B',marginBottom:2}}>
                            <span style={{width:3,height:3,borderRadius:'50%',background:step.color,display:'inline-block',flexShrink:0}}/>{f}
                          </div>
                        ))}
                      </div>
                    </TiltCard>
                  ):<div/>}
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
                    <div style={{width:42,height:42,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,border:`2px solid ${step.color}`,background:`${step.color}12`,position:'relative',zIndex:2,marginTop:8,boxShadow:`0 0 16px ${step.color}30`}}>{step.icon}</div>
                    <div style={{position:'absolute',top:-6,fontSize:56,fontWeight:900,color:`${step.color}05`,lineHeight:1,pointerEvents:'none',fontFamily:"'Space Grotesk',sans-serif"}}>{step.step}</div>
                  </div>
                  {step.side==='right'?(
                    <TiltCard>
                      <div style={{padding:'16px 18px',background:'rgba(255,255,255,0.02)',border:'1px solid #1E293B',borderRadius:12,position:'relative',overflow:'hidden',marginLeft:20}}>
                        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${step.color},transparent)`}}/>
                        <div style={{fontSize:9,fontWeight:700,color:step.color,letterSpacing:'0.18em',textTransform:'uppercase' as const,marginBottom:4}}>STEP {step.step}</div>
                        <div style={{fontSize:14,fontWeight:700,color:'#F8FAFC',marginBottom:6,lineHeight:1.2,fontFamily:"'Space Grotesk',sans-serif"}}>{step.title}</div>
                        <div style={{fontSize:12,color:'#94A3B8',lineHeight:1.6,marginBottom:8}}>{step.desc}</div>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:6}}>
                          {step.badges.map((b,bi)=><span key={bi} style={bs(b.c)}>{b.t}</span>)}
                        </div>
                        {step.feats.map((f,fi)=>(
                          <div key={fi} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#64748B',marginBottom:2}}>
                            <span style={{width:3,height:3,borderRadius:'50%',background:step.color,display:'inline-block',flexShrink:0}}/>{f}
                          </div>
                        ))}
                      </div>
                    </TiltCard>
                  ):<div/>}
                </div>
              </SR>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:20}}>
            <a href="#contact" className="btn-primary" style={{fontSize:13,padding:'10px 22px'}}>Start Your Free Trial →</a>
          </div>
        </SR>
      </section>

      {/* FEATURES — MODULE CAROUSEL */}
      <section id="features" style={{background:'#000005',borderTop:'1px solid rgba(249,115,22,0.08)',borderBottom:'1px solid rgba(249,115,22,0.08)'}}>
        <div style={{textAlign:'center',padding:`60px ${P} 0`,position:'relative',zIndex:5}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:100,border:'1px solid rgba(249,115,22,0.25)',background:'rgba(249,115,22,0.06)',fontSize:10,fontWeight:700,color:'#F97316',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:16}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:'#F97316',display:'inline-block',animation:'xplPulse 1.5s infinite'}}/>Platform
          </div>
          <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif",color:'#F8FAFC',marginBottom:8}}>
            Everything your operation needs —{' '}
            <span style={{background:'linear-gradient(135deg,#3B82F6,#60A5FA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>one platform.</span>
          </h2>
          <p style={{fontSize:13,color:'#64748B',marginBottom:0}}>9 intelligent modules. All connected. All live.</p>
        </div>
        <FeaturesSection/>
      </section>

      {/* AI INSIGHTS */}
      <section id="ai" style={{background:'#0D1117',padding:`80px ${P}`,borderTop:'1px solid rgba(249,115,22,0.06)'}}>
        <SR anim="slideRight">
          <div className="ai-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>
            <div>
              <Tag>AI-Powered Insights</Tag>
              <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,lineHeight:1.15,marginBottom:14,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif"}}>
                Intelligence that <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>acts</span> before you <span style={{background:'linear-gradient(135deg,#3B82F6,#60A5FA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ask.</span>
              </h2>
              <p style={{fontSize:14,color:'#94A3B8',lineHeight:1.7,marginBottom:20}}>
                XPLORIX AI monitors every data point from every rig, every shift — detecting anomalies, predicting failures and delivering daily recommendations automatically.
              </p>
              {[
                {icon:'🔮',title:'Predictive Failure Detection',    desc:'Identifies equipment failure patterns before they cause downtime'},
                {icon:'💡',title:'Daily Performance Recommendations',desc:'Automated shift summaries with specific actionable improvements'},
                {icon:'💰',title:'Cost Optimisation Engine',         desc:'Continuously finds cost-per-meter savings across rigs and formations'},
              ].map((f,i)=>(
                <TiltCard key={i}>
                  <div style={{display:'flex',gap:12,padding:'11px 13px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,marginBottom:7,transition:'border-color 0.2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.25)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)'}>
                    <span style={{fontSize:18,flexShrink:0}}>{f.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'#F8FAFC',marginBottom:2}}>{f.title}</div>
                      <div style={{fontSize:11,color:'#94A3B8',lineHeight:1.5}}>{f.desc}</div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <div style={{fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Live AI Insights Feed</div>
              {aiInsights.map((insight,i)=>(
                <TiltCard key={i}>
                  <div style={{padding:13,borderRadius:12,background:`${insight.color}08`,border:`1px solid ${insight.color}25`}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:7}}>
                        <span style={{fontSize:13}}>{insight.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC'}}>{insight.title}</div>
                          <div style={{fontSize:10,color:'#64748B'}}>{insight.rig} · {insight.time}</div>
                        </div>
                      </div>
                      <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:5,background:`${insight.color}20`,color:insight.color,border:`1px solid ${insight.color}30`,whiteSpace:'nowrap',flexShrink:0,marginLeft:8}}>{insight.badge}</span>
                    </div>
                    <p style={{fontSize:11,color:'#94A3B8',lineHeight:1.6}}>{insight.desc}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </SR>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{background:'#080B10',padding:`80px 0`,borderTop:'1px solid rgba(249,115,22,0.06)',overflow:'hidden'}}>
        <SR anim="riseUp">
          <div style={{textAlign:'center',marginBottom:48,padding:`0 ${P}`}}>
            <Tag>What the Field Says</Tag>
            <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif"}}>
              Trusted by operations across <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>3 countries.</span>
            </h2>
            <p style={{fontSize:13,color:'#64748B',marginTop:8}}>Real feedback from drilling contractors, exploration bodies and mining companies.</p>
          </div>
        </SR>

        {/* ROW 1 — scrolls left */}
        <div style={{position:'relative',marginBottom:14}} onMouseEnter={e=>{const t=e.currentTarget.querySelector('.t-row-1') as HTMLElement;if(t)t.style.animationPlayState='paused'}} onMouseLeave={e=>{const t=e.currentTarget.querySelector('.t-row-1') as HTMLElement;if(t)t.style.animationPlayState='running'}}>
          <div className="t-row-1" style={{display:'flex',gap:14,animation:'tScroll1 55s linear infinite',width:'max-content'}}>
            {[
              {quote:'The downtime chart alone changed our Monday review meetings. We could see exactly which rigs had the most idle time and why — something we had never been able to do before. It changed the questions we were asking.',name:'Vikram Sharma',role:'HOD Operations',company:'Kartikay Exploration & Mining Services',country:'India',flag:'🇮🇳',featured:true,color:'#F97316'},
              {quote:'We submit hundreds of bore logs every month across multiple projects. Seeing all of it consolidated — formation data, core recovery, ROP trends — on one screen in real time was something we have genuinely never had before.',name:'Head of Operations',role:'Head of Operations',company:'MECL — Mineral Exploration & Consultancy Ltd.',country:'India',flag:'🇮🇳',featured:false,color:'#3B82F6'},
              {quote:'My team was logging live on the platform within two days. No training, no IT setup. I have never seen field supervisors adopt a new system that quickly. The interface genuinely thinks the way they think.',name:'Piyush Mrig',role:'Director',company:'Kartikay Exploration & Mining Services Pvt. Ltd.',country:'India',flag:'🇮🇳',featured:false,color:'#10B981'},
              {quote:'Gold exploration demands precision at every stage. What struck me about XPLORIX is that it treats drilling data the way a geologist would — not as a log to be filed, but as intelligence to be acted on. That distinction matters enormously in our industry.',name:'Chairman',role:'Chairman',company:'Saudi Gold Refinery',country:'Saudi Arabia',flag:'🇸🇦',featured:false,color:'#F59E0B'},
              {quote:'First week in and already this is showing us things our spreadsheets never could. The dashboard is clean, the data makes sense and the team picked it up fast. This is what we have been looking for.',name:'Mohammed Ali Reyaz',role:'General Manager',company:'KANZ AL-MAADEN Contracting Company',country:'Saudi Arabia',flag:'🇸🇦',featured:true,color:'#F97316'},
            ].concat([
              {quote:'The downtime chart alone changed our Monday review meetings. We could see exactly which rigs had the most idle time and why — something we had never been able to do before. It changed the questions we were asking.',name:'Vikram Sharma',role:'HOD Operations',company:'Kartikay Exploration & Mining Services',country:'India',flag:'🇮🇳',featured:true,color:'#F97316'},
              {quote:'We submit hundreds of bore logs every month across multiple projects. Seeing all of it consolidated — formation data, core recovery, ROP trends — on one screen in real time was something we have genuinely never had before.',name:'Head of Operations',role:'Head of Operations',company:'MECL — Mineral Exploration & Consultancy Ltd.',country:'India',flag:'🇮🇳',featured:false,color:'#3B82F6'},
              {quote:'My team was logging live on the platform within two days. No training, no IT setup. I have never seen field supervisors adopt a new system that quickly. The interface genuinely thinks the way they think.',name:'Piyush Mrig',role:'Director',company:'Kartikay Exploration & Mining Services Pvt. Ltd.',country:'India',flag:'🇮🇳',featured:false,color:'#10B981'},
              {quote:'Gold exploration demands precision at every stage. What struck me about XPLORIX is that it treats drilling data the way a geologist would — not as a log to be filed, but as intelligence to be acted on. That distinction matters enormously in our industry.',name:'Chairman',role:'Chairman',company:'Saudi Gold Refinery',country:'Saudi Arabia',flag:'🇸🇦',featured:false,color:'#F59E0B'},
              {quote:'First week in and already this is showing us things our spreadsheets never could. The dashboard is clean, the data makes sense and the team picked it up fast. This is what we have been looking for.',name:'Mohammed Ali Reyaz',role:'General Manager',company:'KANZ AL-MAADEN Contracting Company',country:'Saudi Arabia',flag:'🇸🇦',featured:true,color:'#F97316'},
            ]).map((t,i)=>(
              <div key={i} style={{flexShrink:0,width:t.featured?380:320,background:t.featured?'rgba(249,115,22,0.04)':'rgba(13,17,23,0.8)',border:`1px solid ${t.featured?'rgba(249,115,22,0.25)':'rgba(255,255,255,0.06)'}`,borderRadius:14,padding:'22px 22px 18px',position:'relative',overflow:'hidden'}}>
                {t.featured&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${t.color},transparent)`}}/>}
                <div style={{display:'flex',gap:1,marginBottom:10}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:'#F59E0B',fontSize:11}}>★</span>)}</div>
                <p style={{fontSize:12,color:'#94A3B8',lineHeight:1.75,marginBottom:16,fontStyle:'italic'}}>"{t.quote}"</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:12}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC'}}>{t.name}</div>
                    <div style={{fontSize:10,color:t.color,marginTop:1}}>{t.role}</div>
                    <div style={{fontSize:10,color:'#64748B',marginTop:1}}>{t.company}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                    <span style={{fontSize:18}}>{t.flag}</span>
                    <span style={{fontSize:9,color:'#334155'}}>{t.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{position:'absolute',top:0,left:0,bottom:0,width:80,background:'linear-gradient(90deg,#080B10,transparent)',pointerEvents:'none',zIndex:2}}/>
          <div style={{position:'absolute',top:0,right:0,bottom:0,width:80,background:'linear-gradient(270deg,#080B10,transparent)',pointerEvents:'none',zIndex:2}}/>
        </div>

        {/* ROW 2 — scrolls right */}
        <div style={{position:'relative'}} onMouseEnter={e=>{const t=e.currentTarget.querySelector('.t-row-2') as HTMLElement;if(t)t.style.animationPlayState='paused'}} onMouseLeave={e=>{const t=e.currentTarget.querySelector('.t-row-2') as HTMLElement;if(t)t.style.animationPlayState='running'}}>
          <div className="t-row-2" style={{display:'flex',gap:14,animation:'tScroll2 65s linear infinite',width:'max-content'}}>
            {[
              {quote:'I did not expect a software trial to impress me this quickly. Everything from rig performance to inventory in one place, and it actually works the way field teams think.',name:'Dileep Kumar',role:'Geologist Manager',company:'Kartikay Exploration & Mining Services',country:'India',flag:'🇮🇳',featured:true,color:'#10B981'},
              {quote:'For a government exploration body, compliance documentation is non-negotiable. The fact that safety records, shift logs and core recovery reports generate automatically from the same entry our supervisors already make — that removes a significant administrative burden.',name:'Head of Operations',role:'Head of Operations',company:'CMPDI — Central Mine Planning & Design Institute',country:'India',flag:'🇮🇳',featured:false,color:'#8B5CF6'},
              {quote:'I asked a simple question: can I see which rig is underperforming right now, and why? XPLORIX answered it in under thirty seconds. That is the kind of tool a CEO needs — not a report from last week, but an answer today.',name:'CEO',role:'Chief Executive Officer',company:'Saudi Gold Refinery',country:'Saudi Arabia',flag:'🇸🇦',featured:false,color:'#F59E0B'},
              {quote:'Operating in Oman means remote sites, limited connectivity and crews spread across large distances. XPLORIX handles all of that — the mobile logging works offline, the data syncs when connection returns. It is built for the field, not the office.',name:'Head of Operations',role:'Head of Operations',company:'Geo Solutions Engineering',country:'Oman',flag:'🇴🇲',featured:false,color:'#3B82F6'},
            ].concat([
              {quote:'I did not expect a software trial to impress me this quickly. Everything from rig performance to inventory in one place, and it actually works the way field teams think.',name:'Dileep Kumar',role:'Geologist Manager',company:'Kartikay Exploration & Mining Services',country:'India',flag:'🇮🇳',featured:true,color:'#10B981'},
              {quote:'For a government exploration body, compliance documentation is non-negotiable. The fact that safety records, shift logs and core recovery reports generate automatically from the same entry our supervisors already make — that removes a significant administrative burden.',name:'Head of Operations',role:'Head of Operations',company:'CMPDI — Central Mine Planning & Design Institute',country:'India',flag:'🇮🇳',featured:false,color:'#8B5CF6'},
              {quote:'I asked a simple question: can I see which rig is underperforming right now, and why? XPLORIX answered it in under thirty seconds. That is the kind of tool a CEO needs — not a report from last week, but an answer today.',name:'CEO',role:'Chief Executive Officer',company:'Saudi Gold Refinery',country:'Saudi Arabia',flag:'🇸🇦',featured:false,color:'#F59E0B'},
              {quote:'Operating in Oman means remote sites, limited connectivity and crews spread across large distances. XPLORIX handles all of that — the mobile logging works offline, the data syncs when connection returns. It is built for the field, not the office.',name:'Head of Operations',role:'Head of Operations',company:'Geo Solutions Engineering',country:'Oman',flag:'🇴🇲',featured:false,color:'#3B82F6'},
            ]).map((t,i)=>(
              <div key={i} style={{flexShrink:0,width:t.featured?380:320,background:t.featured?'rgba(16,185,129,0.04)':'rgba(13,17,23,0.8)',border:`1px solid ${t.featured?'rgba(16,185,129,0.25)':'rgba(255,255,255,0.06)'}`,borderRadius:14,padding:'22px 22px 18px',position:'relative',overflow:'hidden'}}>
                {t.featured&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${t.color},transparent)`}}/>}
                <div style={{display:'flex',gap:1,marginBottom:10}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:'#F59E0B',fontSize:11}}>★</span>)}</div>
                <p style={{fontSize:12,color:'#94A3B8',lineHeight:1.75,marginBottom:16,fontStyle:'italic'}}>"{t.quote}"</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:12}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC'}}>{t.name}</div>
                    <div style={{fontSize:10,color:t.color,marginTop:1}}>{t.role}</div>
                    <div style={{fontSize:10,color:'#64748B',marginTop:1}}>{t.company}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                    <span style={{fontSize:18}}>{t.flag}</span>
                    <span style={{fontSize:9,color:'#334155'}}>{t.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{position:'absolute',top:0,left:0,bottom:0,width:80,background:'linear-gradient(90deg,#080B10,transparent)',pointerEvents:'none',zIndex:2}}/>
          <div style={{position:'absolute',top:0,right:0,bottom:0,width:80,background:'linear-gradient(270deg,#080B10,transparent)',pointerEvents:'none',zIndex:2}}/>
        </div>
      </section>

      {/* 30-DAY TRIAL */}
      <section id="trial" style={{background:'#0D1117',padding:`80px ${P}`,borderTop:'1px solid rgba(249,115,22,0.06)'}}>
        <SR anim="zoomDeep">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center'}} className="about-grid">

            {/* LEFT — story */}
            <div>
              <Tag>Live Field Trial</Tag>
              <h2 style={{fontSize:'clamp(24px,3vw,40px)',fontWeight:800,lineHeight:1.1,marginBottom:16,letterSpacing:'-0.02em',fontFamily:"'Space Grotesk',sans-serif"}}>
                30 Days. Two Countries.<br/>
                <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>One Platform.</span>
              </h2>
              <p style={{fontSize:14,color:'#94A3B8',lineHeight:1.8,marginBottom:20}}>
                Before XPLORIX launched publicly, we ran a 30-day live trial with two active drilling contractors — one in India, one in Saudi Arabia — across real projects, real rigs, and real field conditions.
              </p>
              <p style={{fontSize:14,color:'#94A3B8',lineHeight:1.8,marginBottom:28}}>
                No demos. No sandbox data. Supervisors logging live shifts from day one, managers reviewing dashboards the same evening, and the platform refined in real time based on what the field actually needed.
              </p>

              {/* Stats row */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:28}}>
                {[
                  {val:'2',label:'Countries',sub:'India & Saudi Arabia',color:'#F97316'},
                  {val:'28',label:'Days Live',sub:'May – June 2026',color:'#3B82F6'},
                  {val:'0',label:'Safety Incidents',sub:'Across all sites',color:'#10B981'},
                  {val:'48h',label:'Go-Live Time',sub:'From account creation',color:'#8B5CF6'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'14px 16px'}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:28,color:s.color,lineHeight:1}}>{s.val}</div>
                    <div style={{fontSize:12,fontWeight:600,color:'#F8FAFC',marginTop:4}}>{s.label}</div>
                    <div style={{fontSize:10,color:'#64748B',marginTop:2}}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a href="/blog/30-days-trial.html" target="_blank" rel="noopener noreferrer"
                className="btn-primary"
                style={{display:'inline-flex',alignItems:'center',gap:10,fontSize:14,padding:'13px 26px'}}>
                <span>Read the Full Field Report</span>
                <span style={{fontSize:16}}>→</span>
              </a>
              <p style={{fontSize:11,color:'#334155',marginTop:10}}>Opens in a new tab · No sign-in required</p>
            </div>

            {/* RIGHT — partner cards */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>

              {/* Partner 1 */}
              <TiltCard>
                <div style={{background:'rgba(8,11,16,0.8)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:14,padding:'20px 22px',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#F97316,transparent)'}}/>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:24}}>🇮🇳</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#F8FAFC'}}>Kartikay Exploration & Mining Services</div>
                        <div style={{fontSize:10,color:'#64748B'}}>Nagpur, India · Exploration Drilling Contractor</div>
                      </div>
                    </div>
                    <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.25)',borderRadius:6,padding:'3px 9px',fontSize:9,fontWeight:700,color:'#F97316',whiteSpace:'nowrap' as const}}>Partner 1</div>
                  </div>
                  <p style={{fontSize:12,color:'#64748B',lineHeight:1.6,marginBottom:10}}>Active CMPDI & MECL coal block exploration projects. Multiple rigs, multiple sites — all logged live from day one.</p>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                    {['Diamond Core','CMPDI Projects','MECL Projects','Coal Exploration'].map(t=>(
                      <span key={t} style={{fontSize:9,padding:'2px 8px',borderRadius:4,background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.15)',color:'#F97316'}}>{t}</span>
                    ))}
                  </div>
                </div>
              </TiltCard>

              {/* Partner 2 */}
              <TiltCard>
                <div style={{background:'rgba(8,11,16,0.8)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:14,padding:'20px 22px',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#3B82F6,transparent)'}}/>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:24}}>🇸🇦</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#F8FAFC'}}>KANZ AL-MAADEN Contracting Company</div>
                        <div style={{fontSize:10,color:'#64748B'}}>Saudi Arabia · International Drilling Contractor</div>
                      </div>
                    </div>
                    <div style={{background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:6,padding:'3px 9px',fontSize:9,fontWeight:700,color:'#60A5FA',whiteSpace:'nowrap' as const}}>Partner 2</div>
                  </div>
                  <p style={{fontSize:12,color:'#64748B',lineHeight:1.6,marginBottom:10}}>International exploration contractor operating across the Middle East. Team adopted the platform within 48 hours, no training sessions required.</p>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                    {['RC Drilling','Diamond Core','Middle East','Mineral Exploration'].map(t=>(
                      <span key={t} style={{fontSize:9,padding:'2px 8px',borderRadius:4,background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.15)',color:'#60A5FA'}}>{t}</span>
                    ))}
                  </div>
                </div>
              </TiltCard>

              {/* Quote highlight */}
              <div style={{background:'rgba(249,115,22,0.04)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:12,padding:'16px 18px'}}>
                <p style={{fontSize:12,color:'#94A3B8',lineHeight:1.75,fontStyle:'italic',marginBottom:10}}>"First week in and already this is showing us things our spreadsheets never could. The dashboard is clean, the data makes sense and the team picked it up fast."</p>
                <div style={{fontSize:11,fontWeight:600,color:'#F97316'}}>Mohammed Ali Reyaz</div>
                <div style={{fontSize:10,color:'#64748B'}}>General Manager · KANZ AL-MAADEN</div>
              </div>

            </div>
          </div>
        </SR>
      </section>

      {/* INDUSTRIES */}
      <section id="industries" style={{padding:`80px ${P}`}}>
        <SR anim="dropDown">
          <div style={{textAlign:'center',marginBottom:40}}>
            <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif"}}>
              Built for the toughest <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>operations on earth.</span>
            </h2>
          </div>
          <div className="ind-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
            {[
              {icon:'⛏',title:'Mining',               desc:'End-to-end visibility for surface & underground mining.',    color:'#F97316'},
              {icon:'🔩',title:'Exploration Drilling', desc:'Built for diamond core & RC operations in remote environments.',color:'#3B82F6'},
              {icon:'🏔',title:'Geotechnical',         desc:'Track investigation programs at scale with full visibility.',  color:'#10B981'},
              {icon:'💥',title:'Blast Hole Drilling',  desc:'Productivity intelligence for high-volume production.',        color:'#8B5CF6'},
            ].map((ind,i)=>(
              <SR key={i} anim="riseUp" delay={i*80}>
                <TiltCard style={{background:'rgba(13,17,23,0.8)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'20px 16px',height:'100%',transition:'border-color 0.3s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${ind.color}30`}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${ind.color}15`,border:`1px solid ${ind.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:12}}>{ind.icon}</div>
                  <h3 style={{fontSize:14,fontWeight:700,color:'#F8FAFC',marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>{ind.title}</h3>
                  <p style={{fontSize:12,color:'#94A3B8',lineHeight:1.6,marginBottom:10}}>{ind.desc}</p>
                  <div style={{display:'flex',alignItems:'center',gap:5,fontSize:9,color:'#64748B',fontWeight:700,letterSpacing:'0.08em'}}>
                    <div style={{width:12,height:2,background:`linear-gradient(90deg,${ind.color},transparent)`,borderRadius:1}}/>LIVE DEPLOYMENTS
                  </div>
                </TiltCard>
              </SR>
            ))}
          </div>
        </SR>
      </section>

      {/* PRICING */}
      <section style={{background:'#0D1117',padding:`80px ${P}`,borderTop:'1px solid rgba(249,115,22,0.06)'}}>
        <SR anim="flipY">
          <div style={{textAlign:'center',marginBottom:36}}>
            <Tag>Pricing</Tag>
            <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,marginBottom:8,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif"}}>
              XPLORIX <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Plans</span>
            </h2>
            <p style={{fontSize:13,color:'#64748B'}}>Powerful insights. Smarter operations. Maximum uptime.</p>
          </div>
          <div className="plans-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
            {plans.map((plan,i)=>(
              <SR key={i} anim="riseUp" delay={i*80}>
                <TiltCard style={{background:plan.highlight?'rgba(249,115,22,0.04)':'rgba(8,11,16,0.8)',border:plan.highlight?'2px solid rgba(249,115,22,0.4)':'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:24,position:'relative',height:'100%',display:'flex',flexDirection:'column'}}>
                  {plan.badge&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(30,41,59,0.9)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 12px',borderRadius:20,whiteSpace:'nowrap'}}>{plan.badge}</div>}
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <div style={{width:40,height:40,borderRadius:10,background:plan.highlight?'rgba(249,115,22,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${plan.highlight?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{plan.icon}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#F8FAFC',fontFamily:"'Space Grotesk',sans-serif"}}>{plan.name}</div>
                      <div style={{fontSize:10,color:plan.highlight?'#F97316':'#64748B',marginTop:1}}>{plan.billing}</div>
                    </div>
                  </div>
                  <div style={{padding:'9px 12px',background:'rgba(249,115,22,0.05)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:8,marginBottom:12,textAlign:'center'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#F97316'}}>Contact Us for Pricing</div>
                    <div style={{fontSize:10,color:'#64748B',marginTop:1}}>Tailored to your fleet size</div>
                  </div>
                  <div style={{fontSize:9,fontWeight:700,color:plan.highlight?'#F97316':'#64748B',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>{plan.coreLabel}</div>
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:5}}>
                    {plan.feats.map((f,fi)=>(
                      <div key={fi} style={{display:'flex',alignItems:'flex-start',gap:6,fontSize:11,color:'#94A3B8',lineHeight:1.4}}>
                        <span style={{color:plan.highlight?'#F97316':'#10B981',fontSize:11,flexShrink:0,marginTop:1}}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <a href="#contact" style={{display:'block',textAlign:'center',marginTop:16,padding:'9px',borderRadius:8,background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(255,255,255,0.04)',border:plan.highlight?'none':'1px solid rgba(255,255,255,0.08)',color:plan.highlight?'#fff':'#94A3B8',fontSize:12,fontWeight:700,textDecoration:'none'}}>
                    Get Started →
                  </a>
                </TiltCard>
              </SR>
            ))}
          </div>
          <div style={{padding:'16px 22px',background:'rgba(249,115,22,0.04)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'#F8FAFC',fontFamily:"'Space Grotesk',sans-serif"}}>Get a personalised quote for your operation</div>
              <div style={{fontSize:11,color:'#64748B',marginTop:2}}>Most companies find XPLORIX pays for itself within the first month</div>
            </div>
            <a href="#contact" className="btn-primary" style={{fontSize:13,padding:'9px 18px'}}>Contact Us for Pricing →</a>
          </div>
        </SR>
      </section>

      {/* FAQ */}
      <section style={{padding:`80px ${P}`}}>
        <SR anim="spinIn">
          <div style={{maxWidth:700,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <Tag>FAQ</Tag>
              <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif"}}>
                Common <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>questions answered.</span>
              </h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {faqs.map((faq,i)=>(
                <SR key={i} anim="slideLeft" delay={i*40}>
                  <div style={{background:'rgba(13,17,23,0.8)',border:`1px solid ${activeFaq===i?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.06)'}`,borderRadius:11,overflow:'hidden',transition:'border-color 0.2s'}}>
                    <button onClick={()=>setActiveFaq(activeFaq===i?null:i)}
                      style={{width:'100%',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',color:'#F8FAFC',fontSize:13,fontWeight:600,textAlign:'left',gap:12,fontFamily:"'Space Grotesk',sans-serif"}}>
                      <span>{faq.q}</span>
                      <span style={{color:activeFaq===i?'#F97316':'#64748B',fontSize:18,flexShrink:0,transition:'transform 0.3s',transform:activeFaq===i?'rotate(45deg)':'none'}}>+</span>
                    </button>
                    {activeFaq===i&&<div style={{padding:'0 18px 14px',fontSize:13,color:'#94A3B8',lineHeight:1.7}}>{faq.a}</div>}
                  </div>
                </SR>
              ))}
            </div>
          </div>
        </SR>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{padding:`80px ${P}`,background:'radial-gradient(ellipse 70% 50% at 50% 100%,rgba(249,115,22,0.05) 0%,transparent 60%),#080B10',borderTop:'1px solid rgba(249,115,22,0.06)'}}>
        <SR anim="riseUp">
          <div className="contact-grid" style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:60,alignItems:'start'}}>
            <div>
              <Tag>Get Started</Tag>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:8,background:'rgba(249,115,22,0.06)',border:'1px solid rgba(249,115,22,0.2)',marginBottom:14}}>
                <span style={{fontSize:14}}>⛏</span>
                <span style={{fontSize:12,fontWeight:700,color:'#F97316',fontStyle:'italic'}}>"Built by drillers, for drillers."</span>
              </div>
              <h2 style={{fontSize:'clamp(22px,2.8vw,36px)',fontWeight:800,lineHeight:1.15,marginBottom:12,letterSpacing:'-0.01em',fontFamily:"'Space Grotesk',sans-serif"}}>
                Transform your drilling with <span style={{background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI.</span>
              </h2>
              <p style={{fontSize:14,color:'#94A3B8',lineHeight:1.7,marginBottom:24}}>
                Book a personalised 15-minute walkthrough. We'll show you how teams cut downtime, boost productivity and digitise drill logs in under 30 days.
              </p>
              {[
                {icon:'🌍',title:'Deployed across 30+ countries',  sub:'Global infrastructure, local support teams'},
                {icon:'⚡',title:'Live in under 30 minutes',        sub:'No IT team needed — just your login'},
                {icon:'🛡',title:'Enterprise security & SSO',       sub:'SOC 2 compliant, end-to-end encrypted'},
                {icon:'🤖',title:'AI insights from day one',        sub:'No training — insights start immediately'},
              ].map((pt,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:38,height:38,borderRadius:9,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{pt.icon}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:'#F8FAFC'}}>{pt.title}</div>
                    <div style={{fontSize:11,color:'#64748B',marginTop:1}}>{pt.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <TiltCard>
              <div style={{background:'rgba(13,17,23,0.9)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:18,padding:26,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#F97316,#F59E0B,#3B82F6)'}}/>
                <div style={{fontSize:15,fontWeight:700,color:'#F8FAFC',marginBottom:18,fontFamily:"'Space Grotesk',sans-serif"}}>Book a Free Demo</div>
                {[
                  [{label:'Name',ph:'Jane Doe',type:'text'},{label:'Company',ph:'Acme Drilling Co.',type:'text'}],
                  [{label:'Email',ph:'jane@acme.com',type:'email'},{label:'Phone',ph:'+1 555 000 1234',type:'tel'}],
                ].map((row,ri)=>(
                  <div key={ri} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {row.map((f,fi)=>(
                      <div key={fi} style={{marginBottom:10}}>
                        <label style={{fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:4}}>{f.label}</label>
                        <input type={f.type} placeholder={f.ph} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none'}}
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
                  <div key={i} style={{marginBottom:10}}>
                    <label style={{fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:4}}>{f.label}</label>
                    <select style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(13,17,23,0.9)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none',cursor:'pointer',appearance:'none' as const}}
                      onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.5)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)'}}>
                      {f.opts.map(o=><option key={o} style={{background:'#0D1117'}}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:4}}>Message</label>
                  <textarea placeholder="Tell us about your fleet size..." rows={3}
                    style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none',resize:'vertical' as const}}
                    onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.5)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)'}}/>
                </div>
                <div style={{display:'flex',gap:9}}>
                  <button className="btn-ghost" style={{flex:1,justifyContent:'center',padding:'10px',fontSize:13}}>Contact Sales</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center',padding:'10px',fontSize:13}}>Book Demo →</button>
                </div>
                <p style={{fontSize:10,color:'#64748B',textAlign:'center',marginTop:10}}>By submitting, you agree to our terms & privacy policy.</p>
              </div>
            </TiltCard>
          </div>
        </SR>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0D1117',borderTop:'1px solid rgba(255,255,255,0.06)',padding:`40px ${P} 24px`}}>
        <div className="footer-grid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:32,marginBottom:32}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <XLogo size={30}/>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:'#F8FAFC',fontFamily:"'Space Grotesk',sans-serif"}}>XPLORIX</div>
                <div style={{fontSize:8,color:'#64748B',letterSpacing:'0.15em',textTransform:'uppercase'}}>Drilling Intelligence</div>
              </div>
            </div>
            <p style={{fontSize:12,color:'#64748B',lineHeight:1.7,maxWidth:200,marginBottom:12}}>The world's most advanced drilling intelligence platform. Built for exploration drilling contractors who demand more.</p>
            <div style={{display:'flex',gap:6}}>
              {['L','T','Y'].map((s,i)=>(
                <div key={i} style={{width:28,height:28,borderRadius:6,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#64748B',cursor:'pointer',transition:'all 0.2s'}}
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
              <div style={{fontSize:10,fontWeight:700,color:'#F8FAFC',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>{col.title}</div>
              {col.items.map(l=>(
                <div key={l} style={{fontSize:12,color:'#64748B',marginBottom:7,cursor:'pointer',transition:'color 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:16,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:9}}>
          <p style={{fontSize:11,color:'#64748B'}}>© 2026 XPLORIX · ANMAK CONSULTANCY SERVICES PRIVATE LIMITED</p>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {[
              {l:'Privacy Policy',   h:'/privacy-policy'},
              {l:'Terms of Service', h:'/terms-of-service'},
              {l:'Cookie Policy',    h:'/cookie-policy'},
              {l:'Refund Policy',    h:'/refund-policy'},
            ].map(link=>(
              <a key={link.h} href={link.h} style={{fontSize:11,color:'#64748B',textDecoration:'none',transition:'color 0.2s'}}
                onMouseEnter={e=>(e.currentTarget.style.color='#F97316')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{link.l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

