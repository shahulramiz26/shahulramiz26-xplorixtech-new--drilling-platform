"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function Header({ title, subtitle, showBack }: HeaderProps) {
  return (
    <div className="mb-6">
      {showBack && (
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      )}
      <h1 className="text-2xl font-bold text-[#F8FAFC]">{title}</h1>
      {subtitle && <p className="text-[#94A3B8] mt-1">{subtitle}</p>}
    </div>
  );
}
