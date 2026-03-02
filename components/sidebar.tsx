"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Wrench,
  Users,
  Flame,
  ShieldAlert,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operation", label: "Operation", icon: TrendingUp },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/driller-crew", label: "Driller & Crew", icon: Users },
  { href: "/consumables", label: "Consumables", icon: Flame },
  { href: "/hsc", label: "HSC", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#0F1419] border-r border-[#2A3040] p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">Drilling Platform</h2>
        <p className="text-[#94A3B8] text-sm">MVP Dashboard</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-[#94A3B8] hover:bg-[#151A27] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-[#2A3040]">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#94A3B8] hover:bg-[#151A27] hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
