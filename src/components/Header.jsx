import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { GiRoad } from 'react-icons/gi'

const navLinks = [
  { href: '#about',    label: 'About' },
  { href: '#photos',   label: 'Photos' },
  { href: '#funding',  label: 'Funding' },
  { href: '#map',      label: 'Map' },
  { href: '#community', label: 'Community' },
  { href: '#pledge',   label: 'Pledge Now' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 font-bold text-xl text-stone-800">
            <GiRoad className="text-sunrise-500 text-2xl" />
            <span>Pave <span className="text-sunrise-500">Sunrise Drive</span></span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.slice(0, -1).map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pledge"
              className="ml-2 btn-primary text-sm py-2 px-5"
            >
              Pledge Now
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pb-4 pt-2 space-y-1">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-stone-700 hover:bg-stone-100 font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
