import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import PhotoGallery from './components/PhotoGallery'
import WhyPave from './components/WhyPave'
import FundingTracker from './components/FundingTracker'
import NeighborhoodMap from './components/NeighborhoodMap'
import TieredPledge from './components/TieredPledge'
import FAQ from './components/FAQ'
import CommunityBoard from './components/CommunityBoard'
import Footer from './components/Footer'
import { fetchPledges, subscribeToPledges } from './lib/supabase'

// Demo pledges shown when Supabase is not yet configured
const DEMO_PLEDGES = [
  { id: 1, name: 'Rick (Organizer)', house_number: '2817', amount: 3200, message: "Let's get this done!", created_at: new Date().toISOString() },
  { id: 2, name: 'Demo Neighbor', house_number: '2801', amount: 2500, message: 'Happy to contribute', created_at: new Date().toISOString() },
]

export default function App() {
  const [pledges, setPledges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPledges()

    // Subscribe to real-time new pledges — replace by house_number to avoid duplicates
    const channel = subscribeToPledges(payload => {
      if (payload.new) {
        setPledges(prev => {
          const filtered = payload.new.house_number
            ? prev.filter(p => String(p.house_number) !== String(payload.new.house_number))
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
      setPledges(data)
    }
  }

  function handleNewPledge(pledge) {
    // Replace any existing pledge for this house_number, then prepend the new one
    setPledges(prev => {
      const filtered = pledge.house_number
        ? prev.filter(p => String(p.house_number) !== String(pledge.house_number))
        : prev
      return [{ ...pledge, id: pledge.id ?? Date.now(), created_at: pledge.created_at ?? new Date().toISOString() }, ...filtered]
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <PhotoGallery />
        <WhyPave />
        <FundingTracker pledges={pledges} loading={loading} />
        <NeighborhoodMap pledges={pledges} onNewPledge={handleNewPledge} />
        <TieredPledge onNewPledge={handleNewPledge} />
        <FAQ />
        <CommunityBoard />
      </main>
      <Footer />
    </div>
  )
}
