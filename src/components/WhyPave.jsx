import { FiHome, FiTool, FiHeart, FiArrowRight } from 'react-icons/fi'

const REASONS = [
  {
    icon: FiHome,
    title: 'Property Value',
    stat: '+5–10%',
    statLabel: 'potential home equity increase',
    body: "Paved roads are a key factor in property appraisals. Neighbors on comparable paved streets in Laveen consistently see higher valuations. A paved Sunrise Drive is an investment in your home — not just the road beneath your feet.",
    accent: 'border-green-300',
    statColor: 'text-green-700',
    iconBg: 'bg-green-100 text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  {
    icon: FiTool,
    title: 'Vehicle Longevity',
    stat: '$500–$1,200',
    statLabel: 'average annual savings per vehicle',
    body: "Unpaved roads accelerate wear on suspensions, tires, brakes, and air filters — costs that compound fast, especially for older vehicles. A one-time road contribution pays for itself within a few years of reduced maintenance bills.",
    accent: 'border-amber-300',
    statColor: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    icon: FiHeart,
    title: 'Community Investment',
    stat: '20 neighbors',
    statLabel: 'one shared road, one shared benefit',
    body: "This isn't a bill — it's a neighborhood investment. Every dollar stays in our community and improves daily life for every household on the street. Neighbors who can contribute more help those who need a little more time.",
    accent: 'border-sunrise-300',
    statColor: 'text-sunrise-600',
    iconBg: 'bg-sunrise-100 text-sunrise-600',
    badge: 'bg-sunrise-100 text-sunrise-800',
  },
]

export default function WhyPave() {
  return (
    <section id="why" className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-sunrise-500 font-semibold text-sm uppercase tracking-wider">The Case for Paving</span>
          <h2 className="section-title mt-1">Why Pave Sunrise Drive?</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Paving our road isn't just about comfort — it's a financial decision that benefits every household on this street.
          </p>
        </div>

        {/* Reason cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {REASONS.map(({ icon: Icon, title, stat, statLabel, body, accent, statColor, iconBg, badge }) => (
            <div key={title} className={`bg-white rounded-2xl border-t-4 ${accent} shadow-sm p-7 flex flex-col gap-4`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-800 mb-1">{title}</h3>
                <div className={`text-2xl font-extrabold ${statColor}`}>{stat}</div>
                <div className="text-stone-400 text-xs mb-3">{statLabel}</div>
                <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sponsor a Neighbor callout */}
        <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-xl">
          <div className="flex-1">
            <span className="inline-block bg-sunrise-500/20 text-sunrise-300 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              Community Pool
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">Sponsor a Neighbor</h3>
            <p className="text-stone-300 leading-relaxed max-w-xl">
              If your household is in a position to contribute more, you can direct your additional pledge to our <strong className="text-white">Community Pool</strong> — a shared fund that helps lower-income neighbors fully participate in the project. Every dollar over the standard share goes directly toward closing the gap for households on fixed incomes.
            </p>
          </div>
          <a
            href="#pledge-form"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-sunrise-500 hover:bg-sunrise-600 transition-colors text-white font-semibold px-6 py-3 rounded-xl text-sm min-h-[44px]"
          >
            Pledge as a Sponsor <FiArrowRight size={16} />
          </a>
        </div>

      </div>
    </section>
  )
}
