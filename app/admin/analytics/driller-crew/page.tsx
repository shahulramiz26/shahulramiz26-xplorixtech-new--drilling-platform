'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter,
  ZAxis, ComposedChart, Area, Cell
} from 'recharts'
import { Users, Clock, TrendingUp, Award, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import AIInsights from '../../../components/AIInsights'
import LeaderboardTable from '../../../components/LeaderboardTable'
import { hexA } from '../../../../lib/theme'

function KpiCard({ label, value, unit, icon: Icon, color, trend, trendUp }: {
  label: string; value: string; unit?: string; icon: any
  color: string; trend?: string; trendUp?: boolean
}) {
  return (
    <div style={{ padding:20, borderRadius:16, background:'var(--x-card)', border:'1px solid var(--x-border)', transition:'border-color 0.2s' }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=`${hexA(color, 0x40)}`}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--x-border)'}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${hexA(color, 0x18)}`, border:`1px solid ${hexA(color, 0x30)}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon style={{ width:18, height:18, color }} />
        </div>
        {trend && (
          <span style={{ fontSize:11, fontWeight:700, color: trendUp ? 'var(--x-green)' : 'var(--x-red)' }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:'var(--x-text)', fontFamily:"'Space Grotesk',sans-serif" }}>
        {value}{unit && <span style={{ fontSize:13, fontWeight:400, color:'var(--x-faint)', marginLeft:4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize:13, color:'var(--x-muted)', marginTop:4 }}>{label}</div>
    </div>
  )
}

const COLORS = {
  primary: 'var(--x-blue)', accent: 'var(--x-green)', purple: 'var(--x-purple)',
  warning: 'var(--x-amber)', danger: 'var(--x-red)', cyan: 'var(--x-cyan)', pink: 'var(--x-pink)'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--x-raised2)] border border-[color:var(--x-border)] rounded-xl p-4 shadow-[0_16px_64px_rgba(var(--x-shadow),0.8)]">
        <p className="text-[color:var(--x-muted)] text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-[color:var(--x-muted)] text-sm">{entry.name}:</span>
            <span className="text-[color:var(--x-text)] font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ── DRILLER LEADERBOARD DATA — supports 70+ drillers ──────────────────────
const drillerLeaderboardRows = [
  { id:'1', name:'Chris Williams', sublabel:'RIG-003 · Site A', meters:1320, rop:58, downtime:12, efficiency:96, shifts:26, trend:'up'   as const },
  { id:'2', name:'Mike Johnson',   sublabel:'RIG-001 · Site A', meters:1245, rop:52, downtime:18, efficiency:92, shifts:24, trend:'up'   as const },
  { id:'3', name:'Sam Torres',     sublabel:'RIG-005 · Site B', meters:1150, rop:50, downtime:20, efficiency:90, shifts:23, trend:'flat' as const },
  { id:'4', name:'David Brown',    sublabel:'RIG-002 · Site A', meters:1180, rop:48, downtime:24, efficiency:88, shifts:22, trend:'up'   as const },
  { id:'5', name:'Alex Roberts',   sublabel:'RIG-004 · Site C', meters:1050, rop:45, downtime:32, efficiency:78, shifts:20, trend:'down' as const, alert:true },
]

const drillerLeaderboardColumns = [
  { key:'meters',    label:'Meters',     unit:'m',   sortable:true, highlight:true, lowerIsBetter:false },
  { key:'rop',       label:'ROP',        unit:'m/hr',sortable:true, highlight:true, lowerIsBetter:false },
  { key:'efficiency',label:'Efficiency', format:'percent' as const, sortable:true, highlight:true, lowerIsBetter:false },
  { key:'downtime',  label:'Downtime',   unit:'hrs', sortable:true, highlight:true, lowerIsBetter:true  },
  { key:'shifts',    label:'Shifts',     sortable:true, highlight:false },
]

const crewHoursData = [
  { date:'Feb 20', hours:336, target:350, utilization:96  },
  { date:'Feb 21', hours:384, target:350, utilization:110 },
  { date:'Feb 22', hours:352, target:350, utilization:101 },
  { date:'Feb 23', hours:400, target:350, utilization:114 },
  { date:'Feb 24', hours:368, target:350, utilization:105 },
  { date:'Feb 25', hours:392, target:350, utilization:112 },
  { date:'Feb 26', hours:416, target:350, utilization:119 },
]

const shiftDistribution = [
  { shift:'Day',   drillers:8, supervisors:3, hours:720 },
  { shift:'Night', drillers:4, supervisors:1, hours:360 },
]

const experienceData = [
  { experience:'0-2 years',  count:3, avgROP:42 },
  { experience:'2-5 years',  count:5, avgROP:50 },
  { experience:'5-10 years', count:3, avgROP:56 },
  { experience:'10+ years',  count:1, avgROP:60 },
]

const performanceRadar = [
  { subject:'ROP',        A:92, B:88, fullMark:100 },
  { subject:'Safety',     A:98, B:95, fullMark:100 },
  { subject:'Attendance', A:95, B:90, fullMark:100 },
  { subject:'Efficiency', A:96, B:85, fullMark:100 },
  { subject:'Quality',    A:90, B:88, fullMark:100 },
  { subject:'Teamwork',   A:94, B:92, fullMark:100 },
]

const productivityScatter = [
  { x:52, y:1245, z:18, name:'Mike J.'   },
  { x:48, y:1180, z:24, name:'David B.'  },
  { x:58, y:1320, z:12, name:'Chris W.'  },
  { x:45, y:1050, z:32, name:'Alex R.'   },
  { x:50, y:1150, z:20, name:'Sam T.'    },
]

const drillerInsights = [
  { id:'1', type:'anomaly' as const,    severity:'warning' as const,  title:'Low ROP Alert',          description:'Alex R. showing ROP 20% below team average',   metric:'ROP Performance', change:'-20% vs avg',     recommendation:'Provide additional training on drilling parameters'      },
  { id:'2', type:'trend' as const,      severity:'info' as const,     title:'Top Performer',          description:'Chris W. consistently achieving highest ROP',   metric:'Best ROP',        change:'58 m/hr avg',     recommendation:'Document best practices from Chris for team training'    },
  { id:'3', type:'anomaly' as const,    severity:'critical' as const, title:'High Downtime Pattern',  description:'Alex R. has 78% more downtime than others',     metric:'Downtime',        change:'+78% vs avg',     recommendation:'Review equipment handling procedures with Alex'          },
  { id:'4', type:'prediction' as const, severity:'info' as const,     title:'Crew Efficiency Forecast',description:'Team efficiency projected to increase 8% next week',metric:'Efficiency',  change:'+8% projected',   recommendation:'Maintain current crew assignments'                      },
]

export default function AdminDrillerCrewDashboard() {
  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="driller" insights={drillerInsights} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[color:var(--x-text)]">Driller & Crew Dashboard</h2>
          <p className="text-[color:var(--x-muted)] mt-1">Personnel performance and workforce analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--x-raised2)] border border-[color:var(--x-border)] rounded-xl">
            <Filter className="w-4 h-4 text-[color:var(--x-faint)]" />
            <select className="bg-transparent text-[color:var(--x-text)] text-sm outline-none">
              <option className="bg-[var(--x-raised2)]">All Projects</option>
              <option className="bg-[var(--x-raised2)]">Gold Mine Project A</option>
              <option className="bg-[var(--x-raised2)]">Copper Exploration</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Drillers" value="12"       icon={Users}     color="var(--x-blue)" trend="+2"   trendUp={true}  />
        <KpiCard label="Avg ROP"        value="50.6"     unit="m/hr" icon={TrendingUp} color="var(--x-green)" trend="+5%" trendUp={true} />
        <KpiCard label="Total Hours"    value="2,448"    unit="hrs"  icon={Clock}     color="var(--x-cyan)" trend="+12%" trendUp={true} />
        <KpiCard label="Top Performer"  value="Chris W." icon={Award}     color="var(--x-orange)" trend="96%"  trendUp={true}  />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── DRILLER PERFORMANCE — REPLACED WITH LeaderboardTable ── */}
        <motion.div style={{ background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:16, padding:24 }} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-[color:var(--x-text)]">Driller Performance Leaderboard</h3>
            <span className="text-xs text-[color:var(--x-faint)] bg-[var(--x-raised2)] px-3 py-1 rounded-full border border-[color:var(--x-border)]">
              Search · Sort · Paginate — handles 70+ drillers
            </span>
          </div>
          <p className="text-xs text-[color:var(--x-faint)] mb-4">Click any column header to sort · 🥇🥈🥉 for top 3 · 🔴 alert for high downtime</p>
          <LeaderboardTable
            rows={drillerLeaderboardRows}
            columns={drillerLeaderboardColumns}
            pageSize={10}
            searchable={true}
            searchPlaceholder="Search driller name or rig..."
            defaultSortKey="meters"
            defaultSortDir="desc"
            showRank={true}
            highlightTopN={3}
          />
        </motion.div>

        {/* ROP vs Meters Scatter */}
        <motion.div style={{ background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[color:var(--x-text)] mb-6">ROP vs Meters (Bubble = Downtime)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" />
                <XAxis type="number" dataKey="x" name="ROP"    stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis type="number" dataKey="y" name="Meters" stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <ZAxis type="number" dataKey="z" range={[100, 500]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray:'3 3' }} />
                <Scatter name="Drillers" data={productivityScatter} fill="var(--x-purple)">
                  {productivityScatter.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.z > 25 ? 'var(--x-red)' : entry.z > 15 ? 'var(--x-amber)' : 'var(--x-green)'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crew Hours Trend */}
        <motion.div style={{ background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[color:var(--x-text)] mb-6">Crew Hours & Utilization</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={crewHoursData}>
                <defs>
                  <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--x-cyan)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--x-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" vertical={false} />
                <XAxis dataKey="date"   stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis yAxisId="left"  stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Area  yAxisId="left"  type="monotone" dataKey="hours"       name="Hours Worked"  stroke="var(--x-cyan)" strokeWidth={3} fill="url(#hoursGradient)" />
                <Line  yAxisId="left"  type="monotone" dataKey="target"      name="Target"        stroke="var(--x-faint)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line  yAxisId="right" type="monotone" dataKey="utilization" name="Utilization %" stroke="var(--x-pink)" strokeWidth={3} dot={{ fill:'var(--x-pink)', r:4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Shift Distribution */}
        <motion.div style={{ background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[color:var(--x-text)] mb-6">Shift Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" vertical={false} />
                <XAxis dataKey="shift" stroke="var(--x-muted)" tick={{ fill:'var(--x-muted)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar dataKey="drillers"    name="Drillers"     fill="var(--x-blue)" radius={[4,4,0,0]} />
                <Bar dataKey="supervisors" name="Supervisors"  fill="var(--x-green)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Experience vs ROP */}
        <motion.div style={{ background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[color:var(--x-text)] mb-6">Experience vs Average ROP</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border)" vertical={false} />
                <XAxis dataKey="experience" stroke="var(--x-muted)" tick={{ fill:'var(--x-muted)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis yAxisId="left"  stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:12 }} tickLine={false} axisLine={{ stroke:'var(--x-border)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar  yAxisId="left"  dataKey="count"  name="Driller Count" fill="var(--x-purple)" radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgROP" name="Avg ROP" stroke="var(--x-amber)" strokeWidth={3} dot={{ fill:'var(--x-amber)', r:6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Radar */}
        <motion.div style={{ background:'var(--x-card)', border:'1px solid var(--x-border)', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[color:var(--x-text)] mb-6">Performance Comparison (Top 2)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceRadar}>
                <PolarGrid stroke="var(--x-border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--x-muted)" tick={{ fill:'var(--x-muted)', fontSize:12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--x-faint)" tick={{ fill:'var(--x-faint)', fontSize:10 }} />
                <Radar name="Chris W." dataKey="A" stroke="var(--x-green)" strokeWidth={3} fill="var(--x-green)" fillOpacity={0.3} />
                <Radar name="Mike J."  dataKey="B" stroke="var(--x-blue)" strokeWidth={3} fill="var(--x-blue)" fillOpacity={0.3} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

