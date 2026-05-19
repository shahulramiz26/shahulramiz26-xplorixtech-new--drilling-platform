'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function XLogo({ size = 32 }: { size?: number }) {
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

const legalLinks = [
  { label: 'Privacy Policy',   href: '/privacy-policy'   },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Cookie Policy',    href: '/cookie-policy'    },
  { label: 'Refund Policy',    href: '/refund-policy'    },
]

export default function LegalLayout({ children, title, lastUpdated }: {
  children: React.ReactNode
  title: string
  lastUpdated: string
}) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const P = 'max(20px, calc(50vw - 580px))'

  return (
    <div style={{ fontFamily:"'Space Grotesk',sans-serif", background:'#080B10', color:'#F8FAFC', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#080B10;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#F97316,#3B82F6);border-radius:2px;}
        @keyframes xplPulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:900, padding:`14px ${P}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:scrolled?'rgba(8,11,16,0.97)':'rgba(8,11,16,0.8)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)', transition:'all 0.3s' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <XLogo size={32}/>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#F8FAFC', letterSpacing:'0.06em' }}>XPLORIX</div>
            <div style={{ fontSize:7, color:'#64748B', letterSpacing:'0.18em', textTransform:'uppercase' }}>Drilling Intelligence</div>
          </div>
        </Link>
        <Link href="/" style={{ fontSize:13, color:'#94A3B8', textDecoration:'none', padding:'7px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)' }}>
          ← Back to Home
        </Link>
      </nav>

      {/* HERO */}
      <div style={{ padding:`120px ${P} 40px`, background:'radial-gradient(ellipse 60% 50% at 50% -10%,rgba(249,115,22,0.07) 0%,transparent 60%),#080B10', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', borderRadius:100, border:'1px solid rgba(249,115,22,0.25)', background:'rgba(249,115,22,0.05)', fontSize:10, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:14 }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:'#F97316', display:'inline-block', animation:'xplPulse 1.5s infinite' }}/>Legal Document
        </div>
        <h1 style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, marginBottom:10, letterSpacing:'-0.02em' }}>{title}</h1>
        <p style={{ fontSize:13, color:'#64748B' }}>ANMAK CONSULTANCY SERVICES PRIVATE LIMITED · Last updated: {lastUpdated}</p>
        {/* Legal nav pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:20 }}>
          {legalLinks.map(l=>(
            <Link key={l.href} href={l.href} style={{ padding:'5px 14px', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#94A3B8', fontSize:12, fontWeight:500, textDecoration:'none' }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding:`48px ${P} 80px` }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>
          {children}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:`20px ${P}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, background:'#0D1117' }}>
        <p style={{ fontSize:12, color:'#64748B' }}>© 2026 ANMAK CONSULTANCY SERVICES PRIVATE LIMITED. All rights reserved.</p>
        <div style={{ display:'flex', gap:16 }}>
          {legalLinks.map(l=>(
            <Link key={l.href} href={l.href} style={{ fontSize:11, color:'#64748B', textDecoration:'none' }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}

