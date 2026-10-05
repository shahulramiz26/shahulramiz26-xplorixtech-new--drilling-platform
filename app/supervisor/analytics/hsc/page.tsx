"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, FileCheck, Users, ArrowLeft } from "lucide-react";
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
  { title: "Safety Score", value: "96.8", unit: "%", icon: ShieldCheck, trend: "up", change: "+1.2%" },
  { title: "Incidents", value: "0", unit: "this month", icon: AlertTriangle, trend: "down", change: "-2" },
  { title: "Audits Passed", value: "12", unit: "audits", icon: FileCheck, trend: "up", change: "+1" },
  { title: "Training Completed", value: "94", unit: "%", icon: Users, trend: "up", change: "+4%" },
];

const complianceItems = [
  { id: 1, standard: "ISO 45001", status: "Compliant", lastAudit: "2026-02-15", nextAudit: "2026-08-15" },
  { id: 2, standard: "OSHA Standards", status: "Compliant", lastAudit: "2026-01-20", nextAudit: "2026-07-20" },
  { id: 3, standard: "API RP 75", status: "Compliant", lastAudit: "2026-02-01", nextAudit: "2026-08-01" },
  { id: 4, standard: "BSEE Regulations", status: "Review", lastAudit: "2026-01-10", nextAudit: "2026-04-10" },
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

export default function SupervisorHSCPage() {
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
          <h1 className="text-2xl font-bold text-[color:var(--x-text)]">HSC Analytics</h1>
          <p className="text-[color:var(--x-muted)]">Health, Safety & Compliance tracking</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </motion.div>

      {/* Compliance Table */}
      <motion.div variants={itemVariants} className="bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)] p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[color:var(--x-border2)]">
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Standard</th>
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Status</th>
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Next Audit</th>
              </tr>
            </thead>
            <tbody>
              {complianceItems.map((item) => (
                <tr key={item.id} className="border-b border-[color:color-mix(in_srgb,var(--x-border2)_50%,transparent)]">
                  <td className="py-3 px-2 text-sm">{item.standard}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "Compliant" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-[color:var(--x-muted)]">{item.nextAudit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
