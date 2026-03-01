import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NotificationCenter from '../../components/NotificationCenter'

export default function AdminAnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
          <div className="scale-75 origin-right">
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboards
            </Link>
            <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
            <NotificationCenter />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {children}
      </main>
    </div>
  )
}
