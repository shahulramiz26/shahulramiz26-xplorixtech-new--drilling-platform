"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Zap, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PerformanceChart } from "@/app/components/PremiumCharts";

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

const performanceData = [
  { name: "Mon", efficiency: 82, target: 85 },
  { name: "Tue", efficiency: 88, target: 85 },
  { name: "Wed", efficiency: 91, target: 85 },
  { name: "Thu", efficiency: 85, target: 85 },
  { name: "Fri", efficiency: 89, target: 85 },
  { name: "Sat", efficiency: 87, target: 85 },
  { name: "Sun", efficiency: 90, target: 85 },
];

function MetricCard({ title, value, unit, icon: Icon, trend, change }: any) {
  return (
    <div className="p-6 bg-[#151A27] rounded-xl border border-[#2A3040]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#94A3B8] text-sm">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-[#94A3B8] text-sm">{unit}</span>
          </div>
        </div>
        <div className="p-2 bg-[#1E2535] rounded-lg">
          <Icon className="w-5 h-5 text-[#94A3B8]" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4">
        <span className={`text-sm font-medium ${trend === "up" ? "text-emerald-400" : "text-emerald-400"}`}>
          {change}
        </span>
        <span className="text-[#94A3B8] text-sm">vs last period</span>
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
          href="/supervisor/dashboard"
          className="p-2 rounded-lg bg-[#151A27] border border-[#2A3040] hover:bg-[#1E2535] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Operation Analytics</h1>
          <p className="text-[#94A3B8]">ROP, motors, and downtime metrics</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
          <h3 className="text-lg font-semibold mb-4">Drilling Efficiency</h3>
          <PerformanceChart data={performanceData} />
        </div>
        <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
          <h3 className="text-lg font-semibold mb-4">Motor Performance</h3>
          <div className="h-[300px] flex items-center justify-center text-[#94A3B8]">
            Motor performance metrics will be displayed here
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
