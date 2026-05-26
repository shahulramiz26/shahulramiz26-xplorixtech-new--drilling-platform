'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, TrendingUp, TrendingDown, AlertTriangle, ChevronDown } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ── COLOUR TOKENS ─────────────────────────────────────────────────────────
const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6', teal: '#14B8A6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B',
}

const tooltipStyle = {
  contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 11 },
  labelStyle: { color: C.muted },
}

// ── NAV ───────────────────────────────────────────────────────────────────
function FinanceNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
      {[
        { href: '/admin/finance', label: 'Dashboard' },
        { href: '/admin/finance/costing', label: 'Costing' },
        { href: '/admin/finance/invoicing', label: 'Invoicing' },
        { href: '/admin/finance/reports', label: 'Reports' },
      ].map(t => (
        <Link key={t.href} href={t.href} style={{
          padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
          textDecoration: 'none', transition: 'all 0.2s',
          background: active === t.label ? C.orange : 'transparent',
          color: active === t.label ? '#fff' : C.muted,
        }}>{t.label}</Link>
      ))}
    </div>
  )
}

// ── REAL DATA ─────────────────────────────────────────────────────────────

// Project P&L data
const projectPnL = [
  {
    project: 'RS-01', client: 'CMPDI', meters: 624,
    revenue: 619200, costs: { consumables: 370673, rigOp: 112000, labour: 84000, fuel: 38009, maintenance: 29000 },
    billing: { invoiced: 480000, pending: 139200, overdue: 480000 },
  },
  {
    project: 'CMPDI-DAM', client: 'CMPDI', meters: 412,
    revenue: 356000, costs: { consumables: 185000, rigOp: 90000, labour: 72000, fuel: 32786, maintenance: 18000 },
    billing: { invoiced: 356000, pending: 0, overdue: 0 },
  },
  {
    project: 'CMP-MAD', client: 'CMPDI', meters: 318,
    revenue: 263400, costs: { consumables: 148000, rigOp: 58500, labour: 54000, fuel: 18915, maintenance: 12000 },
    billing: { invoiced: 263400, pending: 0, overdue: 263400 },
  },
  {
    project: 'DGMIL-BHK', client: 'DGML', meters: 280,
    revenue: 238000, costs: { consumables: 124000, rigOp: 54000, labour: 54000, fuel: 17460, maintenance: 9000 },
    billing: { invoiced: 200000, pending: 38000, overdue: 0 },
  },
  {
    project: 'MECL-HIN', client: 'MECL', meters: 220,
    revenue: 218400, costs: { consumables: 98000, rigOp: 57000, labour: 60000, fuel: 15035, maintenance: 11000 },
    billing: { invoiced: 218400, pending: 0, overdue: 0 },
  },
]

// CPM trend data
const cpmTrendData = [
  { month: 'Dec', 'RS-01': 880, 'CMPDI-DAM': 920, 'CMP-MAD': 890 },
  { month: 'Jan', 'RS-01': 910, 'CMPDI-DAM': 950, 'CMP-MAD': 870 },
  { month: 'Feb', 'RS-01': 940, 'CMPDI-DAM': 910, 'CMP-MAD': 920 },
  { month: 'Mar', 'RS-01': 890, 'CMPDI-DAM': 880, 'CMP-MAD': 960 },
  { month: 'Apr', 'RS-01': 970, 'CMPDI-DAM': 900, 'CMP-MAD': 940 },
  { month: 'May', 'RS-01': 1016, 'CMPDI-DAM': 960, 'CMP-MAD': 908 },
]

// Rig performance
const rigPerf = [
  { rig: 'KEM-04', project: 'RS-01',     meters: 198, drillingDays: 22, standbyDays: 3, repairDays: 1, downtime: 2.1, cpm: 886,  efficiency: 96, revenue: 198000, cost: 164000 },
  { rig: 'KEM-05', project: 'RS-01',     meters: 162, drillingDays: 20, standbyDays: 4, repairDays: 2, downtime: 5.4, cpm: 1168, efficiency: 77, revenue: 162000, cost: 189216 },
  { rig: 'KEM-14', project: 'CMPDI-DAM', meters: 220, drillingDays: 24, standbyDays: 2, repairDays: 0, downtime: 1.8, cpm: 910,  efficiency: 93, revenue: 202400, cost: 200200 },
  { rig: 'KEM-13', project: 'CMPDI-DAM', meters: 192, drillingDays: 21, standbyDays: 3, repairDays: 2, downtime: 4.2, cpm: 1025, efficiency: 81, revenue: 176640, cost: 196800 },
  { rig: 'KEM-12', project: 'CMP-MAD',   meters: 318, drillingDays: 24, standbyDays: 1, repairDays: 1, downtime: 2.8, cpm: 908,  efficiency: 91, revenue: 263400, cost: 288415 },
  { rig: 'KEM-11', project: 'DGMIL-BHK', meters: 280, drillingDays: 23, standbyDays: 2, repairDays: 1, downtime: 3.1, cpm: 922,  efficiency: 88, revenue: 238000, cost: 258460 },
  { rig: 'KEM-10', project: 'MECL-HIN',  meters: 220, drillingDays: 22, standbyDays: 2, repairDays: 2, downtime: 3.8, cpm: 1005, efficiency: 85, revenue: 218400, cost: 221100 },
]

// Cash flow data
const cashFlowMonthly = [
  { month: 'Dec', received: 420000, expected: 480000, locked: 85000 },
  { month: 'Jan', received: 510000, expected: 560000, locked: 92000 },
  { month: 'Feb', received: 465000, expected: 530000, locked: 88000 },
  { month: 'Mar', received: 620000, expected: 700000, locked: 110000 },
  { month: 'Apr', received: 890000, expected: 980000, locked: 135000 },
  { month: 'May', received: 350000, expected: 1350000, locked: 148000 },
]

// Locked cash breakdown
const lockedCash = [
  { category: 'Retention (RS-01 — CMPDI)',     amount: 270960, expected: 'Project end ~Dec 2026', color: C.red    },
  { category: 'Retention (CMP-MAD — CMPDI)',   amount: 143170, expected: 'Project end ~Sep 2026', color: C.red    },
  { category: 'Retention (DGMIL-BHK — DGML)',  amount: 29900,  expected: 'Project end ~Aug 2026', color: C.red    },
  { category: 'Overdue Invoice (RS-01)',        amount: 687312, expected: '45+ days overdue',      color: C.orange },
  { category: 'Overdue Invoice (CMP-MAD)',      amount: 292374, expected: '32 days overdue',       color: C.orange },
  { category: 'TDS (Year to Date)',             amount: 62000,  expected: 'Tax filing ~Jul 2026',  color: C.purple },
  { category: 'Security Deposit (RS-01)',       amount: 120000, expected: 'Project completion',    color: C.amber  },
]

// Cost breakdown for pie
const costBreakdown = [
  { name: 'Consumables', value: 925673, color: C.orange },
  { name: 'Rig Operating', value: 371500, color: C.blue  },
  { name: 'Labour',        value: 324000, color: C.green  },
  { name: 'Fuel',          value: 122205, color: C.amber  },
  { name: 'Maintenance',   value: 79000,  color: C.purple },
]

const REPORT_TABS = [
  { id: 'pnl',        label: 'Project P&L',        icon: '📈' },
  { id: 'cpm',        label: 'Cost Per Meter',      icon: '🎯' },
  { id: 'cashflow',   label: 'Cash Flow',           icon: '💰' },
  { id: 'rig',        label: 'Rig Performance',     icon: '🚛' },
]

// ══════════════════════════════════════════════════════════════════════════
// REPORT 1 — PROJECT P&L
// ══════════════════════════════════════════════════════════════════════════
function ProjectPnL() {
  const totalRevenue = projectPnL.reduce((s, p) => s + p.revenue, 0)
  const totalCost    = projectPnL.reduce((s, p) => s + Object.values(p.costs).reduce((a, b) => a + b, 0), 0)
  const totalProfit  = totalRevenue - totalCost

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Revenue',  value: `₹${(totalRevenue/100000).toFixed(1)}L`, color: C.green,  icon: '💰' },
          { label: 'Total Cost',     value: `₹${(totalCost/100000).toFixed(1)}L`,    color: C.red,    icon: '📊' },
          { label: 'Gross Profit',   value: `₹${(totalProfit/100000).toFixed(1)}L`,  color: totalProfit >= 0 ? C.green : C.red, icon: '📈' },
          { label: 'Overall Margin', value: `${((totalProfit/totalRevenue)*100).toFixed(1)}%`, color: totalProfit >= 0 ? C.green : C.red, icon: '🎯' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Revenue vs Cost bar */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Revenue vs Cost by Project — May 2026</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectPnL.map(p => ({ name: p.project, Revenue: p.revenue, Cost: Object.values(p.costs).reduce((a, b) => a + b, 0) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.faint, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => [`₹${(v/100000).toFixed(2)}L`, '']} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
              <Bar dataKey="Revenue" fill={C.green}  radius={[4,4,0,0]} />
              <Bar dataKey="Cost"    fill={C.red}    radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost breakdown donut */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Cost Breakdown</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={3}>
                {costBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: any) => [`₹${(v/100000).toFixed(2)}L`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
            {costBreakdown.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                  <span style={{ color: C.muted }}>{c.name}</span>
                </div>
                <span style={{ color: C.text, fontWeight: 600 }}>₹{(c.value/100000).toFixed(2)}L</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* P&L table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.text }}>
          Project-wise P&L — May 2026
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              {['Project', 'Client', 'Meters', 'Revenue', 'Total Cost', 'Gross Profit', 'Margin', 'Billing Status'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectPnL.map((p, i) => {
              const cost = Object.values(p.costs).reduce((a, b) => a + b, 0)
              const profit = p.revenue - cost
              const margin = ((profit / p.revenue) * 100).toFixed(1)
              const isLoss = profit < 0
              return (
                <tr key={i} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)`, background: isLoss ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{p.project}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', color: C.green, border: '1px solid rgba(16,185,129,0.15)' }}>{p.client}</span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: C.muted }}>{p.meters}m</td>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: C.green, fontFamily: 'monospace' }}>₹{p.revenue.toLocaleString()}</td>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: C.red, fontFamily: 'monospace' }}>₹{cost.toLocaleString()}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: isLoss ? C.red : C.green, fontFamily: 'monospace' }}>
                      {isLoss ? '' : '+'}₹{profit.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: parseFloat(margin) >= 10 ? C.green : parseFloat(margin) >= 0 ? C.amber : C.red }}>
                      {margin}%
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {p.billing.overdue > 0 && <span style={{ color: C.red, fontWeight: 700 }}>⚠ ₹{(p.billing.overdue/100000).toFixed(1)}L overdue</span>}
                      {p.billing.pending > 0 && <span style={{ color: C.amber }}> · ₹{(p.billing.pending/100000).toFixed(1)}L pending</span>}
                      {p.billing.overdue === 0 && p.billing.pending === 0 && <span style={{ color: C.green }}>✅ Fully billed</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              <td colSpan={3} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: C.faint }}>TOTAL — All Projects</td>
              <td style={{ padding: '12px 16px', fontSize: 15, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{totalRevenue.toLocaleString()}</td>
              <td style={{ padding: '12px 16px', fontSize: 15, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>₹{totalCost.toLocaleString()}</td>
              <td style={{ padding: '12px 16px', fontSize: 16, fontWeight: 900, color: totalProfit >= 0 ? C.green : C.red, fontFamily: 'monospace' }}>
                {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString()}
              </td>
              <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: totalProfit >= 0 ? C.green : C.red }}>
                {((totalProfit/totalRevenue)*100).toFixed(1)}%
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// REPORT 2 — COST PER METER
// ══════════════════════════════════════════════════════════════════════════
function CostPerMeter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* CPM legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Below ₹900/m — Excellent', color: C.green,  bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
          { label: '₹900–₹1,100/m — Watch',    color: C.amber,  bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Above ₹1,100/m — Alert',   color: C.red,    bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)'  },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 8, background: l.bg, border: `1px solid ${l.border}` }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* CPM trend chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>CPM Trend — Last 6 Months</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Cost per meter drilled by project</div>
          </div>
          <div style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>— ₹1,100 alert threshold</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cpmTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[700, 1200]} tick={{ fill: C.faint, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => [`₹${v}/m`, '']} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
            <Line type="monotone" dataKey="RS-01"     stroke={C.orange} strokeWidth={2.5} dot={{ fill: C.orange, r: 4 }} />
            <Line type="monotone" dataKey="CMPDI-DAM" stroke={C.blue}   strokeWidth={2.5} dot={{ fill: C.blue, r: 4 }} />
            <Line type="monotone" dataKey="CMP-MAD"   stroke={C.green}  strokeWidth={2.5} dot={{ fill: C.green, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rig-wise CPM table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.text }}>
          Rig-wise Cost Per Meter — May 2026
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              {['Rig', 'Project', 'Meters', 'CPM', 'Status', 'Efficiency', 'Downtime/Shift', 'Contract Rate'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rigPerf.map((r, i) => {
              const cpmColor = r.cpm < 900 ? C.green : r.cpm < 1100 ? C.amber : C.red
              const cpmLabel = r.cpm < 900 ? 'Excellent' : r.cpm < 1100 ? 'Watch' : 'ALERT'
              const contractRate = r.project === 'RS-01' ? 1050 : r.project === 'CMPDI-DAM' ? 1020 : r.project === 'CMP-MAD' ? 1000 : r.project === 'DGMIL-BHK' ? 1000 : 0
              return (
                <tr key={i} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)`, background: r.cpm >= 1100 ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                  <td style={{ padding: '13px 16px', fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{r.rig}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(249,115,22,0.1)', color: C.orange, border: '1px solid rgba(249,115,22,0.2)' }}>{r.project}</span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: C.muted }}>{r.meters}m</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: cpmColor, fontFamily: 'monospace' }}>₹{r.cpm}</div>
                    <div style={{ fontSize: 10, color: cpmColor, marginTop: 1 }}>/meter</div>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      background: r.cpm < 900 ? 'rgba(16,185,129,0.1)' : r.cpm < 1100 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: cpmColor,
                      border: `1px solid ${r.cpm < 900 ? 'rgba(16,185,129,0.2)' : r.cpm < 1100 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>{cpmLabel}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, background: '#1A2234', borderRadius: 3, height: 5 }}>
                        <div style={{ width: `${r.efficiency}%`, height: 5, borderRadius: 3, background: r.efficiency >= 90 ? C.green : r.efficiency >= 80 ? C.amber : C.red }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.efficiency >= 90 ? C.green : r.efficiency >= 80 ? C.amber : C.red }}>{r.efficiency}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: r.downtime > 4 ? C.red : C.muted, fontWeight: r.downtime > 4 ? 700 : 400 }}>
                    {r.downtime}h {r.downtime > 4 && '⚠'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {contractRate > 0 ? (
                      <div>
                        <div style={{ fontSize: 13, color: C.muted }}>₹{contractRate}/m (Band 3)</div>
                        <div style={{ fontSize: 10, color: r.cpm < contractRate ? C.green : C.red, marginTop: 1 }}>
                          {r.cpm < contractRate ? `✅ +₹${contractRate - r.cpm} margin/m` : `❌ −₹${r.cpm - contractRate} loss/m`}
                        </div>
                      </div>
                    ) : <span style={{ fontSize: 12, color: C.faint }}>Day Rate</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// REPORT 3 — CASH FLOW
// ══════════════════════════════════════════════════════════════════════════
function CashFlow() {
  const totalLocked = lockedCash.reduce((s, l) => s + l.amount, 0)
  const totalOverdue = lockedCash.filter(l => l.category.includes('Overdue')).reduce((s, l) => s + l.amount, 0)
  const totalRetention = lockedCash.filter(l => l.category.includes('Retention')).reduce((s, l) => s + l.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Locked Cash',  value: `₹${(totalLocked/100000).toFixed(1)}L`,    color: C.red,    icon: '🔒', note: 'Cannot be spent' },
          { label: 'Overdue Invoices',   value: `₹${(totalOverdue/100000).toFixed(1)}L`,   color: C.orange, icon: '⚠️', note: '2 invoices overdue' },
          { label: 'Retention Held',     value: `₹${(totalRetention/100000).toFixed(1)}L`, color: C.amber,  icon: '⏳', note: 'Released at project end' },
          { label: 'Working Capital Gap',value: `₹${((totalLocked)/100000).toFixed(1)}L`, color: C.purple, icon: '📉', note: 'Finance via overdraft' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{k.note}</div>
          </div>
        ))}
      </div>

      {/* Cash flow chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Monthly Cash Flow — Received vs Expected</div>
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 20 }}>May 2026: large expected gap — RS-01 invoice 45 days overdue</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={cashFlowMonthly}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.faint, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => [`₹${(v/100000).toFixed(2)}L`, '']} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
            <Bar dataKey="received" name="Received"  fill={C.green} radius={[4,4,0,0]} />
            <Bar dataKey="expected" name="Expected"  fill={C.orange} radius={[4,4,0,0]} opacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Locked cash table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Locked Cash Tracker</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>
            ₹{(totalLocked/100000).toFixed(1)}L locked
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {lockedCash.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid rgba(30,41,59,0.4)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: item.color }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.category}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{item.expected}</div>
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: item.color, fontFamily: 'monospace' }}>
                ₹{item.amount.toLocaleString()}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderTop: `2px solid ${C.border}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>TOTAL LOCKED CASH</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>₹{totalLocked.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 30/60/90 day forecast */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Expected Cash In — Next 90 Days</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { period: 'Next 30 Days', amount: 687312, note: 'RS-01 overdue invoice (if paid)', color: C.red },
            { period: 'Next 60 Days', amount: 1273374, note: '+ CMP-MAD + DGMIL-BHK invoices', color: C.amber },
            { period: 'Next 90 Days', amount: 1900000, note: '+ May 2026 invoices all projects', color: C.green },
          ].map((f, i) => (
            <div key={i} style={{ padding: '18px 20px', borderRadius: 14, background: `${f.color}06`, border: `1px solid ${f.color}25` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: f.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{f.period}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: f.color, fontFamily: 'monospace', marginBottom: 6 }}>₹{(f.amount/100000).toFixed(1)}L</div>
              <div style={{ fontSize: 11, color: C.faint }}>{f.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// REPORT 4 — RIG PERFORMANCE
// ══════════════════════════════════════════════════════════════════════════
function RigPerformance() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Rigs Active', value: rigPerf.length, color: C.orange, icon: '🚛' },
          { label: 'Profitable Rigs',   value: rigPerf.filter(r => r.revenue > r.cost).length, color: C.green, icon: '✅' },
          { label: 'Loss-Making Rigs',  value: rigPerf.filter(r => r.revenue <= r.cost).length, color: C.red, icon: '❌' },
          { label: 'Avg Efficiency',    value: `${Math.round(rigPerf.reduce((s, r) => s + r.efficiency, 0) / rigPerf.length)}%`, color: C.amber, icon: '⚡' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Days breakdown chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Day Type Breakdown by Rig — May 2026</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rigPerf.map(r => ({ name: r.rig, Drilling: r.drillingDays, Standby: r.standbyDays, Repair: r.repairDays }))} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: C.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v} days`, '']} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
            <Bar dataKey="Drilling" fill={C.green}  stackId="a" radius={[0,0,0,0]} />
            <Bar dataKey="Standby"  fill={C.amber}  stackId="a" />
            <Bar dataKey="Repair"   fill={C.red}    stackId="a" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rig detail cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {rigPerf.map((r, i) => {
          const profit = r.revenue - r.cost
          const isProfit = profit >= 0
          const cpmColor = r.cpm < 900 ? C.green : r.cpm < 1100 ? C.amber : C.red
          return (
            <div key={i} style={{ background: C.card, border: `1px solid ${isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: 'monospace' }}>{r.rig}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{r.project} · {r.meters}m drilled</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: isProfit ? C.green : C.red, fontFamily: 'monospace' }}>
                    {isProfit ? '+' : ''}₹{profit.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint }}>this month</div>
                </div>
              </div>

              {/* Efficiency bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.faint, marginBottom: 4 }}>
                  <span>Rig Efficiency</span><span>{r.efficiency}%</span>
                </div>
                <div style={{ background: '#1A2234', borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${r.efficiency}%`, height: 6, borderRadius: 4, background: r.efficiency >= 90 ? C.green : r.efficiency >= 80 ? C.amber : C.red, transition: 'width 1s' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[
                  { label: 'CPM',      value: `₹${r.cpm}`, color: cpmColor },
                  { label: 'Downtime', value: `${r.downtime}h`, color: r.downtime > 4 ? C.red : C.muted },
                  { label: 'Revenue',  value: `₹${(r.revenue/100000).toFixed(1)}L`, color: C.green },
                  { label: 'Cost',     value: `₹${(r.cost/100000).toFixed(1)}L`,    color: C.red   },
                ].map((stat, j) => (
                  <div key={j} style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>{stat.value}</div>
                    <div style={{ fontSize: 9, color: C.faint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('pnl')
  const [dateRange, setDateRange] = useState('May 2026')

  const totalRevenue = projectPnL.reduce((s, p) => s + p.revenue, 0)
  const totalCost    = projectPnL.reduce((s, p) => s + Object.values(p.costs).reduce((a, b) => a + b, 0), 0)
  const totalProfit  = totalRevenue - totalCost

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, minHeight: '100vh', background: C.bg }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: '-0.5px' }}>Finance Reports</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>P&L · CPM · Cash Flow · Rig Performance — all in one place</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              style={{ appearance: 'none', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontWeight: 600, padding: '8px 28px 8px 12px', borderRadius: 9, cursor: 'pointer', outline: 'none' }}>
              {['May 2026', 'Apr 2026', 'Q1 2026', 'Last 6 Months'].map(r => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
          <FinanceNav active="Reports" />
        </div>
      </div>

      {/* Top KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {[
          { label: 'Revenue',      value: `₹${(totalRevenue/100000).toFixed(1)}L`, color: C.green,  note: 'All projects' },
          { label: 'Total Cost',   value: `₹${(totalCost/100000).toFixed(1)}L`,    color: C.red,    note: 'All categories' },
          { label: 'Gross Profit', value: `₹${(totalProfit/100000).toFixed(1)}L`,  color: totalProfit >= 0 ? C.green : C.red, note: `${((totalProfit/totalRevenue)*100).toFixed(1)}% margin` },
          { label: 'Avg CPM',      value: `₹${Math.round(rigPerf.reduce((s, r) => s + r.cpm, 0) / rigPerf.length)}/m`, color: C.amber, note: 'Across all rigs' },
          { label: 'Locked Cash',  value: `₹${(lockedCash.reduce((s,l) => s + l.amount, 0)/100000).toFixed(1)}L`, color: C.purple, note: 'Retention + overdue' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '14px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{k.note}</div>
          </div>
        ))}
      </div>

      {/* Report tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {REPORT_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: activeTab === t.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.04)',
            color: activeTab === t.id ? '#fff' : C.muted,
            boxShadow: activeTab === t.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
          }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'pnl'      && <ProjectPnL />}
      {activeTab === 'cpm'      && <CostPerMeter />}
      {activeTab === 'cashflow' && <CashFlow />}
      {activeTab === 'rig'      && <RigPerformance />}

    </div>
  )
}

