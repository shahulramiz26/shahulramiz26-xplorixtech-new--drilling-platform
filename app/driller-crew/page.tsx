import { Header } from "@/components/header";
import { MetricCard } from "@/components/metric-card";
import { Users, Award, Clock, GraduationCap } from "lucide-react";

const metrics = [
  {
    title: "Active Crew",
    value: "48",
    unit: "members",
    change: "+3",
    trend: "up",
    icon: Users,
  },
  {
    title: "Performance Score",
    value: "92.4",
    unit: "%",
    change: "+2.1%",
    trend: "up",
    icon: Award,
  },
  {
    title: "Shift Hours",
    value: "1,248",
    unit: "hrs",
    change: "+156",
    trend: "up",
    icon: Clock,
  },
  {
    title: "Certified",
    value: "45",
    unit: "members",
    change: "+2",
    trend: "up",
    icon: GraduationCap,
  },
];

const crewMembers = [
  { id: 1, name: "John Smith", role: "Driller", shift: "Day", performance: 95, status: "Active" },
  { id: 2, name: "Mike Johnson", role: "Assistant Driller", shift: "Day", performance: 88, status: "Active" },
  { id: 3, name: "Sarah Williams", role: "Derrickhand", shift: "Night", performance: 92, status: "Active" },
  { id: 4, name: "Tom Brown", role: "Roughneck", shift: "Night", performance: 85, status: "On Leave" },
  { id: 5, name: "David Lee", role: "Toolpusher", shift: "Day", performance: 98, status: "Active" },
];

export default function DrillerCrewPage() {
  return (
    <div className="space-y-8">
      <Header 
        title="Driller & Crew" 
        subtitle="Performance metrics and personnel management"
        showBack
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="bg-[#151A27] rounded-xl border border-[#2A3040] p-6">
        <h3 className="text-lg font-semibold mb-4">Crew Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3040]">
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Name</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Role</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Shift</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Performance</th>
                <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {crewMembers.map((member) => (
                <tr key={member.id} className="border-b border-[#2A3040]/50">
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">{member.role}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.shift === "Day" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                    }`}>
                      {member.shift}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#2A3040] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${member.performance}%` }}
                        />
                      </div>
                      <span className="text-sm">{member.performance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
