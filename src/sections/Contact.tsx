import { useState } from 'react'
import { MapPin, Mail, Send, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const contacts = [
  { role: 'Membership enquiries', email: 'membershipsecteesrc@gmail.com' },
  { role: 'Club Captain', email: 'captainteesrc@gmail.com' },
  { role: 'Safety Officer', email: 'safety@teesrowingclub.co.uk' },
]

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState('Learn to Row (adults)')
  const [message, setMessage] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Website enquiry — ${interest}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nInterested in: ${interest}\n\n${message}`)
    window.location.href = `mailto:membershipsecteesrc@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Contact</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Come and say hello</h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold">Where we are</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  River Tees Watersports Centre, The Slipway, North Shore,<br />
                  Stockton-on-Tees TS18 2NL
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold">When we row</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The centre is open 6 am – 10 pm daily. Squads are busiest at
                  8 am on weekends; recreational rowing runs Tuesday and
                  Thursday mornings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold">Direct contacts</h3>
                <ul className="mt-1 space-y-1.5">
                  {contacts.map((c) => (
                    <li key={c.email} className="text-sm">
                      <span className="text-muted-foreground">{c.role}: </span>
                      <a href={`mailto:${c.email}`} className="font-semibold text-primary hover:underline">
                        {c.email}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=River+Tees+Watersports+Centre+Stockton-on-Tees+TS18+2NL"
              target="_blank"
              rel="noreferrer"
              className="group flex h-44 w-full flex-col items-center justify-center gap-2 rounded-3xl border bg-secondary/50 transition-colors hover:bg-secondary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                <MapPin className="h-6 w-6" />
              </span>
              <span className="font-bold text-foreground">Open in Google Maps</span>
              <span className="text-sm text-muted-foreground">TS18 2NL — free parking on site</span>
            </a>
          </div>

          <form onSubmit={submit} className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold">Register your interest</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This opens your email app with the message pre-filled — nothing is
              stored on this site.
            </p>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="interest">I’m interested in</Label>
                <select
                  id="interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option>Learn to Row (adults)</option>
                  <option>Learn to Row (juniors 12–18)</option>
                  <option>Returning to rowing</option>
                  <option>Adaptive rowing</option>
                  <option>Coxing or volunteering</option>
                  <option>Something else</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us a little about yourself and any previous rowing experience…"
                />
              </div>

              <Button type="submit" size="lg" className="w-full rounded-full">
                <Send className="mr-1 h-4 w-4" /> Send enquiry
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
