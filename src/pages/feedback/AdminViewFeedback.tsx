import { useState, useEffect } from 'react'
import { feedbackApi } from '../../api/endpoints'
import type { Feedback } from '../../types'

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rating ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

export default function AdminViewFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    feedbackApi.getAll()
      .then((res) => {
        const sorted = [...res.feedbacks].sort(
          (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        )
        setFeedbacks(sorted)
      })
      .catch(() => setError('Failed to load feedback'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Loading feedback...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Feedback</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback submitted yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-md">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Incident</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Comments</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {feedbacks.map((fb) => (
                  <tr key={fb.feedback_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{fb.user_name}</td>
                    <td className="px-4 py-3 text-gray-900">{fb.incident_description}</td>
                    <td className="px-4 py-3">
                      <StarRating rating={fb.rating} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fb.comments || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(fb.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
