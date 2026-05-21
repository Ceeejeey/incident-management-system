import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../../api/endpoints'
import type { Notification } from '../../types'

export default function StaffNotifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    notificationApi.getStaff()
      .then((res) => setNotifications(res.notifications))
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load notifications'))
      .finally(() => setLoading(false))
  }, [])

  async function markAsRead(notif: Notification) {
    const id = notif.notification_id ?? notif.id
    if (!id || notif.is_read) return
    try {
      await notificationApi.markAsRead?.(id)
      setNotifications((prev) =>
        prev.map((n) => {
          const nid = n.notification_id ?? n.id
          return nid === id ? { ...n, is_read: 1 } : n
        })
      )
    } catch {
      // mark as read failed silently
    }
  }

  function handleClick(notif: Notification) {
    if (!notif.is_read) markAsRead(notif)
    if (notif.link) navigate(notif.link)
  }

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
              return (
                <button
                  key={id}
                  onClick={() => handleClick(notif)}
                  className={`w-full rounded-xl px-6 py-4 text-left shadow-md transition-shadow hover:shadow-lg ${
                    notif.is_read ? 'bg-white' : 'bg-blue-50'
                  }`}
                >
                  <p className={`text-sm ${notif.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                    {notif.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(notif.timestamp || notif.created_at || '').toLocaleString()}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
