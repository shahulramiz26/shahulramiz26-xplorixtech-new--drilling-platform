'use client'

// ── PLACEHOLDER FOR OPERATIONAL + MAINTENANCE DASHBOARDS ───────────────────
// Stands in for real data from your Operational Dashboard (days operated,
// meters drilled, fuel, downtime) and Maintenance Dashboard (maintenance
// cost). Finance treats every field here as READ-ONLY.
//
// To wire in the real thing: replace OPERATIONAL_RECORDS with a fetch/query
// against your actual operations system, keeping this shape (or adjust it
// and update lib/finance-store.tsx's costBreakdown function to match).

export interface OperationalRecord {
  rig: string
  project: string
  month: string              // '2026-07'
  daysOperated: number        // from Operational Dashboard — staffed days, includes downtime
  metersDrilled: number       // from Operational Dashboard
  fuelLitresPerDay: number    // from Operational Dashboard
  downtimeHoursPerDay: number // from Operational Dashboard
  maintenanceCost: number     // from Maintenance Dashboard, already in ₹ for the month
}

export const OPERATIONAL_RECORDS: OperationalRecord[] = [
  { rig: 'Rig A1', project: 'Site B - South Ridge', month: '2026-06', daysOperated: 20, metersDrilled: 150, fuelLitresPerDay: 105, downtimeHoursPerDay: 2.5, maintenanceCost: 15000 },
  { rig: 'Rig A1', project: 'Site A - North Field', month: '2026-07', daysOperated: 26, metersDrilled: 210, fuelLitresPerDay: 110, downtimeHoursPerDay: 3.0, maintenanceCost: 18000 },
  { rig: 'Rig A1', project: 'Site A - North Field', month: '2026-08', daysOperated: 24, metersDrilled: 195, fuelLitresPerDay: 112, downtimeHoursPerDay: 2.2, maintenanceCost: 16000 },

  { rig: 'Rig A2', project: 'Site C - East Basin', month: '2026-06', daysOperated: 18, metersDrilled: 120, fuelLitresPerDay: 100, downtimeHoursPerDay: 4.1, maintenanceCost: 14000 },
  { rig: 'Rig A2', project: 'Site A - North Field', month: '2026-07', daysOperated: 24, metersDrilled: 165, fuelLitresPerDay: 115, downtimeHoursPerDay: 3.6, maintenanceCost: 22000 },
  { rig: 'Rig A2', project: 'Site A - North Field', month: '2026-08', daysOperated: 22, metersDrilled: 158, fuelLitresPerDay: 113, downtimeHoursPerDay: 2.8, maintenanceCost: 17000 },

  { rig: 'Rig B1', project: 'Site C - East Basin', month: '2026-06', daysOperated: 19, metersDrilled: 130, fuelLitresPerDay: 108, downtimeHoursPerDay: 3.3, maintenanceCost: 13000 },
  { rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-07', daysOperated: 22, metersDrilled: 180, fuelLitresPerDay: 108, downtimeHoursPerDay: 2.0, maintenanceCost: 16000 },
  { rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-08', daysOperated: 21, metersDrilled: 172, fuelLitresPerDay: 106, downtimeHoursPerDay: 2.4, maintenanceCost: 15500 },

  { rig: 'Rig C1', project: 'Site A - North Field', month: '2026-05', daysOperated: 20, metersDrilled: 140, fuelLitresPerDay: 118, downtimeHoursPerDay: 3.8, maintenanceCost: 12000 },
  { rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-07', daysOperated: 20, metersDrilled: 140, fuelLitresPerDay: 120, downtimeHoursPerDay: 4.5, maintenanceCost: 21000 },
  { rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-08', daysOperated: 19, metersDrilled: 135, fuelLitresPerDay: 119, downtimeHoursPerDay: 3.9, maintenanceCost: 19500 },

  { rig: 'Rig C2', project: 'Site C - East Basin', month: '2026-07', daysOperated: 17, metersDrilled: 118, fuelLitresPerDay: 109, downtimeHoursPerDay: 2.9, maintenanceCost: 10500 },
  { rig: 'Rig C2', project: 'Site C - East Basin', month: '2026-08', daysOperated: 18, metersDrilled: 125, fuelLitresPerDay: 110, downtimeHoursPerDay: 2.6, maintenanceCost: 11000 },
]

export function totalFuelLitres(r: OperationalRecord): number { return r.fuelLitresPerDay * r.daysOperated }
export function totalDowntimeHours(r: OperationalRecord): number { return r.downtimeHoursPerDay * r.daysOperated }

export function operationalRecordsForRig(rig: string): OperationalRecord[] {
  return OPERATIONAL_RECORDS.filter(r => r.rig === rig).sort((a, b) => a.month.localeCompare(b.month))
}
export function findOperationalRecord(rig: string, project: string, month: string): OperationalRecord | undefined {
  return OPERATIONAL_RECORDS.find(r => r.rig === rig && r.project === project && r.month === month)
}
export function allRigsWithOperationalData(): string[] {
  return Array.from(new Set(OPERATIONAL_RECORDS.map(r => r.rig)))
}
// Every rig operating on a given project, for a given month — the basis for
// Project Cost, which combines all of them before applying the client rate.
export function operationalRecordsForProjectMonth(project: string, month: string): OperationalRecord[] {
  return OPERATIONAL_RECORDS.filter(r => r.project === project && r.month === month)
}
// Every (project, month) pair that has any operational data at all.
export function allProjectMonths(): { project: string; month: string }[] {
  const seen = new Set<string>()
  const out: { project: string; month: string }[] = []
  OPERATIONAL_RECORDS.forEach(r => {
    const key = `${r.project}__${r.month}`
    if (!seen.has(key)) { seen.add(key); out.push({ project: r.project, month: r.month }) }
  })
  return out.sort((a, b) => a.project.localeCompare(b.project) || a.month.localeCompare(b.month))
}
export function monthsForProject(project: string): string[] {
  return Array.from(new Set(OPERATIONAL_RECORDS.filter(r => r.project === project).map(r => r.month))).sort()
}

