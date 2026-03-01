"use client";

import { motion } from "framer-motion";
import { Wrench, ClipboardList, Package, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MaintenanceTimelineChart } from "@/app/components/PremiumCharts";

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
  { title: "Service Logs", value: "156", unit: "entries", icon: ClipboardList, trend: "up", change: "+8" },
  { title: "Components", value: "1,240", unit: "items", icon: Package, trend: "up", change: "+45" },
  { title: "Pending Tasks", value: "23", unit: "tasks", icon: Wrench, trend: "down", change: "-5" },
  { title: "Critical Alerts", value: "3", unit: "alerts", icon: AlertTriangle, trend: "down", change: "-2" },
];

const maintenanceData = [
  { equipment: "Mud Pump", completed: 85, pending: 10, overdue: 5 },
  { equipment: "Top Drive", completed: 70, pending: 20, overdue: 10 },
  { equipment: "Drawworks", completed: 90, pending: 8, overdue: 2 },
  { equipment: "BOP Stack", completed: 95, pending: 5, overdue: 0 },
];

const recentLogs = [
  { id: 1, equipment: "Mud Pump #3", type: "Preventive", date: "2026-03-01", status: "Completed" },
  { id: 2, equipment: "Top Drive", type: "Repair", date: "2026-02-28", status: "In Progress" },
  { id: 3, equipment: "Drawworks", type: "Inspection", date: "2026-02-27", status: "Scheduled" },
  { id: 4, equipment: "BOP Stack", type: "Testing", date: "2026-02-26", status: "Completed" },
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

export default function SupervisorMaintenancePage() {
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
          <h1 className="text-2xl font-bold text-white">Maintenance Analytics</h1>
          <p className="text-[#94A3B8]">Service logs and component tracking</p>
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
          <h3 className="text-lg font-semibold mb-4">Equipment Maintenance Status</h3>
          <MaintenanceTimelineChart data={maintenanceData} />
        </div>
        <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Service Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A3040]">
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Equipment</th>
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Type</th>
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#2A3040]/50">
                    <td className="py-3 px-2 text-sm">{log.equipment}</td>
                    <td className="py-3 px-2 text-sm text-[#94A3B8]">{log.type}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" :
                        log.status === "In Progress" ? "bg-amber-500/20 text-amber-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
