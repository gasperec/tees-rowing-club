import { Sprout, RotateCcw, HeartHandshake, Megaphone, ArrowRight } from 'lucide-react'

const pathways = [
  {
    icon: Sprout,
    title: 'New to rowing',
    text: 'Never sat in a boat? Our Learn to Row courses teach you the basics in six fun sessions — all equipment provided.',
    href: '#learn',
    cta: 'See courses',
  },
  {
    icon: RotateCcw,
    title: 'Rowed before',
    text: 'Returning from a break or moving to the Tees Valley? Skip the course — tell us your experience and we’ll match you to a squad.',
    href: '#contact',
    cta: 'Get in touch',
  },
  {
    icon: HeartHandshake,
    title: 'Adaptive rowing',
    text: 'Rowing for people with a physical disability or sensory or learning impairment, with adapted boats and award-winning coaches.',
    href: '#squads',
    cta: 'Meet the squad',
  },
  {
    icon: Megaphone,
    title: 'Cox or volunteer',
    text: 'Steer crews, coach, or lend a hand at events. Non-rowing membership covers social, coxing and coaching roles.',
    href: '#membership',
    cta: 'View membership',
  },
]

export default function Pathways() {
  return (
    <section id="pathways" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Find your way in</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Four simple routes into the club — pick the one that sounds like you.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pathways.map((p) => (
          <a
            key={p.title}
            href={p.href}
            className="group flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <p.icon className="h-6 w-6" />
            </span>
            <h3 className="text-xl font-bold">{p.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
              {p.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
