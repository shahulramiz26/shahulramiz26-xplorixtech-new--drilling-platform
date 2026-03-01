"use client";

import { Header } from "@/components/header";
import { MetricCard } from "@/components/metric-card";
import { Wrench, ClipboardList, Package, AlertTriangle } from "lucide-react";

const metrics = [
  {
    title: "Service Logs",
    value: "156",
    unit: "entries",
    change: "+8",
    trend: "up" as const,
    icon: ClipboardList,
  },
  {
    title: "Components",
    value: "1,240",
    unit: "items",
    change: "+45",
    trend: "up" as const,
    icon: Package,
  },
  {
    title: "Pending Maintenance",
    value: "23",
    unit: "tasks",
    change: "-5",
    trend: "down" as const,
    icon: Wrench,
  },
  {
    title: "Critical Alerts",
    value: "3",
    unit: "alerts",
    change: "-2",
    trend: "down" as const,
    icon: AlertTriangle,
  },
];

const recentLogs = [
  { id: 1, equipment: "Mud Pump #3", type: "Preventive", date: "2026-03-01", status: "Completed" },
  { id: 2, equipment: "Top Drive", type: "Repair", date: "2026-02-28", status: "In Progress" },
  { id: 3, equipment: "Drawworks", type: "Inspection", date: "2026-02-27", status: "Scheduled" },
  { id: 4, equipment: "BOP Stack", type: "Testing", date: "2026-02-26", status: "Completed" },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-8">
      <Header 
        title="Maintenance" 
        subtitle="Service logs, components tracking"
        showBack
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Service Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3040]">
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Equipment</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Type</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-[#2A3040]/50">
                  <td className="py-3 px-4">{log.equipment}</td>
                  <td className="py-3 px-4">{log.type}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">{log.date}</td>
                  <td className="py-3 px-4">
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
    </div>
  );
}
