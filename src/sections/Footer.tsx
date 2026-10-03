import { Waves, Facebook, Twitter } from 'lucide-react'

const quick = [
  { label: 'The Club', href: '#club' },
  { label: 'Squads', href: '#squads' },
  { label: 'Learn to Row', href: '#learn' },
  { label: 'Membership', href: '#membership' },
  { label: 'Events', href: '#events' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="bg-foreground py-14 text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Waves className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Tees Rowing Club
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              A community rowing club in Stockton-on-Tees since 1864. Open to
              all ages and abilities — affiliated to British Rowing.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.facebook.com/teesrowingclub"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.twitter.com/TeesRowingClub"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white">Quick links</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {quick.map((q) => (
                <li key={q.href}>
                  <a href={q.href} className="transition-colors hover:text-white">
                    {q.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white">Useful</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.britishrowing.org" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                  British Rowing
                </a>
              </li>
              <li>
                <a href="https://www.britishrowing.org/about-us/policies-guidance/rowsafe/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                  RowSafe guidance
                </a>
              </li>
              <li>
                <a href="https://www.teesrowingclub.co.uk" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                  Current club website
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Tees Rowing Club · River Tees Watersports Centre, The Slipway, North Shore, Stockton-on-Tees TS18 2NL
        </div>
      </div>
    </footer>
  )
}
