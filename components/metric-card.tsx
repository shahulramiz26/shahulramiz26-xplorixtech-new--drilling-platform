"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  change, 
  trend, 
  icon: Icon 
}: MetricCardProps) {
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
        {trend === "up" ? (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-emerald-400" />
        )}
        <span className="text-emerald-400 text-sm font-medium">{change}</span>
        <span className="text-[#94A3B8] text-sm">vs last period</span>
      </div>
    </div>
  );
}
