'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  BarChart3, 
  Brain, 
  Shield, 
  Zap,
  Activity,
  Globe,
  ChevronRight
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Predictive analytics and anomaly detection across all operations',
    color: 'from-purple-500 to-blue-500'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: '5 comprehensive dashboards with live data visualization',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Role-based access control with advanced data protection',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description: 'Automated billing, alerts, and resource optimization',
    color: 'from-amber-500 to-orange-500'
  }
]

const stats = [
  { value: '50+', label: 'Enterprise Clients' },
  { value: '1M+', label: 'Meters Drilled' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'AI Monitoring' }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0066FF]/20 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00D4AA]/20 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7B61FF]/10 rounded-full blur-[200px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              XPLORIX
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition">Features</a>
            <a href="#analytics" className="text-slate-400 hover:text-white transition">Analytics</a>
            <a href="#enterprise" className="text-slate-400 hover:text-white transition">Enterprise</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-slate-400 hover:text-white transition font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register"
              className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white font-semibold rounded-xl
                         shadow-[0_4px_20px_rgba(0,102,255,0.4)] hover:shadow-[0_8px_30px_rgba(0,102,255,0.6)]
                         transition-all duration-300 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              <span className="text-sm text-slate-300">Now with AI-Powered Predictions</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Drilling Intelligence</span>
              <br />
              <span className="bg-gradient-to-r from-[#0066FF] via-[#00D4AA] to-[#7B61FF] bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              XPLORIX is the premium AI-powered platform for drilling operations management. 
              Predict downtime, optimize resources, and make data-driven decisions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white font-semibold rounded-xl
                           shadow-[0_8px_32px_rgba(0,102,255,0.4)] hover:shadow-[0_16px_48px_rgba(0,102,255,0.6)]
                           transition-all duration-300 flex items-center gap-3 text-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link 
                href="/auth/login"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl
                           hover:bg-white/10 transition-all duration-300 flex items-center gap-3 text-lg"
              >
                <Globe className="w-5 h-5" />
                View Demo
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to
              <span className="text-gradient"> Drill Smarter</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From project management to AI-powered analytics, XPLORIX provides 
              the complete toolkit for modern drilling operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50 
                           hover:border-[#0066FF]/30 hover:bg-[#111827]/80
                           transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} 
                                flex items-center justify-center mb-6
                                group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Preview */}
      <section id="analytics" className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Analytics at Your
              <span className="text-gradient"> Fingertips</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              5 comprehensive dashboards delivering real-time insights across operations, 
              maintenance, consumables, crew performance, and safety.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Operations Dashboard', desc: 'Real-time drilling metrics and performance tracking', icon: BarChart3 },
              { title: 'Maintenance Analytics', desc: 'Predictive maintenance and equipment health monitoring', icon: Zap },
              { title: 'Crew Performance', desc: 'Driller efficiency and team productivity insights', icon: Brain },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#0F1520] border border-[#1E293B] hover:border-[#0066FF]/50 transition-all"
              >
                <item.icon className="w-10 h-10 text-[#0066FF] mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-[#0066FF]/20 to-[#00D4AA]/20 
                          border border-[#0066FF]/30 backdrop-blur-sm text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join leading drilling companies using XPLORIX to optimize performance, 
              reduce downtime, and maximize ROI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register"
                className="px-8 py-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white font-semibold rounded-xl
                           shadow-[0_8px_32px_rgba(0,102,255,0.4)] hover:shadow-[0_16px_48px_rgba(0,102,255,0.6)]
                           transition-all duration-300 flex items-center gap-3"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/auth/login"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl
                           hover:bg-white/20 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-[#1E293B]/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">XPLORIX</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 XPLORIX. All rights reserved. Premium drilling intelligence platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
