import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import PhotoGallery from './components/PhotoGallery'
import WhyPave from './components/WhyPave'
import FundingTracker from './components/FundingTracker'
import NeighborhoodMap from './components/NeighborhoodMap'
import FAQ from './components/FAQ'
import CommunityBoard from './components/CommunityBoard'
import Footer from './components/Footer'
import { fetchPledges, subscribeToPledges, fetchSetting } from './lib/supabase'

const DEFAULT_GOAL = 200000

// Normalize house_number to leading digits ("2817 W Sunrise Dr" → "2817")
function normalizeHouseNum(n) {
  return String(n ?? '').match(/^\d+/)?.[0] || String(n ?? '')
}

// Demo pledges shown when Supabase is not yet configured
const DEMO_PLEDGES = [
  { id: 1, name: 'Rick (Organizer)', house_number: '2817', amount: 3200, message: "Let's get this done!", created_at: new Date().toISOString() },
  { id: 2, name: 'Demo Neighbor', house_number: '2801', amount: 2500, message: 'Happy to contribute', created_at: new Date().toISOString() },
]

export default function App() {
  const [pledges, setPledges] = useState([])
  const [loading, setLoading] = useState(true)
  const [goal, setGoal]       = useState(DEFAULT_GOAL)

  useEffect(() => {
    loadPledges()
    fetchSetting('project_goal').then(({ data }) => { if (data) setGoal(Number(data)) })

    // Subscribe to real-time new pledges — replace by normalized house_number to avoid duplicates
    const channel = subscribeToPledges(payload => {
      if (payload.new) {
        setPledges(prev => {
          const incomingKey = normalizeHouseNum(payload.new.house_number)
          const filtered = incomingKey
            ? prev.filter(p => normalizeHouseNum(p.house_number) !== incomingKey)
            : prev
          return [payload.new, ...filtered]
        })
      }
    })

    return () => { channel?.unsubscribe?.() }
  }, [])

  async function loadPledges() {
    setLoading(true)
    const { data, error } = await fetchPledges()
    setLoading(false)
    if (error || !data) {
      setPledges(DEMO_PLEDGES)
    } else if (data.length === 0) {
      setPledges([])
    } else {
      // Deduplicate by normalized house_number — data is ordered newest-first,
      // so first occurrence of each number is kept. Normalization ensures
      // "2817" and "2817 W Sunrise Dr" are treated as the same household.
      const seen = new Set()
      const deduped = data.filter(p => {
        const key = normalizeHouseNum(p.house_number)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      setPledges(deduped)
    }
  }

  function handleNewPledge(pledge) {
    // Replace any existing pledge for this normalized house_number, then prepend the new one
    setPledges(prev => {
      const incomingKey = normalizeHouseNum(pledge.house_number)
      const filtered = incomingKey
        ? prev.filter(p => normalizeHouseNum(p.house_number) !== incomingKey)
        : prev
      return [{ ...pledge, id: pledge.id ?? Date.now(), created_at: pledge.created_at ?? new Date().toISOString() }, ...filtered]
    })
  }

  function handlePledgeDeleted(houseNum) {
    const normKey = normalizeHouseNum(houseNum)
    setPledges(prev => prev.filter(p => normalizeHouseNum(p.house_number) !== normKey))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <PhotoGallery />
        <WhyPave />
        <FundingTracker pledges={pledges} goal={goal} />
        <NeighborhoodMap pledges={pledges} onNewPledge={handleNewPledge} onPledgeDeleted={handlePledgeDeleted} />
        <FAQ />
        <CommunityBoard />
      </main>
      <Footer />
    </div>
  )
}
