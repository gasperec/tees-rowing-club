import { useMemo, useRef, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";
import { CalendarPlus, Camera, CameraOff, Hourglass, Ship, XCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import MemberShell from "@/components/MemberShell";
import BookingHistory from "@/components/BookingHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LOGIN_PATH } from "@/const";

export default function Booking() {
  const { user, isAuthenticated, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <MemberShell title="Boat booking">
      <ApprovedBooking userName={user.name ?? ""} />
    </MemberShell>
  );
}

function ApprovedBooking({ userName }: { userName: string }) {
  const utils = trpc.useUtils();
  const boats = trpc.club.boats.list.useQuery();
  const mine = trpc.club.bookings.mine.useQuery();

  const [boatId, setBoatId] = useState<number | "">("");
  const [outingDate, setOutingDate] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("09:00");
  const [sessionType, setSessionType] = useState<"outing" | "racing">("outing");
  const [direction, setDirection] = useState<"yarm" | "barrage">("barrage");
  const [signedOutBy, setSignedOutBy] = useState(userName);
  const [ledByCoach, setLedByCoach] = useState(false);
  const [coachName, setCoachName] = useState("");
  const [crew, setCrew] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<false | "confirmed" | "pending">(false);

  const create = trpc.club.bookings.create.useMutation({
    onSuccess: async (data) => {
      setSuccess(data.status === "pending" ? "pending" : "confirmed");
      setFormError(null);
      setNotes("");
      setCrew("");
      await utils.club.bookings.mine.invalidate();
      await utils.club.bookings.history.invalidate();
      setTimeout(() => setSuccess(false), 6000);
    },
    onError: (e) => {
      setFormError(e.message);
      setSuccess(false);
    },
  });

  const cancel = trpc.club.bookings.cancel.useMutation({
    onSuccess: async () => {
      await utils.club.bookings.mine.invalidate();
      await utils.club.bookings.history.invalidate();
    },
  });

  const activeMine = useMemo(
    () =>
      (mine.data ?? []).filter(
        (b) =>
          (b.status === "confirmed" || b.status === "pending" || b.status === "out") &&
          b.outingDate >= new Date().toISOString().slice(0, 10)
      ),
    [mine.data]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (boatId === "") return;
    create.mutate({
      boatId,
      outingDate,
      startTime,
      endTime,
      sessionType,
      direction,
      signedOutBy,
      ledByCoach,
      coachName: ledByCoach ? coachName || undefined : undefined,
      crew: crew || undefined,
      notes: notes || undefined,
    });
  };

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-10">
      {/* New booking */}
      <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <CalendarPlus className="h-5 w-5 text-primary" /> New booking
        </h2>
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="boat">Boat</Label>
            <select
              id="boat"
              required
              value={boatId}
              onChange={(e) => setBoatId(Number(e.target.value))}
              className={selectClass}
            >
              <option value="" disabled>
                Choose a boat…
              </option>
              {(boats.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.boatClass} ({b.seats} seat{b.seats > 1 ? "s" : ""}
                  {b.coxed ? ", coxed" : ""})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={outingDate}
              onChange={(e) => setOutingDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start">From</Label>
              <Input
                id="start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">To</Label>
              <Input
                id="end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stype">Session type</Label>
            <select
              id="stype"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as "outing" | "racing")}
              className={selectClass}
            >
              <option value="outing">Outing</option>
              <option value="racing">Racing</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="direction">Direction</Label>
            <select
              id="direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as "yarm" | "barrage")}
              className={selectClass}
            >
              <option value="barrage">Barrage</option>
              <option value="yarm">Yarm</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="signed">Who's signing the boat out</Label>
            <Input
              id="signed"
              required
              value={signedOutBy}
              onChange={(e) => setSignedOutBy(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ledby">Taken out by</Label>
            <select
              id="ledby"
              value={ledByCoach ? "coach" : "individual"}
              onChange={(e) => setLedByCoach(e.target.value === "coach")}
              className={selectClass}
            >
              <option value="individual">Individual</option>
              <option value="coach">Coach</option>
            </select>
          </div>
          {ledByCoach && (
            <div className="space-y-1.5">
              <Label htmlFor="coach">Coach name</Label>
              <Input
                id="coach"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Coach's name"
              />
            </div>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="crew">Crew (optional)</Label>
            <Input
              id="crew"
              value={crew}
              onChange={(e) => setCrew(e.target.value)}
              placeholder="Names of everyone in the boat"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the next crew should know…"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit" size="lg" className="rounded-full" disabled={create.isPending}>
              {create.isPending ? "Booking…" : "Book this boat"}
            </Button>
            {formError && (
              <p className="mt-2 text-sm font-semibold text-destructive">{formError}</p>
            )}
            {success === "confirmed" && (
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                Booked! It now appears in your upcoming bookings below.
              </p>
            )}
            {success === "pending" && (
              <p className="mt-2 text-sm font-semibold text-amber-600">
                Request sent! A coach or admin will approve it shortly — you'll
                see it as "pending" in your bookings below.
              </p>
            )}
          </div>
        </form>
      </section>

      {/* My upcoming bookings */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Ship className="h-5 w-5 text-primary" /> My upcoming bookings
        </h2>
        {activeMine.length === 0 ? (
          <p className="rounded-2xl border bg-muted/40 py-8 text-center text-muted-foreground">
            You have no upcoming bookings.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeMine.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={() => cancel.mutate({ id: b.id })} />
            ))}
          </div>
        )}
      </section>

      {/* Club-wide history + CSV */}
      <section>
        <h2 className="mb-4 text-lg font-bold">Club booking history</h2>
        <BookingHistory />
      </section>
    </div>
  );
}

type BookingRow = inferRouterOutputs<AppRouter>["club"]["bookings"]["mine"][number];

function BookingCard({
  booking: b,
  onCancel,
}: {
  booking: BookingRow;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File, kind: "out" | "in") => {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bookingId", String(b.id));
      const resp = await fetch(`/api/upload/check-${kind}`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Upload failed");
      await utils.club.bookings.mine.invalidate();
      await utils.club.bookings.history.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const statusBadge =
    b.status === "pending" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        <Hourglass className="h-3 w-3" /> awaiting approval
      </span>
    ) : b.status === "out" ? (
      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
        on the water
      </span>
    ) : (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
        confirmed
      </span>
    );

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold">{b.boatName}</h3>
          <p className="text-sm text-muted-foreground">{b.boatClass}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          {b.status !== "out" && (
            <button
              onClick={onCancel}
              className="text-muted-foreground transition-colors hover:text-destructive"
              title="Cancel booking"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Date</dt>
          <dd className="font-semibold">{b.outingDate}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Time</dt>
          <dd className="font-semibold">
            {b.startTime}–{b.endTime}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Session</dt>
          <dd className="font-semibold capitalize">{b.sessionType}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Direction</dt>
          <dd className="font-semibold capitalize">{b.direction}</dd>
        </div>
      </dl>

      {/* Photo check-out / check-in */}
      {b.status === "confirmed" && (
        <div className="mt-4 rounded-2xl bg-secondary/50 p-3">
          <p className="mb-2 text-xs font-semibold text-secondary-foreground">
            At the boathouse? Snap a photo of the boat to check it out.
          </p>
          <Button
            size="sm"
            className="w-full rounded-full"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="mr-1 h-4 w-4" />
            {uploading ? "Uploading…" : "Check out — take boat photo"}
          </Button>
        </div>
      )}
      {b.status === "out" && (
        <div className="mt-4 space-y-2">
          <div className="rounded-2xl bg-sky-50 p-3 text-xs font-semibold text-sky-800">
            Boat signed out
            {b.checkOutAt &&
              ` at ${new Date(b.checkOutAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
            . Please return by <span className="font-bold">{b.endTime}</span> and
            snap a photo to check back in.
          </div>
          <Button
            size="sm"
            className="w-full rounded-full"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <CameraOff className="mr-1 h-4 w-4" />
            {uploading ? "Uploading…" : "Check in — boat returned photo"}
          </Button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadPhoto(f, b.status === "out" ? "in" : "out");
          e.target.value = "";
        }}
      />
      {error && <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}
