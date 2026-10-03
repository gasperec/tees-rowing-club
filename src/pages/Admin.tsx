import { Check, X, Users, AlertTriangle, MessageCircle, Ship } from "lucide-react";
import { Navigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import MemberShell from "@/components/MemberShell";
import BookingHistory from "@/components/BookingHistory";
import { Button } from "@/components/ui/button";
import { LOGIN_PATH } from "@/const";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to={LOGIN_PATH} replace />;
  if (user.role !== "admin") return <Navigate to="/booking" replace />;

  return (
    <MemberShell title="Admin">
      <AdminContent />
    </MemberShell>
  );
}

function whatsappLink(phone: string | null, message: string) {
  const digits = (phone ?? "").replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return digits
    ? `https://wa.me/${digits}?text=${text}`
    : `https://wa.me/?text=${text}`;
}

function AdminContent() {
  const utils = trpc.useUtils();
  const members = trpc.club.members.listAll.useQuery();
  const pending = trpc.club.bookings.pending.useQuery();
  const boatsOut = trpc.club.bookings.boatsOut.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const invalidate = async () => {
    await utils.club.bookings.pending.invalidate();
    await utils.club.bookings.boatsOut.invalidate();
    await utils.club.bookings.history.invalidate();
  };

  const approve = trpc.club.bookings.approve.useMutation({ onSuccess: invalidate });
  const reject = trpc.club.bookings.reject.useMutation({ onSuccess: invalidate });

  const now = new Date();
  const overdue = (boatsOut.data ?? []).filter((b) => {
    const end = new Date(`${b.outingDate}T${b.endTime}:00`);
    return end < now;
  });

  return (
    <div className="space-y-10">
      {/* Overdue boats */}
      <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <AlertTriangle
            className={`h-5 w-5 ${overdue.length > 0 ? "text-destructive" : "text-muted-foreground"}`}
          />
          Boats on the water
          {overdue.length > 0 && (
            <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-bold text-white">
              {overdue.length} overdue
            </span>
          )}
        </h2>
        {(boatsOut.data ?? []).length === 0 ? (
          <p className="mt-4 rounded-2xl bg-muted/40 py-6 text-center text-muted-foreground">
            No boats are checked out right now.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {(boatsOut.data ?? []).map((b) => {
              const end = new Date(`${b.outingDate}T${b.endTime}:00`);
              const isOverdue = end < now;
              const minutesLate = Math.max(0, Math.round((now.getTime() - end.getTime()) / 60000));
              return (
                <li
                  key={b.id}
                  className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${
                    isOverdue ? "border-red-300 bg-red-50" : "bg-muted/30"
                  }`}
                >
                  {b.checkOutPhoto && (
                    <img
                      src={b.checkOutPhoto}
                      alt="Boat at check-out"
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {b.boatName} <span className="text-muted-foreground">({b.boatClass})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {b.userName ?? b.userEmail} · {b.outingDate} {b.startTime}–{b.endTime} ·{" "}
                      {b.direction}
                    </p>
                    {isOverdue && (
                      <p className="text-sm font-bold text-destructive">
                        Overdue by {minutesLate >= 60 ? `${Math.floor(minutesLate / 60)}h ${minutesLate % 60}m` : `${minutesLate} min`}
                      </p>
                    )}
                  </div>
                  {isOverdue && (
                    <a
                      href={whatsappLink(
                        b.userPhone,
                        `Hi ${b.userName ?? ""}, this is Tees RC. ${b.boatName} was due back at ${b.endTime} — is everything OK? Please check the boat back in on the website when you're ashore.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp {b.userPhone ? "member" : "alert"}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Automatic WhatsApp sending needs a WhatsApp Business API account (e.g.
          Twilio) — until then, the button opens WhatsApp with a pre-written
          message. Members without a phone number on their profile get a generic
          draft.
        </p>
      </section>

      {/* Pending booking requests */}
      <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Ship className="h-5 w-5 text-primary" /> Booking requests
          {(pending.data?.length ?? 0) > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
              {pending.data!.length}
            </span>
          )}
        </h2>
        {pending.isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading…</p>
        ) : (pending.data ?? []).length === 0 ? (
          <p className="mt-4 rounded-2xl bg-muted/40 py-6 text-center text-muted-foreground">
            No pending requests right now.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {(pending.data ?? []).map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {b.boatName} <span className="text-muted-foreground">({b.boatClass})</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {b.userName ?? b.userEmail} · {b.outingDate} {b.startTime}–{b.endTime} ·{" "}
                    {b.sessionType} · {b.direction} · signed out by {b.signedOutBy}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() => approve.mutate({ id: b.id })}
                >
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() => reject.mutate({ id: b.id })}
                >
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* All members */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Users className="h-5 w-5 text-primary" /> Registered members
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {members.data?.length ?? 0}
          </span>
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Coaches, captains and admins book instantly; other members' bookings
          arrive as requests above. Set someone's position to "Coach" on their
          profile to give them instant booking.
        </p>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Joined</th>
                <th className="px-4 py-3 font-bold">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {(members.data ?? []).map((m, i) => (
                <tr key={m.id} className={i % 2 ? "bg-muted/30" : "bg-card"}>
                  <td className="px-4 py-3 font-semibold">{m.name ?? "—"}</td>
                  <td className="px-4 py-3">{m.email}</td>
                  <td className="px-4 py-3 capitalize">{m.role}</td>
                  <td className="px-4 py-3">
                    {new Date(m.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(m.lastSignInAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* All bookings */}
      <section>
        <h2 className="mb-4 text-lg font-bold">All bookings</h2>
        <BookingHistory />
      </section>
    </div>
  );
}
