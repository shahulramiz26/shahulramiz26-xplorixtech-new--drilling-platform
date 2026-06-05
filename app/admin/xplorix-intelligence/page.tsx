"use client";
import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, User, Brain, TrendingUp, TrendingDown,
  Activity, Clock, Package, DollarSign, Zap, ChevronRight,
  BarChart3, AlertTriangle, CheckCircle, Cpu, Calendar,
  ArrowUpRight, ArrowDownRight, Minus, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const RIGS = ["RIG-01", "RIG-02", "RIG-03", "RIG-04", "RIG-05"];
const PROJECTS = ["Project Alpha", "Project Beta", "Project Gamma", "Project Delta"];

const RIG_DATA: Record<string, Record<string, any>> = {
  "RIG-01": {
    metersPerDay: 142, downtime: 3.2, rop: 18.4, inventory: 24, cost: 1240,
    bits: 2, incidents: 0, efficiency: 94,
    history: [
      { month: "Jan", meters: 3800, downtime: 12, rop: 16.2 },
      { month: "Feb", meters: 4100, downtime: 9, rop: 17.1 },
      { month: "Mar", meters: 4300, downtime: 8, rop: 17.9 },
      { month: "Apr", meters: 4200, downtime: 10, rop: 17.5 },
      { month: "May", meters: 4500, downtime: 7, rop: 18.4 },
    ],
  },
  "RIG-02": {
    metersPerDay: 98, downtime: 8.6, rop: 14.1, inventory: 41, cost: 1680,
    bits: 4, incidents: 2, efficiency: 71,
    history: [
      { month: "Jan", meters: 2900, downtime: 22, rop: 12.1 },
      { month: "Feb", meters: 3100, downtime: 19, rop: 12.9 },
      { month: "Mar", meters: 2800, downtime: 24, rop: 11.7 },
      { month: "Apr", meters: 3200, downtime: 18, rop: 13.3 },
      { month: "May", meters: 3050, downtime: 26, rop: 14.1 },
    ],
  },
  "RIG-03": {
    metersPerDay: 168, downtime: 1.8, rop: 21.7, inventory: 18, cost: 1080,
    bits: 1, incidents: 0, efficiency: 98,
    history: [
      { month: "Jan", meters: 4600, downtime: 6, rop: 19.2 },
      { month: "Feb", meters: 4800, downtime: 5, rop: 20.0 },
      { month: "Mar", meters: 5000, downtime: 4, rop: 20.8 },
      { month: "Apr", meters: 5100, downtime: 4, rop: 21.3 },
      { month: "May", meters: 5200, downtime: 5, rop: 21.7 },
    ],
  },
  "RIG-04": {
    metersPerDay: 120, downtime: 5.1, rop: 16.8, inventory: 30, cost: 1400,
    bits: 2, incidents: 1, efficiency: 83,
    history: [
      { month: "Jan", meters: 3200, downtime: 15, rop: 14.1 },
      { month: "Feb", meters: 3400, downtime: 13, rop: 14.8 },
      { month: "Mar", meters: 3600, downtime: 12, rop: 15.5 },
      { month: "Apr", meters: 3500, downtime: 14, rop: 16.0 },
      { month: "May", meters: 3700, downtime: 15, rop: 16.8 },
    ],
  },
  "RIG-05": {
    metersPerDay: 155, downtime: 2.4, rop: 20.1, inventory: 21, cost: 1150,
    bits: 1, incidents: 0, efficiency: 92,
    history: [
      { month: "Jan", meters: 4200, downtime: 8, rop: 18.1 },
      { month: "Feb", meters: 4400, downtime: 7, rop: 18.9 },
      { month: "Mar", meters: 4600, downtime: 7, rop: 19.4 },
      { month: "Apr", meters: 4700, downtime: 6, rop: 19.8 },
      { month: "May", meters: 4800, downtime: 7, rop: 20.1 },
    ],
  },
};

// Project → which rigs are assigned
const PROJECT_RIGS: Record<string, string[]> = {
  "Project Alpha":  ["RIG-01", "RIG-03"],
  "Project Beta":   ["RIG-02"],
  "Project Gamma":  ["RIG-04", "RIG-05"],
  "Project Delta":  ["RIG-01", "RIG-02", "RIG-05"],
};

// Aggregate rig data for a project
function getProjectData(projectKey: string) {
  const rigs = PROJECT_RIGS[projectKey] || ["RIG-01"];
  const all = rigs.map(r => RIG_DATA[r]);
  const avg = (fn: (d: any) => number) => +(all.reduce((s, d) => s + fn(d), 0) / all.length).toFixed(1);
  const sum = (fn: (d: any) => number) => all.reduce((s, d) => s + fn(d), 0);

  // Merge histories by month
  const months = all[0].history.map((_: any, i: number) => {
    const month = all[0].history[i].month;
    return {
      month,
      meters: sum(d => d.history[i].meters),
      downtime: +avg(d => d.history[i].downtime).toFixed(1),
      rop: +avg(d => d.history[i].rop).toFixed(1),
    };
  });

  return {
    rigs,
    metersPerDay: sum(d => d.metersPerDay),
    downtime: +avg(d => d.downtime).toFixed(1),
    rop: +avg(d => d.rop).toFixed(1),
    inventory: sum(d => d.inventory),
    cost: sum(d => d.cost),
    bits: sum(d => d.bits),
    incidents: sum(d => d.incidents),
    efficiency: +avg(d => d.efficiency).toFixed(0),
    history: months,
  };
}

// Prediction: trend projection by project
function generatePrediction(projectKey: string) {
  const d = getProjectData(projectKey);
  const hist = d.history;
  const last = hist[hist.length - 1];
  const prev = hist[hist.length - 2];
  const ropTrend = last.rop - prev.rop;
  const metersTrend = last.meters - prev.meters;
  const downtimeTrend = last.downtime - prev.downtime;

  return {
    nextMonth: {
      rop: +(last.rop + ropTrend * 0.8).toFixed(1),
      meters: Math.round(last.meters + metersTrend * 0.7),
      downtime: Math.max(1, +(last.downtime + downtimeTrend * 0.6).toFixed(1)),
      cost: Math.round(d.cost * (1 + (ropTrend > 0 ? -0.02 : 0.03))),
      inventory: Math.round(d.inventory * (1 + (ropTrend > 0 ? -0.05 : 0.05))),
    },
    chart: [
      ...hist,
      {
        month: "Jun (Pred)",
        meters: Math.round(last.meters + metersTrend * 0.7),
        downtime: Math.max(1, +(last.downtime + downtimeTrend * 0.6).toFixed(1)),
        rop: +(last.rop + ropTrend * 0.8).toFixed(1),
        predicted: true,
      },
    ],
  };
}

// ─────────────────────────────────────────────
// KEYWORD CHAT ENGINE
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
  if (lower.includes("compar") || (r2 && lower.includes("vs"))) {
    return {
      type: "compare",
      data: { r1, r2, d1, d2 },
      text: `Here's a side-by-side comparison of **${r1}** vs **${r2}** (${dateLabel}):`,
    };
  }
  // METERS
  if (lower.includes("meter") || lower.includes("drilled") || lower.includes("footage")) {
    return {
      type: "text",
      text: `📏 **Drilling Meters — ${r1}** (${dateLabel})\n\nDaily average: **${d1.metersPerDay} m/day**\nPeriod total: **~${d1.metersPerDay * 28} m**\nROP: **${d1.rop} m/hr**\n\n${d1.metersPerDay > 140 ? "✅ Above fleet average — excellent performance." : d1.metersPerDay > 110 ? "🟡 Near fleet average." : "🔴 Below fleet average — review operational parameters."}`,
    };
  }
  // DOWNTIME
  if (lower.includes("downtime") || lower.includes("idle") || lower.includes("delay") || lower.includes("stopped")) {
    return {
      type: "text",
      text: `⏱️ **Downtime Report — ${r1}** (${dateLabel})\n\nAvg daily downtime: **${d1.downtime} hrs**\nEfficiency: **${d1.efficiency}%**\nIncidents logged: **${d1.incidents}**\n\n${d1.downtime < 3 ? "✅ Excellent — minimal downtime." : d1.downtime < 6 ? "🟡 Moderate downtime. Monitor closely." : "🔴 High downtime! Maintenance review needed urgently."}`,
    };
  }
  // INVENTORY
  if (lower.includes("inventor") || lower.includes("material") || lower.includes("consumable") || lower.includes("bit") || lower.includes("supply")) {
    return {
      type: "text",
      text: `📦 **Inventory & Consumables — ${r1}** (${dateLabel})\n\nItems consumed: **${d1.inventory} units**\nBits used: **${d1.bits}**\nConsumable cost: **$${(d1.inventory * 42).toLocaleString()}**\n\n${d1.bits > 3 ? "⚠️ High bit consumption — check formation hardness and WOB settings." : "✅ Bit consumption within normal range."}`,
    };
  }
  // COST / MONEY
  if (lower.includes("cost") || lower.includes("money") || lower.includes("bill") || lower.includes("expense") || lower.includes("financ")) {
    return {
      type: "text",
      text: `💰 **Cost Report — ${r1}** (${dateLabel})\n\nDaily rig cost: **$${d1.cost.toLocaleString()}**\nPeriod estimate: **$${(d1.cost * 28).toLocaleString()}**\nCost per meter: **$${(d1.cost / d1.metersPerDay).toFixed(2)}/m**\n\n${(d1.cost / d1.metersPerDay) < 9 ? "✅ Cost-efficient operation." : "🟡 Cost per meter is above optimal. Improving ROP will reduce this."}`,
    };
  }
  // ROP
  if (lower.includes("rop") || lower.includes("penetration") || lower.includes("speed") || lower.includes("rate")) {
    return {
      type: "text",
      text: `⚡ **Rate of Penetration — ${r1}** (${dateLabel})\n\nCurrent ROP: **${d1.rop} m/hr**\nEfficiency: **${d1.efficiency}%**\n\n${d1.rop > 19 ? "🏆 Top performer — ROP is excellent." : d1.rop > 16 ? "✅ Good ROP, within target range." : "🔴 Low ROP. Review bit type, WOB, and RPM settings."}`,
    };
  }
  // SUMMARY
  if (lower.includes("summary") || lower.includes("overview") || lower.includes("report") || lower.includes("all") || lower.includes("everything")) {
    return {
      type: "text",
      text: `📋 **Full Summary — ${r1}** (${filters.project}, ${dateLabel})\n\n📏 Meters/day: **${d1.metersPerDay} m**\n⚡ ROP: **${d1.rop} m/hr**\n⏱️ Daily downtime: **${d1.downtime} hrs**\n📦 Inventory used: **${d1.inventory} units**\n💰 Daily cost: **$${d1.cost.toLocaleString()}**\n🔩 Bits used: **${d1.bits}**\n🦺 Incidents: **${d1.incidents}**\n✅ Efficiency: **${d1.efficiency}%**\n\n${d1.efficiency > 90 ? "🟢 Overall: EXCELLENT operation." : d1.efficiency > 78 ? "🟡 Overall: GOOD, minor improvements possible." : "🔴 Overall: NEEDS ATTENTION — multiple issues detected."}`,
    };
  }
  // PROJECT
  if (lower.includes("project") || lower.includes("site") || lower.includes("location")) {
    return {
      type: "text",
      text: `📁 **Project Info — ${filters.project}** (${dateLabel})\n\nActive rigs on this project: **${r1}${r2 && r2 !== "None" ? ", " + r2 : ""}**\nStatus: **Active**\nProgress: **${Math.floor(Math.random() * 30 + 55)}% complete**\n\nUse the rig selector to drill into specific rig performance on this project.`,
    };
  }

  return {
    type: "text",
    text: `🤖 Try asking about:\n\n• **Meters drilled** — "How many meters did RIG-01 drill?"\n• **Downtime** — "Show RIG-02 downtime"\n• **Inventory** — "What inventory did RIG-01 use?"\n• **Cost** — "What is the cost for RIG-03?"\n• **ROP** — "Show ROP for RIG-01"\n• **Compare** — Select two rigs and ask "Compare RIG-01 vs RIG-02"\n• **Summary** — "Give me a full summary of RIG-01"`,
  };
}

// ─────────────────────────────────────────────
// COMPARE TABLE
// ─────────────────────────────────────────────
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
        <thead>
          <tr className="bg-gray-800">
            <th className="px-4 py-2 text-left text-gray-400 font-medium">Metric</th>
            <th className="px-4 py-2 text-center text-orange-400 font-bold">{r1}</th>
            <th className="px-4 py-2 text-center text-blue-400 font-bold">{r2}</th>
            <th className="px-4 py-2 text-center text-gray-400 font-medium">Winner</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const v1 = d1[row.key];
            const v2 = d2[row.key];
            const winner =
              row.better === "higher"
                ? v1 > v2 ? r1 : v2 > v1 ? r2 : "Tie"
                : v1 < v2 ? r1 : v2 < v1 ? r2 : "Tie";
            return (
              <tr key={i} className={`border-t border-gray-800 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}`}>
                <td className="px-4 py-2 text-gray-300">{row.label}</td>
                <td className={`px-4 py-2 text-center font-semibold ${winner === r1 ? "text-green-400" : "text-gray-300"}`}>
                  {row.unit === "$" ? "$" : ""}{typeof v1 === "number" ? v1.toLocaleString() : v1}{row.unit !== "$" ? " " + row.unit : ""}
                </td>
                <td className={`px-4 py-2 text-center font-semibold ${winner === r2 ? "text-green-400" : "text-gray-300"}`}>
                  {row.unit === "$" ? "$" : ""}{typeof v2 === "number" ? v2.toLocaleString() : v2}{row.unit !== "$" ? " " + row.unit : ""}
                </td>
                <td className="px-4 py-2 text-center">
                  {winner === "Tie" ? (
                    <span className="text-gray-500 text-xs">—</span>
                  ) : (
                    <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">{winner}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// RENDER MESSAGE
// ─────────────────────────────────────────────
function RenderMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="leading-relaxed text-sm">
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="font-semibold text-orange-300">{part}</strong>
              ) : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// AI CHAT TAB
// ─────────────────────────────────────────────
type Msg = { role: "user" | "assistant"; content: string; extra?: any; timestamp: Date };

function AIChatTab() {
  const [rig1, setRig1] = useState("RIG-01");
  const [rig2, setRig2] = useState("None");
  const [project, setProject] = useState("Project Alpha");
  const [date, setDate] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "👋 Welcome to **XPLORIX Intelligence Chat**!\n\nSelect your rig, project and date above, then ask me anything:\n\n• Meters drilled\n• Downtime hours\n• Inventory used\n• Cost breakdown\n• ROP performance\n• Compare two rigs\n• Full summary",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const QUICK = ["Full summary", "Meters drilled", "Downtime report", "Compare rigs", "Inventory used", "Cost breakdown"];

  function send(text?: string) {
    const q = text ?? input;
    if (!q.trim() || typing) return;
    const userMsg: Msg = { role: "user", content: q, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const result = processChat(q, { rig1, rig2: rig2 === "None" ? "" : rig2, project, date });
      setMessages(p => [...p, {
        role: "assistant",
        content: result.text,
        extra: result,
        timestamp: new Date(),
      }]);
      setTyping(false);
    }, 700 + Math.random() * 400);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Primary Rig", value: rig1, onChange: setRig1, options: RIGS },
          { label: "Compare With", value: rig2, onChange: setRig2, options: ["None", ...RIGS] },
          { label: "Project", value: project, onChange: setProject, options: PROJECTS },
        ].map(({ label, value, onChange, options }) => (
          <div key={label}>
            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
            <select
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500"
            >
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs text-gray-500 mb-1 block">Date Range</label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={date.split("|")[0] || ""}
              onChange={e => setDate(e.target.value + "|" + (date.split("|")[1] || ""))}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-2 outline-none focus:border-orange-500"
            />
            <span className="text-gray-600 text-xs shrink-0">to</span>
            <input
              type="date"
              value={date.split("|")[1] || ""}
              onChange={e => setDate((date.split("|")[0] || "") + "|" + e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-2 outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2">
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500/50 text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-all">
            {q}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0" style={{ maxHeight: "420px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "assistant" ? "bg-orange-500/20 border border-orange-500/30" : "bg-gray-700 border border-gray-600"}`}>
              {msg.role === "assistant" ? <Bot size={14} className="text-orange-400" /> : <User size={14} className="text-gray-300" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-orange-500 text-white rounded-tr-sm" : "bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm"}`}>
              <RenderMessage text={msg.content} />
              {msg.extra?.type === "compare" && msg.extra.data && (
                <CompareTable {...msg.extra.data} />
              )}
              <p className={`text-xs mt-2 ${msg.role === "user" ? "text-orange-200" : "text-gray-600"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-orange-400" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 bg-gray-800 border border-gray-700 focus-within:border-orange-500/60 rounded-xl px-3 py-2 transition-colors">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={`Ask about ${rig1}${rig2 !== "None" ? " vs " + rig2 : ""}...`}
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
        />
        <button onClick={() => send()} disabled={!input.trim() || typing}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors shrink-0">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AI PREDICTION TAB
// ─────────────────────────────────────────────
const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

function AIPredictionTab() {
  const [selectedProject, setSelectedProject] = useState("Project Alpha");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const pred = generatePrediction(selectedProject);
  const current = getProjectData(selectedProject);

  function runPrediction() {
    setLoading(true);
    setGenerated(false);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1800);
  }

  const cards = [
    {
      label: "Predicted ROP", icon: Activity,
      current: current.rop + " m/hr",
      predicted: pred.nextMonth.rop + " m/hr",
      delta: +(pred.nextMonth.rop - current.rop).toFixed(1),
      color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Drilling Meters", icon: BarChart3,
      current: (current.metersPerDay * 28).toLocaleString() + " m",
      predicted: pred.nextMonth.meters.toLocaleString() + " m",
      delta: pred.nextMonth.meters - current.metersPerDay * 28,
      color: "text-green-400", bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Avg Downtime / Rig", icon: Clock,
      current: current.downtime + " hrs/day",
      predicted: pred.nextMonth.downtime + " hrs/day",
      delta: +(pred.nextMonth.downtime - current.downtime).toFixed(1),
      lowerBetter: true,
      color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      label: "Inventory Forecast", icon: Package,
      current: current.inventory + " units",
      predicted: pred.nextMonth.inventory + " units",
      delta: pred.nextMonth.inventory - current.inventory,
      lowerBetter: true,
      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Total Cost Projection", icon: DollarSign,
      current: "$" + current.cost.toLocaleString() + "/day",
      predicted: "$" + pred.nextMonth.cost.toLocaleString() + "/day",
      delta: pred.nextMonth.cost - current.cost,
      lowerBetter: true,
      color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      label: "Fleet Efficiency", icon: Zap,
      current: current.efficiency + "%",
      predicted: Math.min(100, +current.efficiency + (pred.nextMonth.rop > current.rop ? 2 : -1)) + "%",
      delta: pred.nextMonth.rop > current.rop ? 2 : -1,
      color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project selector + run button */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Select Project to Predict</label>
          <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setGenerated(false); }}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500 min-w-[180px]">
            {PROJECTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        {/* Show which rigs are on this project */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PROJECT_RIGS[selectedProject]?.map(r => (
            <span key={r} className="text-xs bg-gray-800 border border-gray-700 text-orange-300 px-2 py-1 rounded-full">{r}</span>
          ))}
          <span className="text-xs text-gray-600">active on this project</span>
        </div>
        <button onClick={runPrediction} disabled={loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors ml-auto">
          {loading ? <RefreshCw size={15} className="animate-spin" /> : <Brain size={15} />}
          {loading ? "Analyzing data..." : "Run AI Prediction"}
        </button>
        {generated && (
          <span className="flex items-center gap-1.5 text-green-400 text-sm">
            <CheckCircle size={15} /> Prediction ready for next month
          </span>
        )}
      </div>

      {!generated && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 py-16 flex flex-col items-center gap-3 text-center">
          <Brain size={40} className="text-gray-600" />
          <p className="text-gray-400 font-medium">Select a project and click <strong className="text-orange-400">Run AI Prediction</strong></p>
          <p className="text-gray-600 text-sm">AI will analyse all rigs in this project and forecast next month's performance</p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 py-16 flex flex-col items-center gap-4">
          <div className="relative">
            <Brain size={40} className="text-orange-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping" />
          </div>
          <p className="text-gray-300 font-medium">Analysing <strong className="text-orange-400">{selectedProject}</strong> — {PROJECT_RIGS[selectedProject]?.join(", ")}...</p>
          <div className="flex gap-1">
            {["Scanning logs", "Calculating trends", "Building forecast"].map((step, i) => (
              <span key={step} className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-full" style={{ animationDelay: `${i * 0.3}s` }}>
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {generated && (
        <>
          {/* Prediction cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cards.map(({ label, icon: Icon, current: cur, predicted, delta, lowerBetter, color, bg }) => {
              const isGood = lowerBetter ? delta <= 0 : delta >= 0;
              const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
              return (
                <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={15} className={color} />
                    <span className="text-xs text-gray-400 font-medium">{label}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Current</span>
                      <span className="text-xs text-gray-300">{cur}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">Predicted</span>
                      <span className={`text-sm font-bold ${color}`}>{predicted}</span>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isGood ? "text-green-400" : "text-red-400"}`}>
                      <DeltaIcon size={12} />
                      <span className="text-xs font-medium">
                        {delta > 0 ? "+" : ""}{typeof delta === "number" && Math.abs(delta) > 100 ? delta.toLocaleString() : delta}
                        {" "}{isGood ? "↑ Improving" : "↓ Declining"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Activity size={14} className="text-blue-400" /> ROP Trend + Prediction
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={pred.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Line type="monotone" dataKey="rop" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="ROP (m/hr)"
                    strokeDasharray={(d: any) => d.predicted ? "5 5" : "0"} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={14} className="text-green-400" /> Meters Drilled + Prediction
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pred.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="meters" fill="#22c55e" opacity={0.8} radius={[4, 4, 0, 0]} name="Meters" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:col-span-2">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Clock size={14} className="text-yellow-400" /> Downtime Trend + Prediction
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={pred.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Line type="monotone" dataKey="downtime" stroke="#eab308" strokeWidth={2} dot={{ r: 3, fill: "#eab308" }} name="Downtime (hrs)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI narrative */}
          <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Brain size={16} className="text-orange-400" />
            </div>
            <div>
              <p className="text-orange-400 text-sm font-semibold mb-1">AI Summary — {selectedProject} Next Month Forecast</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Based on {selectedProject}'s last 5 months of data across{" "}
                <strong className="text-orange-300">{PROJECT_RIGS[selectedProject]?.join(", ")}</strong>, the model predicts a{" "}
                <strong className="text-orange-300">{pred.nextMonth.rop > current.rop ? "positive" : "slight decline in"} ROP trend</strong> reaching{" "}
                <strong className="text-orange-300">{pred.nextMonth.rop} m/hr</strong> next month.
                Total project drilling output is estimated at <strong className="text-orange-300">{pred.nextMonth.meters.toLocaleString()} meters</strong> with avg downtime projected at{" "}
                <strong className="text-orange-300">{pred.nextMonth.downtime} hrs/day per rig</strong>.
                {pred.nextMonth.downtime > current.downtime
                  ? " ⚠️ Downtime is trending upward — a preventive maintenance check is recommended before month start."
                  : " ✅ Downtime is improving — continue current operational parameters."}
                {" "}Total project cost projection: <strong className="text-orange-300">${(pred.nextMonth.cost * 28).toLocaleString()}/month</strong>.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function XplorixIntelligencePage() {
  const [tab, setTab] = useState<"chat" | "predict">("chat");

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <Brain size={24} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">XPLORIX Intelligence</h1>
          <p className="text-gray-500 text-sm">AI-powered drilling insights and predictions</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Intelligence Active
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl mb-6 w-fit">
        {[
          { key: "chat", label: "AI Chat", icon: Bot, desc: "Query your data" },
          { key: "predict", label: "AI Prediction", icon: Brain, desc: "Forecast next month" },
        ].map(({ key, label, icon: Icon, desc }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}>
            <Icon size={16} />
            <span>{label}</span>
            <span className={`text-xs hidden md:inline ${tab === key ? "text-orange-200" : "text-gray-600"}`}>— {desc}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {tab === "chat" ? <AIChatTab /> : <AIPredictionTab />}
      </div>
    </div>
  );
}

