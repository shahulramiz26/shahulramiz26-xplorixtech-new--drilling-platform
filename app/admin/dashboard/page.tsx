'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, FolderOpen, Truck, CreditCard, TrendingUp, Clock,
  AlertCircle, BarChart3, Wrench, Droplets, ShieldAlert, Activity,
  MapPin, CheckCircle2, ArrowUpRight, ArrowDownRight, Zap, Brain
} from 'lucide-react'
import { calculateTrialDays, formatDate } from '@/lib/utils'

const mockCompany = {
  name: "Apex Drilling Solutions",
  industryType: "Exploration",
  trialEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  subscriptionStatus: "TRIAL",
  dailyRate: 10
}

const overallStats = [
  { label:'Total Projects', value:'3', subtext:'2 Active, 1 On Hold',    icon:FolderOpen, iconBg:'#1E3A5F', iconColor:'#60A5FA', trend:'+1',   href:'/admin/projects' },
  { label:'Total Rigs',     value:'5', subtext:'3 Active, 2 Inactive',   icon:Truck,      iconBg:'#14532D', iconColor:'#34D399', trend:'+2',   href:'/admin/rigs'     },
  { label:'Total Users',    value:'6', subtext:'1 Admin + 5 Operational',icon:Users,      iconBg:'#3B1F6E', iconColor:'#A78BFA', trend:'+3',   href:'/admin/users'    },
  { label:'Monthly Bill',   value:'$830', subtext:'83 active rig-days',  icon:CreditCard, iconBg:'#4A2005', iconColor:'#FB923C', trend:'+12%', href:'/admin/billing'  },
]

const productionKPIs = [
  { label:'Total Meters',   value:'8,450', unit:'m',    icon:TrendingUp, color:'#60A5FA', trend:'+12%', trendUp:true  },
  { label:'Drilling Hours', value:'1,240', unit:'hrs',  icon:Clock,      color:'#34D399', trend:'+8%',  trendUp:true  },
  { label:'Downtime',       value:'186',   unit:'hrs',  icon:AlertCircle,color:'#F87171', trend:'-5%',  trendUp:false },
  { label:'Avg ROP',        value:'6.8',   unit:'m/hr', icon:Activity,   color:'#A78BFA', trend:'+15%', trendUp:true  },
  { label:'Active Projects',value:'3',     unit:'',     icon:FolderOpen, color:'#22D3EE', trend:'',     trendUp:true  },
  { label:'Active Rigs',    value:'3',     unit:'',     icon:Truck,      color:'#FBB040', trend:'',     trendUp:true  },
]

const workforceKPIs = [
  { label:'Total Drillers',   value:'12',  icon:Users,  color:'#60A5FA', subtext:'Across all projects' },
  { label:'Total Supervisors',value:'4',   icon:Users,  color:'#34D399', subtext:'Across all projects' },
  { label:'Shifts Logged',    value:'156', icon:Clock,  color:'#A78BFA', subtext:'This month'          },
]

const maintenanceKPIs = [
  { label:'Maint. Logs',    value:'28',  unit:'',    icon:Wrench,      color:'#FBB040', subtext:'This month'        },
  { label:'Maint. Hours',   value:'84',  unit:'hrs', icon:Clock,       color:'#F87171', subtext:'Total downtime'    },
  { label:'Pending Service',value:'5',   unit:'',    icon:AlertCircle, color:'#FB923C', subtext:'Rigs need attention'},
]

const consumablesKPIs = [
  { label:'Fuel Used',  value:'6,150',  unit:'L',  icon:Droplets, color:'#F87171', trend:'+10%' },
  { label:'Water Used', value:'18,900', unit:'L',  icon:Droplets, color:'#60A5FA', trend:'+5%'  },
  { label:'Additives',  value:'1,140',  unit:'kg', icon:Droplets, color:'#FBB040', trend:'+8%'  },
]

const safetyKPIs = [
  { label:'Days Safe',      value:'5',   icon:CheckCircle2, color:'#34D399', subtext:'Current streak'    },
  { label:'Incidents',      value:'12',  icon:ShieldAlert,  color:'#F87171', subtext:'Last 30 days'      },
  { label:'PPE Compliance', value:'98%', icon:CheckCircle2, color:'#60A5FA', subtext:'Across all sites'  },
]

const projectBreakdown = [
  { name:'Gold Mine Project A',    meters:3240, rigs:2, status:'ACTIVE',   completion:'68%', barColor:'#F97316' },
  { name:'Copper Exploration Site',meters:2890, rigs:2, status:'ACTIVE',   completion:'45%', barColor:'#3B82F6' },
  { name:'Iron Ore Site B',        meters:1320, rigs:1, status:'ON_HOLD',  completion:'32%', barColor:'#F59E0B' },
]

const recentActivity = [
  { action:'New drilling log submitted', project:'Gold Mine Project A',  time:'2 hours ago', user:'John Smith',   type:'drilling'     },
  { action:'RIG-003 activated',          project:'Copper Exploration',   time:'5 hours ago', user:'Admin',        type:'rig'          },
  { action:'Maintenance log added',      project:'Gold Mine Project A',  time:'1 day ago',   user:'Mike Johnson', type:'maintenance'  },
  { action:'New project created',        project:'Iron Ore Site B',      time:'2 days ago',  user:'Admin',        type:'project'      },
]

const activityDot: Record<string,string> = {
  drilling:'#F97316', rig:'#10B981', maintenance:'#F59E0B', project:'#8B5CF6'
}

const containerVariants = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ staggerChildren:0.08 }}}
const itemVariants = { hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0 }}

export default function AdminDashboard() {
  const trialDays = calculateTrialDays(mockCompany.trialEndDate)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-8">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Dashboard</h1>
          <p className="text-[#64748B] mt-1">Welcome back, {mockCompany.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#64748B]">Last updated: Just now</span>
          <button className="p-2 rounded-lg transition" style={{ background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.15)' }}>
            <Zap className="w-5 h-5" style={{ color:'#F97316' }} />
          </button>
        </div>
      </motion.div>

      {/* Trial Banner */}
      {trialDays > 0 && (
        <motion.div variants={itemVariants}
          style={{ padding:20, borderRadius:16, background:'linear-gradient(135deg,rgba(249,115,22,0.08),rgba(13,17,23,0.95))', border:'1px solid rgba(249,115,22,0.2)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#F97316,#F59E0B)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 32px rgba(249,115,22,0.3)', flexShrink:0 }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#F8FAFC]">Free Trial: {trialDays} days remaining</p>
                <p className="text-sm text-[#64748B]">All features unlocked until {formatDate(mockCompany.trialEndDate)}</p>
              </div>
            </div>
            <Link href="/admin/billing"
              style={{ padding:'10px 24px', background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontWeight:700, borderRadius:12, boxShadow:'0 4px 20px rgba(249,115,22,0.3)', textDecoration:'none', whiteSpace:'nowrap', transition:'all 0.2s', display:'inline-block' }}>
              Upgrade Now
            </Link>
          </div>
        </motion.div>
      )}

      {/* Overall Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overallStats.map((stat, i) => (
          <Link key={i} href={stat.href} style={{ textDecoration:'none' }}>
            <div style={{ padding:20, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B', transition:'all 0.25s', cursor:'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.3)'; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#1E293B'; (e.currentTarget as HTMLElement).style.transform='translateY(0)' }}>
              <div className="flex items-start justify-between mb-4">
                <div style={{ width:48, height:48, borderRadius:12, background:stat.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <stat.icon style={{ width:24, height:24, color:stat.iconColor }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color:'#10B981' }}>
                  {stat.trend} <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#F8FAFC] mb-1">{stat.value}</p>
              <p className="text-sm text-[#94A3B8]">{stat.label}</p>
              <p className="text-xs text-[#64748B] mt-1">{stat.subtext}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Production Snapshot */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <div style={{ width:32, height:32, borderRadius:8, background:'rgba(249,115,22,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <TrendingUp style={{ width:16, height:16, color:'#F97316' }} />
            </div>
            Production Snapshot
          </h2>
          <Link href="/admin/analytics/operation"
            className="text-sm flex items-center gap-1 transition"
            style={{ color:'#F97316', textDecoration:'none' }}>
            View Analytics <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {productionKPIs.map((kpi, i) => (
            <div key={i} style={{ padding:16, borderRadius:14, background:'#0D1117', border:'1px solid #1E293B' }}>
              <div style={{ width:36, height:36, borderRadius:9, background:`${kpi.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <kpi.icon style={{ width:18, height:18, color:kpi.color }} />
              </div>
              <p className="text-2xl font-bold text-[#F8FAFC]">
                {kpi.value}<span className="text-sm font-normal text-[#64748B] ml-1">{kpi.unit}</span>
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">{kpi.label}</p>
              {kpi.trend && (
                <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: kpi.trendUp ? '#10B981' : '#EF4444' }}>
                  {kpi.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Workforce & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} style={{ padding:24, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(167,139,250,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Users style={{ width:15, height:15, color:'#A78BFA' }} />
              </div>
              Workforce
            </h2>
            <Link href="/admin/analytics/driller-crew" style={{ fontSize:12, color:'#F97316', textDecoration:'none' }}>Details →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {workforceKPIs.map((kpi, i) => (
              <div key={i} style={{ textAlign:'center', padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:`${kpi.color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                  <kpi.icon style={{ width:20, height:20, color:kpi.color }} />
                </div>
                <p className="text-xl font-bold text-[#F8FAFC]">{kpi.value}</p>
                <p className="text-xs text-[#64748B] mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ padding:24, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(251,176,64,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Wrench style={{ width:15, height:15, color:'#FBB040' }} />
              </div>
              Maintenance
            </h2>
            <Link href="/admin/analytics/maintenance" style={{ fontSize:12, color:'#F97316', textDecoration:'none' }}>Details →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {maintenanceKPIs.map((kpi, i) => (
              <div key={i} style={{ textAlign:'center', padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:`${kpi.color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                  <kpi.icon style={{ width:20, height:20, color:kpi.color }} />
                </div>
                <p className="text-xl font-bold text-[#F8FAFC]">{kpi.value}{kpi.unit && <span className="text-sm">{kpi.unit}</span>}</p>
                <p className="text-xs text-[#64748B] mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Consumables & Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} style={{ padding:24, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(34,211,238,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Droplets style={{ width:15, height:15, color:'#22D3EE' }} />
              </div>
              Consumables
            </h2>
            <Link href="/admin/analytics/consumables" style={{ fontSize:12, color:'#F97316', textDecoration:'none' }}>Details →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {consumablesKPIs.map((kpi, i) => (
              <div key={i} style={{ textAlign:'center', padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:`${kpi.color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                  <kpi.icon style={{ width:20, height:20, color:kpi.color }} />
                </div>
                <p className="text-lg font-bold text-[#F8FAFC]">{kpi.value}<span className="text-xs">{kpi.unit}</span></p>
                <p className="text-xs text-[#64748B] mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ padding:24, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(52,211,153,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ShieldAlert style={{ width:15, height:15, color:'#34D399' }} />
              </div>
              Safety & Compliance
            </h2>
            <Link href="/admin/analytics/hsc" style={{ fontSize:12, color:'#F97316', textDecoration:'none' }}>Details →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {safetyKPIs.map((kpi, i) => (
              <div key={i} style={{ textAlign:'center', padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:`${kpi.color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                  <kpi.icon style={{ width:20, height:20, color:kpi.color }} />
                </div>
                <p className="text-xl font-bold text-[#F8FAFC]">{kpi.value}</p>
                <p className="text-xs text-[#64748B] mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Project Breakdown */}
      <motion.div variants={itemVariants} style={{ padding:24, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
            <div style={{ width:30, height:30, borderRadius:8, background:'rgba(249,115,22,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <MapPin style={{ width:15, height:15, color:'#F97316' }} />
            </div>
            Project Breakdown
          </h2>
          <Link href="/admin/projects" style={{ fontSize:13, color:'#F97316', textDecoration:'none' }}>Manage All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #1E293B' }}>
                {['Project','Status','Meters','Rigs','Progress'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign: h==='Meters'||h==='Rigs'||h==='Progress' ? 'right' : 'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectBreakdown.map((project, i) => (
                <tr key={i} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'14px 12px', fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{project.name}</td>
                  <td style={{ padding:'14px 12px' }}>
                    <span style={{
                      display:'inline-flex', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                      background: project.status==='ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: project.status==='ACTIVE' ? '#10B981' : '#F59E0B',
                      border: `1px solid ${project.status==='ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>{project.status}</span>
                  </td>
                  <td style={{ padding:'14px 12px', textAlign:'right', fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{project.meters.toLocaleString()} m</td>
                  <td style={{ padding:'14px 12px', textAlign:'right', fontSize:13, color:'#94A3B8' }}>{project.rigs}</td>
                  <td style={{ padding:'14px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10 }}>
                      <div style={{ width:80, background:'#1E293B', borderRadius:4, height:6, overflow:'hidden' }}>
                        <div style={{ width:project.completion, height:'100%', background:project.barColor, borderRadius:4, transition:'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize:11, color:'#64748B', minWidth:28 }}>{project.completion}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon:Users,     label:'Add User',       desc:'Create operational login', href:'/admin/users',     iconBg:'rgba(59,130,246,0.1)',  iconColor:'#60A5FA' },
          { icon:FolderOpen,label:'New Project',     desc:'Set up drilling project',  href:'/admin/projects',  iconBg:'rgba(16,185,129,0.1)',  iconColor:'#34D399' },
          { icon:Truck,     label:'Activate Rig',   desc:'Enable billing for rig',   href:'/admin/rigs',      iconBg:'rgba(245,158,11,0.1)',  iconColor:'#FBB040' },
          { icon:BarChart3, label:'View Analytics', desc:'Detailed reports',          href:'/admin/analytics', iconBg:'rgba(249,115,22,0.1)',  iconColor:'#F97316' },
        ].map((action, i) => (
          <Link key={i} href={action.href} style={{ textDecoration:'none' }}>
            <div style={{ padding:20, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B', transition:'all 0.25s', cursor:'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.25)'; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#1E293B'; (e.currentTarget as HTMLElement).style.transform='translateY(0)' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:action.iconBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, transition:'transform 0.2s' }}>
                <action.icon style={{ width:22, height:22, color:action.iconColor }} />
              </div>
              <p style={{ fontWeight:600, color:'#F8FAFC', marginBottom:4, fontSize:14 }}>{action.label}</p>
              <p style={{ fontSize:12, color:'#64748B' }}>{action.desc}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} style={{ padding:24, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B' }}>
        <h2 className="text-base font-semibold text-[#F8FAFC] mb-5 flex items-center gap-2">
          <div style={{ width:30, height:30, borderRadius:8, background:'rgba(236,72,153,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Brain style={{ width:15, height:15, color:'#EC4899' }} />
          </div>
          Recent Activity
        </h2>
        <div className="space-y-1">
          {recentActivity.map((activity, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: i < recentActivity.length-1 ? '1px solid rgba(30,41,59,0.5)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:activityDot[activity.type], flexShrink:0, boxShadow:`0 0 6px ${activityDot[activity.type]}` }} />
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{activity.action}</p>
                  <p style={{ fontSize:11, color:'#64748B', marginTop:2 }}>{activity.project} · {activity.user}</p>
                </div>
              </div>
              <span style={{ fontSize:11, color:'#64748B', flexShrink:0, marginLeft:12 }}>{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  )
}

