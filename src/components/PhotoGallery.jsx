import { useState } from 'react'
import { FiX, FiCamera, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Community artwork created for the Pave Sunrise Drive project.
// Add your own road photos to public/images/ and list them here!
const PHOTOS = [
  {
    url: '/images/img1_road_at_dawn.png',
    caption: 'The road at dawn — W Sunrise Dr stretching toward the horizon',
    thumb: '/images/img1_road_at_dawn.png',
    tag: 'Our Road',
  },
  {
    url: '/images/img3_the_threshold.png',
    caption: 'The Threshold — unpaved dirt road today vs. our paved vision',
    thumb: '/images/img3_the_threshold.png',
    tag: 'Before & After',
  },
  {
    url: '/images/img2_community_map.png',
    caption: 'Community map — all 25 households along W Sunrise Dr',
    thumb: '/images/img2_community_map.png',
    tag: 'Community',
  },
  // ── Add your own real photos below ──────────────────────────────────────
  // Drop photos into public/images/ and add entries like:
  // { url: '/images/your-photo.jpg', caption: 'Caption here', thumb: '/images/your-photo.jpg', tag: 'Road' },
]

export default function PhotoGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  function prev() {
    setLightboxIndex(i => (i - 1 + PHOTOS.length) % PHOTOS.length)
  }
  function next() {
    setLightboxIndex(i => (i + 1) % PHOTOS.length)
  }

  return (
    <section id="photos" className="py-20 bg-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sunrise-400 font-semibold text-sm uppercase tracking-wider">See the Need</span>
          <h2 className="text-3xl font-bold text-white mt-1 mb-2">Photo Gallery</h2>
          <p className="text-stone-400 text-lg">
            Our road, our community, our vision.{' '}
            <span className="text-stone-500 text-sm">Add your own photos — drop them in <code className="text-stone-400">public/images/</code></span>
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PHOTOS.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative group overflow-hidden rounded-xl aspect-video bg-stone-800 cursor-pointer"
            >
              <img
                src={photo.thumb}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end p-3">
                <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-left line-clamp-2">
                  {photo.caption}
                </p>
              </div>
              {/* Tag badge */}
              {photo.tag && (
                <div className="absolute top-2 left-2">
                  <span className="bg-black/60 text-sunrise-300 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {photo.tag}
                  </span>
                </div>
              )}
              {/* Camera icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 rounded-full p-1.5">
                  <FiCamera className="text-white" size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Upload note */}
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
            {/* Close */}
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

            {/* Prev / Next */}
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

            {/* Counter */}
            <div className="text-center text-stone-500 text-xs mt-2">
              {lightboxIndex + 1} / {PHOTOS.length}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
