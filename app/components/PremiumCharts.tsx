'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine
} from 'recharts'

// Premium color palette
const COLORS = {
  primary: '#0066FF',
  accent: '#00D4AA',
  purple: '#7B61FF',
  warning: '#FF9500',
  danger: '#FF3B30',
  cyan: '#00C7FF',
  pink: '#FF6B9D',
  slate: '#64748B'
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.accent,
  COLORS.purple,
  COLORS.warning,
  COLORS.cyan,
  COLORS.pink
]

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827]/95 backdrop-blur-xl border border-[#1E293B] rounded-xl p-4 shadow-[0_16px_64px_rgba(0,0,0,0.5)]">
        <p className="text-slate-400 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-medium">{entry.name}:</span>
            <span className="text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Premium Line Chart
export function PremiumLineChart({ data, dataKey, name, color = 'primary', showArea = true }: any) {
  const chartColor = COLORS[color as keyof typeof COLORS] || COLORS.primary
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#1E293B" 
          vertical={false}
        />
        <XAxis 
          dataKey="date" 
          stroke="#64748B" 
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#1E293B' }}
        />
        <YAxis 
          stroke="#64748B" 
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#1E293B' }}
        />
        <Tooltip content={<CustomTooltip />} />
        {showArea && (
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={chartColor}
            strokeWidth={3}
            fill={`url(#gradient-${color})`}
          />
        )}
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={chartColor}
          strokeWidth={3}
          dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2, fill: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Premium Bar Chart
export function PremiumBarChart({ data, dataKeys, stacked = false, horizontal = false }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        layout={horizontal ? 'vertical' : 'horizontal'}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#1E293B" 
          horizontal={!horizontal}
          vertical={horizontal}
        />
        <XAxis 
          dataKey={horizontal ? undefined : "date"} 
          type={horizontal ? 'number' : 'category'}
          stroke="#64748B" 
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#1E293B' }}
        />
        <YAxis 
          dataKey={horizontal ? "reason" : undefined}
          type={horizontal ? 'category' : 'number'}
          stroke="#64748B" 
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#1E293B' }}
          width={horizontal ? 100 : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        {dataKeys.map((key: any, index: number) => (
          <Bar 
            key={key.key}
            dataKey={key.key} 
            name={key.name}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// Premium Pie Chart
export function PremiumPieChart({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry: any, index: number) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              stroke="#111827"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          wrapperStyle={{ paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Premium Composed Chart (Mixed)
export function PremiumComposedChart({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
        <XAxis 
          dataKey="date" 
          stroke="#64748B" 
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          stroke="#64748B" 
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="drilling" name="Drilling Hours" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
        <Bar dataKey="downtime" name="Downtime" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
        <Line 
          type="monotone" 
          dataKey="efficiency" 
          name="Efficiency %" 
          stroke={COLORS.primary}
          strokeWidth={3}
          dot={{ fill: COLORS.primary, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// KPI Card Component
export function KPICard({ title, value, unit, icon: Icon, color, trend, trendUp, subtext }: any) {
  const colorClasses: any = {
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
    red: 'from-red-500/20 to-red-500/5 text-red-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400',
  }
  
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0D1320] 
                    border border-[#1E293B]/50 hover:border-[#0066FF]/30 
                    transition-all duration-500 group">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} 
                      flex items-center justify-center mb-4
                      group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <p className="text-sm text-slate-400 mt-1">{title}</p>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-sm font-medium
          ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trendUp ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M12 12V3" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5M12 12V3" />
            </svg>
          )}
          {trend}
        </div>
      )}
      {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
    </div>
  )
}

// Stat Card with Trend
export function StatCard({ label, value, subtext, icon: Icon, color, trend, href }: any) {
  return (
    <div className="group p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0D1320] 
                    border border-[#1E293B]/50 hover:border-[#0066FF]/30 
                    transition-all duration-500 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} 
                        flex items-center justify-center shadow-lg
                        group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
            {trend}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M12 12V3" />
            </svg>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xs text-slate-500 mt-2">{subtext}</p>
    </div>
  )
}
