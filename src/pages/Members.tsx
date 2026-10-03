import { UserRound, Trophy, Ruler, Timer, CalendarClock } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import MemberShell from "@/components/MemberShell";
import { LOGIN_PATH } from "@/const";

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  improver: "Improver",
  intermediate: "Intermediate",
  experienced: "Experienced",
};

const sideLabels: Record<string, string> = {
  bow: "Bow side",
  stroke: "Stroke side",
  either: "Either side",
  scull: "Sculler",
};

export default function Members() {
  const { isAuthenticated, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <MemberShell title="Club members">
      <Roster />
    </MemberShell>
  );
}

function Roster() {
  const roster = trpc.profile.roster.useQuery();
  const members = roster.data ?? [];

  if (roster.isLoading) {
    return <p className="py-8 text-center text-muted-foreground">Loading members…</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => {
        const photo = m.avatarPath ?? m.loginAvatar;
        const hasProfile =
          m.yearsRowing != null || m.joinedClubYear != null || m.clubPosition ||
          m.experienceLevel || m.squad || m.side || m.awards || m.bio ||
          m.canCox || m.erg2k || m.erg5k || m.availability;
        return (
          <div key={m.userId} className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {photo ? (
                <img
                  src={photo}
                  alt={m.name ?? "Member"}
                  className="h-16 w-16 rounded-full border-2 border-secondary object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-secondary bg-muted">
                  <UserRound className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="truncate font-bold">{m.name ?? "Unnamed"}</h3>
                {m.clubPosition && (
                  <p className="truncate text-sm font-semibold text-muted-foreground">
                    {m.clubPosition}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {m.squad && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {m.squad}
                    </span>
                  )}
                  {m.experienceLevel && (
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                      {levelLabels[m.experienceLevel] ?? m.experienceLevel}
                    </span>
                  )}
                  {m.canCox && (
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                      Can cox
                    </span>
                  )}
                </div>
              </div>
            </div>

            {hasProfile ? (
              <dl className="mt-4 space-y-1.5 text-sm">
                {m.yearsRowing != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Rowing for</dt>
                    <dd className="font-semibold">
                      {m.yearsRowing} year{m.yearsRowing === 1 ? "" : "s"}
                    </dd>
                  </div>
                )}
                {m.joinedClubYear != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Club member since</dt>
                    <dd className="font-semibold">{m.joinedClubYear}</dd>
                  </div>
                )}
                {m.side && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Side</dt>
                    <dd className="font-semibold">{sideLabels[m.side] ?? m.side}</dd>
                  </div>
                )}
                {m.preferredSeat && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Preferred seat</dt>
                    <dd className="font-semibold">{m.preferredSeat}</dd>
                  </div>
                )}
                {(m.erg2k || m.erg5k) && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" /> ERG PBs
                    </dt>
                    <dd className="font-semibold">
                      {[m.erg2k && `2k ${m.erg2k}`, m.erg5k && `5k ${m.erg5k}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </dd>
                  </div>
                )}
                {m.availability && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex shrink-0 items-center gap-1 text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" /> Usually rows
                    </dt>
                    <dd className="text-right font-semibold">{m.availability}</dd>
                  </div>
                )}
                {(m.heightCm || m.weightKg) && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Ruler className="h-3.5 w-3.5" /> Build
                    </dt>
                    <dd className="font-semibold">
                      {[m.heightCm && `${m.heightCm} cm`, m.weightKg && `${m.weightKg} kg`]
                        .filter(Boolean)
                        .join(" · ")}
                    </dd>
                  </div>
                )}
                {m.awards && (
                  <div className="pt-2">
                    <dt className="mb-1 flex items-center gap-1 text-muted-foreground">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" /> Wins & awards
                    </dt>
                    <dd className="whitespace-pre-line rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                      {m.awards}
                    </dd>
                  </div>
                )}
                {m.bio && (
                  <p className="whitespace-pre-line pt-2 text-xs leading-relaxed text-muted-foreground">
                    {m.bio}
                  </p>
                )}
              </dl>
            ) : (
              <p className="mt-4 rounded-xl bg-muted/40 py-3 text-center text-xs text-muted-foreground">
                Hasn't filled in a profile yet.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
