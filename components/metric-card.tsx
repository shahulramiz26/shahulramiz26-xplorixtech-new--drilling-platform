"use client";

import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export function MetricCard({ title, value, unit, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#94A3B8] text-sm">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#3B82F6]" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#F8FAFC]">{value}</span>
        <span className="text-[#64748B] text-sm">{unit}</span>
      </div>
      <div className="flex items-center gap-1 mt-2">
        {trend === "up" ? (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
        <span className={`text-sm ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
          {change}
        </span>
      </div>
    </div>
  );
}
