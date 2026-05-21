import { useState, useEffect } from 'react'
import { emergencyApi } from '../../api/endpoints'
import type { EmergencyContact } from '../../types'

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl bg-white shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-lg font-semibold text-gray-900">{contact.role}</span>
        <span className={`transform text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {open && (
        <div className="border-t px-5 py-4 text-sm text-gray-600 space-y-2">
          <p><span className="font-medium text-gray-700">Address:</span> {contact.address}</p>
          <p><span className="font-medium text-gray-700">Email:</span> {contact.email}</p>
          <p><span className="font-medium text-gray-700">Office:</span> {contact.office}</p>
          <p><span className="font-medium text-gray-700">Fax:</span> {contact.fax}</p>
        </div>
      )}
    </div>
  )
}

export default function EmergencyContactList() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    emergencyApi.getContacts()
      .then((res) => setContacts(res.contacts))
      .catch(() => setError('Failed to load emergency contacts'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-500">Loading emergency contacts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Emergency Contact List</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-3">
          {contacts.map((contact, i) => (
            <ContactCard key={i} contact={contact} />
          ))}
        </div>

        {contacts.length === 0 && !error && (
          <p className="text-gray-500">No emergency contacts available.</p>
        )}
      </div>
    </div>
  )
}
