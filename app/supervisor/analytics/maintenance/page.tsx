"use client";

import { motion } from "framer-motion";
import { Wrench, ClipboardList, Package, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

const recentLogs = [
  { id: 1, equipment: "Mud Pump #3", type: "Preventive", date: "2026-03-01", status: "Completed" },
  { id: 2, equipment: "Top Drive", type: "Repair", date: "2026-02-28", status: "In Progress" },
  { id: 3, equipment: "Drawworks", type: "Inspection", date: "2026-02-27", status: "Scheduled" },
  { id: 4, equipment: "BOP Stack", type: "Testing", date: "2026-02-26", status: "Completed" },
];

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
          href="/supervisor/analytics"
          className="p-2 rounded-lg bg-[var(--x-panel)] border border-[color:var(--x-border2)] hover:bg-[var(--x-raised2)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--x-text)]">Maintenance Analytics</h1>
          <p className="text-[color:var(--x-muted)]">Service logs and component tracking</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </motion.div>

      {/* Service Logs Table */}
      <motion.div variants={itemVariants} className="bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)] p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Service Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[color:var(--x-border2)]">
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Equipment</th>
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Type</th>
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-[color:color-mix(in_srgb,var(--x-border2)_50%,transparent)]">
                  <td className="py-3 px-2 text-sm">{log.equipment}</td>
                  <td className="py-3 px-2 text-sm text-[color:var(--x-muted)]">{log.type}</td>
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
      </motion.div>
    </motion.div>
  );
}
