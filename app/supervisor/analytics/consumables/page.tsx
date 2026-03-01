"use client";

import { motion } from "framer-motion";
import { Flame, Package, TrendingDown, DollarSign, ArrowLeft } from "lucide-react";
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
  { title: "Total Consumed", value: "2,450", unit: "units", icon: Flame, trend: "up", change: "+12%" },
  { title: "Inventory Level", value: "8,320", unit: "units", icon: Package, trend: "down", change: "-5%" },
  { title: "Low Stock Items", value: "18", unit: "items", icon: TrendingDown, trend: "up", change: "+3" },
  { title: "Cost This Month", value: "$45.2K", unit: "USD", icon: DollarSign, trend: "up", change: "+8%" },
];

const consumables = [
  { id: 1, name: "Drilling Mud", category: "Fluids", usage: "1,200", stock: "3,500", status: "Good" },
  { id: 2, name: "Drill Bits", category: "Tools", usage: "45", stock: "120", status: "Good" },
  { id: 3, name: "Casing", category: "Materials", usage: "850", stock: "1,200", status: "Low" },
  { id: 4, name: "Cement", category: "Materials", usage: "420", stock: "680", status: "Good" },
  { id: 5, name: "Fuel", category: "Energy", usage: "12,500", stock: "45,000", status: "Good" },
  { id: 6, name: "Lubricants", category: "Fluids", usage: "180", stock: "220", status: "Critical" },
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

export default function SupervisorConsumablesPage() {
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
          className="p-2 rounded-lg bg-[#151A27] border border-[#2A3040] hover:bg-[#1E2535] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Consumables Analytics</h1>
          <p className="text-[#94A3B8]">Resource usage and inventory management</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </motion.div>

      {/* Inventory Table */}
      <motion.div variants={itemVariants} className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
        <h3 className="text-lg font-semibold mb-4">Resource Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3040]">
                <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Item</th>
                <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Stock</th>
                <th className="text-left py-3 px-2 text-[#94A3B8] text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {consumables.map((item) => (
                <tr key={item.id} className="border-b border-[#2A3040]/50">
                  <td className="py-3 px-2 text-sm">{item.name}</td>
                  <td className="py-3 px-2 text-sm">{item.stock}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "Good" ? "bg-emerald-500/20 text-emerald-400" :
                      item.status === "Low" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {item.status}
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
