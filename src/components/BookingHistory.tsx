import { useState } from "react";
import { Download } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadCsv } from "@/lib/csv";

export default function BookingHistory({ showBooker = true }: { showBooker?: boolean }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const history = trpc.club.bookings.history.useQuery({
    from: from || undefined,
    to: to || undefined,
  });

  const rows = history.data ?? [];

  const exportCsv = () => {
    downloadCsv(
      `tees-rc-bookings${from ? `-from-${from}` : ""}${to ? `-to-${to}` : ""}.csv`,
      [
        "Date",
        "Start",
        "End",
        "Boat",
        "Class",
        "Session type",
        "Direction",
        "Signed out by",
        "Led by",
        "Crew",
        "Booked by",
        "Booker email",
        "Status",
        "Notes",
      ],
      rows.map((b) => [
        b.outingDate,
        b.startTime,
        b.endTime,
        b.boatName,
        b.boatClass,
        b.sessionType === "racing" ? "Racing" : "Outing",
        b.direction === "yarm" ? "Yarm" : "Barrage",
        b.signedOutBy,
        b.ledByCoach ? `Coach${b.coachName ? ` (${b.coachName})` : ""}` : "Individual",
        b.crew ?? "",
        b.userName ?? "",
        b.userEmail ?? "",
        b.status,
        b.notes ?? "",
      ])
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="hist-from" className="text-xs">From</Label>
          <Input
            id="hist-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hist-to" className="text-xs">To</Label>
          <Input
            id="hist-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFrom("");
            setTo("");
          }}
        >
          Clear
        </Button>
        <div className="ml-auto">
          <Button onClick={exportCsv} disabled={rows.length === 0} className="rounded-full">
            <Download className="mr-1 h-4 w-4" /> Download CSV
          </Button>
        </div>
      </div>

      {history.isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Loading history…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border bg-muted/40 py-8 text-center text-muted-foreground">
          No bookings found for this period.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold">Time</th>
                <th className="px-4 py-3 font-bold">Boat</th>
                <th className="px-4 py-3 font-bold">Session</th>
                <th className="px-4 py-3 font-bold">Direction</th>
                <th className="px-4 py-3 font-bold">Signed out by</th>
                {showBooker && <th className="px-4 py-3 font-bold">Booked by</th>}
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b, i) => (
                <tr key={b.id} className={i % 2 ? "bg-muted/30" : "bg-card"}>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{b.outingDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.startTime}–{b.endTime}
                  </td>
                  <td className="px-4 py-3">
                    {b.boatName} <span className="text-muted-foreground">({b.boatClass})</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{b.sessionType}</td>
                  <td className="px-4 py-3 capitalize">{b.direction}</td>
                  <td className="px-4 py-3">
                    {b.signedOutBy}
                    {b.ledByCoach && (
                      <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        coach
                      </span>
                    )}
                  </td>
                  {showBooker && <td className="px-4 py-3">{b.userName ?? b.userEmail}</td>}
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "out"
                            ? "bg-sky-100 text-sky-700"
                            : b.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : b.status === "returned"
                                ? "bg-violet-100 text-violet-700"
                                : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {rows.length} booking{rows.length === 1 ? "" : "s"} · the CSV opens in Excel, Google Sheets or Numbers.
      </p>
    </div>
  );
}
