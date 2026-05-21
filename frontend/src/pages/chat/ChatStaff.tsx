import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../../api/endpoints';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../../types';

export default function ChatStaff() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!studentId) return;
    chatApi.getMessages(Number(studentId))
      .then(res => { setMessages(res.messages); setStudentName(res.otherUser.name); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!socket) return;
    const h = (d: { user: { id: number }; message: string; timestamp: string }) => {
      setMessages(p => [...p, { content: d.message, timestamp: d.timestamp, message_type: d.user.id === Number(studentId) ? 'incoming' : 'outgoing', sender_name: d.user.id === Number(studentId) ? studentName : user?.name || '' }]);
    };
    socket.on('chat message', h);
    return () => { socket.off('chat message', h); };
  }, [socket, studentId, studentName, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim() || !socket || !user || !studentId) return;
    socket.emit('chat message', { message: input, sender: { id: user.id, name: user.name }, receiver: { user_id: Number(studentId) } });
    setMessages(p => [...p, { content: input, timestamp: new Date().toISOString(), message_type: 'outgoing', sender_name: user.name }]);
    setInput('');
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div className="card !p-0 flex flex-col h-[calc(75vh)] overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/communication/staff_communication')} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"><ArrowLeft size={16} /></button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 text-xs font-bold">{studentName.charAt(0)}</div>
        <div><h2 className="font-semibold text-gray-900 text-sm">{studentName}</h2><p className="text-[11px] text-gray-400">Student</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-secondary">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={`${i}-${m.timestamp}`}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`flex ${m.message_type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.message_type === 'outgoing'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
              }`}>
                <p className={`text-[11px] mb-0.5 font-medium ${m.message_type === 'outgoing' ? 'text-primary-200' : 'text-gray-400'}`}>{m.sender_name}</p>
                <p>{m.content}</p>
                <p className={`text-[10px] mt-1 ${m.message_type === 'outgoing' ? 'text-primary-200' : 'text-gray-400'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-100 p-3 flex gap-2 bg-white shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          className="input-field flex-1" placeholder="Type a message..." />
        <motion.button whileTap={{ scale: 0.95 }} onClick={send} className="btn-primary shrink-0"><Send size={15} /></motion.button>
      </div>
    </div>
  );
}
