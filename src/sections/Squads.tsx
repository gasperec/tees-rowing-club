import { Users, Trophy, GraduationCap, Coffee, Accessibility, Compass } from 'lucide-react'

const squads = [
  {
    icon: GraduationCap,
    name: 'Juniors',
    age: 'Ages 12–18',
    text: 'A thriving junior section training on the river at weekends (10:30 am Sat & Sun), with extra evening sessions in summer. Local and national racing for those who want it.',
    tint: 'bg-sky-100 text-sky-700',
  },
  {
    icon: Trophy,
    name: "Men's squads",
    age: 'Novice to senior',
    text: 'Three senior squads graded by technical ability, covering every age range. Move between squads as your rowing and ambitions develop.',
    tint: 'bg-rose-100 text-rose-700',
  },
  {
    icon: Users,
    name: "Women's squads",
    age: 'Development & senior',
    text: 'A large, friendly women’s section — a development squad for newer rowers and two senior squads focused on competitive crew rowing.',
    tint: 'bg-rose-100 text-rose-700',
  },
  {
    icon: Coffee,
    name: 'Recreational',
    age: 'All ages, daytime',
    text: 'Social weekday rowing (Tue & Thu mornings) at a lower subscription. Row up the Tees, then coffee and cake in the club room. Beginners very welcome.',
    tint: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Accessibility,
    name: 'Adaptive',
    age: 'All impairments',
    text: 'Adapted equipment, a dedicated coach and a supportive squad for people with physical, sensory or learning impairments — recreational through to international level.',
    tint: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Compass,
    name: 'Coxes & coaches',
    age: 'Non-rowing roles',
    text: 'The club runs on volunteers. Cox crews, coach, or help behind the scenes — a low-cost non-rowing membership has you covered.',
    tint: 'bg-violet-100 text-violet-700',
  },
]

export default function Squads() {
  return (
    <section id="squads" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Rowing</p>
        <h2 className="text-3xl font-extrabold sm:text-4xl">Six squads, one club</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Whatever your age, experience or ambition, there’s a crew for you.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {squads.map((s) => (
          <div
            key={s.name}
            className="rounded-3xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold leading-tight">{s.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.age}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
