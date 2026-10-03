import { Check } from 'lucide-react'
import community from '@/assets/community.jpg'

const points = [
  'Open membership for all ages (12+) and all abilities',
  'Racing at every level — from recreational regattas to international events',
  'Excellent lottery-funded facilities at the River Tees Watersports Centre',
  'Up to 14 km of calm, non-tidal water with wildlife and scenery',
  'Fully equipped for adaptive rowing across a range of disabilities',
]

export default function Club() {
  return (
    <section id="club" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <img
            src={community}
            alt="Members relaxing by the river"
            className="aspect-[3/2] w-full rounded-3xl object-cover shadow-lg"
          />
        </div>
        <div className="order-1 lg:order-2">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">The club</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Something for everyone
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Founded in 1864, Tees RC is a volunteer-run community club with a
            proud racing history and a thriving membership from across the Tees
            Valley — from juniors of 12 to masters in their eighties.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((pt) => (
              <li key={pt} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-foreground/85">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
