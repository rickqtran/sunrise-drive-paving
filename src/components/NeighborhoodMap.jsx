import { useState, useEffect } from 'react'
import { fetchPledges, insertPledge } from '../lib/supabase'
import { FiX, FiPhone, FiMail, FiMapPin, FiDollarSign, FiCheckCircle, FiInfo } from 'react-icons/fi'

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
  },
  {
    id: '300-15-003R',
    label: 'Persha\nMary S',
    name: 'Persha Mary S',
    phone: '602-237-3628',
    propAddress: '10228 S 27th Ave',
    city: 'Laveen 85339',
    x: 980, y: N_TOP, w: 95, h: NH, side: 'north',
  },
  {
    id: '300-15-003Q',
    label: 'Parcel\n003Q',
    name: '(Unidentified)',
    phone: '',
    propAddress: 'W Sunrise Dr',
    city: 'Laveen 85339',
    x: 1075, y: N_TOP, w: 140, h: NH, side: 'north',
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
  },
  {
    id: '300-15-007I',
    label: 'Rick\nTran ★',
    name: 'Rick Tran',
    phone: '480-544-8983',
    propAddress: '2817 W Sunrise Dr',
    city: 'Laveen 85339',
    x: 740, y: ROAD_Y2, w: 100, h: SH, side: 'south',
    isOrganizer: true,
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
  const [selected, setSelected]     = useState(null)
  const [hoveredId, setHoveredId]   = useState(null)
  const [form, setForm]             = useState({ name: '', amount: '', message: '' })
  const [formState, setFormState]   = useState('idle') // idle | submitting | success | error

  // Reset form state when switching parcels
  useEffect(() => { setFormState('idle'); setForm({ name: '', amount: '', message: '' }) }, [selected])

  const sel = PARCELS.find(p => p.id === selected)
  const selPledges = sel ? pledgesForParcel(sel, pledges) : []
  const selTotal   = selPledges.reduce((s, p) => s + (p.amount || 0), 0)

  async function handlePledge(e) {
    e.preventDefault()
    if (!sel || !form.name || !form.amount) return
    setFormState('submitting')
    const houseNum = (sel.propAddress || '').match(/^(\d+)/)?.[1] || ''
    const { data, error } = await insertPledge({
      name: form.name,
      house_number: houseNum,
      amount: parseFloat(form.amount),
      message: form.message || null,
    })
    if (error || !data) {
      setFormState('error')
    } else {
      setFormState('success')
      onNewPledge?.(data[0])
    }
  }

  // Parcel visual styling
  function fill(p) {
    const total = pledgeTotal(p, pledges)
    const hov = hoveredId === p.id
    if (p.isOrganizer) return hov ? '#c2410c' : '#7c2d12'
    if (total > 0)      return hov ? '#166534' : '#14532d'
    return hov ? '#57534e' : '#3c3836'
  }
  function stroke(p) {
    if (p.id === selected)  return '#f97316'
    if (p.isOrganizer)      return '#fb923c'
    if (pledgeTotal(p, pledges) > 0) return '#22c55e'
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
          <h2 className="text-3xl font-bold text-white mt-1 mb-2">Neighborhood Parcel Map</h2>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            Click any parcel to view resident info, pledge status, and add a commitment.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-5 justify-center mb-6 text-sm">
          {[
            { color: 'bg-green-900 border-green-500',  label: 'Pledged' },
            { color: 'bg-stone-700 border-stone-500',  label: 'Not yet pledged' },
            { color: 'bg-orange-900 border-orange-500',label: 'Project organizer' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border ${color}`} />
              <span className="text-stone-300">{label}</span>
            </div>
          ))}
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

                    {/* Pledge dot (top-right) */}
                    {total > 0 && (
                      <circle cx={p.x + p.w - 7} cy={p.y + 7} r={4} fill="#22c55e" />
                    )}

                    {/* Parcel ID (tiny, top center) */}
                    <text
                      x={pcx} y={p.y + 9}
                      textAnchor="middle" fontSize="6.5" fill="#78716c"
                    >{p.id}</text>

                    {/* Resident name label (centered) */}
                    {lines.map((line, i) => (
                      <text
                        key={i}
                        x={pcx}
                        y={pcy - ((lines.length - 1) * lineH) / 2 + i * lineH}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={fs}
                        fill={total > 0 || p.isOrganizer ? '#bbf7d0' : '#d6d3d1'}
                        fontWeight="600"
                      >{line}</text>
                    ))}

                    {/* Pledge total (bottom center) */}
                    {total > 0 && (
                      <text
                        x={pcx} y={p.y + p.h - 8}
                        textAnchor="middle" fontSize="7.5" fill="#86efac" fontWeight="700"
                      >${total.toLocaleString()}</text>
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
              <div className={`px-5 py-3 flex items-start justify-between ${sel.isOrganizer ? 'bg-orange-900/40 border-b border-orange-800' : 'bg-stone-750 border-b border-stone-700'}`}>
                <div>
                  <p className="text-stone-400 text-xs font-mono leading-none mb-1">{sel.id}</p>
                  <h3 className="text-white font-bold text-sm leading-snug">
                    {sel.name}
                    {sel.isOrganizer && (
                      <span className="ml-2 text-orange-400 text-xs font-normal">★ Organizer</span>
                    )}
                  </h3>
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
                <div>
                  <p className="text-stone-500 text-xs uppercase tracking-wide font-semibold mb-2">Pledge Status</p>
                  {selPledges.length > 0 ? (
                    <div className="bg-green-900/40 border border-green-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCheckCircle size={13} className="text-green-400" />
                        <span className="text-green-400 font-semibold text-sm">Pledged</span>
                      </div>
                      <p className="text-green-300 font-bold text-2xl">${selTotal.toLocaleString()}</p>
                      {selPledges.map((pl, i) => (
                        <p key={i} className="text-green-500 text-xs mt-1">
                          {pl.name} — ${pl.amount?.toLocaleString()}
                          {pl.message && <span className="italic"> · "{pl.message}"</span>}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-stone-900/60 border border-stone-600 rounded-lg p-3 flex items-center gap-2">
                      <FiDollarSign size={13} className="text-stone-500" />
                      <span className="text-stone-400 text-sm">Not yet pledged</span>
                    </div>
                  )}
                </div>

                {/* Pledge form */}
                {formState === 'success' ? (
                  <div className="bg-green-900/40 border border-green-700 rounded-lg p-3 text-center">
                    <FiCheckCircle size={18} className="text-green-400 mx-auto mb-1" />
                    <p className="text-green-300 text-sm font-semibold">Pledge recorded! Thank you.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePledge} className="space-y-2">
                    <p className="text-stone-500 text-xs uppercase tracking-wide font-semibold">
                      {selPledges.length > 0 ? 'Add Another Pledge' : 'Record a Pledge'}
                    </p>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-sunrise-500"
                      required
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Amount (e.g. 3200)"
                        min={100} max={20000}
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-full bg-stone-900 border border-stone-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-sunrise-500"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Message (optional)"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-sunrise-500"
                    />
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="w-full bg-sunrise-500 hover:bg-sunrise-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                    >
                      {formState === 'submitting' ? 'Saving…' : 'Record Pledge'}
                    </button>
                    {formState === 'error' && (
                      <p className="text-red-400 text-xs text-center">Error saving — please try again.</p>
                    )}
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* Empty state hint */
            <div className="hidden md:flex w-72 flex-shrink-0 bg-stone-900/50 border border-stone-700 rounded-xl items-center justify-center p-6 text-center">
              <div>
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-stone-400 text-sm">Click any parcel on the map to view resident details and pledge status.</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile scroll hint */}
        <p className="text-center text-stone-600 text-xs mt-4">
          ← Scroll map to see all parcels · Tap a parcel to select
        </p>
      </div>
    </section>
  )
}
