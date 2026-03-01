"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  TrendingUp, 
  Wrench, 
  Users, 
  Flame, 
  ShieldAlert 
} from "lucide-react";

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

const categories = [
  {
    title: "Operation",
    description: "ROP, motors, downtime",
    icon: TrendingUp,
    href: "/supervisor/analytics/operation",
    color: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Maintenance",
    description: "Service logs, components",
    icon: Wrench,
    href: "/supervisor/analytics/maintenance",
    color: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    title: "Driller & Crew",
    description: "Performance metrics",
    icon: Users,
    href: "/supervisor/analytics/driller-crew",
    color: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Consumables",
    description: "Resource usage",
    icon: Flame,
    href: "/supervisor/analytics/consumables",
    color: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    title: "HSC",
    description: "Safety compliance",
    icon: ShieldAlert,
    href: "/supervisor/analytics/hsc",
    color: "bg-red-500/20",
    iconColor: "text-red-400",
  },
];

export default function SupervisorAnalyticsDashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-[#94A3B8] mt-1">Performance metrics for your assigned projects</p>
      </motion.div>

      {/* Filter */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-2 px-4 py-2 bg-[#151A27] rounded-lg border border-[#2A3040] w-fit"
      >
        <span className="text-[#94A3B8]">Filter:</span>
        <span className="text-sm">Last 7 Days</span>
        <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>

      {/* Category Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.title}
              href={category.href}
              className="block p-6 bg-[#151A27] rounded-xl border border-[#2A3040] hover:border-[#3A4050] hover:bg-[#1A1F2E] transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${category.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {category.title}
              </h3>
              <p className="text-[#94A3B8] text-sm mt-1">{category.description}</p>
            </Link>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
