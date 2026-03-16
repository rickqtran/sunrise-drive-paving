import { useState } from 'react'
import { FiCheck, FiAlertCircle, FiHeart } from 'react-icons/fi'
import { insertPledge } from '../lib/supabase'

const PRESET_AMOUNTS = [1000, 2000, 3200, 5000]

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function PledgeForm({ onNewPledge }) {
  const [form, setForm] = useState({
    name: '',
    house_number: '',
    amount: '',
    message: '',
  })
  const [customAmount, setCustomAmount] = useState(false)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  function handlePreset(amount) {
    setCustomAmount(false)
    setForm(f => ({ ...f, amount: String(amount) }))
  }

  function handleCustom() {
    setCustomAmount(true)
    setForm(f => ({ ...f, amount: '' }))
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const amount = parseFloat(form.amount)
    if (!form.name.trim()) { setStatus('error'); setErrorMsg('Please enter your name.'); return }
    if (!amount || amount <= 0) { setStatus('error'); setErrorMsg('Please enter a valid pledge amount.'); return }
    if (amount < 100) { setStatus('error'); setErrorMsg('Minimum pledge is $100.'); return }

    const { error } = await insertPledge({
      name: form.name.trim(),
      house_number: form.house_number.trim() || null,
      amount,
      message: form.message.trim() || null,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message || 'Something went wrong. Please try again.')
      return
    }

    setStatus('success')
    onNewPledge?.({ name: form.name, house_number: form.house_number, amount, message: form.message })
    setForm({ name: '', house_number: '', amount: '', message: '' })
    setTimeout(() => setStatus('idle'), 5000)
  }

  if (status === 'success') {
    return (
      <section id="pledge" className="py-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="card py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-stone-800 mb-3">Thank You!</h2>
            <p className="text-stone-500 text-lg mb-2">Your pledge has been recorded.</p>
            <p className="text-stone-400 mb-8">Every contribution brings us one step closer to a paved road!</p>
            <button onClick={() => setStatus('idle')} className="btn-secondary">
              Make Another Pledge
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pledge" className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-sunrise-500 font-semibold text-sm uppercase tracking-wider">Join the Effort</span>
          <h2 className="section-title mt-1">Make Your Pledge</h2>
          <p className="section-subtitle">
            A pledge is a commitment — not a payment yet. We collect pledges first,
            then coordinate payment once we hit our goal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Name & House Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Your Name <span className="text-sunrise-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                House Number <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                name="house_number"
                value={form.house_number}
                onChange={handleChange}
                placeholder="e.g. 2817"
                className="input-field"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Pledge Amount <span className="text-sunrise-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePreset(amt)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                    ${!customAmount && form.amount === String(amt)
                      ? 'bg-sunrise-500 text-white border-sunrise-500 shadow-md'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-sunrise-400 hover:text-sunrise-600'
                    }`}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
              <button
                type="button"
                onClick={handleCustom}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                  ${customAmount
                    ? 'bg-sunrise-500 text-white border-sunrise-500 shadow-md'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-sunrise-400 hover:text-sunrise-600'
                  }`}
              >
                Custom
              </button>
            </div>
            {customAmount && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">$</span>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  type="number"
                  min="100"
                  step="50"
                  placeholder="Enter amount"
                  className="input-field pl-8"
                />
              </div>
            )}
            <p className="text-xs text-stone-400 mt-1">
              Suggested: {formatCurrency(3200)} per household (fair share of {formatCurrency(80000)} goal ÷ 25 houses)
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Leave a message <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Share why you're supporting this project..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Error message */}
          {status === 'error' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <FiAlertCircle />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            <FiHeart />
            {status === 'submitting' ? 'Submitting...' : 'Submit My Pledge'}
          </button>

          <p className="text-xs text-center text-stone-400">
            This is a pledge of intent, not a payment. You will be contacted when we're ready to collect funds.
          </p>
        </form>
      </div>
    </section>
  )
}
