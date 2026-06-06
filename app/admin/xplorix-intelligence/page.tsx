"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Brain, Activity, Clock, Package, DollarSign, Zap, BarChart3, CheckCircle, RefreshCw, ArrowUpRight, ArrowDownRight, Minus, FileText, Printer, Download, AlertTriangle, ShieldAlert, Wrench, HardHat, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const RIGS = ["RIG-01", "RIG-02", "RIG-03", "RIG-04", "RIG-05"];
const PROJECTS = ["Project Alpha", "Project Beta", "Project Gamma", "Project Delta"];

const RIG_DATA: Record<string, any> = {
  "RIG-01": { mpd: 142, dt: 3.2, rop: 18.4, inv: 24, cost: 1240, bits: 2, inc: 0, eff: 94,
    hist: [{m:"Jan",me:3800,dt:12,rop:16.2,cost:34720,rev:42560},{m:"Feb",me:4100,dt:9,rop:17.1,cost:34720,rev:45920},{m:"Mar",me:4300,dt:8,rop:17.9,cost:34720,rev:48160},{m:"Apr",me:4200,dt:10,rop:17.5,cost:34720,rev:47040},{m:"May",me:4500,dt:7,rop:18.4,cost:34720,rev:50400}] },
  "RIG-02": { mpd: 98, dt: 8.6, rop: 14.1, inv: 41, cost: 1680, bits: 4, inc: 2, eff: 71,
    hist: [{m:"Jan",me:2900,dt:22,rop:12.1,cost:47040,rev:32480},{m:"Feb",me:3100,dt:19,rop:12.9,cost:47040,rev:34720},{m:"Mar",me:2800,dt:24,rop:11.7,cost:47040,rev:31360},{m:"Apr",me:3200,dt:18,rop:13.3,cost:47040,rev:35840},{m:"May",me:3050,dt:26,rop:14.1,cost:47040,rev:34160}] },
  "RIG-03": { mpd: 168, dt: 1.8, rop: 21.7, inv: 18, cost: 1080, bits: 1, inc: 0, eff: 98,
    hist: [{m:"Jan",me:4600,dt:6,rop:19.2,cost:30240,rev:51520},{m:"Feb",me:4800,dt:5,rop:20.0,cost:30240,rev:53760},{m:"Mar",me:5000,dt:4,rop:20.8,cost:30240,rev:56000},{m:"Apr",me:5100,dt:4,rop:21.3,cost:30240,rev:57120},{m:"May",me:5200,dt:5,rop:21.7,cost:30240,rev:58240}] },
  "RIG-04": { mpd: 120, dt: 5.1, rop: 16.8, inv: 30, cost: 1400, bits: 2, inc: 1, eff: 83,
    hist: [{m:"Jan",me:3200,dt:15,rop:14.1,cost:39200,rev:35840},{m:"Feb",me:3400,dt:13,rop:14.8,cost:39200,rev:38080},{m:"Mar",me:3600,dt:12,rop:15.5,cost:39200,rev:40320},{m:"Apr",me:3500,dt:14,rop:16.0,cost:39200,rev:39200},{m:"May",me:3700,dt:15,rop:16.8,cost:39200,rev:41440}] },
  "RIG-05": { mpd: 155, dt: 2.4, rop: 20.1, inv: 21, cost: 1150, bits: 1, inc: 0, eff: 92,
    hist: [{m:"Jan",me:4200,dt:8,rop:18.1,cost:32200,rev:47040},{m:"Feb",me:4400,dt:7,rop:18.9,cost:32200,rev:49280},{m:"Mar",me:4600,dt:7,rop:19.4,cost:32200,rev:51520},{m:"Apr",me:4700,dt:6,rop:19.8,cost:32200,rev:52640},{m:"May",me:4800,dt:7,rop:20.1,cost:32200,rev:53760}] },
};

const PROJ_RIGS: Record<string, string[]> = {
  "Project Alpha": ["RIG-01","RIG-03"],
  "Project Beta":  ["RIG-02"],
  "Project Gamma": ["RIG-04","RIG-05"],
  "Project Delta": ["RIG-01","RIG-02","RIG-05"],
};

const MAINT: Record<string, any> = {
  "RIG-01": { status: "OK",      due: 11  },
  "RIG-02": { status: "OVERDUE", due: -2  },
  "RIG-03": { status: "OK",      due: 14  },
  "RIG-04": { status: "SOON",    due: 6   },
  "RIG-05": { status: "OK",      due: 9   },
};

const BITS: Record<string, any> = {
  "RIG-01": { type: "PDC 8.5in",   used: 47, life: 60, left: 13 },
  "RIG-02": { type: "Tricone 9in", used: 62, life: 65, left: 3  },
  "RIG-03": { type: "PDC 8.5in",   used: 21, life: 60, left: 39 },
  "RIG-04": { type: "PDC 9in",     used: 44, life: 60, left: 16 },
  "RIG-05": { type: "Tricone 8in", used: 38, life: 65, left: 27 },
};

const DRILLERS: Record<string, string> = {
  "RIG-01": "Ravi Kumar",
  "RIG-02": "Mohammed Salim",
  "RIG-03": "Arun Patel",
  "RIG-04": "Suresh Nair",
  "RIG-05": "Deepak Singh",
};

function getProjData(p: string) {
  const rigs = PROJ_RIGS[p] || ["RIG-01"];
  const all = rigs.map((r) => RIG_DATA[r]);
  const sumFn = (fn: (d: any) => number) => all.reduce((a, d) => a + fn(d), 0);
  const avgFn = (fn: (d: any) => number) => sumFn(fn) / all.length;
  const hist = all[0].hist.map((_: any, i: number) => ({
    m: all[0].hist[i].m,
    me: Math.round(sumFn((d) => d.hist[i].me)),
    dt: +avgFn((d) => d.hist[i].dt).toFixed(1),
    rop: +avgFn((d) => d.hist[i].rop).toFixed(1),
    cost: Math.round(sumFn((d) => d.hist[i].cost)),
    rev: Math.round(sumFn((d) => d.hist[i].rev)),
  }));
  return {
    rigs,
    mpd: Math.round(sumFn((d) => d.mpd)),
    dt: +avgFn((d) => d.dt).toFixed(1),
    rop: +avgFn((d) => d.rop).toFixed(1),
    inv: Math.round(sumFn((d) => d.inv)),
    cost: Math.round(sumFn((d) => d.cost)),
    bits: Math.round(sumFn((d) => d.bits)),
    inc: Math.round(sumFn((d) => d.inc)),
    eff: Math.round(avgFn((d) => d.eff)),
    hist,
  };
}

function genPred(p: string) {
  const d = getProjData(p);
  const h = d.hist;
  const last = h[4];
  const prev = h[3];
  const predHist = [...h, {
    m: "Jun (Pred)",
    me: Math.round(last.me + (last.me - prev.me) * 0.7),
    dt: Math.max(1, +(last.dt + (last.dt - prev.dt) * 0.6).toFixed(1)),
    rop: +(last.rop + (last.rop - prev.rop) * 0.8).toFixed(1),
    cost: Math.round(d.cost * (last.rop > prev.rop ? 0.98 : 1.03)),
    rev: Math.round(last.rev + (last.rev - prev.rev) * 0.7),
  }];
  return {
    rop: +(last.rop + (last.rop - prev.rop) * 0.8).toFixed(1),
    meters: Math.round(last.me + (last.me - prev.me) * 0.7),
    dt: Math.max(1, +(last.dt + (last.dt - prev.dt) * 0.6).toFixed(1)),
    cost: Math.round(d.cost * (last.rop > prev.rop ? 0.98 : 1.03)),
    rev: Math.round(last.rev + (last.rev - prev.rev) * 0.7),
    hist: predHist,
  };
}

function riskLevel(rig: string) {
  const d = RIG_DATA[rig];
  const m = MAINT[rig];
  const b = BITS[rig];
  const score =
    (d.dt > 6 ? 2 : d.dt > 3 ? 1 : 0) +
    (m.status === "OVERDUE" ? 2 : m.status === "SOON" ? 1 : 0) +
    (b.left <= 5 ? 2 : b.left <= 14 ? 1 : 0) +
    (d.inc > 1 ? 2 : d.inc > 0 ? 1 : 0);
  return score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW";
}

function formatDate(date: string) {
  const [from, to] = date.split("|");
  if (from && to) return from + " to " + to;
  if (from) return "From " + from;
  return "This Period";
}

function processChat(input: string, rig1: string, rig2: string, project: string, date: string) {
  const l = input.toLowerCase();
  const d1 = RIG_DATA[rig1];
  const d2 = rig2 && rig2 !== "None" ? RIG_DATA[rig2] : null;
  const dl = formatDate(date);

  if (l.includes("driller") || l.includes("best driller") || l.includes("performer")) {
    const sorted = [...RIGS].sort((a, b) => RIG_DATA[b].eff - RIG_DATA[a].eff);
    return { type: "text", text: "Driller Performance - This Month\n\nBest: " + DRILLERS[sorted[0]] + " (" + sorted[0] + ") - " + RIG_DATA[sorted[0]].eff + "% efficiency\n\nRankings:\n1. " + DRILLERS[sorted[0]] + " (" + sorted[0] + ") - " + RIG_DATA[sorted[0]].eff + "%\n2. " + DRILLERS[sorted[1]] + " (" + sorted[1] + ") - " + RIG_DATA[sorted[1]].eff + "%\n3. " + DRILLERS[sorted[2]] + " (" + sorted[2] + ") - " + RIG_DATA[sorted[2]].eff + "%\n4. " + DRILLERS[sorted[3]] + " (" + sorted[3] + ") - " + RIG_DATA[sorted[3]].eff + "%\n5. " + DRILLERS[sorted[4]] + " (" + sorted[4] + ") - " + RIG_DATA[sorted[4]].eff + "%" };
  }
  if (l.includes("incident") || l.includes("safety") || l.includes("hse")) {
    return { type: "text", text: "Safety Report - " + rig1 + " (" + dl + ")\n\nIncidents logged: " + d1.inc + "\nStatus: " + (d1.inc === 0 ? "Clean record" : "Action required") + "\nEfficiency: " + d1.eff + "%\n\n" + (d1.inc > 0 ? "Recommend immediate HSE debrief and corrective action." : "Excellent safety performance. Continue current protocols.") + "\n\nFleet overview:\nRIG-01: " + RIG_DATA["RIG-01"].inc + " incidents\nRIG-02: " + RIG_DATA["RIG-02"].inc + " incidents\nRIG-03: " + RIG_DATA["RIG-03"].inc + " incidents" };
  }
  if (l.includes("bit") && !l.includes("billing")) {
    const b = BITS[rig1];
    const pct = Math.round((b.used / b.life) * 100);
    return { type: "text", text: "Bit Life - " + rig1 + "\n\nType: " + b.type + "\nHours used: " + b.used + "/" + b.life + " hrs (" + pct + "% worn)\nDays to replace: " + b.left + " days\n\n" + (b.left <= 5 ? "CRITICAL - Replace immediately!" : b.left <= 14 ? "WARNING - Plan replacement soon." : "Healthy - no action needed.") };
  }
  if (l.includes("mainten") || l.includes("service") || l.includes("repair")) {
    const m = MAINT[rig1];
    return { type: "text", text: "Maintenance - " + rig1 + "\n\nStatus: " + m.status + "\n" + (m.due < 0 ? "Overdue by " + Math.abs(m.due) + " days" : "Next service in " + m.due + " days") + "\n\nFleet overview:\nRIG-01: " + MAINT["RIG-01"].status + "\nRIG-02: " + MAINT["RIG-02"].status + " (overdue)\nRIG-03: " + MAINT["RIG-03"].status + "\nRIG-04: " + MAINT["RIG-04"].status + "\nRIG-05: " + MAINT["RIG-05"].status };
  }
  if ((l.includes("compar") || l.includes(" vs ")) && d2) {
    return { type: "compare", r1: rig1, r2: rig2, d1, d2, text: "Comparison: " + rig1 + " vs " + rig2 + " (" + dl + ")" };
  }
  if (l.includes("meter") || l.includes("drilled") || l.includes("footage")) {
    return { type: "text", text: "Drilling Meters - " + rig1 + " (" + dl + ")\n\nDaily avg: " + d1.mpd + " m/day\nPeriod total: ~" + (d1.mpd * 28).toLocaleString() + " m\nROP: " + d1.rop + " m/hr\n\n" + (d1.mpd > 140 ? "Above fleet average - excellent." : d1.mpd > 110 ? "Near fleet average." : "Below fleet average - review parameters.") };
  }
  if (l.includes("downtime") || l.includes("idle") || l.includes("delay")) {
    return { type: "text", text: "Downtime - " + rig1 + " (" + dl + ")\n\nAvg daily: " + d1.dt + " hrs\nEfficiency: " + d1.eff + "%\nIncidents: " + d1.inc + "\n\n" + (d1.dt < 3 ? "Excellent - minimal downtime." : d1.dt < 6 ? "Moderate - monitor closely." : "High downtime - maintenance review needed.") };
  }
  if (l.includes("cost") || l.includes("money") || l.includes("bill") || l.includes("financ")) {
    return { type: "text", text: "Cost Report - " + rig1 + " (" + dl + ")\n\nDaily cost: $" + d1.cost.toLocaleString() + "\nMonthly: $" + (d1.cost * 28).toLocaleString() + "\nCost/meter: $" + (d1.cost / d1.mpd).toFixed(2) + "/m\n\n" + ((d1.cost / d1.mpd) < 9 ? "Cost-efficient operation." : "Cost per meter above optimal. Improving ROP will reduce this.") };
  }
  if (l.includes("rop") || l.includes("penetration") || l.includes("speed")) {
    return { type: "text", text: "Rate of Penetration - " + rig1 + " (" + dl + ")\n\nROP: " + d1.rop + " m/hr\nEfficiency: " + d1.eff + "%\n\n" + (d1.rop > 19 ? "Top performer." : d1.rop > 16 ? "Good ROP, within target." : "Low ROP - review bit type, WOB, RPM.") };
  }
  if (l.includes("summar") || l.includes("overview") || l.includes("all") || l.includes("report")) {
    return { type: "text", text: "Full Summary - " + rig1 + " (" + project + ", " + dl + ")\n\nMeters/day: " + d1.mpd + " m\nROP: " + d1.rop + " m/hr\nDowntime: " + d1.dt + " hrs/day\nInventory: " + d1.inv + " units\nDaily cost: $" + d1.cost.toLocaleString() + "\nBits used: " + d1.bits + "\nIncidents: " + d1.inc + "\nEfficiency: " + d1.eff + "%\n\n" + (d1.eff > 90 ? "EXCELLENT operation." : d1.eff > 78 ? "GOOD - minor improvements possible." : "NEEDS ATTENTION.") };
  }
  return { type: "text", text: "Try asking:\n- Who is the best driller?\n- Any incidents on " + rig1 + "?\n- Bit replacement status\n- Maintenance status\n- Meters drilled\n- Cost breakdown\n- Full summary\n- Compare rigs (select two rigs above first)" };
}

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
      <p style={{ color: "#9ca3af", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

function CompareTable({ r1, r2, d1, d2 }: any) {
  const rows = [
    { label: "Meters/Day", key: "mpd", unit: "m", better: "higher" },
    { label: "ROP", key: "rop", unit: "m/hr", better: "higher" },
    { label: "Downtime", key: "dt", unit: "hrs", better: "lower" },
    { label: "Efficiency", key: "eff", unit: "%", better: "higher" },
    { label: "Inventory", key: "inv", unit: "units", better: "lower" },
    { label: "Daily Cost", key: "cost", unit: "$", better: "lower" },
    { label: "Incidents", key: "inc", unit: "", better: "lower" },
  ];
  return (
    <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", border: "1px solid #374151" }}>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#1f2937" }}>
            <th style={{ padding: "8px 12px", textAlign: "left", color: "#9ca3af", fontWeight: 500 }}>Metric</th>
            <th style={{ padding: "8px 12px", textAlign: "center", color: "#f97316", fontWeight: 700 }}>{r1}</th>
            <th style={{ padding: "8px 12px", textAlign: "center", color: "#60a5fa", fontWeight: 700 }}>{r2}</th>
            <th style={{ padding: "8px 12px", textAlign: "center", color: "#9ca3af", fontWeight: 500 }}>Winner</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const v1 = d1[row.key];
            const v2 = d2[row.key];
            const winner = row.better === "higher" ? (v1 > v2 ? r1 : v2 > v1 ? r2 : "Tie") : (v1 < v2 ? r1 : v2 < v1 ? r2 : "Tie");
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? "#111827" : "#0f1218", borderTop: "1px solid #1f2937" }}>
                <td style={{ padding: "7px 12px", color: "#d1d5db" }}>{row.label}</td>
                <td style={{ padding: "7px 12px", textAlign: "center", color: winner === r1 ? "#4ade80" : "#d1d5db", fontWeight: winner === r1 ? 600 : 400 }}>{row.unit === "$" ? "$" : ""}{typeof v1 === "number" ? v1.toLocaleString() : v1}{row.unit !== "$" ? " " + row.unit : ""}</td>
                <td style={{ padding: "7px 12px", textAlign: "center", color: winner === r2 ? "#4ade80" : "#d1d5db", fontWeight: winner === r2 ? 600 : 400 }}>{row.unit === "$" ? "$" : ""}{typeof v2 === "number" ? v2.toLocaleString() : v2}{row.unit !== "$" ? " " + row.unit : ""}</td>
                <td style={{ padding: "7px 12px", textAlign: "center" }}>
                  {winner === "Tie" ? <span style={{ color: "#6b7280", fontSize: 10 }}>-</span> : <span style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{winner}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RenderMsg({ text }: { text: string }) {
  return (
    <div style={{ lineHeight: 1.7 }}>
      {text.split("\n").map((line, i) => (
        <p key={i} style={{ margin: "2px 0", fontSize: 13 }}>{line}</p>
      ))}
    </div>
  );
}

type Msg = { role: "user" | "assistant"; content: string; extra?: any; ts: Date };

function ChatTab() {
  const [rig1, setRig1] = useState("RIG-01");
  const [rig2, setRig2] = useState("None");
  const [project, setProject] = useState("Project Alpha");
  const [date, setDate] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: "Welcome to XPLORIX Intelligence Chat!\n\nSelect your rig and ask me anything:\n- Who is the best driller?\n- Incidents on RIG-02?\n- Bit replacement status\n- Maintenance overview\n- Full summary\n- Compare rigs (select two rigs first)", ts: new Date() }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const QUICK = ["Best driller?", "Incidents on RIG-02", "Bit status", "Maintenance", "Full summary", "Compare rigs"];

  function send(text?: string) {
    const q = text || input;
    if (!q.trim() || typing) return;
    setMsgs((p) => [...p, { role: "user", content: q, ts: new Date() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const res = processChat(q, rig1, rig2, project, date);
      setMsgs((p) => [...p, { role: "assistant", content: res.text, extra: res, ts: new Date() }]);
      setTyping(false);
    }, 800 + Math.random() * 400);
  }

  const sel = { background: "#1f2937", border: "1px solid #374151", color: "#f1f5f9", fontSize: 13, borderRadius: 8, padding: "8px 10px", width: "100%", outline: "none" };
  const lbl = { fontSize: 11, color: "#6b7280", display: "block" as const, marginBottom: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        <div><label style={lbl}>Primary Rig</label><select value={rig1} onChange={(e) => setRig1(e.target.value)} style={sel}>{RIGS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label style={lbl}>Compare With</label><select value={rig2} onChange={(e) => setRig2(e.target.value)} style={sel}><option>None</option>{RIGS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label style={lbl}>Project</label><select value={project} onChange={(e) => setProject(e.target.value)} style={sel}>{PROJECTS.map((p) => <option key={p}>{p}</option>)}</select></div>
        <div><label style={lbl}>Date Range</label>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="date" value={date.split("|")[0] || ""} onChange={(e) => setDate(e.target.value + "|" + (date.split("|")[1] || ""))} style={{ ...sel, padding: "7px 6px", fontSize: 11 }} />
            <span style={{ color: "#6b7280", fontSize: 10, flexShrink: 0 }}>to</span>
            <input type="date" value={date.split("|")[1] || ""} onChange={(e) => setDate((date.split("|")[0] || "") + "|" + e.target.value)} style={{ ...sel, padding: "7px 6px", fontSize: 11 }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {QUICK.map((q) => <button key={q} onClick={() => send(q)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: "1px solid #374151", background: "#1f2937", color: "#9ca3af", cursor: "pointer" }}>{q}</button>)}
      </div>
      <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.role === "assistant" ? "rgba(249,115,22,0.15)" : "#374151", border: msg.role === "assistant" ? "1px solid rgba(249,115,22,0.3)" : "1px solid #4b5563" }}>
              {msg.role === "assistant" ? <Bot size={14} color="#f97316" /> : <User size={14} color="#9ca3af" />}
            </div>
            <div style={{ maxWidth: "78%", background: msg.role === "user" ? "#f97316" : "#1f2937", border: msg.role === "user" ? "none" : "1px solid #374151", borderRadius: 12, borderTopLeftRadius: msg.role === "user" ? 12 : 4, borderTopRightRadius: msg.role === "user" ? 4 : 12, padding: "10px 14px", color: msg.role === "user" ? "white" : "#e2e8f0" }}>
              <RenderMsg text={msg.content} />
              {msg.extra && msg.extra.type === "compare" && msg.extra.d1 && msg.extra.d2 && <CompareTable r1={msg.extra.r1} r2={msg.extra.r2} d1={msg.extra.d1} d2={msg.extra.d2} />}
              <p style={{ fontSize: 10, marginTop: 6, color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "#6b7280" }}>{msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <Bot size={14} color="#f97316" />
            </div>
            <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, borderTopLeftRadius: 4, padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 150, 300].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", display: "inline-block", animation: "bounce 1s infinite", animationDelay: d + "ms" }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: "8px 12px" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={"Ask about " + rig1 + (rig2 !== "None" ? " vs " + rig2 : "") + "..."} style={{ flex: 1, background: "none", border: "none", color: "#f1f5f9", fontSize: 13, outline: "none" }} />
        <button onClick={() => send()} disabled={!input.trim() || typing} style={{ width: 32, height: 32, borderRadius: 8, background: "#f97316", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: !input.trim() || typing ? 0.4 : 1 }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

function PredTab() {
  const [proj, setProj] = useState("Project Alpha");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function run() { setLoading(true); setDone(false); setTimeout(() => { setLoading(false); setDone(true); }, 1800); }
  function reset() { setDone(false); }

  const pd = getProjData(proj);
  const pr = genPred(proj);
  const rigs = PROJ_RIGS[proj] || [];

  const cards = [
    { label: "Predicted ROP", icon: Activity, cur: pd.rop + " m/hr", pred: pr.rop + " m/hr", delta: +(pr.rop - pd.rop).toFixed(1), up: true, color: "#60a5fa", bg: "rgba(96,165,250,0.08)", bc: "rgba(96,165,250,0.2)" },
    { label: "Total Meters", icon: BarChart3, cur: (pd.mpd * 28).toLocaleString() + " m", pred: pr.meters.toLocaleString() + " m", delta: pr.meters - pd.mpd * 28, up: true, color: "#4ade80", bg: "rgba(74,222,128,0.08)", bc: "rgba(74,222,128,0.2)" },
    { label: "Avg Downtime", icon: Clock, cur: pd.dt + " hrs/day", pred: pr.dt + " hrs/day", delta: +(pr.dt - pd.dt).toFixed(1), up: false, color: "#facc15", bg: "rgba(250,204,21,0.08)", bc: "rgba(250,204,21,0.2)" },
    { label: "Revenue Forecast", icon: TrendingUp, cur: "$" + pd.hist[4].rev.toLocaleString(), pred: "$" + pr.rev.toLocaleString(), delta: pr.rev - pd.hist[4].rev, up: true, color: "#34d399", bg: "rgba(52,211,153,0.08)", bc: "rgba(52,211,153,0.2)" },
    { label: "Cost Projection", icon: DollarSign, cur: "$" + pd.cost.toLocaleString() + "/day", pred: "$" + pr.cost.toLocaleString() + "/day", delta: pr.cost - pd.cost, up: false, color: "#fb923c", bg: "rgba(251,146,60,0.08)", bc: "rgba(251,146,60,0.2)" },
    { label: "Fleet Efficiency", icon: Zap, cur: pd.eff + "%", pred: Math.min(100, pd.eff + (pr.rop > pd.rop ? 2 : -1)) + "%", delta: pr.rop > pd.rop ? 2 : -1, up: true, color: "#22d3ee", bg: "rgba(34,211,238,0.08)", bc: "rgba(34,211,238,0.2)" },
  ];

  const sel = { background: "#1f2937", border: "1px solid #374151", color: "#f1f5f9", fontSize: 13, borderRadius: 8, padding: "8px 10px", outline: "none", minWidth: 180 };
  const lbl = { fontSize: 11, color: "#6b7280", display: "block" as const, marginBottom: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
        <div><label style={lbl}>Select Project to Predict</label><select value={proj} onChange={(e) => { setProj(e.target.value); reset(); }} style={sel}>{PROJECTS.map((p) => <option key={p}>{p}</option>)}</select></div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {rigs.map((r) => <span key={r} style={{ fontSize: 11, background: "#1f2937", border: "1px solid #374151", color: "#fb923c", padding: "3px 10px", borderRadius: 12 }}>{r}</span>)}
          <span style={{ fontSize: 11, color: "#6b7280" }}>on this project</span>
        </div>
        <button onClick={run} disabled={loading} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "#f97316", border: "none", color: "white", padding: "9px 20px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Brain size={15} />}
          {loading ? "Analyzing..." : "Run AI Prediction"}
        </button>
        {done && <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80", fontSize: 13 }}><CheckCircle size={15} /> Ready</span>}
      </div>

      {!done && !loading && (
        <div style={{ border: "1px dashed #374151", borderRadius: 12, padding: "48px 24px", textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          <Brain size={40} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
          Select a project and click Run AI Prediction
        </div>
      )}
      {loading && (
        <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
          <Brain size={40} color="#f97316" style={{ margin: "0 auto 12px", display: "block", animation: "pulse 1s infinite" }} />
          <p style={{ color: "#d1d5db", fontSize: 13 }}>Analysing {proj}...</p>
        </div>
      )}

      {done && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {cards.map(({ label, icon: Icon, cur, pred, delta, up, color, bg, bc }) => {
              const isGood = up ? delta >= 0 : delta <= 0;
              const DI = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
              return (
                <div key={label} style={{ borderRadius: 10, border: "1px solid " + bc, background: bg, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{label}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Current</span>
                    <span style={{ fontSize: 11, color: "#d1d5db" }}>{cur}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Predicted</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{pred}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: isGood ? "#4ade80" : "#f87171" }}>
                    <DI size={12} />
                    <span style={{ fontSize: 11 }}>{delta > 0 ? "+" : ""}{Math.abs(delta) > 1000 ? "$" + Math.abs(delta).toLocaleString() : delta} {isGood ? "improving" : "declining"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldAlert size={15} color="#f87171" /> Risk Alerts - Next Month
            </p>
            <div style={{ display: "grid", gridTemplateColumns: rigs.length === 1 ? "1fr" : "1fr 1fr", gap: 10 }}>
              {rigs.map((rig) => {
                const risk = riskLevel(rig);
                const rc = risk === "HIGH" ? { bg: "rgba(239,68,68,0.08)", bc: "rgba(239,68,68,0.2)", tc: "#f87171" } : risk === "MEDIUM" ? { bg: "rgba(234,179,8,0.08)", bc: "rgba(234,179,8,0.2)", tc: "#facc15" } : { bg: "rgba(74,222,128,0.08)", bc: "rgba(74,222,128,0.2)", tc: "#4ade80" };
                return (
                  <div key={rig} style={{ borderRadius: 10, border: "1px solid " + rc.bc, background: rc.bg, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13 }}>{rig}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.tc, border: "1px solid " + rc.bc, padding: "2px 8px", borderRadius: 10 }}>{risk} RISK</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "#9ca3af" }}>
                      <div>Maintenance: <span style={{ color: MAINT[rig].status === "OVERDUE" ? "#f87171" : MAINT[rig].status === "SOON" ? "#facc15" : "#4ade80" }}>{MAINT[rig].status}</span></div>
                      <div>Bit: <span style={{ color: BITS[rig].left <= 5 ? "#f87171" : BITS[rig].left <= 14 ? "#facc15" : "#4ade80" }}>{BITS[rig].left}d remaining</span></div>
                      <div>Downtime: <span style={{ color: RIG_DATA[rig].dt > 6 ? "#f87171" : RIG_DATA[rig].dt > 3 ? "#facc15" : "#4ade80" }}>{RIG_DATA[rig].dt} hrs/day</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { title: "ROP Trend + Prediction", icon: Activity, color: "#60a5fa", chart: <LineChart data={pr.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Line type="monotone" dataKey="rop" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="ROP (m/hr)" /></LineChart> },
              { title: "Revenue vs Cost", icon: TrendingUp, color: "#34d399", chart: <BarChart data={pr.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Bar dataKey="rev" fill="#10b981" radius={[4,4,0,0]} name="Revenue ($)" /><Bar dataKey="cost" fill="#f97316" radius={[4,4,0,0]} name="Cost ($)" /></BarChart> },
              { title: "Meters Drilled", icon: BarChart3, color: "#4ade80", chart: <BarChart data={pr.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Bar dataKey="me" fill="#22c55e" radius={[4,4,0,0]} name="Meters" /></BarChart> },
              { title: "Downtime Trend", icon: Clock, color: "#facc15", chart: <LineChart data={pr.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Line type="monotone" dataKey="dt" stroke="#eab308" strokeWidth={2} dot={{ r: 3, fill: "#eab308" }} name="Downtime (hrs)" /></LineChart> },
            ].map(({ title, icon: Icon, color, chart }) => (
              <div key={title} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon size={13} color={color} />{title}</p>
                <ResponsiveContainer width="100%" height={180}>{chart}</ResponsiveContainer>
              </div>
            ))}
          </div>

          <div style={{ background: "#111827", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 10, padding: 16, display: "flex", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Brain size={16} color="#f97316" />
            </div>
            <div>
              <p style={{ color: "#f97316", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>AI Summary - {proj} Next Month</p>
              <p style={{ color: "#d1d5db", fontSize: 12, lineHeight: 1.7 }}>
                Based on {proj} data across {rigs.join(", ")}, ROP is predicted at {pr.rop} m/hr with total output of {pr.meters.toLocaleString()} meters. Revenue forecast: ${pr.rev.toLocaleString()}.
                {rigs.some((r) => MAINT[r].status === "OVERDUE") ? " Critical: maintenance overdue on one or more rigs." : " Maintenance schedule is on track."}
                {rigs.some((r) => BITS[r].left <= 5) ? " Bit replacement needed within 5 days." : ""}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const REPORT_STEPS = ["Collecting operational data...","Analysing performance metrics...","Detecting issues and anomalies...","Generating recommendations...","Building report and charts..."];

function ReportTab() {
  const [proj, setProj] = useState("Project Alpha");
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState("2026-05-31");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  function reset() { setDone(false); }

  function generate() {
    setLoading(true); setDone(false); setStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setStep(s);
      if (s >= REPORT_STEPS.length - 1) clearInterval(iv);
    }, 600);
    setTimeout(() => { setLoading(false); setDone(true); }, 3200);
  }

  function handlePrint() { window.print(); }

  function handleExport() {
    const el = reportRef.current;
    if (!el) return;
    const blob = new Blob([el.innerText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "XPLORIX_Report_" + proj.replace(/ /g, "_") + ".txt";
    a.click();
  }

  const pd = getProjData(proj);
  const rigs = PROJ_RIGS[proj] || [];
  const totalRev = pd.hist.reduce((s: number, h: any) => s + h.rev, 0);
  const totalCost = pd.hist.reduce((s: number, h: any) => s + h.cost, 0);
  const profit = totalRev - totalCost;

  const issues: { sev: string; txt: string }[] = [];
  rigs.forEach((r) => {
    if (MAINT[r].status === "OVERDUE") issues.push({ sev: "HIGH", txt: r + ": Maintenance overdue by " + Math.abs(MAINT[r].due) + " days" });
    if (BITS[r].left <= 14) issues.push({ sev: BITS[r].left <= 5 ? "HIGH" : "MEDIUM", txt: r + ": Bit replacement due in " + BITS[r].left + " days (" + BITS[r].type + ")" });
    if (RIG_DATA[r].inc > 0) issues.push({ sev: "MEDIUM", txt: r + ": " + RIG_DATA[r].inc + " safety incident(s) recorded" });
  });

  const sel = { background: "#1f2937", border: "1px solid #374151", color: "#f1f5f9", fontSize: 13, borderRadius: 8, padding: "8px 10px", outline: "none" };
  const lbl = { fontSize: 11, color: "#6b7280", display: "block" as const, marginBottom: 4 };

  const hasHigh = issues.some((i) => i.sev === "HIGH");
  const statusBg = hasHigh ? "rgba(239,68,68,0.1)" : issues.length > 0 ? "rgba(234,179,8,0.1)" : "rgba(74,222,128,0.1)";
  const statusBorder = hasHigh ? "rgba(239,68,68,0.3)" : issues.length > 0 ? "rgba(234,179,8,0.3)" : "rgba(74,222,128,0.3)";
  const statusColor = hasHigh ? "#f87171" : issues.length > 0 ? "#facc15" : "#4ade80";
  const statusText = hasHigh ? "ACTION REQUIRED" : issues.length > 0 ? "ATTENTION NEEDED" : "ALL GOOD";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 14 }}>
        <div><label style={lbl}>Project</label><select value={proj} onChange={(e) => { setProj(e.target.value); reset(); }} style={{ ...sel, minWidth: 180 }}>{PROJECTS.map((p) => <option key={p}>{p}</option>)}</select></div>
        <div><label style={lbl}>From</label><input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); reset(); }} style={sel} /></div>
        <div><label style={lbl}>To</label><input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); reset(); }} style={sel} /></div>
        <button onClick={generate} disabled={loading} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "#f97316", border: "none", color: "white", padding: "9px 20px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <FileText size={15} />}
          {loading ? "Generating..." : "Generate Report"}
        </button>
        {done && (
          <>
            <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1f2937", border: "1px solid #374151", color: "#e2e8f0", padding: "9px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}><Printer size={15} /> Print</button>
            <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1f2937", border: "1px solid #374151", color: "#e2e8f0", padding: "9px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}><Download size={15} /> Export</button>
          </>
        )}
      </div>

      {loading && (
        <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Brain size={40} color="#f97316" style={{ animation: "pulse 1s infinite" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 260 }}>
            {REPORT_STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: i < step ? "#4ade80" : i === step ? "#e2e8f0" : "#6b7280" }}>
                {i < step ? <CheckCircle size={14} color="#4ade80" /> : i === step ? <RefreshCw size={14} color="#f97316" style={{ animation: "spin 1s linear infinite" }} /> : <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid #374151" }} />}
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !done && (
        <div style={{ border: "1px dashed #374151", borderRadius: 12, padding: "48px 24px", textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
          Select a project and date range, then click Generate Report
        </div>
      )}

      {done && (
        <div ref={reportRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "linear-gradient(90deg, rgba(249,115,22,0.08), transparent)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>XPLORIX Intelligence Report</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{proj} - Operations Report</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{fromDate} to {toDate} - Generated {new Date().toLocaleDateString()}</div>
            </div>
            <div style={{ background: statusBg, border: "1px solid " + statusBorder, color: statusColor, padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{statusText}</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", paddingBottom: 12, borderBottom: "1px solid #1f2937", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#f97316", fontWeight: 700, flexShrink: 0 }}>1</span>
              Executive Summary
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Total Meters Drilled", value: (pd.mpd * 28).toLocaleString() + " m", color: "#4ade80" },
                { label: "Fleet Avg ROP", value: pd.rop + " m/hr", color: "#60a5fa" },
                { label: "Total Revenue", value: "$" + Math.round(totalRev).toLocaleString(), color: "#34d399" },
                { label: "Net Profit", value: "$" + Math.round(profit).toLocaleString(), color: profit > 0 ? "#4ade80" : "#f87171" },
                { label: "Active Rigs", value: rigs.length.toString(), color: "#fb923c" },
                { label: "Fleet Efficiency", value: pd.eff + "%", color: "#22d3ee" },
                { label: "Total Incidents", value: pd.inc.toString(), color: pd.inc === 0 ? "#4ade80" : "#f87171" },
                { label: "Avg Downtime", value: pd.dt + " hrs/day", color: pd.dt < 4 ? "#4ade80" : "#facc15" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#1f2937", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.7 }}>
              {proj} operated with {rigs.length} active rig{rigs.length > 1 ? "s" : ""} ({rigs.join(", ")}) achieving {pd.eff}% fleet efficiency.
              {hasHigh ? " " + issues.filter((i) => i.sev === "HIGH").length + " high-priority issues require immediate attention." : issues.length > 0 ? " " + issues.length + " item(s) to monitor." : " No critical issues - excellent performance."}
            </p>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", paddingBottom: 12, borderBottom: "1px solid #1f2937", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(96,165,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#60a5fa", fontWeight: 700, flexShrink: 0 }}>2</span>
              Performance Analysis
            </h3>
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1f2937" }}>
                    {["Rig","Driller","ROP","m/day","Downtime","Efficiency","Daily Cost"].map((h) => (
                      <th key={h} style={{ padding: "7px 10px", textAlign: h === "Rig" || h === "Driller" ? "left" : "center", color: "#6b7280", fontWeight: 500, fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rigs.map((rig, i) => {
                    const d = RIG_DATA[rig];
                    return (
                      <tr key={rig} style={{ background: i % 2 === 0 ? "transparent" : "#0f1218", borderTop: "1px solid #1f2937" }}>
                        <td style={{ padding: "7px 10px", fontWeight: 700, color: "#f97316" }}>{rig}</td>
                        <td style={{ padding: "7px 10px", color: "#9ca3af" }}>{DRILLERS[rig]}</td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: "#60a5fa", fontWeight: 600 }}>{d.rop} m/hr</td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: "#4ade80", fontWeight: 600 }}>{d.mpd}m</td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: d.dt > 6 ? "#f87171" : d.dt > 3 ? "#facc15" : "#4ade80", fontWeight: 600 }}>{d.dt} hrs</td>
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          <span style={{ background: d.eff > 90 ? "rgba(74,222,128,0.1)" : d.eff > 78 ? "rgba(250,204,21,0.1)" : "rgba(248,113,113,0.1)", color: d.eff > 90 ? "#4ade80" : d.eff > 78 ? "#facc15" : "#f87171", padding: "2px 8px", borderRadius: 10, fontSize: 11 }}>{d.eff}%</span>
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: "#d1d5db" }}>${d.cost.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { title: "Monthly Meters Drilled", color: "#f97316", chart: <BarChart data={pd.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Bar dataKey="me" fill="#f97316" radius={[4,4,0,0]} name="Meters" /></BarChart> },
                { title: "Revenue vs Cost", color: "#34d399", chart: <BarChart data={pd.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Legend wrapperStyle={{ fontSize: 10 }} /><Bar dataKey="rev" fill="#10b981" radius={[4,4,0,0]} name="Revenue" /><Bar dataKey="cost" fill="#f97316" radius={[4,4,0,0]} name="Cost" /></BarChart> },
                { title: "ROP Trend", color: "#60a5fa", chart: <LineChart data={pd.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Line type="monotone" dataKey="rop" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Avg ROP" /></LineChart> },
                { title: "Downtime Trend", color: "#facc15", chart: <LineChart data={pd.hist}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 10 }} /><Tooltip content={<TT />} /><Line type="monotone" dataKey="dt" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} name="Downtime (hrs)" /></LineChart> },
              ].map(({ title, color, chart }) => (
                <div key={title} style={{ background: "#0f1218", border: "1px solid #1f2937", borderRadius: 10, padding: 14 }}>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>{title}</p>
                  <ResponsiveContainer width="100%" height={160}>{chart}</ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", paddingBottom: 12, borderBottom: "1px solid #1f2937", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#f87171", fontWeight: 700, flexShrink: 0 }}>3</span>
              Issues and Anomalies
            </h3>
            {issues.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8, padding: 12, color: "#4ade80", fontSize: 13 }}>
                <CheckCircle size={18} /> No issues detected. All systems nominal.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {issues.map((issue, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 8, border: "1px solid " + (issue.sev === "HIGH" ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)"), background: issue.sev === "HIGH" ? "rgba(239,68,68,0.07)" : "rgba(234,179,8,0.07)" }}>
                    <AlertTriangle size={15} color={issue.sev === "HIGH" ? "#f87171" : "#facc15"} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, marginRight: 8, background: issue.sev === "HIGH" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)", color: issue.sev === "HIGH" ? "#f87171" : "#facc15" }}>{issue.sev}</span>
                      <span style={{ fontSize: 12, color: "#d1d5db" }}>{issue.txt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", paddingBottom: 12, borderBottom: "1px solid #1f2937", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#4ade80", fontWeight: 700, flexShrink: 0 }}>4</span>
              AI Recommendations
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {([
                rigs.some((r) => MAINT[r].status === "OVERDUE") && { p: "URGENT", col: "#f87171", bg: "rgba(239,68,68,0.07)", bc: "rgba(239,68,68,0.2)", icon: <Wrench size={16} color="#f87171" />, txt: "Schedule immediate maintenance for " + rigs.filter((r) => MAINT[r].status === "OVERDUE").join(", ") + ". Overdue service increases breakdown risk by 3x." },
                rigs.some((r) => BITS[r].left <= 14) && { p: "HIGH", col: "#fb923c", bg: "rgba(249,115,22,0.07)", bc: "rgba(249,115,22,0.2)", icon: <HardHat size={16} color="#fb923c" />, txt: "Order replacement bits for " + rigs.filter((r) => BITS[r].left <= 14).join(", ") + " within " + Math.min(...rigs.filter((r) => BITS[r].left <= 14).map((r) => BITS[r].left)) + " days." },
                pd.dt > 4 && { p: "MEDIUM", col: "#facc15", bg: "rgba(234,179,8,0.07)", bc: "rgba(234,179,8,0.2)", icon: <Clock size={16} color="#facc15" />, txt: "Fleet downtime of " + pd.dt + " hrs/day exceeds target. Review shift handover and pre-shift inspection checklists." },
                { p: "OPTIMIZE", col: "#60a5fa", bg: "rgba(96,165,250,0.07)", bc: "rgba(96,165,250,0.2)", icon: <TrendingUp size={16} color="#60a5fa" />, txt: "Best rig is " + [...rigs].sort((a, b) => RIG_DATA[b].eff - RIG_DATA[a].eff)[0] + " at " + RIG_DATA[[...rigs].sort((a, b) => RIG_DATA[b].eff - RIG_DATA[a].eff)[0]].eff + "% efficiency. Apply its parameters to lower-performing rigs." },
                { p: "FINANCIAL", col: "#34d399", bg: "rgba(52,211,153,0.07)", bc: "rgba(52,211,153,0.2)", icon: <DollarSign size={16} color="#34d399" />, txt: "Cost per meter: $" + (pd.cost / pd.mpd).toFixed(2) + "/m. A 5% ROP improvement saves approximately $" + Math.round((pd.cost / pd.mpd) * 0.05 * pd.mpd * 28).toLocaleString() + " per month." },
              ] as any[]).filter(Boolean).map((rec: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 8, border: "1px solid " + rec.bc, background: rec.bg }}>
                  {rec.icon}
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, marginRight: 8, background: rec.bg, color: rec.col, border: "1px solid " + rec.bc }}>{rec.p}</span>
                    <span style={{ fontSize: 12, color: "#d1d5db" }}>{rec.txt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4b5563", paddingTop: 10, borderTop: "1px solid #1f2937" }}>
            <span>XPLORIX Intelligence Platform - Auto-generated report</span>
            <span>Generated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function XplorixIntelligencePage() {
  const [tab, setTab] = useState<"chat" | "predict" | "report">("chat");
  const tabStyle = (active: boolean) => ({
    display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", transition: "all 0.2s",
    background: active ? "#f97316" : "transparent", color: active ? "white" : "#6b7280", boxShadow: active ? "0 4px 20px rgba(249,115,22,0.2)" : "none",
  });
  return (
    <div style={{ minHeight: "100vh", background: "#030712", padding: 24 }}>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Brain size={24} color="#f97316" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>XPLORIX Intelligence</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>AI-powered drilling insights, predictions and reports</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", padding: "5px 12px", borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
          Intelligence Active
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, background: "#0f1218", border: "1px solid #1f2937", padding: 4, borderRadius: 12, marginBottom: 20, width: "fit-content" }}>
        <button style={tabStyle(tab === "chat")} onClick={() => setTab("chat")}><Bot size={15} /> AI Chat <span style={{ fontSize: 11, opacity: 0.7 }}>- query data</span></button>
        <button style={tabStyle(tab === "predict")} onClick={() => setTab("predict")}><Brain size={15} /> AI Prediction <span style={{ fontSize: 11, opacity: 0.7 }}>- forecast</span></button>
        <button style={tabStyle(tab === "report")} onClick={() => setTab("report")}><FileText size={15} /> AI Report <span style={{ fontSize: 11, opacity: 0.7 }}>- full report</span></button>
      </div>
      <div style={{ background: "#0f1218", border: "1px solid #1f2937", borderRadius: 16, padding: 24 }}>
        {tab === "chat" && <ChatTab />}
        {tab === "predict" && <PredTab />}
        {tab === "report" && <ReportTab />}
      </div>
    </div>
  );
}

