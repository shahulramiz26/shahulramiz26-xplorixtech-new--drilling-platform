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

// ── FEATURES — SCATTERED 3D FLOATING CARDS ────────────────────────────────
function FeaturesSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const features = [
    {color:'#F97316',title:'Operations Dashboard',  desc:'Live ROP trending & downtime',       kv:[['9.8','ROP'],['92%','Uptime']],    bars:[35,48,60,75,82,92,85,95,78,88]},
    {color:'#3B82F6',title:'Maintenance Dashboard', desc:'Predictive health tracking',         kv:[['4.2','MTBF'],['87%','Health']],   bars:[80,65,55,52,58,70,75,80,65,72]},
    {color:'#10B981',title:'Driller & Crew',        desc:'70+ driller leaderboard',            kv:[['#1','Rank'],['94%','PPE']],       bars:[60,72,80,85,88,90,88,92,85,95]},
    {color:'#EF4444',title:'HSC & Safety',          desc:'Incidents & PPE compliance',         kv:[['186','Days'],['100%','Safe']],    bars:[90,92,86,94,90,96,92,95,90,98]},
    {color:'#F59E0B',title:'Finance & Costing',     desc:'Full cost per meter visibility',     kv:[['$8.2','Cost/m'],['−18%','Save']], bars:[72,65,60,55,52,48,45,50,44,52]},
    {color:'#8B5CF6',title:'Inventory',             desc:'Per-site stock & purchase orders',   kv:[['247','Parts'],['99%','Acc']],     bars:[85,88,90,92,94,96,94,90,96,98]},
    {color:'#EC4899',title:'Performance Reports',   desc:'Verified 4-page PDF certificates',  kv:[['4pg','PDF'],['100%','Verified']], bars:[95,96,90,94,92,96,94,98,96,100]},
    {color:'#60A5FA',title:'Performance Dashboard', desc:'Hole-by-hole analytics',             kv:[['9.8','ROP'],['97%','Rec']],       bars:[40,52,62,70,76,80,84,86,80,88]},
    {color:'#A78BFA',title:'Digital Logging',       desc:'Replace paper, log offline',        kv:[['<5m','Log'],['100%','Digital']],  bars:[88,90,92,94,90,96,93,97,95,98]},
  ]

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = canvas.parentElement!.clientWidth || 1000
    const H = 600
    canvas.width = W; canvas.height = H
    let raf: number, t = 0

    // ── Card definitions ── each card has fixed 3D position + motion params
    type Card = {
      idx: number
      // base position (normalized 0-1)
      bx: number; by: number
      // 3D rotation angles
      rx: number; ry: number; rz: number
      // rotation speeds
      vrx: number; vry: number; vrz: number
      // floating motion
      phase: number; amp: number; freq: number
      // visual
      scale: number; alpha: number
      // glow pulse
      pulse: number; pulseV: number
    }

    const cards: Card[] = [
      // Bottom-left cluster — large, close
      {idx:1,bx:0.18,by:0.72,rx:-12,ry:15,rz:-8, vrx:0.008,vry:0.012,vrz:0.006, phase:0,amp:8,freq:0.4, scale:1.0,alpha:1.0, pulse:0,pulseV:0.02},
      {idx:3,bx:0.32,by:0.68,rx:-8, ry:20,rz:5,  vrx:0.006,vry:0.01, vrz:0.008, phase:1,amp:6,freq:0.35,scale:0.95,alpha:0.95,pulse:1,pulseV:0.018},
      {idx:4,bx:0.46,by:0.64,rx:-15,ry:12,rz:-3, vrx:0.01, vry:0.008,vrz:0.005, phase:2,amp:10,freq:0.3,scale:0.92,alpha:0.9, pulse:2,pulseV:0.022},
      {idx:5,bx:0.62,by:0.58,rx:-5, ry:18,rz:8,  vrx:0.007,vry:0.015,vrz:0.009, phase:0.5,amp:7,freq:0.45,scale:1.05,alpha:1.0,pulse:3,pulseV:0.016},
      // Mid right — slightly back
      {idx:6,bx:0.72,by:0.44,rx:-10,ry:8, rz:4,  vrx:0.009,vry:0.011,vrz:0.007, phase:1.5,amp:9,freq:0.38,scale:0.88,alpha:0.85,pulse:4,pulseV:0.02},
      // Upper area — further back, darker
      {idx:0,bx:0.28,by:0.32,rx:-20,ry:25,rz:-12,vrx:0.005,vry:0.008,vrz:0.004, phase:0.8,amp:12,freq:0.25,scale:0.72,alpha:0.65,pulse:5,pulseV:0.015},
      {idx:2,bx:0.45,by:0.26,rx:-18,ry:22,rz:6,  vrx:0.006,vry:0.009,vrz:0.005, phase:2.2,amp:11,freq:0.28,scale:0.68,alpha:0.6, pulse:0.5,pulseV:0.017},
      {idx:7,bx:0.62,by:0.3, rx:-22,ry:18,rz:-8, vrx:0.004,vry:0.007,vrz:0.006, phase:1.8,amp:10,freq:0.32,scale:0.65,alpha:0.55,pulse:1.5,pulseV:0.014},
      {idx:8,bx:0.75,by:0.22,rx:-25,ry:28,rz:10, vrx:0.003,vry:0.006,vrz:0.004, phase:3,  amp:14,freq:0.22,scale:0.55,alpha:0.45,pulse:2.5,pulseV:0.012},
    ]

    // Particles
    const NPAR = 120
    const pars = Array.from({length:NPAR},()=>({
      x:Math.random()*1000,y:Math.random()*H,
      vx:(Math.random()-0.5)*0.2,vy:-(Math.random()*0.4+0.05),
      s:Math.random()*1.5+0.2,o:Math.random()*0.5+0.1,
      c:Math.random()>0.55?'#F97316':Math.random()>0.4?'#8B5CF6':'#3B82F6'
    }))

    const hexRgb = (h:string)=>{
      const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16)
      return `${r},${g},${b}`
    }

    const rr=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number)=>{
      ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath()
    }

    // Project 3D card to 2D with perspective
    const project3D = (card: Card, time: number) => {
      // Floating motion
      const fy = Math.sin(time * card.freq + card.phase) * card.amp
      const fx = Math.cos(time * card.freq * 0.7 + card.phase) * card.amp * 0.4

      const px = (card.bx + fx/W) * W
      const py = (card.by + fy/H) * H

      // Accumulated rotation
      const rx = card.rx + Math.sin(time*0.3+card.phase)*3
      const ry = card.ry + Math.sin(time*0.25+card.phase*1.3)*4
      const rz = card.rz + Math.sin(time*0.2+card.phase*0.7)*2

      return {px, py, rx, ry, rz}
    }

    const drawCard = (card: Card, time: number) => {
      const f = features[card.idx]
      const {px,py,rx,ry,rz} = project3D(card, time)
      const CW = 220*card.scale, CH = 270*card.scale

      // Perspective skew from rotation angles
      const skewY = ry * 0.018  // horizontal rotation → skew
      const skewX = rx * 0.012  // vertical rotation → vertical skew
      const cosA = Math.cos(rz*Math.PI/180)
      const sinA = Math.sin(rz*Math.PI/180)

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(rz * Math.PI/180)
      ctx.transform(1, skewX, skewY, 1, 0, 0)
      ctx.globalAlpha = card.alpha * (0.85 + Math.sin(card.pulse)*0.15)

      // Glow behind card
      const glow = ctx.createRadialGradient(0,0,0,0,0,CW*0.8)
      glow.addColorStop(0, `rgba(${hexRgb(f.color)},${0.12*card.alpha})`)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(-CW*0.7,-CH*0.5,CW*1.4,CH*1.1)

      // Glass body
      const bg = ctx.createLinearGradient(-CW/2,-CH/2,CW/2,CH/2)
      bg.addColorStop(0,`rgba(255,255,255,0.07)`)
      bg.addColorStop(0.3,`rgba(8,8,20,0.88)`)
      bg.addColorStop(1,`rgba(${hexRgb(f.color)},0.05)`)
      ctx.fillStyle = bg
      rr(ctx,-CW/2,-CH/2,CW,CH,14*card.scale)
      ctx.fill()

      // Border with glow
      ctx.strokeStyle = `rgba(${hexRgb(f.color)},${0.5+Math.sin(card.pulse)*0.3})`
      ctx.lineWidth = 1.2
      rr(ctx,-CW/2,-CH/2,CW,CH,14*card.scale)
      ctx.stroke()

      // Top accent bar
      const bar = ctx.createLinearGradient(-CW/2,0,CW/2,0)
      bar.addColorStop(0,f.color); bar.addColorStop(0.7,f.color+'80'); bar.addColorStop(1,'transparent')
      ctx.fillStyle=bar
      rr(ctx,-CW/2,-CH/2,CW,2.5*card.scale,2)
      ctx.fill()

      // Glass shine
      const shine = ctx.createLinearGradient(-CW/2,-CH/2,-CW/2,-CH/2+CH*0.3)
      shine.addColorStop(0,`rgba(255,255,255,${0.08*card.alpha})`); shine.addColorStop(1,'transparent')
      ctx.fillStyle=shine
      rr(ctx,-CW/2,-CH/2,CW,CH*0.3,14*card.scale)
      ctx.fill()

      // Content
      const s = card.scale
      // Chrome dots
      ;['#EF4444','#F59E0B','#10B981'].forEach((c,i)=>{
        ctx.fillStyle=c; ctx.beginPath()
        ctx.arc(-CW/2+10*s+i*9*s,-CH/2+12*s,2.5*s,0,Math.PI*2); ctx.fill()
      })

      // Title
      ctx.fillStyle=f.color; ctx.font=`bold ${10*s}px 'Space Grotesk',sans-serif`
      ctx.textAlign='left'
      ctx.shadowBlur=6; ctx.shadowColor=f.color
      ctx.fillText(f.title,-CW/2+10*s,-CH/2+26*s)
      ctx.shadowBlur=0

      // KV pairs
      f.kv.forEach(([v,l],ki)=>{
        const kx=-CW/2+10*s+(CW/2-8*s)*ki, ky=-CH/2+34*s
        const kw=CW/2-14*s, kh=34*s
        ctx.fillStyle=`rgba(${hexRgb(f.color)},0.12)`
        rr(ctx,kx,ky,kw,kh,5*s); ctx.fill()
        ctx.fillStyle=f.color; ctx.font=`bold ${12*s}px 'JetBrains Mono',monospace`
        ctx.fillText(v,kx+5*s,ky+14*s)
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font=`${7*s}px 'Space Grotesk',sans-serif`
        ctx.fillText(l,kx+5*s,ky+26*s)
      })

      // Bar chart
      const bars=f.bars; const bw=(CW-20*s)/bars.length; const bH=38*s
      const by=-CH/2+78*s
      bars.forEach((h,bi)=>{
        ctx.fillStyle=bi>=7?f.color:`rgba(${hexRgb(f.color)},0.3)`
        const bh=(h/100)*bH
        ctx.fillRect(-CW/2+10*s+bi*bw,by+bH-bh,bw-1.5*s,bh)
      })

      // Desc
      ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font=`${8.5*s}px 'Space Grotesk',sans-serif`
      const words=f.desc.split(' '); let line='',lY=by+bH+13*s,lH=11*s
      words.forEach(w=>{
        const test=line+w+' '
        if(ctx.measureText(test).width>CW-20*s&&line){ctx.fillText(line,-CW/2+10*s,lY);line=w+' ';lY+=lH}else line=test
      })
      if(line) ctx.fillText(line,-CW/2+10*s,lY)

      // Bottom title glow
      ctx.shadowBlur=8; ctx.shadowColor=f.color
      ctx.fillStyle=f.color; ctx.font=`bold ${8*s}px 'Space Grotesk',sans-serif`
      ctx.textAlign='center'
      ctx.fillText(f.title.toUpperCase(),0,CH/2-10*s)
      ctx.shadowBlur=0

      ctx.restore()
      card.pulse += card.pulseV
    }

    const loop = (ts:number) => {
      t = ts*0.001
      ctx.clearRect(0,0,W,H)

      // Deep background
      ctx.fillStyle='#020008'; ctx.fillRect(0,0,W,H)

      // Nebula clouds
      ;[
        {x:W*0.3,y:H*0.6,r:W*0.4,c:'249,115,22',a:0.018},
        {x:W*0.7,y:H*0.4,r:W*0.35,c:'139,92,246',a:0.015},
        {x:W*0.5,y:H*0.3,r:W*0.3, c:'59,130,246',a:0.012},
      ].forEach(n=>{
        const g=ctx.createRadialGradient(n.x+Math.sin(t*0.08)*30,n.y+Math.cos(t*0.06)*20,0,n.x,n.y,n.r)
        g.addColorStop(0,`rgba(${n.c},${n.a})`); g.addColorStop(1,'transparent')
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
      })

      // Grid
      ctx.save(); ctx.globalAlpha=0.025; ctx.strokeStyle='#94A3B8'; ctx.lineWidth=0.5
      for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      ctx.restore()

      // Particles
      ctx.save()
      pars.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy
        if(p.y<-5){p.y=H+5;p.x=Math.random()*W}
        ctx.globalAlpha=p.o*0.55; ctx.fillStyle=p.c
        ctx.shadowBlur=p.s*3; ctx.shadowColor=p.c
        ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill()
      })
      ctx.shadowBlur=0; ctx.restore()

      // Sort back-to-front by scale (smaller=further back)
      const sorted=[...cards].sort((a,b)=>a.scale-b.scale)
      sorted.forEach(card=>drawCard(card,t))

      raf=requestAnimationFrame(loop)
    }
    raf=requestAnimationFrame(loop)

    const resize=()=>{W=canvas.parentElement!.clientWidth||1000;canvas.width=W;canvas.height=H}
    window.addEventListener('resize',resize)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])

  return (
    <div style={{position:'relative',width:'100%',height:600,background:'#020008',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/>
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 6px)',pointerEvents:'none',zIndex:2}}/>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 90% 100% at 50% 50%,transparent 45%,rgba(0,0,8,0.65) 100%)',pointerEvents:'none',zIndex:3}}/>
      <div style={{position:'absolute',top:0,left:0,right:0,height:80,background:'linear-gradient(180deg,#020008,transparent)',pointerEvents:'none',zIndex:4}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:80,background:'linear-gradient(0deg,#020008,transparent)',pointerEvents:'none',zIndex:4}}/>
    </div>
  )
}


// ── INTRO SPLASH ──────────────────────────────────────────────────────────
function IntroSplash({onDone}:{onDone:()=>void}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = window.innerWidth, H = window.innerHeight
    canvas.width=W; canvas.height=H
    let raf:number, t=0, phase=0

    // Particles forming logo
    const NPAR=200
    const pars = Array.from({length:NPAR},()=>({
      x:Math.random()*W, y:Math.random()*H,
      tx:W/2+(Math.random()-0.5)*120, ty:H/2+(Math.random()-0.5)*80,
      vx:0,vy:0,
      s:Math.random()*2+0.5,
      c:Math.random()>0.5?'#F97316':Math.random()>0.5?'#8B5CF6':'#ffffff',
      o:Math.random()*0.8+0.2
    }))

    const loop=(ts:number)=>{
      t=ts*0.001; phase=Math.min(phase+0.012,1)
      ctx.fillStyle=`rgba(0,0,5,${phase<0.15?0.3:0.15})`
      ctx.fillRect(0,0,W,H)

      // Phase 0-0.3: particles drift in
      // Phase 0.3-0.6: logo + text appear
      // Phase 0.6-0.85: hold
      // Phase 0.85-1.0: fade out → call onDone

      const p1=Math.min(phase/0.3,1)
      const p2=Math.max(0,Math.min((phase-0.3)/0.3,1))
      const p3=Math.max(0,(phase-0.85)/0.15)

      // Particles
      pars.forEach(p=>{
        if(p1<1){
          p.vx+=(p.tx-p.x)*0.04*p1; p.vy+=(p.ty-p.y)*0.04*p1
          p.vx*=0.85; p.vy*=0.85
        }
        p.x+=p.vx+(Math.sin(t*2+p.o)*0.3)
        p.y+=p.vy+(Math.cos(t*1.5+p.o)*0.3)
        ctx.save()
        ctx.globalAlpha=p.o*p1*(1-p3*1.5)*0.7
        ctx.fillStyle=p.c; ctx.shadowBlur=p.s*4; ctx.shadowColor=p.c
        ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill()
        ctx.restore()
      })

      if(p2>0){
        const alpha=p2*(1-p3)
        // Logo X — centered
        const lx=W/2, ly=H/2-60, ls=50
        ctx.save(); ctx.globalAlpha=alpha
        // Left dark half
        ctx.fillStyle='#1a1a1a'
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx-ls*0.9,ly-ls*0.9);ctx.lineTo(lx-ls*0.9,ly+ls*0.9);ctx.closePath();ctx.fill()
        ctx.fillStyle='#2a2a2a'
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx-ls*0.9,ly-ls*0.9);ctx.lineTo(lx-ls*0.45,ly-ls*0.9);ctx.closePath();ctx.fill()
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx-ls*0.9,ly+ls*0.9);ctx.lineTo(lx-ls*0.45,ly+ls*0.9);ctx.closePath();ctx.fill()
        // Right orange half
        ctx.fillStyle='#F97316'
        ctx.shadowBlur=40; ctx.shadowColor='#F97316'
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+ls*0.9,ly-ls*0.9);ctx.lineTo(lx+ls*0.9,ly+ls*0.9);ctx.closePath();ctx.fill()
        ctx.fillStyle='#EA580C'
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+ls*0.9,ly-ls*0.9);ctx.lineTo(lx+ls*0.45,ly-ls*0.9);ctx.closePath();ctx.fill()
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+ls*0.9,ly+ls*0.9);ctx.lineTo(lx+ls*0.45,ly+ls*0.9);ctx.closePath();ctx.fill()
        ctx.shadowBlur=0

        // XPLORIX text
        ctx.fillStyle='#F8FAFC'; ctx.font=`800 ${Math.min(36,W*0.038)}px 'Space Grotesk',sans-serif`
        ctx.textAlign='center'; ctx.letterSpacing='0.15em' as any
        ctx.shadowBlur=0; ctx.fillText('XPLORIX',W/2,H/2+20)

        // Tagline
        ctx.fillStyle='#F97316'; ctx.font=`600 ${Math.min(13,W*0.013)}px 'Space Grotesk',sans-serif`
        ctx.shadowBlur=10; ctx.shadowColor='#F97316'
        ctx.fillText('DRILLING INTELLIGENCE REIMAGINED',W/2,H/2+48)
        ctx.shadowBlur=0
        ctx.restore()
      }

      // Outer fade overlay when exiting
      if(p3>0){
        ctx.save(); ctx.globalAlpha=p3
        ctx.fillStyle='#080B10'; ctx.fillRect(0,0,W,H)
        ctx.restore()
        if(p3>=0.9) { cancelAnimationFrame(raf); onDone(); return }
      }

      raf=requestAnimationFrame(loop)
    }
    raf=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(raf)
  },[])

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'#000005'}}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true)
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
      {showIntro && <IntroSplash onDone={()=>setShowIntro(false)}/>}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#080B10;}::-webkit-scrollbar-thumb{background:linear-gradient(#F97316,#3B82F6);border-radius:2px;}
        @keyframes xplPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}
        @keyframes xplFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
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

      {/* FEATURES */}
      <section id="features" style={{background:'#000005',borderTop:'1px solid rgba(249,115,22,0.08)',borderBottom:'1px solid rgba(249,115,22,0.08)'}}>
        {/* Header above canvas */}
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
        {/* Cinematic canvas — full width */}
        <SR anim="unfold">
          <FeaturesSection/>
        </SR>
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

