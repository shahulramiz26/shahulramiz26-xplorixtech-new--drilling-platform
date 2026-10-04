'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, Line, ReferenceLine
} from 'recharts'
import { ShieldAlert, CheckCircle2, AlertTriangle, TrendingUp, Filter, Clock, Users } from 'lucide-react'
import AIInsights from '../../../components/AIInsights'
import { hexA } from '../../../../lib/theme'

// ── KPI CARD ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, icon: Icon, color, badge }: {
  label: string; value: string; unit?: string; icon: any
  color: string; badge?: string
}) {
  return (
    <div style={{ padding:20, borderRadius:16, background:'var(--x-card)', border:'1px solid var(--x-border)', transition:'border-color 0.2s' }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=`${hexA(color, 0x40)}`}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${hexA(color, 0x18)}`, border:`1px solid ${hexA(color, 0x30)}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon style={{ width:18, height:18, color }} />
        </div>
        {badge && <span style={{ fontSize:11, color:'var(--x-faint)' }}>{badge}</span>}
      </div>
      <div style={{ fontSize:28, fontWeight:800, color:'var(--x-text)', fontFamily:"'Space Grotesk',sans-serif" }}>
        {value}{unit && <span style={{ fontSize:13, fontWeight:400, color:'var(--x-faint)', marginLeft:4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize:13, color:'var(--x-muted)', marginTop:4 }}>{label}</div>
    </div>
  )
}

const tooltipStyle = {
  contentStyle: { background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:12, color:'var(--x-text)' },
  labelStyle: { color:'var(--x-muted)' },
}

const cardStyle = { background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:16, padding:24 }
const titleStyle = { fontSize:15, fontWeight:700, color:'var(--x-text)', marginBottom:20 }

// ── DATA ───────────────────────────────────────────────────────────────────
const incidentSummary = [
  { type:'Minor',    count:8, cost:2400,  days:16  },
  { type:'Major',    count:3, cost:15000, days:45  },
  { type:'Critical', count:1, cost:50000, days:120 },
]

const incidentTrend = [
  { date:'Feb 20', injury:1, equipment:0, safety:1, total:2 },
  { date:'Feb 21', injury:0, equipment:1, safety:0, total:1 },
  { date:'Feb 22', injury:0, equipment:0, safety:1, total:1 },
  { date:'Feb 23', injury:1, equipment:1, safety:0, total:2 },
  { date:'Feb 24', injury:0, equipment:0, safety:1, total:1 },
  { date:'Feb 25', injury:0, equipment:1, safety:1, total:2 },
  { date:'Feb 26', injury:1, equipment:0, safety:0, total:1 },
]

const severityTrend = [
  { date:'Feb 20', minor:2, major:0, critical:0 },
  { date:'Feb 21', minor:1, major:1, critical:0 },
  { date:'Feb 22', minor:1, major:0, critical:0 },
  { date:'Feb 23', minor:1, major:1, critical:0 },
  { date:'Feb 24', minor:1, major:0, critical:1 },
  { date:'Feb 25', minor:1, major:1, critical:0 },
  { date:'Feb 26', minor:1, major:0, critical:0 },
]

const ppeCompliance = [
  { item:'Hard Hat',           compliance:98, target:100 },
  { item:'Safety Glasses',     compliance:96, target:100 },
  { item:'Safety Boots',       compliance:99, target:100 },
  { item:'Gloves',             compliance:94, target:100 },
  { item:'High-Vis Vest',      compliance:97, target:100 },
  { item:'Hearing Protection', compliance:92, target:100 },
]

const safetyTraining = [
  { topic:'Hazard Awareness',  completed:24, total:24, score:94 },
  { topic:'Emergency Response',completed:22, total:24, score:88 },
  { topic:'PPE Usage',         completed:24, total:24, score:98 },
  { topic:'Equipment Safety',  completed:20, total:24, score:85 },
  { topic:'First Aid',         completed:18, total:24, score:90 },
]

const nearMissData = [
  { date:'Week 1', count:3, resolved:3 },
  { date:'Week 2', count:5, resolved:4 },
  { date:'Week 3', count:2, resolved:2 },
  { date:'Week 4', count:4, resolved:3 },
]

const safetyMetrics = [
  { label:'Lost Time Injury Rate', value:'0.0', unit:'LTIF',       status:'good'    },
  { label:'Total Recordable',      value:'2.1', unit:'TRIF',       status:'good'    },
  { label:'Severity Rate',         value:'12.5',unit:'SR',         status:'warning' },
  { label:'Reported Hazards',      value:'47',  unit:'this month', status:'good'    },
]

const hscInsights = [
  { id:'1', type:'anomaly' as const,       severity:'critical' as const, title:'Critical Incident Spike',     description:'1 critical incident this week',             metric:'Critical Incidents', change:'1 this week',          recommendation:'Conduct immediate safety stand-down meeting'     },
  { id:'2', type:'prediction' as const,    severity:'warning' as const,  title:'Injury Risk Forecast',        description:'Elevated injury risk next week predicted',  metric:'Injury Risk',        change:'High risk predicted',  recommendation:'Increase safety inspections and PPE checks'      },
  { id:'3', type:'trend' as const,         severity:'info' as const,     title:'Safety Improvement',          description:'Minor incidents decreased 25% over last month', metric:'Minor Incidents', change:'-25% trend',          recommendation:'Continue current safety training program'        },
  { id:'4', type:'recommendation' as const,severity:'warning' as const,  title:'Equipment Damage Pattern',    description:'Equipment damage concentrated in night shift', metric:'Equipment Damage', change:'70% at night',         recommendation:'Review night shift equipment handling procedures' },
]

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function AdminHSCDashboard() {
  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="hsc" insights={hscInsights} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[color:var(--x-text)]">HSC Dashboard</h2>
          <p style={{ color:'var(--x-faint)', marginTop:4 }}>Health, Safety & Compliance metrics</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:10 }}>
          <Filter style={{ width:14, height:14, color:'var(--x-faint)' }} />
          <select style={{ background:'transparent', color:'var(--x-text)', fontSize:13, outline:'none', border:'none', cursor:'pointer' }}>
            <option style={{ background:'var(--x-card)' }}>Last 30 Days</option>
            <option style={{ background:'var(--x-card)' }}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Days Without Incident" value="5"   icon={CheckCircle2} color="var(--x-green)" badge="Current Streak" />
        <KpiCard label="Total Incidents"        value="12"  icon={ShieldAlert}  color="var(--x-red)" badge="Last 30 days"   />
        <KpiCard label="PPE Compliance"         value="98%" icon={Users}        color="var(--x-blue)" badge="+2%"            />
        <KpiCard label="Safety Score"           value="94"  icon={TrendingUp}   color="var(--x-orange)" badge="Excellent"      />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Incident Type Trend */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={cardStyle}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='color-mix(in srgb, var(--x-orange) 20%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
          <div style={titleStyle}>Incident Type Trend</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar dataKey="injury"    name="Injury"           stackId="a" fill="var(--x-red)" radius={[4,4,0,0]} />
                <Bar dataKey="equipment" name="Equipment Damage" stackId="a" fill="var(--x-amber)" radius={[4,4,0,0]} />
                <Bar dataKey="safety"    name="Safety Violation" stackId="a" fill="var(--x-blue)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} style={cardStyle}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='color-mix(in srgb, var(--x-orange) 20%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
          <div style={titleStyle}>Severity Distribution</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar dataKey="minor"    name="Minor"    stackId="a" fill="var(--x-green)" radius={[4,4,0,0]} />
                <Bar dataKey="major"    name="Major"    stackId="a" fill="var(--x-amber)" radius={[4,4,0,0]} />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="var(--x-red)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Incident Summary & Cost */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} style={cardStyle}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='color-mix(in srgb, var(--x-orange) 20%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
          <div style={titleStyle}>Incident Summary & Impact</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={incidentSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" vertical={false} />
                <XAxis dataKey="type" stroke="var(--x-muted)" tick={{ fill:'var(--x-muted)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis yAxisId="left"  stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <Tooltip {...tooltipStyle} formatter={(value: any, name: any) => name==='cost' ? [`$${Number(value).toLocaleString()}`, 'Cost'] : [value, name]} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar yAxisId="left" dataKey="count" name="Count" radius={[4,4,0,0]}>
                  {incidentSummary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['var(--x-green)','var(--x-amber)','var(--x-red)'][index]} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost ($)" stroke="var(--x-orange)" strokeWidth={3} dot={{ fill:'var(--x-orange)', r:6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* PPE Compliance */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} style={cardStyle}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='color-mix(in srgb, var(--x-orange) 20%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
          <div style={titleStyle}>PPE Compliance by Item</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ppeCompliance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" horizontal={false} />
                <XAxis type="number" domain={[0,100]} stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis dataKey="item" type="category" stroke="var(--x-muted)" tick={{ fill:'var(--x-muted)', fontSize:11 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} width={130} />
                <Tooltip {...tooltipStyle} />
                <ReferenceLine x={100} stroke="var(--x-green)" strokeDasharray="5 5" />
                <Bar dataKey="compliance" name="Compliance %" radius={[0,4,4,0]}>
                  {ppeCompliance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.compliance >= 95 ? 'var(--x-green)' : entry.compliance >= 90 ? 'var(--x-amber)' : 'var(--x-red)'} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Safety Training */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} style={cardStyle}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='color-mix(in srgb, var(--x-orange) 20%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
          <div style={titleStyle}>Safety Training Progress</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={safetyTraining} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" horizontal={false} />
                <XAxis type="number" domain={[0,24]} stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis dataKey="topic" type="category" stroke="var(--x-muted)" tick={{ fill:'var(--x-muted)', fontSize:11 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} width={130} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar dataKey="completed" name="Completed"      fill="var(--x-orange)" radius={[0,4,4,0]} stackId="a" />
                <Bar dataKey="total"     name="Total Required" fill="var(--x-border)" radius={[0,4,4,0]} stackId="a" />
                <Line type="monotone" dataKey="score" name="Avg Score %" stroke="var(--x-green)" strokeWidth={3} dot={{ fill:'var(--x-green)', r:4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Near Miss Trend */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} style={cardStyle}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='color-mix(in srgb, var(--x-orange) 20%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
          <div style={titleStyle}>Near Miss Reports & Resolution</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={nearMissData}>
                <defs>
                  <linearGradient id="nearMissGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--x-orange)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--x-orange)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Area type="monotone" dataKey="count"    name="Near Misses" stroke="var(--x-orange)" strokeWidth={3} fill="url(#nearMissGrad)" />
                <Bar               dataKey="resolved" name="Resolved"    fill="var(--x-green)" radius={[4,4,0,0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Safety Metrics Overview */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          style={{ ...cardStyle }} className="lg:col-span-2"
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='color-mix(in srgb, var(--x-orange) 20%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
          <div style={titleStyle}>Safety Metrics Overview</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {safetyMetrics.map((metric, i) => (
              <div key={i} style={{ padding:16, borderRadius:12, background:'rgba(var(--x-ov),0.03)', border:'1px solid var(--x-border)' }}>
                <p style={{ fontSize:11, color:'var(--x-faint)', marginBottom:8, fontWeight:600, letterSpacing:'0.04em' }}>{metric.label}</p>
                <p style={{ fontSize:24, fontWeight:800, color:'var(--x-text)', fontFamily:"'Space Grotesk',sans-serif" }}>{metric.value}</p>
                <p style={{ fontSize:11, marginTop:4, fontWeight:600,
                  color: metric.status==='good' ? 'var(--x-green)' : metric.status==='warning' ? 'var(--x-amber)' : 'var(--x-red)'
                }}>{metric.unit}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

