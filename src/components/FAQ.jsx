import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

const FAQS = [
  {
    q: "Why won't the city or county government pave this road for us?",
    a: "Government agencies only fund paving for roads that are part of a wider public transportation network. Sunrise Drive is a dead-end road, so it doesn't meet that criteria. Typically, residential roads like ours are paved by community home builders and the cost is recouped through home purchases. Sunrise Drive was never developed that way — there is no community builder behind it. If we want this road paved, we have to fund it ourselves.",
  },
  {
    q: 'How will the funds be collected and managed?',
    a: "No money is collected until we have firm written commitments covering the full project cost. Once we reach our goal, funds will be gathered through a formal agreement reviewed by all participating households. A transparent ledger of contributions and expenditures will be shared with every neighbor throughout the process.",
  },
  {
    q: 'How will a contractor be selected?',
    a: "We will solicit competitive bids from at least three licensed, bonded Arizona paving contractors. All bids will be shared with the neighborhood, and neighbors will have an opportunity to review and weigh in before a contract is signed. We prioritize quality and fair pricing — not just the lowest number.",
  },
  {
    q: "What happens if we don't reach the full $200,000 goal?",
    a: "Your pledge is a commitment, not a payment — no funds change hands until the goal is fully covered. If we fall short, we will reassess: either extend the timeline to recruit remaining households, adjust the project scope, or explore partial paving options. Nobody pays anything until everyone is on board.",
  },
  {
    q: 'Is my pledge legally binding?',
    a: "Pledges submitted here are moral commitments that let us gauge community readiness. Formal, legally binding agreements will be prepared by a licensed professional before any funds are collected. You will have full opportunity to review the agreement before signing.",
  },
  {
    q: 'How long will the actual paving work take?',
    a: "For a road the length of Sunrise Drive, active paving typically takes 1–3 days once work begins. Total project time from signed contract to finished road is generally 4–10 weeks, depending on contractor scheduling and weather. We'll communicate every milestone with the neighborhood.",
  },
  {
    q: "What if I can't afford the full $10,000 share right now?",
    a: "We understand that households have different financial situations, and that's exactly why the Community Pool exists. Neighbors who choose the Community Sponsor tier contribute extra to a shared fund that can help cover partial shortfalls for households on fixed incomes. If you're concerned about your share, reach out to Rick Tran directly — this project only works if it works for everyone.",
  },
  {
    q: 'What about drainage and city permits?',
    a: "All work will be designed and permitted to meet Maricopa County and City of Phoenix standards. Proper drainage is included in the project scope — paving without addressing drainage would just create new problems. We'll work with licensed engineers to ensure the finished road handles runoff correctly.",
  },
]

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-stone-50 transition-colors min-h-[44px]"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-stone-800 text-sm md:text-base leading-snug">{q}</span>
        <FiChevronDown
          size={18}
          className={`flex-shrink-0 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-6 pb-5 pt-1 bg-white border-t border-stone-100">
          <p className="text-stone-600 text-sm leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  function toggle(i) {
    setOpenIndex(prev => prev === i ? null : i)
  }

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <span className="text-sunrise-500 font-semibold text-sm uppercase tracking-wider">Got Questions?</span>
          <h2 className="section-title mt-1">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Transparency is essential. Here are honest answers to the questions neighbors ask most.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        <p className="text-center text-stone-400 text-sm mt-8">
          Have a question that's not listed?{' '}
          <a href="#community" className="text-sunrise-500 hover:underline">
            Ask in the Chat →
          </a>
        </p>

      </div>
    </section>
  )
}
