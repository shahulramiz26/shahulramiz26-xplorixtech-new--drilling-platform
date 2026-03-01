"use client";

export const dynamic = 'force-dynamic';

import { Header } from "@/components/header";
import { MetricCard } from "@/components/metric-card";
import { Flame, Package, TrendingDown, DollarSign } from "lucide-react";

const metrics = [
  {
    title: "Total Consumed",
    value: "2,450",
    unit: "units",
    change: "+12%",
    trend: "up" as const,
    icon: Flame,
  },
  {
    title: "Inventory Level",
    value: "8,320",
    unit: "units",
    change: "-5%",
    trend: "down" as const,
    icon: Package,
  },
  {
    title: "Low Stock Items",
    value: "18",
    unit: "items",
    change: "+3",
    trend: "up" as const,
    icon: TrendingDown,
  },
  {
    title: "Cost This Month",
    value: "$45.2K",
    unit: "USD",
    change: "+8%",
    trend: "up" as const,
    icon: DollarSign,
  },
];

const consumables = [
  { id: 1, name: "Drilling Mud", category: "Fluids", usage: "1,200", stock: "3,500", status: "Good" },
  { id: 2, name: "Drill Bits", category: "Tools", usage: "45", stock: "120", status: "Good" },
  { id: 3, name: "Casing", category: "Materials", usage: "850", stock: "1,200", status: "Low" },
  { id: 4, name: "Cement", category: "Materials", usage: "420", stock: "680", status: "Good" },
  { id: 5, name: "Fuel", category: "Energy", usage: "12,500", stock: "45,000", status: "Good" },
  { id: 6, name: "Lubricants", category: "Fluids", usage: "180", stock: "220", status: "Critical" },
];

export default function ConsumablesPage() {
  return (
    <div className="space-y-8">
      <Header 
        title="Consumables" 
        subtitle="Resource usage and inventory management"
        showBack
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
        <h3 className="text-lg font-semibold mb-4">Resource Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3040]">
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Item</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Category</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Monthly Usage</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Current Stock</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {consumables.map((item) => (
                <tr key={item.id} className="border-b border-[#2A3040]/50">
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">{item.category}</td>
                  <td className="py-3 px-4">{item.usage}</td>
                  <td className="py-3 px-4">{item.stock}</td>
                  <td className="py-3 px-4">
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
      </div>
    </div>
  );
}
