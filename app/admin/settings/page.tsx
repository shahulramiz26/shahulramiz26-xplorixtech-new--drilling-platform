'use client'

import { useState } from 'react'
import { Save, Bell, Shield, CreditCard } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 bg-[#0A0F1C] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Settings</h1>
        <p className="text-[#94A3B8] mt-1">Manage your company preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Settings */}
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Company Name</label>
              <input
                type="text"
                defaultValue="Apex Drilling Solutions"
                className="w-full px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@apexdrilling.com"
                className="w-full px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC]"
              />
            </div>
          </div>
        </div>

        {/* Shift Settings */}
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Shift Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Default Shift Hours</label>
              <select className="w-full px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC]">
                <option value="12">12 Hours (Standard)</option>
                <option value="10">10 Hours (International)</option>
                <option value="8">8 Hours</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 bg-[#1A2234] border-[#1E293B]" />
              <label className="text-sm text-[#94A3B8]">Enable shift overlap warnings</label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              'Email alerts for maintenance due',
              'Daily summary reports',
              'Billing notifications',
              'Incident reports',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 bg-[#1A2234] border-[#1E293B]" />
                <label className="text-sm text-[#94A3B8]">{item}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password Policy</label>
              <select className="w-full px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC]">
                <option>Standard (8+ chars, 1 uppercase, 1 number)</option>
                <option>Strong (12+ chars, mixed case, numbers, symbols)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 bg-[#1A2234] border-[#1E293B]" />
              <label className="text-sm text-[#94A3B8]">Require password change every 90 days</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 bg-[#1A2234] border-[#1E293B]" />
              <label className="text-sm text-[#94A3B8]">Enable two-factor authentication</label>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Billing Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Daily Rate per Rig</label>
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8]">$</span>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-32 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Billing Cycle</label>
              <select className="w-full px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC]">
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
