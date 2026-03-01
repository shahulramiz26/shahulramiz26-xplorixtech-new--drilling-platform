"use client";

import { motion } from "framer-motion";
import { Users, Award, Clock, GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CrewPerformanceChart } from "@/app/components/PremiumCharts";

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

const crewPerformanceData = [
  { subject: "Safety", A: 95, B: 90 },
  { subject: "Efficiency", A: 88, B: 85 },
  { subject: "Attendance", A: 92, B: 90 },
  { subject: "Skills", A: 85, B: 80 },
  { subject: "Teamwork", A: 90, B: 85 },
  { subject: "Communication", A: 87, B: 80 },
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
          href="/supervisor/dashboard"
          className="p-2 rounded-lg bg-[#151A27] border border-[#2A3040] hover:bg-[#1E2535] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Driller & Crew Analytics</h1>
          <p className="text-[#94A3B8]">Performance metrics and personnel management</p>
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
          <h3 className="text-lg font-semibold mb-4">Crew Performance Radar</h3>
          <CrewPerformanceChart data={crewPerformanceData} />
        </div>
        <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
          <h3 className="text-lg font-semibold mb-4">Crew Members</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A3040]">
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Name</th>
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Role</th>
                  <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Performance</th>
                </tr>
              </thead>
              <tbody>
                {crewMembers.map((member) => (
                  <tr key={member.id} className="border-b border-[#2A3040]/50">
                    <td className="py-3 px-2 text-sm">{member.name}</td>
                    <td className="py-3 px-2 text-sm text-[#94A3B8]">{member.role}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-[#2A3040] rounded-full overflow-hidden">
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
        </div>
      </motion.div>
    </motion.div>
  );
}
