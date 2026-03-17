import { useState } from 'react'
import { FiX, FiCamera, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const PHOTOS = [
  // ── Before ──────────────────────────────────────────────────────────────
  {
    url: '/images/before-entrance.png',
    thumb: '/images/before-entrance.png',
    caption: 'Road entrance today — unpaved dirt and gravel at W Sunrise Dr',
    tag: 'Before',
    tagColor: 'bg-red-600/80',
  },
  {
    url: '/images/before-road.jpg',
    thumb: '/images/before-road.jpg',
    caption: 'The road surface — loose dirt, rocks, and no drainage',
    tag: 'Before',
    tagColor: 'bg-red-600/80',
  },
  {
    url: '/images/before-ditch.jpg',
    thumb: '/images/before-ditch.jpg',
    caption: 'Rough gravel road with potholes and erosion from rain runoff',
    tag: 'Before',
    tagColor: 'bg-red-600/80',
  },
  // ── After ───────────────────────────────────────────────────────────────
  {
    url: '/images/road-entrance-paved.png',
    thumb: '/images/road-entrance-paved.png',
    caption: 'Road entrance after paving — smooth asphalt with clean striping',
    tag: 'After',
    tagColor: 'bg-green-600/80',
  },
  {
    url: '/images/paved-road.png',
    thumb: '/images/paved-road.png',
    caption: 'The road surface after paving — fresh asphalt, clear lane markings',
    tag: 'After',
    tagColor: 'bg-green-600/80',
  },
  {
    url: '/images/paved-ditch.png',
    thumb: '/images/paved-ditch.png',
    caption: 'Newly paved road with proper drainage and clean edges',
    tag: 'After',
    tagColor: 'bg-green-600/80',
  },
]

export default function PhotoGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  function prev() {
    setLightboxIndex(i => (i - 1 + PHOTOS.length) % PHOTOS.length)
  }
  function next() {
    setLightboxIndex(i => (i + 1) % PHOTOS.length)
  }

  const before = PHOTOS.filter(p => p.tag === 'Before')
  const after  = PHOTOS.filter(p => p.tag === 'After')

  return (
    <section id="photos" className="py-20 bg-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sunrise-400 font-semibold text-sm uppercase tracking-wider">See the Difference</span>
          <h2 className="text-3xl font-bold text-white mt-1 mb-2">Before &amp; After</h2>
          <p className="text-stone-400 text-lg">
            This is W Sunrise Dr — and what it could look like with your support.
          </p>
        </div>

        {/* Before row */}
        <div className="mb-3">
          <p className="text-red-400 font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            Current Condition
          </p>
          <div className="grid grid-cols-3 gap-3">
            {before.map((photo, i) => (
              <PhotoTile
                key={photo.url}
                photo={photo}
                onClick={() => setLightboxIndex(i)}
              />
            ))}
          </div>
        </div>

        {/* Arrow divider */}
        <div className="flex items-center justify-center gap-3 my-4 text-stone-500">
          <div className="flex-1 h-px bg-stone-700" />
          <span className="text-2xl">↓</span>
          <span className="text-stone-400 font-semibold text-sm">After Paving</span>
          <span className="text-2xl">↓</span>
          <div className="flex-1 h-px bg-stone-700" />
        </div>

        {/* After row */}
        <div className="mb-6">
          <p className="text-green-400 font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            After Paving
          </p>
          <div className="grid grid-cols-3 gap-3">
            {after.map((photo, i) => (
              <PhotoTile
                key={photo.url}
                photo={photo}
                onClick={() => setLightboxIndex(before.length + i)}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-stone-500 mt-6 text-sm">
          📸 Have photos of the road? Email them to us and we'll add them to the gallery!
        </p>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <FiX size={28} />
            </button>

            <img
              src={PHOTOS[lightboxIndex].url}
              alt={PHOTOS[lightboxIndex].caption}
              className="w-full rounded-xl max-h-[75vh] object-contain"
            />

            <p className="text-center text-stone-300 mt-3 text-sm">
              {PHOTOS[lightboxIndex].caption}
            </p>

            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/70 hover:text-white"
            >
              <FiChevronLeft size={36} />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/70 hover:text-white"
            >
              <FiChevronRight size={36} />
            </button>

            <div className="text-center text-stone-500 text-xs mt-2">
              {lightboxIndex + 1} / {PHOTOS.length}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function PhotoTile({ photo, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative group overflow-hidden rounded-xl aspect-video bg-stone-800 cursor-pointer"
    >
      <img
        src={photo.thumb}
        alt={photo.caption}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end p-3">
        <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-left line-clamp-2">
          {photo.caption}
        </p>
      </div>
      <div className="absolute top-2 left-2">
        <span className={`${photo.tagColor} text-white text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm`}>
          {photo.tag}
        </span>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/50 rounded-full p-1.5">
          <FiCamera className="text-white" size={12} />
        </div>
      </div>
    </button>
  )
}
