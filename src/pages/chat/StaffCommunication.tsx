import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../../api/endpoints'
import type { StudentWithUnread } from '../../types'

export default function StaffCommunication() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentWithUnread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    chatApi.getStudentsWithUnread()
      .then((res) => setStudents(res.studentsWithUnreadMessages))
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load students'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading students...</div>
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
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Student Messages</h1>
        {students.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-md">
            No messages from students yet.
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <button
                key={student.student_id}
                onClick={() => navigate(`/communication/chat/staff/${student.student_id}`)}
                className="flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-md transition-shadow hover:shadow-lg"
              >
                <span className="text-lg font-medium text-gray-900">{student.name}</span>
                {student.unread_count > 0 && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                    {student.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
