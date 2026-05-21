import { useState, useEffect } from 'react'
import { notificationApi } from '../../api/endpoints'
import type { Notification } from '../../types'

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    notificationApi.getStudent()
      .then((res) => setNotifications(res.notifications))
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load notifications'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-md">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const id = notif.notification_id ?? notif.id ?? 0
              const isExpanded = expandedId === id
              return (
                <div
                  key={id}
                  className="rounded-xl bg-white shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                  >
                    <div className="flex-1">
                      <p className={`text-sm ${notif.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                        {notif.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(notif.timestamp || notif.created_at || '').toLocaleString()}
                      </p>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="border-t px-6 py-4 space-y-2">
                      {notif.incident_title && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Incident:</span> {notif.incident_title}
                        </p>
                      )}
                      {notif.staff_name && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Staff:</span> {notif.staff_name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
