"use client";

import { ChevronDown, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle: string;
  showBack?: boolean;
}

export function Header({ title, subtitle, showBack = false }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          {showBack && (
            <Link 
              href="/" 
              className="p-2 rounded-lg bg-[#151A27] border border-[#2A3040] hover:bg-[#1E2535] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        <p className="text-[#94A3B8] mt-1">{subtitle}</p>
      </div>
      
      {!showBack && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#151A27] rounded-lg border border-[#2A3040]">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <span className="text-sm">Last 7 Days</span>
          <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
        </div>
      )}
    </div>
  );
}
