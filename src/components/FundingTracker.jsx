import { useMemo } from 'react'
import { FiUsers, FiDollarSign, FiTarget, FiTrendingUp } from 'react-icons/fi'

const GOAL = 200000
const TOTAL_HOUSES = 20

// Avatar colors for pledge list
const AVATAR_COLORS = [
  'bg-sunrise-400', 'bg-earth-400', 'bg-teal-500', 'bg-violet-500',
  'bg-pink-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
]

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function FundingTracker({ pledges }) {
  const totalPledged = useMemo(() => pledges.reduce((sum, p) => sum + Number(p.amount), 0), [pledges])
  const percentFunded = Math.min(100, Math.round((totalPledged / GOAL) * 100))
  const householdsIn = useMemo(() => new Set(pledges.map(p => p.house_number).filter(Boolean)).size, [pledges])
  const remaining = Math.max(0, GOAL - totalPledged)

  const statsCards = [
    {
      icon: <FiDollarSign className="text-sunrise-500" size={22} />,
      label: 'Total Pledged',
      value: formatCurrency(totalPledged),
      sub: `of ${formatCurrency(GOAL)} goal`,
      bg: 'bg-sunrise-50 border-sunrise-100',
    },
    {
      icon: <FiUsers className="text-earth-500" size={22} />,
      label: 'Households In',
      value: `${householdsIn} / ${TOTAL_HOUSES}`,
      sub: `${TOTAL_HOUSES - householdsIn} still needed`,
      bg: 'bg-earth-50 border-earth-100',
    },
    {
      icon: <FiTarget className="text-teal-500" size={22} />,
      label: 'Still Needed',
      value: formatCurrency(remaining),
      sub: `${100 - percentFunded}% remaining`,
      bg: 'bg-teal-50 border-teal-100',
    },
    {
      icon: <FiTrendingUp className="text-violet-500" size={22} />,
      label: 'Avg Target Pledge per Household',
      value: formatCurrency(GOAL / TOTAL_HOUSES),
      sub: `based on ${formatCurrency(GOAL)} goal ÷ ${TOTAL_HOUSES} households`,
      bg: 'bg-violet-50 border-violet-100',
    },
  ]

  return (
    <section id="funding" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sunrise-500 font-semibold text-sm uppercase tracking-wider">Live Progress</span>
          <h2 className="section-title mt-1">Funding Tracker</h2>
          <p className="section-subtitle">Updated in real-time as neighbors pledge their contributions.</p>
        </div>

        {/* Progress bar */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-stone-700">Overall Progress</span>
            <span className="text-2xl font-bold text-sunrise-500">{percentFunded}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-5 rounded-full bg-gradient-to-r from-sunrise-400 to-sunrise-600 transition-all duration-700 ease-out relative"
              style={{ width: `${percentFunded}%` }}
            >
              {percentFunded > 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {formatCurrency(totalPledged)}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-stone-400">
            <span>$0</span>
            <span>{formatCurrency(GOAL)}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {statsCards.map(card => (
            <div key={card.label} className={`card border ${card.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                {card.icon}
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{card.label}</span>
              </div>
              <div className="text-2xl font-bold text-stone-800">{card.value}</div>
              <div className="text-xs text-stone-400 mt-0.5">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Pledge list */}
        <div>
          <h3 className="text-xl font-bold text-stone-800 mb-4">
            Neighbors Who've Pledged
            {pledges.length > 0 && (
              <span className="ml-2 text-sm font-normal bg-sunrise-100 text-sunrise-700 px-2 py-0.5 rounded-full">
                {pledges.length} {pledges.length === 1 ? 'pledge' : 'pledges'}
              </span>
            )}
          </h3>

          {pledges.length === 0 ? (
            <div className="card text-center py-12 text-stone-400">
              <FiUsers size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No pledges yet — be the first!</p>
              <a href="#pledge" className="text-sunrise-500 hover:underline text-sm mt-1 block">
                Make your pledge →
              </a>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pledges.map((pledge, i) => (
                <div key={pledge.id || i} className="card flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {getInitials(pledge.name)}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-stone-800 truncate">{pledge.name}</span>
                      <span className="text-sunrise-600 font-bold text-sm flex-shrink-0">
                        {formatCurrency(pledge.amount)}
                      </span>
                    </div>
                    {pledge.house_number && (
                      <div className="text-xs text-stone-400">House #{pledge.house_number}</div>
                    )}
                    {pledge.message && (
                      <p className="text-sm text-stone-500 mt-1 italic line-clamp-2">"{pledge.message}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
