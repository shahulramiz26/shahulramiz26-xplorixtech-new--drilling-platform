'use client'

import { useState } from 'react'
import { CreditCard, Download, Calendar, DollarSign, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Mock billing data
const mockInvoices = [
  {
    id: 'INV-2024-001',
    month: 'January 2024',
    totalActiveDays: 83,
    totalAmount: 830.00,
    status: 'PAID',
    paidAt: new Date('2024-02-05'),
    rigs: [
      { name: 'RIG-001', days: 30, amount: 300 },
      { name: 'RIG-002', days: 30, amount: 300 },
      { name: 'RIG-003', days: 15, amount: 150 },
      { name: 'RIG-004', days: 0, amount: 0 },
      { name: 'RIG-005', days: 8, amount: 80 },
    ]
  },
  {
    id: 'INV-2024-002',
    month: 'February 2024',
    totalActiveDays: 95,
    totalAmount: 950.00,
    status: 'PENDING',
    paidAt: null,
    rigs: [
      { name: 'RIG-001', days: 28, amount: 280 },
      { name: 'RIG-002', days: 28, amount: 280 },
      { name: 'RIG-003', days: 20, amount: 200 },
      { name: 'RIG-004', days: 10, amount: 100 },
      { name: 'RIG-005', days: 9, amount: 90 },
    ]
  }
]

export default function BillingPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Billing & Invoices</h1>
        <p className="text-slate-600 mt-1">View and manage your subscription billing</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
            <p className="text-slate-600">Standard Subscription</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">$10<span className="text-lg font-normal text-slate-600">/day per rig</span></p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-600">Included Logins</p>
            <p className="font-medium text-slate-900">1 Admin + 5 Operational</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Billing Cycle</p>
            <p className="font-medium text-slate-900">Monthly</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Payment Method</p>
            <p className="font-medium text-slate-900">•••• 4242 (Visa)</p>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Invoices</h2>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Invoice</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Period</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Active Days</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockInvoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-900">{invoice.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{invoice.month}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{invoice.totalActiveDays} days</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  ${invoice.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.status === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                    >
                      View Details
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedInvoice.id}</h2>
                <p className="text-slate-600">{selectedInvoice.month}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Invoice Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Daily Rate</p>
                  <p className="text-xl font-bold text-slate-900">$10.00</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Total Active Days</p>
                  <p className="text-xl font-bold text-slate-900">{selectedInvoice.totalActiveDays}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-xl font-bold text-slate-900">${selectedInvoice.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Rig Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Rig Breakdown</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-sm font-medium text-slate-700">Rig</th>
                      <th className="text-right py-2 text-sm font-medium text-slate-700">Active Days</th>
                      <th className="text-right py-2 text-sm font-medium text-slate-700">Rate</th>
                      <th className="text-right py-2 text-sm font-medium text-slate-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.rigs.map(rig => (
                      <tr key={rig.name} className="border-b border-slate-100">
                        <td className="py-3 text-slate-900">{rig.name}</td>
                        <td className="text-right py-3 text-slate-600">{rig.days}</td>
                        <td className="text-right py-3 text-slate-600">$10</td>
                        <td className="text-right py-3 font-medium text-slate-900">${rig.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td className="py-4 text-slate-900">Total</td>
                      <td className="text-right py-4 text-slate-900">{selectedInvoice.totalActiveDays} days</td>
                      <td className="py-4"></td>
                      <td className="text-right py-4 text-lg text-slate-900">${selectedInvoice.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    selectedInvoice.status === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                {selectedInvoice.status === 'PAID' && (
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Paid On</p>
                    <p className="font-medium text-slate-900">{formatDate(selectedInvoice.paidAt!)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              {selectedInvoice.status === 'PENDING' && (
                <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
