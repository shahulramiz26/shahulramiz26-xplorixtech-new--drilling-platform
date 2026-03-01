"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, FileCheck, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/app/components/MetricCard";
import { SafetyChart } from "@/app/components/PremiumCharts";

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

const safetyData = [
  { name: "Compliant", value: 85, color: "#10B981" },
  { name: "Review Needed", value: 10, color: "#F59E0B" },
  { name: "Non-Compliant", value: 5, color: "#EF4444" },
];

const complianceItems = [
  { id: 1, standard: "ISO 45001", status: "Compliant", lastAudit: "2026-02-15", nextAudit: "2026-08-15" },
  { id: 2, standard: "OSHA Standards", status: "Compliant", lastAudit: "2026-01-20", nextAudit: "2026-07-20" },
  { id: 3, standard: "API RP 75", status: "Compliant", lastAudit: "2026-02-01", nextAudit: "2026-08-01" },
  { id: 4, standard: "BSEE Regulations", status: "Review", lastAudit: "2026-01-10", nextAudit: "2026-04-10" },
];

const recentIncidents = [
  { id: 1, type: "Near Miss", description: "Slip on platform", date: "2026-02-15", severity: "Low" },
  { id: 2, type: "Observation", description: "PPE not worn", date: "2026-02-10", severity: "Medium" },
];

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
          href="/supervisor/dashboard"
          className="p-2 rounded-lg bg-[#151A27] border border-[#2A3040] hover:bg-[#1E2535] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">HSC Analytics</h1>
          <p className="text-[#94A3B8]">Health, Safety & Compliance tracking</p>
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
          <h3 className="text-lg font-semibold mb-4">Safety Compliance Distribution</h3>
          <SafetyChart data={safetyData} />
        </div>
        <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A3040]">
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Standard</th>
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Status</th>
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Next Audit</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#2A3040]/50">
                    <td className="py-3 px-2 text-sm">{item.standard}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "Compliant" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-[#94A3B8]">{item.nextAudit}</td>
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
