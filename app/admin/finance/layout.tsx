'use client'
// ── FINANCE & COSTING LAYOUT ───────────────────────────────────────────────
// Place this file at: app/admin/finance/layout.tsx
import { CostingProvider } from './costing-context'

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <CostingProvider>
      <div className="min-h-screen bg-[#0A0F1A]">
        {children}
      </div>
    </CostingProvider>
  )
}

