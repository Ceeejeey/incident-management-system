import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const links = [
  { to: '/student/report', label: 'Report Incident', desc: 'Submit a new incident report' },
  { to: '/student/incidents', label: 'My Incidents', desc: 'View your reported incidents' },
  { to: '/student/emergency', label: 'Emergency Contacts', desc: 'Important emergency numbers' },
  { to: '/notifications', label: 'Notifications', desc: 'View your notifications' },
  { to: '/feedback', label: 'Feedback', desc: 'Submit feedback' },
]

export default function StudentDashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-gray-600">
            Student Dashboard
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900">{link.label}</h2>
              <p className="mt-2 text-gray-600">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
