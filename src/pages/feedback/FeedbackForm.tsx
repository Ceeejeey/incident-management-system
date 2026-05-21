import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { feedbackApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import type { Incident } from '../../types'

const RATINGS = [1, 2, 3, 4, 5]

export default function FeedbackForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [incidentId, setIncidentId] = useState<number | ''>('')
  const [rating, setRating] = useState<number>(0)
  const [comments, setComments] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    feedbackApi.getUserIncidents()
      .then((res) => setIncidents(res.incidents))
      .catch(() => setError('Failed to load incidents'))
      .finally(() => setFetching(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!incidentId || !rating) return
    setMessage('')
    setError('')
    setLoading(true)
    try {
      const res = await feedbackApi.submit({ incident_id: Number(incidentId), rating, comments: comments || undefined })
      setMessage(res.message)
      setIncidentId('')
      setRating(0)
      setComments('')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Submit Feedback</h1>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {fetching ? (
          <p className="text-gray-500">Loading incidents...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-md">
            <div>
              <label htmlFor="incident" className="block text-sm font-medium text-gray-700">
                Incident
              </label>
              <select
                id="incident"
                required
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select an incident</option>
                {incidents.map((inc) => (
                  <option key={inc.incident_id} value={inc.incident_id}>
                    {inc.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">Rating</span>
              <div className="mt-1 flex gap-1">
                {RATINGS.map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comments (optional)
              </label>
              <textarea
                id="comments"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !incidentId || !rating}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
