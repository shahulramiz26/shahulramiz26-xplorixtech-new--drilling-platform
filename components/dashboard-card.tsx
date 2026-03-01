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
  iconColor 
}: DashboardCardProps) {
  return (
    <Link 
      href={href}
      className="block p-6 bg-[#151A27] rounded-xl border border-[#2A3040] hover:border-[#3A4050] hover:bg-[#1A1F2E] transition-all group"
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-[#94A3B8] text-sm mt-1">{description}</p>
    </Link>
  );
}
