import { useEffect, useState } from 'react'
import { Menu, X, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'

const links = [
  { label: 'The Club', href: '#club' },
  { label: 'Rowing', href: '#squads' },
  { label: 'Learn to Row', href: '#learn' },
  { label: 'Membership', href: '#membership' },
  { label: 'Events', href: '#events' },
  { label: 'Contact', href: '#contact' },
  { label: 'Boat booking', href: '/booking' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              scrolled ? 'bg-primary text-white' : 'bg-white/15 text-white backdrop-blur'
            }`}
          >
            <Waves className="h-5 w-5" />
          </span>
          <span
            className={`text-lg font-bold tracking-tight transition-colors ${
              scrolled ? 'text-foreground' : 'text-white'
            }`}
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Tees Rowing Club
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                scrolled
                  ? 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              {l.label}
            </a>
          ))}
          <Button asChild className="ml-2 rounded-full">
            <a href="#learn">Join us</a>
          </Button>
        </nav>

        <button
          className={`lg:hidden ${scrolled ? 'text-foreground' : 'text-white'}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-4 py-4 shadow-lg lg:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 font-semibold text-foreground/80 hover:bg-secondary"
            >
              {l.label}
            </a>
          ))}
          <Button asChild className="mt-2 w-full rounded-full">
            <a href="#learn" onClick={() => setOpen(false)}>
              Join us
            </a>
          </Button>
        </div>
      )}
    </header>
  )
}
