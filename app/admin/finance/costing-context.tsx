'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// ── TYPES ─────────────────────────────────────────────────────────────────
export interface ContractRate {
  contractType: 'meterage' | 'dayrate'
  // Meterage fields
  band1To: number; band1Rate: number
  band2From: number; band2To: number; band2Rate: number
  band3From: number; band3Rate: number
  standbyRate: number
  // Day rate fields
  drillingDayRate: number
  standbyDayRate: number
  repairDayRate: number
  // One-time
  mobilisation: number; demobilisation: number
  // Statutory
  gst: number; tds: number; retention: number
}

export interface ProjectInfo {
  id: string
  name: string
  fullName: string
  client: string
}

// ── DEFAULT RATES ─────────────────────────────────────────────────────────
export const DEFAULT_RATES: Record<string, ContractRate> = {
  'RS-01': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 850,
    band2From: 200, band2To: 400, band2Rate: 950,
    band3From: 400, band3Rate: 1050,
    standbyRate: 8000,
    drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000,
    mobilisation: 250000, demobilisation: 150000,
    gst: 18, tds: 2, retention: 5,
  },
  'CMPDI-DAM': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 820,
    band2From: 200, band2To: 400, band2Rate: 920,
    band3From: 400, band3Rate: 1020,
    standbyRate: 7500,
    drillingDayRate: 26000, standbyDayRate: 11000, repairDayRate: 7500,
    mobilisation: 220000, demobilisation: 130000,
    gst: 18, tds: 2, retention: 5,
  },
  'CMP-MAD': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 800,
    band2From: 200, band2To: 400, band2Rate: 900,
    band3From: 400, band3Rate: 1000,
    standbyRate: 7000,
    drillingDayRate: 25000, standbyDayRate: 10000, repairDayRate: 7000,
    mobilisation: 200000, demobilisation: 120000,
    gst: 18, tds: 2, retention: 5,
  },
  'DGMIL-BHK': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 800,
    band2From: 200, band2To: 400, band2Rate: 900,
    band3From: 400, band3Rate: 1000,
    standbyRate: 7000,
    drillingDayRate: 25000, standbyDayRate: 10000, repairDayRate: 7000,
    mobilisation: 200000, demobilisation: 120000,
    gst: 18, tds: 2, retention: 5,
  },
  'PAT-CMPDI': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 830,
    band2From: 200, band2To: 400, band2Rate: 930,
    band3From: 400, band3Rate: 1030,
    standbyRate: 7800,
    drillingDayRate: 26000, standbyDayRate: 11000, repairDayRate: 7500,
    mobilisation: 210000, demobilisation: 125000,
    gst: 18, tds: 2, retention: 5,
  },
  'MECL-HIN': {
    contractType: 'dayrate',
    band1To: 200, band1Rate: 0,
    band2From: 200, band2To: 400, band2Rate: 0,
    band3From: 400, band3Rate: 0,
    standbyRate: 0,
    drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000,
    mobilisation: 180000, demobilisation: 100000,
    gst: 18, tds: 2, retention: 5,
  },
}

export const PROJECTS: ProjectInfo[] = [
  { id: 'RS-01',     name: 'RS-01',     fullName: 'RS-01 — Chhindwara',     client: 'CMPDI' },
  { id: 'CMPDI-DAM', name: 'CMPDI-DAM', fullName: 'CMPDI-DAM — Bokaro',     client: 'CMPDI' },
  { id: 'CMP-MAD',   name: 'CMP-MAD',   fullName: 'CMP-MAD — Warora',       client: 'CMPDI' },
  { id: 'DGMIL-BHK', name: 'DGMIL-BHK', fullName: 'DGMIL-BHK — Saraipali', client: 'DGML'  },
  { id: 'PAT-CMPDI', name: 'PAT-CMPDI', fullName: 'PAT-CMPDI — Pathakuri',  client: 'CMPDI' },
  { id: 'MECL-HIN',  name: 'MECL-HIN',  fullName: 'MECL-HIN — Bazar Gaon', client: 'MECL'  },
]

// ── CONTEXT ───────────────────────────────────────────────────────────────
interface CostingContextType {
  rates: Record<string, ContractRate>
  updateRate: (projectId: string, rate: ContractRate) => void
  getRate: (projectId: string) => ContractRate
}

const CostingContext = createContext<CostingContextType | null>(null)

export function CostingProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Record<string, ContractRate>>(DEFAULT_RATES)

  const updateRate = (projectId: string, rate: ContractRate) => {
    setRates(prev => ({ ...prev, [projectId]: rate }))
  }

  const getRate = (projectId: string): ContractRate => {
    return rates[projectId] || DEFAULT_RATES[projectId] || DEFAULT_RATES['RS-01']
  }

  return (
    <CostingContext.Provider value={{ rates, updateRate, getRate }}>
      {children}
    </CostingContext.Provider>
  )
}

export function useCostingRates() {
  const ctx = useContext(CostingContext)
  if (!ctx) {
    // Fallback if context not available — return default rates
    return {
      rates: DEFAULT_RATES,
      updateRate: (_id: string, _rate: ContractRate) => {},
      getRate: (id: string) => DEFAULT_RATES[id] || DEFAULT_RATES['RS-01'],
    }
  }
  return ctx
}

