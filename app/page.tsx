import { DashboardCard } from "@/components/dashboard-card";
import { Header } from "@/components/header";
import { 
  TrendingUp, 
  Wrench, 
  Users, 
  Flame, 
  ShieldAlert 
} from "lucide-react";

const categories = [
  {
    title: "Operation",
    description: "ROP, motors, downtime",
    icon: TrendingUp,
    href: "/operation",
    color: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Maintenance",
    description: "Service logs, components",
    icon: Wrench,
    href: "/maintenance",
    color: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    title: "Driller & Crew",
    description: "Performance metrics",
    icon: Users,
    href: "/driller-crew",
    color: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Consumables",
    description: "Resource usage",
    icon: Flame,
    href: "/consumables",
    color: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    title: "HSC",
    description: "Safety compliance",
    icon: ShieldAlert,
    href: "/hsc",
    color: "bg-red-500/20",
    iconColor: "text-red-400",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <Header 
        title="Analytics Dashboard" 
        subtitle="Performance metrics for your assigned projects"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <DashboardCard
            key={category.title}
            title={category.title}
            description={category.description}
            icon={category.icon}
            href={category.href}
            color={category.color}
            iconColor={category.iconColor}
          />
        ))}
      </div>
    </div>
  );
}
