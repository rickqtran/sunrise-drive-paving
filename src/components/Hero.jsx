import { FiArrowDown } from 'react-icons/fi'
import { MdLocationOn } from 'react-icons/md'

export default function Hero() {
  return (
    <section
      id="about"
      className="relative overflow-hidden text-white"
      style={{
        backgroundImage: 'url(/images/road-entrance-paved.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 50%',
      }}
    >
      {/* Dark overlay so text stays legible over the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60" />

      {/* Road line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-sunrise-400 to-transparent opacity-40" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        {/* Location badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
          <MdLocationOn className="text-sunrise-300" />
          <span className="text-stone-200">Laveen, AZ 85339</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Let's Pave{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sunrise-300 to-sunrise-500">
            Sunrise Drive
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-stone-300 mb-4 max-w-2xl leading-relaxed">
          25 households. One goal. A smooth, safe, paved road for our neighborhood.
        </p>

        <p className="text-stone-400 max-w-xl mb-10 text-lg">
          Our dirt road on W Sunrise Dr kicks up dust, creates potholes, and makes every
          rainstorm a muddy mess. Together, we can fix this — permanently.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mb-10">
          {[
            { value: '25', label: 'Households' },
            { value: '$80K', label: 'Funding Goal' },
            { value: '~$3,200', label: 'Per Household' },
            { value: '100%', label: 'Community Funded' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 text-center">
              <div className="text-2xl font-bold text-sunrise-300">{stat.value}</div>
              <div className="text-stone-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4">
          <a href="#pledge" className="btn-primary text-base">
            Pledge Your Contribution
          </a>
          <a href="#funding" className="btn-secondary text-base text-stone-800">
            See Current Progress
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <FiArrowDown className="text-white text-2xl" />
      </div>
    </section>
  )
}
