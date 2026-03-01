"use client";

export const dynamic = 'force-dynamic';

import { Header } from "@/components/header";
import { MetricCard } from "@/components/metric-card";
import { TrendingUp, Clock, Zap, Activity } from "lucide-react";

const metrics = [
  {
    title: "Rate of Penetration",
    value: "45.2",
    unit: "ft/hr",
    change: "+12%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "Motor Efficiency",
    value: "87.5",
    unit: "%",
    change: "+3%",
    trend: "up" as const,
    icon: Zap,
  },
  {
    title: "Downtime",
    value: "2.4",
    unit: "hrs",
    change: "-18%",
    trend: "down" as const,
    icon: Clock,
  },
  {
    title: "Active Rigs",
    value: "12",
    unit: "units",
    change: "+2",
    trend: "up" as const,
    icon: Activity,
  },
];

export default function OperationPage() {
  return (
    <div className="space-y-8">
      <Header 
        title="Operation" 
        subtitle="ROP, motors, downtime tracking"
        showBack
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
        <h3 className="text-lg font-semibold mb-4">Drilling Performance</h3>
        <div className="h-64 flex items-center justify-center text-[#94A3B8]">
          <p>Drilling performance chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
}
