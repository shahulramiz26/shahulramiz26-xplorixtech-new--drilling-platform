'use client'

import { useState } from 'react'
import { Bell, X, AlertTriangle, TrendingUp, Lightbulb, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'anomaly' | 'prediction' | 'recommendation' | 'alert'
  title: string
  message: string
  dashboard: string
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'anomaly',
    title: 'Downtime Spike Detected',
    message: 'RIG-001 showing 40% higher downtime than average',
    dashboard: 'Operation',
    timestamp: '2 min ago',
    read: false
  },
  {
    id: '2',
    type: 'prediction',
    title: 'Weekly Forecast',
    message: 'Projected 40hrs downtime this week based on trends',
    dashboard: 'Operation',
    timestamp: '15 min ago',
    read: false
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Maintenance Due',
    message: 'RIG-002 hydraulic system needs preventive maintenance',
    dashboard: 'Maintenance',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: '4',
    type: 'alert',
    title: 'Low ROP Alert',
    message: 'Driller Mike Johnson ROP below target (4.2 m/hr)',
    dashboard: 'Driller & Crew',
    timestamp: '2 hours ago',
    read: true
  },
  {
    id: '5',
    type: 'prediction',
    title: 'Bit Wear Prediction',
    message: 'BIT-003 expected to reach end of life in 3 days',
    dashboard: 'Operation',
    timestamp: '3 hours ago',
    read: true
  }
]

const typeIcons = {
  anomaly: AlertTriangle,
  prediction: TrendingUp,
  recommendation: Lightbulb,
  alert: AlertTriangle
}

const typeColors = {
  anomaly: 'text-red-600 bg-red-50',
  prediction: 'text-blue-600 bg-blue-50',
  recommendation: 'text-amber-600 bg-amber-50',
  alert: 'text-purple-600 bg-purple-50'
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 lg:absolute lg:inset-auto" 
            onClick={() => setIsOpen(false)}
          />
          <div className="
            fixed lg:absolute 
            right-0 lg:right-0 
            top-full mt-2 
            w-[calc(100vw-2rem)] lg:w-96 
            max-w-sm
            bg-white rounded-xl shadow-xl z-50 
            max-h-[70vh] lg:max-h-[500px] 
            overflow-auto
            mx-4 lg:mx-0
          ">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-slate-500 text-sm">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeIcons[notification.type]
                  return (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${typeColors[notification.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-medium text-sm ${
                              !notification.read ? 'text-slate-900' : 'text-slate-600'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-slate-400">
                              {notification.dashboard}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400">
                              {notification.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl sticky bottom-0">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
