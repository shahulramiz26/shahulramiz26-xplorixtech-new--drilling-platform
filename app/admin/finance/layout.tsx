'use client'

import { InventoryProvider } from '../../../lib/inventory-store'
import { FinanceProvider } from '../../../lib/finance-store'

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <InventoryProvider>
      <FinanceProvider>
        <div style={{ minHeight: '100vh', background: '#080B10' }}>{children}</div>
      </FinanceProvider>
    </InventoryProvider>
  )
}

