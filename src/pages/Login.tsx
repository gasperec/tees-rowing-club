import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Ship } from "lucide-react";

const googleErrors: Record<string, string> = {
  "google-not-configured": "Google sign-in isn't set up on this site yet — please use email.",
  "google-cancelled": "Google sign-in was cancelled.",
  "google-failed": "Google sign-in failed. Please try again or use email.",
};

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const utils = trpc.useUtils();

  const urlError = params.get("error");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const resp = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          mode === "register" ? { name, email, password } : { email, password },
        ),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Something went wrong");
      await utils.invalidate();
      if (mode === "register") {
        setRegistered(true);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Ship className="mx-auto mb-2 h-10 w-10 text-primary" />
            <CardTitle>Account created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You're signed in. A club admin will review your membership
              shortly — once approved you'll be able to request boat bookings
              and appear on the member roster.
            </p>
            <Button className="w-full" onClick={() => navigate("/profile")}>
              Set up your member profile
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
              Back to homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Ship className="mx-auto mb-2 h-10 w-10 text-primary" />
          <CardTitle className="text-2xl">
            {mode === "login" ? "Member sign in" : "Create your account"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tees Rowing Club — members area
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => (window.location.href = "/api/auth/google")}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2 3.7-5 3.7-8.6z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.9-2.9z"
              />
              <path
                fill="#EA4335"
                d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-2.9 3.6-5 6.8-5z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rowbotham"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                minLength={mode === "register" ? 8 : undefined}
                required
              />
            </div>

            {(error || (urlError && googleErrors[urlError])) && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error ?? googleErrors[urlError!]}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New to the club site?{" "}
                <button
                  type="button"
                  className="font-semibold text-primary underline"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-primary underline"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="underline">
              Back to homepage
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
