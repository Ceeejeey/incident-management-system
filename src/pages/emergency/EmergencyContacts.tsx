import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../../api/endpoints'

export default function EmergencyContacts() {
  const navigate = useNavigate()
  const [staff, setStaff] = useState<{ user_id: number; name: string }[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userApi.getStaff()
      .then((res) => setStaff(res.staff))
      .catch(() => setError('Failed to load staff contacts'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Loading staff contacts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Emergency Contacts</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <div
              key={member.user_id}
              className="rounded-xl bg-white p-5 shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-900">{member.name}</h2>
              <button
                onClick={() => navigate(`/communication/chat/student?staffId=${member.user_id}`)}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Chat
              </button>
            </div>
          ))}
        </div>

        {staff.length === 0 && !error && (
          <p className="text-gray-500">No staff contacts available.</p>
        )}
      </div>
    </div>
  )
}
