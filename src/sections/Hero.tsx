import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import hero from '@/assets/hero-rowing.jpg'

const stats = [
  { value: '1864', label: 'Founded' },
  { value: '200+', label: 'Members' },
  { value: '12–80+', label: 'Ages welcome' },
  { value: '14 km', label: 'Of river to row' },
]

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[92vh] items-end overflow-hidden">
      <img
        src={hero}
        alt="Rowing eight on the River Tees at dawn"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-40 sm:px-6">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
          One of the oldest rowing clubs in the world
        </p>
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          Rowing on the Tees for everyone, since 1864.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/85">
          A friendly community club in Stockton-on-Tees — from first strokes to
          international racing, juniors to masters, recreational to adaptive.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full text-base">
            <a href="#learn">
              Start rowing <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white/40 bg-white/10 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
          >
            <a href="#club">Explore the club</a>
          </Button>
        </div>

        <div className="mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur"
            >
              <div className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {s.value}
              </div>
              <div className="text-sm text-white/75">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#pathways"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-white/70 transition-colors hover:text-white md:block"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </a>
    </section>
  )
}
