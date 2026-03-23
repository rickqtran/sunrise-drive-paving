import { useState, useEffect, useRef } from 'react'
import { upsertPledge, deletePledgeById, logPledgeTransaction } from '../lib/supabase'
import { FiX, FiPhone, FiMail, FiMapPin, FiDollarSign, FiCheckCircle, FiInfo, FiHome, FiStar, FiHeart, FiRefreshCw } from 'react-icons/fi'

// ── Pledge tiers ───────────────────────────────────────────────────────────────
const GOAL        = 200000
const HOUSEHOLDS  = 20
const BASE_AMOUNT = GOAL / HOUSEHOLDS  // $10,000

const TIERS = [
  { id: 'basic',     label: 'Basic',     full: 'Basic Participation',           amount: BASE_AMOUNT,                    icon: FiHome       },
  { id: 'supporter', label: 'Supporter', full: 'Community Supporter',           amount: Math.round(BASE_AMOUNT * 1.15), icon: FiStar       },
  { id: 'sponsor',   label: 'Sponsor',   full: 'Community Sponsor',             amount: null,                           icon: FiHeart      },
  { id: 'other',     label: 'Other',     full: 'Custom Contribution',           amount: null,                           icon: FiDollarSign },
]
const MIN_SPONSOR = Math.round(BASE_AMOUNT * 1.25)
const MAX_OTHER   = BASE_AMOUNT - 1   // anything below Bronze ($9,999)

// Parse tier from a pledge's message field
function parseTier(pledge) {
  const msg = pledge?.message || ''
  if (msg.includes('Community Sponsor'))   return 'sponsor'
  if (msg.includes('Community Supporter')) return 'supporter'
  if (msg.includes('Custom Contribution')) return 'other'
  return 'basic'
}

// ── Tier colour palette (dark-theme) ─────────────────────────────────────────
const TIER_STYLE = {
  basic:     { fill: '#3b1a05', fillHov: '#5c2d0e', stroke: '#cd7f32', text: '#e8a87c', dot: '#cd7f32', label: 'Bronze' },
  supporter: { fill: '#1e2535', fillHov: '#2d3a50', stroke: '#a8a9ad', text: '#d1d5db', dot: '#a8a9ad', label: 'Silver' },
  sponsor:   { fill: '#2d1e00', fillHov: '#4a3200', stroke: '#ffd700', text: '#fbbf24', dot: '#ffd700', label: 'Gold'   },
  other:     { fill: '#052e16', fillHov: '#14532d', stroke: '#22c55e', text: '#86efac', dot: '#4ade80', label: 'Other'  },
}

// ── SVG coordinate constants ──────────────────────────────────────────────────
const VB_W   = 1220
const VB_H   = 490
const ROAD_Y1 = 215   // top of W Sunrise Dr
const ROAD_Y2 = 255   // bottom of W Sunrise Dr
const N_TOP   = 8     // top of north parcels
const S_BOT   = VB_H - 8  // bottom of south parcels
const ROAD_X1 = 5
const ROAD_X2 = 1215
const S30_X1  = 132   // S 30th Dr left edge
const S30_X2  = 140   // S 30th Dr right edge (8px wide)

// North parcel height and south parcel height
const NH = ROAD_Y1 - N_TOP          // 207
const SH = S_BOT - ROAD_Y2          // 227
// Corner lot heights (stacked two on top)
const CH1 = Math.floor(NH / 2) - 1  // top corner
const CH2 = NH - CH1 - 2            // bottom corner

// ── All 26 parcels ────────────────────────────────────────────────────────────
// Each parcel: id, label (shown in SVG), name, phone?, email?,
//   propAddress (property street address), mailingAddress?,
//   x, y, w, h, isOrganizer?
const PARCELS = [
  // ── Corner lots, west of S 30th Dr ─────────────────────────────────────────
  {
    id: '300-15-005T',
    label: 'Jose\nBurciaga',
    name: 'Jose Burciaga',
    phone: '480-759-0337 / 480-394-1019',
    propAddress: '3035 W Carver Rd',
    city: 'Laveen 85339',
    x: ROAD_X1, y: N_TOP, w: S30_X1 - ROAD_X1, h: CH1,
    side: 'north',
  },
  {
    id: '300-15-005N',
    label: 'Hilda\nValenzuela',
    name: 'Hilda Valenzuela',
    phone: '602-459-1504',
    email: 'estrellacne1000@gmail.com',
    propAddress: '10224 S 30th Dr',
    city: 'Laveen 85339',
    x: ROAD_X1, y: N_TOP + CH1 + 2, w: S30_X1 - ROAD_X1, h: CH2,
    side: 'north',
  },
  {
    id: '300-15-005R',
    label: 'Tim',
    name: 'Tim',
    phone: '302-304-6644',
    propAddress: '10412 S 30th Dr',
    city: 'Laveen, AZ 85339',
    x: ROAD_X1, y: ROAD_Y2, w: S30_X1 - ROAD_X1, h: SH,
    side: 'south',
  },

  // ── North side main parcels (above road, west→east) ─────────────────────────
  {
    id: '300-15-005',
    label: 'Roldan /\nNava Santos',
    name: 'Roldan Monica / Nava Santos',
    phone: '480-524-5868',
    propAddress: '2974 W Sunrise Dr',
    mailingAddress: '5025 W Desert Dr, Laveen AZ 85339',
    city: 'Laveen 85339',
    x: S30_X2, y: N_TOP, w: 110, h: NH, side: 'north',
  },
  {
    id: '300-15-005P',
    label: 'Ron\nLeon',
    name: 'Ron Leon',
    phone: '602-292-4760',
    email: 'Rons70Chevy@yahoo.com',
    propAddress: '2948 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 250, y: N_TOP, w: 100, h: NH, side: 'north',
  },
  {
    id: '300-15-134A',
    label: 'Leo\nPeneda',
    name: 'Leo Peneda',
    phone: '602-237-3535',
    propAddress: '2912 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 350, y: N_TOP, w: 105, h: NH, side: 'north',
  },
  {
    id: '300-15-003I',
    label: 'Carlos\nAvelar',
    name: 'Carlos Avelar / Maria Jesus',
    phone: '602-327-4548',
    email: 'carlosavelar4@msn.com',
    propAddress: '2900 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 455, y: N_TOP, w: 100, h: NH, side: 'north',
  },
  {
    id: '300-15-003J',
    label: 'Dan',
    name: 'Dan',
    phone: '623-326-2219',
    propAddress: '2848 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 555, y: N_TOP, w: 85, h: NH, side: 'north',
  },
  {
    id: '300-15-003G',
    label: 'Isaac',
    name: 'Isaac',
    phone: '623-329-1130',
    propAddress: 'W Sunrise Dr',
    city: 'Laveen 85339',
    x: 640, y: N_TOP, w: 75, h: NH, side: 'north',
  },
  {
    id: '300-15-003H',
    label: 'Gulermo',
    name: 'Gulermo',
    phone: '602-488-9595',
    propAddress: '2834 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 715, y: N_TOP, w: 85, h: NH, side: 'north',
  },
  {
    id: '300-15-003N',
    label: 'Nazari\nElaheh',
    name: 'Nazari Elaheh (Elle)',
    phone: '602-540-1593',
    propAddress: '2828 W Sunrise Dr',
    mailingAddress: 'RR1 BOX 845, Laveen, AZ 85339',
    city: 'Laveen 85339',
    x: 800, y: N_TOP, w: 80, h: NH, side: 'north',
  },
  {
    id: '300-15-003K',
    label: 'Garcia\nSylvia',
    name: 'Garcia Sylvia M (Conver) / Edward',
    phone: '',
    propAddress: 'W Sunrise Dr',
    mailingAddress: '3308 W Wescott Dr, Phoenix, AZ 85027',
    city: 'Laveen 85339',
    x: 880, y: N_TOP, w: 100, h: NH, side: 'north',
    emptyLot: true,
  },
  {
    id: '300-15-003R',
    label: 'Persha\nMary S',
    name: 'Persha Mary S',
    phone: '602-237-3628',
    propAddress: '10228 S 27th Ave',
    city: 'Laveen 85339',
    x: 980, y: N_TOP, w: 95, h: NH, side: 'north',
    emptyLot: true,
  },
  {
    id: '300-15-003Q',
    label: 'Parcel\n003Q',
    name: '(Unidentified)',
    phone: '',
    propAddress: 'W Sunrise Dr',
    city: 'Laveen 85339',
    x: 1075, y: N_TOP, w: 140, h: NH, side: 'north',
    emptyLot: true,
  },

  // ── South side main parcels (below road, west→east) ─────────────────────────
  {
    id: '300-15-005G',
    label: 'Vaterlaus',
    name: 'Susan / Brent Vaterlaus',
    phone: '',
    propAddress: '2975 W Sunrise Dr',
    mailingAddress: '508 Heathcliff Dr, Pacifica, CA 84044',
    city: 'Laveen 85339',
    x: S30_X2, y: ROAD_Y2, w: 110, h: SH, side: 'south',
  },
  {
    id: '300-15-005F',
    label: 'Sam &\nAmy',
    name: 'Sam & Amy',
    phone: '602-518-1390 / 602-740-4409',
    propAddress: '2939 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 250, y: ROAD_Y2, w: 100, h: SH, side: 'south',
  },
  {
    id: '300-15-100C',
    label: 'Saenz\nRobert',
    name: 'Saenz Robert R / Rosalinda C',
    phone: '602-237-2175',
    propAddress: '2929 W Sunrise Dr',
    mailingAddress: '4301 Rockledge Circle, Phoenix, AZ 85044',
    city: 'Laveen 85339',
    x: 350, y: ROAD_Y2, w: 105, h: SH, side: 'south',
  },
  {
    id: '300-15-007E',
    label: 'Green\nMark',
    name: 'Green Mark / Teresa',
    phone: '602-625-0577',
    email: 'TGreenRN@gmail.com',
    propAddress: '2903 W Sunrise Dr',
    city: 'Laveen AZ 85339',
    x: 455, y: ROAD_Y2, w: 100, h: SH, side: 'south',
  },
  {
    id: '300-15-007G',
    label: 'Chavez\nDebbie',
    name: 'Chavez Debbie A',
    phone: '',
    propAddress: 'W Sunrise Dr',
    mailingAddress: '4930 W Redfield Rd, Laveen AZ 85339',
    city: 'Laveen 85339',
    x: 555, y: ROAD_Y2, w: 85, h: SH, side: 'south',
    emptyLot: true,
  },
  {
    id: '300-15-007H',
    label: 'Hernandez\nJonathan',
    name: 'Hernandez Jonathan',
    phone: '',
    propAddress: 'W Sunrise Dr',
    mailingAddress: '1602 W Roma Ave, Phoenix AZ 85015',
    city: 'Laveen 85339',
    x: 640, y: ROAD_Y2, w: 100, h: SH, side: 'south',
    emptyLot: true,
  },
  {
    id: '300-15-007I',
    label: 'Rick\nTran',
    name: 'Rick Tran',
    phone: '480-544-8983',
    propAddress: '2817 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 740, y: ROAD_Y2, w: 100, h: SH, side: 'south',
  },
  {
    id: '300-15-007J',
    label: 'Banuelos\nUriel',
    name: 'Banuelos Uriel Robles / Margarita',
    phone: '602-412-7412',
    propAddress: '2739 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 840, y: ROAD_Y2, w: 90, h: SH, side: 'south',
  },
  {
    id: '300-15-007K',
    label: 'Israel',
    name: 'Israel',
    phone: '',
    propAddress: '2735 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 930, y: ROAD_Y2, w: 65, h: SH, side: 'south',
  },
  {
    id: '300-15-102B',
    label: 'Sauceda\nRichard',
    name: 'Sauceda Richard',
    phone: '602-919-6897 / (480) 217-8684',
    email: 'RBSJ88@gmail.com',
    propAddress: '2723 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 995, y: ROAD_Y2, w: 80, h: SH, side: 'south',
  },
  {
    id: '300-15-011B',
    label: 'Segoviano\nGalaz',
    name: 'Segoviano Misrraim G Galaz',
    phone: '602-217-8684',
    email: 'marcoupholstery@hotmail.com',
    propAddress: '10320 S 27th Ave',
    mailingAddress: '2506 E Pleasant Ln, Phoenix AZ',
    city: 'Laveen 85339',
    x: 1075, y: ROAD_Y2, w: 140, h: SH, side: 'south',
  },
]

// Match pledges to a parcel by house number extracted from propAddress
function pledgesForParcel(parcel, pledges) {
  if (!pledges?.length) return []
  const m = (parcel.propAddress || '').match(/^(\d+)/)
  if (!m) return []
  const num = m[1]
  return pledges.filter(p => String(p.house_number) === num)
}

// Sum pledges for a parcel
function pledgeTotal(parcel, pledges) {
  return pledgesForParcel(parcel, pledges).reduce((s, p) => s + (p.amount || 0), 0)
}

// Format dollar amounts compactly for SVG labels
function formatAmountCompact(n) {
  if (!n) return '$0'
  if (n >= 1000) {
    const k = n / 1000
    return '$' + (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K'
  }
  return '$' + n.toLocaleString()
}

// ── Property value map ────────────────────────────────────────────────────────
// Zillow Zestimate values as of March 2026
const ZESTIMATES = {
  '300-15-005T':  742200,   // Jose Burciaga       – 3035 W Carver Rd
  '300-15-005N':  600300,   // Hilda Valenzuela    – 10224 S 30th Dr
  '300-15-005R':  638300,   // Tim                 – 10412 S 30th Dr
  '300-15-005':   950000,   // Roldan / Nava Santos – 2974 W Sunrise Dr
  '300-15-005P':  723200,   // Ron Leon            – 2948 W Sunrise Dr
  '300-15-134A':  219100,   // Leo Peneda          – 2912 W Sunrise Dr
  '300-15-003I':  717000,   // Carlos Avelar       – 2900 W Sunrise Dr
  '300-15-003J':  573200,   // Dan                 – 2848 W Sunrise Dr
  '300-15-003G':  662000,   // Isaac               – W Sunrise Dr
  '300-15-003H':  677300,   // Gulermo             – 2834 W Sunrise Dr
  '300-15-003N':  551100,   // Nazari Elaheh       – 2828 W Sunrise Dr
  '300-15-003K':  null,     // Garcia Sylvia       – vacant lot
  '300-15-003R':  null,     // Persha Mary S       – vacant lot
  '300-15-003Q':  null,     // Parcel 003Q         – vacant lot
  '300-15-005G':  610900,   // Vaterlaus           – 2975 W Sunrise Dr
  '300-15-005F':  714900,   // Sam & Amy           – 2939 W Sunrise Dr
  '300-15-100C':  870000,   // Saenz Robert        – 2929 W Sunrise Dr
  '300-15-007E':  936400,   // Green Mark          – 2903 W Sunrise Dr
  '300-15-007G':  null,     // Chavez Debbie       – vacant lot
  '300-15-007H':  null,     // Hernandez Jonathan  – vacant lot
  '300-15-007I':  860100,   // Rick Tran           – 2817 W Sunrise Dr
  '300-15-007J':  58700,    // Banuelos Uriel      – 2739 W Sunrise Dr (land value)
  '300-15-007K':  652900,   // Israel              – 2735 W Sunrise Dr
  '300-15-102B':  629300,   // Sauceda Richard     – 2723 W Sunrise Dr
  '300-15-011B':  null,     // Segoviano Galaz     – 10320 S 27th Ave (no data)
}

function fmtVal(n) {
  if (n == null) return null
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  return `$${Math.round(n / 1000)}K`
}

export default function NeighborhoodMap({ pledges = [], onNewPledge, onPledgeDeleted }) {
  const videoRef = useRef(null)
  const [selected, setSelected]         = useState(null)
  const [hoveredId, setHoveredId]       = useState(null)
  const [tier, setTier]                 = useState('basic')
  const [customAmount, setCustomAmount] = useState('')
  const [form, setForm]                 = useState({ name: '', message: '' })
  const [formState, setFormState]       = useState('idle') // idle | submitting | success | error
  const [resetting, setResetting]       = useState(false)

  const sel          = PARCELS.find(p => p.id === selected)
  const selPledges   = sel ? pledgesForParcel(sel, pledges) : []
  const selTotal     = selPledges.reduce((s, p) => s + (p.amount || 0), 0)
  const existingPledge = selPledges[0] ?? null

  // Derived pledge amount from tier selection
  const selectedTier  = TIERS.find(t => t.id === tier)
  const pledgeAmount  = (tier === 'sponsor' || tier === 'other')
    ? (parseFloat(customAmount) || 0)
    : selectedTier.amount

  // When switching parcels, reset and pre-fill from existing pledge
  useEffect(() => {
    setFormState('idle')
    const ep = sel ? (pledgesForParcel(sel, pledges)[0] ?? null) : null
    const existingTier = ep ? parseTier(ep) : 'basic'
    setTier(existingTier)
    setCustomAmount(ep && (existingTier === 'sponsor' || existingTier === 'other') ? String(ep.amount) : '')
    setForm({
      name:    ep?.name    ?? '',
      message: ep?.message ? ep.message.replace(/^\[.*?\]\s*/, '') : '',
    })
  }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePledge(e) {
    e.preventDefault()
    if (!sel || !form.name || pledgeAmount <= 0) return
    setFormState('submitting')
    const houseNum = (sel.propAddress || '').match(/^(\d+)/)?.[1] || ''
    // Encode tier into the message so it can be parsed later for colouring
    const tierLabel = TIERS.find(t => t.id === tier)?.full ?? ''
    const msgBody   = form.message.trim()
    const fullMsg   = msgBody ? `[${tierLabel}] ${msgBody}` : `[${tierLabel}]`
    const { data, error } = await upsertPledge({
      name: form.name,
      house_number: houseNum,
      amount: pledgeAmount,
      message: fullMsg,
    })
    if (error || !data) {
      setFormState('error')
    } else {
      setFormState('success')
      // Log to audit trail (fire-and-forget)
      logPledgeTransaction({
        type:         existingPledge ? 'update' : 'pledge',
        house_number: houseNum,
        name:         form.name,
        amount:       pledgeAmount,
        message:      fullMsg,
      })
      onNewPledge?.({ ...data[0], house_number: houseNum })
    }
  }

  async function handleReset() {
    if (!existingPledge) return
    setResetting(true)
    const { data, error } = await deletePledgeById(existingPledge.id)
    setResetting(false)
    if (error || !data?.length) {
      setFormState('error')
    } else {
      // Log the deletion
      logPledgeTransaction({
        type:         'delete',
        house_number: String(existingPledge.house_number),
        name:         existingPledge.name,
        amount:       existingPledge.amount,
        message:      existingPledge.message,
      })
      onPledgeDeleted?.(String(existingPledge.house_number))
      setFormState('idle')
      setForm({ name: '', message: '' })
      setTier('basic')
      setCustomAmount('')
    }
  }

  // ── Parcel visual styling based on tier ────────────────────────────────────
  function getParcelTierStyle(p) {
    const pledge = pledgesForParcel(p, pledges)[0]
    if (!pledge) return null
    return TIER_STYLE[parseTier(pledge)]
  }
  function fill(p) {
    const hov = hoveredId === p.id
    const ts  = getParcelTierStyle(p)
    if (ts) return hov ? ts.fillHov : ts.fill
    return hov ? '#57534e' : '#3c3836'
  }
  function stroke(p) {
    if (p.id === selected) return '#f97316'
    const ts = getParcelTierStyle(p)
    if (ts) return ts.stroke
    return '#78716c'
  }
  function strokeW(p) { return p.id === selected ? 2.5 : 1 }

  // Center of a parcel for text placement
  const cx = p => p.x + p.w / 2
  const cy = p => p.y + p.h / 2

  return (
    <section id="map" className="py-20 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-sunrise-400 font-semibold text-sm uppercase tracking-wider">W Sunrise Dr · Laveen, AZ</span>
          <h2 className="text-3xl font-bold text-white mt-1 mb-2">Residence Pledges</h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ background: '#3b1a05', borderColor: '#cd7f32' }} />
            <span className="text-stone-300">Bronze <span className="text-stone-500">(Basic)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ background: '#1e2535', borderColor: '#a8a9ad' }} />
            <span className="text-stone-300">Silver <span className="text-stone-500">(Supporter)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ background: '#2d1e00', borderColor: '#ffd700' }} />
            <span className="text-stone-300">Gold <span className="text-stone-500">(Sponsor)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ background: '#052e16', borderColor: '#22c55e' }} />
            <span className="text-stone-300">Green <span className="text-stone-500">(Other)</span></span>
          </div>
        </div>

        {/* Map + Detail panel layout */}
        <div className={`flex gap-4 items-start transition-all duration-200`}>

          {/* ── SVG Map ─────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-x-auto rounded-xl border border-stone-700 bg-stone-900 shadow-xl">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="w-full min-w-[640px]"
              style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', display: 'block' }}
            >
              {/* Dark earth background */}
              <rect x={0} y={0} width={VB_W} height={VB_H} fill="#1c1917" />

              {/* Compass / direction label */}
              <text x={VB_W / 2} y={N_TOP + 10} textAnchor="middle" fontSize="9" fill="#78716c" letterSpacing="1.5">
                ▲ N  ·  W DESERT VIEW DR
              </text>

              {/* W Sunrise Dr road surface */}
              <rect x={ROAD_X1} y={ROAD_Y1} width={ROAD_X2 - ROAD_X1} height={ROAD_Y2 - ROAD_Y1} fill="#374151" />
              {/* Center-line dashes */}
              {Array.from({ length: 30 }, (_, i) => (
                <rect
                  key={i}
                  x={S30_X2 + 10 + i * 40}
                  y={ROAD_Y1 + (ROAD_Y2 - ROAD_Y1) / 2 - 2}
                  width={22} height={4} rx={2}
                  fill="#fbbf24" opacity={0.55}
                />
              ))}
              {/* Road name */}
              <text
                x={VB_W / 2} y={ROAD_Y1 + (ROAD_Y2 - ROAD_Y1) / 2 + 4}
                textAnchor="middle" fontSize="10" fill="#e7e5e4" fontWeight="700" letterSpacing="3"
              >
                W SUNRISE DR
              </text>

              {/* S 30th Dr (vertical road separator) */}
              <rect x={S30_X1} y={0} width={S30_X2 - S30_X1} height={VB_H} fill="#374151" />
              <text
                x={(S30_X1 + S30_X2) / 2}
                y={ROAD_Y1 - 20}
                textAnchor="middle" fontSize="8" fill="#a8a29e"
                transform={`rotate(-90,${(S30_X1 + S30_X2) / 2},${ROAD_Y1 - 20})`}
              >S 30TH DR</text>

              {/* S 27th Ave label */}
              <text
                x={VB_W - 4} y={VB_H / 2}
                textAnchor="middle" fontSize="8" fill="#a8a29e"
                transform={`rotate(90,${VB_W - 4},${VB_H / 2})`}
              >S 27TH AVE ▶</text>

              {/* ── Parcel rectangles ─────────────────────────────────────── */}
              {PARCELS.map(p => {
                const total   = pledgeTotal(p, pledges)
                const lines   = p.label.split('\n')
                const pcx     = cx(p)
                const pcy     = cy(p)
                const nameFs  = p.w < 80 ? 8 : p.w < 95 ? 9 : 9.5
                const nameH   = nameFs + 2
                const amtFs   = p.w < 80 ? 14 : p.w < 100 ? 16 : 18

                const ts = getParcelTierStyle(p)

                return (
                  <g
                    key={p.id}
                    onClick={() => setSelected(s => s === p.id ? null : p.id)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Parcel body */}
                    <rect
                      x={p.x} y={p.y} width={p.w} height={p.h} rx={3}
                      fill={fill(p)}
                      stroke={stroke(p)}
                      strokeWidth={strokeW(p)}
                    />

                    {/* Parcel ID — top center */}
                    <text
                      x={pcx} y={p.y + 11}
                      textAnchor="middle" fontSize="7.5" fill="#78716c" fontWeight="500"
                    >{p.id}</text>

                    {/* Pledge amount — large, center of parcel */}
                    {p.emptyLot ? (
                      <text
                        x={pcx} y={pcy}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={amtFs - 2} fill="#44403c" fontStyle="italic"
                      >Vacant</text>
                    ) : (
                      <text
                        x={pcx} y={pcy}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={amtFs} fontWeight="700"
                        fill={ts ? ts.dot : '#57534e'}
                      >{formatAmountCompact(total)}</text>
                    )}

                    {/* Resident name — bottom of parcel */}
                    {lines.map((line, i) => {
                      const lineFromBottom = lines.length - 1 - i
                      return (
                        <text
                          key={i}
                          x={pcx}
                          y={p.y + p.h - 9 - lineFromBottom * nameH}
                          textAnchor="middle"
                          fontSize={nameFs}
                          fill={ts ? ts.text : '#a8a29e'}
                          fontWeight="500"
                        >{line}</text>
                      )
                    })}
                  </g>
                )
              })}

              {/* NORTH / SOUTH labels */}
              <text x={ROAD_X1 + 2} y={N_TOP + 20}  fontSize="8" fill="#a8a29e" fontWeight="500">NORTH</text>
              <text x={ROAD_X1 + 2} y={S_BOT - 6}   fontSize="8" fill="#a8a29e" fontWeight="500">SOUTH</text>
            </svg>
          </div>

          {/* ── Detail Panel ─────────────────────────────────────────────────── */}
          {sel ? (
            <div className="w-80 flex-shrink-0 bg-stone-800 rounded-xl border border-stone-700 shadow-xl overflow-hidden">
              {/* Header bar */}
              <div className="px-5 py-3 flex items-start justify-between bg-stone-750 border-b border-stone-700">
                <div>
                  <p className="text-stone-400 text-xs font-mono leading-none mb-1">{sel.id}</p>
                  <h3 className="text-white font-bold text-sm leading-snug">{sel.name}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-stone-400 hover:text-white ml-2 mt-0.5 flex-shrink-0"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-sm">
                {/* Contact details */}
                <div className="space-y-2">
                  <p className="text-stone-500 text-xs uppercase tracking-wide font-semibold">Contact</p>
                  <div className="flex gap-2 items-start text-stone-300">
                    <FiMapPin size={12} className="mt-0.5 text-sunrise-400 flex-shrink-0" />
                    <span>{sel.propAddress}, {sel.city}</span>
                  </div>
                  {sel.mailingAddress && sel.mailingAddress !== sel.propAddress && (
                    <div className="flex gap-2 items-start text-stone-400">
                      <FiMapPin size={12} className="mt-0.5 flex-shrink-0 opacity-40" />
                      <span className="text-xs">Mailing: {sel.mailingAddress}</span>
                    </div>
                  )}
                  {sel.phone && (
                    <div className="flex gap-2 items-center text-stone-300">
                      <FiPhone size={12} className="text-sunrise-400 flex-shrink-0" />
                      <span>{sel.phone}</span>
                    </div>
                  )}
                  {sel.email && (
                    <div className="flex gap-2 items-center text-stone-300">
                      <FiMail size={12} className="text-sunrise-400 flex-shrink-0" />
                      <a href={`mailto:${sel.email}`} className="hover:text-sunrise-300 truncate text-xs">{sel.email}</a>
                    </div>
                  )}
                  {!sel.phone && !sel.email && (
                    <div className="flex gap-2 items-center text-stone-500">
                      <FiInfo size={12} className="flex-shrink-0" />
                      <span className="text-xs">No contact info on file</span>
                    </div>
                  )}
                </div>

                {/* Pledge status */}
                {(() => {
                  const activePledge = selPledges[0] ?? null
                  const activeTier   = activePledge ? parseTier(activePledge) : null
                  const ts           = activeTier ? TIER_STYLE[activeTier] : null
                  const TierIcon     = activeTier ? TIERS.find(t => t.id === activeTier)?.icon : null
                  const cleanMsg     = activePledge?.message
                    ? activePledge.message.replace(/^\[.*?\]\s*/, '').trim()
                    : ''
                  return (
                    <div>
                      <p className="text-stone-500 text-xs uppercase tracking-wide font-semibold mb-2">Pledge Status</p>
                      {sel.emptyLot ? (
                        <div className="bg-stone-900/60 border border-stone-600 rounded-lg p-3 flex items-center gap-2">
                          <FiInfo size={13} className="text-stone-500" />
                          <span className="text-stone-400 text-sm italic">Not Expected (vacant lot)</span>
                        </div>
                      ) : activePledge ? (
                        <div
                          className="rounded-lg p-3"
                          style={{ background: ts?.fill + 'cc', border: `1px solid ${ts?.stroke}` }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <FiCheckCircle size={13} style={{ color: ts?.dot }} />
                              <span className="font-semibold text-sm" style={{ color: ts?.dot }}>Pledged</span>
                            </div>
                            {TierIcon && ts && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: ts.stroke + '33', border: `1px solid ${ts.stroke}`, color: ts.dot }}>
                                <TierIcon size={10} />
                                {ts.label}
                              </div>
                            )}
                          </div>
                          <p className="font-bold text-2xl" style={{ color: ts?.text }}>
                            ${selTotal.toLocaleString()}
                          </p>
                          <p className="text-xs mt-1 opacity-80" style={{ color: ts?.text }}>
                            {activePledge.name}
                            {cleanMsg && <span className="italic"> · "{cleanMsg}"</span>}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-stone-900/60 border border-stone-600 rounded-lg p-3 flex items-center gap-2">
                          <FiDollarSign size={13} className="text-stone-500" />
                          <span className="text-stone-400 text-sm">Pledged: $0</span>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Pledge form — hidden for vacant lots */}
                {!sel.emptyLot && (formState === 'success' ? (
                  (() => {
                    const ts = TIER_STYLE[tier]
                    return (
                      <div className="rounded-lg p-3 text-center"
                        style={{ background: ts.fill + 'cc', border: `1px solid ${ts.stroke}` }}>
                        <FiCheckCircle size={18} className="mx-auto mb-1" style={{ color: ts.dot }} />
                        <p className="text-sm font-semibold" style={{ color: ts.text }}>
                          Pledge saved!
                        </p>
                        <p className="text-xs mt-0.5 mb-2" style={{ color: ts.dot }}>
                          {TIER_STYLE[tier].label} · ${pledgeAmount.toLocaleString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormState('idle')}
                          className="text-xs underline opacity-70 hover:opacity-100 transition-opacity"
                          style={{ color: ts.text }}
                        >
                          Edit pledge
                        </button>
                      </div>
                    )
                  })()
                ) : (
                  <form onSubmit={handlePledge} className="space-y-3">
                    <p className="text-stone-500 text-xs uppercase tracking-wide font-semibold">
                      {existingPledge ? 'Update Pledge' : 'Record a Pledge'}
                    </p>

                    {/* Tier selector pills — 2×2 grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {TIERS.map(t => {
                        const ts      = TIER_STYLE[t.id]
                        const active  = tier === t.id
                        const Icon    = t.icon
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setTier(t.id); setCustomAmount('') }}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all"
                            style={active
                              ? { background: ts.fill, border: `2px solid ${ts.stroke}`, color: ts.dot }
                              : { background: '#1c1917', border: '2px solid #44403c', color: '#a8a29e' }}
                          >
                            <Icon size={13} />
                            <span>{ts.label}</span>
                            <span className="text-xs font-normal opacity-70">
                              {t.amount
                                ? (t.amount % 1000 === 0
                                    ? `$${t.amount / 1000}K`
                                    : `$${(t.amount / 1000).toFixed(1)}K`)
                                : t.id === 'other' ? `< $${BASE_AMOUNT / 1000}K` : 'Custom'}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Gold (Sponsor) custom amount — red */}
                    {tier === 'sponsor' && (
                      <div>
                        <p className="text-red-400 text-xs font-semibold mb-1 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Enter your custom pledge amount
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 font-bold text-sm">$</span>
                          <input
                            type="number"
                            placeholder={`Min $${MIN_SPONSOR.toLocaleString()}`}
                            min={MIN_SPONSOR}
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                            className="w-full rounded-lg pl-7 pr-3 py-2.5 text-white text-sm font-semibold placeholder:text-red-400/50 focus:outline-none"
                            style={{
                              background: '#2d0a0a',
                              border: '2px solid #ef4444',
                              boxShadow: '0 0 0 3px rgba(239,68,68,0.2)',
                            }}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Other tier custom amount — green */}
                    {tier === 'other' && (
                      <div>
                        <p className="text-green-400 text-xs font-semibold mb-1 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                          Any amount up to ${MAX_OTHER.toLocaleString()}
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold text-sm">$</span>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            min={1}
                            max={MAX_OTHER}
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                            className="w-full rounded-lg pl-7 pr-3 py-2.5 text-white text-sm font-semibold placeholder:text-green-400/40 focus:outline-none"
                            style={{
                              background: '#052e16',
                              border: '2px solid #22c55e',
                              boxShadow: '0 0 0 3px rgba(34,197,94,0.15)',
                            }}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Display fixed amount for Bronze / Silver */}
                    {tier !== 'sponsor' && tier !== 'other' && (
                      <div className="text-xs rounded-lg px-3 py-2 font-semibold"
                        style={{ background: TIER_STYLE[tier].fill, color: TIER_STYLE[tier].dot, border: `1px solid ${TIER_STYLE[tier].stroke}55` }}>
                        Pledge amount: ${TIERS.find(t => t.id === tier)?.amount?.toLocaleString()}
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-sunrise-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Message (optional)"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-sunrise-500"
                    />
                    <button
                      type="submit"
                      disabled={
                        formState === 'submitting'
                        || (tier === 'sponsor' && pledgeAmount < MIN_SPONSOR)
                        || (tier === 'other' && (pledgeAmount <= 0 || pledgeAmount > MAX_OTHER))
                      }
                      className="w-full font-semibold py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                      style={{
                        background: TIER_STYLE[tier].stroke,
                        color: '#fff',
                      }}
                    >
                      {formState === 'submitting' ? 'Saving…' : existingPledge ? 'Update Pledge' : 'Record Pledge'}
                    </button>

                    {/* Reset to zero — only shown when a pledge already exists */}
                    {existingPledge && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={resetting}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-red-400 py-1 transition-colors disabled:opacity-50"
                      >
                        <FiRefreshCw size={11} className={resetting ? 'animate-spin' : ''} />
                        {resetting ? 'Removing pledge…' : 'Reset pledge to $0'}
                      </button>
                    )}

                    {formState === 'error' && (
                      <p className="text-red-400 text-xs text-center">Error saving — please try again.</p>
                    )}
                  </form>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile scroll hint */}
        <p className="text-center text-stone-600 text-xs mt-4">
          ← Scroll map to see all parcels · Tap a parcel to select
        </p>

        {/* How-to video */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <span className="text-sunrise-400 font-semibold text-sm uppercase tracking-wider">Step-by-step walkthrough</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-1">How to Make a Pledge</h3>
            <p className="text-stone-400 text-sm">Watch this short video to see how to select your parcel and record your pledge.</p>
          </div>
          <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-stone-700 shadow-2xl bg-stone-900">
            <video
              ref={videoRef}
              controls
              preload="metadata"
              className="w-full block"
              style={{ maxHeight: '520px' }}
              onPlay={() => {
                const el = videoRef.current
                if (!el) return
                // iOS Safari must use webkitEnterFullscreen on the video element itself
                // and must be checked before other webkit methods
                const tryFullscreen = () => {
                  try {
                    if (el.webkitEnterFullscreen) { el.webkitEnterFullscreen(); return }
                    if (el.requestFullscreen) { el.requestFullscreen(); return }
                    if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); return }
                    if (el.mozRequestFullScreen) { el.mozRequestFullScreen(); return }
                    if (el.msRequestFullscreen) { el.msRequestFullscreen(); return }
                  } catch (e) {}
                }
                // Small delay ensures iOS has registered the play gesture
                setTimeout(tryFullscreen, 50)
              }}
            >
              <source src="/videos/Instructions.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
        </div>

        {/* ── Property Value Increase ─────────────────────────────────────── */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <span className="text-sunrise-400 font-semibold text-sm uppercase tracking-wider">Financial Impact</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-2">Potential Property Value Increase</h3>
            <p className="text-stone-400 text-sm max-w-2xl mx-auto">
              Based on current Zillow Zestimates, paving Sunrise Drive is projected to increase each home's value by approximately 10%. Here's what that means for your neighborhood.
            </p>
          </div>

          {/* Summary stat cards */}
          {(() => {
            const known          = PARCELS.filter(p => ZESTIMATES[p.id] != null)
            const totalCurrent   = known.reduce((s, p) => s + ZESTIMATES[p.id], 0)
            const totalProjected = Math.round(totalCurrent * 1.1)
            const totalGain      = totalProjected - totalCurrent
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
                <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 text-center">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">Current Total Value</div>
                  <div className="text-xl font-bold text-white">${(totalCurrent / 1000000).toFixed(2)}M</div>
                  <div className="text-xs text-stone-500 mt-0.5">{known.length} homes with data</div>
                </div>
                <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 text-center">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">After Paving (+10%)</div>
                  <div className="text-xl font-bold text-green-400">${(totalProjected / 1000000).toFixed(2)}M</div>
                  <div className="text-xs text-stone-500 mt-0.5">projected total</div>
                </div>
                <div className="bg-stone-800 border border-green-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">Neighborhood Gain</div>
                  <div className="text-xl font-bold text-green-400">+${(totalGain / 1000000).toFixed(2)}M</div>
                  <div className="text-xs text-stone-500 mt-0.5">across {known.length} properties</div>
                </div>
                <div className="bg-stone-800 border border-sunrise-700/50 rounded-xl p-4 text-center">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">Paving Investment</div>
                  <div className="text-xl font-bold text-sunrise-400">$200K</div>
                  <div className="text-xs text-stone-500 mt-0.5">total project cost</div>
                </div>
              </div>
            )
          })()}

          {/* Property value SVG map */}
          <div className="overflow-x-auto rounded-xl border border-stone-700 bg-stone-900 shadow-xl">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="w-full min-w-[640px]"
              style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', display: 'block' }}
            >
              <rect x={0} y={0} width={VB_W} height={VB_H} fill="#1c1917" />

              {/* Compass */}
              <text x={VB_W / 2} y={N_TOP + 10} textAnchor="middle" fontSize="9" fill="#78716c" letterSpacing="1.5">
                ▲ N  ·  W DESERT VIEW DR
              </text>

              {/* Road surface */}
              <rect x={ROAD_X1} y={ROAD_Y1} width={ROAD_X2 - ROAD_X1} height={ROAD_Y2 - ROAD_Y1} fill="#374151" />
              {Array.from({ length: 30 }, (_, i) => (
                <rect key={i} x={S30_X2 + 10 + i * 40} y={ROAD_Y1 + (ROAD_Y2 - ROAD_Y1) / 2 - 2} width={22} height={4} rx={2} fill="#fbbf24" opacity={0.55} />
              ))}
              <text x={(ROAD_X1 + ROAD_X2) / 2} y={(ROAD_Y1 + ROAD_Y2) / 2 + 4} textAnchor="middle" fontSize="10" fill="#9ca3af" letterSpacing="2">
                W SUNRISE DR
              </text>

              {/* S 30th Dr */}
              <rect x={S30_X1} y={N_TOP} width={S30_X2 - S30_X1} height={VB_H - N_TOP} fill="#374151" />

              {/* Parcels */}
              {PARCELS.map(p => {
                const val       = ZESTIMATES[p.id]
                const increase  = val != null ? Math.round(val * 0.1) : null
                const projected = val != null ? Math.round(val * 1.1) : null
                const hasBg     = !p.emptyLot && val != null
                const bg        = hasBg ? '#1a2035' : '#1c1917'
                const bd        = hasBg ? '#475569' : '#292524'
                const pcx       = p.x + p.w / 2
                const pcy       = p.y + p.h / 2
                const nameLine  = p.label.split('\n').slice(-1)[0]
                const fs        = p.w < 80 ? 8 : 10   // font size for dollar values

                return (
                  <g key={p.id}>
                    <rect x={p.x + 1} y={p.y + 1} width={p.w - 2} height={p.h - 2} rx={3} fill={bg} stroke={bd} strokeWidth={1.5} />
                    {p.emptyLot ? (
                      <text x={pcx} y={pcy} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#44403c">vacant</text>
                    ) : val == null ? (
                      <>
                        <text x={pcx} y={pcy - 6} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#78716c">{nameLine}</text>
                        <text x={pcx} y={pcy + 7} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#44403c">N/A</text>
                      </>
                    ) : (
                      <>
                        {/* Name */}
                        <text x={pcx} y={p.y + 11} textAnchor="middle" fontSize="7" fill="#a8a29e">{nameLine}</text>
                        {/* Current value */}
                        <text x={pcx} y={pcy - 13} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fontWeight="bold" fill="#fb923c">{fmtVal(val)}</text>
                        {/* Value increase */}
                        <text x={pcx} y={pcy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={fs - 1} fontWeight="bold" fill="#fb923c">+{fmtVal(increase)}</text>
                        {/* Divider */}
                        <line x1={p.x + 5} y1={pcy + 9} x2={p.x + p.w - 5} y2={pcy + 9} stroke="#374151" strokeWidth={0.5} />
                        {/* Projected value */}
                        <text x={pcx} y={pcy + 20} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fontWeight="bold" fill="#fb923c">{fmtVal(projected)}</text>
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border" style={{ background: '#1a2035', borderColor: '#475569' }} />
              Current · +10% gain · Projected value
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border bg-stone-900 border-stone-700" />
              No data / vacant lot
            </div>
          </div>
          <p className="text-center text-stone-600 text-xs mt-2">
            Source: Zillow Zestimate · March 2026 · Projected values assume 10% appreciation after road paving · Some values reflect land only
          </p>
        </div>

      </div>
    </section>
  )
}
