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

// ── FEATURES — 3D VERTICAL CONVEYOR ──────────────────────────────────────
function FeaturesSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const MODULES = [
    {num:'01',title:'OPERATIONS',           sub:'LIVE RIG TELEMETRY',       color:'#F97316',fields:[['ROP AVG','18.4 m/h'],['DOWNTIME','2.1 %'],   ['RIGS ONLINE','27 / 28']]},
    {num:'02',title:'MAINTENANCE',          sub:'PREDICTIVE HEALTH',        color:'#3B82F6',fields:[['HEALTH SCORE','94'],   ['FAILURES PREV.','41'],['OPEN ALERTS','3']]},
    {num:'03',title:'DRILLER & CREW',       sub:'PERFORMANCE RANKED',       color:'#10B981',fields:[['DRILLERS','72'],        ['CERTIFICATES','1,284'],['TOP BOARD','R. Mendez']]},
    {num:'04',title:'HSC & SAFETY',         sub:'ZERO-INCIDENT WORKFLOW',   color:'#EF4444',fields:[['INCIDENT-FREE','184 d'],['PPE COMPLIANCE','99.2 %'],['NEAR-MISSES','12']]},
    {num:'05',title:'FINANCE & COSTING',    sub:'COST PER METER',           color:'#F59E0B',fields:[['COST / METER','$184'],  ['MARGIN','31 %'],      ['PROJECTS','14']]},
    {num:'06',title:'INVENTORY',            sub:'AUTO-DEDUCTED STOCK',      color:'#8B5CF6',fields:[['SKUS','3,841'],          ['OPEN POS','27'],       ['OUT RISK','Low']]},
    {num:'07',title:'PERFORMANCE REPORTS',  sub:'SIGNED PDF CERTIFICATES',  color:'#EC4899',fields:[['CERTS ISSUED','1,284'], ['PG / REPORT','4'],     ['VERIFY','Blockchain']]},
    {num:'08',title:'PERFORMANCE DASHBOARD',sub:'HOLE-BY-HOLE ANALYTICS',   color:'#60A5FA',fields:[['HOLES','9,412'],          ['ROP GAIN','+18 %'],    ['FORMATIONS','23']]},
    {num:'09',title:'DIGITAL LOGGING',      sub:'OFFLINE-FIRST SYNC',       color:'#A78BFA',fields:[['LOGS','8,203'],           ['SYNC LAG','< 2 s'],    ['PAPER GONE','100 %']]},
  ]

  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')!
    let W:number, H:number, raf:number
    let scrollY = 0

    const CARD_H = 158, CARD_GAP = 34, STEP = CARD_H + CARD_GAP
    const TOTAL = MODULES.length * STEP

    const STARS = Array.from({length:230},()=>({
      x:Math.random(),y:Math.random(),
      s:Math.random()*1.8+0.25,
      o:Math.random()*0.55+0.05,
      c:Math.random()>0.78?'#F97316':Math.random()>0.62?'#F59E0B':Math.random()>0.5?'#6366F1':'#1E293B',
      drift:(Math.random()-0.5)*0.000055,
      tw:Math.random()*Math.PI*2,ts:0.012+Math.random()*0.02,
    }))

    function resize(){
      if(!canvas) return
      const r=(canvas.parentElement||document.body).getBoundingClientRect()
      const dpr=window.devicePixelRatio||1
      canvas.width=r.width*dpr; canvas.height=r.height*dpr
      ctx.setTransform(dpr,0,0,dpr,0,0)
      W=r.width; H=r.height
    }

    function hexRgb(h:string){
      return `${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`
    }

    function rr(x:number,y:number,w:number,h:number,r:number){
      ctx.beginPath()
      ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r)
      ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r)
      ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r)
      ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r)
      ctx.closePath()
    }

    function drawCard(card:typeof MODULES[0],cx:number,cy:number,normDist:number,scale:number,alpha:number){
      const CW=440*scale, CH=CARD_H*scale, s=scale
      const rgb=hexRgb(card.color)

      const tiltDeg=normDist*60
      const cosT=Math.cos(tiltDeg*Math.PI/180)
      const sinT=Math.sin(Math.abs(tiltDeg)*Math.PI/180)
      const lateralX=normDist*20*scale
      const skewH=normDist*0.042
      const skewV=sinT*0.09*(normDist>0?1:-1)

      ctx.save()
      ctx.translate(cx+lateralX,cy)
      ctx.transform(1,skewV,skewH,cosT,0,0)
      ctx.globalAlpha=alpha

      // Shadow/depth glow
      if(alpha>0.28){
        ctx.shadowColor=`rgba(${rgb},${0.38*alpha})`
        ctx.shadowBlur=32*scale
        ctx.shadowOffsetY=7*scale
      }

      // Card body
      const bg=ctx.createLinearGradient(-CW/2,-CH/2,CW/2,CH/2)
      bg.addColorStop(0,'rgba(8,10,28,0.99)')
      bg.addColorStop(0.55,'rgba(12,14,34,0.97)')
      bg.addColorStop(1,`rgba(${rgb},0.11)`)
      ctx.fillStyle=bg
      rr(-CW/2,-CH/2,CW,CH,13*s); ctx.fill()
      ctx.shadowBlur=0; ctx.shadowOffsetY=0

      // Glowing border
      ctx.strokeStyle=`rgba(${rgb},${0.22+alpha*0.32})`
      ctx.lineWidth=1.1*s
      rr(-CW/2,-CH/2,CW,CH,13*s); ctx.stroke()

      // Top accent bar
      const tb=ctx.createLinearGradient(-CW/2,0,CW/2,0)
      tb.addColorStop(0,'transparent'); tb.addColorStop(0.2,card.color)
      tb.addColorStop(0.8,card.color); tb.addColorStop(1,'transparent')
      ctx.fillStyle=tb
      ctx.fillRect(-CW/2,-CH/2,CW,2.2*s)

      // Glass shine
      const shine=ctx.createLinearGradient(-CW/2,-CH/2,CW/2*0.5,CH/2*0.35)
      shine.addColorStop(0,`rgba(255,255,255,${0.045*alpha})`); shine.addColorStop(1,'transparent')
      ctx.fillStyle=shine
      rr(-CW/2,-CH/2,CW,CH*0.48,13*s); ctx.fill()

      // Corner brackets
      const bL=22*s
      ctx.strokeStyle=`rgba(${rgb},0.82)`
      ctx.lineWidth=2*s
      ;[[-CW/2,-CH/2,1,1],[CW/2,-CH/2,-1,1],[-CW/2,CH/2,1,-1],[CW/2,CH/2,-1,-1]].forEach(([x,y,dx,dy])=>{
        ctx.beginPath()
        ctx.moveTo(x+dx*bL,y); ctx.lineTo(x,y); ctx.lineTo(x,y+dy*bL)
        ctx.stroke()
      })

      // XPX / num
      ctx.font=`${9*s}px 'Courier New',monospace`
      ctx.fillStyle='#2D4060'; ctx.textAlign='left'; ctx.textBaseline='top'
      ctx.fillText(`XPX / ${card.num}`,-CW/2+16*s,-CH/2+13*s)

      // LIVE indicator
      ctx.fillStyle='#10B981'
      ctx.shadowBlur=7; ctx.shadowColor='#10B981'
      ctx.beginPath(); ctx.arc(CW/2-28*s,-CH/2+18*s,3.5*s,0,Math.PI*2); ctx.fill()
      ctx.shadowBlur=0
      ctx.font=`bold ${8.5*s}px 'Space Grotesk',sans-serif`
      ctx.fillStyle='#10B981'; ctx.textAlign='right'; ctx.textBaseline='middle'
      ctx.fillText('LIVE',CW/2-11*s,-CH/2+18*s)

      // Title
      ctx.textAlign='left'; ctx.textBaseline='top'
      ctx.font=`800 ${16*s}px 'Space Grotesk',sans-serif`
      ctx.fillStyle='#F8FAFC'
      if(alpha>0.55){ctx.shadowBlur=16;ctx.shadowColor=card.color}
      ctx.fillText(card.title,-CW/2+16*s,-CH/2+31*s)
      ctx.shadowBlur=0

      // Sub
      ctx.font=`${9.5*s}px 'Space Grotesk',sans-serif`
      ctx.fillStyle='#3D5068'
      ctx.fillText(card.sub,-CW/2+16*s,-CH/2+52*s)

      // Divider
      const dv=ctx.createLinearGradient(-CW/2,0,CW/2,0)
      dv.addColorStop(0,'transparent'); dv.addColorStop(0.25,`rgba(${rgb},0.28)`)
      dv.addColorStop(0.75,`rgba(${rgb},0.28)`); dv.addColorStop(1,'transparent')
      ctx.strokeStyle=dv; ctx.lineWidth=0.7
      ctx.beginPath()
      ctx.moveTo(-CW/2+16*s,-CH/2+66*s); ctx.lineTo(CW/2-16*s,-CH/2+66*s)
      ctx.stroke()

      // Data fields — 3 columns
      const colW=(CW-32*s)/3
      card.fields.forEach((f,fi)=>{
        const fx=-CW/2+16*s+fi*colW
        const fy=-CH/2+75*s
        ctx.fillStyle=`rgba(${rgb},${fi===0?0.10:0.04})`
        rr(fx-4*s,fy-3*s,colW-10*s,44*s,6*s); ctx.fill()
        ctx.font=`${8*s}px 'Space Grotesk',sans-serif`
        ctx.fillStyle='#2D4060'; ctx.textAlign='left'; ctx.textBaseline='top'
        ctx.fillText(f[0],fx,fy)
        ctx.font=`800 ${15*s}px 'Space Grotesk',monospace`
        ctx.fillStyle=fi===0?card.color:'#CBD5E1'
        if(fi===0&&alpha>0.55){ctx.shadowBlur=9;ctx.shadowColor=card.color}
        ctx.fillText(f[1],fx,fy+14*s)
        ctx.shadowBlur=0
      })

      ctx.restore()
    }

    function loop(ts:number){
      const t=ts*0.001
      scrollY+=0.5
      if(scrollY>=TOTAL) scrollY-=TOTAL

      ctx.clearRect(0,0,W,H)
      ctx.fillStyle='#000008'; ctx.fillRect(0,0,W,H)

      // Nebula
      ;[
        {x:0.5,y:0.45,r:0.56,c:'249,115,22',a:0.022},
        {x:0.33,y:0.62,r:0.42,c:'139,92,246',a:0.016},
        {x:0.66,y:0.34,r:0.36,c:'59,130,246',a:0.013},
      ].forEach(n=>{
        const ox=Math.sin(t*0.07+n.x)*28, oy=Math.cos(t*0.05+n.y)*20
        const g=ctx.createRadialGradient(W*n.x+ox,H*n.y+oy,0,W*n.x,H*n.y,W*n.r)
        g.addColorStop(0,`rgba(${n.c},${n.a})`); g.addColorStop(1,'transparent')
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
      })

      // Stars
      STARS.forEach(s=>{
        s.x+=s.drift; s.tw+=s.ts
        if(s.x>1)s.x=0; if(s.x<0)s.x=1
        ctx.globalAlpha=s.o*(0.4+0.6*Math.sin(s.tw))
        ctx.fillStyle=s.c
        ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.s,0,Math.PI*2); ctx.fill()
      })
      ctx.globalAlpha=1

      const centerX=W*0.5, centerY=H*0.5, visH=H*0.9
      const visible:Array<{card:typeof MODULES[0];cx:number;cy:number;normDist:number;scale:number;alpha:number}>=[]

      for(let lp=-1;lp<=1;lp++){
        for(let i=0;i<MODULES.length;i++){
          const baseY=i*STEP-scrollY+lp*TOTAL
          const relY=baseY-(centerY-visH/2)
          const cy=centerY-visH/2+relY+CARD_H/2
          if(cy<-CARD_H*1.6||cy>H+CARD_H*1.6) continue
          const normDist=(cy-centerY)/(visH/2)
          const absDist=Math.abs(normDist)
          const scale=Math.max(0.44,1.0-absDist*0.44)
          const alpha=Math.max(0,1.0-absDist*1.08)
          if(alpha<0.02) continue
          visible.push({card:MODULES[i],cx:centerX,cy,normDist,scale,alpha})
        }
      }

      visible.sort((a,b)=>a.scale-b.scale)
      visible.forEach(v=>drawCard(v.card,v.cx,v.cy,v.normDist,v.scale,v.alpha))

      // Vignettes top/bottom
      const tg=ctx.createLinearGradient(0,0,0,H*0.2)
      tg.addColorStop(0,'rgba(0,0,8,1)'); tg.addColorStop(1,'transparent')
      ctx.fillStyle=tg; ctx.fillRect(0,0,W,H*0.2)
      const bg2=ctx.createLinearGradient(0,H*0.8,0,H)
      bg2.addColorStop(0,'transparent'); bg2.addColorStop(1,'rgba(0,0,8,1)')
      ctx.fillStyle=bg2; ctx.fillRect(0,H*0.8,W,H*0.2)

      raf=requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize',resize)
    raf=requestAnimationFrame(loop)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])

  return (
    <div style={{position:'relative',width:'100%',height:640,background:'#000008',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/>
      {/* Side vignettes */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(0,0,8,0.5) 0%,transparent 16%,transparent 84%,rgba(0,0,8,0.5) 100%)',pointerEvents:'none',zIndex:2}}/>
    </div>
  )
}

// ── INTRO SPLASH — 4 SECOND CINEMATIC REVEAL ─────────────────────────────
function IntroSplash({onDone}:{onDone:()=>void}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = window.innerWidth, H = window.innerHeight
    canvas.width=W; canvas.height=H
    let raf:number, phase=0

    // ── 260 spark particles ──────────────────────────────────────────────
    const NPAR=260
    const pars=Array.from({length:NPAR},()=>{
      const angle=Math.random()*Math.PI*2
      const speed=Math.random()*3.4+0.9
      return {
        x:W/2,y:H/2,
        vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
        s:Math.random()*2.2+0.4,
        c:Math.random()>0.55?'#F97316':Math.random()>0.5?'#F59E0B':'#ffffff',
        o:Math.random()*0.7+0.3,
        tw:Math.random()*Math.PI*2, ts:0.04+Math.random()*0.06,
      }
    })

    const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v))
    const easeOut=(t:number)=>1-Math.pow(1-t,3)
    const easeInOut=(t:number)=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2
    const lerp=(a:number,b:number,t:number)=>a+(b-a)*t

    // ── DURATION: 4000 ms — increment per ~60fps frame ───────────────────
    const FRAME_INC = 1000/60/4000

    const loop=(ts:number)=>{
      phase=Math.min(phase+FRAME_INC,1)

      // Trail fade
      ctx.fillStyle=`rgba(0,0,5,${phase<0.15?0.25:0.14})`
      ctx.fillRect(0,0,W,H)

      const p1       = clamp(phase/0.28,0,1)            // particle expand
      const burstP   = clamp(phase/0.22,0,1)            // center orb burst
      const textP    = clamp((phase-0.28)/0.38,0,1)     // XPLORIX letters
      const tagP     = clamp((phase-0.52)/0.22,0,1)     // tagline
      const exitP    = clamp((phase-0.82)/0.18,0,1)     // fade out
      const globalFade = 1-exitP

      // ── Seed dot ────────────────────────────────────────────────────────
      if(phase<0.18){
        const da=phase<0.07?phase/0.07:1-(phase-0.07)/0.11
        ctx.save()
        ctx.globalAlpha=clamp(da,0,1)*globalFade
        ctx.shadowBlur=18; ctx.shadowColor='#F97316'
        ctx.fillStyle='#F97316'
        ctx.beginPath(); ctx.arc(W/2,H/2,5+phase*10,0,Math.PI*2); ctx.fill()
        ctx.shadowBlur=0; ctx.restore()
      }

      // ── Burst orb ───────────────────────────────────────────────────────
      const burstR=easeOut(burstP)*W*0.52
      const burstAlpha=burstP<0.14?burstP/0.14:1-(burstP-0.14)/0.86
      if(burstAlpha>0){
        const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,burstR*0.38)
        g.addColorStop(0,`rgba(249,140,50,${0.5*burstAlpha*globalFade})`)
        g.addColorStop(0.35,`rgba(234,88,12,${0.22*burstAlpha*globalFade})`)
        g.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=g
        ctx.beginPath(); ctx.arc(W/2,H/2,burstR*0.38,0,Math.PI*2); ctx.fill()
      }

      // ── Particles explode outward ────────────────────────────────────────
      const expandP=clamp((phase-0.04)/0.30,0,1)
      pars.forEach(p=>{
        p.tw+=p.ts
        p.x=W/2+p.vx*easeOut(expandP)*W*0.54
        p.y=H/2+p.vy*easeOut(expandP)*H*0.54
        const twk=0.5+0.5*Math.sin(p.tw)
        const a=p.o*clamp(expandP/0.2,0,1)*twk*globalFade*0.65
        if(a<=0) return
        ctx.save()
        ctx.globalAlpha=a
        ctx.fillStyle=p.c
        ctx.shadowBlur=p.s*4; ctx.shadowColor=p.c
        ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill()
        ctx.shadowBlur=0; ctx.restore()
      })

      // ── Drifting amber orb follows text ──────────────────────────────────
      const orbMoveP=easeInOut(clamp((phase-0.22)/0.32,0,1))
      const orbX=lerp(W/2,W*0.58,orbMoveP)
      const orbY=lerp(H/2,H*0.44,orbMoveP)
      const orbR=lerp(W*0.05,W*0.30,easeOut(clamp((phase-0.06)/0.32,0,1)))
      const orbAlpha=clamp((phase-0.06)/0.15,0,1)*globalFade
      if(orbAlpha>0){
        const og=ctx.createRadialGradient(orbX,orbY,0,orbX,orbY,orbR)
        og.addColorStop(0,`rgba(249,130,40,${0.52*orbAlpha})`)
        og.addColorStop(0.4,`rgba(234,88,12,${0.18*orbAlpha})`)
        og.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=og
        ctx.beginPath(); ctx.arc(orbX,orbY,orbR,0,Math.PI*2); ctx.fill()
      }

      // ── XPLORIX letters — left-aligned, one by one ───────────────────────
      if(textP>0){
        const LETTERS='XPLORIX'
        const startX=W*0.115
        const baseY=H*0.42
        const fontSize=Math.min(H*0.145,W*0.075)
        ctx.font=`900 ${Math.round(fontSize)}px 'Space Grotesk','Arial Black',sans-serif`
        ctx.textBaseline='middle'; ctx.textAlign='left'

        for(let i=0;i<LETTERS.length;i++){
          const delay=(i/LETTERS.length)*0.44
          const lP=clamp((textP-delay)/0.56,0,1)
          const ep=easeOut(lP)
          const charAlpha=ep*globalFade
          if(charAlpha<=0) continue
          const charX=startX+i*(fontSize*0.72)
          const charY=baseY+(1-ep)*22

          // Glow layer
          ctx.save()
          ctx.globalAlpha=charAlpha*0.15
          ctx.fillStyle='#F97316'
          ctx.fillText(LETTERS[i],charX+2,charY+2)

          // Main letter
          ctx.globalAlpha=charAlpha
          ctx.fillStyle='#F8FAFC'
          ctx.shadowBlur=14*ep; ctx.shadowColor='rgba(249,115,22,0.55)'
          ctx.fillText(LETTERS[i],charX,charY)
          ctx.shadowBlur=0; ctx.restore()
        }
      }

      // ── Tagline ──────────────────────────────────────────────────────────
      if(tagP>0){
        const tA=easeOut(tagP)*globalFade
        const tagFontSize=Math.min(H*0.028,W*0.014)
        const tagY=H*0.42+H*0.095
        ctx.save()
        ctx.globalAlpha=tA
        ctx.fillStyle='#94A3B8'
        ctx.font=`500 ${Math.round(tagFontSize)}px 'Space Grotesk',Arial,sans-serif`
        ctx.textAlign='left'; ctx.textBaseline='middle'
        ;(ctx as any).letterSpacing='0.22em'
        ctx.fillText('DRILLING  INTELLIGENCE  REIMAGINED',W*0.117,tagY)
        ctx.restore()
      }

      // ── Exit fade ────────────────────────────────────────────────────────
      if(exitP>0){
        ctx.save()
        ctx.globalAlpha=easeInOut(exitP)
        ctx.fillStyle='#080B10'; ctx.fillRect(0,0,W,H)
        ctx.restore()
        if(exitP>=0.92){cancelAnimationFrame(raf);onDone();return}
      }

      raf=requestAnimationFrame(loop)
    }
    raf=requestAnimationFrame(loop)

    const onResize=()=>{W=window.innerWidth;H=window.innerHeight;canvas.width=W;canvas.height=H}
    window.addEventListener('resize',onResize)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onResize)}
  },[onDone])

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

      {/* FEATURES — 3D CONVEYOR */}
      <section id="features" style={{background:'#000005',borderTop:'1px solid rgba(249,115,22,0.08)',borderBottom:'1px solid rgba(249,115,22,0.08)'}}>
        {/* Headline */}
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
        {/* 3D Conveyor — no SR wrapper so it renders immediately on scroll */}
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

