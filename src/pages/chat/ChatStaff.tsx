import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { chatApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import type { Message } from '../../types'

export default function ChatStaff() {
  const { studentId } = useParams<{ studentId: string }>()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [otherUser, setOtherUser] = useState<string>('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!studentId) return
    chatApi.getMessages(Number(studentId))
      .then((res) => {
        setMessages(res.messages)
        setOtherUser(res.otherUser)
      })
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load messages'))
      .finally(() => setLoading(false))
  }, [studentId])

  useEffect(() => {
    if (!socket) return
    const handler = (data: { user: { id: number; name: string }; message: string; timestamp: string }) => {
      if (String(data.user.id) === studentId) {
        setMessages((prev) => [
          ...prev,
          { content: data.message, timestamp: data.timestamp, message_type: 'incoming', sender_name: data.user.name },
        ])
      }
    }
    socket.on('chat message', handler)
    return () => { socket.off('chat message', handler) }
  }, [socket, studentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!input.trim() || !socket || !user || !studentId) return
    const message = input.trim()
    socket.emit('chat message', {
      message,
      sender: { id: user.id, name: user.name },
      receiver: { user_id: Number(studentId) },
    })
    setMessages((prev) => [
      ...prev,
      { content: message, timestamp: new Date().toISOString(), message_type: 'outgoing', sender_name: user.name },
    ])
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading messages...</div>
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Chat with {otherUser}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.message_type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-xl px-4 py-2 ${
                msg.message_type === 'outgoing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow-md'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className={`mt-1 text-xs ${msg.message_type === 'outgoing' ? 'text-blue-200' : 'text-gray-400'}`}>
                {msg.sender_name} &middot; {new Date(msg.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-white px-6 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
