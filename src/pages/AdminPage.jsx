import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiLogOut, FiHome, FiMessageSquare, FiDollarSign,
  FiTrash2, FiEdit2, FiCheck, FiX, FiMenu, FiAlertCircle,
  FiCheckCircle, FiRefreshCw,
} from 'react-icons/fi'
import { GiRoad } from 'react-icons/gi'
import {
  fetchPledges, fetchMessages,
  deleteMessage, updatePledgeById, deletePledgeById,
  fetchSetting, upsertSetting,
} from '../lib/supabase'

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'qvtqt'
const SESSION_KEY = 'isAdminAuthenticated'
const DEFAULT_GOAL = 200000

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onSuccess }) {
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      onSuccess()
    } else {
      setError('Invalid credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <GiRoad className="text-sunrise-400 text-3xl" />
          <span className="text-white font-bold text-xl">Sunrise Drive Admin</span>
        </div>
        <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-700 rounded-2xl p-8 space-y-4 shadow-2xl">
          <h2 className="text-white font-bold text-lg text-center mb-2">Sign In</h2>
          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 rounded-lg px-3 py-2 text-red-300 text-sm">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1">Username</label>
            <input
              type="text" autoComplete="username"
              value={user} onChange={e => { setUser(e.target.value); setError('') }}
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sunrise-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1">Password</label>
            <input
              type="password" autoComplete="current-password"
              value={pass} onChange={e => { setPass(e.target.value); setError('') }}
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sunrise-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-sunrise-500 hover:bg-sunrise-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'home',       label: 'Dashboard',  icon: FiHome },
  { id: 'moderation', label: 'Moderation', icon: FiMessageSquare },
  { id: 'finances',   label: 'Finances',   icon: FiDollarSign },
]

function Sidebar({ active, setActive, onLogout, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-stone-900 border-r border-stone-700 flex flex-col z-30
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="px-5 py-5 border-b border-stone-700">
          <div className="flex items-center gap-2">
            <GiRoad className="text-sunrise-400 text-xl flex-shrink-0" />
            <span className="text-white font-bold text-sm leading-tight">Sunrise Drive<br/><span className="text-stone-400 font-normal">Admin</span></span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                ${active === id ? 'bg-sunrise-500/20 text-sunrise-300' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Dashboard Home ─────────────────────────────────────────────────────────────
function DashboardHome({ pledges, messages, goal }) {
  const total = pledges.reduce((s, p) => s + Number(p.amount || 0), 0)
  const pct   = Math.min(100, Math.round((total / goal) * 100))
  const households = new Set(pledges.map(p => p.house_number).filter(Boolean)).size

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pledged',    value: formatCurrency(total),    sub: `of ${formatCurrency(goal)}` },
          { label: 'Households In',    value: `${households} / 20`,     sub: `${20 - households} remaining` },
          { label: 'Still Needed',     value: formatCurrency(Math.max(0, goal - total)), sub: `${100 - pct}% to go` },
          { label: 'Chat Messages',    value: messages.length,           sub: 'total posts' },
        ].map(c => (
          <div key={c.label} className="bg-stone-800 border border-stone-700 rounded-xl p-4">
            <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">{c.label}</div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl p-5">
        <div className="flex justify-between mb-2">
          <span className="text-stone-300 text-sm font-medium">Funding Progress</span>
          <span className="text-sunrise-400 font-bold">{pct}%</span>
        </div>
        <div className="w-full bg-stone-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-sunrise-400 to-sunrise-600 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-stone-500">
          <span>$0</span><span>{formatCurrency(goal)}</span>
        </div>
      </div>

      {/* Recent pledges */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl p-5">
        <h3 className="text-stone-300 text-sm font-semibold mb-3">Recent Pledges</h3>
        {pledges.length === 0
          ? <p className="text-stone-500 text-sm">No pledges yet.</p>
          : (
            <div className="space-y-2">
              {pledges.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-stone-300">{p.name} <span className="text-stone-500 text-xs">#{p.house_number}</span></span>
                  <span className="text-sunrise-400 font-semibold">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

// ── Moderation ────────────────────────────────────────────────────────────────
function Moderation({ messages, setMessages }) {
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast]       = useState(null)

  async function handleDelete(msg) {
    setDeleting(msg.id)
    const { error } = await deleteMessage(msg.id)
    setDeleting(null)
    if (error) {
      setToast({ type: 'error', text: 'Delete failed — check Supabase RLS policies.' })
    } else {
      setMessages(prev => prev.filter(m => m.id !== msg.id))
      setToast({ type: 'success', text: 'Message deleted.' })
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Chat Moderation</h1>
        <span className="text-stone-500 text-sm">{messages.length} messages</span>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm
          ${toast.type === 'success' ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-red-900/40 border border-red-700 text-red-300'}`}>
          {toast.type === 'success' ? <FiCheckCircle size={14}/> : <FiAlertCircle size={14}/>}
          {toast.text}
        </div>
      )}

      {messages.length === 0
        ? <div className="bg-stone-800 border border-stone-700 rounded-xl p-10 text-center text-stone-500">No messages yet.</div>
        : (
          <div className="bg-stone-800 border border-stone-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-700 text-stone-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Author</th>
                  <th className="text-left px-4 py-3">Message</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Posted</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, i) => (
                  <tr key={msg.id} className={`border-b border-stone-700/50 ${i % 2 === 0 ? '' : 'bg-stone-800/50'}`}>
                    <td className="px-4 py-3 font-medium text-stone-300 whitespace-nowrap">{msg.author_name}</td>
                    <td className="px-4 py-3 text-stone-400 max-w-xs truncate">{msg.content}</td>
                    <td className="px-4 py-3 text-stone-500 hidden md:table-cell whitespace-nowrap">{formatDate(msg.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(msg)}
                        disabled={deleting === msg.id}
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 disabled:opacity-40 text-xs font-medium"
                      >
                        <FiTrash2 size={13} />
                        {deleting === msg.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}

// ── Finances ──────────────────────────────────────────────────────────────────
function Finances({ pledges, setPledges, goal, setGoal }) {
  const [editingId, setEditingId]   = useState(null)
  const [editForm, setEditForm]     = useState({ name: '', amount: '', message: '' })
  const [savingId, setSavingId]     = useState(null)
  const [goalInput, setGoalInput]   = useState(String(goal))
  const [savingGoal, setSavingGoal] = useState(false)
  const [toast, setToast]           = useState(null)

  function showToast(type, text) {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3500)
  }

  function startEdit(pledge) {
    setEditingId(pledge.id)
    setEditForm({ name: pledge.name, amount: String(pledge.amount), message: pledge.message || '' })
  }

  async function saveEdit(id) {
    setSavingId(id)
    const { data, error } = await updatePledgeById(id, {
      name: editForm.name,
      amount: parseFloat(editForm.amount),
      message: editForm.message || null,
    })
    setSavingId(null)
    if (error || !data) {
      showToast('error', 'Save failed — check Supabase RLS policies.')
    } else {
      setPledges(prev => prev.map(p => p.id === id ? { ...p, ...data[0] } : p))
      setEditingId(null)
      showToast('success', 'Pledge updated.')
    }
  }

  async function handleDeletePledge(id) {
    if (!confirm('Remove this pledge permanently?')) return
    const { error } = await deletePledgeById(id)
    if (error) {
      showToast('error', 'Delete failed — check Supabase RLS policies.')
    } else {
      setPledges(prev => prev.filter(p => p.id !== id))
      showToast('success', 'Pledge removed.')
    }
  }

  async function saveGoal() {
    const val = parseFloat(goalInput)
    if (isNaN(val) || val < 1000) return
    setSavingGoal(true)
    const { error } = await upsertSetting('project_goal', val)
    setSavingGoal(false)
    if (error) {
      showToast('error', `Could not save to Supabase: ${error.message}. The goal has been updated locally — to persist it, create a "settings" table in Supabase with columns: key (text, unique), value (text).`)
    } else {
      showToast('success', 'Project goal saved and will update for all visitors.')
    }
    setGoal(val)
  }

  const total = pledges.reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Finances</h1>

      {toast && (
        <div className={`flex items-start gap-2 rounded-lg px-4 py-2.5 text-sm
          ${toast.type === 'success' ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-red-900/40 border border-red-700 text-red-300'}`}>
          {toast.type === 'success' ? <FiCheckCircle size={14} className="mt-0.5 flex-shrink-0"/> : <FiAlertCircle size={14} className="mt-0.5 flex-shrink-0"/>}
          {toast.text}
        </div>
      )}

      {/* Goal setting */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl p-5">
        <h3 className="text-stone-300 text-sm font-semibold mb-3">Project Goal Amount</h3>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
            <input
              type="number" min="1000"
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              className="w-full bg-stone-900 border border-stone-600 rounded-lg pl-7 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-sunrise-500"
            />
          </div>
          <button
            onClick={saveGoal}
            disabled={savingGoal}
            className="flex items-center gap-2 bg-sunrise-500 hover:bg-sunrise-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {savingGoal ? <FiRefreshCw size={13} className="animate-spin"/> : <FiCheck size={13}/>}
            {savingGoal ? 'Saving…' : 'Update Goal'}
          </button>
        </div>
        <p className="text-stone-500 text-xs mt-2">
          Updating the goal changes the progress bar for all visitors. Requires a <code className="bg-stone-700 px-1 rounded">settings</code> table in Supabase.
        </p>
      </div>

      {/* Pledge list */}
      <div className="bg-stone-800 border border-stone-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
          <h3 className="text-stone-300 text-sm font-semibold">Pledge List</h3>
          <span className="text-stone-500 text-sm">Total: <strong className="text-sunrise-400">{formatCurrency(total)}</strong></span>
        </div>
        {pledges.length === 0
          ? <div className="p-10 text-center text-stone-500 text-sm">No pledges yet.</div>
          : (
            <div className="divide-y divide-stone-700/50">
              {pledges.map(p => (
                <div key={p.id} className="px-5 py-3">
                  {editingId === p.id ? (
                    /* Edit row */
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Name"
                          className="bg-stone-900 border border-stone-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-sunrise-500"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                          <input
                            type="number" min="0"
                            value={editForm.amount}
                            onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                            className="w-full bg-stone-900 border border-stone-600 rounded-lg pl-7 pr-3 py-1.5 text-white text-sm focus:outline-none focus:border-sunrise-500"
                          />
                        </div>
                      </div>
                      <input
                        value={editForm.message}
                        onChange={e => setEditForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Message (optional)"
                        className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-sunrise-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(p.id)}
                          disabled={savingId === p.id}
                          className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                        >
                          <FiCheck size={12} /> {savingId === p.id ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-semibold px-3 py-1.5 rounded-lg"
                        >
                          <FiX size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display row */
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-200 font-medium text-sm truncate">{p.name}</span>
                          <span className="text-stone-500 text-xs flex-shrink-0">#{p.house_number}</span>
                        </div>
                        {p.message && <p className="text-stone-500 text-xs truncate mt-0.5">{p.message}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sunrise-400 font-bold text-sm">{formatCurrency(p.amount)}</span>
                        <button onClick={() => startEdit(p)} className="text-stone-400 hover:text-white text-xs flex items-center gap-1">
                          <FiEdit2 size={12}/> Edit
                        </button>
                        <button onClick={() => handleDeletePledge(p.id)} className="text-red-500 hover:text-red-400 text-xs flex items-center gap-1">
                          <FiTrash2 size={12}/> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const [authed, setAuthed]         = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true')
  const [section, setSection]       = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pledges, setPledges]       = useState([])
  const [messages, setMessages]     = useState([])
  const [goal, setGoal]             = useState(DEFAULT_GOAL)
  const [loading, setLoading]       = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [pRes, mRes, gRes] = await Promise.all([
      fetchPledges(),
      fetchMessages(),
      fetchSetting('project_goal'),
    ])
    // Deduplicate pledges by house_number
    const seen = new Set()
    const deduped = (pRes.data || []).filter(p => {
      const key = String(p.house_number ?? '')
      if (!key || seen.has(key)) return false
      seen.add(key); return true
    })
    setPledges(deduped)
    setMessages(mRes.data || [])
    if (gRes.data) setGoal(Number(gRes.data))
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) loadData()
  }, [authed, loadData])

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    navigate('/')
  }

  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <Sidebar
        active={section}
        setActive={setSection}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content */}
      <div className="md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-stone-900/95 backdrop-blur border-b border-stone-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden text-stone-400 hover:text-white p-1"
            >
              <FiMenu size={20} />
            </button>
            <span className="font-semibold text-white">
              {NAV.find(n => n.id === section)?.label ?? 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} disabled={loading} className="text-stone-400 hover:text-white" title="Refresh data">
              <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-medium"
            >
              <FiLogOut size={15} /> Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8 max-w-5xl w-full">
          {loading
            ? <div className="text-stone-500 text-sm pt-10 text-center">Loading…</div>
            : section === 'home'
              ? <DashboardHome pledges={pledges} messages={messages} goal={goal} />
              : section === 'moderation'
                ? <Moderation messages={messages} setMessages={setMessages} />
                : <Finances pledges={pledges} setPledges={setPledges} goal={goal} setGoal={setGoal} />
          }
        </main>
      </div>
    </div>
  )
}
