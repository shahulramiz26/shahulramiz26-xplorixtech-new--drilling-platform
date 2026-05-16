'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(28px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  )
}

function XLogo({ size = 40 }: { size?: number }) {
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

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:100, border:'1px solid rgba(249,115,22,0.25)', background:'rgba(249,115,22,0.05)', fontSize:10, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase' as const, marginBottom:20 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'#F97316', display:'inline-block' }}/>{children}
    </div>
  )
}

// CHANGE 2: AI TICKER
function AITicker() {
  const items = [
    { text:'⚠ RIG-003 hydraulic anomaly detected — inspect within 48hrs', color:'#F59E0B' },
    { text:'📈 Pilbara Site ROP +23% above industry average this week', color:'#10B981' },
    { text:'💰 NQ SR-08 bits on RIG-004 could cut bit cost/m by 22%', color:'#60A5FA' },
    { text:'🚨 Fuel consumption 31% above 30-day baseline on Site B', color:'#EF4444' },
    { text:'✅ RIG-007 achieved 97.4% core recovery — best shift this month', color:'#10B981' },
    { text:'🔧 Hydraulic oil change due on RIG-002 in 14 operating hours', color:'#60A5FA' },
    { text:'📊 Driller Alex R. downtime 78% above team average — review needed', color:'#F59E0B' },
    { text:'🎯 Gold Mine Project A hit 68% completion — on track for deadline', color:'#10B981' },
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
                {item.text}
                <span style={{ width:4, height:4, borderRadius:'50%', background:'#1E293B', display:'inline-block' }}/>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ECOSYSTEM DIAGRAM
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
          <g key={n.id} onClick={()=>setActiveNode(activeNode===n.id?null:n.id)} style={{ cursor:'pointer' }}>
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

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeFaq, setActiveFaq] = useState<number|null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [typeIndex, setTypeIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const typingWords = ['Reimagined.','Simplified.','Optimized.','Digitized.']

  useEffect(() => {
    const word = typingWords[typeIndex]
    let timeout: ReturnType<typeof setTimeout>
    if (!isDeleting) {
      if (displayText.length < word.length) timeout = setTimeout(()=>setDisplayText(word.slice(0,displayText.length+1)),80)
      else timeout = setTimeout(()=>setIsDeleting(true),2000)
    } else {
      if (displayText.length > 0) timeout = setTimeout(()=>setDisplayText(displayText.slice(0,-1)),40)
      else { setIsDeleting(false); setTypeIndex((typeIndex+1)%typingWords.length) }
    }
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, typeIndex])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    {label:'About',href:'#about'},{label:'Platform',href:'#features'},
    {label:'How it Works',href:'#how'},{label:'AI Insights',href:'#ai'},
    {label:'Industries',href:'#industries'},{label:'Contact',href:'#contact'},
  ]

  // CHANGES 5,6,7: 10 tabs
  const features = [
    {tab:'Operations',    icon:'⚡',color:'#F97316',title:'Real-Time Operations Intelligence',       desc:'Track every meter drilled, every shift, every rig. Live dashboards give you complete visibility into ROP, downtime, core recovery and bit performance.',points:['Live ROP trending & alerts','Meters drilled vs target','Downtime analysis by reason','Bit performance & cost/meter','Formation type comparison','Shift-by-shift productivity'],stat:{label:'Avg ROP Improvement',value:'+23%'}},
    {tab:'Maintenance',   icon:'🔧',color:'#3B82F6',title:'Predictive Maintenance Dashboard',        desc:'Stop reacting to breakdowns. XPLORIX tracks component health, maintenance history and failure patterns — fix problems before they become downtime.',      points:['Component failure tracking','MTBF by rig analysis','Maintenance cost trends','Oil consumption monitoring','Scheduled vs breakdown ratio','Repair action history'],stat:{label:'Downtime Reduction',value:'-35%'}},
    {tab:'Driller & Crew',icon:'👷',color:'#10B981',title:'Driller Performance Leaderboard',         desc:'Know who your top performers are. Track individual driller metrics, compare shifts and identify training opportunities — backed by real drill log data.',  points:['Individual ROP & meters leaderboard','Shift comparison analytics','Crew hours & utilisation','Experience vs performance','Downloadable certificates','Top performer recognition'],stat:{label:'Productivity Gain',value:'+18%'}},
    {tab:'Consumables',   icon:'📦',color:'#8B5CF6',title:'Consumables & Cost Control',              desc:'Track every litre of fuel, every drill bit, every accessory. Connect consumption data to performance — know exactly what\'s being used and why.',       points:['Fuel & water consumption','Accessory usage by cost rank','Inventory level alerts','Supplier performance scoring','Cost per meter breakdown','Waste reduction insights'],stat:{label:'Cost Savings',value:'18%'}},
    {tab:'HSC & Safety',  icon:'🛡',color:'#EF4444',title:'Safety & Compliance Command Centre',       desc:'Zero incidents starts with visibility. XPLORIX tracks safety metrics, PPE compliance, near-misses and training — keeping your team safe and compliant.',  points:['Incident type & severity','PPE compliance by item','Near-miss reporting','Safety training completion','LTIF & TRIF metrics','Hazard reporting'],stat:{label:'Safety Score',value:'98%'}},
    {tab:'Finance',       icon:'💰',color:'#F59E0B',title:'Finance & Costing Intelligence',           desc:'Full cost visibility per project, per rig, per meter. Track drilling costs against budget in real time — from rig day rates to accessory costs.',        points:['Cost per meter live tracking','Rig & fluid pricing master data','Hole-by-hole cost breakdown','Project budget vs actual','Multi-currency support','Exportable cost reports'],stat:{label:'Cost Visibility',value:'100%'}},
    {tab:'Inventory',     icon:'🗄',color:'#10B981',title:'Smart Inventory Management',               desc:'Per-site stock management with purchase orders, auto-deduction from drill logs and real-time alerts. Never run out of critical parts on site again.',     points:['Parts catalogue (Excel import/export)','Per-site stock levels & value','Purchase orders with receive flow','Auto stock deduct on submit','Low stock alert system','Site-to-site transfers'],stat:{label:'Stock Accuracy',value:'99%'}},
    {tab:'Perf. Reports', icon:'📄',color:'#EC4899',title:'Official Performance Certificates',        desc:'Admin generates verified 4-page PDF performance certificates for any driller or supervisor — shareable proof of expertise verified by XPLORIX.',          points:['4-page professional PDF','Career lifetime stats','Industry average comparison','Project history with ratings','Supervisor endorsements','XPLORIX verified badge + QR'],stat:{label:'Verification Rate',value:'100%'}},
    {tab:'Performance',   icon:'📊',color:'#60A5FA',title:'Performance Dashboard — Hole by Hole',    desc:'Deep-dive analytics per project, per rig, per hole. Track meter-by-meter performance, compare holes across formations and identify where productivity is won or lost.',points:['Hole-by-hole analytics','Meter-by-meter tracking','Formation performance comparison','ROP per hole trend','Core recovery per hole','Bit life per hole analysis'],stat:{label:'Drilling Visibility',value:'360°'}},
    {tab:'Digital Logging',icon:'📋',color:'#A78BFA',title:'Digital Drill Log System',               desc:'Replace paper logs completely. Supervisors fill in structured digital shift logs on any device — capturing every data point from engine HMR to bit usage.',points:['10h / 12h shift toggle','Meter start/end auto-calculate','Downtime reason tracking','Bit usage & footage per hole','Consumables & accessories','Incidents & file attachments'],stat:{label:'Paper Eliminated',value:'100%'}},
  ]

  const howItWorks = [
    {step:'01',icon:'🔐',color:'#F97316',side:'left', title:'Register & Get Instant Access',    desc:'Create your company account and receive Admin and Supervisor logins in minutes. Full platform access from day one — no contracts, no IT setup, no credit card required.',badges:[{t:'⏱ 5 min setup',c:'o'},{t:'✓ 15-day free trial',c:'g'},{t:'All features unlocked',c:'n'}],feats:['Admin + Supervisor + Driller roles','Full platform access from day one','No credit card required']},
    {step:'02',icon:'⚙️',color:'#3B82F6',side:'right',title:'Build Your Master Data',            desc:'Create your Project IDs, Rig IDs and Bit IDs. Upload Costing and Inventory master data via CSV files — your entire operation structure is ready in minutes.',       badges:[{t:'📁 CSV upload',c:'b'},{t:'⚡ Instant sync',c:'o'},{t:'Templates included',c:'n'}],feats:['Project, Rig & Bit ID configuration','Costing master data via CSV','Inventory catalogue bulk import']},
    {step:'03',icon:'📋',color:'#10B981',side:'left', title:'Go Live on Day One',                desc:'Supervisors start logging daily drill shifts immediately. Every meter, bit and downtime captured digitally. Full operation tracking starts from your very first log.',  badges:[{t:'✓ Zero training',c:'g'},{t:'📋 Replaces paper',c:'o'},{t:'Works offline',c:'n'}],feats:['Digital shift log on any device','Auto cost & productivity calculation','Inventory auto-deducted on submit']},
    {step:'04',icon:'🧠',color:'#8B5CF6',side:'right',title:'Unlock Full Intelligence',          desc:'The moment your first log is submitted, XPLORIX AI activates. Advanced analytics across 9 dashboards, predictive insights, performance reports — all live, all automatic.',badges:[{t:'🧠 AI insights live',c:'p'},{t:'📊 9 dashboards',c:'o'},{t:'📄 PDF reports',c:'g'}],feats:['AI predicts equipment failures automatically','9 analytics dashboards activated','Driller performance certificates']},
  ]

  const industries = [
    {icon:'⛏',title:'Mining',               desc:'End-to-end visibility for surface & underground mining operations.',  tag:'LIVE'},
    {icon:'🔩',title:'Exploration Drilling', desc:'Built first for diamond core & RC operations in remote environments.', tag:'LIVE'},
    {icon:'🏔',title:'Geotechnical Drilling',desc:'Track investigation programs at scale with full data visibility.',      tag:'LIVE'},
    {icon:'💥',title:'Blast Hole Drilling',  desc:'Productivity intelligence for high-volume production drilling.',        tag:'LIVE'},
  ]

  const aiInsights = [
    {type:'warning',icon:'⚠️',rig:'RIG-003',title:'Hydraulic Anomaly Detected',  desc:'Pressure fluctuation matches pre-failure signature. Inspect within 48hrs.',                               time:'2 min ago', badge:'Predictive Alert'},
    {type:'success',icon:'📈',rig:'RIG-001',title:'ROP Optimisation Found',        desc:'Drilling at 72 bar vs 85 bar improves ROP by 14% in medium formation.',                                 time:'15 min ago',badge:'Performance Tip'},
    {type:'info',   icon:'💰',rig:'All Rigs',title:'Cost Per Meter Opportunity',   desc:'NQ SR-08 bits on RIG-004 could reduce bit cost/m by 22% based on formation data.',                     time:'1 hr ago',  badge:'Cost Insight'},
    {type:'danger', icon:'🚨',rig:'Site B',  title:'Fuel Consumption Spike',       desc:'Fuel usage 31% above 30-day baseline. Possible air compressor inefficiency or fuel leak.',              time:'3 hrs ago', badge:'Anomaly'},
  ]
  const insightColors: Record<string,[string,string]> = {
    warning:['rgba(245,158,11,0.08)','#F59E0B'],success:['rgba(16,185,129,0.08)','#10B981'],
    info:   ['rgba(59,130,246,0.08)','#3B82F6'], danger: ['rgba(239,68,68,0.08)', '#EF4444'],
  }

  const faqs = [
    {q:'How long does it take to set up XPLORIX?',   a:'Most companies are fully operational within 24-48 hours. Our onboarding team guides you through every step.'},
    {q:'Do drillers need training to use the system?',a:'The drill log forms are intuitive — most drillers are comfortable after one shift. We provide video walkthroughs and live support.'},
    {q:'Can XPLORIX work offline on remote sites?',   a:'Yes. The drilling log works offline and automatically syncs when connectivity is restored. Perfect for remote sites.'},
    {q:'How is our drilling data kept secure?',       a:'All data is encrypted in transit and at rest. Each company has completely isolated data. We follow enterprise security standards.'},
    {q:'Can I export data to Excel or PDF?',          a:'Absolutely. All reports, dashboards and drill logs can be exported. Drillers can also download performance certificates directly.'},
    {q:'Do you support multiple projects and sites?', a:'Yes. XPLORIX is built for multi-site, multi-project operations with unlimited projects and rigs.'},
    {q:'What drilling types does XPLORIX support?',   a:'XPLORIX supports Diamond Core, RC, Blast Hole, Geotechnical and other exploration drilling types.'},
    {q:'How does pricing work?',                      a:'Pricing is customised based on your fleet size and required features. Contact our team — most companies find XPLORIX pays for itself within the first month.'},
  ]

  // CHANGE 9: 3 real plans from pricing image
  const plans = [
    {name:'Standard Plan',icon:'🏗',billing:'Monthly Billing — Flexible Usage',highlight:false,badge:'',
     coreLabel:'CORE FEATURES',
     feats:['Advanced digital logging','Fleet performance dashboard','Usage analytics & reporting','Unlimited supervisor logins','Client & management view-only login','Alerts & notifications (downtime, inefficiencies)','Data insights for decision-making','AI Insights for quick & easy analysis','Secure cloud data storage','Standard onboarding support','Online training for teams','Email support (business hours)'],
    },
    {name:'Growth Plan',icon:'📈',billing:'Half-Yearly Billing — 8% Savings',highlight:true,badge:'★ MOST POPULAR',
     coreLabel:'EVERYTHING IN STANDARD, PLUS:',
     feats:['24/7 Priority Support','On-site Training Sessions for Teams','Advanced performance analytics','Trend forecasting & efficiency insights','Faster data refresh rates','Detailed downloadable reports','Priority feature updates'],
    },
    {name:'Enterprise Plan',icon:'💎',billing:'Annual Billing — 16% Savings',highlight:false,badge:'💎 BEST VALUE',
     coreLabel:'EVERYTHING IN GROWTH, PLUS:',
     feats:['Dedicated Account Manager','On-Site Training & Implementation Support','Custom Feature Development (100+ rigs)','Enterprise-grade analytics & insights','API integrations with existing systems','Branding options','Highest system priority & uptime assurance','Advanced security & compliance'],
    },
  ]

  const bs = (c: string) => {
    const map: Record<string,string[]> = {
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
    <div style={{ fontFamily:"'Inter',sans-serif", background:'#080B10', color:'#F8FAFC', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#080B10;}::-webkit-scrollbar-thumb{background:#1E293B;border-radius:2px;}
        @keyframes xplPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}
        @keyframes xplFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .xpl-float{animation:xplFloat 6s ease-in-out infinite;}
        .nav-link{color:#94A3B8;text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;}
        .nav-link:hover{color:#F8FAFC;}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:700;font-size:15px;font-family:'Inter',sans-serif;box-shadow:0 4px 30px rgba(249,115,22,0.3);transition:all 0.25s;text-decoration:none;}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(249,115,22,0.45);}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,0.05);border:1px solid #1E293B;color:#F8FAFC;font-weight:600;font-size:15px;font-family:'Inter',sans-serif;transition:all 0.25s;text-decoration:none;}
        .btn-ghost:hover{background:rgba(255,255,255,0.09);border-color:#334155;}
        .card-hover{transition:all 0.3s;}.card-hover:hover{border-color:rgba(249,115,22,0.3)!important;transform:translateY(-4px);}
        @media(max-width:768px){
          .hero-grid,.about-grid,.ai-grid,.contact-grid{grid-template-columns:1fr!important;}
          .hero-visual{display:none!important;}
          .features-grid{grid-template-columns:1fr!important;}
          .ind-grid,.plans-grid{grid-template-columns:1fr!important;}
          .footer-grid{grid-template-columns:1fr 1fr!important;}
          .tabs-wrap{justify-content:flex-start!important;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:900,padding:'14px 60px',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all 0.3s',background:scrolled?'rgba(8,11,16,0.97)':'rgba(8,11,16,0.7)',backdropFilter:'blur(20px)',borderBottom:scrolled?'1px solid rgba(30,41,59,0.6)':'1px solid transparent' }}>
        <a href="/" style={{ display:'flex',alignItems:'center',gap:12,textDecoration:'none' }}>
          <XLogo size={36}/>
          <div>
            <div style={{ fontSize:16,fontWeight:800,color:'#F8FAFC',letterSpacing:'0.06em',fontFamily:"'Space Grotesk',sans-serif" }}>XPLORIX</div>
            <div style={{ fontSize:8,color:'#64748B',letterSpacing:'0.18em',textTransform:'uppercase' }}>Drilling Intelligence</div>
          </div>
        </a>
        <div style={{ display:'flex',gap:28 }}>
          {navLinks.map(n=><a key={n.href} href={n.href} className="nav-link">{n.label}</a>)}
        </div>
        <div style={{ display:'flex',gap:12,alignItems:'center' }}>
          <Link href="/auth/login" style={{ color:'#94A3B8',textDecoration:'none',fontSize:14,fontWeight:500 }}>Sign in</Link>
          <a href="#contact" className="btn-primary" style={{ padding:'9px 20px',fontSize:13,borderRadius:10 }}>Schedule Demo</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh',display:'flex',alignItems:'center',padding:'120px 60px 60px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(249,115,22,0.07) 0%,transparent 60%),#080B10' }}/>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(30,41,59,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(30,41,59,0.12) 1px,transparent 1px)',backgroundSize:'60px 60px',WebkitMaskImage:'radial-gradient(ellipse 100% 80% at 50% 0%,black 0%,transparent 70%)' }}/>
        <div className="hero-grid" style={{ position:'relative',zIndex:2,width:'100%',maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }}>
          <div>
            <FadeIn>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:100,border:'1px solid rgba(249,115,22,0.3)',background:'rgba(249,115,22,0.05)',fontSize:11,fontWeight:700,color:'#F97316',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:28 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'#F97316',display:'inline-block',animation:'xplPulse 1.5s infinite' }}/>
                Live · AI Drilling Intelligence V3.0
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 style={{ fontSize:'clamp(40px,5vw,72px)',lineHeight:1.05,fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,marginBottom:8 }}>
                Drilling Intelligence<br/>
                <span style={{ color:'#F97316' }}>{displayText}</span>
                <span style={{ borderRight:'3px solid #F97316',marginLeft:2,animation:'xplPulse 1s infinite' }}></span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p style={{ fontSize:16,lineHeight:1.7,color:'#94A3B8',maxWidth:500,marginBottom:32,marginTop:14 }}>
                AI-powered performance intelligence for exploration drilling operations — real-time analytics, digital logging, and smarter decisions. Built for the toughest operations on earth.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div style={{ display:'flex',gap:12,flexWrap:'wrap',marginBottom:32 }}>
                <a href="#contact" className="btn-primary">Schedule Demo →</a>
                <a href="#features" className="btn-ghost">▷ Explore Platform</a>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ display:'flex' }}>
                  {['#F97316','#3B82F6','#10B981','#8B5CF6','#F59E0B'].map((c,i)=>(
                    <div key={i} style={{ width:30,height:30,borderRadius:'50%',background:c,border:'2px solid #080B10',marginLeft:i===0?0:-7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff' }}>
                      {['JW','PN','AA','MK','RT'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex',gap:1,marginBottom:1 }}>{[1,2,3,4,5].map(i=><span key={i} style={{ color:'#F59E0B',fontSize:11 }}>★</span>)}</div>
                  <div style={{ fontSize:11,color:'#64748B' }}><span style={{ color:'#F8FAFC',fontWeight:600 }}>30+ companies</span> trust XPLORIX</div>
                </div>
              </div>
            </FadeIn>
          </div>
          <div className="hero-visual xpl-float"><EcosystemDiagram/></div>
        </div>
      </section>

      {/* CHANGE 2: AI TICKER */}
      <AITicker/>

      {/* ABOUT */}
      <section id="about" style={{ padding:'100px 60px' }}>
        <div className="about-grid" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:80,alignItems:'center' }}>
          <FadeIn>
            <Tag>About Xplorix</Tag>
            <h2 style={{ fontSize:'clamp(30px,4vw,48px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,lineHeight:1.1,marginBottom:18 }}>
              Performance intelligence for <span style={{ color:'#F97316' }}>exploration drilling.</span>
            </h2>
            <p style={{ fontSize:15,color:'#94A3B8',lineHeight:1.8,marginBottom:14 }}>
              Xplorix is built for drilling contractors and exploration companies who are tired of managing operations on spreadsheets, paper logs and WhatsApp groups.
            </p>
            <p style={{ fontSize:15,color:'#94A3B8',lineHeight:1.8,marginBottom:28 }}>
              We replace your entire paper-based workflow with a single intelligent platform — giving you real-time visibility, AI-powered insights, and data-driven decisions across every rig and every site.
            </p>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {['Real-time visibility','AI-powered','Zero paperwork','Multi-site ready','Mobile first'].map(pill=>(
                <span key={pill} style={{ padding:'5px 12px',borderRadius:20,background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',color:'#F97316',fontSize:11,fontWeight:600 }}>{pill}</span>
              ))}
            </div>
          </FadeIn>
          {/* CHANGE 3: Real video */}
          <FadeIn delay={0.2}>
            <div style={{ borderRadius:18,overflow:'hidden',border:'1px solid #1E293B',boxShadow:'0 40px 80px rgba(0,0,0,0.4)',position:'relative',background:'#0D1117' }}>
              <video src="/videos/1st vedio.mp4" autoPlay muted loop playsInline style={{ width:'100%',display:'block' }}/>
              <div style={{ position:'absolute',top:10,left:10,display:'flex',alignItems:'center',gap:6,padding:'4px 9px',background:'rgba(8,11,16,0.85)',borderRadius:7,border:'1px solid #1E293B',backdropFilter:'blur(10px)' }}>
                <span style={{ width:5,height:5,borderRadius:'50%',background:'#EF4444',display:'inline-block',animation:'xplPulse 1.5s infinite' }}/>
                <span style={{ fontSize:9,fontWeight:700,color:'#F8FAFC' }}>LIVE DEMO</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CHANGE 4: HOW IT WORKS — compact timeline */}
      <section id="how" style={{ background:'#0D1117',padding:'80px 60px',borderTop:'1px solid #1E293B' }}>
        <div style={{ maxWidth:1400,margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center',marginBottom:44 }}>
              <Tag>How It Works</Tag>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900 }}>
                From signup to full <span style={{ color:'#F97316' }}>intelligence</span> in 30 min.
              </h2>
              <p style={{ fontSize:13,color:'#64748B',marginTop:8 }}>Four steps — no IT team, no spreadsheets, no paper.</p>
            </div>
          </FadeIn>
          <div style={{ position:'relative',maxWidth:840,margin:'0 auto' }}>
            <div style={{ position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'linear-gradient(180deg,transparent,#1E293B 5%,#1E293B 95%,transparent)',transform:'translateX(-50%)',zIndex:0 }}/>
            {howItWorks.map((step,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 52px 1fr',marginBottom:28,position:'relative',zIndex:1 }}>
                  {step.side==='left' ? (
                    <div style={{ padding:'0 22px 0 0' }}>
                      <div style={{ fontSize:9,fontWeight:700,color:step.color,letterSpacing:'0.18em',textTransform:'uppercase' as const,marginBottom:3 }}>STEP {step.step}</div>
                      <div style={{ fontSize:15,fontWeight:800,color:'#F8FAFC',marginBottom:6,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.2 }}>{step.title}</div>
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
                  ) : <div/>}
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',position:'relative' }}>
                    <div style={{ width:44,height:44,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:`2px solid ${step.color}`,background:`${step.color}12`,position:'relative',zIndex:2,marginTop:8 }}>{step.icon}</div>
                    <div style={{ position:'absolute',top:-8,fontSize:60,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",color:`${step.color}06`,lineHeight:1,pointerEvents:'none' }}>{step.step}</div>
                  </div>
                  {step.side==='right' ? (
                    <div style={{ padding:'0 0 0 22px' }}>
                      <div style={{ fontSize:9,fontWeight:700,color:step.color,letterSpacing:'0.18em',textTransform:'uppercase' as const,marginBottom:3 }}>STEP {step.step}</div>
                      <div style={{ fontSize:15,fontWeight:800,color:'#F8FAFC',marginBottom:6,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.2 }}>{step.title}</div>
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
                  ) : <div/>}
                </div>
              </FadeIn>
            ))}
          </div>
          <div style={{ textAlign:'center',marginTop:20 }}>
            <a href="#contact" className="btn-primary" style={{ fontSize:13,padding:'10px 22px' }}>Start Your Free Trial →</a>
          </div>
        </div>
      </section>

      {/* CHANGES 5,6,7: FEATURES — 10 tabs */}
      <section id="features" style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:1400,margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center',marginBottom:32 }}>
              <Tag>Platform</Tag>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900 }}>
                Everything your operation needs — <span style={{ color:'#60A5FA' }}>one platform.</span>
              </h2>
            </div>
          </FadeIn>
          <div className="tabs-wrap" style={{ display:'flex',gap:5,marginBottom:24,flexWrap:'wrap',justifyContent:'center' }}>
            {features.map((f,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)}
                style={{ display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,fontSize:11,fontWeight:600,cursor:'pointer',transition:'all 0.2s',
                  background:activeTab===i?`${f.color}15`:'rgba(255,255,255,0.04)',
                  border:activeTab===i?`1px solid ${f.color}40`:'1px solid #1E293B',
                  color:activeTab===i?f.color:'#94A3B8' }}>
                {f.icon} {f.tab}
              </button>
            ))}
          </div>
          <div className="features-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:36,alignItems:'center',background:'#0D1117',border:'1px solid #1E293B',borderRadius:18,padding:36 }}>
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'3px 10px',borderRadius:20,background:`${features[activeTab].color}10`,border:`1px solid ${features[activeTab].color}30`,fontSize:11,fontWeight:700,color:features[activeTab].color,marginBottom:12 }}>
                {features[activeTab].icon} {features[activeTab].tab}
              </div>
              <h3 style={{ fontSize:20,fontWeight:800,color:'#F8FAFC',fontFamily:"'Space Grotesk',sans-serif",marginBottom:10,lineHeight:1.2 }}>{features[activeTab].title}</h3>
              <p style={{ fontSize:13,color:'#94A3B8',lineHeight:1.7,marginBottom:16 }}>{features[activeTab].desc}</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:20 }}>
                {features[activeTab].points.map((point,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#94A3B8' }}>
                    <span style={{ color:features[activeTab].color,fontSize:12 }}>✓</span>{point}
                  </div>
                ))}
              </div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:10,padding:'9px 16px',background:`${features[activeTab].color}08`,border:`1px solid ${features[activeTab].color}20`,borderRadius:10 }}>
                <div style={{ fontSize:20,fontWeight:900,color:features[activeTab].color,fontFamily:"'Space Grotesk',sans-serif" }}>{features[activeTab].stat.value}</div>
                <div style={{ fontSize:11,color:'#64748B' }}>{features[activeTab].stat.label}</div>
              </div>
            </div>
            <div style={{ background:'#080B10',border:'1px solid #1E293B',borderRadius:13,padding:18,minHeight:240,display:'flex',flexDirection:'column',gap:9 }}>
              <div style={{ display:'flex',alignItems:'center',gap:5,marginBottom:3 }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:'#EF4444' }}/><div style={{ width:6,height:6,borderRadius:'50%',background:'#F59E0B' }}/><div style={{ width:6,height:6,borderRadius:'50%',background:'#10B981' }}/>
                <span style={{ fontSize:9,color:'#64748B',marginLeft:6 }}>XPLORIX › {features[activeTab].tab}</span>
              </div>
              {[...Array(4)].map((_,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.03)',border:'1px solid #1E293B',borderRadius:7,padding:11,display:'flex',alignItems:'center',gap:9 }}>
                  <div style={{ width:28,height:28,borderRadius:7,background:`${features[activeTab].color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0 }}>{features[activeTab].icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:6,background:'#1E293B',borderRadius:3,marginBottom:4,width:`${60+i*10}%` }}/>
                    <div style={{ height:4,background:'#1A2234',borderRadius:3,width:`${30+i*12}%` }}/>
                  </div>
                  <div style={{ fontSize:12,fontWeight:800,color:features[activeTab].color,fontFamily:"'Space Grotesk',sans-serif" }}>{['98%','✓','A+','↑'][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI INSIGHTS */}
      <section id="ai" style={{ background:'#0D1117',padding:'100px 60px',borderTop:'1px solid #1E293B' }}>
        <div className="ai-grid" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center' }}>
          <FadeIn>
            <Tag>AI-Powered Insights</Tag>
            <h2 style={{ fontSize:'clamp(26px,4vw,42px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,lineHeight:1.1,marginBottom:14 }}>
              Intelligence that <span style={{ color:'#F97316' }}>acts</span> before you <span style={{ color:'#60A5FA' }}>ask.</span>
            </h2>
            <p style={{ fontSize:14,color:'#94A3B8',lineHeight:1.7,marginBottom:22 }}>
              XPLORIX AI monitors every data point from every rig, every shift. It spots anomalies, predicts failures, finds cost savings and delivers daily recommendations — automatically.
            </p>
            {[
              {icon:'🔮',title:'Predictive Failure Detection',desc:'Identifies equipment failure patterns before they cause costly downtime'},
              {icon:'💡',title:'Daily Performance Recommendations',desc:'Automated shift summaries with specific actionable improvements'},
              {icon:'💰',title:'Cost Optimisation Engine',desc:'Continuously finds cost-per-meter savings across rigs and formations'},
            ].map((f,i)=>(
              <div key={i} style={{ display:'flex',gap:11,padding:'11px 13px',background:'rgba(255,255,255,0.02)',border:'1px solid #1E293B',borderRadius:10,marginBottom:7,transition:'border-color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.25)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}>
                <span style={{ fontSize:18,flexShrink:0 }}>{f.icon}</span>
                <div><div style={{ fontSize:13,fontWeight:600,color:'#F8FAFC',marginBottom:2 }}>{f.title}</div><div style={{ fontSize:11,color:'#94A3B8',lineHeight:1.5 }}>{f.desc}</div></div>
              </div>
            ))}
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
              <div style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:3 }}>Live AI Insights Feed</div>
              {aiInsights.map((insight,i)=>{
                const [bg,border] = insightColors[insight.type]
                return (
                  <div key={i} style={{ padding:13,borderRadius:12,background:bg,border:`1px solid ${border}30` }}>
                    <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                        <span style={{ fontSize:14 }}>{insight.icon}</span>
                        <div>
                          <div style={{ fontSize:12,fontWeight:700,color:'#F8FAFC' }}>{insight.title}</div>
                          <div style={{ fontSize:10,color:'#64748B' }}>{insight.rig} · {insight.time}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:5,background:`${border}20`,color:border,border:`1px solid ${border}30`,whiteSpace:'nowrap',flexShrink:0,marginLeft:8 }}>{insight.badge}</span>
                    </div>
                    <p style={{ fontSize:11,color:'#94A3B8',lineHeight:1.6 }}>{insight.desc}</p>
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industries" style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:1400,margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center',marginBottom:48 }}>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900 }}>
                Built for the toughest <span style={{ color:'#F97316' }}>operations on earth.</span>
              </h2>
            </div>
          </FadeIn>
          <div className="ind-grid" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }}>
            {industries.map((ind,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <div className="card-hover" style={{ background:'#0D1117',border:'1px solid #1E293B',borderRadius:15,padding:'22px 18px',cursor:'pointer',height:'100%' }}>
                  <div style={{ width:42,height:42,borderRadius:11,background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:12 }}>{ind.icon}</div>
                  <h3 style={{ fontSize:14,fontWeight:700,color:'#F8FAFC',marginBottom:7,fontFamily:"'Space Grotesk',sans-serif" }}>{ind.title}</h3>
                  <p style={{ fontSize:12,color:'#94A3B8',lineHeight:1.6,marginBottom:12 }}>{ind.desc}</p>
                  <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:9,color:'#64748B',fontWeight:700,letterSpacing:'0.08em' }}>
                    <div style={{ width:14,height:2,background:'linear-gradient(90deg,#F97316,#3B82F6)',borderRadius:1 }}/>{ind.tag} DEPLOYMENTS
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CHANGE 9: PRICING */}
      <section style={{ background:'#0D1117',padding:'100px 60px',borderTop:'1px solid #1E293B' }}>
        <div style={{ maxWidth:1400,margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center',marginBottom:44 }}>
              <Tag>Pricing</Tag>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,marginBottom:10 }}>
                XPLORIX <span style={{ color:'#F97316' }}>Plans</span>
              </h2>
              <p style={{ fontSize:14,color:'#64748B' }}>Powerful insights. Smarter operations. Maximum uptime.</p>
            </div>
          </FadeIn>
          <div className="plans-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginBottom:24 }}>
            {plans.map((plan,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <div style={{ background:plan.highlight?'rgba(249,115,22,0.04)':'#080B10',border:plan.highlight?'2px solid rgba(249,115,22,0.4)':'1px solid #1E293B',borderRadius:17,padding:26,position:'relative',height:'100%',display:'flex',flexDirection:'column' }}>
                  {plan.badge && <div style={{ position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'#1E293B',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 14px',borderRadius:20,whiteSpace:'nowrap' }}>{plan.badge}</div>}
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                    <div style={{ width:40,height:40,borderRadius:11,background:plan.highlight?'rgba(249,115,22,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${plan.highlight?'rgba(249,115,22,0.3)':'#1E293B'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>{plan.icon}</div>
                    <div>
                      <div style={{ fontSize:15,fontWeight:800,color:'#F8FAFC',fontFamily:"'Space Grotesk',sans-serif" }}>{plan.name}</div>
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
                  <a href="#contact" style={{ display:'block',textAlign:'center',marginTop:18,padding:'9px',borderRadius:9,background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(255,255,255,0.04)',border:plan.highlight?'none':'1px solid #1E293B',color:plan.highlight?'#fff':'#94A3B8',fontSize:12,fontWeight:700,textDecoration:'none' }}>
                    Get Started →
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <div style={{ padding:'18px 24px',background:'rgba(249,115,22,0.04)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:'#F8FAFC' }}>Get a personalised quote for your operation</div>
                <div style={{ fontSize:11,color:'#64748B',marginTop:2 }}>Most companies find XPLORIX pays for itself within the first month</div>
              </div>
              <a href="#contact" className="btn-primary" style={{ fontSize:13,padding:'9px 20px' }}>Contact Us for Pricing →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:760,margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center',marginBottom:40 }}>
              <Tag>FAQ</Tag>
              <h2 style={{ fontSize:'clamp(26px,4vw,40px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900 }}>
                Common <span style={{ color:'#F97316' }}>questions answered.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
            {faqs.map((faq,i)=>(
              <FadeIn key={i} delay={i*0.04}>
                <div style={{ background:'#0D1117',border:`1px solid ${activeFaq===i?'rgba(249,115,22,0.3)':'#1E293B'}`,borderRadius:12,overflow:'hidden',transition:'border-color 0.2s' }}>
                  <button onClick={()=>setActiveFaq(activeFaq===i?null:i)}
                    style={{ width:'100%',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',color:'#F8FAFC',fontSize:13,fontWeight:600,textAlign:'left',gap:12 }}>
                    <span>{faq.q}</span>
                    <span style={{ color:activeFaq===i?'#F97316':'#64748B',fontSize:18,flexShrink:0,transition:'transform 0.3s',transform:activeFaq===i?'rotate(45deg)':'none' }}>+</span>
                  </button>
                  {activeFaq===i && <div style={{ padding:'0 18px 14px',fontSize:13,color:'#94A3B8',lineHeight:1.7 }}>{faq.a}</div>}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + CONTACT */}
      <section id="contact" style={{ padding:'100px 60px',background:'linear-gradient(135deg,rgba(249,115,22,0.04),transparent,rgba(59,130,246,0.04))',borderTop:'1px solid #1E293B' }}>
        <div className="contact-grid" style={{ maxWidth:1300,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:72,alignItems:'start' }}>
          <FadeIn>
            <Tag>Get Started</Tag>
            {/* CHANGE 10: "Built by drillers, for drillers" */}
            <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:8,background:'rgba(249,115,22,0.06)',border:'1px solid rgba(249,115,22,0.2)',marginBottom:14 }}>
              <span style={{ fontSize:14 }}>⛏</span>
              <span style={{ fontSize:12,fontWeight:700,color:'#F97316',fontStyle:'italic' }}>"Built by drillers, for drillers."</span>
            </div>
            <h2 style={{ fontSize:'clamp(26px,3.5vw,42px)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,lineHeight:1.1,marginBottom:12 }}>
              Transform your drilling operations with <span style={{ color:'#F97316' }}>AI.</span>
            </h2>
            <p style={{ fontSize:14,color:'#94A3B8',lineHeight:1.7,marginBottom:24 }}>
              Book a personalised 15-minute walkthrough. We'll show you how teams cut downtime, boost productivity and digitise drill logs in under 30 days.
            </p>
            {[
              {icon:'🌍',title:'Deployed across 30+ countries',  sub:'Global infrastructure, local support teams'},
              {icon:'⚡',title:'Live in under 30 minutes',        sub:'No IT team needed — just your login'},
              {icon:'🛡',title:'Enterprise security & SSO',       sub:'SOC 2 compliant, end-to-end encrypted'},
              {icon:'🤖',title:'AI insights from day one',        sub:'No training — insights start immediately'},
            ].map((pt,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',gap:11,marginBottom:12 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid #1E293B',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0 }}>{pt.icon}</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:'#F8FAFC' }}>{pt.title}</div>
                  <div style={{ fontSize:11,color:'#64748B',marginTop:1 }}>{pt.sub}</div>
                </div>
              </div>
            ))}
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ background:'#0D1117',border:'1px solid #1E293B',borderRadius:18,padding:28 }}>
              <div style={{ fontSize:14,fontWeight:700,color:'#F8FAFC',marginBottom:18,fontFamily:"'Space Grotesk',sans-serif" }}>Book a Free Demo</div>
              {[
                [{label:'Name',ph:'Jane Doe',type:'text'},{label:'Company',ph:'Acme Drilling Co.',type:'text'}],
                [{label:'Email',ph:'jane@acme.com',type:'email'},{label:'Phone',ph:'+1 555 000 1234',type:'tel'}],
              ].map((row,ri)=>(
                <div key={ri} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  {row.map((f,fi)=>(
                    <div key={fi} style={{ marginBottom:10 }}>
                      <label style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:4 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.ph} style={{ width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #1E293B',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none' }}
                        onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.4)'}} onBlur={e=>{e.target.style.borderColor='#1E293B'}}/>
                    </div>
                  ))}
                </div>
              ))}
              {[
                {label:'Country',opts:['Australia','United States','India','Canada','Saudi Arabia','South Africa','United Kingdom','Other']},
                {label:'Role',   opts:['Operations Manager','Drilling Supervisor','Project Manager','CEO / Director','IT / Admin','Other']},
              ].map((f,i)=>(
                <div key={i} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:4 }}>{f.label}</label>
                  <select style={{ width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #1E293B',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none',cursor:'pointer',appearance:'none' as const }}>
                    {f.opts.map(o=><option key={o} style={{ background:'#0D1117' }}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:'0.1em',textTransform:'uppercase' as const,display:'block',marginBottom:4 }}>Message</label>
                <textarea placeholder="Tell us about your fleet size and current challenges..." rows={3}
                  style={{ width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #1E293B',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:12,outline:'none',resize:'vertical' as const }}
                  onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.4)'}} onBlur={e=>{e.target.style.borderColor='#1E293B'}}/>
              </div>
              <div style={{ display:'flex',gap:9 }}>
                <button className="btn-ghost" style={{ flex:1,justifyContent:'center',padding:'10px',fontSize:13 }}>Contact Sales</button>
                <button className="btn-primary" style={{ flex:1,justifyContent:'center',padding:'10px',fontSize:13 }}>Book Demo →</button>
              </div>
              <p style={{ fontSize:10,color:'#64748B',textAlign:'center',marginTop:10 }}>By submitting, you agree to our terms & privacy policy.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#0D1117',borderTop:'1px solid #1E293B',padding:'48px 60px 24px' }}>
        <div className="footer-grid" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:36,marginBottom:36 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:11,marginBottom:12 }}>
              <XLogo size={32}/>
              <div>
                <div style={{ fontSize:14,fontWeight:800,color:'#F8FAFC',fontFamily:"'Space Grotesk',sans-serif" }}>XPLORIX</div>
                <div style={{ fontSize:8,color:'#64748B',letterSpacing:'0.15em',textTransform:'uppercase' }}>Drilling Intelligence</div>
              </div>
            </div>
            <p style={{ fontSize:12,color:'#64748B',lineHeight:1.7,maxWidth:220,marginBottom:14 }}>The world's most advanced drilling intelligence platform. Built for exploration drilling contractors who demand more.</p>
            <div style={{ display:'flex',gap:7 }}>
              {['L','T','Y'].map((s,i)=>(
                <div key={i} style={{ width:30,height:30,borderRadius:7,background:'rgba(255,255,255,0.04)',border:'1px solid #1E293B',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#64748B',cursor:'pointer' }}>{s}</div>
              ))}
            </div>
          </div>
          {[
            {title:'Product',    items:['Operations Dashboard','Maintenance Dashboard','Driller Performance','AI Insights','Inventory Management','Finance & Costing']},
            {title:'Company',    items:['About Us','Careers','Blog','Press','Partners','Contact Us']},
            {title:'Industries', items:['Mining','Exploration Drilling','Geotechnical','Blast Hole Drilling','RC Drilling','Diamond Core']},
          ].map((col,i)=>(
            <div key={i}>
              <div style={{ fontSize:10,fontWeight:700,color:'#F8FAFC',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12 }}>{col.title}</div>
              {col.items.map(l=>(
                <div key={l} style={{ fontSize:12,color:'#64748B',marginBottom:7,cursor:'pointer',transition:'color 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid #1E293B',paddingTop:18,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:9 }}>
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

