import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-white mb-6">
          Drilling Platform MVP
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Complete drilling operations management system for Exploration and Blast Hole industries
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
          >
            Login
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-sm text-slate-400">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="font-semibold text-white mb-1">Project Management</div>
            <div>Rigs, Drillers, Supervisors, Bits</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="font-semibold text-white mb-1">Daily Operations</div>
            <div>Drilling & Maintenance Logs</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="font-semibold text-white mb-1">Analytics</div>
            <div>5 Dashboards with Insights</div>
          </div>
        </div>
      </div>
    </div>
  )
}
