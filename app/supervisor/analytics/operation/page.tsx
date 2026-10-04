"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Zap, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const metrics = [
  { title: "Rate of Penetration", value: "45.2", unit: "ft/hr", icon: TrendingUp, trend: "up", change: "+12%" },
  { title: "Motor Efficiency", value: "87.5", unit: "%", icon: Zap, trend: "up", change: "+3%" },
  { title: "Downtime", value: "2.4", unit: "hrs", icon: Clock, trend: "down", change: "-18%" },
  { title: "Active Rigs", value: "12", unit: "units", icon: Activity, trend: "up", change: "+2" },
];

// Chart data
const drillingEfficiencyData = [
  { date: 'Mon', efficiency: 84, target: 85 },
  { date: 'Tue', efficiency: 92, target: 85 },
  { date: 'Wed', efficiency: 88, target: 85 },
  { date: 'Thu', efficiency: 96, target: 85 },
  { date: 'Fri', efficiency: 91, target: 85 },
  { date: 'Sat', efficiency: 89, target: 85 },
  { date: 'Sun', efficiency: 94, target: 85 },
];

const ropData = [
  { date: 'Mon', rop: 42, target: 45 },
  { date: 'Tue', rop: 48, target: 45 },
  { date: 'Wed', rop: 45, target: 45 },
  { date: 'Thu', rop: 52, target: 45 },
  { date: 'Fri', rop: 49, target: 45 },
  { date: 'Sat', rop: 47, target: 45 },
  { date: 'Sun', rop: 51, target: 45 },
];

const downtimeData = [
  { reason: 'Mechanical', hours: 12 },
  { reason: 'Bit Change', hours: 8 },
  { reason: 'Water', hours: 6 },
  { reason: 'Weather', hours: 4 },
  { reason: 'Other', hours: 10 },
];

const rigPerformanceData = [
  { name: 'RIG-001', value: 28, color: 'var(--x-blue)' },
  { name: 'RIG-002', value: 24, color: 'var(--x-green)' },
  { name: 'RIG-003', value: 22, color: 'var(--x-amber)' },
  { name: 'RIG-004', value: 18, color: 'var(--x-purple)' },
  { name: 'RIG-005', value: 8, color: 'var(--x-red)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--x-raised2)] border border-[color:var(--x-border)] rounded-xl p-3 shadow-lg">
        <p className="text-[color:var(--x-muted)] text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[color:var(--x-muted)] text-xs">{entry.name}:</span>
            <span className="text-[color:var(--x-text)] font-semibold text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function MetricCard({ title, value, unit, icon: Icon, trend, change }: any) {
  return (
    <div className="p-6 bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[color:var(--x-muted)] text-sm">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[color:var(--x-text)]">{value}</span>
            <span className="text-[color:var(--x-muted)] text-sm">{unit}</span>
          </div>
        </div>
        <div className="p-2 bg-[var(--x-raised2)] rounded-lg">
          <Icon className="w-5 h-5 text-[color:var(--x-muted)]" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4">
        <span className={`text-sm font-medium ${trend === "up" ? "text-emerald-400" : "text-emerald-400"}`}>
          {change}
        </span>
        <span className="text-[color:var(--x-muted)] text-sm">vs last period</span>
      </div>
    </div>
  );
}

export default function SupervisorOperationPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Link
          href="/supervisor/analytics"
          className="p-2 rounded-lg bg-[var(--x-panel)] border border-[color:var(--x-border2)] hover:bg-[var(--x-raised2)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--x-text)]">Operation Analytics</h1>
          <p className="text-[color:var(--x-muted)]">ROP, motors, and downtime metrics</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drilling Efficiency Chart */}
        <motion.div variants={itemVariants} className="bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)] p-6">
          <h3 className="text-lg font-semibold mb-4 text-[color:var(--x-text)]">Drilling Efficiency</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drillingEfficiencyData}>
                <defs>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--x-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--x-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border2)" />
                <XAxis dataKey="date" stroke="var(--x-faint)" fontSize={12} />
                <YAxis stroke="var(--x-faint)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="efficiency" name="Efficiency %" stroke="var(--x-blue)" fillOpacity={1} fill="url(#colorEfficiency)" strokeWidth={2} />
                <Line type="monotone" dataKey="target" name="Target" stroke="var(--x-green)" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ROP Trend Chart */}
        <motion.div variants={itemVariants} className="bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)] p-6">
          <h3 className="text-lg font-semibold mb-4 text-[color:var(--x-text)]">ROP Trend (ft/hr)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ropData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border2)" />
                <XAxis dataKey="date" stroke="var(--x-faint)" fontSize={12} />
                <YAxis stroke="var(--x-faint)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="rop" name="ROP" stroke="var(--x-blue)" strokeWidth={3} dot={{ fill: 'var(--x-blue)', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="var(--x-green)" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Downtime Analysis */}
        <motion.div variants={itemVariants} className="bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)] p-6">
          <h3 className="text-lg font-semibold mb-4 text-[color:var(--x-text)]">Downtime by Reason</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--x-border2)" />
                <XAxis type="number" stroke="var(--x-faint)" fontSize={12} />
                <YAxis dataKey="reason" type="category" stroke="var(--x-faint)" fontSize={12} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours Lost" fill="var(--x-red)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rig Performance Distribution */}
        <motion.div variants={itemVariants} className="bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)] p-6">
          <h3 className="text-lg font-semibold mb-4 text-[color:var(--x-text)]">Rig Performance Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rigPerformanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rigPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
