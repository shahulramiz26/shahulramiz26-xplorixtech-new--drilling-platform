'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

// ── TYPES ──────────────────────────────────────────────────────────────────
interface CounterProps { target: number; suffix?: string; prefix?: string; duration?: number }

// ── COUNTER HOOK ───────────────────────────────────────────────────────────
function useCounter({ target, suffix = '', prefix = '', duration = 2000 }: CounterProps) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true)
        let start = 0
        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)
          setValue(Math.floor(progress * target))
          if (progress < 1) requestAnimationFrame(step)
          else setValue(target)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, started])

  return { value: `${prefix}${value.toLocaleString()}${suffix}`, ref }
}

// ── ECOSYSTEM DIAGRAM ──────────────────────────────────────────────────────
function EcosystemDiagram() {
  const [activeNode, setActiveNode] = useState<string|null>(null)
  const nodes: Record<string,{icon:string;title:string;color:string;desc:string;feats:string[]}> = {
    ops:      { icon:'⚡', title:'Operations Dashboard',  color:'#F97316', desc:'Live ROP trending, meters drilled, downtime analysis and bit performance across all rigs.', feats:['Live ROP & downtime alerts','Meters drilled vs target','Bit performance & cost/m','Formation comparison'] },
    maint:    { icon:'🔧', title:'Maintenance Dashboard', color:'#3B82F6', desc:'Component health tracking and predictive maintenance — know what will fail before it fails.', feats:['Component failure analysis','MTBF by rig','Oil consumption trend','Maintenance cost tracking'] },
    driller:  { icon:'👷', title:'Driller & Crew',        color:'#10B981', desc:'Individual driller leaderboard handling 70+ drillers with search, sort, pagination and medals.', feats:['70+ driller leaderboard','ROP vs downtime scatter','Crew hours & utilisation','Performance radar chart'] },
    consm:    { icon:'📦', title:'Consumables Dashboard', color:'#8B5CF6', desc:'Full resource tracking — fuel, water, additives, accessories. Every cost broken down.', feats:['Fluid consumption breakdown','Accessories by cost (ranked)','Inventory level alerts','Supplier performance'] },
    hsc:      { icon:'🛡', title:'HSC & Safety',          color:'#EF4444', desc:'Incident tracking, PPE compliance, near-misses and safety training completion.', feats:['Incident type & severity','PPE compliance per item','Near-miss resolution','Safety training progress'] },
    finance:  { icon:'💰', title:'Finance & Costing',     color:'#F59E0B', desc:'Full cost visibility per project, per rig, per meter. Pricing tables and cost reports.', feats:['Cost per meter analysis','Master pricing data','Hole-by-hole cost reports','Multi-currency support'] },
    logs:     { icon:'📋', title:'Digital Drill Logs',    color:'#60A5FA', desc:'Supervisor shift log replacing all paper. Captures every data point from engine HMR to bit usage.', feats:['10h/12h shift toggle','Downtime reason tracking','Bit usage per hole','Incidents & attachments'] },
    reports:  { icon:'📄', title:'Performance Reports',   color:'#F97316', desc:'Admin generates official 4-page PDF certificates for any driller or supervisor.', feats:['4-page PDF certificate','Career lifetime stats','Industry comparison','XPLORIX verified badge'] },
    inv:      { icon:'🗄', title:'Inventory Management',  color:'#10B981', desc:'Per-site stock with purchase orders, auto-deduction from drill logs and low-stock alerts.', feats:['Excel import/export catalogue','Per-site stock levels','Purchase order management','Auto stock deduction'] },
    rigs:     { icon:'🔩', title:'Projects & Rigs',       color:'#8B5CF6', desc:'Manage all projects and rigs across every site. Configure, activate and assign.', feats:['Multi-project management','Rig activation & billing','Site assignment','Unlimited projects & rigs'] },
    users:    { icon:'👥', title:'User Management',       color:'#06B6D4', desc:'Create and manage logins for admins, supervisors and drillers. Each company isolated.', feats:['3 role types','Company isolation','Login credentials','Activity tracking'] },
    notif:    { icon:'🔔', title:'Alerts & Notifications',color:'#F59E0B', desc:'Real-time alerts for low stock, AI anomalies, pending approvals and system events.', feats:['Low stock alerts','AI anomaly alerts','Maintenance reminders','PO delivery tracking'] },
    currency: { icon:'💱', title:'Multi-Currency',        color:'#EC4899', desc:'Switch between currencies in real-time. All values convert instantly across the platform.', feats:['USD · INR · AUD','EUR · SAR','Live conversion everywhere','Finance integration'] },
    ai:       { icon:'🧠', title:'AI Insights Engine',    color:'#F97316', desc:'Monitors every data point, detects patterns, predicts failures and delivers daily recommendations.', feats:['Predictive failure detection','ROP optimisation tips','Cost/m opportunities','Daily summaries'] },
  }
  const active = activeNode ? nodes[activeNode] : null

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <svg viewBox="0 0 360 360" width="100%" style={{ display:'block' }}>
        <defs>
          <style>{`
            @keyframes pr1{0%{r:30;opacity:.5}100%{r:52;opacity:0}}
            @keyframes pr2{0%{r:30;opacity:.3}100%{r:58;opacity:0}}
            @keyframes od{from{stroke-dashoffset:0}to{stroke-dashoffset:-80}}
            @keyframes aidot{0%,100%{opacity:1}50%{opacity:.3}}
            .epr1{animation:pr1 2s ease-out infinite}
            .epr2{animation:pr2 2s ease-out infinite .8s}
            .eod1{animation:od 6s linear infinite}
            .eod2{animation:od 10s linear infinite}
            .eaidot{animation:aidot 1.5s ease-in-out infinite}
            .eng:hover circle,.eng:hover rect{filter:brightness(1.25);cursor:pointer}
          `}</style>
        </defs>
        {/* Orbit rings */}
        <circle cx="180" cy="180" r="72"  fill="none" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="4 4"/>
        <circle cx="180" cy="180" r="128" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="2 6"/>
        {/* Animated dots */}
        <circle r="2.5" fill="#F97316" opacity="0.5" className="eod1"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#er1"/></animateMotion></circle>
        <circle r="2" fill="#3B82F6" opacity="0.4" className="eod2"><animateMotion dur="13s" repeatCount="indefinite"><mpath href="#er2"/></animateMotion></circle>
        <path id="er1" d="M252 180 A72 72 0 1 1 251.99 180" fill="none"/>
        <path id="er2" d="M308 180 A128 128 0 1 1 307.99 180" fill="none"/>
        {/* Center → inner lines */}
        <g stroke="#1E293B" strokeWidth="0.75" opacity="0.7">
          <line x1="180" y1="180" x2="180" y2="108"/><line x1="180" y1="180" x2="242" y2="142"/>
          <line x1="180" y1="180" x2="242" y2="218"/><line x1="180" y1="180" x2="180" y2="252"/>
          <line x1="180" y1="180" x2="118" y2="218"/><line x1="180" y1="180" x2="118" y2="142"/>
        </g>
        {/* Inner → outer lines */}
        <g stroke="#1E293B" strokeWidth="0.5" opacity="0.4">
          <line x1="180" y1="108" x2="180" y2="52"/><line x1="242" y1="142" x2="288" y2="112"/>
          <line x1="242" y1="218" x2="288" y2="248"/><line x1="180" y1="252" x2="180" y2="308"/>
          <line x1="118" y1="218" x2="72" y2="248"/><line x1="118" y1="142" x2="72" y2="112"/>
          <line x1="308" y1="180" x2="244" y2="180"/><line x1="52"  y1="180" x2="116" y2="180"/>
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
        {/* Inner ring nodes */}
        {([
          { id:'ops',    cx:180, cy:108, icon:'⚡', color:'#F97316' },
          { id:'maint',  cx:242, cy:142, icon:'🔧', color:'#3B82F6' },
          { id:'driller',cx:242, cy:218, icon:'👷', color:'#10B981' },
          { id:'consm',  cx:180, cy:252, icon:'📦', color:'#8B5CF6' },
          { id:'hsc',    cx:118, cy:218, icon:'🛡', color:'#EF4444' },
          { id:'finance',cx:118, cy:142, icon:'💰', color:'#F59E0B' },
        ] as const).map(n=>(
          <g key={n.id} className="eng" onClick={()=>setActiveNode(activeNode===n.id?null:n.id)} style={{ cursor:'pointer' }}>
            <circle cx={n.cx} cy={n.cy} r="24" fill="#0D1117" stroke={activeNode===n.id?n.color:'#1E293B'} strokeWidth={activeNode===n.id?2:1}/>
            <text x={n.cx} y={n.cy-4} textAnchor="middle" fontSize="13" fill={n.color}>{n.icon}</text>
            <text x={n.cx} y={n.cy+10} textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="Inter,sans-serif">{nodes[n.id].title.split(' ')[0]}</text>
          </g>
        ))}
        {/* Outer ring nodes */}
        {([
          { id:'logs',     x:158, y:34,  icon:'📋', color:'#60A5FA', label:'Drill Logs'   },
          { id:'reports',  x:265, y:96,  icon:'📄', color:'#F97316', label:'Reports'      },
          { id:'inv',      x:290, y:165, icon:'🗄',  color:'#10B981', label:'Inventory'    },
          { id:'rigs',     x:265, y:234, icon:'🔩', color:'#8B5CF6', label:'Projects'     },
          { id:'users',    x:158, y:296, icon:'👥', color:'#06B6D4', label:'Users'        },
          { id:'notif',    x:29,  y:234, icon:'🔔', color:'#F59E0B', label:'Alerts'       },
          { id:'currency', x:28,  y:165, icon:'💱', color:'#EC4899', label:'Currency'     },
          { id:'ai',       x:29,  y:96,  icon:'🧠', color:'#F97316', label:'AI Insights', glow:true },
        ] as const).map(n=>(
          <g key={n.id} className="eng" onClick={()=>setActiveNode(activeNode===n.id?null:n.id)} style={{ cursor:'pointer' }}>
            <rect x={n.x} y={n.y} width="44" height="30" rx="7" fill="#0D1117"
              stroke={activeNode===n.id ? n.color : n.glow ? 'rgba(249,115,22,0.4)' : '#1E293B'}
              strokeWidth={activeNode===n.id ? 2 : n.glow ? 1.2 : 0.75}/>
            <text x={n.x+22} y={n.y+12} textAnchor="middle" fontSize="11" fill={n.color}>{n.icon}</text>
            <text x={n.x+22} y={n.y+24} textAnchor="middle" fontSize="6.5" fill={n.glow?n.color:'#64748B'} fontFamily="Inter,sans-serif" fontWeight={n.glow?700:400}>{n.label}</text>
          </g>
        ))}
        {/* AI pulse dot */}
        <circle className="eaidot" cx="29" cy="96" r="3" fill="#F97316" opacity="0.8"/>
      </svg>

      {/* Detail tooltip */}
      {active && (
        <div style={{ marginTop:8, background:'rgba(13,17,23,0.97)', border:`1px solid ${active.color}40`, borderRadius:14, padding:'14px 16px', backdropFilter:'blur(20px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:18 }}>{active.icon}</span>
            <span style={{ fontSize:13, fontWeight:700, color:active.color }}>{active.title}</span>
          </div>
          <p style={{ fontSize:11, color:'#94A3B8', lineHeight:1.6, marginBottom:10 }}>{active.desc}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
            {active.feats.map((f,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#94A3B8' }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:active.color, display:'inline-block', flexShrink:0 }}/>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', marginTop:10 }}>
        {[{c:'#F97316',l:'Dashboards'},{c:'#10B981',l:'Management'},{c:'#F97316',l:'AI Powered'}].map((l,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#64748B' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:l.c }}/>
            {l.l}
          </div>
        ))}
      </div>
      <div style={{ textAlign:'center', fontSize:10, color:'#334155', marginTop:4 }}>Click any module to explore</div>
    </div>
  )
}

// ── XPLORIX LOGO SVG ───────────────────────────────────────────────────────
function XLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <polygon points="50,50 5,5 5,95"    fill="#1a1a1a" />
      <polygon points="50,50 5,5 30,5"    fill="#2a2a2a" />
      <polygon points="50,50 5,95 30,95"  fill="#2a2a2a" />
      <polygon points="50,50 95,5 95,95"  fill="#F97316" />
      <polygon points="50,50 95,5 70,5"   fill="#EA580C" />
      <polygon points="50,50 95,95 70,95" fill="#EA580C" />
    </svg>
  )
}

// ── SECTION TAG ────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:100, border:'1px solid rgba(249,115,22,0.25)', background:'rgba(249,115,22,0.05)', fontSize:10, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase' as const, marginBottom:20 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'#F97316', display:'inline-block' }} />
      {children}
    </div>
  )
}

// ── FADE IN WRAPPER ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [typeIndex, setTypeIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const typingWords = ['Reimagined.', 'Simplified.', 'Optimized.', 'Digitized.']

  // Typing effect
  useEffect(() => {
    const word = typingWords[typeIndex]
    let timeout: ReturnType<typeof setTimeout>
    if (!isDeleting) {
      if (displayText.length < word.length) {
        timeout = setTimeout(() => setDisplayText(word.slice(0, displayText.length + 1)), 80)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000)
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 40)
      } else {
        setIsDeleting(false)
        setTypeIndex((typeIndex + 1) % typingWords.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, typeIndex])

  // Scroll handler
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Generate chart bars for hero
  useEffect(() => {
    const bars = document.getElementById('heroBars')
    if (bars && bars.children.length === 0) {
      const heights = [35, 48, 30, 58, 42, 65, 50, 72, 58, 80, 65, 88, 72, 92, 78, 95, 82, 88, 90, 86]
      heights.forEach((h, i) => {
        const b = document.createElement('div')
        b.style.cssText = `flex:1;border-radius:3px 3px 0 0;height:${h}%;background:${i >= 15 ? 'linear-gradient(to top,#F97316,#F59E0B)' : 'rgba(59,130,246,0.35)'};animation:barGrow 1s ease-out ${i * 0.05}s both;transform-origin:bottom`
        bars.appendChild(b)
      })
    }
  }, [])

  const navLinks = [
    { label: 'About',      href: '#about'      },
    { label: 'Platform',   href: '#features'   },
    { label: 'How it Works',href: '#how'       },
    { label: 'AI Insights',href: '#ai'         },
    { label: 'Industries', href: '#industries' },
    { label: 'Contact',    href: '#contact'    },
  ]

  const features = [
    {
      tab: 'Operations',
      icon: '⚡',
      color: '#F97316',
      title: 'Real-Time Operations Intelligence',
      desc: 'Track every meter drilled, every shift, every rig — all in one place. Live dashboards give you complete visibility into ROP, downtime, core recovery and bit performance.',
      points: ['Live ROP trending & alerts', 'Meters drilled vs target tracking', 'Downtime analysis by reason', 'Bit performance & cost per meter', 'Formation type comparison', 'Shift-by-shift productivity'],
      stat: { label: 'Avg ROP Improvement', value: '+23%' }
    },
    {
      tab: 'Maintenance',
      icon: '🔧',
      color: '#3B82F6',
      title: 'Predictive Maintenance Dashboard',
      desc: 'Stop reacting to breakdowns. XPLORIX tracks component health, maintenance history and failure patterns — so your team fixes problems before they become downtime.',
      points: ['Component failure frequency tracking', 'MTBF by rig analysis', 'Maintenance cost trends', 'Oil consumption monitoring', 'Scheduled vs breakdown ratio', 'Repair action history'],
      stat: { label: 'Downtime Reduction', value: '-35%' }
    },
    {
      tab: 'Driller & Crew',
      icon: '👷',
      color: '#10B981',
      title: 'Driller Performance Leaderboard',
      desc: 'Know who your top performers are. Track individual driller metrics, compare shifts, and identify training opportunities — all backed by data from actual drill logs.',
      points: ['Individual ROP & meters leaderboard', 'Shift comparison analytics', 'Crew hours & utilization', 'Experience vs performance analysis', 'Downloadable performance certificates', 'Top performer recognition'],
      stat: { label: 'Productivity Gain', value: '+18%' }
    },
    {
      tab: 'Consumables',
      icon: '📦',
      color: '#8B5CF6',
      title: 'Consumables & Cost Control',
      desc: 'Track every litre of fuel, every drill bit, every accessory. XPLORIX connects consumption data to performance — so you know exactly what\'s being used and why.',
      points: ['Fuel & water consumption tracking', 'Accessory usage by cost rank', 'Inventory level alerts', 'Supplier performance scoring', 'Cost per meter breakdown', 'Waste reduction insights'],
      stat: { label: 'Cost Savings', value: '18%' }
    },
    {
      tab: 'HSC & Safety',
      icon: '🛡',
      color: '#EF4444',
      title: 'Safety & Compliance Command Centre',
      desc: 'Zero incidents starts with visibility. XPLORIX tracks safety metrics, PPE compliance, near-misses and training completion — keeping your team safe and your company compliant.',
      points: ['Incident type & severity tracking', 'PPE compliance by item', 'Near-miss reporting & resolution', 'Safety training completion', 'Lost time injury rate (LTIF)', 'Hazard reporting dashboard'],
      stat: { label: 'Safety Score', value: '98%' }
    },
  ]

  const howItWorks = [
    { step: '01', icon: '🔌', title: 'Connect Your Rigs', desc: 'Set up your company, add your projects and rigs in under 30 minutes. No IT team needed — just your admin login and a browser.', color: '#F97316' },
    { step: '02', icon: '📋', title: 'Drillers Log Shifts', desc: 'Supervisors and drillers fill in digital shift logs on any device. Replaces paper completely — faster, more accurate, always backed up.', color: '#3B82F6' },
    { step: '03', icon: '🧠', title: 'AI Analyses Everything', desc: 'XPLORIX automatically calculates performance metrics, detects anomalies, and delivers daily AI insights — no spreadsheets required.', color: '#10B981' },
    { step: '04', icon: '📊', title: 'Make Better Decisions', desc: 'From cost per meter to driller performance to equipment health — every decision is backed by real data from your own operations.', color: '#8B5CF6' },
  ]

  const testimonials = [
    { name: 'James Whitfield', role: 'Operations Manager', company: 'AusDrill Group', avatar: 'JW', color: '#F97316', quote: 'XPLORIX transformed how we manage our 24 rigs across 3 sites. The downtime tracking alone saved us over $400K in the first quarter.', stars: 5 },
    { name: 'Priya Nair', role: 'Project Director', company: 'Mineral Exploration India', avatar: 'PN', color: '#3B82F6', quote: 'Finally a platform built for drilling contractors, not generic construction software. The drill log forms are exactly what our supervisors needed.', stars: 5 },
    { name: 'Ahmed Al-Rashidi', role: 'Chief Drilling Officer', company: 'Gulf Exploration Co.', avatar: 'AA', color: '#10B981', quote: 'The AI insights feature predicted a hydraulic failure on RIG-07 before it happened. That\'s the kind of intelligence that changes the game.', stars: 5 },
  ]

  const faqs = [
    { q: 'How long does it take to set up XPLORIX?', a: 'Most companies are fully operational within 24-48 hours. Setup involves creating your company profile, adding projects, rigs and users. Our onboarding team guides you through every step.' },
    { q: 'Do drillers need training to use the system?', a: 'The drill log forms are designed to be intuitive — most drillers are comfortable after one shift. We also provide video walkthroughs and live support during your first week.' },
    { q: 'Can XPLORIX work offline on remote sites?', a: 'Yes. The drilling log works in offline mode and automatically syncs when connectivity is restored. Perfect for remote exploration sites with limited internet.' },
    { q: 'How is our drilling data kept secure?', a: 'All data is encrypted in transit and at rest. Each company has completely isolated data — no other company can see your data. We are SOC 2 compliant and follow enterprise security standards.' },
    { q: 'Can I export our data to Excel or PDF?', a: 'Absolutely. All reports, dashboards and drill logs can be exported to Excel, CSV or PDF. Drillers can also download their personal performance certificates directly.' },
    { q: 'Do you support multiple projects and sites simultaneously?', a: 'Yes. XPLORIX is built for multi-site, multi-project operations. You can manage unlimited projects and rigs, with each site having its own inventory, stock and reporting.' },
    { q: 'What drilling types does XPLORIX support?', a: 'XPLORIX supports Diamond Core, RC, Blast Hole, Geotechnical and other exploration drilling types. The platform adapts to your industry type during setup.' },
    { q: 'How does pricing work?', a: 'Pricing is customised based on your fleet size, number of projects and required features. Contact our team for a personalised quote — most companies find XPLORIX pays for itself within the first month.' },
  ]

  const industries = [
    { icon: '⛏', title: 'Mining', desc: 'End-to-end visibility for surface & underground mining operations.', tag: 'LIVE' },
    { icon: '🔩', title: 'Exploration Drilling', desc: 'Built first for diamond core & RC operations in remote environments.', tag: 'LIVE' },
    { icon: '🏔', title: 'Geotechnical Drilling', desc: 'Track investigation programs at scale with full data visibility.', tag: 'LIVE' },
    { icon: '💥', title: 'Blast Hole Drilling', desc: 'Productivity intelligence for high-volume production drilling.', tag: 'LIVE' },
  ]

  const aiInsights = [
    { type: 'warning', icon: '⚠️', rig: 'RIG-003', title: 'Hydraulic Anomaly Detected', desc: 'Pressure fluctuation pattern matches pre-failure signature. Recommend inspection within 48hrs.', time: '2 min ago', badge: 'Predictive Alert' },
    { type: 'success', icon: '📈', rig: 'RIG-001', title: 'ROP Optimisation Found', desc: 'Drilling at 72 bar vs current 85 bar improves ROP by 14% in medium formation. Adjust parameters.', time: '15 min ago', badge: 'Performance Tip' },
    { type: 'info', icon: '💰', rig: 'All Rigs', title: 'Cost Per Meter Opportunity', desc: 'Switching to NQ SR-08 bits on RIG-004 & RIG-006 could reduce bit cost/m by 22% based on formation data.', time: '1 hr ago', badge: 'Cost Insight' },
    { type: 'danger', icon: '🚨', rig: 'Site B', title: 'Fuel Consumption Spike', desc: 'Fuel usage 31% above 30-day baseline. Possible air compressor inefficiency or fuel leak. Inspect now.', time: '3 hrs ago', badge: 'Anomaly' },
  ]

  const insightColors: Record<string, [string, string]> = {
    warning: ['rgba(245,158,11,0.08)', '#F59E0B'],
    success: ['rgba(16,185,129,0.08)', '#10B981'],
    info:    ['rgba(59,130,246,0.08)', '#3B82F6'],
    danger:  ['rgba(239,68,68,0.08)',  '#EF4444'],
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:'#080B10', color:'#F8FAFC', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#080B10; }
        ::-webkit-scrollbar-thumb { background:#1E293B; border-radius:2px; }
        ::selection { background:rgba(249,115,22,0.2); }
        @keyframes barGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes xplPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        @keyframes xplFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes xplFloat2 { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-7px) rotate(-2deg)} }
        @keyframes xplFloat3 { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(7px) rotate(1deg)} }
        @keyframes xplSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes xplGlow { 0%,100%{box-shadow:0 0 20px rgba(249,115,22,0.2)} 50%{box-shadow:0 0 40px rgba(249,115,22,0.5)} }
        .xpl-float  { animation:xplFloat  6s ease-in-out infinite; }
        .xpl-float2 { animation:xplFloat2 5s ease-in-out infinite; }
        .xpl-float3 { animation:xplFloat3 7s ease-in-out infinite; }
        .xpl-pulse  { animation:xplPulse  2s infinite; }
        .xpl-glow   { animation:xplGlow   3s ease-in-out infinite; }
        .nav-link { color:#94A3B8; text-decoration:none; font-size:14px; font-weight:500; transition:color 0.2s; }
        .nav-link:hover { color:#F8FAFC; }
        .btn-primary { display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:700;font-size:15px;font-family:'Inter',sans-serif;box-shadow:0 4px 30px rgba(249,115,22,0.3);transition:all 0.25s;text-decoration:none; }
        .btn-primary:hover { transform:translateY(-2px);box-shadow:0 8px 40px rgba(249,115,22,0.45); }
        .btn-ghost { display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,0.05);border:1px solid #1E293B;color:#F8FAFC;font-weight:600;font-size:15px;font-family:'Inter',sans-serif;transition:all 0.25s;text-decoration:none; }
        .btn-ghost:hover { background:rgba(255,255,255,0.09);border-color:#334155; }
        .card-hover { transition:all 0.3s; }
        .card-hover:hover { border-color:rgba(249,115,22,0.3)!important;transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.3); }
        .faq-item { transition:all 0.3s; }
        @media(max-width:768px) {
          .hero-grid { grid-template-columns:1fr!important; }
          .hero-visual { display:none!important; }
          .features-grid { grid-template-columns:1fr!important; }
          .how-grid { grid-template-columns:1fr 1fr!important; }
          .testi-grid { grid-template-columns:1fr!important; }
          .ind-grid { grid-template-columns:1fr 1fr!important; }
          .footer-grid { grid-template-columns:1fr 1fr!important; }
          .stat-grid { grid-template-columns:1fr 1fr!important; }
        }
        @media(max-width:480px) {
          .how-grid { grid-template-columns:1fr!important; }
          .ind-grid { grid-template-columns:1fr!important; }
          .footer-grid { grid-template-columns:1fr!important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════════ */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:900, padding:'14px 60px', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all 0.3s', background: scrolled ? 'rgba(8,11,16,0.97)' : 'rgba(8,11,16,0.7)', backdropFilter:'blur(20px)', borderBottom: scrolled ? '1px solid rgba(30,41,59,0.6)' : '1px solid transparent' }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
          <XLogo size={36} />
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#F8FAFC', letterSpacing:'0.06em', fontFamily:"'Space Grotesk',sans-serif" }}>XPLORIX</div>
            <div style={{ fontSize:8, color:'#64748B', letterSpacing:'0.18em', textTransform:'uppercase' }}>Drilling Intelligence</div>
          </div>
        </a>
        <div style={{ display:'flex', gap:32, listStyle:'none' }} className="hidden md:flex">
          {navLinks.map(n => <a key={n.href} href={n.href} className="nav-link">{n.label}</a>)}
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Link href="/auth/login" style={{ color:'#94A3B8', textDecoration:'none', fontSize:14, fontWeight:500, transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#94A3B8')}>Sign in</Link>
          <a href="#contact" className="btn-primary" style={{ padding:'9px 20px', fontSize:13, borderRadius:10 }}>Schedule Demo</a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'120px 60px 60px', position:'relative', overflow:'hidden' }}>
        {/* BG */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(249,115,22,0.07) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 60%,rgba(59,130,246,0.05) 0%,transparent 60%),#080B10' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(30,41,59,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(30,41,59,0.12) 1px,transparent 1px)', backgroundSize:'60px 60px', WebkitMaskImage:'radial-gradient(ellipse 100% 80% at 50% 0%,black 0%,transparent 70%)' }} />

        <div className="hero-grid" style={{ position:'relative', zIndex:2, width:'100%', maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

          {/* Left */}
          <div>
            <FadeIn>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:100, border:'1px solid rgba(249,115,22,0.3)', background:'rgba(249,115,22,0.05)', fontSize:11, fontWeight:700, color:'#F97316', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:28 }}>
                <span className="xpl-pulse" style={{ width:6, height:6, borderRadius:'50%', background:'#F97316', display:'inline-block' }} />
                Live · AI Drilling Intelligence V3.0
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 style={{ fontSize:'clamp(44px,5vw,76px)', lineHeight:1.05, fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, marginBottom:8 }}>
                Drilling Intelligence<br />
                <span style={{ color:'#F97316' }}>{displayText}</span>
                <span style={{ borderRight:'3px solid #F97316', marginLeft:2, animation:'xplPulse 1s infinite' }}></span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p style={{ fontSize:17, lineHeight:1.7, color:'#94A3B8', maxWidth:520, marginBottom:36, marginTop:16 }}>
                AI-powered performance intelligence for exploration drilling operations — real-time analytics, digital logging, and smarter decisions. Built for the toughest operations on earth.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:36 }}>
                <a href="#contact" className="btn-primary">Schedule Demo →</a>
                <a href="#features" className="btn-ghost">▷ Explore Platform</a>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              {/* Social proof */}
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ display:'flex' }}>
                  {['#F97316','#3B82F6','#10B981','#8B5CF6','#F59E0B'].map((c,i)=>(
                    <div key={i} style={{ width:32, height:32, borderRadius:'50%', background:c, border:'2px solid #080B10', marginLeft: i===0?0:-8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>
                      {['JW','PN','AA','MK','RT'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex', gap:2, marginBottom:2 }}>
                    {[1,2,3,4,5].map(i=><span key={i} style={{ color:'#F59E0B', fontSize:12 }}>★</span>)}
                  </div>
                  <div style={{ fontSize:12, color:'#64748B' }}><span style={{ color:'#F8FAFC', fontWeight:600 }}>30+ companies</span> trust XPLORIX</div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right — Ecosystem Diagram */}
          <div className="hero-visual" style={{ position:'relative', width:'100%' }}>
            <EcosystemDiagram />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════ */}
      <section style={{ background:'#0D1117', borderTop:'1px solid #1E293B', borderBottom:'1px solid #1E293B', padding:'44px 60px' }}>
        <div className="stat-grid" style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:32 }}>
          {[
            { icon:'🌍', target:30,   suffix:'+',  label:'Countries Served',       color:'#F97316' },
            { icon:'⛏', target:5,    suffix:'M+', label:'Meters Logged',           color:'#3B82F6' },
            { icon:'🔩', target:500,  suffix:'+',  label:'Rigs Managed',            color:'#10B981' },
            { icon:'📋', target:2,    suffix:'M+', label:'Drill Logs Processed',    color:'#8B5CF6' },
            { icon:'⏱', target:99,   suffix:'%',  label:'Platform Uptime',         color:'#F59E0B' },
            { icon:'📉', target:40,   suffix:'%',  label:'Avg Downtime Reduction',  color:'#EF4444' },
          ].map((s,i) => {
            const { value, ref } = useCounter({ target:s.target, suffix:s.suffix, duration:2000 })
            return (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
                <span ref={ref} style={{ fontSize:34, fontWeight:900, fontFamily:"'Space Grotesk',sans-serif", background:`linear-gradient(135deg,${s.color},${s.color}99)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', display:'block' }}>
                  {value}
                </span>
                <div style={{ fontSize:12, color:'#64748B', marginTop:5, fontWeight:500 }}>{s.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════ */}
      <section id="about" style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:80, alignItems:'center' }}>
          <FadeIn>
            <Tag>About Xplorix</Tag>
            <h2 style={{ fontSize:'clamp(34px,4vw,52px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, lineHeight:1.1, marginBottom:20 }}>
              Performance intelligence for <span style={{ color:'#F97316' }}>exploration drilling.</span>
            </h2>
            <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.8, marginBottom:16 }}>
              Xplorix is built specifically for drilling contractors and exploration companies who are tired of managing operations on spreadsheets, paper logs and WhatsApp groups.
            </p>
            <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.8, marginBottom:32 }}>
              We replace your entire paper-based workflow with a single intelligent platform — giving you real-time visibility, AI-powered insights, and data-driven decisions across every rig and every site.
            </p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {['Real-time visibility', 'AI-powered', 'Zero paperwork', 'Multi-site ready', 'Mobile first'].map(pill=>(
                <span key={pill} style={{ padding:'6px 14px', borderRadius:20, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600 }}>{pill}</span>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.3)' }}>
              {/* Simulated dashboard */}
              <div style={{ padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, paddingBottom:12, borderBottom:'1px solid #1E293B' }}>
                  <XLogo size={22} />
                  <span style={{ fontWeight:700, color:'#F8FAFC', fontSize:13 }}>XPLORIX</span>
                  <span style={{ color:'#64748B', fontSize:11, marginLeft:4 }}>› Admin Dashboard</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                  {[{v:'16',l:'Projects',c:'#60A5FA'},{v:'16',l:'Rigs',c:'#10B981'},{v:'12',l:'Users',c:'#8B5CF6'},{v:'AI',l:'Active',c:'#F97316'}].map((k,i)=>(
                    <div key={i} style={{ background:'#080B10', border:'1px solid #1E293B', borderRadius:8, padding:10, textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:800, color:k.c, fontFamily:"'Space Grotesk',sans-serif" }}>{k.v}</div>
                      <div style={{ color:'#64748B', fontSize:10, marginTop:2 }}>{k.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#080B10', border:'1px solid #1E293B', borderRadius:8, padding:12 }}>
                  <div style={{ color:'#94A3B8', marginBottom:10, fontWeight:700, fontSize:12, display:'flex', justifyContent:'space-between' }}>
                    <span>Production Snapshot</span>
                    <span style={{ color:'#F97316', fontSize:11 }}>View Analytics →</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {[{v:'34,986m',l:'Total Meters',c:'#F8FAFC'},{v:'3,580hrs',l:'Drilling Hrs',c:'#60A5FA'},{v:'9.8 m/hr',l:'Avg ROP',c:'#F97316'}].map((k,i)=>(
                      <div key={i}><div style={{ fontSize:14, fontWeight:800, color:k.c, fontFamily:"'Space Grotesk',sans-serif" }}>{k.v}</div><div style={{ color:'#64748B', fontSize:10, marginTop:2 }}>{k.l}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section id="how" style={{ background:'#0D1117', padding:'100px 60px', borderTop:'1px solid #1E293B' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <Tag>How It Works</Tag>
              <h2 style={{ fontSize:'clamp(32px,4vw,52px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900 }}>
                Up and running in <span style={{ color:'#F97316' }}>under 30 minutes.</span>
              </h2>
            </div>
          </FadeIn>
          <div className="how-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {howItWorks.map((step,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <div className="card-hover" style={{ background:'#080B10', border:'1px solid #1E293B', borderRadius:18, padding:28, position:'relative', height:'100%' }}>
                  {/* Connector line */}
                  {i < howItWorks.length - 1 && (
                    <div style={{ position:'absolute', top:44, right:-10, width:20, height:2, background:'linear-gradient(90deg,#1E293B,transparent)', zIndex:1 }} />
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`${step.color}12`, border:`1px solid ${step.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{step.icon}</div>
                    <span style={{ fontSize:22, fontWeight:900, color:`${step.color}40`, fontFamily:"'Space Grotesk',sans-serif" }}>{step.step}</span>
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#F8FAFC', marginBottom:10, fontFamily:"'Space Grotesk',sans-serif" }}>{step.title}</h3>
                  <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.7 }}>{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES — TABBED
      ══════════════════════════════════════════════════ */}
      <section id="features" style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <Tag>Platform</Tag>
              <h2 style={{ fontSize:'clamp(32px,4vw,52px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900 }}>
                Operational Intelligence <span style={{ color:'#60A5FA' }}>Dashboards</span>
              </h2>
              <p style={{ fontSize:16, color:'#94A3B8', maxWidth:560, margin:'16px auto 0', lineHeight:1.7 }}>
                Five powerful dashboards — one unified platform built for the speed and complexity of modern exploration.
              </p>
            </div>
          </FadeIn>

          {/* Tab buttons */}
          <div style={{ display:'flex', gap:8, marginBottom:32, flexWrap:'wrap', justifyContent:'center' }}>
            {features.map((f,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                  background: activeTab===i ? `${f.color}15` : 'rgba(255,255,255,0.04)',
                  border: activeTab===i ? `1px solid ${f.color}40` : '1px solid #1E293B',
                  color: activeTab===i ? f.color : '#94A3B8',
                }}>
                <span>{f.icon}</span> {f.tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center', background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:40 }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', borderRadius:20, background:`${features[activeTab].color}10`, border:`1px solid ${features[activeTab].color}30`, fontSize:11, fontWeight:700, color:features[activeTab].color, marginBottom:16 }}>
                {features[activeTab].icon} {features[activeTab].tab}
              </div>
              <h3 style={{ fontSize:24, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif", marginBottom:14, lineHeight:1.2 }}>{features[activeTab].title}</h3>
              <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.7, marginBottom:24 }}>{features[activeTab].desc}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:28 }}>
                {features[activeTab].points.map((point,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#94A3B8' }}>
                    <span style={{ color:features[activeTab].color, fontSize:14 }}>✓</span> {point}
                  </div>
                ))}
              </div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'12px 20px', background:`${features[activeTab].color}08`, border:`1px solid ${features[activeTab].color}20`, borderRadius:12 }}>
                <div style={{ fontSize:24, fontWeight:900, color:features[activeTab].color, fontFamily:"'Space Grotesk',sans-serif" }}>{features[activeTab].stat.value}</div>
                <div style={{ fontSize:13, color:'#64748B' }}>{features[activeTab].stat.label}</div>
              </div>
            </div>
            {/* Visual placeholder */}
            <div style={{ background:'#080B10', border:'1px solid #1E293B', borderRadius:16, padding:24, minHeight:280, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#EF4444' }} />
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#F59E0B' }} />
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981' }} />
                <span style={{ fontSize:11, color:'#64748B', marginLeft:8 }}>XPLORIX › {features[activeTab].tab} Dashboard</span>
              </div>
              {[...Array(4)].map((_,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B', borderRadius:9, padding:14, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:`${features[activeTab].color}15`, border:`1px solid ${features[activeTab].color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{features[activeTab].icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:8, background:'#1E293B', borderRadius:4, marginBottom:6, width:`${70+i*8}%` }} />
                    <div style={{ height:6, background:'#1A2234', borderRadius:4, width:`${40+i*10}%` }} />
                  </div>
                  <div style={{ fontSize:14, fontWeight:800, color:features[activeTab].color, fontFamily:"'Space Grotesk',sans-serif" }}>{['98%','✓','A+','↑'][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          AI INSIGHTS
      ══════════════════════════════════════════════════ */}
      <section id="ai" style={{ background:'#0D1117', padding:'100px 60px', borderTop:'1px solid #1E293B' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          <FadeIn>
            <Tag>AI-Powered Insights</Tag>
            <h2 style={{ fontSize:'clamp(32px,4vw,50px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, lineHeight:1.1, marginBottom:20 }}>
              Intelligence that <span style={{ color:'#F97316' }}>acts</span> before you <span style={{ color:'#60A5FA' }}>ask.</span>
            </h2>
            <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.7, marginBottom:28 }}>
              XPLORIX AI monitors every data point from every rig, every shift. It spots anomalies, predicts failures, finds cost savings and delivers daily recommendations — automatically.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { icon:'🔮', title:'Predictive Failure Detection', desc:'Identifies equipment failure patterns before they cause costly downtime' },
                { icon:'💡', title:'Daily Performance Recommendations', desc:'Automated shift summaries with specific actionable improvements' },
                { icon:'💰', title:'Cost Optimisation Engine', desc:'Continuously finds cost-per-meter savings across rigs and formations' },
              ].map((f,i)=>(
                <div key={i} style={{ display:'flex', gap:14, padding:'14px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B', borderRadius:12, transition:'all 0.2s', cursor:'default' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.25)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}>
                  <div style={{ fontSize:22, flexShrink:0 }}>{f.icon}</div>
                  <div><div style={{ fontSize:14, fontWeight:600, color:'#F8FAFC', marginBottom:4 }}>{f.title}</div><div style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6 }}>{f.desc}</div></div>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Live AI Insights Feed</div>
              {aiInsights.map((insight,i)=>{
                const [bg, border] = insightColors[insight.type]
                return (
                  <div key={i} style={{ padding:16, borderRadius:14, background:bg, border:`1px solid ${border}30`, transition:'transform 0.2s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateX(4px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform=''}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:16 }}>{insight.icon}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:'#F8FAFC' }}>{insight.title}</div>
                          <div style={{ fontSize:10, color:'#64748B' }}>{insight.rig} · {insight.time}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:5, background:`${border}20`, color:border, border:`1px solid ${border}30`, whiteSpace:'nowrap', flexShrink:0, marginLeft:8 }}>{insight.badge}</span>
                    </div>
                    <p style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6 }}>{insight.desc}</p>
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          INDUSTRIES
      ══════════════════════════════════════════════════ */}
      <section id="industries" style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <h2 style={{ fontSize:'clamp(34px,4vw,56px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900 }}>
                Built for the toughest <span style={{ color:'#F97316' }}>operations on earth.</span>
              </h2>
            </div>
          </FadeIn>
          <div className="ind-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {industries.map((ind,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <div className="card-hover" style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:18, padding:'28px 24px', cursor:'pointer', position:'relative', overflow:'hidden', height:'100%' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#F97316,transparent)', opacity:0, transition:'opacity 0.3s' }} />
                  <div style={{ width:48, height:48, borderRadius:13, background:'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(245,158,11,0.05))', border:'1px solid rgba(249,115,22,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:18 }}>{ind.icon}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#F8FAFC', marginBottom:10, fontFamily:"'Space Grotesk',sans-serif" }}>{ind.title}</h3>
                  <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.6, marginBottom:18 }}>{ind.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em' }}>
                    <div style={{ width:20, height:2, background:'linear-gradient(90deg,#F97316,#3B82F6)', borderRadius:1 }} />
                    {ind.tag} DEPLOYMENTS
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section style={{ background:'#0D1117', padding:'100px 60px', borderTop:'1px solid #1E293B' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <Tag>Testimonials</Tag>
              <h2 style={{ fontSize:'clamp(32px,4vw,50px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900 }}>
                Trusted by drilling teams <span style={{ color:'#F97316' }}>worldwide.</span>
              </h2>
            </div>
          </FadeIn>
          <div className="testi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {testimonials.map((t,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <div className="card-hover" style={{ background:'#080B10', border:'1px solid #1E293B', borderRadius:18, padding:28, height:'100%', display:'flex', flexDirection:'column', gap:20 }}>
                  {/* Stars */}
                  <div style={{ display:'flex', gap:3 }}>
                    {[1,2,3,4,5].map(s=><span key={s} style={{ color:'#F59E0B', fontSize:14 }}>★</span>)}
                  </div>
                  {/* Quote */}
                  <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8, fontStyle:'italic', flex:1 }}>"{t.quote}"</p>
                  {/* Author */}
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>{t.name}</div>
                      <div style={{ fontSize:11, color:'#64748B', marginTop:1 }}>{t.role} · {t.company}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRICING — "Contact Us"
      ══════════════════════════════════════════════════ */}
      <section style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <FadeIn>
            <Tag>Pricing</Tag>
            <h2 style={{ fontSize:'clamp(32px,4vw,52px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, marginBottom:16 }}>
              Pricing built around <span style={{ color:'#F97316' }}>your fleet.</span>
            </h2>
            <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.7, marginBottom:40, maxWidth:560, margin:'0 auto 40px' }}>
              Every drilling operation is different. Our pricing is tailored to your fleet size, number of sites, and required features — so you only pay for what you use.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:40 }}>
              {[
                { icon:'🔩', title:'Starter',    desc:'1-5 rigs · Single site · Core logging & analytics',          tag:'For small contractors' },
                { icon:'⚡', title:'Professional',desc:'6-20 rigs · Multi-site · Full AI insights & Finance module', tag:'Most popular', highlight:true },
                { icon:'🏢', title:'Enterprise',  desc:'Unlimited rigs · Custom features · Dedicated support',      tag:'For large operations' },
              ].map((plan,i)=>(
                <div key={i} style={{ padding:28, borderRadius:18, background: plan.highlight ? 'rgba(249,115,22,0.06)' : '#0D1117', border: plan.highlight ? '2px solid rgba(249,115,22,0.4)' : '1px solid #1E293B', position:'relative' }}>
                  {plan.highlight && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 14px', borderRadius:20 }}>MOST POPULAR</div>}
                  <div style={{ fontSize:28, marginBottom:12 }}>{plan.icon}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif", marginBottom:6 }}>{plan.title}</div>
                  <div style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6, marginBottom:16 }}>{plan.desc}</div>
                  <div style={{ fontSize:10, color:'#64748B', fontWeight:600 }}>{plan.tag}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:'24px 32px', background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#F8FAFC' }}>Get a personalised quote for your operation</div>
                <div style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Most companies find XPLORIX pays for itself within the first month</div>
              </div>
              <a href="#contact" className="btn-primary">Contact Us for Pricing →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════ */}
      <section style={{ background:'#0D1117', padding:'100px 60px', borderTop:'1px solid #1E293B' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <Tag>FAQ</Tag>
              <h2 style={{ fontSize:'clamp(30px,4vw,48px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900 }}>
                Common <span style={{ color:'#F97316' }}>questions answered.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {faqs.map((faq,i)=>(
              <FadeIn key={i} delay={i*0.05}>
                <div className="faq-item" style={{ background:'#080B10', border:`1px solid ${activeFaq===i ? 'rgba(249,115,22,0.3)' : '#1E293B'}`, borderRadius:14, overflow:'hidden' }}>
                  <button onClick={()=>setActiveFaq(activeFaq===i ? null : i)}
                    style={{ width:'100%', padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', color:'#F8FAFC', fontSize:14, fontWeight:600, textAlign:'left', gap:12 }}>
                    <span>{faq.q}</span>
                    <span style={{ color:activeFaq===i ? '#F97316' : '#64748B', fontSize:18, flexShrink:0, transition:'transform 0.3s', transform:activeFaq===i?'rotate(45deg)':'rotate(0deg)' }}>+</span>
                  </button>
                  {activeFaq===i && (
                    <div style={{ padding:'0 22px 18px', fontSize:14, color:'#94A3B8', lineHeight:1.7 }}>{faq.a}</div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA + CONTACT FORM
      ══════════════════════════════════════════════════ */}
      <section id="contact" style={{ padding:'100px 60px', background:'linear-gradient(135deg,rgba(249,115,22,0.04),transparent,rgba(59,130,246,0.04))', borderTop:'1px solid #1E293B' }}>
        <div style={{ maxWidth:1300, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:80, alignItems:'start' }}>
          <FadeIn>
            <Tag>Get Started</Tag>
            <h2 style={{ fontSize:'clamp(30px,3.5vw,48px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, lineHeight:1.1, marginBottom:16 }}>
              Transform your drilling operations with <span style={{ color:'#F97316' }}>AI.</span>
            </h2>
            <p style={{ fontSize:15, color:'#94A3B8', lineHeight:1.7, marginBottom:32 }}>
              Book a personalised 15-minute walkthrough. We'll show you how teams cut downtime, boost productivity and digitise drill logs in under 30 days.
            </p>
            {[
              { icon:'🌍', title:'Deployed across 30+ countries', sub:'Global infrastructure, local support teams' },
              { icon:'⚡', title:'Live in under 30 minutes',       sub:'No IT team needed — just your login' },
              { icon:'🛡', title:'Enterprise security & SSO',      sub:'SOC 2 compliant, end-to-end encrypted' },
              { icon:'🤖', title:'AI insights from day one',       sub:'No training — insights start immediately' },
            ].map((pt,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:42, height:42, borderRadius:11, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{pt.icon}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#F8FAFC' }}>{pt.title}</div>
                  <div style={{ fontSize:12, color:'#64748B', marginTop:1 }}>{pt.sub}</div>
                </div>
              </div>
            ))}
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.2}>
            <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:22, padding:36 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#F8FAFC', marginBottom:24, fontFamily:"'Space Grotesk',sans-serif" }}>Book a Free Demo</div>
              {[
                [{ label:'Name', ph:'Jane Doe', type:'text' }, { label:'Company', ph:'Acme Drilling Co.', type:'text' }],
                [{ label:'Email', ph:'jane@acme.com', type:'email' }, { label:'Phone', ph:'+1 555 000 1234', type:'tel' }],
              ].map((row,ri)=>(
                <div key={ri} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:0 }}>
                  {row.map((f,fi)=>(
                    <div key={fi} style={{ marginBottom:14 }}>
                      <label style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:6 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.ph}
                        style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #1E293B', background:'rgba(255,255,255,0.03)', color:'#F8FAFC', fontFamily:'inherit', fontSize:13, outline:'none', transition:'all 0.2s' }}
                        onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.4)';e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.08)'}}
                        onBlur={e=>{e.target.style.borderColor='#1E293B';e.target.style.boxShadow=''}} />
                    </div>
                  ))}
                </div>
              ))}
              {[
                { label:'Country', opts:['Australia','United States','India','Canada','Saudi Arabia','South Africa','United Kingdom','Other'] },
                { label:'Role',    opts:['Operations Manager','Drilling Supervisor','Project Manager','CEO / Director','IT / Admin','Other'] },
              ].map((f,i)=>(
                <div key={i} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:6 }}>{f.label}</label>
                  <select style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #1E293B', background:'rgba(255,255,255,0.03)', color:'#F8FAFC', fontFamily:'inherit', fontSize:13, outline:'none', cursor:'pointer', appearance:'none' }}>
                    {f.opts.map(o=><option key={o} style={{ background:'#0D1117' }}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Message</label>
                <textarea placeholder="Tell us about your fleet size and current challenges..." rows={3}
                  style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #1E293B', background:'rgba(255,255,255,0.03)', color:'#F8FAFC', fontFamily:'inherit', fontSize:13, outline:'none', resize:'vertical', transition:'all 0.2s' }}
                  onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.4)';e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.08)'}}
                  onBlur={e=>{e.target.style.borderColor='#1E293B';e.target.style.boxShadow=''}} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn-ghost" style={{ flex:1, justifyContent:'center' }}>Contact Sales</button>
                <button className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Book Demo →</button>
              </div>
              <p style={{ fontSize:11, color:'#64748B', textAlign:'center', marginTop:14 }}>By submitting, you agree to our terms & privacy policy.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer style={{ background:'#0D1117', borderTop:'1px solid #1E293B', padding:'60px 60px 32px' }}>
        <div className="footer-grid" style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:48, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <XLogo size={36} />
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>XPLORIX</div>
                <div style={{ fontSize:9, color:'#64748B', letterSpacing:'0.15em', textTransform:'uppercase' }}>Drilling Intelligence</div>
              </div>
            </div>
            <p style={{ fontSize:13, color:'#64748B', lineHeight:1.7, maxWidth:260, marginBottom:20 }}>
              The world's most advanced drilling intelligence platform. Built for exploration drilling contractors who demand more.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              {['LinkedIn','Twitter','YouTube'].map(s=>(
                <div key={s} style={{ width:34, height:34, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#64748B', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.3)';(e.currentTarget as HTMLElement).style.color='#F97316'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1E293B';(e.currentTarget as HTMLElement).style.color='#64748B'}}>
                  {s[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#F8FAFC', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Product</div>
            {['Operations Dashboard','Maintenance Dashboard','Driller Performance','AI Insights','Inventory Management','Finance & Costing'].map(l=>(
              <div key={l} style={{ fontSize:13, color:'#64748B', marginBottom:9, cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#F8FAFC', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Company</div>
            {['About Us','Careers','Blog','Press','Partners','Contact Us'].map(l=>(
              <div key={l} style={{ fontSize:13, color:'#64748B', marginBottom:9, cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
            ))}
          </div>

          {/* Industries */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#F8FAFC', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Industries</div>
            {['Mining','Exploration Drilling','Geotechnical','Blast Hole Drilling','RC Drilling','Diamond Core'].map(l=>(
              <div key={l} style={{ fontSize:13, color:'#64748B', marginBottom:9, cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid #1E293B', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:13, color:'#64748B' }}>© 2026 Xplorix. All rights reserved. Built with ❤️ for the drilling industry.</p>
          <div style={{ display:'flex', gap:24 }}>
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(l=>(
              <span key={l} style={{ fontSize:12, color:'#64748B', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}

