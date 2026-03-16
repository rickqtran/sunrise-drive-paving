import { useState } from 'react'
import { FiCheckCircle, FiDollarSign, FiMail, FiUser, FiHome, FiHeart, FiStar } from 'react-icons/fi'
import { insertPledge } from '../lib/supabase'

const GOAL = 200000
const HOUSEHOLDS = 20
const BASE = GOAL / HOUSEHOLDS  // $10,000

const TIERS = [
  {
    id: 'basic',
    label: 'Basic Participation',
    icon: FiHome,
    amount: BASE,
    description: 'Standard cost share — the fair split across all 20 households.',
    color: 'border-stone-300',
    selectedColor: 'border-sunrise-500 bg-sunrise-50',
    badgeColor: 'bg-stone-100 text-stone-600',
    impact: null,
  },
  {
    id: 'supporter',
    label: 'Community Supporter',
    icon: FiStar,
    amount: Math.round(BASE * 1.15),  // +15%
    description: 'Standard share + 15% to help cover administrative and common area costs.',
    color: 'border-stone-300',
    selectedColor: 'border-amber-500 bg-amber-50',
    badgeColor: 'bg-amber-100 text-amber-700',
    impact: 'Covers ~15% of a neighbor\'s shortfall',
  },
  {
    id: 'sponsor',
    label: 'Community Sponsor',
    icon: FiHeart,
    amount: null,  // custom
    minAmount: Math.round(BASE * 1.25),
    description: 'Your extra contribution goes directly into the Community Pool to help households on fixed incomes fully participate.',
    color: 'border-stone-300',
    selectedColor: 'border-green-500 bg-green-50',
    badgeColor: 'bg-green-100 text-green-700',
    impact: null,  // calculated dynamically
  },
]

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function sponsorImpact(amount) {
  const pool = amount - BASE
  if (pool <= 0) return null
  const lotsHelped = pool / BASE
  if (lotsHelped >= 1) return `Your extra ${formatCurrency(pool)} covers ${lotsHelped.toFixed(1)} neighbor's share`
  const pct = Math.round(lotsHelped * 100)
  return `Your extra ${formatCurrency(pool)} covers ${pct}% of a neighbor's share`
}

export default function TieredPledge({ onNewPledge }) {
  const [tier, setTier]           = useState('basic')
  const [customAmount, setCustomAmount] = useState('')
  const [form, setForm]           = useState({ name: '', house_number: '', email: '', message: '' })
  const [step, setStep]           = useState(1)  // 1 = tier select, 2 = details
  const [formState, setFormState] = useState('idle')  // idle | submitting | success | error

  const selectedTier = TIERS.find(t => t.id === tier)
  const pledgeAmount = tier === 'sponsor'
    ? (parseFloat(customAmount) || 0)
    : selectedTier.amount

  const impact = tier === 'sponsor' && pledgeAmount > 0
    ? sponsorImpact(pledgeAmount)
    : selectedTier.impact

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.house_number || pledgeAmount < BASE) return
    setFormState('submitting')

    // Encode tier and email into message since Supabase table uses message field
    const meta = `[${selectedTier.label}${form.email ? ` | ${form.email}` : ''}]`
    const fullMessage = form.message ? `${meta} ${form.message}` : meta

    const { data, error } = await insertPledge({
      name: form.name,
      house_number: form.house_number,
      amount: pledgeAmount,
      message: fullMessage,
    })

    if (error || !data) {
      setFormState('error')
    } else {
      setFormState('success')
      onNewPledge?.(data[0])
    }
  }

  if (formState === 'success') {
    return (
      <section id="pledge-form" className="py-20 bg-stone-50">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-10">
            <FiCheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-stone-800 mb-2">Pledge Recorded!</h3>
            <p className="text-stone-500">
              Thank you for committing as a{' '}
              <strong className="text-stone-700">{selectedTier.label}</strong>.
              Your pledge of <strong className="text-sunrise-600">{formatCurrency(pledgeAmount)}</strong> brings us closer to a paved Sunrise Drive.
            </p>
            {tier === 'sponsor' && (
              <p className="mt-3 text-green-600 text-sm font-medium">
                Your extra contribution goes into the Community Pool. 🙏
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pledge-form" className="py-20 bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-sunrise-500 font-semibold text-sm uppercase tracking-wider">Make Your Commitment</span>
          <h2 className="section-title mt-1">Pledge Your Contribution</h2>
          <p className="section-subtitle">
            Choose the tier that works for your household. Every commitment counts.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 justify-center mb-8 text-sm">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors
                ${step >= s ? 'bg-sunrise-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                {s}
              </div>
              <span className={step >= s ? 'text-stone-700 font-medium' : 'text-stone-400'}>
                {s === 1 ? 'Choose Tier' : 'Your Details'}
              </span>
              {s < 2 && <div className="w-8 h-px bg-stone-300" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {/* Tier cards */}
            {TIERS.map(t => {
              const Icon = t.icon
              const isSelected = tier === t.id
              const displayAmount = t.id === 'sponsor'
                ? (customAmount ? formatCurrency(parseFloat(customAmount) || 0) : `${formatCurrency(t.minAmount)}+`)
                : formatCurrency(t.amount)

              return (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`w-full text-left rounded-xl border-2 p-5 transition-all duration-150
                    ${isSelected ? t.selectedColor : `bg-white ${t.color} hover:border-stone-400`}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                        ${isSelected ? 'bg-white/60' : 'bg-stone-100'}`}>
                        <Icon size={17} className={isSelected ? 'text-stone-700' : 'text-stone-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-800">{t.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.badgeColor}`}>
                            {displayAmount}
                          </span>
                        </div>
                        <p className="text-stone-500 text-sm mt-1 leading-snug">{t.description}</p>
                      </div>
                    </div>
                    {/* Radio indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center
                      ${isSelected ? 'border-sunrise-500 bg-sunrise-500' : 'border-stone-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Sponsor custom amount input */}
                  {t.id === 'sponsor' && isSelected && (
                    <div className="mt-4 pt-4 border-t border-green-200" onClick={e => e.stopPropagation()}>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                        Your Pledge Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium">$</span>
                        <input
                          type="number"
                          min={t.minAmount}
                          placeholder={`${t.minAmount} minimum`}
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                          className="w-full border border-stone-300 rounded-lg pl-7 pr-4 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Impact message */}
                  {isSelected && impact && (
                    <div className="mt-3 bg-white/70 rounded-lg px-3 py-2 text-xs font-medium text-stone-600 border border-white/80">
                      💡 {impact}
                    </div>
                  )}
                </button>
              )
            })}

            {/* Total impact display */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold mb-0.5">Your Total Pledge</p>
                <p className="text-3xl font-extrabold text-stone-800">
                  {pledgeAmount > 0 ? formatCurrency(pledgeAmount) : '—'}
                </p>
                {tier === 'sponsor' && pledgeAmount > BASE && (
                  <p className="text-xs text-green-600 mt-1">
                    {formatCurrency(BASE)} standard + {formatCurrency(pledgeAmount - BASE)} to Community Pool
                  </p>
                )}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={tier === 'sponsor' && pledgeAmount < (selectedTier.minAmount || 0)}
                className="btn-primary text-sm px-6 py-3 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-7 space-y-5">
            {/* Summary bar */}
            <div className="bg-stone-50 rounded-xl p-4 flex items-center justify-between text-sm">
              <div>
                <span className="text-stone-500">Pledging as </span>
                <span className="font-semibold text-stone-800">{selectedTier.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-sunrise-600">{formatCurrency(pledgeAmount)}</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-400 hover:text-stone-600 underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Your Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="First and last name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg pl-9 pr-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-sunrise-500 focus:ring-1 focus:ring-sunrise-200 min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* House number */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Street Address Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FiHome size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="e.g. 2817"
                  value={form.house_number}
                  onChange={e => setForm(f => ({ ...f, house_number: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg pl-9 pr-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-sunrise-500 focus:ring-1 focus:ring-sunrise-200 min-h-[44px]"
                  required
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Used to match your pledge to your parcel on the map.</p>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Email <span className="text-stone-400 font-normal normal-case">(optional — for project updates)</span>
              </label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg pl-9 pr-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-sunrise-500 focus:ring-1 focus:ring-sunrise-200 min-h-[44px]"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Message <span className="text-stone-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Share why this project matters to you…"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-sunrise-500 focus:ring-1 focus:ring-sunrise-200 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium py-3 rounded-xl text-sm transition-colors min-h-[44px]"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="flex-[2] btn-primary py-3 text-sm min-h-[44px] disabled:opacity-50"
              >
                {formState === 'submitting' ? 'Saving…' : `Record Pledge · ${formatCurrency(pledgeAmount)}`}
              </button>
            </div>

            {formState === 'error' && (
              <p className="text-red-500 text-xs text-center">Something went wrong — please try again.</p>
            )}

            <p className="text-xs text-stone-400 text-center leading-relaxed">
              This is a commitment, not a payment. No funds are collected until the full goal is reached and a formal agreement is signed by all participants.
            </p>
          </form>
        )}

      </div>
    </section>
  )
}
