import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
          Drilling Platform MVP
        </h1>
        <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          Analytics Dashboard for drilling operations. Manage projects, rigs, and monitor performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Link href="/supervisor/dashboard">
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/50 transition-all">
            <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">Supervisor Dashboard</h3>
            <p className="text-[#94A3B8]">Access supervisor tools and analytics</p>
          </div>
        </Link>

        <Link href="/supervisor/drilling-log">
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/50 transition-all">
            <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">Drilling Log</h3>
            <p className="text-[#94A3B8]">Record daily drilling operations</p>
          </div>
        </Link>

        <Link href="/admin/dashboard">
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/50 transition-all">
            <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">Admin Dashboard</h3>
            <p className="text-[#94A3B8]">Manage users, projects, and settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
