'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email:'', password:'', role:'' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    if (formData.role === 'admin') {
      window.location.href = '/admin/dashboard'
    } else {
      window.location.href = '/supervisor/dashboard'
    }
  }

  const inputBase: React.CSSProperties = {
    width:'100%', padding:'12px 14px',
    background:'rgba(255,255,255,0.03)',
    border:'1px solid #1E293B', borderRadius:10,
    color:'#F8FAFC', fontSize:13, outline:'none',
    fontFamily:'inherit', transition:'all 0.2s',
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(249,115,22,0.5)'
    e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.08)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => {
    e.target.style.borderColor = '#1E293B'
    e.target.style.boxShadow = ''
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080B10', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Inter',sans-serif", position:'relative', overflow:'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes xplPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}
        @keyframes xplSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        input::placeholder{color:#334155!important;}
      `}</style>

      {/* BG Effects */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:700, height:700, background:'radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 65%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:'-15%', right:'5%', width:400, height:400, background:'radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 65%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(30,41,59,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(30,41,59,0.1) 1px,transparent 1px)', backgroundSize:'60px 60px', WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)' }}/>
      </div>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
        style={{ width:'100%', maxWidth:420, position:'relative', zIndex:10 }}>

        {/* Logo + Title */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:16, padding:'10px 20px', background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B', borderRadius:14 }}>
            <XLogo size={38}/>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:18, fontWeight:900, color:'#F8FAFC', letterSpacing:'0.06em', fontFamily:"'Space Grotesk',sans-serif" }}>XPLORIX</div>
              <div style={{ fontSize:8, color:'#64748B', letterSpacing:'0.18em', textTransform:'uppercase' }}>Drilling Intelligence</div>
            </div>
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif", marginBottom:6, lineHeight:1.1 }}>Welcome Back</h1>
          <p style={{ fontSize:13, color:'#64748B' }}>Sign in to your drilling platform</p>
        </div>

        {/* Card */}
        <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>

          {/* Trial badge */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'8px 0', background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:10, marginBottom:22 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#F97316', display:'inline-block', animation:'xplPulse 1.5s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:600, color:'#F97316' }}>15-day free trial · All features unlocked</span>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Email</label>
              <input type="email" required placeholder="Enter your email"
                value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}
                style={inputBase} onFocus={onFocus} onBlur={onBlur}/>
            </div>

            {/* Password */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPassword?'text':'password'} required placeholder="Enter your password"
                  value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})}
                  style={{ ...inputBase, paddingRight:42 }} onFocus={onFocus} onBlur={onBlur}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#64748B', display:'flex', alignItems:'center', padding:0 }}>
                  {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Role */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Login As</label>
              <select value={formData.role} onChange={e=>setFormData({...formData,role:e.target.value})}
                style={{ ...inputBase, cursor:'pointer', appearance:'none' as const, color:formData.role?'#F8FAFC':'#64748B' }}
                onFocus={onFocus} onBlur={onBlur}>
                <option value="" style={{ background:'#0D1117' }}>Select Role</option>
                <option value="admin" style={{ background:'#0D1117' }}>Company Admin</option>
                <option value="supervisor" style={{ background:'#0D1117' }}>Supervisor</option>
              </select>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <label style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#94A3B8', cursor:'pointer' }}>
                <input type="checkbox" style={{ width:13, height:13, accentColor:'#F97316' }}/>
                Remember me
              </label>
              <Link href="/auth/forgot-password"
                style={{ fontSize:12, color:'#F97316', textDecoration:'none', fontWeight:600 }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'13px', borderRadius:11, border:'none', cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700, color:'#fff', background:loading?'#334155':'linear-gradient(135deg,#F97316,#EA580C)', boxShadow:loading?'none':'0 4px 24px rgba(249,115,22,0.35)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading
                ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'xplSpin 0.7s linear infinite' }}/> Signing in...</>
                : 'Sign In →'
              }
            </button>
          </form>

          <div style={{ height:1, background:'linear-gradient(90deg,transparent,#1E293B,transparent)', margin:'20px 0' }}/>

          <p style={{ textAlign:'center', fontSize:13, color:'#64748B' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color:'#F97316', fontWeight:700, textDecoration:'none' }}>
              Start free trial
            </Link>
          </p>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'#1E293B', marginTop:20 }}>
          © 2026 XPLORIX · Built by drillers, for drillers.
        </p>
      </motion.div>
    </div>
  )
}

