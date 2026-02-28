'use client'

import { useState } from 'react'
import { Brain, AlertTriangle, TrendingUp, TrendingDown, Lightbulb, X, Bell, ChevronRight } from 'lucide-react'

interface Insight {
  id: string
  type: 'anomaly' | 'prediction' | 'recommendation' | 'trend'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  metric: string
  change?: string
  recommendation?: string
}

interface AIInsightsProps {
  dashboardType: 'operation' | 'maintenance' | 'driller' | 'consumables' | 'hsc'
  insights: Insight[]
}

const severityColors = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  critical: 'bg-red-50 border-red-200 text-red-800'
}

const typeIcons = {
  anomaly: AlertTriangle,
  prediction: TrendingUp,
  recommendation: Lightbulb,
  trend: TrendingDown
}

export default function AIInsights({ dashboardType, insights }: AIInsightsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)

  // Mobile view - show as expandable section at top
  const MobileView = () => (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6" />
          <div className="text-left">
            <h3 className="font-semibold">AI Insights</h3>
            <p className="text-sm text-white/80">{insights.length} insights available</p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-3">
          {insights.map((insight) => {
            const Icon = typeIcons[insight.type]
            return (
              <div
                key={insight.id}
                onClick={() => setSelectedInsight(insight)}
                className={`p-4 rounded-lg border cursor-pointer ${severityColors[insight.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-xs mt-1 opacity-90 line-clamp-2">{insight.description}</p>
                    {insight.change && (
                      <p className="text-xs mt-2 font-semibold">
                        Projected: {insight.change}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // Desktop view - floating panel
  const DesktopView = () => {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden lg:flex fixed right-4 top-24 z-40 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition items-center gap-2"
        >
          <Brain className="w-6 h-6" />
          <span className="text-sm font-medium pr-1">AI Insights</span>
          {insights.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {insights.length}
            </span>
          )}
        </button>
      )
    }

    return (
      <div className="hidden lg:block fixed right-4 top-24 w-80 bg-white rounded-xl shadow-xl z-40 max-h-[calc(100vh-120px)] overflow-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl">
          <div className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5" />
            <h3 className="font-semibold">AI Insights</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {insights.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Analyzing your data... Insights will appear here.
            </p>
          ) : (
            insights.map((insight) => {
              const Icon = typeIcons[insight.type]
              return (
                <div
                  key={insight.id}
                  onClick={() => setSelectedInsight(insight)}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition ${severityColors[insight.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs mt-1 opacity-90">{insight.description}</p>
                      {insight.change && (
                        <p className="text-xs mt-1 font-semibold">
                          Projected: {insight.change}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <MobileView />
      <DesktopView />

      {/* Detail Modal - Works for both mobile and desktop */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = typeIcons[selectedInsight.type]
                  return <Icon className="w-6 h-6 text-purple-600" />
                })()}
                <h3 className="text-lg font-semibold">{selectedInsight.title}</h3>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className={`p-3 rounded-lg mb-4 ${severityColors[selectedInsight.severity]}`}>
              <p className="text-sm">{selectedInsight.description}</p>
            </div>

            {selectedInsight.recommendation && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">AI Recommendation:</p>
                <p className="text-sm text-blue-800">{selectedInsight.recommendation}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedInsight(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
