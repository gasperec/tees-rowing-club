import { useEffect, useRef, useState } from "react";
import { Camera, Save, UserRound } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import MemberShell from "@/components/MemberShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LOGIN_PATH } from "@/const";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function Profile() {
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
    <MemberShell title="My profile">
      <ProfileForm />
    </MemberShell>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const mine = trpc.profile.mine.useQuery();

  const [yearsRowing, setYearsRowing] = useState("");
  const [joinedClubYear, setJoinedClubYear] = useState("");
  const [clubPosition, setClubPosition] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [squad, setSquad] = useState("");
  const [side, setSide] = useState("");
  const [preferredSeat, setPreferredSeat] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [awards, setAwards] = useState("");
  const [bio, setBio] = useState("");
  const [canCox, setCanCox] = useState(false);
  const [erg2k, setErg2k] = useState("");
  const [erg5k, setErg5k] = useState("");
  const [brNumber, setBrNumber] = useState("");
  const [availability, setAvailability] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (mine.data && !loaded.current) {
      loaded.current = true;
      setYearsRowing(mine.data.yearsRowing?.toString() ?? "");
      setJoinedClubYear(mine.data.joinedClubYear?.toString() ?? "");
      setClubPosition(mine.data.clubPosition ?? "");
      setExperienceLevel(mine.data.experienceLevel ?? "");
      setSquad(mine.data.squad ?? "");
      setSide(mine.data.side ?? "");
      setPreferredSeat(mine.data.preferredSeat ?? "");
      setHeightCm(mine.data.heightCm?.toString() ?? "");
      setWeightKg(mine.data.weightKg?.toString() ?? "");
      setAwards(mine.data.awards ?? "");
      setBio(mine.data.bio ?? "");
      setCanCox(mine.data.canCox ?? false);
      setErg2k(mine.data.erg2k ?? "");
      setErg5k(mine.data.erg5k ?? "");
      setBrNumber(mine.data.britishRowingNumber ?? "");
      setAvailability(mine.data.availability ?? "");
      setPhone(mine.data.phone ?? "");
      setEmergencyName(mine.data.emergencyContactName ?? "");
      setEmergencyPhone(mine.data.emergencyContactPhone ?? "");
      setAvatarPreview(mine.data.avatarPath ?? null);
    }
  }, [mine.data]);

  const save = trpc.profile.save.useMutation({
    onSuccess: async () => {
      setSaved(true);
      await utils.profile.mine.invalidate();
      await utils.profile.roster.invalidate();
      setTimeout(() => setSaved(false), 4000);
    },
  });

  const currentAvatar = avatarPreview ?? user?.avatar ?? null;

  const uploadAvatar = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const resp = await fetch("/api/upload/avatar", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Upload failed");
      setAvatarPreview(data.avatarPath);
      await utils.profile.mine.invalidate();
      await utils.profile.roster.invalidate();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const num = (s: string) => (s === "" ? null : Number(s));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate({
      yearsRowing: num(yearsRowing),
      joinedClubYear: num(joinedClubYear),
      clubPosition: clubPosition || null,
      experienceLevel: experienceLevel
        ? (experienceLevel as "beginner" | "improver" | "intermediate" | "experienced")
        : null,
      squad: squad || null,
      side: side ? (side as "bow" | "stroke" | "either" | "scull") : null,
      preferredSeat: preferredSeat || null,
      heightCm: num(heightCm),
      weightKg: num(weightKg),
      awards: awards || null,
      bio: bio || null,
      canCox,
      erg2k: erg2k || null,
      erg5k: erg5k || null,
      britishRowingNumber: brNumber || null,
      availability: availability || null,
      phone: phone || null,
      emergencyContactName: emergencyName || null,
      emergencyContactPhone: emergencyPhone || null,
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Photo card */}
      <div className="rounded-3xl border bg-card p-6 text-center shadow-sm">
        <div className="relative mx-auto h-40 w-40">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Profile photo"
              className="h-40 w-40 rounded-full border-4 border-secondary object-cover"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-secondary bg-muted">
              <UserRound className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
            title="Upload photo"
          >
            <Camera className="h-5 w-5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadAvatar(f);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-4 font-bold">{user?.name ?? "Rower"}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {uploading ? "Uploading…" : "JPG, PNG or WebP, up to 5 MB."}
        </p>
        {uploadError && (
          <p className="mt-2 text-sm font-semibold text-destructive">{uploadError}</p>
        )}
      </div>

      {/* Details form */}
      <form
        onSubmit={submit}
        className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 lg:col-span-2"
      >
        <h2 className="text-lg font-bold">Rowing details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="years">Years of rowing</Label>
            <Input
              id="years"
              type="number"
              min={0}
              max={80}
              value={yearsRowing}
              onChange={(e) => setYearsRowing(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="joined">Joined the club in</Label>
            <Input
              id="joined"
              type="number"
              min={1864}
              max={2100}
              value={joinedClubYear}
              onChange={(e) => setJoinedClubYear(e.target.value)}
              placeholder="e.g. 2019"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position">Current position in the club</Label>
            <Input
              id="position"
              value={clubPosition}
              onChange={(e) => setClubPosition(e.target.value)}
              placeholder="e.g. Rower, Cox, Coach, Captain…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="level">Experience level</Label>
            <select
              id="level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className={selectClass}
            >
              <option value="">Choose…</option>
              <option value="beginner">Beginner (first year)</option>
              <option value="improver">Improver (1–2 years)</option>
              <option value="intermediate">Intermediate (3–5 years)</option>
              <option value="experienced">Experienced (5+ years)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="squad">Squad</Label>
            <select
              id="squad"
              value={squad}
              onChange={(e) => setSquad(e.target.value)}
              className={selectClass}
            >
              <option value="">Choose…</option>
              <option>Juniors</option>
              <option>Men's</option>
              <option>Women's</option>
              <option>Recreational</option>
              <option>Adaptive</option>
              <option>Cox / Coach</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="side">Scull or sweep</Label>
            <select
              id="side"
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className={selectClass}
            >
              <option value="">Choose…</option>
              <option value="scull">Sculler</option>
              <option value="bow">Sweep — bow side</option>
              <option value="stroke">Sweep — stroke side</option>
              <option value="either">Either side</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seat">Preferred seat</Label>
            <Input
              id="seat"
              value={preferredSeat}
              onChange={(e) => setPreferredSeat(e.target.value)}
              placeholder="e.g. stroke, bow, 3-seat"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 px-4 py-3">
            <input
              id="cox"
              type="checkbox"
              checked={canCox}
              onChange={(e) => setCanCox(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <Label htmlFor="cox" className="cursor-pointer">
              I can cox crews
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="erg2k">ERG PB — 2k</Label>
              <Input
                id="erg2k"
                value={erg2k}
                onChange={(e) => setErg2k(e.target.value)}
                placeholder="e.g. 6:58.2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="erg5k">ERG PB — 5k</Label>
              <Input
                id="erg5k"
                value={erg5k}
                onChange={(e) => setErg5k(e.target.value)}
                placeholder="e.g. 18:40.0"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="br">British Rowing number</Label>
            <Input
              id="br"
              value={brNumber}
              onChange={(e) => setBrNumber(e.target.value)}
              placeholder="Used for race entries"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avail">When I usually row</Label>
            <Input
              id="avail"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. weekday evenings & Sunday mornings"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                min={100}
                max={230}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={30}
                max={200}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="awards">Competitions won / awards</Label>
            <Textarea
              id="awards"
              rows={3}
              value={awards}
              onChange={(e) => setAwards(e.target.value)}
              placeholder="e.g. Tees Regatta W.MasC.2x 2024; Durham City Regatta Nov.4x 2023…"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">About me</Label>
            <Textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Anything else — when you usually row, what you're training towards…"
            />
          </div>
        </div>

        <div className="mt-6 space-y-1.5">
          <Label htmlFor="phone">Your mobile number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 07700 900000"
          />
          <p className="text-xs text-muted-foreground">
            Used by club admins to contact you about boat bookings (e.g. WhatsApp
            if a boat is overdue). Never shown on the member roster.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-bold text-amber-900">
            Emergency contact
          </h3>
          <p className="mb-3 text-xs text-amber-800">
            Only visible to you and club admins — never shown on the member roster.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ecname">Contact name</Label>
              <Input
                id="ecname"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. partner, parent…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ecphone">Contact phone</Label>
              <Input
                id="ecphone"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="e.g. 07700 900000"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <Button type="submit" size="lg" className="rounded-full" disabled={save.isPending}>
            <Save className="mr-1 h-4 w-4" />
            {save.isPending ? "Saving…" : "Save profile"}
          </Button>
          {saved && (
            <p className="text-sm font-semibold text-emerald-600">
              Saved! Your profile is visible to other signed-in members.
            </p>
          )}
          {save.error && (
            <p className="text-sm font-semibold text-destructive">{save.error.message}</p>
          )}
        </div>
      </form>
    </div>
  );
}
