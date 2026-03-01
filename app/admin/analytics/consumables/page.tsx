'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  Treemap
} from 'recharts'
import { Droplets, Package, Wrench, TrendingUp, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import AIInsights from '../../../components/AIInsights'

const COLORS = {
  primary: '#3B82F6',
  accent: '#10B981',
  purple: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  cyan: '#06B6D4',
  pink: '#EC4899'
}

const PIE_COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2234] border border-[#1E293B] rounded-xl p-4 shadow-[0_16px_64px_rgba(0,0,0,0.8)]">
        <p className="text-[#94A3B8] text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-[#94A3B8] text-sm">{entry.name}:</span>
            <span className="text-[#F8FAFC] font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const fluidData = [
  { date: 'Feb 20', water: 2500, fuel: 800, additives: 120, oil: 45 },
  { date: 'Feb 21', water: 2800, fuel: 950, additives: 150, oil: 52 },
  { date: 'Feb 22', water: 2200, fuel: 700, additives: 100, oil: 38 },
  { date: 'Feb 23', water: 3200, fuel: 1100, additives: 180, oil: 65 },
  { date: 'Feb 24', water: 2600, fuel: 850, additives: 130, oil: 48 },
  { date: 'Feb 25', water: 3000, fuel: 1000, additives: 160, oil: 58 },
  { date: 'Feb 26', water: 3400, fuel: 1200, additives: 200, oil: 72 },
]

const accessoriesData = [
  { name: 'Core Lifter', count: 45, cost: 4500, category: 'Core' },
  { name: 'Drill Pipe', count: 32, cost: 12800, category: 'Drilling' },
  { name: 'Casing', count: 28, cost: 8400, category: 'Drilling' },
  { name: 'O-Rings', count: 56, cost: 560, category: 'Seals' },
  { name: 'Coupling', count: 24, cost: 2400, category: 'Connectors' },
  { name: 'Core Barrel', count: 18, cost: 10800, category: 'Core' },
  { name: 'Liner', count: 22, cost: 3300, category: 'Core' },
  { name: 'Reaming Shell', count: 15, cost: 4500, category: 'Core' },
]

const accessoriesTrend = [
  { date: 'Week 1', usage: 28, cost: 2800 },
  { date: 'Week 2', usage: 35, cost: 3500 },
  { date: 'Week 3', usage: 42, cost: 4200 },
  { date: 'Week 4', usage: 45, cost: 4500 },
]

const equipmentData = [
  { date: 'Feb 20', compressor: 48, pump: 36, generator: 24, other: 12 },
  { date: 'Feb 21', compressor: 52, pump: 40, generator: 28, other: 15 },
  { date: 'Feb 22', compressor: 44, pump: 32, generator: 20, other: 10 },
  { date: 'Feb 23', compressor: 60, pump: 48, generator: 32, other: 18 },
  { date: 'Feb 24', compressor: 50, pump: 38, generator: 26, other: 14 },
  { date: 'Feb 25', compressor: 56, pump: 44, generator: 30, other: 16 },
  { date: 'Feb 26', compressor: 64, pump: 52, generator: 36, other: 20 },
]

const costBreakdown = [
  { name: 'Fuel', value: 6150, color: '#EF4444' },
  { name: 'Water', value: 18900, color: '#3B82F6' },
  { name: 'Additives', value: 1140, color: '#F59E0B' },
  { name: 'Oil', value: 373, color: '#10B981' },
  { name: 'Accessories', value: 51460, color: '#8B5CF6' },
  { name: 'Equipment', value: 28400, color: '#06B6D4' },
]

const supplierPerformance = [
  { supplier: 'Atlas Copco', delivery: 95, quality: 92, price: 85, support: 88 },
  { supplier: 'Boart Longyear', delivery: 90, quality: 88, price: 78, support: 90 },
  { supplier: 'Sandvik', delivery: 98, quality: 95, price: 82, support: 94 },
  { supplier: 'Dimatec', delivery: 85, quality: 85, price: 90, support: 82 },
]

const inventoryLevels = [
  { item: 'Core Lifters', current: 45, min: 20, max: 100, status: 'good' },
  { item: 'Drill Pipe', current: 32, min: 15, max: 50, status: 'good' },
  { item: 'Casing', current: 12, min: 15, max: 40, status: 'low' },
  { item: 'O-Rings', current: 56, min: 30, max: 80, status: 'good' },
  { item: 'Coupling', current: 8, min: 10, max: 30, status: 'critical' },
]

const consumablesInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    severity: 'warning' as const,
    title: 'Fuel Consumption Spike',
    description: 'Fuel usage 25% above baseline this week',
    metric: 'Fuel Usage',
    change: '+25% vs baseline',
    recommendation: 'Check for fuel leaks or inefficient equipment operation'
  },
  {
    id: '2',
    type: 'prediction' as const,
    severity: 'info' as const,
    title: 'Stock Alert: Couplings',
    description: 'Coupling inventory below minimum threshold',
    metric: 'Coupling Stock',
    change: '8 units left',
    recommendation: 'Order 20 units of couplings immediately'
  },
  {
    id: '3',
    type: 'recommendation' as const,
    severity: 'info' as const,
    title: 'Water Usage Optimization',
    description: 'AI suggests reducing water usage by 10% without impacting performance',
    metric: 'Water Efficiency',
    change: '-10% possible',
    recommendation: 'Implement suggested drilling fluid mix ratio'
  },
  {
    id: '4',
    type: 'anomaly' as const,
    severity: 'critical' as const,
    title: 'Additives Overuse',
    description: 'Additives consumption 40% higher than planned',
    metric: 'Additives Usage',
    change: '+40% over budget',
    recommendation: 'Review additives application procedures'
  }
]

export default function AdminConsumablesDashboard() {
  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="consumables" insights={consumablesInsights} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8FAFC]">Consumable Dashboard</h2>
          <p className="text-[#94A3B8] mt-1">Resource utilization and inventory management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-xl">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select className="bg-transparent text-[#F8FAFC] text-sm outline-none">
              <option className="bg-[#1A2234]">All Projects</option>
              <option className="bg-[#1A2234]">Gold Mine Project A</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fuel', value: '6,150', unit: 'L', icon: Droplets, color: COLORS.danger, trend: '+10%', up: false },
          { label: 'Total Water', value: '18,900', unit: 'L', icon: Droplets, color: COLORS.primary, trend: '+5%', up: false },
          { label: 'Accessories Cost', value: '$51,460', icon: Package, color: COLORS.purple, trend: '+15%', up: false },
          { label: 'Equipment Hours', value: '1,248', unit: 'hrs', icon: Wrench, color: COLORS.cyan, trend: '+8%', up: true },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 hover:border-[#3B82F6]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
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
        {/* Fluid Consumption - Stacked Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Fluid Consumption Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluidData}>
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="addGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="water" name="Water (L)" stackId="1" stroke="#3B82F6" strokeWidth={2} fill="url(#waterGrad)" />
                <Area type="monotone" dataKey="fuel" name="Fuel (L)" stackId="1" stroke="#EF4444" strokeWidth={2} fill="url(#fuelGrad)" />
                <Area type="monotone" dataKey="additives" name="Additives (kg)" stackId="1" stroke="#F59E0B" strokeWidth={2} fill="url(#addGrad)" />
                <Line type="monotone" dataKey="oil" name="Oil (L)" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Accessories Usage - Treemap Style Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Accessories Usage by Cost</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accessoriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} width={100} />
                <Tooltip content={<CustomTooltip />} formatter={(value) => `$${value}`} />
                <Bar dataKey="cost" name="Total Cost ($)" radius={[0, 4, 4, 0]}>
                  {accessoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Accessories Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Accessories Usage Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={accessoriesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="usage" name="Units Used" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost ($)" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Equipment Usage - Stacked Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Equipment Usage Hours by Type</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="compressor" name="Air Compressor" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pump" name="Mud Pump" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="generator" name="Generator" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="other" name="Other" stackId="a" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cost Breakdown - Pie */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Total Cost Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Supplier Performance - Radar-style Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Supplier Performance Score</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="supplier" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="delivery" name="Delivery" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quality" name="Quality" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="price" name="Price" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="support" name="Support" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Inventory Levels */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Inventory Levels</h3>
          <div className="space-y-4">
            {inventoryLevels.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 text-sm text-[#94A3B8]">{item.item}</div>
                <div className="flex-1">
                  <div className="h-3 bg-[#1E293B] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.status === 'critical' ? 'bg-[#EF4444]' :
                        item.status === 'low' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${(item.current / item.max) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className={`text-sm font-medium ${
                    item.status === 'critical' ? 'text-[#EF4444]' :
                    item.status === 'low' ? 'text-[#F59E0B]' : 'text-[#10B981]'
                  }`}>
                    {item.current}
                  </span>
                  <span className="text-xs text-[#64748B]">/{item.max}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
