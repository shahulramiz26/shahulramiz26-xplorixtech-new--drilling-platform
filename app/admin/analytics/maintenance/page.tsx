'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, Line, ReferenceLine
} from 'recharts'
import { Wrench, Clock, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import AIInsights from '../../../components/AIInsights'
import DualMetricList from '../../../components/DualMetricList'

const COLORS = {
  primary: '#3B82F6', accent: '#10B981', purple: '#8B5CF6',
  warning: '#F59E0B', danger: '#EF4444', cyan: '#06B6D4', pink: '#EC4899'
}
const PIE_COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2234] border border-[#1E293B] rounded-xl p-4 shadow-[0_16px_64px_rgba(0,0,0,0.8)]">
        <p className="text-[#94A3B8] text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#94A3B8] text-sm">{entry.name}:</span>
            <span className="text-[#F8FAFC] font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const maintenanceTypeData = [
  { name: 'Preventive', value: 45, cost: 4500 },
  { name: 'Breakdown',  value: 25, cost: 8500 },
  { name: 'Scheduled',  value: 20, cost: 3200 },
  { name: 'Component',  value: 10, cost: 1800 },
]

const maintenanceHoursData = [
  { date: 'Feb 20', hours: 8,  rigs: 2, cost: 800  },
  { date: 'Feb 21', hours: 4,  rigs: 1, cost: 400  },
  { date: 'Feb 22', hours: 12, rigs: 3, cost: 1200 },
  { date: 'Feb 23', hours: 6,  rigs: 2, cost: 600  },
  { date: 'Feb 24', hours: 10, rigs: 3, cost: 1000 },
  { date: 'Feb 25', hours: 5,  rigs: 1, cost: 500  },
  { date: 'Feb 26', hours: 7,  rigs: 2, cost: 700  },
]

// ── COMPONENT FAILURE DATA — supports unlimited components ─────────────────
const componentFailureItems = [
  { label: 'Hydraulic',    metric1: 12, metric2: 72, metric1Unit: 'x', metric2Unit: 'hrs' },
  { label: 'Engine',       metric1: 8,  metric2: 48, metric1Unit: 'x', metric2Unit: 'hrs' },
  { label: 'Transmission', metric1: 5,  metric2: 40, metric1Unit: 'x', metric2Unit: 'hrs' },
  { label: 'Mud Pump',     metric1: 7,  metric2: 35, metric1Unit: 'x', metric2Unit: 'hrs' },
  { label: 'Electrical',   metric1: 6,  metric2: 24, metric1Unit: 'x', metric2Unit: 'hrs' },
  { label: 'Compressor',   metric1: 4,  metric2: 20, metric1Unit: 'x', metric2Unit: 'hrs' },
  { label: 'Gearbox',      metric1: 3,  metric2: 18, metric1Unit: 'x', metric2Unit: 'hrs' },
  { label: 'Cooling',      metric1: 2,  metric2: 10, metric1Unit: 'x', metric2Unit: 'hrs' },
]

const actionData = [
  { action: 'Repair',    count: 28, cost: 15000 },
  { action: 'Replace',   count: 15, cost: 35000 },
  { action: 'Temporary', count: 8,  cost: 2000  },
]

const oilData = [
  { date: 'Feb 20', engine: 15, hydraulic: 25, transmission: 10, total: 50 },
  { date: 'Feb 21', engine: 8,  hydraulic: 12, transmission: 5,  total: 25 },
  { date: 'Feb 22', engine: 20, hydraulic: 35, transmission: 15, total: 70 },
  { date: 'Feb 23', engine: 10, hydraulic: 18, transmission: 8,  total: 36 },
  { date: 'Feb 24', engine: 18, hydraulic: 30, transmission: 12, total: 60 },
  { date: 'Feb 25', engine: 12, hydraulic: 20, transmission: 9,  total: 41 },
  { date: 'Feb 26', engine: 14, hydraulic: 22, transmission: 11, total: 47 },
]

const mtbfData = [
  { rig: 'RIG-001', mtbf: 450, target: 400 },
  { rig: 'RIG-002', mtbf: 380, target: 400 },
  { rig: 'RIG-003', mtbf: 520, target: 400 },
  { rig: 'RIG-004', mtbf: 290, target: 400 },
  { rig: 'RIG-005', mtbf: 410, target: 400 },
]

const maintenanceInsights = [
  { id:'1', type:'anomaly' as const,       severity:'critical' as const, title:'Hydraulic System Issues',   description:'Hydraulic failures up 60% this month',        metric:'Hydraulic Failures', change:'+60% vs avg',       recommendation:'Inspect hydraulic fluid quality and filter replacement schedule' },
  { id:'2', type:'prediction' as const,    severity:'warning' as const,  title:'Engine Maintenance Due',    description:'RIG-002 engine showing signs of degradation', metric:'Engine Health',      change:'Service needed in 5 days', recommendation:'Schedule preventive engine service immediately' },
  { id:'3', type:'recommendation' as const,severity:'info' as const,     title:'Oil Change Optimization',   description:'AI suggests extending oil change interval',   metric:'Oil Change Interval',change:'+10% extension possible',  recommendation:'Monitor oil analysis reports before extending' },
  { id:'4', type:'anomaly' as const,       severity:'warning' as const,  title:'Mud Pump Pressure Drop',    description:'Unusual pressure fluctuations in RIG-001',    metric:'Mud Pump Pressure', change:'-15% from baseline',       recommendation:'Check seals and valves for wear' },
]

export default function AdminMaintenanceDashboard() {
  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="maintenance" insights={maintenanceInsights} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8FAFC]">Maintenance Dashboard</h2>
          <p className="text-[#94A3B8] mt-1">Rig maintenance and component health metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-xl">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select className="bg-transparent text-[#F8FAFC] text-sm outline-none">
              <option className="bg-[#1A2234]">Last 7 Days</option>
              <option className="bg-[#1A2234]">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Maint. Logs', value:'28',   icon:Wrench,       color:COLORS.warning, trend:'+12%', up:true  },
          { label:'Maint. Hours',      value:'84',   unit:'hrs', icon:Clock, color:COLORS.danger,  trend:'+8%',  up:false },
          { label:'Pending Service',   value:'5',    icon:AlertTriangle, color:COLORS.pink,   trend:'-2',   up:true  },
          { label:'Avg MTBF',          value:'410',  unit:'hrs', icon:TrendingUp, color:COLORS.accent, trend:'+5%', up:true },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
            className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:`${kpi.color}20` }}>
                <kpi.icon className="w-5 h-5" style={{ color:kpi.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC]">{kpi.value}<span className="text-sm font-normal text-[#64748B] ml-1">{kpi.unit}</span></p>
            <p className="text-sm text-[#94A3B8] mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Maintenance Type Donut */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Maintenance Type Distribution</h3>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={maintenanceTypeData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value">
                  {maintenanceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#111827" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#F8FAFC]">100</p>
                <p className="text-xs text-[#94A3B8]">Total</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Maintenance Hours Trend */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Maintenance Hours & Cost Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={maintenanceHoursData}>
                <defs>
                  <linearGradient id="maintGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis yAxisId="left"  stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Area yAxisId="left" type="monotone" dataKey="hours" name="Hours" stroke="#F59E0B" strokeWidth={3} fill="url(#maintGradient)" />
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost ($)" stroke="#EF4444" strokeWidth={3} dot={{ fill:'#EF4444', r:4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── COMPONENT FAILURE ANALYSIS — REPLACED WITH DualMetricList ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Component Failure Analysis</h3>
            <span className="text-xs text-[#64748B] bg-[#1A2234] px-3 py-1 rounded-full border border-[#1E293B]">
              {componentFailureItems.reduce((s,i) => s+i.metric2, 0)} hrs total downtime
            </span>
          </div>
          <p className="text-xs text-[#64748B] mb-4">Ranked by downtime hours — tap legend to sort by failures</p>
          <DualMetricList
            items={componentFailureItems}
            metric1Label="Failures"
            metric2Label="Downtime"
            metric1Color="#3B82F6"
            metric2Color="#EF4444"
            maxVisible={6}
            searchable={true}
            alertThreshold={40}
            sortBy="metric2"
          />
        </motion.div>

        {/* Action Taken Distribution */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Action Taken Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="action" stroke="#94A3B8" tick={{ fill:'#94A3B8', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" fill="#8B5CF6" radius={[4,4,0,0]}>
                  {actionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6','#10B981','#F59E0B'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Oil Consumption */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Oil Consumption Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oilData}>
                <defs>
                  <linearGradient id="engineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="hydraulicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="transmissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Area type="monotone" dataKey="engine"       name="Engine Oil"       stackId="1" stroke="#3B82F6" strokeWidth={2} fill="url(#engineGradient)"       />
                <Area type="monotone" dataKey="hydraulic"    name="Hydraulic Oil"    stackId="1" stroke="#EF4444" strokeWidth={2} fill="url(#hydraulicGradient)"    />
                <Area type="monotone" dataKey="transmission" name="Transmission Oil" stackId="1" stroke="#F59E0B" strokeWidth={2} fill="url(#transmissionGradient)" />
                <Line type="monotone" dataKey="total" name="Total" stroke="#10B981" strokeWidth={3} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* MTBF by Rig */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Mean Time Between Failures (MTBF) by Rig</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mtbfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="rig" stroke="#94A3B8" tick={{ fill:'#94A3B8', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={400} stroke="#F59E0B" strokeDasharray="5 5" label={{ value:'Target: 400h', fill:'#F59E0B', fontSize:12 }} />
                <Bar dataKey="mtbf" name="MTBF (hours)" fill="#06B6D4" radius={[4,4,0,0]}>
                  {mtbfData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mtbf >= 400 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

