"use client";

import { motion } from "framer-motion";
import { Users, Award, Clock, GraduationCap, ArrowLeft } from "lucide-react";
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
  { title: "Active Crew", value: "48", unit: "members", icon: Users, trend: "up", change: "+3" },
  { title: "Performance Score", value: "92.4", unit: "%", icon: Award, trend: "up", change: "+2.1%" },
  { title: "Shift Hours", value: "1,248", unit: "hrs", icon: Clock, trend: "up", change: "+156" },
  { title: "Certified", value: "45", unit: "members", icon: GraduationCap, trend: "up", change: "+2" },
];

const crewMembers = [
  { id: 1, name: "John Smith", role: "Driller", shift: "Day", performance: 95, status: "Active" },
  { id: 2, name: "Mike Johnson", role: "Assistant Driller", shift: "Day", performance: 88, status: "Active" },
  { id: 3, name: "Sarah Williams", role: "Derrickhand", shift: "Night", performance: 92, status: "Active" },
  { id: 4, name: "Tom Brown", role: "Roughneck", shift: "Night", performance: 85, status: "On Leave" },
  { id: 5, name: "David Lee", role: "Toolpusher", shift: "Day", performance: 98, status: "Active" },
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

export default function SupervisorDrillerCrewPage() {
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
          <h1 className="text-2xl font-bold text-[color:var(--x-text)]">Driller & Crew Analytics</h1>
          <p className="text-[color:var(--x-muted)]">Performance metrics and personnel management</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </motion.div>

      {/* Crew Members Table */}
      <motion.div variants={itemVariants} className="bg-[var(--x-panel)] rounded-xl border border-[color:var(--x-border2)] p-6">
        <h3 className="text-lg font-semibold mb-4">Crew Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[color:var(--x-border2)]">
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Name</th>
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Role</th>
                <th className="text-left py-3 px-2 text-[color:var(--x-muted)] text-sm">Performance</th>
              </tr>
            </thead>
            <tbody>
              {crewMembers.map((member) => (
                <tr key={member.id} className="border-b border-[color:color-mix(in_srgb,var(--x-border2)_50%,transparent)]">
                  <td className="py-3 px-2 text-sm">{member.name}</td>
                  <td className="py-3 px-2 text-sm text-[color:var(--x-muted)]">{member.role}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[var(--x-border2)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${member.performance}%` }}
                        />
                      </div>
                      <span className="text-xs">{member.performance}%</span>
                    </div>
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
