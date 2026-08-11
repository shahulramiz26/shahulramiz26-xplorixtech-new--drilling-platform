import { InventoryProvider } from '../../../lib/inventory-store'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <InventoryProvider>{children}</InventoryProvider>
}

