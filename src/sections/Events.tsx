import { Flag, Timer, Waves } from 'lucide-react'
import regatta from '@/assets/regatta.jpg'

const events = [
  {
    icon: Flag,
    month: 'May',
    name: 'Tees Regatta',
    text: 'Our flagship event — the region’s only multi-lane course: four lanes, fully buoyed, 850 m of side-by-side racing. A big draw for visiting clubs.',
  },
  {
    icon: Waves,
    month: 'October',
    name: 'Small Boats Head & LDS',
    text: 'Two events on one day — our Small Boats Head in the afternoon, with the Long Distance Sculls hosted by Northern Rowing in the morning.',
  },
  {
    icon: Timer,
    month: 'Monthly',
    name: 'Minihead',
    text: 'An informal 4 km time trial held once a month, open to all members and organised by the squads in rotation. Perfect first taste of racing.',
  },
]

export default function Events() {
  return (
    <section id="events" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Events</p>
        <h2 className="text-3xl font-extrabold sm:text-4xl">Race days on the Tees</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          The club hosts two annual events of its own plus monthly time trials.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <img
          src={regatta}
          alt="Crews racing side by side at a regatta"
          className="aspect-[3/2] w-full self-start rounded-3xl object-cover shadow-lg lg:sticky lg:top-24"
        />
        <div className="space-y-5">
          {events.map((e) => (
            <div key={e.name} className="flex gap-5 rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <e.icon className="h-6 w-6" />
                </span>
                <span className="mt-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-foreground">
                  {e.month}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{e.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.text}</p>
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-secondary/60 p-6 text-sm leading-relaxed text-secondary-foreground">
            Spectators are always welcome at our events — the riverbank by the
            Watersports Centre gives a great view of the whole course.
          </div>
        </div>
      </div>
    </section>
  )
}
