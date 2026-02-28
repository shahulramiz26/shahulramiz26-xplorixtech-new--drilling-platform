'use client'

import { useState } from 'react'
import { Truck, Power, PowerOff, DollarSign, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Mock rigs
interface Rig {
  id: string
  rigIdCustom: string
  rigType: string
  status: string
  isActiveBillable: boolean
  activatedAt: Date | null
  projectName: string | null
  activeDays: number
  currentMonthCost: number
}

const initialRigs: Rig[] = [
  {
    id: '1',
    rigIdCustom: 'RIG-001',
    rigType: 'CORE',
    status: 'ACTIVE',
    isActiveBillable: true,
    activatedAt: new Date('2024-01-10'),
    projectName: 'Gold Mine Project A',
    activeDays: 48,
    currentMonthCost: 480
  },
  {
    id: '2',
    rigIdCustom: 'RIG-002',
    rigType: 'RC',
    status: 'ACTIVE',
    isActiveBillable: true,
    activatedAt: new Date('2024-01-15'),
    projectName: 'Copper Exploration Site',
    activeDays: 35,
    currentMonthCost: 350
  },
  {
    id: '3',
    rigIdCustom: 'RIG-003',
    rigType: 'CORE',
    status: 'INACTIVE',
    isActiveBillable: false,
    activatedAt: null,
    projectName: null,
    activeDays: 0,
    currentMonthCost: 0
  },
  {
    id: '4',
    rigIdCustom: 'RIG-004',
    rigType: 'BLAST_HOLE',
    status: 'ACTIVE',
    isActiveBillable: true,
    activatedAt: new Date('2024-02-01'),
    projectName: 'Gold Mine Project A',
    activeDays: 0,
    currentMonthCost: 0
  },
  {
    id: '5',
    rigIdCustom: 'RIG-005',
    rigType: 'CORE',
    status: 'INACTIVE',
    isActiveBillable: false,
    activatedAt: null,
    projectName: null,
    activeDays: 0,
    currentMonthCost: 0
  }
]

export default function RigsPage() {
  const [rigs, setRigs] = useState<Rig[]>(initialRigs)

  const toggleRigStatus = (rigId: string) => {
    setRigs(rigs.map(rig => {
      if (rig.id === rigId) {
        const newStatus = rig.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        return {
          ...rig,
          status: newStatus,
          isActiveBillable: newStatus === 'ACTIVE',
          activatedAt: newStatus === 'ACTIVE' ? new Date() : null
        }
      }
      return rig
    }))
  }

  const totalActiveRigs = rigs.filter(r => r.status === 'ACTIVE').length
  const totalMonthlyCost = rigs.reduce((sum, r) => sum + r.currentMonthCost, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Rig Management</h1>
        <p className="text-slate-600 mt-1">Activate rigs to enable billing and data entry</p>
      </div>

      {/* Billing Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Per-Rig Per-Day Billing Model</p>
            <p className="text-sm text-blue-700">
              Daily Rate: $10.00 | Billing starts only when rig is activated. 
              Deactivation pauses billing immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-600 mb-1">Total Rigs</p>
          <p className="text-3xl font-bold text-slate-900">{rigs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-600 mb-1">Active (Billable)</p>
          <p className="text-3xl font-bold text-green-600">{totalActiveRigs}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-600 mb-1">Current Month Cost</p>
          <p className="text-3xl font-bold text-slate-900">${totalMonthlyCost}</p>
        </div>
      </div>

      {/* Important Note */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900">Important: Maintenance Rigs</p>
          <p className="text-sm text-amber-800">
            Rigs under maintenance must remain ACTIVE to allow maintenance logging. 
            Deactivation is only allowed for idle, unallocated rigs.
          </p>
        </div>
      </div>

      {/* Rigs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rig ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Project</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Active Days</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Month Cost</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rigs.map(rig => (
              <tr key={rig.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-slate-600" />
                    </div>
                    <span className="font-mono font-medium text-slate-900">{rig.rigIdCustom}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{rig.rigType}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {rig.projectName || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    rig.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rig.status}
                    {rig.isActiveBillable && (
                      <span className="ml-1 text-green-600">$</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{rig.activeDays}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  ${rig.currentMonthCost}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleRigStatus(rig.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      rig.status === 'ACTIVE'
                        ? 'text-red-600 hover:bg-red-50 border border-red-200'
                        : 'text-green-600 hover:bg-green-50 border border-green-200'
                    }`}
                  >
                    {rig.status === 'ACTIVE' ? (
                      <><PowerOff className="w-4 h-4" /> Deactivate</>
                    ) : (
                      <><Power className="w-4 h-4" /> Activate</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Billing Calculation Example */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing Calculation Example</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2">Rig</th>
                <th className="text-right py-2">Active Days</th>
                <th className="text-right py-2">Daily Rate</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2">RIG-001</td>
                <td className="text-right">30</td>
                <td className="text-right">$10</td>
                <td className="text-right">$300</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2">RIG-002</td>
                <td className="text-right">30</td>
                <td className="text-right">$10</td>
                <td className="text-right">$300</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2">RIG-003</td>
                <td className="text-right">15</td>
                <td className="text-right">$10</td>
                <td className="text-right">$150</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-400">RIG-004 (Inactive)</td>
                <td className="text-right text-slate-400">0</td>
                <td className="text-right text-slate-400">$10</td>
                <td className="text-right text-slate-400">$0</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2">RIG-005</td>
                <td className="text-right">8</td>
                <td className="text-right">$10</td>
                <td className="text-right">$80</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="py-3">Total</td>
                <td className="text-right py-3">83 days</td>
                <td className="text-right py-3"></td>
                <td className="text-right py-3 text-lg">$830</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
