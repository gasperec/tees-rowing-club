import { Info } from 'lucide-react'

const fees = [
  { category: 'Adult', note: 'Full member', price: '£36.00' },
  { category: 'Junior', note: 'Under 18 on 1 Sept', price: '£33.50' },
  { category: 'Student', note: 'In full-time education', price: '£27.00' },
  { category: 'Off-Peak', note: 'Non-racing, restricted hours', price: '£22.50' },
  { category: 'Rehabilitation', note: '', price: '£18.50' },
  { category: 'Distant Student', note: 'Holidays only', price: '£16.50' },
  { category: 'Social / Cox / Coach', note: 'Non-rowing', price: '£6.50' },
]

const racking = [
  { boat: 'Single', price: '£17.50' },
  { boat: 'Double / pair', price: '£24.00' },
  { boat: 'Quad / four', price: '£48.00' },
]

export default function Membership() {
  return (
    <section id="membership" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Membership</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Simple monthly fees</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Paid monthly by direct debit. New members pay a joining fee equal to
            one month’s subscription.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/60 text-sm uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="hidden px-6 py-4 font-bold sm:table-cell">Notes</th>
                    <th className="px-6 py-4 text-right font-bold">Per month</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f, i) => (
                    <tr key={f.category} className={i % 2 ? 'bg-muted/40' : 'bg-card'}>
                      <td className="px-6 py-4 font-semibold">{f.category}</td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground sm:table-cell">{f.note}</td>
                      <td className="px-6 py-4 text-right font-extrabold text-primary">{f.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Fees shown for April 2025 – March 2026. One month’s notice is
              required to cancel a membership.
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold">Own a boat?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Racking for privately owned boats (waiting list currently applies):
            </p>
            <ul className="mt-4 space-y-3">
              {racking.map((r) => (
                <li key={r.boat} className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
                  <span className="font-semibold">{r.boat}</span>
                  <span className="font-extrabold text-primary">{r.price}<span className="text-xs font-semibold text-muted-foreground">/mo</span></span>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="mt-5 block rounded-full bg-primary px-5 py-3 text-center font-bold text-white transition-colors hover:bg-primary/90"
            >
              Apply for membership
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
