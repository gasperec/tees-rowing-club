import { Info, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import l2r from '@/assets/learn-to-row.jpg'

const steps = [
  { n: '1', title: 'Register your interest', text: 'Drop us a message and we’ll add you to the list for the next course.' },
  { n: '2', title: 'Six coached sessions', text: 'Gym taster, water safety, then out on the river — all kit provided.' },
  { n: '3', title: 'Join the club', text: 'Loved it? Become a member and find your squad.' },
]

const courses = [
  {
    title: 'Adults',
    price: '£150',
    points: ['6 × 2-hour sessions over 3 consecutive weekends', 'Small groups with qualified coaches', 'Temporary membership for the course duration'],
  },
  {
    title: 'Juniors (12–18)',
    price: '£100',
    points: ['Summer holiday courses over 3 consecutive days', 'Runs 10:00–14:30 each day', 'Perfect first step into the junior squad'],
  },
]

export default function LearnToRow() {
  return (
    <section id="learn" className="bg-primary py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-white/70">Learn to row</p>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Never rowed? Start here.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/85">
              Our Learn to Row courses are the fun, safe way into the sport.
              For your safety, everyone new to rowing completes a course before
              joining on the water.
            </p>

            <div className="mt-8 space-y-5">
              {steps.map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-extrabold text-primary">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-sm text-white/75">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="mt-8 rounded-full bg-white text-primary hover:bg-white/90">
              <a href="#contact">
                <Mail className="mr-1 h-4 w-4" /> Join the waiting list
              </a>
            </Button>
          </div>

          <div>
            <img
              src={l2r}
              alt="Coach teaching beginners on the water"
              className="aspect-[3/2] w-full rounded-3xl object-cover shadow-2xl"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {courses.map((c) => (
                <div key={c.title} className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <span className="text-2xl font-extrabold">{c.price}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm text-white/80">
                    {c.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-white/75">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Courses fill fast — register your interest and we’ll contact you
              as soon as new dates are announced.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
