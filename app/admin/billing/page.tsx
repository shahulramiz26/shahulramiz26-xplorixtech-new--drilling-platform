'use client'

import { motion } from 'framer-motion'
import { CreditCard, Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const billingInfo = {
  plan: 'Standard Subscription',
  rate: '$10/day per rig',
  includedLogins: '1 Admin + 5 Operational',
  billingCycle: 'Monthly',
  paymentMethod: '•••• 4242 (Visa)'
}

const invoices = [
  {
    id: 'INV-2024-001',
    period: 'January 2024',
    activeDays: '83 days',
    amount: '$830.00',
    status: 'PAID'
  },
  {
    id: 'INV-2024-002',
    period: 'February 2024',
    activeDays: '95 days',
    amount: '$950.00',
    status: 'PENDING'
  }
]

export default function BillingPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Billing & Subscription</h1>
        <p className="text-[#94A3B8] mt-2">Manage your subscription, view invoices, and update payment methods</p>
      </div>

      {/* Current Plan */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#F8FAFC]">Current Plan</h2>
            <p className="text-[#94A3B8]">{billingInfo.plan}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#F8FAFC]">{billingInfo.rate}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[#1E293B]">
          <div>
            <p className="text-sm text-[#64748B]">Included Logins</p>
            <p className="text-[#F8FAFC] font-medium">{billingInfo.includedLogins}</p>
          </div>
          <div>
            <p className="text-sm text-[#64748B]">Billing Cycle</p>
            <p className="text-[#F8FAFC] font-medium">{billingInfo.billingCycle}</p>
          </div>
          <div>
            <p className="text-sm text-[#64748B]">Payment Method</p>
            <p className="text-[#F8FAFC] font-medium">{billingInfo.paymentMethod}</p>
          </div>
        </div>
      </motion.div>

      {/* Invoices */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6">Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="pb-4">Invoice</th>
                <th className="pb-4">Period</th>
                <th className="pb-4">Active Days</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-[#1A2234]/50 transition">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <span className="font-medium text-[#F8FAFC]">{invoice.id}</span>
                    </div>
                  </td>
                  <td className="py-4 text-[#94A3B8]">{invoice.period}</td>
                  <td className="py-4 text-[#94A3B8]">{invoice.activeDays}</td>
                  <td className="py-4 font-semibold text-[#F8FAFC]">{invoice.amount}</td>
                  <td className="py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'PAID' 
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium">
                        View Details
                      </button>
                      <button className="p-2 text-[#64748B] hover:text-[#F8FAFC] transition">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
