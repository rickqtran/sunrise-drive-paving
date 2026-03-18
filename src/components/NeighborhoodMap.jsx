import { useState, useEffect } from 'react'
import { upsertPledge } from '../lib/supabase'
import { FiX, FiPhone, FiMail, FiMapPin, FiDollarSign, FiCheckCircle, FiInfo, FiHome, FiStar, FiHeart } from 'react-icons/fi'

// ── Pledge tiers ───────────────────────────────────────────────────────────────
const GOAL        = 200000
const HOUSEHOLDS  = 20
const BASE_AMOUNT = GOAL / HOUSEHOLDS  // $10,000

const TIERS = [
  { id: 'basic',     label: 'Basic',     full: 'Basic Participation',    amount: BASE_AMOUNT,              icon: FiHome  },
  { id: 'supporter', label: 'Supporter', full: 'Community Supporter',    amount: Math.round(BASE_AMOUNT * 1.15), icon: FiStar  },
  { id: 'sponsor',   label: 'Sponsor',   full: 'Community Sponsor',      amount: null,                     icon: FiHeart },
]
const MIN_SPONSOR = Math.round(BASE_AMOUNT * 1.25)

// Parse tier from a pledge's message field
function parseTier(pledge) {
  const msg = pledge?.message || ''
  if (msg.includes('Community Sponsor'))   return 'sponsor'
  if (msg.includes('Community Supporter')) return 'supporter'
  return 'basic'
}

// ── Tier colour palette (dark-theme) ─────────────────────────────────────────
const TIER_STYLE = {
  basic:     { fill: '#3b1a05', fillHov: '#5c2d0e', stroke: '#cd7f32', text: '#e8a87c', dot: '#cd7f32', label: 'Bronze' },
  supporter: { fill: '#1e2535', fillHov: '#2d3a50', stroke: '#a8a9ad', text: '#d1d5db', dot: '#a8a9ad', label: 'Silver' },
  sponsor:   { fill: '#2d1e00', fillHov: '#4a3200', stroke: '#ffd700', text: '#fbbf24', dot: '#ffd700', label: 'Gold'   },
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

export default function NeighborhoodMap({ pledges = [], onNewPledge }) {
  const [selected, setSelected]         = useState(null)
  const [hoveredId, setHoveredId]       = useState(null)
  const [tier, setTier]                 = useState('basic')
  const [customAmount, setCustomAmount] = useState('')
  const [form, setForm]                 = useState({ name: '', message: '' })
  const [formState, setFormState]       = useState('idle') // idle | submitting | success | error

  const sel          = PARCELS.find(p => p.id === selected)
  const selPledges   = sel ? pledgesForParcel(sel, pledges) : []
  const selTotal     = selPledges.reduce((s, p) => s + (p.amount || 0), 0)
  const existingPledge = selPledges[0] ?? null

  // Derived pledge amount from tier selection
  const selectedTier  = TIERS.find(t => t.id === tier)
  const pledgeAmount  = tier === 'sponsor'
    ? (parseFloat(customAmount) || 0)
    : selectedTier.amount

  // When switching parcels, reset and pre-fill from existing pledge
  useEffect(() => {
    setFormState('idle')
    const ep = sel ? (pledgesForParcel(sel, pledges)[0] ?? null) : null
    const existingTier = ep ? parseTier(ep) : 'basic'
    setTier(existingTier)
    setCustomAmount(ep && existingTier === 'sponsor' ? String(ep.amount) : '')
    setForm({
      name:    ep?.name    ?? '',
      message: ep?.message ? ep.message.replace(/^\[.*?\]\s*/, '') : '',
    })
  }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePledge(e) {
    e.preventDefault()
    if (!sel || !form.name || pledgeAmount < 100) return
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
      onNewPledge?.({ ...data[0], house_number: houseNum })
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
            <div className="w-4 h-4 rounded border bg-stone-700 border-stone-500" />
            <span className="text-stone-300">Not yet pledged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-stone-900 border-stone-600 flex items-center justify-center">
              <span className="text-stone-500 text-xs leading-none">–</span>
            </div>
            <span className="text-stone-300">Vacant lot</span>
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
                const fs      = p.w < 80 ? 8 : p.w < 95 ? 9 : 9.5
                const lineH   = fs + 2

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

                    {/* Pledge dot (top-right) — tier color */}
                    {total > 0 && ts && (
                      <circle cx={p.x + p.w - 7} cy={p.y + 7} r={4} fill={ts.dot} />
                    )}

                    {/* Parcel ID (tiny, top center) */}
                    <text
                      x={pcx} y={p.y + 9}
                      textAnchor="middle" fontSize="6.5" fill="#78716c"
                    >{p.id}</text>

                    {/* Resident name label (centered) — tier color when pledged */}
                    {lines.map((line, i) => (
                      <text
                        key={i}
                        x={pcx}
                        y={pcy - ((lines.length - 1) * lineH) / 2 + i * lineH}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={fs}
                        fill={ts ? ts.text : '#d6d3d1'}
                        fontWeight="600"
                      >{line}</text>
                    ))}

                    {/* Pledge status (bottom center) */}
                    {p.emptyLot ? (
                      <text
                        x={pcx} y={p.y + p.h - 8}
                        textAnchor="middle" fontSize="7" fill="#78716c" fontStyle="italic"
                      >Not Expected</text>
                    ) : (
                      <text
                        x={pcx} y={p.y + p.h - 8}
                        textAnchor="middle" fontSize="7.5"
                        fill={ts ? ts.dot : '#a8a29e'}
                        fontWeight={total > 0 ? '700' : '400'}
                      >Pledged: ${total.toLocaleString()}</text>
                    )}
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
                          {existingPledge ? 'Pledge updated!' : 'Pledge recorded! Thank you.'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: ts.dot }}>
                          {TIER_STYLE[tier].label} · ${pledgeAmount.toLocaleString()}
                        </p>
                      </div>
                    )
                  })()
                ) : (
                  <form onSubmit={handlePledge} className="space-y-3">
                    <p className="text-stone-500 text-xs uppercase tracking-wide font-semibold">
                      {existingPledge ? 'Edit Pledge' : 'Record a Pledge'}
                    </p>

                    {/* Tier selector pills */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {TIERS.map(t => {
                        const ts      = TIER_STYLE[t.id]
                        const active  = tier === t.id
                        const Icon    = t.icon
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTier(t.id)}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all"
                            style={active
                              ? { background: ts.fill, border: `2px solid ${ts.stroke}`, color: ts.dot }
                              : { background: '#1c1917', border: '2px solid #44403c', color: '#a8a29e' }}
                          >
                            <Icon size={13} />
                            <span>{ts.label}</span>
                            <span className="text-xs font-normal opacity-70">
                              {t.amount ? `$${(t.amount / 1000).toFixed(0)}K` : 'Custom'}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Sponsor custom amount */}
                    {tier === 'sponsor' && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input
                          type="number"
                          placeholder={`Min $${MIN_SPONSOR.toLocaleString()}`}
                          min={MIN_SPONSOR}
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm placeholder:text-stone-500 focus:outline-none"
                          style={{ borderColor: '#ffd70066' }}
                          required
                        />
                      </div>
                    )}

                    {/* Display fixed amount for non-sponsor tiers */}
                    {tier !== 'sponsor' && (
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
                      disabled={formState === 'submitting' || (tier === 'sponsor' && pledgeAmount < MIN_SPONSOR)}
                      className="w-full font-semibold py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                      style={{
                        background: TIER_STYLE[tier].stroke,
                        color: '#fff',
                      }}
                    >
                      {formState === 'submitting' ? 'Saving…' : existingPledge ? 'Update Pledge' : 'Record Pledge'}
                    </button>
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
      </div>
    </section>
  )
}
