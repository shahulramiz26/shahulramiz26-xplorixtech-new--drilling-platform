'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import * as THREE from 'three'

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Node3D { id: string; icon: string; label: string; color: string; angle: number; radius: number; height: number }

// ── FADE IN ────────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)', transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>
      {children}
    </div>
  )
}

// ── 3D TILT CARD ──────────────────────────────────────────────────────────
function TiltCard({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`
  }
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)'
  }
  return (
    <div ref={ref} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.1s ease', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  )
}

// ── XPLORIX LOGO ──────────────────────────────────────────────────────────
function XLogo({ size = 40 }: { size?: number }) {
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
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:100, border:'1px solid rgba(249,115,22,0.3)', background:'rgba(249,115,22,0.06)', fontSize:10, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase' as const, marginBottom:20 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'#F97316', display:'inline-block', animation:'xplPulse 1.5s infinite' }}/>{children}
    </div>
  )
}

// ── THREE.JS GLOBE ────────────────────────────────────────────────────────
function Globe3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene; camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer; globe: THREE.Mesh
    particles: THREE.Points; nodes: THREE.Group
    animId: number; mouse: { x: number; y: number }
  } | null>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const W = mountRef.current.clientWidth
    const H = mountRef.current.clientHeight

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.set(0, 0, 3.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // ── Globe ──
    const globeGeo = new THREE.SphereGeometry(1.2, 64, 64)
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0D1117, emissive: 0x0D1117,
      wireframe: false, transparent: true, opacity: 0.9,
    })
    const globe = new THREE.Mesh(globeGeo, globeMat)
    scene.add(globe)

    // Globe wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x1E293B, wireframe: true, transparent: true, opacity: 0.25 })
    const wireGlobe = new THREE.Mesh(new THREE.SphereGeometry(1.21, 32, 32), wireMat)
    scene.add(wireGlobe)

    // ── Glow ring ──
    const ringGeo = new THREE.TorusGeometry(1.4, 0.005, 16, 200)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xF97316, transparent: true, opacity: 0.4 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2.2
    scene.add(ring)

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.003, 16, 200),
      new THREE.MeshBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.2 })
    )
    ring2.rotation.x = Math.PI / 3
    ring2.rotation.z = Math.PI / 6
    scene.add(ring2)

    // ── Orbit nodes ──
    const nodeData: Node3D[] = [
      { id:'ops',    icon:'⚡', label:'Operations',  color:'#F97316', angle:0,              radius:1.8, height:0.3  },
      { id:'maint',  icon:'🔧', label:'Maintenance', color:'#3B82F6', angle:Math.PI/3,      radius:1.9, height:-0.2 },
      { id:'driller',icon:'👷', label:'Driller',     color:'#10B981', angle:2*Math.PI/3,    radius:1.8, height:0.5  },
      { id:'hsc',    icon:'🛡', label:'HSC',          color:'#EF4444', angle:Math.PI,        radius:1.9, height:-0.4 },
      { id:'finance',icon:'💰', label:'Finance',     color:'#F59E0B', angle:4*Math.PI/3,    radius:1.8, height:0.1  },
      { id:'ai',     icon:'🧠', label:'AI Insights', color:'#F97316', angle:5*Math.PI/3,    radius:2.0, height:0.6  },
      { id:'inv',    icon:'🗄', label:'Inventory',   color:'#8B5CF6', angle:Math.PI/6,      radius:2.1, height:-0.6 },
      { id:'logs',   icon:'📋', label:'Drill Logs',  color:'#60A5FA', angle:Math.PI/2,      radius:2.0, height:0.4  },
    ]

    const nodes = new THREE.Group()
    nodeData.forEach(n => {
      const x = n.radius * Math.cos(n.angle)
      const z = n.radius * Math.sin(n.angle)
      const y = n.height

      // Node sphere
      const geo = new THREE.SphereGeometry(0.07, 16, 16)
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(n.color) })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, y, z)
      nodes.add(mesh)

      // Glow sphere
      const glowGeo = new THREE.SphereGeometry(0.12, 16, 16)
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(n.color), transparent: true, opacity: 0.15 })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      glow.position.set(x, y, z)
      nodes.add(glow)

      // Line to globe center
      const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(n.color), transparent: true, opacity: 0.2 })
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ])
      nodes.add(new THREE.Line(lineGeo, lineMat))
    })
    scene.add(nodes)

    // ── Particles ──
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12
      const isOrange = Math.random() > 0.7
      colors[i * 3]     = isOrange ? 0.98 : 0.23
      colors[i * 3 + 1] = isOrange ? 0.45 : 0.51
      colors[i * 3 + 2] = isOrange ? 0.09 : 0.98
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    const particleMat = new THREE.PointsMaterial({ size: 0.018, vertexColors: true, transparent: true, opacity: 0.7 })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)
    const orangeLight = new THREE.PointLight(0xF97316, 2, 5)
    orangeLight.position.set(2, 1, 2)
    scene.add(orangeLight)
    const blueLight = new THREE.PointLight(0x3B82F6, 1, 5)
    blueLight.position.set(-2, -1, -2)
    scene.add(blueLight)

    // ── Mouse ──
    const mouse = { x: 0, y: 0 }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)

    // ── Animate ──
    let t = 0
    const animate = () => {
      const animId = requestAnimationFrame(animate)
      sceneRef.current && (sceneRef.current.animId = animId)
      t += 0.005

      globe.rotation.y += 0.003
      wireGlobe.rotation.y += 0.003
      nodes.rotation.y += 0.004
      nodes.rotation.x = Math.sin(t * 0.3) * 0.08

      ring.rotation.z  += 0.006
      ring2.rotation.z -= 0.004

      particles.rotation.y += 0.0005
      particles.rotation.x += 0.0003

      // Mouse parallax
      camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.05
      camera.position.y += (-mouse.y * 0.2 - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      // Pulse node glow
      nodes.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && i % 3 === 1) {
          const mat = child.material as THREE.MeshBasicMaterial
          mat.opacity = 0.1 + Math.sin(t * 2 + i) * 0.1
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    sceneRef.current = { scene, camera, renderer, globe, particles, nodes, animId: 0, mouse }

    // ── Resize ──
    const handleResize = () => {
      if (!mountRef.current) return
      const W2 = mountRef.current.clientWidth
      const H2 = mountRef.current.clientHeight
      camera.aspect = W2 / H2
      camera.updateProjectionMatrix()
      renderer.setSize(W2, H2)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (sceneRef.current) cancelAnimationFrame(sceneRef.current.animId)
      renderer.dispose()
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <div ref={mountRef} style={{ width:'100%', height:'100%' }}/>
      {/* Node labels */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {[
          { label:'Operations',  color:'#F97316', top:'12%', left:'65%'  },
          { label:'Maintenance', color:'#3B82F6', top:'30%', left:'80%'  },
          { label:'Driller',     color:'#10B981', top:'55%', left:'75%'  },
          { label:'HSC Safety',  color:'#EF4444', top:'72%', left:'60%'  },
          { label:'Finance',     color:'#F59E0B', top:'70%', left:'30%'  },
          { label:'AI Insights', color:'#F97316', top:'20%', left:'18%'  },
          { label:'Inventory',   color:'#8B5CF6', top:'45%', left:'10%'  },
          { label:'Drill Logs',  color:'#60A5FA', top:'35%', left:'55%'  },
        ].map((n,i)=>(
          <div key={i} style={{ position:'absolute', top:n.top, left:n.left, fontSize:9, fontWeight:700, color:n.color, background:'rgba(8,11,16,0.75)', padding:'2px 7px', borderRadius:4, border:`1px solid ${n.color}40`, backdropFilter:'blur(4px)', letterSpacing:'0.06em', textTransform:'uppercase' as const, whiteSpace:'nowrap' }}>
            {n.label}
          </div>
        ))}
      </div>
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

// ── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeFaq, setActiveFaq] = useState<number|null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [typeIndex, setTypeIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const typingWords = ['Reimagined.','Simplified.','Optimized.','Digitized.']

  useEffect(() => {
    const word = typingWords[typeIndex]
    let timeout: ReturnType<typeof setTimeout>
    if (!isDeleting) {
      if (displayText.length < word.length) timeout = setTimeout(() => setDisplayText(word.slice(0, displayText.length + 1)), 80)
      else timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else {
      if (displayText.length > 0) timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 40)
      else { setIsDeleting(false); setTypeIndex((typeIndex + 1) % typingWords.length) }
    }
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, typeIndex])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const features = [
    { tab:'Operations',    icon:'⚡', color:'#F97316', title:'Real-Time Operations Intelligence',    desc:'Track every meter drilled, every shift, every rig. Live dashboards give complete visibility into ROP, downtime, core recovery and bit performance.', points:['Live ROP trending & alerts','Meters drilled vs target','Downtime analysis by reason','Bit performance & cost/meter','Formation type comparison','Shift-by-shift productivity'], stat:{label:'Avg ROP Improvement', value:'+23%'} },
    { tab:'Maintenance',   icon:'🔧', color:'#3B82F6', title:'Predictive Maintenance Dashboard',     desc:'Stop reacting to breakdowns. XPLORIX tracks component health, failure patterns — fix problems before they become downtime.',                          points:['Component failure tracking','MTBF by rig analysis','Maintenance cost trends','Oil consumption monitoring','Scheduled vs breakdown','Repair action history'],            stat:{label:'Downtime Reduction',  value:'-35%'} },
    { tab:'Driller & Crew',icon:'👷', color:'#10B981', title:'Driller Performance Leaderboard',      desc:'Know who your top performers are. Track individual driller metrics, compare shifts — backed by data from actual drill logs.',                        points:['70+ driller leaderboard','Shift comparison analytics','Crew hours & utilisation','Experience vs performance','Downloadable certificates','Top performer recognition'],   stat:{label:'Productivity Gain',   value:'+18%'} },
    { tab:'HSC & Safety',  icon:'🛡', color:'#EF4444', title:'Safety & Compliance Command Centre',   desc:'Zero incidents starts with visibility. XPLORIX tracks safety metrics, PPE compliance, near-misses and training.',                                    points:['Incident type & severity','PPE compliance by item','Near-miss reporting','Safety training completion','LTIF & TRIF metrics','Hazard reporting'],                          stat:{label:'Safety Score',        value:'98%'}  },
    { tab:'Finance',       icon:'💰', color:'#F59E0B', title:'Finance & Costing Intelligence',        desc:'Full cost visibility per project, per rig, per meter. Track drilling costs against budget in real time.',                                           points:['Cost per meter tracking','Master pricing data','Hole-by-hole breakdown','Budget vs actual','Multi-currency','Exportable reports'],                                       stat:{label:'Cost Visibility',     value:'100%'} },
    { tab:'Inventory',     icon:'🗄', color:'#10B981', title:'Smart Inventory Management',            desc:'Per-site stock management with purchase orders, auto-deduction from drill logs and real-time alerts.',                                              points:['Parts catalogue (Excel)','Per-site stock levels','Purchase orders','Auto stock deduct','Low stock alerts','Site transfers'],                                              stat:{label:'Stock Accuracy',      value:'99%'}  },
    { tab:'Perf. Reports', icon:'📄', color:'#EC4899', title:'Official Performance Certificates',    desc:'Admin generates verified 4-page PDF certificates for any driller or supervisor — shareable proof verified by XPLORIX.',                             points:['4-page PDF certificate','Career lifetime stats','Industry comparison','Project history','Supervisor endorsements','XPLORIX verified QR'],                               stat:{label:'Verification',        value:'100%'} },
    { tab:'Performance',   icon:'📊', color:'#60A5FA', title:'Performance Dashboard — Hole by Hole', desc:'Deep-dive analytics per project, per rig, per hole. Track meter-by-meter performance across formations.',                                           points:['Hole-by-hole analytics','Meter-by-meter tracking','Formation comparison','ROP per hole','Core recovery per hole','Bit life analysis'],                                  stat:{label:'Visibility',          value:'360°'} },
    { tab:'Digital Logging',icon:'📋',color:'#A78BFA', title:'Digital Drill Log System',             desc:'Replace paper logs completely. Supervisors fill structured digital shift logs on any device — from engine HMR to bit usage.',                       points:['10h / 12h shift toggle','Auto-calculate meters','Downtime tracking','Bit usage per hole','Consumables log','Incidents & attachments'],                                    stat:{label:'Paper Eliminated',    value:'100%'} },
  ]

  const howItWorks = [
    { step:'01', icon:'🔐', color:'#F97316', side:'left',  title:'Register & Get Instant Access',  desc:'Create your company account and get Admin and Supervisor logins in minutes. Full platform access from day one — no contracts, no IT setup.',         badges:[{t:'⏱ 5 min setup',c:'o'},{t:'✓ 15-day trial',c:'g'}], feats:['Admin + Supervisor + Driller roles','15-day trial, no credit card'] },
    { step:'02', icon:'⚙️', color:'#3B82F6', side:'right', title:'Build Your Master Data',          desc:'Create Project, Rig and Bit IDs. Upload Costing and Inventory master data via CSV files — operation structure ready instantly.',                    badges:[{t:'📁 CSV upload',c:'b'},{t:'⚡ Instant sync',c:'o'}],  feats:['Project, Rig & Bit configuration','Inventory catalogue bulk import'] },
    { step:'03', icon:'📋', color:'#10B981', side:'left',  title:'Go Live on Day One',              desc:'Supervisors log daily drill shifts immediately. Every meter, bit and downtime captured digitally. Full tracking from your very first log.',           badges:[{t:'✓ Zero training',c:'g'},{t:'📋 Replaces paper',c:'o'}],feats:['Digital shift log on any device','Auto cost & productivity calc'] },
    { step:'04', icon:'🧠', color:'#8B5CF6', side:'right', title:'Unlock Full Intelligence',        desc:'The moment your first log is submitted, XPLORIX AI activates. Advanced analytics, predictive insights, performance reports — all automatic.',        badges:[{t:'🧠 AI live',c:'p'},{t:'📊 9 dashboards',c:'o'}],     feats:['AI predicts failures automatically','9 analytics dashboards live'] },
  ]

  const aiInsights = [
    { type:'warning', icon:'⚠️', rig:'RIG-003', title:'Hydraulic Anomaly',       desc:'Pressure fluctuation matches pre-failure. Inspect within 48hrs.',                     time:'2 min ago',  badge:'Predictive Alert', color:'#F59E0B' },
    { type:'success', icon:'📈', rig:'RIG-001', title:'ROP Optimisation Found',   desc:'Drilling at 72 bar improves ROP by 14% in medium formation.',                         time:'15 min ago', badge:'Performance Tip',  color:'#10B981' },
    { type:'info',    icon:'💰', rig:'All Rigs',title:'Cost Per Meter Opportunity',desc:'NQ SR-08 bits on RIG-004 could reduce bit cost/m by 22%.',                            time:'1 hr ago',   badge:'Cost Insight',     color:'#3B82F6' },
    { type:'danger',  icon:'🚨', rig:'Site B',  title:'Fuel Spike Detected',      desc:'31% above 30-day baseline. Possible compressor inefficiency.',                        time:'3 hrs ago',  badge:'Anomaly',          color:'#EF4444' },
  ]

  const plans = [
    { name:'Standard Plan',   icon:'🏗', billing:'Monthly Billing',              highlight:false, badge:'',             coreLabel:'CORE FEATURES',                  feats:['Advanced digital logging','Fleet performance dashboard','Usage analytics & reporting','Unlimited supervisor logins','Client & management view-only login','Alerts & notifications','AI Insights for quick analysis','Secure cloud data storage','Standard onboarding support','Email support (business hours)'] },
    { name:'Growth Plan',     icon:'📈', billing:'Half-Yearly — 8% Savings',     highlight:true,  badge:'★ MOST POPULAR',coreLabel:'EVERYTHING IN STANDARD, PLUS:',  feats:['24/7 Priority Support','On-site Training for Teams','Advanced performance analytics','Trend forecasting & insights','Faster data refresh rates','Detailed downloadable reports','Priority feature updates'] },
    { name:'Enterprise Plan', icon:'💎', billing:'Annual Billing — 16% Savings', highlight:false, badge:'💎 BEST VALUE', coreLabel:'EVERYTHING IN GROWTH, PLUS:',    feats:['Dedicated Account Manager','On-Site Training & Implementation','Custom Feature Development','Enterprise-grade analytics','API integrations','Branding options','Highest system priority & uptime','Advanced security & compliance'] },
  ]

  const faqs = [
    { q:'How long to set up XPLORIX?',         a:'Most companies are fully operational within 24-48 hours. Our onboarding team guides you through every step.' },
    { q:'Do drillers need training?',           a:'The drill log forms are intuitive — most drillers are comfortable after one shift. We provide video walkthroughs and live support.' },
    { q:'Can XPLORIX work offline?',            a:'Yes. The drilling log works offline and automatically syncs when connectivity is restored. Perfect for remote sites.' },
    { q:'How is our data kept secure?',         a:'All data is encrypted in transit and at rest. Each company has completely isolated data. We follow enterprise security standards.' },
    { q:'Can I export data to Excel or PDF?',   a:'All reports, dashboards and drill logs can be exported. Drillers can also download performance certificates directly.' },
    { q:'Multiple projects and sites?',         a:'Yes. XPLORIX is built for multi-site, multi-project operations with unlimited projects and rigs.' },
    { q:'What drilling types are supported?',   a:'Diamond Core, RC, Blast Hole, Geotechnical and other exploration drilling types.' },
    { q:'How does pricing work?',               a:'Pricing is customised based on fleet size and features. Contact our team — most companies find XPLORIX pays for itself within the first month.' },
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
    return { background:bg, border:`1px solid ${border}`, color, fontSize:10, fontWeight:600 as const, padding:'3px 9px', borderRadius:6 }
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:'#080B10', color:'#F8FAFC', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#080B10;}::-webkit-scrollbar-thumb{background:linear-gradient(#F97316,#3B82F6);border-radius:2px;}
        @keyframes xplPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}
        @keyframes xplFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes xplSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .syne{font-family:'Syne',sans-serif!important;}
        .mono{font-family:'JetBrains Mono',monospace!important;}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:700;font-size:15px;font-family:'DM Sans',sans-serif;box-shadow:0 4px 30px rgba(249,115,22,0.35);transition:all 0.3s;text-decoration:none;}
        .btn-primary:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 12px 40px rgba(249,115,22,0.5);}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#F8FAFC;font-weight:600;font-size:15px;font-family:'DM Sans',sans-serif;transition:all 0.3s;text-decoration:none;backdrop-filter:blur(10px);}
        .btn-ghost:hover{background:rgba(255,255,255,0.08);border-color:rgba(249,115,22,0.4);transform:translateY(-2px);}
        .glow-card{transition:all 0.3s;position:relative;}
        .glow-card::before{content:'';position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,rgba(249,115,22,0),rgba(249,115,22,0));transition:all 0.3s;z-index:-1;}
        .glow-card:hover::before{background:linear-gradient(135deg,rgba(249,115,22,0.3),rgba(59,130,246,0.3));}
        .glow-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,0.4),0 0 40px rgba(249,115,22,0.1);}
        .nav-link{color:#94A3B8;text-decoration:none;font-size:14px;font-weight:500;transition:all 0.2s;position:relative;}
        .nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1px;background:#F97316;transition:width 0.2s;}
        .nav-link:hover{color:#F8FAFC;}.nav-link:hover::after{width:100%;}
        @media(max-width:768px){
          .hero-grid,.about-grid,.ai-grid,.contact-grid{grid-template-columns:1fr!important;}
          .hero-right{display:none!important;}
          .features-grid{grid-template-columns:1fr!important;}
          .ind-grid,.plans-grid{grid-template-columns:1fr!important;}
          .footer-grid{grid-template-columns:1fr 1fr!important;}
          .hero-section{padding:100px 24px 60px!important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:900, padding:'14px 60px', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all 0.3s', background:scrolled?'rgba(8,11,16,0.95)':'rgba(8,11,16,0.5)', backdropFilter:'blur(24px)', borderBottom:scrolled?'1px solid rgba(249,115,22,0.1)':'1px solid transparent', boxShadow:scrolled?'0 4px 30px rgba(0,0,0,0.3)':'none' }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
          <XLogo size={36}/>
          <div>
            <div className="syne" style={{ fontSize:17, fontWeight:800, color:'#F8FAFC', letterSpacing:'0.08em' }}>XPLORIX</div>
            <div style={{ fontSize:7, color:'#64748B', letterSpacing:'0.2em', textTransform:'uppercase' }}>Drilling Intelligence</div>
          </div>
        </a>
        <div style={{ display:'flex', gap:32 }}>
          {[{l:'About',href:'#about'},{l:'Platform',href:'#features'},{l:'How it Works',href:'#how'},{l:'AI Insights',href:'#ai'},{l:'Industries',href:'#industries'},{l:'Contact',href:'#contact'}].map(n=>(
            <a key={n.href} href={n.href} className="nav-link">{n.l}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Link href="/auth/login" className="nav-link">Sign in</Link>
          <a href="#contact" className="btn-primary" style={{ padding:'9px 20px', fontSize:13, borderRadius:10 }}>Schedule Demo</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'120px 60px 60px', position:'relative', overflow:'hidden' }}>
        {/* Animated gradient background */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(249,115,22,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 60%), #080B10' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px)', backgroundSize:'80px 80px', WebkitMaskImage:'radial-gradient(ellipse 100% 80% at 50% 0%,black 0%,transparent 70%)' }}/>

        <div style={{ position:'relative', zIndex:2, width:'100%', maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

          {/* Left */}
          <div>
            <FadeIn>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, border:'1px solid rgba(249,115,22,0.3)', background:'rgba(249,115,22,0.06)', fontSize:11, fontWeight:700, color:'#F97316', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:28, backdropFilter:'blur(10px)' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#F97316', display:'inline-block', animation:'xplPulse 1.5s infinite' }}/>
                Live · AI Drilling Intelligence V3.0
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="syne" style={{ fontSize:'clamp(42px,5.5vw,78px)', lineHeight:1.0, fontWeight:900, marginBottom:10, letterSpacing:'-0.02em' }}>
                Drilling<br/>Intelligence<br/>
                <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundSize:'200% 200%', animation:'gradientShift 3s ease infinite' }}>{displayText}</span>
                <span style={{ borderRight:'3px solid #F97316', marginLeft:2, animation:'xplPulse 1s infinite' }}/>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p style={{ fontSize:17, lineHeight:1.8, color:'#94A3B8', maxWidth:500, marginBottom:36, marginTop:16, fontFamily:"'DM Sans',sans-serif" }}>
                AI-powered performance intelligence for exploration drilling — real-time analytics, digital logging, and smarter decisions. Built for the toughest operations on earth.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
                <a href="#contact" className="btn-primary">Schedule Demo →</a>
                <a href="#features" className="btn-ghost">▷ Explore Platform</a>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ display:'flex' }}>
                  {['#F97316','#3B82F6','#10B981','#8B5CF6','#F59E0B'].map((c,i)=>(
                    <div key={i} style={{ width:34, height:34, borderRadius:'50%', background:c, border:'2px solid #080B10', marginLeft:i===0?0:-9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', boxShadow:`0 0 12px ${c}60` }}>
                      {['JW','PN','AA','MK','RT'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex', gap:1, marginBottom:2 }}>{[1,2,3,4,5].map(i=><span key={i} style={{ color:'#F59E0B', fontSize:13 }}>★</span>)}</div>
                  <div style={{ fontSize:12, color:'#64748B', fontFamily:"'DM Sans',sans-serif" }}><span style={{ color:'#F8FAFC', fontWeight:600 }}>30+ companies</span> trust XPLORIX</div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right — 3D Globe */}
          <div className="hero-right" style={{ height:600, position:'relative' }}>
            <div style={{ position:'absolute', inset:-20, background:'radial-gradient(ellipse 80% 80% at 50% 50%,rgba(249,115,22,0.04) 0%,transparent 70%)', pointerEvents:'none' }}/>
            <Globe3D/>
          </div>
        </div>
      </section>

      {/* AI TICKER */}
      <AITicker/>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding:'100px 60px' }}>
        <div className="about-grid" style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:80, alignItems:'center' }}>
          <FadeIn>
            <Tag>About Xplorix</Tag>
            <h2 className="syne" style={{ fontSize:'clamp(30px,4vw,50px)', fontWeight:900, lineHeight:1.1, marginBottom:20, letterSpacing:'-0.02em' }}>
              Performance intelligence for <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>exploration drilling.</span>
            </h2>
            <p style={{ fontSize:15, color:'#94A3B8', lineHeight:1.8, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
              Xplorix is built for drilling contractors who are tired of managing operations on spreadsheets, paper logs and WhatsApp groups.
            </p>
            <p style={{ fontSize:15, color:'#94A3B8', lineHeight:1.8, marginBottom:28, fontFamily:"'DM Sans',sans-serif" }}>
              We replace your entire paper-based workflow with a single intelligent platform — real-time visibility, AI-powered insights, and data-driven decisions across every rig and site.
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['Real-time visibility','AI-powered','Zero paperwork','Multi-site ready','Mobile first'].map(pill=>(
                <span key={pill} style={{ padding:'6px 14px', borderRadius:20, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{pill}</span>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <TiltCard style={{ borderRadius:20, overflow:'hidden', border:'1px solid #1E293B', boxShadow:'0 40px 80px rgba(0,0,0,0.5)', background:'#0D1117', position:'relative' }}>
              <video src="/videos/1st vedio.mp4" autoPlay muted loop playsInline style={{ width:'100%', display:'block', borderRadius:20 }}/>
              <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:6, padding:'5px 10px', background:'rgba(8,11,16,0.85)', borderRadius:8, border:'1px solid #1E293B', backdropFilter:'blur(10px)' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#EF4444', display:'inline-block', animation:'xplPulse 1.5s infinite' }}/>
                <span style={{ fontSize:9, fontWeight:700, color:'#F8FAFC' }}>LIVE DEMO</span>
              </div>
              {/* Glow overlay */}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(249,115,22,0.05),transparent)', pointerEvents:'none', borderRadius:20 }}/>
            </TiltCard>
          </FadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background:'#0D1117', padding:'80px 60px', borderTop:'1px solid rgba(249,115,22,0.08)' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <Tag>How It Works</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, letterSpacing:'-0.02em' }}>
                From signup to full <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>intelligence</span> in 30 min.
              </h2>
              <p style={{ fontSize:14, color:'#64748B', marginTop:8, fontFamily:"'DM Sans',sans-serif" }}>Four steps — no IT team, no spreadsheets, no paper.</p>
            </div>
          </FadeIn>
          <div style={{ position:'relative', maxWidth:860, margin:'0 auto' }}>
            <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, background:'linear-gradient(180deg,transparent,rgba(249,115,22,0.3) 10%,rgba(249,115,22,0.3) 90%,transparent)', transform:'translateX(-50%)', zIndex:0 }}/>
            {howItWorks.map((step,i)=>(
              <FadeIn key={i} delay={i*0.12}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 52px 1fr', marginBottom:28, position:'relative', zIndex:1 }}>
                  {step.side==='left' ? (
                    <TiltCard style={{ padding:'0 22px 0 0' }}>
                      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B', borderRadius:14, padding:'18px 20px', backdropFilter:'blur(10px)', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${step.color},transparent)` }}/>
                        <div style={{ fontSize:9, fontWeight:700, color:step.color, letterSpacing:'0.18em', textTransform:'uppercase' as const, marginBottom:4 }}>STEP {step.step}</div>
                        <div className="syne" style={{ fontSize:16, fontWeight:800, color:'#F8FAFC', marginBottom:6, lineHeight:1.2 }}>{step.title}</div>
                        <div style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>{step.desc}</div>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                          {step.badges.map((b,bi)=><span key={bi} style={bs(b.c)}>{b.t}</span>)}
                        </div>
                        {step.feats.map((f,fi)=>(
                          <div key={fi} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#64748B', marginBottom:3, fontFamily:"'DM Sans',sans-serif" }}>
                            <span style={{ width:3, height:3, borderRadius:'50%', background:step.color, display:'inline-block', flexShrink:0 }}/>{f}
                          </div>
                        ))}
                      </div>
                    </TiltCard>
                  ) : <div/>}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, border:`2px solid ${step.color}`, background:`${step.color}15`, position:'relative', zIndex:2, marginTop:8, boxShadow:`0 0 20px ${step.color}40` }}>{step.icon}</div>
                    <div style={{ position:'absolute', top:-10, fontSize:60, fontWeight:900, fontFamily:"'Syne',sans-serif", color:`${step.color}06`, lineHeight:1, pointerEvents:'none' }}>{step.step}</div>
                  </div>
                  {step.side==='right' ? (
                    <TiltCard style={{ padding:'0 0 0 22px' }}>
                      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B', borderRadius:14, padding:'18px 20px', backdropFilter:'blur(10px)', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${step.color},transparent)` }}/>
                        <div style={{ fontSize:9, fontWeight:700, color:step.color, letterSpacing:'0.18em', textTransform:'uppercase' as const, marginBottom:4 }}>STEP {step.step}</div>
                        <div className="syne" style={{ fontSize:16, fontWeight:800, color:'#F8FAFC', marginBottom:6, lineHeight:1.2 }}>{step.title}</div>
                        <div style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>{step.desc}</div>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                          {step.badges.map((b,bi)=><span key={bi} style={bs(b.c)}>{b.t}</span>)}
                        </div>
                        {step.feats.map((f,fi)=>(
                          <div key={fi} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#64748B', marginBottom:3, fontFamily:"'DM Sans',sans-serif" }}>
                            <span style={{ width:3, height:3, borderRadius:'50%', background:step.color, display:'inline-block', flexShrink:0 }}/>{f}
                          </div>
                        ))}
                      </div>
                    </TiltCard>
                  ) : <div/>}
                </div>
              </FadeIn>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:24 }}>
            <a href="#contact" className="btn-primary" style={{ fontSize:14, padding:'11px 24px' }}>Start Your Free Trial →</a>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <Tag>Platform</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, letterSpacing:'-0.02em' }}>
                Everything your operation needs — <span style={{ background:'linear-gradient(135deg,#3B82F6,#60A5FA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>one platform.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display:'flex', gap:5, marginBottom:24, flexWrap:'wrap', justifyContent:'center' }}>
            {features.map((f,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:9, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif",
                  background:activeTab===i?`${f.color}15`:'rgba(255,255,255,0.03)',
                  border:activeTab===i?`1px solid ${f.color}50`:'1px solid rgba(255,255,255,0.06)',
                  color:activeTab===i?f.color:'#94A3B8',
                  boxShadow:activeTab===i?`0 4px 16px ${f.color}20`:'none',
                }}>
                {f.icon} {f.tab}
              </button>
            ))}
          </div>
          <TiltCard>
            <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:36, alignItems:'center', background:'rgba(13,17,23,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, padding:36, backdropFilter:'blur(20px)', boxShadow:'0 40px 80px rgba(0,0,0,0.4)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${features[activeTab].color},transparent)` }}/>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', borderRadius:20, background:`${features[activeTab].color}12`, border:`1px solid ${features[activeTab].color}35`, fontSize:11, fontWeight:700, color:features[activeTab].color, marginBottom:14 }}>
                  {features[activeTab].icon} {features[activeTab].tab}
                </div>
                <h3 className="syne" style={{ fontSize:21, fontWeight:800, color:'#F8FAFC', marginBottom:12, lineHeight:1.2 }}>{features[activeTab].title}</h3>
                <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.7, marginBottom:20, fontFamily:"'DM Sans',sans-serif" }}>{features[activeTab].desc}</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:22 }}>
                  {features[activeTab].points.map((point,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#94A3B8', fontFamily:"'DM Sans',sans-serif" }}>
                      <span style={{ color:features[activeTab].color, fontSize:12 }}>✓</span>{point}
                    </div>
                  ))}
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'10px 18px', background:`${features[activeTab].color}08`, border:`1px solid ${features[activeTab].color}25`, borderRadius:11 }}>
                  <div className="mono" style={{ fontSize:22, fontWeight:700, color:features[activeTab].color }}>{features[activeTab].stat.value}</div>
                  <div style={{ fontSize:12, color:'#64748B', fontFamily:"'DM Sans',sans-serif" }}>{features[activeTab].stat.label}</div>
                </div>
              </div>
              <div style={{ background:'rgba(8,11,16,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:20, minHeight:250, display:'flex', flexDirection:'column', gap:9 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#EF4444' }}/><div style={{ width:7, height:7, borderRadius:'50%', background:'#F59E0B' }}/><div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981' }}/>
                  <span style={{ fontSize:9, color:'#64748B', marginLeft:6, fontFamily:"'DM Sans',sans-serif" }}>XPLORIX › {features[activeTab].tab}</span>
                </div>
                {[...Array(4)].map((_,i)=>(
                  <div key={i} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:11, display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:`${features[activeTab].color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{features[activeTab].icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, marginBottom:4, width:`${60+i*10}%` }}/>
                      <div style={{ height:4, background:'rgba(255,255,255,0.04)', borderRadius:3, width:`${30+i*12}%` }}/>
                    </div>
                    <div className="mono" style={{ fontSize:12, fontWeight:700, color:features[activeTab].color }}>{['98%','✓','A+','↑'][i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ── AI INSIGHTS ── */}
      <section id="ai" style={{ background:'#0D1117', padding:'100px 60px', borderTop:'1px solid rgba(249,115,22,0.08)' }}>
        <div className="ai-grid" style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }}>
          <FadeIn>
            <Tag>AI-Powered Insights</Tag>
            <h2 className="syne" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, lineHeight:1.1, marginBottom:16, letterSpacing:'-0.02em' }}>
              Intelligence that <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>acts</span> before you <span style={{ background:'linear-gradient(135deg,#3B82F6,#60A5FA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>ask.</span>
            </h2>
            <p style={{ fontSize:15, color:'#94A3B8', lineHeight:1.7, marginBottom:24, fontFamily:"'DM Sans',sans-serif" }}>
              XPLORIX AI monitors every data point from every rig, every shift — detecting anomalies, predicting failures and delivering daily recommendations automatically.
            </p>
            {[
              { icon:'🔮', title:'Predictive Failure Detection',       desc:'Identifies equipment failure patterns before they cause downtime' },
              { icon:'💡', title:'Daily Performance Recommendations',   desc:'Automated shift summaries with specific actionable improvements' },
              { icon:'💰', title:'Cost Optimisation Engine',           desc:'Continuously finds cost-per-meter savings across rigs and formations' },
            ].map((f,i)=>(
              <TiltCard key={i}>
                <div style={{ display:'flex', gap:12, padding:'12px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:11, marginBottom:8, backdropFilter:'blur(10px)' }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC', marginBottom:3, fontFamily:"'DM Sans',sans-serif" }}>{f.title}</div>
                    <div style={{ fontSize:11, color:'#94A3B8', lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{f.desc}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Live AI Insights Feed</div>
              {aiInsights.map((insight,i)=>(
                <TiltCard key={i}>
                  <div style={{ padding:14, borderRadius:14, background:`${insight.color}08`, border:`1px solid ${insight.color}25`, backdropFilter:'blur(10px)' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:7 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:14 }}>{insight.icon}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:'#F8FAFC', fontFamily:"'DM Sans',sans-serif" }}>{insight.title}</div>
                          <div style={{ fontSize:10, color:'#64748B' }}>{insight.rig} · {insight.time}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:5, background:`${insight.color}20`, color:insight.color, border:`1px solid ${insight.color}30`, whiteSpace:'nowrap', flexShrink:0, marginLeft:8 }}>{insight.badge}</span>
                    </div>
                    <p style={{ fontSize:11, color:'#94A3B8', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{insight.desc}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section id="industries" style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <h2 className="syne" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, letterSpacing:'-0.02em' }}>
                Built for the toughest <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>operations on earth.</span>
              </h2>
            </div>
          </FadeIn>
          <div className="ind-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {[
              { icon:'⛏', title:'Mining',               desc:'End-to-end visibility for surface & underground mining operations.',  tag:'LIVE', color:'#F97316' },
              { icon:'🔩', title:'Exploration Drilling', desc:'Built for diamond core & RC operations in remote environments.',      tag:'LIVE', color:'#3B82F6' },
              { icon:'🏔', title:'Geotechnical',         desc:'Track investigation programs at scale with full data visibility.',    tag:'LIVE', color:'#10B981' },
              { icon:'💥', title:'Blast Hole Drilling',  desc:'Productivity intelligence for high-volume production drilling.',      tag:'LIVE', color:'#8B5CF6' },
            ].map((ind,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <TiltCard className="glow-card" style={{ background:'rgba(13,17,23,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'24px 20px', cursor:'pointer', height:'100%', backdropFilter:'blur(10px)' }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${ind.color}15`, border:`1px solid ${ind.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14, boxShadow:`0 4px 16px ${ind.color}20` }}>{ind.icon}</div>
                  <h3 className="syne" style={{ fontSize:15, fontWeight:700, color:'#F8FAFC', marginBottom:8 }}>{ind.title}</h3>
                  <p style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>{ind.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:9, color:'#64748B', fontWeight:700, letterSpacing:'0.08em' }}>
                    <div style={{ width:14, height:2, background:`linear-gradient(90deg,${ind.color},transparent)`, borderRadius:1 }}/>{ind.tag} DEPLOYMENTS
                  </div>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background:'#0D1117', padding:'100px 60px', borderTop:'1px solid rgba(249,115,22,0.08)' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <Tag>Pricing</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, marginBottom:10, letterSpacing:'-0.02em' }}>
                XPLORIX <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Plans</span>
              </h2>
              <p style={{ fontSize:14, color:'#64748B', fontFamily:"'DM Sans',sans-serif" }}>Powerful insights. Smarter operations. Maximum uptime.</p>
            </div>
          </FadeIn>
          <div className="plans-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18, marginBottom:24 }}>
            {plans.map((plan,i)=>(
              <FadeIn key={i} delay={i*0.1}>
                <TiltCard className="glow-card" style={{ background:plan.highlight?'rgba(249,115,22,0.04)':'rgba(8,11,16,0.8)', border:plan.highlight?'2px solid rgba(249,115,22,0.4)':'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:26, position:'relative', height:'100%', display:'flex', flexDirection:'column', backdropFilter:'blur(10px)', boxShadow:plan.highlight?'0 0 60px rgba(249,115,22,0.1)':'none' }}>
                  {plan.badge && <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(30,41,59,0.9)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 14px', borderRadius:20, whiteSpace:'nowrap', backdropFilter:'blur(10px)' }}>{plan.badge}</div>}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ width:42, height:42, borderRadius:11, background:plan.highlight?'rgba(249,115,22,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${plan.highlight?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.08)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{plan.icon}</div>
                    <div>
                      <div className="syne" style={{ fontSize:15, fontWeight:800, color:'#F8FAFC' }}>{plan.name}</div>
                      <div style={{ fontSize:10, color:plan.highlight?'#F97316':'#64748B', marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>{plan.billing}</div>
                    </div>
                  </div>
                  <div style={{ padding:'10px 12px', background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:9, marginBottom:14, textAlign:'center' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#F97316', fontFamily:"'DM Sans',sans-serif" }}>Contact Us for Pricing</div>
                    <div style={{ fontSize:10, color:'#64748B', marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>Tailored to your fleet size</div>
                  </div>
                  <div style={{ fontSize:9, fontWeight:700, color:plan.highlight?'#F97316':'#64748B', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:9, fontFamily:"'DM Sans',sans-serif" }}>{plan.coreLabel}</div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
                    {plan.feats.map((f,fi)=>(
                      <div key={fi} style={{ display:'flex', alignItems:'flex-start', gap:6, fontSize:11, color:'#94A3B8', lineHeight:1.4, fontFamily:"'DM Sans',sans-serif" }}>
                        <span style={{ color:plan.highlight?'#F97316':'#10B981', fontSize:11, flexShrink:0, marginTop:1 }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <a href="#contact" style={{ display:'block', textAlign:'center', marginTop:18, padding:'10px', borderRadius:9, background:plan.highlight?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(255,255,255,0.04)', border:plan.highlight?'none':'1px solid rgba(255,255,255,0.08)', color:plan.highlight?'#fff':'#94A3B8', fontSize:12, fontWeight:700, textDecoration:'none', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
                    Get Started →
                  </a>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <div style={{ padding:'18px 24px', background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, backdropFilter:'blur(10px)' }}>
              <div>
                <div className="syne" style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Get a personalised quote for your operation</div>
                <div style={{ fontSize:11, color:'#64748B', marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>Most companies find XPLORIX pays for itself within the first month</div>
              </div>
              <a href="#contact" className="btn-primary" style={{ fontSize:13, padding:'9px 20px' }}>Contact Us for Pricing →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding:'100px 60px' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <Tag>FAQ</Tag>
              <h2 className="syne" style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:900, letterSpacing:'-0.02em' }}>
                Common <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>questions answered.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {faqs.map((faq,i)=>(
              <FadeIn key={i} delay={i*0.04}>
                <div style={{ background:'rgba(13,17,23,0.8)', border:`1px solid ${activeFaq===i?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:12, overflow:'hidden', transition:'all 0.2s', backdropFilter:'blur(10px)' }}>
                  <button onClick={()=>setActiveFaq(activeFaq===i?null:i)}
                    style={{ width:'100%', padding:'15px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', color:'#F8FAFC', fontSize:13, fontWeight:600, textAlign:'left', gap:12, fontFamily:"'DM Sans',sans-serif" }}>
                    <span>{faq.q}</span>
                    <span style={{ color:activeFaq===i?'#F97316':'#64748B', fontSize:18, flexShrink:0, transition:'transform 0.3s', transform:activeFaq===i?'rotate(45deg)':'none' }}>+</span>
                  </button>
                  {activeFaq===i && <div style={{ padding:'0 18px 14px', fontSize:13, color:'#94A3B8', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>{faq.a}</div>}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + CONTACT ── */}
      <section id="contact" style={{ padding:'100px 60px', background:'radial-gradient(ellipse 80% 60% at 50% 100%,rgba(249,115,22,0.06) 0%,transparent 60%),#080B10', borderTop:'1px solid rgba(249,115,22,0.08)' }}>
        <div className="contact-grid" style={{ maxWidth:1300, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:72, alignItems:'start' }}>
          <FadeIn>
            <Tag>Get Started</Tag>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:9, background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.2)', marginBottom:16, backdropFilter:'blur(10px)' }}>
              <span style={{ fontSize:16 }}>⛏</span>
              <span className="syne" style={{ fontSize:13, fontWeight:700, color:'#F97316', fontStyle:'italic' }}>"Built by drillers, for drillers."</span>
            </div>
            <h2 className="syne" style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:900, lineHeight:1.1, marginBottom:14, letterSpacing:'-0.02em' }}>
              Transform your drilling operations with <span style={{ background:'linear-gradient(135deg,#F97316,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI.</span>
            </h2>
            <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.7, marginBottom:28, fontFamily:"'DM Sans',sans-serif" }}>
              Book a personalised 15-minute walkthrough. We'll show you how teams cut downtime, boost productivity and digitise drill logs in under 30 days.
            </p>
            {[
              { icon:'🌍', title:'Deployed across 30+ countries',  sub:'Global infrastructure, local support teams'  },
              { icon:'⚡', title:'Live in under 30 minutes',        sub:'No IT team needed — just your login'         },
              { icon:'🛡', title:'Enterprise security & SSO',       sub:'SOC 2 compliant, end-to-end encrypted'       },
              { icon:'🤖', title:'AI insights from day one',        sub:'No training — insights start immediately'    },
            ].map((pt,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, backdropFilter:'blur(10px)' }}>{pt.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC', fontFamily:"'DM Sans',sans-serif" }}>{pt.title}</div>
                  <div style={{ fontSize:11, color:'#64748B', marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>{pt.sub}</div>
                </div>
              </div>
            ))}
          </FadeIn>
          <FadeIn delay={0.2}>
            <TiltCard>
              <div style={{ background:'rgba(13,17,23,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28, backdropFilter:'blur(20px)', boxShadow:'0 32px 80px rgba(0,0,0,0.4)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#F97316,#F59E0B,#3B82F6)' }}/>
                <div className="syne" style={{ fontSize:15, fontWeight:700, color:'#F8FAFC', marginBottom:20 }}>Book a Free Demo</div>
                {[
                  [{label:'Name',ph:'Jane Doe',type:'text'},{label:'Company',ph:'Acme Drilling Co.',type:'text'}],
                  [{label:'Email',ph:'jane@acme.com',type:'email'},{label:'Phone',ph:'+1 555 000 1234',type:'tel'}],
                ].map((row,ri)=>(
                  <div key={ri} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {row.map((f,fi)=>(
                      <div key={fi} style={{ marginBottom:10 }}>
                        <label style={{ fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const, display:'block', marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{f.label}</label>
                        <input type={f.type} placeholder={f.ph} style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'#F8FAFC', fontFamily:"'DM Sans',sans-serif", fontSize:12, outline:'none', backdropFilter:'blur(10px)' }}
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
                    <label style={{ fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const, display:'block', marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{f.label}</label>
                    <select style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(13,17,23,0.9)', color:'#F8FAFC', fontFamily:"'DM Sans',sans-serif", fontSize:12, outline:'none', cursor:'pointer', appearance:'none' as const }}
                      onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.5)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)'}}>
                      {f.opts.map(o=><option key={o} style={{ background:'#0D1117' }}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const, display:'block', marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>Message</label>
                  <textarea placeholder="Tell us about your fleet size..." rows={3}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'#F8FAFC', fontFamily:"'DM Sans',sans-serif", fontSize:12, outline:'none', resize:'vertical' as const }}
                    onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.5)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)'}}/>
                </div>
                <div style={{ display:'flex', gap:9 }}>
                  <button className="btn-ghost" style={{ flex:1, justifyContent:'center', padding:'10px', fontSize:13 }}>Contact Sales</button>
                  <button className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'10px', fontSize:13 }}>Book Demo →</button>
                </div>
                <p style={{ fontSize:10, color:'#64748B', textAlign:'center', marginTop:10, fontFamily:"'DM Sans',sans-serif" }}>By submitting, you agree to our terms & privacy policy.</p>
              </div>
            </TiltCard>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0D1117', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'48px 60px 24px' }}>
        <div className="footer-grid" style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:36, marginBottom:36 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:14 }}>
              <XLogo size={32}/>
              <div>
                <div className="syne" style={{ fontSize:14, fontWeight:800, color:'#F8FAFC' }}>XPLORIX</div>
                <div style={{ fontSize:8, color:'#64748B', letterSpacing:'0.15em', textTransform:'uppercase' }}>Drilling Intelligence</div>
              </div>
            </div>
            <p style={{ fontSize:12, color:'#64748B', lineHeight:1.7, maxWidth:220, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>The world's most advanced drilling intelligence platform. Built for exploration drilling contractors who demand more.</p>
            <div style={{ display:'flex', gap:7 }}>
              {['L','T','Y'].map((s,i)=>(
                <div key={i} style={{ width:30, height:30, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#64748B', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.4)';(e.currentTarget as HTMLElement).style.color='#F97316'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.color='#64748B'}}>{s}</div>
              ))}
            </div>
          </div>
          {[
            { title:'Product',    items:['Operations Dashboard','Maintenance Dashboard','Driller Performance','AI Insights','Inventory Management','Finance & Costing'] },
            { title:'Company',    items:['About Us','Careers','Blog','Press','Partners','Contact Us'] },
            { title:'Industries', items:['Mining','Exploration Drilling','Geotechnical','Blast Hole Drilling','RC Drilling','Diamond Core'] },
          ].map((col,i)=>(
            <div key={i}>
              <div className="syne" style={{ fontSize:10, fontWeight:700, color:'#F8FAFC', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>{col.title}</div>
              {col.items.map(l=>(
                <div key={l} style={{ fontSize:12, color:'#64748B', marginBottom:7, cursor:'pointer', transition:'color 0.2s', fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:18, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:9 }}>
          <p style={{ fontSize:12, color:'#64748B', fontFamily:"'DM Sans',sans-serif" }}>© 2026 Xplorix. All rights reserved. Built with ❤️ for the drilling industry.</p>
          <div style={{ display:'flex', gap:18 }}>
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(l=>(
              <span key={l} style={{ fontSize:11, color:'#64748B', cursor:'pointer', transition:'color 0.2s', fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

