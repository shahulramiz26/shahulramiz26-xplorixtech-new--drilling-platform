'use client'

// ── PLACEHOLDER FOR OPERATIONAL + MAINTENANCE DASHBOARDS ───────────────────
// This file stands in for data that should come from your real Operational
// Dashboard (days operated, meters drilled, fuel consumption) and
// Maintenance Dashboard (maintenance cost). Finance treats every field here
// as READ-ONLY — nobody types these numbers into Finance, ever.
//
// To wire in the real thing: replace OPERATIONAL_RECORDS with a fetch/query
// against your actual operations system, keeping the same OperationalRecord
// shape (or adjust the shape and update lib/finance-store.tsx's costBreakdown
// function accordingly).

export interface OperationalRecord {
  rig: string
  project: string
  month: string            // '2026-07'
  daysOperated: number      // from Operational Dashboard
  metersDrilled: number     // from Operational Dashboard
  fuelLitresPerDay: number  // from Operational Dashboard
  maintenanceCost: number   // from Maintenance Dashboard, already in ₹
}

export const OPERATIONAL_RECORDS: OperationalRecord[] = [
  { rig: 'Rig A1', project: 'Site B - South Ridge', month: '2026-06', daysOperated: 20, metersDrilled: 150, fuelLitresPerDay: 105, maintenanceCost: 15000 },
  { rig: 'Rig A1', project: 'Site A - North Field', month: '2026-07', daysOperated: 26, metersDrilled: 210, fuelLitresPerDay: 110, maintenanceCost: 18000 },
  { rig: 'Rig A1', project: 'Site A - North Field', month: '2026-08', daysOperated: 24, metersDrilled: 195, fuelLitresPerDay: 112, maintenanceCost: 16000 },

  { rig: 'Rig A2', project: 'Site C - East Basin', month: '2026-06', daysOperated: 18, metersDrilled: 120, fuelLitresPerDay: 100, maintenanceCost: 14000 },
  { rig: 'Rig A2', project: 'Site A - North Field', month: '2026-07', daysOperated: 24, metersDrilled: 165, fuelLitresPerDay: 115, maintenanceCost: 22000 },
  { rig: 'Rig A2', project: 'Site A - North Field', month: '2026-08', daysOperated: 22, metersDrilled: 158, fuelLitresPerDay: 113, maintenanceCost: 17000 },

  { rig: 'Rig B1', project: 'Site C - East Basin', month: '2026-06', daysOperated: 19, metersDrilled: 130, fuelLitresPerDay: 108, maintenanceCost: 13000 },
  { rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-07', daysOperated: 22, metersDrilled: 180, fuelLitresPerDay: 108, maintenanceCost: 16000 },
  { rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-08', daysOperated: 21, metersDrilled: 172, fuelLitresPerDay: 106, maintenanceCost: 15500 },

  { rig: 'Rig C1', project: 'Site A - North Field', month: '2026-05', daysOperated: 20, metersDrilled: 140, fuelLitresPerDay: 118, maintenanceCost: 12000 },
  { rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-07', daysOperated: 20, metersDrilled: 140, fuelLitresPerDay: 120, maintenanceCost: 21000 },
  { rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-08', daysOperated: 19, metersDrilled: 135, fuelLitresPerDay: 119, maintenanceCost: 19500 },

  { rig: 'Rig C2', project: 'Site C - East Basin', month: '2026-08', daysOperated: 18, metersDrilled: 125, fuelLitresPerDay: 110, maintenanceCost: 11000 },
]

export function operationalRecordsForRig(rig: string): OperationalRecord[] {
  return OPERATIONAL_RECORDS.filter(r => r.rig === rig).sort((a, b) => a.month.localeCompare(b.month))
}
export function findOperationalRecord(rig: string, project: string, month: string): OperationalRecord | undefined {
  return OPERATIONAL_RECORDS.find(r => r.rig === rig && r.project === project && r.month === month)
}
export function allRigsWithOperationalData(): string[] {
  return Array.from(new Set(OPERATIONAL_RECORDS.map(r => r.rig)))
}

