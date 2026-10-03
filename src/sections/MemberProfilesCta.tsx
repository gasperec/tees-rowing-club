import { Link } from 'react-router'
import { UserRound, Camera, PencilLine, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: UserRound,
    title: 'Sign in',
    text: 'Log in with Google or email — it takes seconds.',
  },
  {
    icon: Camera,
    title: 'Add your photo',
    text: 'Upload a picture of yourself straight from your phone or computer.',
  },
  {
    icon: PencilLine,
    title: 'Tell your story',
    text: 'When you joined the club, your current position, your rowing experience and wins.',
  },
]

export default function MemberProfilesCta() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Members</p>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Create your member profile
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Every member can build their own profile — upload a photo, share
              when you joined the club, your current position, years of rowing
              and the races you've won. Browse the roster to get to know your
              crewmates.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/profile">
                  Create my profile <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/members">Browse members</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="flex items-start gap-4 rounded-3xl border bg-card p-5 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-bold">
                    <span className="mr-2 text-primary">{i + 1}.</span>
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
