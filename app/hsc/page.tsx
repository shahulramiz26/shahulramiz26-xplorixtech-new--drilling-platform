"use client";

import { Header } from "@/components/header";
import { MetricCard } from "@/components/metric-card";
import { ShieldCheck, AlertTriangle, FileCheck, Users } from "lucide-react";

const metrics = [
  {
    title: "Safety Score",
    value: "96.8",
    unit: "%",
    change: "+1.2%",
    trend: "up" as const,
    icon: ShieldCheck,
  },
  {
    title: "Incidents",
    value: "0",
    unit: "this month",
    change: "-2",
    trend: "down" as const,
    icon: AlertTriangle,
  },
  {
    title: "Audits Passed",
    value: "12",
    unit: "audits",
    change: "+1",
    trend: "up" as const,
    icon: FileCheck,
  },
  {
    title: "Training Completed",
    value: "94",
    unit: "%",
    change: "+4%",
    trend: "up" as const,
    icon: Users,
  },
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

export default function HSCPage() {
  return (
    <div className="space-y-8">
      <Header 
        title="HSC" 
        subtitle="Health, Safety & Compliance tracking"
        showBack
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A3040]">
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Standard</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Last Audit</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Next Audit</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#2A3040]/50">
                    <td className="py-3 px-4">{item.standard}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "Compliant" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{item.lastAudit}</td>
                    <td className="py-3 px-4 text-[#94A3B8]">{item.nextAudit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Incidents & Observations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A3040]">
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-[#2A3040]/50">
                    <td className="py-3 px-4">{incident.type}</td>
                    <td className="py-3 px-4 text-[#94A3B8]">{incident.description}</td>
                    <td className="py-3 px-4 text-[#94A3B8]">{incident.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        incident.severity === "Low" ? "bg-blue-500/20 text-blue-400" :
                        incident.severity === "Medium" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
