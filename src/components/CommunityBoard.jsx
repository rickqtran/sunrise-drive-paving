import { useState, useEffect } from 'react'
import { FiSend, FiAlertCircle, FiMessageSquare } from 'react-icons/fi'
import { fetchMessages, insertMessage, subscribeToMessages } from '../lib/supabase'

const AVATAR_COLORS = [
  'bg-sunrise-400', 'bg-earth-400', 'bg-teal-500', 'bg-violet-500',
  'bg-pink-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
]

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Demo messages shown when Supabase isn't configured yet
const DEMO_MESSAGES = [
  { id: 1, author_name: 'Maria G.', content: "I've been wanting this for years! Count me in. My car has taken a beating from all the potholes.", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 2, author_name: 'Tom H.', content: "Great initiative! Do we have a timeline yet for when the road work could start if we hit the goal?", created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 3, author_name: 'Priya K.', content: "My kids walk down this road to the bus stop. A paved road would be so much safer for them. 100% behind this.", created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
]

export default function CommunityBoard() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ author_name: '', content: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    loadMessages()

    // Subscribe to real-time new messages
    const channel = subscribeToMessages(payload => {
      if (payload.new) {
        setMessages(prev => [payload.new, ...prev])
      }
    })
    return () => { channel?.unsubscribe?.() }
  }, [])

  async function loadMessages() {
    setLoading(true)
    const { data, error } = await fetchMessages()
    setLoading(false)
    if (error || !data) {
      setIsDemo(true)
      setMessages(DEMO_MESSAGES)
    } else if (data.length === 0) {
      setIsDemo(false)
      setMessages([])
    } else {
      setIsDemo(false)
      setMessages(data)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    if (!form.author_name.trim()) { setStatus('error'); setErrorMsg('Please enter your name.'); return }
    if (!form.content.trim() || form.content.trim().length < 5) {
      setStatus('error'); setErrorMsg('Message must be at least 5 characters.'); return
    }

    const { error } = await insertMessage({
      author_name: form.author_name.trim(),
      content: form.content.trim(),
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message || 'Could not post message. Please try again.')
      return
    }

    setStatus('success')
    setForm({ author_name: '', content: '' })
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <section id="community" className="py-20 bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sunrise-500 font-semibold text-sm uppercase tracking-wider">Neighbor to Neighbor</span>
          <h2 className="section-title mt-1">Chat</h2>
          <p className="section-subtitle">Share your thoughts, ask questions, or show your support.</p>
          {isDemo && (
            <div className="inline-block bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-2 text-sm">
              📋 Showing demo messages — connect Supabase to enable live posts
            </div>
          )}
        </div>

        {/* Post form */}
        <form onSubmit={handleSubmit} className="card mb-8">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <FiMessageSquare className="text-sunrise-500" />
            Post a Message
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
              name="author_name"
              value={form.author_name}
              onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
              placeholder="Your name"
              className="input-field"
              required
            />
            <textarea
              name="content"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your message to the neighborhood..."
              rows={2}
              className="input-field sm:col-span-2 resize-none"
              required
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-3">
              <FiAlertCircle />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm mb-3">
              ✓ Message posted!
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-primary flex items-center gap-2"
          >
            <FiSend size={16} />
            {status === 'submitting' ? 'Posting...' : 'Post Message'}
          </button>
        </form>

        {/* Messages list */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-stone-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-32" />
                    <div className="h-3 bg-stone-100 rounded w-full" />
                    <div className="h-3 bg-stone-100 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))
          ) : messages.length === 0 ? (
            <div className="card text-center py-12 text-stone-400">
              <FiMessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-1">Be the first to say something!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className="card flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {getInitials(msg.author_name)}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-stone-800">{msg.author_name}</span>
                    <span className="text-xs text-stone-400 flex-shrink-0">{timeAgo(msg.created_at)}</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
