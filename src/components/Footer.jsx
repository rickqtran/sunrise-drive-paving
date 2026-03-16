import { GiRoad } from 'react-icons/gi'
import { MdEmail, MdPhone } from 'react-icons/md'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-stone-900 text-stone-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <GiRoad className="text-sunrise-400 text-2xl" />
              Pave Sunrise Drive
            </div>
            <p className="text-sm leading-relaxed">
              A community-driven initiative to pave W Sunrise Drive in Laveen, AZ.
              20 households, one shared goal.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MdEmail className="text-sunrise-400 flex-shrink-0" />
                <a href="mailto:RickQTran@gmail.com" className="hover:text-white transition-colors">
                  RickQTran@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MdPhone className="text-sunrise-400 flex-shrink-0" />
                <a href="tel:4805448983" className="hover:text-white transition-colors">
                  480-544-8983
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
          <span>© {year} W Sunrise Drive Community. Laveen, AZ.</span>
          <span>Built with ❤️ by the neighbors of Sunrise Drive.</span>
        </div>
      </div>
    </footer>
  )
}
