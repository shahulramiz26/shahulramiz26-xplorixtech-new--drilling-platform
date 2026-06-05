"use client";
import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, User, Brain, Activity, Clock, Package,
  DollarSign, Zap, BarChart3, CheckCircle, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, FileText, Printer,
  Download, AlertTriangle, ShieldAlert, Wrench, HardHat,
  TrendingUp, Calendar, ChevronDown
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const RIGS = ["RIG-01", "RIG-02", "RIG-03", "RIG-04", "RIG-05"];
const PROJECTS = ["Project Alpha", "Project Beta", "Project Gamma", "Project Delta"];

const DRILLERS: Record<string, any> = {
  "RIG-01": { name: "Ravi Kumar",      meters: 4500, efficiency: 94, incidents: 0, shifts: 22 },
  "RIG-02": { name: "Mohammed Salim",  meters: 3050, efficiency: 71, incidents: 2, shifts: 20 },
  "RIG-03": { name: "Arun Patel",      meters: 5200, efficiency: 98, incidents: 0, shifts: 24 },
  "RIG-04": { name: "Suresh Nair",     meters: 3700, efficiency: 83, incidents: 1, shifts: 21 },
  "RIG-05": { name: "Deepak Singh",    meters: 4800, efficiency: 92, incidents: 0, shifts: 23 },
};

const BIT_DATA: Record<string, any> = {
  "RIG-01": { type: "PDC 8.5\"",   hoursUsed: 47, lifespan: 60, daysToReplace: 13 },
  "RIG-02": { type: "Tricone 9\"", hoursUsed: 62, lifespan: 65, daysToReplace: 3  },
  "RIG-03": { type: "PDC 8.5\"",   hoursUsed: 21, lifespan: 60, daysToReplace: 39 },
  "RIG-04": { type: "PDC 9\"",     hoursUsed: 44, lifespan: 60, daysToReplace: 16 },
  "RIG-05": { type: "Tricone 8\"", hoursUsed: 38, lifespan: 65, daysToReplace: 27 },
};

const MAINTENANCE_DATA: Record<string, any> = {
  "RIG-01": { lastService: "3 days ago",  nextDueIn: 11, status: "OK"      },
  "RIG-02": { lastService: "17 days ago", nextDueIn: -2, status: "OVERDUE" },
  "RIG-03": { lastService: "1 day ago",   nextDueIn: 14, status: "OK"      },
  "RIG-04": { lastService: "8 days ago",  nextDueIn: 6,  status: "SOON"    },
  "RIG-05": { lastService: "5 days ago",  nextDueIn: 9,  status: "OK"      },
};

const RIG_DATA: Record<string, Record<string, any>> = {
  "RIG-01": {
    metersPerDay: 142, downtime: 3.2, rop: 18.4, inventory: 24, cost: 1240,
    bits: 2, incidents: 0, efficiency: 94, revenue: 18.4 * 142 * 5.2,
    history: [
      { month: "Jan", meters: 3800, downtime: 12, rop: 16.2, cost: 34720, revenue: 42560 },
      { month: "Feb", meters: 4100, downtime: 9,  rop: 17.1, cost: 34720, revenue: 45920 },
      { month: "Mar", meters: 4300, downtime: 8,  rop: 17.9, cost: 34720, revenue: 48160 },
      { month: "Apr", meters: 4200, downtime: 10, rop: 17.5, cost: 34720, revenue: 47040 },
      { month: "May", meters: 4500, downtime: 7,  rop: 18.4, cost: 34720, revenue: 50400 },
    ],
  },
  "RIG-02": {
    metersPerDay: 98, downtime: 8.6, rop: 14.1, inventory: 41, cost: 1680,
    bits: 4, incidents: 2, efficiency: 71, revenue: 14.1 * 98 * 5.2,
    history: [
      { month: "Jan", meters: 2900, downtime: 22, rop: 12.1, cost: 47040, revenue: 32480 },
      { month: "Feb", meters: 3100, downtime: 19, rop: 12.9, cost: 47040, revenue: 34720 },
      { month: "Mar", meters: 2800, downtime: 24, rop: 11.7, cost: 47040, revenue: 31360 },
      { month: "Apr", meters: 3200, downtime: 18, rop: 13.3, cost: 47040, revenue: 35840 },
      { month: "May", meters: 3050, downtime: 26, rop: 14.1, cost: 47040, revenue: 34160 },
    ],
  },
  "RIG-03": {
    metersPerDay: 168, downtime: 1.8, rop: 21.7, inventory: 18, cost: 1080,
    bits: 1, incidents: 0, efficiency: 98, revenue: 21.7 * 168 * 5.2,
    history: [
      { month: "Jan", meters: 4600, downtime: 6, rop: 19.2, cost: 30240, revenue: 51520 },
      { month: "Feb", meters: 4800, downtime: 5, rop: 20.0, cost: 30240, revenue: 53760 },
      { month: "Mar", meters: 5000, downtime: 4, rop: 20.8, cost: 30240, revenue: 56000 },
      { month: "Apr", meters: 5100, downtime: 4, rop: 21.3, cost: 30240, revenue: 57120 },
      { month: "May", meters: 5200, downtime: 5, rop: 21.7, cost: 30240, revenue: 58240 },
    ],
  },
  "RIG-04": {
    metersPerDay: 120, downtime: 5.1, rop: 16.8, inventory: 30, cost: 1400,
    bits: 2, incidents: 1, efficiency: 83, revenue: 16.8 * 120 * 5.2,
    history: [
      { month: "Jan", meters: 3200, downtime: 15, rop: 14.1, cost: 39200, revenue: 35840 },
      { month: "Feb", meters: 3400, downtime: 13, rop: 14.8, cost: 39200, revenue: 38080 },
      { month: "Mar", meters: 3600, downtime: 12, rop: 15.5, cost: 39200, revenue: 40320 },
      { month: "Apr", meters: 3500, downtime: 14, rop: 16.0, cost: 39200, revenue: 39200 },
      { month: "May", meters: 3700, downtime: 15, rop: 16.8, cost: 39200, revenue: 41440 },
    ],
  },
  "RIG-05": {
    metersPerDay: 155, downtime: 2.4, rop: 20.1, inventory: 21, cost: 1150,
    bits: 1, incidents: 0, efficiency: 92, revenue: 20.1 * 155 * 5.2,
    history: [
      { month: "Jan", meters: 4200, downtime: 8, rop: 18.1, cost: 32200, revenue: 47040 },
      { month: "Feb", meters: 4400, downtime: 7, rop: 18.9, cost: 32200, revenue: 49280 },
      { month: "Mar", meters: 4600, downtime: 7, rop: 19.4, cost: 32200, revenue: 51520 },
      { month: "Apr", meters: 4700, downtime: 6, rop: 19.8, cost: 32200, revenue: 52640 },
      { month: "May", meters: 4800, downtime: 7, rop: 20.1, cost: 32200, revenue: 53760 },
    ],
  },
};

const PROJECT_RIGS: Record<string, string[]> = {
  "Project Alpha":  ["RIG-01", "RIG-03"],
  "Project Beta":   ["RIG-02"],
  "Project Gamma":  ["RIG-04", "RIG-05"],
  "Project Delta":  ["RIG-01", "RIG-02", "RIG-05"],
};

function getProjectData(projectKey: string) {
  const rigs = PROJECT_RIGS[projectKey] || ["RIG-01"];
  const all = rigs.map(r => RIG_DATA[r]);
  const avg = (fn: (d: any) => number) => +(all.reduce((s, d) => s + fn(d), 0) / all.length).toFixed(1);
  const sum = (fn: (d: any) => number) => all.reduce((s, d) => s + fn(d), 0);
  const months = all[0].history.map((_: any, i: number) => ({
    month: all[0].history[i].month,
    meters: sum(d => d.history[i].meters),
    downtime: +avg(d => d.history[i].downtime).toFixed(1),
    rop: +avg(d => d.history[i].rop).toFixed(1),
    cost: sum(d => d.history[i].cost),
    revenue: sum(d => d.history[i].revenue),
  }));
  return {
    rigs, metersPerDay: sum(d => d.metersPerDay),
    downtime: +avg(d => d.downtime).toFixed(1),
    rop: +avg(d => d.rop).toFixed(1),
    inventory: sum(d => d.inventory), cost: sum(d => d.cost),
    bits: sum(d => d.bits), incidents: sum(d => d.incidents),
    efficiency: +avg(d => d.efficiency).toFixed(0),
    revenue: sum(d => d.revenue), history: months,
  };
}

function generatePrediction(projectKey: string) {
  const d = getProjectData(projectKey);
  const hist = d.history;
  const last = hist[hist.length - 1];
  const prev = hist[hist.length - 2];
  const ropTrend = last.rop - prev.rop;
  const metersTrend = last.meters - prev.meters;
  const downtimeTrend = last.downtime - prev.downtime;
  const revenueTrend = last.revenue - prev.revenue;
  return {
    nextMonth: {
      rop: +(last.rop + ropTrend * 0.8).toFixed(1),
      meters: Math.round(last.meters + metersTrend * 0.7),
      downtime: Math.max(1, +(last.downtime + downtimeTrend * 0.6).toFixed(1)),
      cost: Math.round(d.cost * (1 + (ropTrend > 0 ? -0.02 : 0.03))),
      inventory: Math.round(d.inventory * (1 + (ropTrend > 0 ? -0.05 : 0.05))),
      revenue: Math.round(last.revenue + revenueTrend * 0.7),
    },
    chart: [
      ...hist,
      {
        month: "Jun (Pred)",
        meters: Math.round(last.meters + metersTrend * 0.7),
        downtime: Math.max(1, +(last.downtime + downtimeTrend * 0.6).toFixed(1)),
        rop: +(last.rop + ropTrend * 0.8).toFixed(1),
        cost: Math.round(d.cost * (1 + (ropTrend > 0 ? -0.02 : 0.03))),
        revenue: Math.round(last.revenue + revenueTrend * 0.7),
        predicted: true,
      },
    ],
  };
}

// ─────────────────────────────────────────────
// CHAT ENGINE — UPGRADED
// ─────────────────────────────────────────────
function formatDateRange(date: string) {
  const [from, to] = date.split("|");
  if (from && to) return `${from} → ${to}`;
  if (from) return `From ${from}`;
  return "This Period";
}

function processChat(input: string, filters: { rig1: string; rig2: string; project: string; date: string }) {
  const lower = input.toLowerCase();
  const r1 = filters.rig1;
  const r2 = filters.rig2;
  const d1 = RIG_DATA[r1];
  const d2 = RIG_DATA[r2];
  const dateLabel = formatDateRange(filters.date);

  // COMPARE
  if (lower.includes("compar") || (r2 && r2 !== "" && lower.includes("vs"))) {
    return { type: "compare", data: { r1, r2, d1, d2 }, text: `Here's a side-by-side comparison of **${r1}** vs **${r2}** (${dateLabel}):` };
  }
  // DRILLER PERFORMANCE
  if (lower.includes("driller") || lower.includes("best driller") || lower.includes("operator") || lower.includes("crew") || lower.includes("who is best") || lower.includes("performer")) {
    const allDrillers = RIGS.map(r => ({ rig: r, ...DRILLERS[r] })).sort((a, b) => b.efficiency - a.efficiency);
    const top = allDrillers[0];
    return {
      type: "text",
      text: `👷 **Driller Performance — This Month**\n\n🏆 Best Driller: **${top.name}** (${top.rig})\nEfficiency: **${top.efficiency}%** | Meters: **${top.meters.toLocaleString()} m** | Incidents: **${top.incidents}**\n\n📊 Full Rankings:\n1. ${allDrillers[0].name} (${allDrillers[0].rig}) — ${allDrillers[0].efficiency}%\n2. ${allDrillers[1].name} (${allDrillers[1].rig}) — ${allDrillers[1].efficiency}%\n3. ${allDrillers[2].name} (${allDrillers[2].rig}) — ${allDrillers[2].efficiency}%\n4. ${allDrillers[3].name} (${allDrillers[3].rig}) — ${allDrillers[3].efficiency}%\n5. ${allDrillers[4].name} (${allDrillers[4].rig}) — ${allDrillers[4].efficiency}%`,
    };
  }
  // SAFETY / INCIDENTS
  if (lower.includes("incident") || lower.includes("safety") || lower.includes("hse") || lower.includes("accident") || lower.includes("hazard")) {
    const d = RIG_DATA[r1];
    return {
      type: "text",
      text: `🦺 **Safety Report — ${r1}** (${dateLabel})\n\nIncidents logged: **${d.incidents}**\nSeverity: ${d.incidents === 0 ? "**None — Clean record ✅**" : d.incidents <= 1 ? "**Minor 🟡**" : "**High — Review required 🔴**"}\n\nFleet-wide incidents this period:\n• RIG-01: ${RIG_DATA["RIG-01"].incidents} incidents ✅\n• RIG-02: ${RIG_DATA["RIG-02"].incidents} incidents 🔴\n• RIG-03: ${RIG_DATA["RIG-03"].incidents} incidents ✅\n• RIG-04: ${RIG_DATA["RIG-04"].incidents} incidents 🟡\n• RIG-05: ${RIG_DATA["RIG-05"].incidents} incidents ✅\n\n${d.incidents > 0 ? "⚠️ Recommend immediate HSE debrief and corrective action report." : "✅ Safety performance is excellent. Continue current safety protocols."}`,
    };
  }
  // BIT LIFE
  if (lower.includes("bit") && !lower.includes("inventory")) {
    const bit = BIT_DATA[r1];
    const pct = Math.round((bit.hoursUsed / bit.lifespan) * 100);
    return {
      type: "text",
      text: `🔩 **Bit Life Status — ${r1}**\n\nBit type: **${bit.type}**\nHours used: **${bit.hoursUsed} / ${bit.lifespan} hrs** (${pct}% worn)\nEstimated days to replace: **${bit.daysToReplace} days**\n\n${bit.daysToReplace <= 5 ? "🔴 CRITICAL — Replace bit immediately!" : bit.daysToReplace <= 14 ? "🟡 WARNING — Plan bit replacement soon." : "✅ Bit life is healthy. No action needed."}\n\nFleet bit status:\n• RIG-01: ${BIT_DATA["RIG-01"].daysToReplace}d remaining\n• RIG-02: ${BIT_DATA["RIG-02"].daysToReplace}d remaining ⚠️\n• RIG-03: ${BIT_DATA["RIG-03"].daysToReplace}d remaining\n• RIG-04: ${BIT_DATA["RIG-04"].daysToReplace}d remaining\n• RIG-05: ${BIT_DATA["RIG-05"].daysToReplace}d remaining`,
    };
  }
  // MAINTENANCE
  if (lower.includes("mainten") || lower.includes("service") || lower.includes("repair")) {
    const m = MAINTENANCE_DATA[r1];
    return {
      type: "text",
      text: `🔧 **Maintenance Status — ${r1}**\n\nLast service: **${m.lastService}**\nNext service in: **${m.nextDueIn < 0 ? `OVERDUE by ${Math.abs(m.nextDueIn)} days 🔴` : `${m.nextDueIn} days`}**\nStatus: **${m.status === "OK" ? "✅ On Schedule" : m.status === "OVERDUE" ? "🔴 OVERDUE" : "🟡 Due Soon"}**\n\nFleet maintenance overview:\n• RIG-01: ✅ Due in ${MAINTENANCE_DATA["RIG-01"].nextDueIn}d\n• RIG-02: 🔴 OVERDUE by ${Math.abs(MAINTENANCE_DATA["RIG-02"].nextDueIn)}d\n• RIG-03: ✅ Due in ${MAINTENANCE_DATA["RIG-03"].nextDueIn}d\n• RIG-04: 🟡 Due in ${MAINTENANCE_DATA["RIG-04"].nextDueIn}d\n• RIG-05: ✅ Due in ${MAINTENANCE_DATA["RIG-05"].nextDueIn}d`,
    };
  }
  // LAST WEEK / RECENT
  if (lower.includes("last week") || lower.includes("recent") || lower.includes("what happened")) {
    return {
      type: "text",
      text: `📅 **Last Week Summary — ${filters.project}**\n\nRigs active: **${PROJECT_RIGS[filters.project]?.join(", ")}**\nTotal meters drilled: **${(getProjectData(filters.project).metersPerDay * 7).toLocaleString()} m**\nAvg ROP: **${getProjectData(filters.project).rop} m/hr**\nDowntime events: **${getProjectData(filters.project).incidents + 2}**\nBit changes: **${getProjectData(filters.project).bits}**\n\n${getProjectData(filters.project).efficiency > 85 ? "✅ Strong week — all targets met." : "🟡 Moderate week — some delays recorded."}`,
    };
  }
  // METERS
  if (lower.includes("meter") || lower.includes("drilled") || lower.includes("footage")) {
    return { type: "text", text: `📏 **Drilling Meters — ${r1}** (${dateLabel})\n\nDaily average: **${d1.metersPerDay} m/day**\nPeriod total: **~${(d1.metersPerDay * 28).toLocaleString()} m**\nROP: **${d1.rop} m/hr**\n\n${d1.metersPerDay > 140 ? "✅ Above fleet average — excellent." : d1.metersPerDay > 110 ? "🟡 Near fleet average." : "🔴 Below fleet average."}` };
  }
  // DOWNTIME
  if (lower.includes("downtime") || lower.includes("idle") || lower.includes("delay") || lower.includes("stopped")) {
    return { type: "text", text: `⏱️ **Downtime Report — ${r1}** (${dateLabel})\n\nAvg daily downtime: **${d1.downtime} hrs**\nEfficiency: **${d1.efficiency}%**\nIncidents: **${d1.incidents}**\n\n${d1.downtime < 3 ? "✅ Minimal downtime — excellent." : d1.downtime < 6 ? "🟡 Moderate downtime. Monitor closely." : "🔴 High downtime! Maintenance review needed."}` };
  }
  // INVENTORY
  if (lower.includes("inventor") || lower.includes("material") || lower.includes("consumable") || lower.includes("supply")) {
    return { type: "text", text: `📦 **Inventory — ${r1}** (${dateLabel})\n\nItems consumed: **${d1.inventory} units**\nBits used: **${d1.bits}**\nCost: **$${(d1.inventory * 42).toLocaleString()}**\n\n${d1.bits > 3 ? "⚠️ High bit consumption — check WOB settings." : "✅ Consumption within normal range."}` };
  }
  // COST
  if (lower.includes("cost") || lower.includes("money") || lower.includes("bill") || lower.includes("expense") || lower.includes("financ")) {
    return { type: "text", text: `💰 **Cost Report — ${r1}** (${dateLabel})\n\nDaily cost: **$${d1.cost.toLocaleString()}**\nMonthly: **$${(d1.cost * 28).toLocaleString()}**\nCost/meter: **$${(d1.cost / d1.metersPerDay).toFixed(2)}/m**\nRevenue/month: **$${Math.round(d1.revenue * 28).toLocaleString()}**\nProfit margin: **${Math.round(((d1.revenue * 28 - d1.cost * 28) / (d1.revenue * 28)) * 100)}%**` };
  }
  // ROP
  if (lower.includes("rop") || lower.includes("penetration") || lower.includes("speed") || lower.includes("rate")) {
    return { type: "text", text: `⚡ **ROP — ${r1}** (${dateLabel})\n\nCurrent ROP: **${d1.rop} m/hr**\nEfficiency: **${d1.efficiency}%**\n\n${d1.rop > 19 ? "🏆 Top performer." : d1.rop > 16 ? "✅ Good ROP." : "🔴 Low ROP. Review bit type, WOB, RPM."}` };
  }
  // SUMMARY
  if (lower.includes("summary") || lower.includes("overview") || lower.includes("all") || lower.includes("everything")) {
    return { type: "text", text: `📋 **Full Summary — ${r1}** (${filters.project}, ${dateLabel})\n\n📏 Meters/day: **${d1.metersPerDay} m**\n⚡ ROP: **${d1.rop} m/hr**\n⏱️ Downtime: **${d1.downtime} hrs/day**\n📦 Inventory: **${d1.inventory} units**\n💰 Daily cost: **$${d1.cost.toLocaleString()}**\n💵 Revenue: **$${Math.round(d1.revenue).toLocaleString()}/day**\n🔩 Bits: **${d1.bits}** | 🦺 Incidents: **${d1.incidents}**\n✅ Efficiency: **${d1.efficiency}%**\n\n${d1.efficiency > 90 ? "🟢 EXCELLENT operation." : d1.efficiency > 78 ? "🟡 GOOD — minor improvements possible." : "🔴 NEEDS ATTENTION."}` };
  }
  return { type: "text", text: `🤖 Try asking:\n\n• "Who is the best driller?"\n• "Any incidents on RIG-02?"\n• "Which bit needs replacement?"\n• "Maintenance status RIG-03"\n• "What happened last week on Alpha?"\n• "Compare RIG-01 vs RIG-02"\n• "Full summary RIG-01"\n• "Cost breakdown RIG-03"` };
}

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────
const TOOLTIP_STYLE = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" && p.value > 1000 ? "$" + p.value.toLocaleString() : p.value}</strong></p>
      ))}
    </div>
  );
};

function CompareTable({ r1, r2, d1, d2 }: any) {
  const rows = [
    { label: "Meters/Day", key: "metersPerDay", unit: "m", better: "higher" },
    { label: "ROP", key: "rop", unit: "m/hr", better: "higher" },
    { label: "Daily Downtime", key: "downtime", unit: "hrs", better: "lower" },
    { label: "Efficiency", key: "efficiency", unit: "%", better: "higher" },
    { label: "Inventory Used", key: "inventory", unit: "units", better: "lower" },
    { label: "Daily Cost", key: "cost", unit: "$", better: "lower" },
    { label: "Incidents", key: "incidents", unit: "", better: "lower" },
  ];
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-gray-700">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-800">
          <th className="px-4 py-2 text-left text-gray-400 font-medium">Metric</th>
          <th className="px-4 py-2 text-center text-orange-400 font-bold">{r1}</th>
          <th className="px-4 py-2 text-center text-blue-400 font-bold">{r2}</th>
          <th className="px-4 py-2 text-center text-gray-400 font-medium">Winner</th>
        </tr></thead>
        <tbody>
          {rows.map((row, i) => {
            const v1 = d1[row.key]; const v2 = d2[row.key];
            const winner = row.better === "higher" ? (v1 > v2 ? r1 : v2 > v1 ? r2 : "Tie") : (v1 < v2 ? r1 : v2 < v1 ? r2 : "Tie");
            return (
              <tr key={i} className={`border-t border-gray-800 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}`}>
                <td className="px-4 py-2 text-gray-300">{row.label}</td>
                <td className={`px-4 py-2 text-center font-semibold ${winner === r1 ? "text-green-400" : "text-gray-300"}`}>{row.unit === "$" ? "$" : ""}{typeof v1 === "number" ? v1.toLocaleString() : v1}{row.unit !== "$" ? " " + row.unit : ""}</td>
                <td className={`px-4 py-2 text-center font-semibold ${winner === r2 ? "text-green-400" : "text-gray-300"}`}>{row.unit === "$" ? "$" : ""}{typeof v2 === "number" ? v2.toLocaleString() : v2}{row.unit !== "$" ? " " + row.unit : ""}</td>
                <td className="px-4 py-2 text-center">{winner === "Tie" ? <span className="text-gray-500 text-xs">—</span> : <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">{winner}</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RenderMessage({ text }: { text: string }) {
  return (
    <div className="space-y-0.5">
      {text.split("\n").map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="leading-relaxed text-sm">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-orange-300">{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 1 — AI CHAT
// ─────────────────────────────────────────────
type Msg = { role: "user" | "assistant"; content: string; extra?: any; timestamp: Date };

function AIChatTab() {
  const [rig1, setRig1] = useState("RIG-01");
  const [rig2, setRig2] = useState("None");
  const [project, setProject] = useState("Project Alpha");
  const [date, setDate] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{
    role: "assistant",
    content: "👋 Welcome to **XPLORIX Intelligence Chat**!\n\nI now understand more questions. Try:\n\n• \"Who is the best driller this month?\"\n• \"Any incidents on RIG-02?\"\n• \"Which bit needs replacement soon?\"\n• \"Maintenance status RIG-03\"\n• \"What happened last week on Alpha?\"\n• \"Compare RIG-01 vs RIG-02\"",
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const QUICK = ["Best driller?", "Incidents on RIG-02", "Bit replacement status", "Maintenance overview", "Full summary", "Compare rigs"];

  function send(text?: string) {
    const q = text ?? input;
    if (!q.trim() || typing) return;
    const userMsg: Msg = { role: "user", content: q, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const result = processChat(q, { rig1, rig2: rig2 === "None" ? "" : rig2, project, date });
      setMessages(p => [...p, { role: "assistant", content: result.text, extra: result, timestamp: new Date() }]);
      setTyping(false);
    }, 700 + Math.random() * 400);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Primary Rig", value: rig1, onChange: setRig1, options: RIGS },
          { label: "Compare With", value: rig2, onChange: setRig2, options: ["None", ...RIGS] },
          { label: "Project", value: project, onChange: setProject, options: PROJECTS },
        ].map(({ label, value, onChange, options }) => (
          <div key={label}>
            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500">
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs text-gray-500 mb-1 block">Date Range</label>
          <div className="flex items-center gap-1.5">
            <input type="date" value={date.split("|")[0] || ""} onChange={e => setDate(e.target.value + "|" + (date.split("|")[1] || ""))} className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-2 outline-none focus:border-orange-500" />
            <span className="text-gray-600 text-xs shrink-0">to</span>
            <input type="date" value={date.split("|")[1] || ""} onChange={e => setDate((date.split("|")[0] || "") + "|" + e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-2 outline-none focus:border-orange-500" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500/50 text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-all">{q}</button>
        ))}
      </div>
      <div className="overflow-y-auto space-y-4 pr-1" style={{ maxHeight: "420px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "assistant" ? "bg-orange-500/20 border border-orange-500/30" : "bg-gray-700 border border-gray-600"}`}>
              {msg.role === "assistant" ? <Bot size={14} className="text-orange-400" /> : <User size={14} className="text-gray-300" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-orange-500 text-white rounded-tr-sm" : "bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm"}`}>
              <RenderMessage text={msg.content} />
              {msg.extra?.type === "compare" && msg.extra.data && <CompareTable {...msg.extra.data} />}
              <p className={`text-xs mt-2 ${msg.role === "user" ? "text-orange-200" : "text-gray-600"}`}>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0"><Bot size={14} className="text-orange-400" /></div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 bg-gray-800 border border-gray-700 focus-within:border-orange-500/60 rounded-xl px-3 py-2 transition-colors">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={`Ask about ${rig1}${rig2 !== "None" ? " vs " + rig2 : ""}...`} className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none" />
        <button onClick={() => send()} disabled={!input.trim() || typing} className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors shrink-0"><Send size={14} /></button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 2 — AI PREDICTION (UPGRADED)
// ─────────────────────────────────────────────
function AIPredictionTab() {
  const [selectedProject, setSelectedProject] = useState("Project Alpha");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const pred = generatePrediction(selectedProject);
  const current = getProjectData(selectedProject);

  function runPrediction() { setLoading(true); setGenerated(false); setTimeout(() => { setLoading(false); setGenerated(true); }, 1800); }

  const riskLevel = (rig: string) => {
    const d = RIG_DATA[rig]; const m = MAINTENANCE_DATA[rig]; const b = BIT_DATA[rig];
    const score = (d.downtime > 6 ? 2 : d.downtime > 3 ? 1 : 0) + (m.status === "OVERDUE" ? 2 : m.status === "SOON" ? 1 : 0) + (b.daysToReplace <= 5 ? 2 : b.daysToReplace <= 14 ? 1 : 0) + (d.incidents > 1 ? 2 : d.incidents > 0 ? 1 : 0);
    return score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW";
  };

  const cards = [
    { label: "Predicted ROP", icon: Activity, current: current.rop + " m/hr", predicted: pred.nextMonth.rop + " m/hr", delta: +(pred.nextMonth.rop - current.rop).toFixed(1), color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Total Meters", icon: BarChart3, current: (current.metersPerDay * 28).toLocaleString() + " m", predicted: pred.nextMonth.meters.toLocaleString() + " m", delta: pred.nextMonth.meters - current.metersPerDay * 28, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Avg Downtime", icon: Clock, current: current.downtime + " hrs/day", predicted: pred.nextMonth.downtime + " hrs/day", delta: +(pred.nextMonth.downtime - current.downtime).toFixed(1), lowerBetter: true, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "Inventory", icon: Package, current: current.inventory + " units", predicted: pred.nextMonth.inventory + " units", delta: pred.nextMonth.inventory - current.inventory, lowerBetter: true, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Cost Projection", icon: DollarSign, current: "$" + current.cost.toLocaleString() + "/day", predicted: "$" + pred.nextMonth.cost.toLocaleString() + "/day", delta: pred.nextMonth.cost - current.cost, lowerBetter: true, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Revenue Forecast", icon: TrendingUp, current: "$" + Math.round(current.history[current.history.length-1].revenue).toLocaleString(), predicted: "$" + pred.nextMonth.revenue.toLocaleString(), delta: pred.nextMonth.revenue - current.history[current.history.length-1].revenue, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Fleet Efficiency", icon: Zap, current: current.efficiency + "%", predicted: Math.min(100, +current.efficiency + (pred.nextMonth.rop > current.rop ? 2 : -1)) + "%", delta: pred.nextMonth.rop > current.rop ? 2 : -1, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Select Project to Predict</label>
          <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setGenerated(false); }} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500 min-w-[180px]">
            {PROJECTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PROJECT_RIGS[selectedProject]?.map(r => <span key={r} className="text-xs bg-gray-800 border border-gray-700 text-orange-300 px-2 py-1 rounded-full">{r}</span>)}
          <span className="text-xs text-gray-600">active on this project</span>
        </div>
        <button onClick={runPrediction} disabled={loading} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors ml-auto">
          {loading ? <RefreshCw size={15} className="animate-spin" /> : <Brain size={15} />}
          {loading ? "Analyzing..." : "Run AI Prediction"}
        </button>
        {generated && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle size={15} /> Ready</span>}
      </div>

      {!generated && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 py-16 flex flex-col items-center gap-3 text-center">
          <Brain size={40} className="text-gray-600" />
          <p className="text-gray-400 font-medium">Select a project and click <strong className="text-orange-400">Run AI Prediction</strong></p>
          <p className="text-gray-600 text-sm">Forecasts ROP, meters, downtime, revenue, risk levels & maintenance alerts</p>
        </div>
      )}
      {loading && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 py-16 flex flex-col items-center gap-4">
          <div className="relative"><Brain size={40} className="text-orange-400 animate-pulse" /><div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping" /></div>
          <p className="text-gray-300 font-medium">Analysing <strong className="text-orange-400">{selectedProject}</strong>...</p>
        </div>
      )}

      {generated && (
        <>
          {/* Prediction cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cards.map(({ label, icon: Icon, current: cur, predicted, delta, lowerBetter, color, bg }) => {
              const isGood = lowerBetter ? delta <= 0 : delta >= 0;
              const DI = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
              return (
                <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                  <div className="flex items-center gap-2 mb-3"><Icon size={15} className={color} /><span className="text-xs text-gray-400 font-medium">{label}</span></div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Current</span><span className="text-xs text-gray-300">{cur}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-400 font-semibold">Predicted</span><span className={`text-sm font-bold ${color}`}>{predicted}</span></div>
                    <div className={`flex items-center gap-1 mt-1 ${isGood ? "text-green-400" : "text-red-400"}`}>
                      <DI size={12} /><span className="text-xs font-medium">{delta > 0 ? "+" : ""}{Math.abs(delta) > 1000 ? "$" + Math.abs(delta).toLocaleString() : delta} {isGood ? "↑" : "↓"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk Alerts */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><ShieldAlert size={15} className="text-red-400" /> Risk Alerts — Next Month</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PROJECT_RIGS[selectedProject]?.map(rig => {
                const risk = riskLevel(rig);
                const m = MAINTENANCE_DATA[rig]; const b = BIT_DATA[rig];
                return (
                  <div key={rig} className={`rounded-xl border p-4 ${risk === "HIGH" ? "bg-red-500/10 border-red-500/30" : risk === "MEDIUM" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{rig}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${risk === "HIGH" ? "bg-red-500/20 text-red-400" : risk === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{risk} RISK</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p>🔧 Maintenance: <span className={m.status === "OVERDUE" ? "text-red-400" : m.status === "SOON" ? "text-yellow-400" : "text-green-400"}>{m.status}</span></p>
                      <p>🔩 Bit: <span className={b.daysToReplace <= 5 ? "text-red-400" : b.daysToReplace <= 14 ? "text-yellow-400" : "text-green-400"}>{b.daysToReplace}d remaining</span></p>
                      <p>⏱️ Downtime: <span className={RIG_DATA[rig].downtime > 6 ? "text-red-400" : RIG_DATA[rig].downtime > 3 ? "text-yellow-400" : "text-green-400"}>{RIG_DATA[rig].downtime} hrs/day</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintenance & Bit alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><Wrench size={14} className="text-yellow-400" /> Maintenance Predictions</p>
              {PROJECT_RIGS[selectedProject]?.map(rig => {
                const m = MAINTENANCE_DATA[rig];
                return (
                  <div key={rig} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <span className="text-sm text-gray-300">{rig}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.status === "OVERDUE" ? "bg-red-500/20 text-red-400" : m.status === "SOON" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                      {m.status === "OVERDUE" ? `Overdue ${Math.abs(m.nextDueIn)}d` : `Due in ${m.nextDueIn}d`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><HardHat size={14} className="text-blue-400" /> Bit Replacement Predictions</p>
              {PROJECT_RIGS[selectedProject]?.map(rig => {
                const b = BIT_DATA[rig];
                const pct = Math.round((b.hoursUsed / b.lifespan) * 100);
                return (
                  <div key={rig} className="py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{rig} — {b.type}</span>
                      <span className={`text-xs font-semibold ${b.daysToReplace <= 5 ? "text-red-400" : b.daysToReplace <= 14 ? "text-yellow-400" : "text-green-400"}`}>{b.daysToReplace}d left</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: pct + "%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><Activity size={14} className="text-blue-400" /> ROP Trend + Prediction</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={pred.chart}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Line type="monotone" dataKey="rop" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="ROP (m/hr)" /></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-400" /> Revenue Forecast</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pred.chart}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Bar dataKey="revenue" fill="#10b981" opacity={0.8} radius={[4,4,0,0]} name="Revenue ($)" /><Bar dataKey="cost" fill="#f97316" opacity={0.6} radius={[4,4,0,0]} name="Cost ($)" /></BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-green-400" /> Meters Drilled</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pred.chart}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Bar dataKey="meters" fill="#22c55e" opacity={0.8} radius={[4,4,0,0]} name="Meters" /></BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><Clock size={14} className="text-yellow-400" /> Downtime Trend</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={pred.chart}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Line type="monotone" dataKey="downtime" stroke="#eab308" strokeWidth={2} dot={{ r: 3, fill: "#eab308" }} name="Downtime (hrs)" /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5"><Brain size={16} className="text-orange-400" /></div>
            <div>
              <p className="text-orange-400 text-sm font-semibold mb-1">AI Summary — {selectedProject} Next Month</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Based on {selectedProject} data across <strong className="text-orange-300">{PROJECT_RIGS[selectedProject]?.join(", ")}</strong>, ROP is predicted at <strong className="text-orange-300">{pred.nextMonth.rop} m/hr</strong> with total output of <strong className="text-orange-300">{pred.nextMonth.meters.toLocaleString()} meters</strong>. Revenue forecast: <strong className="text-orange-300">${pred.nextMonth.revenue.toLocaleString()}</strong>.
                {PROJECT_RIGS[selectedProject]?.some(r => MAINTENANCE_DATA[r].status === "OVERDUE") ? " ⚠️ Critical: maintenance overdue on one or more rigs — action required before next month." : " ✅ Maintenance schedule looks good."}
                {PROJECT_RIGS[selectedProject]?.some(r => BIT_DATA[r].daysToReplace <= 5) ? " 🔴 Bit replacement needed within 5 days." : ""}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 3 — AI REPORT GENERATOR
// ─────────────────────────────────────────────
function AIReportTab() {
  const [project, setProject] = useState("Project Alpha");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [step, setStep] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  const STEPS = ["Collecting operational data...", "Analysing performance metrics...", "Detecting issues & anomalies...", "Generating recommendations...", "Building report & charts..."];

  function generateReport() {
    setLoading(true); setGenerated(false); setStep(0);
    const interval = setInterval(() => setStep(s => { if (s >= STEPS.length - 1) { clearInterval(interval); return s; } return s + 1; }), 600);
    setTimeout(() => { setLoading(false); setGenerated(true); clearInterval(interval); }, 3200);
  }

  function handlePrint() { window.print(); }

  const pd = getProjectData(project);
  const rigs = PROJECT_RIGS[project] || [];
  const totalMeters = pd.metersPerDay * 28;
  const totalCost = pd.cost * 28;
  const totalRevenue = Math.round(pd.history.reduce((s, h) => s + h.revenue, 0));
  const profit = totalRevenue - totalCost;
  const issues = [
    ...rigs.filter(r => MAINTENANCE_DATA[r].status === "OVERDUE").map(r => ({ severity: "HIGH", text: `${r}: Maintenance overdue by ${Math.abs(MAINTENANCE_DATA[r].nextDueIn)} days` })),
    ...rigs.filter(r => BIT_DATA[r].daysToReplace <= 14).map(r => ({ severity: BIT_DATA[r].daysToReplace <= 5 ? "HIGH" : "MEDIUM", text: `${r}: Bit replacement due in ${BIT_DATA[r].daysToReplace} days (${BIT_DATA[r].type})` })),
    ...rigs.filter(r => RIG_DATA[r].incidents > 0).map(r => ({ severity: "MEDIUM", text: `${r}: ${RIG_DATA[r].incidents} safety incident(s) recorded` })),
    ...rigs.filter(r => RIG_DATA[r].downtime > 6).map(r => ({ severity: "MEDIUM", text: `${r}: High downtime — ${RIG_DATA[r].downtime} hrs/day average` })),
  ];

  const PIE_DATA = rigs.map(r => ({ name: r, value: RIG_DATA[r].metersPerDay, color: ["#f97316","#22c55e","#3b82f6","#a855f7","#eab308"][RIGS.indexOf(r)] }));
  const EFFICIENCY_DATA = rigs.map(r => ({ rig: r, efficiency: RIG_DATA[r].efficiency, rop: RIG_DATA[r].rop, downtime: RIG_DATA[r].downtime }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Project</label>
          <select value={project} onChange={e => { setProject(e.target.value); setGenerated(false); }} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500 min-w-[180px]">
            {PROJECTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">From</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setGenerated(false); }} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">To</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setGenerated(false); }} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500" />
        </div>
        <button onClick={generateReport} disabled={loading} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors ml-auto">
          {loading ? <RefreshCw size={15} className="animate-spin" /> : <FileText size={15} />}
          {loading ? "Generating..." : "Generate Report"}
        </button>
        {generated && (
          <>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Printer size={15} /> Print
            </button>
            <button onClick={() => { const el = reportRef.current; if (!el) return; const text = el.innerText; const blob = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `XPLORIX_Report_${project.replace(" ","_")}.txt`; a.click(); }} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Download size={15} /> Export
            </button>
          </>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 py-12 flex flex-col items-center gap-6">
          <div className="relative"><Brain size={44} className="text-orange-400 animate-pulse" /><div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping" /></div>
          <div className="space-y-2 w-64">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm transition-all ${i <= step ? "text-gray-300" : "text-gray-700"}`}>
                {i < step ? <CheckCircle size={14} className="text-green-400 shrink-0" /> : i === step ? <RefreshCw size={14} className="text-orange-400 animate-spin shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-700 shrink-0" />}
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !generated && (
        <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 py-16 flex flex-col items-center gap-3 text-center">
          <FileText size={40} className="text-gray-600" />
          <p className="text-gray-400 font-medium">Select a project and date range, then click <strong className="text-orange-400">Generate Report</strong></p>
          <p className="text-gray-600 text-sm">Generates a full operations report with Executive Summary, Performance, Issues & Recommendations</p>
        </div>
      )}

      {/* THE REPORT */}
      {generated && (
        <div ref={reportRef} className="space-y-6 print:text-black">

          {/* Report header */}
          <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><Brain size={18} className="text-orange-400" /><span className="text-orange-400 text-xs font-bold tracking-widest uppercase">XPLORIX Intelligence Report</span></div>
                <h2 className="text-2xl font-bold text-white mb-1">{project} — Operations Report</h2>
                <p className="text-gray-400 text-sm">{dateFrom} → {dateTo} · Generated {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${issues.filter(i => i.severity === "HIGH").length > 0 ? "bg-red-500/10 border-red-500/30 text-red-400" : issues.length > 0 ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
                {issues.filter(i => i.severity === "HIGH").length > 0 ? "⚠️ ACTION REQUIRED" : issues.length > 0 ? "🟡 ATTENTION NEEDED" : "✅ ALL GOOD"}
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-gray-800"><span className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">1</span> Executive Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Total Meters Drilled", value: totalMeters.toLocaleString() + " m", color: "text-green-400" },
                { label: "Fleet Avg ROP", value: pd.rop + " m/hr", color: "text-blue-400" },
                { label: "Total Revenue", value: "$" + totalRevenue.toLocaleString(), color: "text-emerald-400" },
                { label: "Net Profit", value: "$" + profit.toLocaleString(), color: profit > 0 ? "text-green-400" : "text-red-400" },
                { label: "Active Rigs", value: rigs.length.toString(), color: "text-orange-400" },
                { label: "Fleet Efficiency", value: pd.efficiency + "%", color: "text-cyan-400" },
                { label: "Total Incidents", value: pd.incidents.toString(), color: pd.incidents === 0 ? "text-green-400" : "text-red-400" },
                { label: "Avg Downtime", value: pd.downtime + " hrs/day", color: pd.downtime < 4 ? "text-green-400" : "text-yellow-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              During the period <strong className="text-white">{dateFrom} to {dateTo}</strong>, <strong className="text-orange-300">{project}</strong> operated with <strong className="text-white">{rigs.length} active rig{rigs.length > 1 ? "s" : ""}</strong> ({rigs.join(", ")}). The project achieved a fleet efficiency of <strong className="text-white">{pd.efficiency}%</strong> with a total of <strong className="text-white">{totalMeters.toLocaleString()} meters</strong> drilled. {issues.filter(i => i.severity === "HIGH").length > 0 ? `⚠️ There are ${issues.filter(i => i.severity === "HIGH").length} high-priority issues requiring immediate attention.` : issues.length > 0 ? `The project is performing well with ${issues.length} item(s) to monitor.` : "The project is performing excellently with no critical issues."}
            </p>
          </div>

          {/* Section 2: Performance */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-gray-800"><span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">2</span> Performance Analysis</h3>
            {/* Per-rig table */}
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-800/80">
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Rig</th>
                  <th className="px-4 py-2 text-center text-gray-400 font-medium">Driller</th>
                  <th className="px-4 py-2 text-center text-gray-400 font-medium">ROP</th>
                  <th className="px-4 py-2 text-center text-gray-400 font-medium">m/day</th>
                  <th className="px-4 py-2 text-center text-gray-400 font-medium">Downtime</th>
                  <th className="px-4 py-2 text-center text-gray-400 font-medium">Efficiency</th>
                  <th className="px-4 py-2 text-center text-gray-400 font-medium">Daily Cost</th>
                </tr></thead>
                <tbody>
                  {rigs.map((rig, i) => {
                    const d = RIG_DATA[rig]; const dr = DRILLERS[rig];
                    return (
                      <tr key={rig} className={`border-t border-gray-800 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}`}>
                        <td className="px-4 py-2 font-bold text-orange-400">{rig}</td>
                        <td className="px-4 py-2 text-center text-gray-300">{dr.name}</td>
                        <td className="px-4 py-2 text-center text-blue-400 font-semibold">{d.rop} m/hr</td>
                        <td className="px-4 py-2 text-center text-green-400 font-semibold">{d.metersPerDay} m</td>
                        <td className={`px-4 py-2 text-center font-semibold ${d.downtime > 6 ? "text-red-400" : d.downtime > 3 ? "text-yellow-400" : "text-green-400"}`}>{d.downtime} hrs</td>
                        <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d.efficiency > 90 ? "bg-green-500/20 text-green-400" : d.efficiency > 78 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>{d.efficiency}%</span></td>
                        <td className="px-4 py-2 text-center text-gray-300">${d.cost.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Meters Drilled per Rig — Last 5 Months</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pd.history}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Bar dataKey="meters" fill="#f97316" radius={[4,4,0,0]} name="Meters" /></BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Rig Contribution (Meters/Day)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart><Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ${value}m`} labelLine={false}>
                    {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie><Tooltip content={<TOOLTIP_STYLE />} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">ROP Trend — All Months</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={pd.history}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Line type="monotone" dataKey="rop" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Avg ROP" /></LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Revenue vs Cost</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pd.history}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} /><Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} name="Revenue" /><Bar dataKey="cost" fill="#f97316" radius={[4,4,0,0]} name="Cost" /></BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 3: Issues */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-gray-800"><span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">3</span> Issues & Anomalies</h3>
            {issues.length === 0 ? (
              <div className="flex items-center gap-3 text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl p-4">
                <CheckCircle size={20} /><p className="font-medium">No issues detected. All systems operating within normal parameters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {issues.map((issue, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${issue.severity === "HIGH" ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
                    <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${issue.severity === "HIGH" ? "text-red-400" : "text-yellow-400"}`} />
                    <div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded mr-2 ${issue.severity === "HIGH" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>{issue.severity}</span>
                      <span className="text-sm text-gray-300">{issue.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Downtime chart */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Downtime Trend</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={pd.history}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<TOOLTIP_STYLE />} /><Line type="monotone" dataKey="downtime" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} name="Downtime (hrs)" /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 4: Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-gray-800"><span className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">4</span> AI Recommendations</h3>
            <div className="space-y-3">
              {[
                rigs.some(r => MAINTENANCE_DATA[r].status === "OVERDUE") && { priority: "URGENT", icon: "🔧", text: `Schedule immediate maintenance for ${rigs.filter(r => MAINTENANCE_DATA[r].status === "OVERDUE").join(", ")}. Overdue service increases breakdown risk by 3x.` },
                rigs.some(r => BIT_DATA[r].daysToReplace <= 14) && { priority: "HIGH", icon: "🔩", text: `Order replacement bits for ${rigs.filter(r => BIT_DATA[r].daysToReplace <= 14).join(", ")} within ${Math.min(...rigs.filter(r => BIT_DATA[r].daysToReplace <= 14).map(r => BIT_DATA[r].daysToReplace))} days to avoid operational stoppage.` },
                pd.downtime > 4 && { priority: "MEDIUM", icon: "⏱️", text: `Fleet average downtime of ${pd.downtime} hrs/day is above the 3-hr target. Review shift handover procedures and pre-shift inspection checklists.` },
                { priority: "IMPROVE", icon: "📈", text: `Best performing rig is ${rigs.sort((a,b) => RIG_DATA[b].efficiency - RIG_DATA[a].efficiency)[0]} at ${RIG_DATA[rigs.sort((a,b) => RIG_DATA[b].efficiency - RIG_DATA[a].efficiency)[0]].efficiency}% efficiency. Apply its operational parameters to lower-performing rigs.` },
                pd.incidents > 0 && { priority: "SAFETY", icon: "🦺", text: `${pd.incidents} incident(s) recorded this period. Conduct toolbox talks and re-certify personnel on relevant HSE procedures.` },
                { priority: "OPTIMIZE", icon: "💰", text: `Current cost per meter is $${(pd.cost / pd.metersPerDay).toFixed(2)}. A 5% ROP improvement would reduce this by approximately $${((pd.cost / pd.metersPerDay) * 0.05).toFixed(2)}/m — saving $${Math.round((pd.cost / pd.metersPerDay) * 0.05 * totalMeters).toLocaleString()} over this period.` },
              ].filter(Boolean).map((rec: any, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${rec.priority === "URGENT" ? "bg-red-500/10 border-red-500/20" : rec.priority === "HIGH" ? "bg-orange-500/10 border-orange-500/20" : rec.priority === "SAFETY" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-blue-500/10 border-blue-500/20"}`}>
                  <span className="text-lg shrink-0">{rec.icon}</span>
                  <div>
"bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"}`}>{rec.priority}</span>
                    <span className="text-sm text-gray-300">{rec.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report footer */}
          <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-800 pt-4">
            <span>XPLORIX Intelligence Platform — Auto-generated report</span>
            <span>Generated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE — 3 TABS
// ─────────────────────────────────────────────
export default function XplorixIntelligencePage() {
  const [tab, setTab] = useState<"chat" | "predict" | "report">("chat");
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <style>{`@media print { body { background: white !important; color: black !important; } }`}</style>
      <div className="mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center"><Brain size={24} className="text-orange-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">XPLORIX Intelligence</h1>
          <p className="text-gray-500 text-sm">AI-powered drilling insights, predictions & reports</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Intelligence Active
        </div>
      </div>
      <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl mb-6 w-fit">
        {[
          { key: "chat",    label: "AI Chat",       icon: Bot,      desc: "Query your data"    },
          { key: "predict", label: "AI Prediction", icon: Brain,    desc: "Forecast next month" },
          { key: "report",  label: "AI Report",     icon: FileText, desc: "Generate full report"},
        ].map(({ key, label, icon: Icon, desc }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
            <Icon size={16} />
            <span>{label}</span>
            <span className={`text-xs hidden md:inline ${tab === key ? "text-orange-200" : "text-gray-600"}`}>— {desc}</span>
          </button>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {tab === "chat" ? <AIChatTab /> : tab === "predict" ? <AIPredictionTab /> : <AIReportTab />}
      </div>
    </div>
  );
}

