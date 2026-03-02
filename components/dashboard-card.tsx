"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  iconColor: string;
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  iconColor,
}: DashboardCardProps) {
  return (
    <Link href={href}>
      <div className="p-6 rounded-2xl bg-[#151A27] border border-[#2A3040] hover:border-[#3B82F6]/50 transition-all group">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">{title}</h3>
        <p className="text-[#94A3B8] text-sm">{description}</p>
      </div>
    </Link>
  );
}
