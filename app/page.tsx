'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function LandingPage() {

  // ── Animate counters on scroll ──
  useEffect(() => {
    // Generate chart bars
    const bars = document.getElementById('chartBars')
    if (bars && bars.children.length === 0) {
      const heights = [35,45,30,55,40,60,45,70,55,80,65,85,70,90,75,95,80,85,90,88]
      heights.forEach((h, i) => {
        const b = document.createElement('div')
        b.style.cssText = `flex:1;border-radius:3px 3px 0 0;height:${h}%;animation:barGrow 1s ease-out ${i*0.05}s both;transform-origin:bottom;background:${i>=16?'linear-gradient(to top,#F97316,#F59E0B)':'rgba(59,130,246,0.3)'}`
        bars.appendChild(b)
      })
    }

    // Scroll fade-in
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('xpl-visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.xpl-fade').forEach(el => observer.observe(el))

    // Counter animation
    function animateCounter(el: Element, target: number, suffix: string) {
      let start = 0
      const duration = 2000
      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        ;(el as HTMLElement).textContent = Math.floor(progress * target) + suffix
        if (progress < 1) requestAnimationFrame(step)
        else (el as HTMLElement).textContent = target + suffix
      }
      requestAnimationFrame(step)
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          animateCounter(el, parseInt(el.dataset.target || '0'), el.dataset.suffix || '+')
          counterObserver.unobserve(el)
        }
      })
    }, { threshold: 0.5 })
    document.querySelectorAll('.xpl-counter').forEach(el => counterObserver.observe(el))

    // Navbar scroll
    const handleScroll = () => {
      const nav = document.getElementById('xpl-nav')
      if (nav) {
        nav.style.background = window.scrollY > 50 ? 'rgba(8,11,16,0.98)' : 'rgba(8,11,16,0.8)'
        nav.style.borderBottomColor = window.scrollY > 50 ? 'rgba(30,41,59,0.8)' : 'rgba(30,41,59,0.4)'
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      observer.disconnect()
      counterObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .xpl-page * { margin:0; padding:0; box-sizing:border-box; }
        .xpl-page {
          font-family:'Inter',sans-serif;
          background:#080B10; color:#F8FAFC;
          overflow-x:hidden; scroll-behavior:smooth;
        }
        .xpl-page h1,.xpl-page h2,.xpl-page h3,.xpl-page h4 {
          font-family:'Space Grotesk',sans-serif; font-weight:700;
        }
        .xpl-page ::-webkit-scrollbar{width:4px}
        .xpl-page ::-webkit-scrollbar-track{background:#080B10}
        .xpl-page ::-webkit-scrollbar-thumb{background:#1E293B;border-radius:2px}

        /* Fade animations */
        .xpl-fade { opacity:0; transform:translateY(28px); transition:opacity 0.6s ease, transform 0.6s ease; }
        .xpl-fade.xpl-visible { opacity:1; transform:translateY(0); }
        .xpl-d1{transition-delay:0.1s} .xpl-d2{transition-delay:0.2s}
        .xpl-d3{transition-delay:0.3s} .xpl-d4{transition-delay:0.4s}

        /* Float */
        @keyframes xplFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes xplFloat2{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(-2deg)}}
        @keyframes xplFloat3{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(8px) rotate(1deg)}}
        @keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        @keyframes xplPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}

        .xpl-float{animation:xplFloat 6s ease-in-out infinite}
        .xpl-float2{animation:xplFloat2 5s ease-in-out infinite}
        .xpl-float3{animation:xplFloat3 7s ease-in-out infinite}
        .xpl-pulse{animation:xplPulse 2s infinite}

        /* Gradient text */
        .xpl-orange{color:#F97316}
        .xpl-blue{color:#60A5FA}
        .xpl-muted{color:#94A3B8}
        .xpl-dim{color:#64748B}

        /* Buttons */
        .xpl-btn-primary{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 28px;border-radius:12px;border:none;cursor:pointer;
          background:linear-gradient(135deg,#F97316,#EA580C);
          color:#fff;font-weight:700;font-size:15px;font-family:'Inter',sans-serif;
          box-shadow:0 4px 30px rgba(249,115,22,0.3);
          transition:all 0.25s;text-decoration:none;
        }
        .xpl-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(249,115,22,0.45)}
        .xpl-btn-secondary{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 28px;border-radius:12px;cursor:pointer;
          background:rgba(255,255,255,0.05);border:1px solid #1E293B;
          color:#F8FAFC;font-weight:600;font-size:15px;font-family:'Inter',sans-serif;
          transition:all 0.25s;text-decoration:none;
        }
        .xpl-btn-secondary:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2)}

        /* Section tag */
        .xpl-tag{
          display:inline-flex;align-items:center;gap:8px;
          padding:5px 14px;border-radius:100px;
          border:1px solid rgba(249,115,22,0.25);
          background:rgba(249,115,22,0.05);
          font-size:10px;font-weight:700;letter-spacing:0.15em;color:#F97316;
          text-transform:uppercase;margin-bottom:20px;
        }
        .xpl-tag-dot{width:5px;height:5px;border-radius:50%;background:#F97316}

        /* Cards */
        .xpl-card{
          background:#0D1117;border:1px solid #1E293B;
          border-radius:20px;transition:all 0.3s;
        }
        .xpl-card:hover{border-color:rgba(249,115,22,0.25)}

        /* Nav */
        #xpl-nav{
          position:fixed;top:0;left:0;right:0;z-index:900;
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 60px;
          background:rgba(8,11,16,0.8);
          backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(30,41,59,0.4);
          transition:all 0.3s;
        }

        /* Responsive */
        @media(max-width:1024px){
          #xpl-nav{padding:14px 20px}
          .xpl-nav-links{display:none!important}
          .xpl-hero-inner{grid-template-columns:1fr!important}
          .xpl-hero-visual{display:none!important}
          .xpl-about-grid,.xpl-log-grid,.xpl-ai-grid,.xpl-cta-grid{grid-template-columns:1fr!important}
          .xpl-vm-grid,.xpl-dash-grid{grid-template-columns:1fr!important}
          .xpl-ind-grid{grid-template-columns:1fr 1fr!important}
          .xpl-stats-inner{grid-template-columns:1fr 1fr!important}
          .xpl-form-row{grid-template-columns:1fr!important}
          .xpl-section{padding:70px 20px!important}
          .xpl-stats-bar{padding:40px 20px!important}
        }
      `}</style>

      <div className="xpl-page">

        {/* ── NAV ── */}
        <nav id="xpl-nav">
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
            <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#F97316,#F59E0B)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'#000',boxShadow:'0 0 20px rgba(249,115,22,0.3)',fontFamily:"'Space Grotesk',sans-serif" }}>X</div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'#F8FAFC',letterSpacing:'0.05em',fontFamily:"'Space Grotesk',sans-serif" }}>XPLORIX</div>
              <div style={{ fontSize:9,color:'#64748B',letterSpacing:'0.15em',textTransform:'uppercase' }}>Drilling Intelligence</div>
            </div>
          </Link>
          <ul className="xpl-nav-links" style={{ display:'flex',gap:36,listStyle:'none' }}>
            {['#about','#dashboards','#ai','#industries','#cta'].map((href, i) => (
              <li key={i}><a href={href} style={{ color:'#94A3B8',textDecoration:'none',fontSize:14,fontWeight:500,transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='#F8FAFC')}
                onMouseLeave={e => (e.currentTarget.style.color='#94A3B8')}
              >{['About','Platform','AI Insights','Industries','Contact'][i]}</a></li>
            ))}
          </ul>
          <div style={{ display:'flex',alignItems:'center',gap:14 }}>
            <Link href="/auth/login" style={{ background:'none',border:'none',color:'#94A3B8',fontSize:14,cursor:'pointer',fontFamily:'inherit',textDecoration:'none',fontWeight:500,transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.color='#94A3B8')}
            >Sign in</Link>
            <a href="#cta" className="xpl-btn-primary" style={{ padding:'9px 20px',fontSize:13,borderRadius:10 }}>Schedule Demo</a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ minHeight:'100vh',display:'flex',alignItems:'center',padding:'120px 60px 60px',position:'relative',overflow:'hidden' }}>
          {/* BG */}
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(249,115,22,0.08) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 60%,rgba(59,130,246,0.06) 0%,transparent 60%),#080B10' }} />
          <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(30,41,59,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(30,41,59,0.15) 1px,transparent 1px)',backgroundSize:'60px 60px',WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 0%,black 0%,transparent 70%)' }} />

          <div className="xpl-hero-inner" style={{ position:'relative',zIndex:2,width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',maxWidth:1400,margin:'0 auto' }}>
            {/* Left */}
            <div>
              <div className="xpl-tag" style={{ marginBottom:28 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'#F97316',animation:'xplPulse 2s infinite',display:'inline-block' }} />
                Live · AI Drilling Intelligence V3.0
              </div>
              <h1 style={{ fontSize:'clamp(48px,5vw,78px)',lineHeight:1.05,marginBottom:24 }}>
                Drilling Intelligence<br />
                <span className="xpl-orange">Reimagi</span><span className="xpl-blue">ned</span>
              </h1>
              <p style={{ fontSize:17,lineHeight:1.7,color:'#94A3B8',maxWidth:540,marginBottom:40 }}>
                AI-powered performance intelligence platform for exploration drilling operations — delivering real-time analytics, digital logging, operational visibility, and smarter decision-making.
              </p>
              <div style={{ display:'flex',gap:16,flexWrap:'wrap' }}>
                <a href="#cta" className="xpl-btn-primary">Schedule Demo →</a>
                <a href="#dashboards" className="xpl-btn-secondary">▷ Explore Platform</a>
              </div>
            </div>

            {/* Right — Dashboard card */}
            <div className="xpl-hero-visual" style={{ position:'relative' }}>
              {/* Floating cards */}
              <div className="xpl-float2" style={{ position:'absolute',top:-30,right:-20,background:'rgba(13,17,23,0.95)',border:'1px solid #1E293B',borderRadius:12,padding:'12px 16px',backdropFilter:'blur(20px)',boxShadow:'0 20px 40px rgba(0,0,0,0.4)',zIndex:2 }}>
                <div style={{ fontSize:18,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:'#10B981' }}>+12%</div>
                <div style={{ fontSize:10,color:'#64748B',marginTop:2 }}>AI Insight · Efficiency</div>
              </div>
              <div className="xpl-float3" style={{ position:'absolute',bottom:20,left:-30,background:'rgba(13,17,23,0.95)',border:'1px solid #1E293B',borderRadius:12,padding:'12px 16px',backdropFilter:'blur(20px)',boxShadow:'0 20px 40px rgba(0,0,0,0.4)',zIndex:2,display:'flex',gap:16,alignItems:'center' }}>
                <div><div style={{ fontSize:18,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:'#F8FAFC' }}>1,844</div><div style={{ fontSize:10,color:'#64748B',marginTop:2 }}>Downtime hrs</div></div>
                <div style={{ width:1,height:32,background:'#1E293B' }} />
                <div><div style={{ fontSize:16,fontWeight:700,color:'#F97316' }}>-3%</div><div style={{ fontSize:10,color:'#10B981' }}>Improving</div></div>
              </div>

              {/* Main dashboard card */}
              <div className="xpl-float" style={{ background:'rgba(13,17,23,0.95)',border:'1px solid #1E293B',borderRadius:20,padding:20,backdropFilter:'blur(20px)',boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:14,fontWeight:600,color:'#F8FAFC' }}>Rig 07 · Pilbara</div>
                    <div style={{ fontSize:11,color:'#64748B',marginTop:2 }}>Live Operations</div>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#F97316',background:'rgba(249,115,22,0.1)',padding:'4px 10px',borderRadius:20,border:'1px solid rgba(249,115,22,0.2)' }}>
                    <span style={{ width:6,height:6,borderRadius:'50%',background:'#F97316',animation:'xplPulse 1.5s infinite',display:'inline-block' }} />
                    Drilling
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
                  {[
                    { icon:'⚡', val:'9.8', unit:'m/hr', label:'Avg ROP',      color:'#F8FAFC', change:'+2.1%' },
                    { icon:'📊', val:'34.9K',unit:'',   label:'Meters',       color:'#60A5FA', change:'+1%'   },
                    { icon:'🎯', val:'92%',  unit:'',   label:'Productivity', color:'#F97316', change:'+3%'   },
                    { icon:'💎', val:'97.4%',unit:'',   label:'Core Recovery',color:'#10B981', change:'+0.8%' },
                  ].map((k,i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.03)',border:'1px solid #1E293B',borderRadius:12,padding:14 }}>
                      <div style={{ fontSize:16,marginBottom:8 }}>{k.icon}</div>
                      <div style={{ fontSize:22,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:k.color }}>{k.val}<span style={{ fontSize:12,color:'#64748B',fontWeight:400 }}> {k.unit}</span></div>
                      <div style={{ fontSize:11,color:'#64748B',marginTop:2 }}>{k.label}</div>
                      <div style={{ fontSize:11,color:'#10B981',marginTop:4 }}>▲ {k.change}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'rgba(255,255,255,0.02)',border:'1px solid #1E293B',borderRadius:12,padding:14 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:10 }}>
                    <span style={{ color:'#94A3B8' }}>ROP Trend · 24h</span>
                    <span style={{ color:'#F97316' }}>↗ Optimal</span>
                  </div>
                  <div id="chartBars" style={{ display:'flex',alignItems:'flex-end',gap:4,height:50 }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="xpl-stats-bar" style={{ background:'#0D1117',borderTop:'1px solid #1E293B',borderBottom:'1px solid #1E293B',padding:'40px 60px' }}>
          <div className="xpl-stats-inner" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:40 }}>
            {[
              { target:30, suffix:'+', label:'Countries Served' },
              { target:5,  suffix:'M+',label:'Meters Logged' },
              { target:99, suffix:'%', label:'Platform Uptime' },
              { target:40, suffix:'%', label:'Downtime Reduction' },
            ].map((s,i) => (
              <div key={i} className="xpl-fade" style={{ textAlign:'center' }}>
                <span className="xpl-counter" data-target={s.target} data-suffix={s.suffix}
                  style={{ fontSize:40,fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",background:'linear-gradient(135deg,#F97316,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',display:'block' }}>
                  0{s.suffix}
                </span>
                <div style={{ color:'#94A3B8',fontSize:13,marginTop:6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT ── */}
        <section id="about" className="xpl-section" style={{ padding:'100px 60px' }}>
          <div className="xpl-about-grid" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:80,alignItems:'center' }}>
            <div className="xpl-fade">
              <div className="xpl-tag"><span className="xpl-tag-dot" />About Xplorix</div>
              <h2 style={{ fontSize:'clamp(36px,4vw,54px)',lineHeight:1.1,marginBottom:24 }}>
                Performance intelligence for <span className="xpl-orange">exploration drilling.</span>
              </h2>
              <p style={{ fontSize:16,color:'#94A3B8',lineHeight:1.8,marginBottom:16 }}>
                Xplorix is a performance intelligence platform built for exploration drilling and core operations. Our software helps companies improve operational efficiency, increase data visibility, and make smarter decisions through real-time analytics and digital workflows.
              </p>
              <p style={{ fontSize:16,color:'#94A3B8',lineHeight:1.8 }}>
                Designed to replace manual processes with intelligent, data-driven operations — Xplorix enables teams to achieve higher accuracy, stronger operational control, scalable performance management, and AI-powered insights across projects.
              </p>
            </div>
            <div className="xpl-fade xpl-d2" style={{ background:'#0D1117',border:'1px solid #1E293B',borderRadius:24,overflow:'hidden',boxShadow:'0 40px 80px rgba(0,0,0,0.3)' }}>
              <div style={{ padding:20,background:'#111827' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid #1E293B' }}>
                  <div style={{ width:24,height:24,borderRadius:6,background:'linear-gradient(135deg,#F97316,#F59E0B)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'#000' }}>X</div>
                  <span style={{ fontWeight:600,color:'#F8FAFC',fontSize:13 }}>XPLORIX</span>
                  <span style={{ color:'#64748B',fontSize:12,marginLeft:4 }}>› Dashboard</span>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12 }}>
                  {[{v:'16',l:'Projects'},{v:'16',l:'Total Rigs'},{v:'12',l:'Users'},{v:'AI',l:'Insights',c:'#F97316'}].map((k,i)=>(
                    <div key={i} style={{ background:'#0D1117',border:'1px solid #1E293B',borderRadius:8,padding:10,textAlign:'center' }}>
                      <div style={{ fontSize:18,fontWeight:800,color:k.c||'#F8FAFC' }}>{k.v}</div>
                      <div style={{ color:'#64748B',fontSize:10,marginTop:2 }}>{k.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#0D1117',border:'1px solid #1E293B',borderRadius:8,padding:12 }}>
                  <div style={{ color:'#94A3B8',marginBottom:8,fontWeight:600,fontSize:12 }}>Production Snapshot</div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
                    {[{v:'34,986m',l:'Total Meters',c:'#F8FAFC'},{v:'3,580hrs',l:'Drilling Hrs',c:'#60A5FA'},{v:'9.8m/hr',l:'Avg ROP',c:'#F97316'}].map((k,i)=>(
                      <div key={i}><div style={{ fontSize:14,fontWeight:800,color:k.c }}>{k.v}</div><div style={{ color:'#64748B',fontSize:10,marginTop:2 }}>{k.l}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VISION & MISSION ── */}
        <section id="vision" style={{ background:'#0D1117',padding:'100px 60px' }}>
          <div style={{ maxWidth:1400,margin:'0 auto' }}>
            <div className="xpl-fade" style={{ textAlign:'center',marginBottom:60 }}>
              <div className="xpl-tag" style={{ margin:'0 auto 20px',display:'inline-flex' }}><span className="xpl-tag-dot" />Our Purpose</div>
              <h2 style={{ fontSize:'clamp(36px,4vw,54px)' }}>Built with a clear <span className="xpl-orange">direction.</span></h2>
            </div>
            <div className="xpl-vm-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24 }}>
              {[
                { tag:'▲ VISION', tagStyle:{ background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',color:'#F97316' }, cardStyle:{ background:'linear-gradient(135deg,rgba(249,115,22,0.07),rgba(13,17,23,0.95))',border:'1px solid rgba(249,115,22,0.2)' }, glow:'#F97316', text:'To help drilling contractors easily understand operations and performance through intelligent and simplified analytics.' },
                { tag:'⚙ MISSION', tagStyle:{ background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',color:'#60A5FA' }, cardStyle:{ background:'linear-gradient(135deg,rgba(59,130,246,0.07),rgba(13,17,23,0.95))',border:'1px solid rgba(59,130,246,0.2)' }, glow:'#3B82F6', text:'To modernize exploration drilling operations using digital logging, real-time monitoring, AI-driven insights, and performance analytics that improve efficiency, visibility, and operational decision-making.' },
              ].map((vm,i) => (
                <div key={i} className={`xpl-fade ${i===1?'xpl-d2':''}`} style={{ borderRadius:20,padding:48,position:'relative',overflow:'hidden',...vm.cardStyle }}>
                  <div style={{ position:'absolute',width:200,height:200,borderRadius:'50%',filter:'blur(80px)',opacity:0.12,right:-40,top:-40,background:vm.glow,pointerEvents:'none' }} />
                  <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:100,marginBottom:28,fontSize:10,fontWeight:700,letterSpacing:'0.15em',...vm.tagStyle }}>{vm.tag}</div>
                  <p style={{ fontSize:24,lineHeight:1.45,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",marginBottom:32 }}>{vm.text}</p>
                  <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#64748B' }}>
                    <div style={{ width:24,height:2,background:vm.glow,borderRadius:1 }} />
                    Engineered for the next decade of exploration
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARDS ── */}
        <section id="dashboards" className="xpl-section" style={{ padding:'100px 60px' }}>
          <div style={{ maxWidth:1400,margin:'0 auto' }}>
            <div className="xpl-fade" style={{ textAlign:'center',marginBottom:60 }}>
              <div className="xpl-tag" style={{ margin:'0 auto 20px',display:'inline-flex' }}><span className="xpl-tag-dot" />Platform</div>
              <h2 style={{ fontSize:'clamp(36px,4vw,56px)' }}>Operational Intelligence <span className="xpl-blue">Dashboards</span></h2>
              <p style={{ fontSize:16,color:'#94A3B8',maxWidth:600,margin:'16px auto 0',lineHeight:1.7 }}>One unified platform — four powerful command centers built for the speed and complexity of modern exploration.</p>
            </div>
            <div className="xpl-dash-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
              {[
                { icon:'⚡', iconBg:'rgba(249,115,22,0.15)', iconBorder:'rgba(249,115,22,0.2)', title:'Operations Dashboard', desc:'Track drilling operations in real time with complete visibility into meters drilled, downtime, core recovery, productivity and bit cost per meter.', tags:['LIVE KPIS','ROP TRENDS','PRODUCTIVITY'] },
                { icon:'🔧', iconBg:'rgba(59,130,246,0.15)',  iconBorder:'rgba(59,130,246,0.2)',  title:'Maintenance Dashboard', desc:'Monitor equipment health, maintenance schedules, breakdown trends, servicing records and maintenance performance from a centralized hub.', tags:['MTBF','COST TREND','SCHEDULES'] },
                { icon:'👷', iconBg:'rgba(139,92,246,0.15)', iconBorder:'rgba(139,92,246,0.2)', title:'Driller & Crew Performance', desc:'Evaluate driller and crew performance using productivity tracking, efficiency metrics and shift comparisons to identify top-performing teams.', tags:['CREW SCORE','SHIFT COMPARE','LEADERBOARDS'] },
                { icon:'📦', iconBg:'rgba(16,185,129,0.15)', iconBorder:'rgba(16,185,129,0.2)', title:'Consumables & HSC', desc:'Track consumable usage, drilling accessories, inventory movement and HSC compliance to improve operational control and site safety.', tags:['INVENTORY','BIT LIFE','HSC'] },
              ].map((d,i) => (
                <div key={i} className={`xpl-card xpl-fade xpl-d${i%2===0?'1':'2'}`} style={{ overflow:'hidden',cursor:'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.3)'; (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 20px 60px rgba(0,0,0,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#1E293B'; (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow='' }}
                >
                  <div style={{ padding:28 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:d.iconBg,border:`1px solid ${d.iconBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:16 }}>{d.icon}</div>
                    <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10 }}>
                      <h3 style={{ fontSize:19,fontWeight:700 }}>{d.title}</h3>
                      <span style={{ color:'#64748B',fontSize:18,transition:'all 0.2s' }}>↗</span>
                    </div>
                    <p style={{ fontSize:14,color:'#94A3B8',lineHeight:1.6,marginBottom:16 }}>{d.desc}</p>
                    <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                      {d.tags.map(t => <span key={t} style={{ padding:'4px 10px',borderRadius:6,background:'rgba(255,255,255,0.04)',border:'1px solid #1E293B',fontSize:10,fontWeight:600,color:'#64748B',letterSpacing:'0.08em' }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ height:120,background:'#111827',borderTop:'1px solid #1E293B',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,opacity:0.08 }}>{d.icon}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIGITAL LOGGING ── */}
        <section id="logging" style={{ background:'#0D1117',padding:'100px 60px' }}>
          <div className="xpl-log-grid" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center' }}>
            <div className="xpl-fade" style={{ background:'#111827',border:'1px solid #1E293B',borderRadius:20,overflow:'hidden',position:'relative',aspectRatio:'4/3',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <div style={{ fontSize:80,opacity:0.1 }}>📋</div>
              <div style={{ position:'absolute',bottom:20,left:20,background:'rgba(13,17,23,0.95)',border:'1px solid #1E293B',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,backdropFilter:'blur(20px)' }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:'#10B981',boxShadow:'0 0 8px #10B981',animation:'xplPulse 2s infinite',flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:12,fontWeight:600,color:'#F8FAFC' }}>Synced · just now</div>
                  <div style={{ fontSize:10,color:'#64748B',marginTop:2 }}>247 drill logs uploaded across 8 rigs</div>
                </div>
              </div>
            </div>
            <div className="xpl-fade xpl-d2">
              <div className="xpl-tag"><span className="xpl-tag-dot" />Digital Drill Logging</div>
              <h2 style={{ fontSize:'clamp(32px,3.5vw,50px)',lineHeight:1.1,marginBottom:20 }}>Replace paper. <span className="xpl-orange">Capture truth</span> <span className="xpl-blue">in real time.</span></h2>
              <p style={{ fontSize:16,color:'#94A3B8',lineHeight:1.7,marginBottom:32 }}>Access drill logs and maintenance logs anytime, anywhere through a centralized digital platform. Replace paper-based workflows with faster, more accurate, and real-time operational logging.</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                {[{icon:'☁',title:'Cloud sync',sub:'Auto-upload across all rigs'},{icon:'🛡',title:'Audit trail',sub:'Full change history'},{icon:'📡',title:'Offline-first',sub:'Works without internet'},{icon:'✨',title:'AI auto-fill',sub:'Smart field suggestions'}].map((f,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid #1E293B' }}>
                    <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>{f.icon}</div>
                    <div><div style={{ fontSize:13,fontWeight:600 }}>{f.title}</div><div style={{ fontSize:11,color:'#64748B',marginTop:2 }}>{f.sub}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── AI INSIGHTS ── */}
        <section id="ai" className="xpl-section" style={{ padding:'100px 60px' }}>
          <div className="xpl-ai-grid" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center' }}>
            <div className="xpl-fade">
              <div className="xpl-tag"><span className="xpl-tag-dot" />AI-Powered Insights</div>
              <h2 style={{ fontSize:'clamp(32px,3.5vw,50px)',lineHeight:1.1,marginBottom:20 }}>Intelligence that <span className="xpl-orange">acts</span> before you <span className="xpl-blue">ask.</span></h2>
              <p style={{ fontSize:16,color:'#94A3B8',lineHeight:1.7 }}>Xplorix AI simplifies complex operational analytics — delivering intelligent daily insights and recommendations that help teams take action faster and improve drilling performance proactively.</p>
            </div>
            <div className="xpl-fade xpl-d2" style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {[
                { icon:'🧠', title:'Predictive Performance', desc:'AI models predict ROP decline and equipment issues before they cause downtime.', badge:'▲ 23% downtime reduction', badgeColor:'rgba(16,185,129,0.1)', badgeBorder:'rgba(16,185,129,0.2)', badgeText:'#10B981' },
                { icon:'📈', title:'Daily Operational Insights', desc:'Automated shift reports summarize key metrics, highlight anomalies, and recommend corrective actions.', badge:'⚡ Generated in seconds', badgeColor:'rgba(59,130,246,0.1)', badgeBorder:'rgba(59,130,246,0.2)', badgeText:'#60A5FA' },
                { icon:'🎯', title:'Cost Optimization Engine', desc:'Continuously analyzes cost-per-meter across rigs and formations, surfacing optimization opportunities.', badge:'💰 Avg 18% cost savings', badgeColor:'rgba(249,115,22,0.1)', badgeBorder:'rgba(249,115,22,0.2)', badgeText:'#F97316' },
                { icon:'🚨', title:'Smart Alerts', desc:'Automated alerts for critical thresholds — core recovery drops, unusual downtime, bit performance degradation.', badge:'Real-time monitoring', badgeColor:'rgba(139,92,246,0.1)', badgeBorder:'rgba(139,92,246,0.2)', badgeText:'#8B5CF6' },
              ].map((a,i)=>(
                <div key={i} style={{ background:'#0D1117',border:'1px solid #1E293B',borderRadius:14,padding:18,display:'flex',alignItems:'flex-start',gap:14,transition:'all 0.3s',cursor:'default' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(59,130,246,0.3)';(e.currentTarget as HTMLElement).style.transform='translateX(6px)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1E293B';(e.currentTarget as HTMLElement).style.transform=''}}
                >
                  <div style={{ width:40,height:40,borderRadius:10,flexShrink:0,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:600,marginBottom:5 }}>{a.title}</div>
                    <div style={{ fontSize:13,color:'#94A3B8',lineHeight:1.6,marginBottom:8 }}>{a.desc}</div>
                    <span style={{ display:'inline-flex',alignItems:'center',padding:'3px 8px',borderRadius:6,background:a.badgeColor,border:`1px solid ${a.badgeBorder}`,fontSize:10,fontWeight:600,color:a.badgeText }}>{a.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INDUSTRIES ── */}
        <section id="industries" style={{ background:'#0D1117',padding:'100px 60px' }}>
          <div style={{ maxWidth:1400,margin:'0 auto' }}>
            <div className="xpl-fade" style={{ textAlign:'center',marginBottom:60 }}>
              <h2 style={{ fontSize:'clamp(36px,4vw,58px)' }}>Built for the toughest <span className="xpl-orange">operations on earth.</span></h2>
            </div>
            <div className="xpl-ind-grid" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16 }}>
              {[
                { icon:'⛏', title:'Mining',               desc:'End-to-end visibility for surface & underground mining operations.' },
                { icon:'🔩', title:'Exploration Drilling', desc:'Built first for diamond core & RC operations in remote environments.' },
                { icon:'🏔', title:'Geotechnical Drilling',desc:'Track investigation programs at scale with full data visibility.' },
                { icon:'💥', title:'Blast Hole Drilling',  desc:'Productivity intelligence for high-volume production drilling.' },
              ].map((ind,i)=>(
                <div key={i} className={`xpl-fade xpl-d${i+1}`} style={{ background:'#111827',border:'1px solid #1E293B',borderRadius:20,padding:'32px 24px',transition:'all 0.3s',cursor:'pointer',position:'relative',overflow:'hidden' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.3)';(e.currentTarget as HTMLElement).style.transform='translateY(-6px)';(e.currentTarget as HTMLElement).style.boxShadow='0 20px 60px rgba(0,0,0,0.3)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1E293B';(e.currentTarget as HTMLElement).style.transform='';(e.currentTarget as HTMLElement).style.boxShadow=''}}
                >
                  <div style={{ width:52,height:52,borderRadius:14,marginBottom:20,background:'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(245,158,11,0.05))',border:'1px solid rgba(249,115,22,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>{ind.icon}</div>
                  <h3 style={{ fontSize:17,fontWeight:700,marginBottom:10 }}>{ind.title}</h3>
                  <p style={{ fontSize:13,color:'#94A3B8',lineHeight:1.6,marginBottom:20 }}>{ind.desc}</p>
                  <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:10,color:'#64748B',fontWeight:600,letterSpacing:'0.08em' }}>
                    <div style={{ width:20,height:2,background:'linear-gradient(90deg,#F97316,#3B82F6)',borderRadius:1 }} />
                    LIVE DEPLOYMENTS
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta" className="xpl-section" style={{ padding:'100px 60px',background:'linear-gradient(135deg,rgba(249,115,22,0.03) 0%,transparent 50%,rgba(59,130,246,0.03) 100%)',borderTop:'1px solid #1E293B' }}>
          <div className="xpl-cta-grid" style={{ maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:80,alignItems:'start' }}>
            <div className="xpl-fade">
              <div className="xpl-tag"><span className="xpl-tag-dot" />Get Started</div>
              <h2 style={{ fontSize:'clamp(32px,3.5vw,48px)',lineHeight:1.1,marginBottom:20 }}>Transform your drilling operations with <span className="xpl-orange">AI.</span></h2>
              <p style={{ fontSize:15,color:'#94A3B8',lineHeight:1.7,marginBottom:32 }}>Book a personalised walkthrough of the Xplorix platform. We'll show you how teams cut downtime, boost productivity and digitise drill logs in under 30 days.</p>
              {[{icon:'🌍',title:'Deployed across 30+ countries',sub:'Global infrastructure, local support'},{icon:'🛡',title:'Enterprise-grade security & SSO',sub:'SOC 2 compliant, end-to-end encrypted'},{icon:'✨',title:'AI insights from day one',sub:'No training required — insights start immediately'}].map((pt,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:16,marginBottom:16 }}>
                  <div style={{ width:44,height:44,borderRadius:12,flexShrink:0,background:'rgba(255,255,255,0.04)',border:'1px solid #1E293B',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{pt.icon}</div>
                  <div><div style={{ fontSize:15,fontWeight:600 }}>{pt.title}</div><div style={{ fontSize:13,color:'#64748B',marginTop:2 }}>{pt.sub}</div></div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="xpl-fade xpl-d2" style={{ background:'#0D1117',border:'1px solid #1E293B',borderRadius:24,padding:36 }}>
              <div className="xpl-form-row" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:0 }}>
                {[{label:'Name',ph:'Jane Doe',type:'text'},{label:'Company',ph:'Acme Drilling Co.',type:'text'}].map((f,i)=>(
                  <div key={i} style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                    <label style={{ fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#64748B',textTransform:'uppercase' }}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} style={{ padding:'13px 16px',borderRadius:12,border:'1px solid #1E293B',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:14,outline:'none',transition:'all 0.2s' }}
                      onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.4)';e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.08)'}}
                      onBlur={e=>{e.target.style.borderColor='#1E293B';e.target.style.boxShadow=''}}
                    />
                  </div>
                ))}
              </div>
              <div className="xpl-form-row" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                {[{label:'Email',ph:'jane@acme.com',type:'email'},{label:'Phone',ph:'+1 555 000 1234',type:'tel'}].map((f,i)=>(
                  <div key={i} style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                    <label style={{ fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#64748B',textTransform:'uppercase' }}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} style={{ padding:'13px 16px',borderRadius:12,border:'1px solid #1E293B',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:14,outline:'none',transition:'all 0.2s' }}
                      onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.4)';e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.08)'}}
                      onBlur={e=>{e.target.style.borderColor='#1E293B';e.target.style.boxShadow=''}}
                    />
                  </div>
                ))}
              </div>
              <div className="xpl-form-row" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                {[{label:'Country',opts:['Australia','United States','India','Canada','Saudi Arabia','United Kingdom','South Africa','Other']},{label:'Role',opts:['Operations Manager','Drilling Supervisor','Project Manager','CEO / Director','Other']}].map((f,i)=>(
                  <div key={i} style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                    <label style={{ fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#64748B',textTransform:'uppercase' }}>{f.label}</label>
                    <select style={{ padding:'13px 16px',borderRadius:12,border:'1px solid #1E293B',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:14,outline:'none',cursor:'pointer',transition:'all 0.2s',appearance:'none' }}>
                      {f.opts.map(o=><option key={o} style={{ background:'#0D1117' }}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:20 }}>
                <label style={{ fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#64748B',textTransform:'uppercase' }}>Message</label>
                <textarea placeholder="Tell us about your fleet and goals..." rows={4} style={{ padding:'13px 16px',borderRadius:12,border:'1px solid #1E293B',background:'rgba(255,255,255,0.03)',color:'#F8FAFC',fontFamily:'inherit',fontSize:14,outline:'none',resize:'vertical',transition:'all 0.2s' }}
                  onFocus={e=>{e.target.style.borderColor='rgba(249,115,22,0.4)';e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.08)'}}
                  onBlur={e=>{e.target.style.borderColor='#1E293B';e.target.style.boxShadow=''}}
                />
              </div>
              <div style={{ display:'flex',gap:12 }}>
                <button className="xpl-btn-secondary" style={{ flex:1,justifyContent:'center' }}>Contact Sales</button>
                <button className="xpl-btn-primary" style={{ flex:1,justifyContent:'center' }}>Schedule Demo →</button>
              </div>
              <p style={{ fontSize:11,color:'#64748B',textAlign:'center',marginTop:16 }}>By submitting, you agree to our terms & privacy policy.</p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background:'#0D1117',borderTop:'1px solid #1E293B',padding:'50px 60px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:20 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#F97316,#F59E0B)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,color:'#000' }}>X</div>
            <div>
              <div style={{ fontSize:15,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif" }}>XPLORIX</div>
              <div style={{ fontSize:9,color:'#64748B',letterSpacing:'0.15em',textTransform:'uppercase',marginTop:1 }}>Drilling Intelligence</div>
            </div>
          </div>
          <p style={{ fontSize:13,color:'#64748B' }}>© 2026 Xplorix. All rights reserved. Built for the world&apos;s toughest operations.</p>
          <div style={{ display:'flex',gap:24 }}>
            {['Privacy','Terms','Contact'].map(l=>(
              <a key={l} href="#" style={{ fontSize:13,color:'#64748B',textDecoration:'none',transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F8FAFC')}
                onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}
              >{l}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}

