import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import FundingTracker from './components/FundingTracker'
import NeighborhoodMap from './components/NeighborhoodMap'
import PhotoGallery from './components/PhotoGallery'
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

    // Subscribe to real-time new pledges
    const channel = subscribeToPledges(payload => {
      if (payload.new) {
        setPledges(prev => [payload.new, ...prev])
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
    // Optimistically add to list (real-time subscription will also fire)
    setPledges(prev => [{ ...pledge, id: Date.now(), created_at: new Date().toISOString() }, ...prev])
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <PhotoGallery />
        <FundingTracker pledges={pledges} loading={loading} />
        <NeighborhoodMap pledges={pledges} onNewPledge={handleNewPledge} />
        <CommunityBoard />
      </main>
      <Footer />
    </div>
  )
}
